# CI/CD: de GitHub Actions a Oracle Cloud

Guía paso a paso para dejar el proyecto con integración continua y despliegue
automático sobre una instancia de Oracle Cloud Infrastructure (OCI).

## Qué hace el pipeline

```text
push a develop / PR                      push a main
        │                                     │
        ▼                                     ▼
   ┌─────────────────┐              ┌──────────────────────┐
   │  CI (ci.yml)    │              │  Deploy (deploy.yml) │
   │                 │              │                      │
   │  Pint           │              │  1. Reutiliza ci.yml │
   │  PHPUnit + pg   │              │  2. Construye e      │
   │  tsc + ESLint   │              │     publica en GHCR  │
   │  Vitest + build │              │  3. SSH a OCI:       │
   │  Playwright     │              │     pull, migrate,   │
   └─────────────────┘              │     up -d            │
                                    │  4. Verifica /up     │
                                    └──────────────────────┘
```

Dos reglas de diseño que conviene tener presentes:

- **El despliegue no duplica la suite.** `deploy.yml` invoca `ci.yml` con
  `workflow_call`, así que a producción solo llega código que pasó exactamente
  los mismos pasos que un PR.
- **El servidor no compila nada.** Recibe dos imágenes ya construidas desde
  GitHub Container Registry (GHCR) y el archivo `compose.prod.yaml`. No necesita
  PHP, Composer, Node ni el código fuente.

## Arquitectura en producción

Tres contenedores definidos en `compose.prod.yaml`:

| Servicio | Imagen | Rol |
| --- | --- | --- |
| `web` | `…/web:<tag>` (Caddy) | TLS automático, sirve `public/` y pasa PHP por FastCGI |
| `app` | `…/app:<tag>` (php-fpm) | Ejecuta Laravel |
| `db` | `postgres:16-alpine` | Base de datos, sin puertos publicados |

Las imágenes `web` y `app` salen del **mismo** `docker/php/Dockerfile.prod`
(objetivos `--target web` y `--target app`) y se despliegan siempre con la misma
etiqueta: Caddy resuelve las rutas de los assets contra su copia de `public/` y
le pasa a php-fpm el `index.php` que encontró ahí. Si las etiquetas se desfasan,
se sirve HTML nuevo contra PHP viejo y el fallo es silencioso.

---

# Parte 1 — Preparar la instancia de Oracle Cloud

## Paso 1. Crear la instancia

En la consola de OCI: **Compute → Instances → Create instance**.

| Campo | Valor |
| --- | --- |
| Image | Canonical Ubuntu 24.04 |
| Shape | `VM.Standard.E2.1.Micro` (Always Free) o superior |
| Add SSH keys | Pegar la clave pública con la que administrarás el servidor |

Anota la **IP pública** al terminar. Conéctate para comprobar el acceso:

```bash
ssh ubuntu@<IP_PUBLICA>
```

> **Sobre `E2.1.Micro`:** tiene 1 GB de RAM. Alcanza porque el servidor no
> compila (las imágenes llegan hechas), pero PostgreSQL y php-fpm juntos dejan
> poco margen. Conviene añadir swap antes de seguir:
>
> ```bash
> sudo fallocate -l 2G /swapfile
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

## Paso 2. Abrir los puertos 80 y 443

Son dos capas distintas y la primera es obligatoria.

**a) Security List de la VCN** (sin esto no llega nada). En **Networking → Virtual
Cloud Networks → tu VCN → Security Lists → Default Security List → Add Ingress
Rules**, agrega:

| Source CIDR | Protocolo | Puerto destino |
| --- | --- | --- |
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |
| `0.0.0.0/0` | UDP | 443 (opcional, HTTP/3) |

**b) Firewall local.** Las imágenes Ubuntu de Oracle traen una cadena `INPUT`
restrictiva. En la práctica **no bloquea los puertos publicados por Docker**,
porque esos paquetes se redirigen (DNAT) y atraviesan la cadena `FORWARD`, donde
Docker inserta sus propias reglas. Solo si el sitio no responde tras el primer
despliegue, y ya verificaste la Security List, agrega las reglas explícitas:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## Paso 3. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
docker --version && docker compose version
```

Se necesita Compose v2.17 o superior (`up --wait`, que usa el script de
despliegue para esperar a que los healthchecks pasen).

## Paso 4. Crear el usuario de despliegue

Un usuario dedicado, sin sudo, solo con acceso a Docker: si la clave de CI se
filtra, el alcance queda acotado.

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh && sudo chmod 700 /home/deploy/.ssh
```

En **tu máquina**, genera el par de claves que usará GitHub Actions:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/bdp-deploy -C "github-actions@bdp" -N ""
cat ~/.ssh/bdp-deploy.pub
```

Instala la pública en el servidor:

```bash
# en la instancia, como root/ubuntu
echo "<contenido de bdp-deploy.pub>" | sudo tee -a /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Comprueba que entra sin contraseña:

```bash
ssh -i ~/.ssh/bdp-deploy deploy@<IP_PUBLICA> docker ps
```

## Paso 5. Preparar el directorio de despliegue

```bash
sudo mkdir -p /opt/bdp-user-management
sudo chown deploy:deploy /opt/bdp-user-management
```

Copia la plantilla `.env.production.example` del repositorio a
`/opt/bdp-user-management/.env` y complétala. Los dos valores que hay que
generar:

```bash
# APP_KEY
echo "base64:$(openssl rand -base64 32)"

# DB_PASSWORD
openssl rand -base64 24
```

Ajusta también `APP_DOMAIN`, `ACME_EMAIL`, `APP_URL` e `IMAGE_REPOSITORY`
(`ghcr.io/<owner>/<repo>` en minúsculas). Deja el archivo cerrado:

```bash
chmod 600 /opt/bdp-user-management/.env
```

> `compose.prod.yaml` **no** se copia a mano: el workflow lo sube en cada
> despliegue, de modo que el stack del servidor siempre coincide con lo
> versionado en el repositorio.

## Paso 6. Apuntar el DNS

Crea un registro `A` del dominio de `APP_DOMAIN` hacia la IP pública de la
instancia. Verifica antes de desplegar:

```bash
dig +short usuarios.ejemplo.cl
```

Debe devolver la IP de la instancia. Caddy pide el certificado a Let's Encrypt
durante el primer arranque y necesita que el dominio ya resuelva; si aún no
propaga, el certificado falla y se consume cuota del rate limit de ACME.

---

# Parte 2 — Configurar GitHub

## Paso 7. Secrets y variables del repositorio

En **Settings → Secrets and variables → Actions**.

**Secrets** (pestaña *Secrets*):

| Nombre | Valor |
| --- | --- |
| `DEPLOY_HOST` | IP pública de la instancia |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | Contenido completo de `~/.ssh/bdp-deploy` (la clave **privada**) |
| `DEPLOY_SSH_KNOWN_HOSTS` | Huella del host (ver abajo) |
| `GHCR_READ_TOKEN` | Solo si dejas el paquete privado (ver Paso 8) |

Para `DEPLOY_SSH_KNOWN_HOSTS`:

```bash
ssh-keyscan -H <IP_PUBLICA> 2>/dev/null
```

Contrasta la huella con la que reporta la propia instancia antes de confiar en
ella (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`). Fijar el `known_hosts`
en lugar de usar `StrictHostKeyChecking=no` evita que el despliegue entregue la
clave privada a cualquier servidor que responda en esa IP.

**Variables** (pestaña *Variables*):

| Nombre | Valor |
| --- | --- |
| `APP_DOMAIN` | `usuarios.ejemplo.cl` |
| `DEPLOY_PATH` | `/opt/bdp-user-management` |
| `DEPLOY_SSH_PORT` | Opcional; por defecto `22` |

## Paso 8. Visibilidad del paquete en GHCR

El workflow publica con el `GITHUB_TOKEN`, que ya tiene permiso de escritura. El
único punto a decidir es cómo **lee** el servidor:

- **Paquete público** (más simple): tras el primer despliegue, en
  `github.com/users/<owner>/packages`, abre cada paquete (`app` y `web`) →
  *Package settings* → *Change visibility* → **Public**. No hace falta
  `GHCR_READ_TOKEN`.
- **Paquete privado**: crea un PAT clásico con el scope `read:packages` y
  guárdalo como secret `GHCR_READ_TOKEN`. El script hace `docker login` con él.

## Paso 9. Compuerta de aprobación (opcional)

En **Settings → Environments → New environment → `production`**, activa
*Required reviewers*. El job `deploy` queda en pausa hasta que alguien apruebe.

---

# Parte 3 — Desplegar y operar

## Paso 10. Primer despliegue

```bash
git checkout main
git merge develop
git push origin main
```

En la pestaña **Actions** verás `Deploy`: primero la suite completa, luego la
publicación de imágenes y por último el despliegue. El paso final consulta
`https://<APP_DOMAIN>/up` desde el runner, así que el workflow solo termina en
verde si el sitio responde de verdad.

La base parte vacía. Si quieres los datos de demostración:

```bash
ssh deploy@<IP> 'cd /opt/bdp-user-management && \
  docker compose -f compose.prod.yaml run --rm app php artisan db:seed --force'
```

## Operación diaria

Todos los comandos se ejecutan desde `/opt/bdp-user-management`.

```bash
# Estado y logs
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs -f app web

# Consola de Laravel
docker compose -f compose.prod.yaml run --rm app php artisan tinker

# Reinicio limpio
docker compose -f compose.prod.yaml restart app web
```

## Rollback

Desde **Actions → Deploy → Run workflow**, escribe en `image_tag` el SHA de un
commit ya desplegado. El workflow salta la construcción y despliega esa etiqueta
tal cual. Las imágenes se conservan dos semanas en el servidor
(`docker image prune --filter until=336h`), así que el rollback no depende de
volver a descargar desde GHCR.

Si el despliegue falla a mitad de camino, `deploy/remote-deploy.sh` restaura la
etiqueta anterior por sí solo. **Ojo:** eso revierte las imágenes, no las
migraciones ya aplicadas. Por eso las migraciones deben ser compatibles hacia
atrás — añadir columnas antes de dejar de usarlas, nunca eliminar en el mismo
despliegue que introduce el código que deja de leerlas.

## Respaldos de la base de datos

El volumen `postgres_data` sobrevive a los despliegues, pero no a que se pierda
la instancia. Un respaldo diario:

```bash
sudo tee /etc/cron.daily/bdp-backup > /dev/null <<'CRON'
#!/bin/sh
cd /opt/bdp-user-management || exit 0
mkdir -p /var/backups/bdp
docker compose -f compose.prod.yaml exec -T db \
    pg_dump -U usuarios usuarios | gzip > "/var/backups/bdp/$(date +%F).sql.gz"
find /var/backups/bdp -name '*.sql.gz' -mtime +14 -delete
CRON
sudo chmod +x /etc/cron.daily/bdp-backup
```

El volumen `caddy_data` guarda los certificados: si se borra, Caddy los reemite
y puede topar con el rate limit de Let's Encrypt. No lo incluyas en un
`docker compose down --volumes`.

---

# Solución de problemas

| Síntoma | Causa habitual | Qué revisar |
| --- | --- | --- |
| El workflow falla en `Verificar el sitio publicado` | DNS sin propagar o Security List sin la regla de ingreso | `dig +short <dominio>`; reglas de la VCN (Paso 2) |
| `502 Bad Gateway` | `app` no arrancó | `docker compose -f compose.prod.yaml logs app` |
| Caddy no obtiene certificado | El dominio no apunta a la instancia, o el 80 está cerrado | Logs de `web`; ACME valida por HTTP en el puerto 80 |
| `denied` al hacer `pull` en el servidor | Paquete privado sin `GHCR_READ_TOKEN` | Paso 8 |
| `Permission denied (publickey)` | Clave incompleta en el secret | `DEPLOY_SSH_KEY` debe incluir las líneas `BEGIN`/`END` |
| El sitio carga sin estilos | Etiquetas distintas en `app` y `web` | `docker compose -f compose.prod.yaml ps` — la misma etiqueta en ambos |
| PHPUnit falla en CI y no en local | La base del servicio no está lista | El job publica `db-test` en `/etc/hosts` y espera el healthcheck |

Para inspeccionar lo mismo que ve el healthcheck, sin pasar por TLS ni DNS:

```bash
docker compose -f compose.prod.yaml exec web wget -q -O- http://127.0.0.1:2020/up
```
