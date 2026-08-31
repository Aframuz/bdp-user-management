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

La instancia ya sirve otros sitios con Apache, así que **Apache conserva los
puertos 80 y 443** y hace de proxy inverso hacia el stack:

```text
Internet :443
   └─ Apache (host, certificado de certbot)
        ├─ books.aframuz.dev     → /var/www/…
        └─ usuarios.aframuz.dev  → proxy → 127.0.0.1:8080
                                              └─ Caddy → php-fpm → PostgreSQL
```

Tres contenedores definidos en `compose.prod.yaml`:

| Servicio | Imagen | Rol |
| --- | --- | --- |
| `web` | `…/web:<tag>` (Caddy) | Sirve `public/` por HTTP en 127.0.0.1 y pasa PHP por FastCGI |
| `app` | `…/app:<tag>` (php-fpm) | Ejecuta Laravel |
| `db` | `postgres:16-alpine` | Base de datos, sin puertos publicados |

El TLS es cosa de Apache: Caddy sirve HTTP plano y su puerto se publica atado a
`127.0.0.1`, nunca a `0.0.0.0`, para que no haya forma de llegar al sitio
saltándose el proxy.

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

Si la instancia ya sirve otros sitios con Apache, esto ya está hecho: sáltalo y
comprueba solo que ambos puertos responden desde fuera. Los abre y los atiende
Apache, no el stack.

Son dos capas distintas y la primera es obligatoria.

**a) Security List de la VCN** (sin esto no llega nada). En **Networking → Virtual
Cloud Networks → tu VCN → Security Lists → Default Security List → Add Ingress
Rules**, agrega:

| Source CIDR | Protocolo | Puerto destino |
| --- | --- | --- |
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |

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

Ajusta también `APP_URL` (debe coincidir con el dominio del vhost) e
`IMAGE_REPOSITORY`
(`ghcr.io/<owner>/<repo>` en minúsculas). Deja el archivo cerrado y **en manos
del usuario `deploy`**:

```bash
sudo chown deploy:deploy /opt/bdp-user-management/.env
sudo chmod 600 /opt/bdp-user-management/.env
```

El `chown` no es opcional: si editaste el archivo con `sudo` queda como
`root:root`, y el despliegue falla al leerlo porque `deploy` no tiene sudo. El
script guarda ahí la etiqueta desplegada (`IMAGE_TAG`), así que necesita
escritura, no solo lectura.

> `compose.prod.yaml` **no** se copia a mano: el workflow lo sube en cada
> despliegue, de modo que el stack del servidor siempre coincide con lo
> versionado en el repositorio.

## Paso 6. Apuntar el DNS

Crea un registro `A` del dominio de `APP_DOMAIN` hacia la IP pública de la
instancia. Verifica antes de desplegar:

```bash
dig +short usuarios.ejemplo.cl
```

Debe devolver la IP de la instancia. El certificado lo pide certbot en el Paso 7
y necesita que el dominio ya resuelva; si aún no propaga, la emisión falla y se
consume cuota del rate limit de Let's Encrypt.

---

# Parte 2 — Configurar GitHub

## Paso 7. Publicar el sitio a través de Apache

Apache ya ocupa 80/443 para los demás sitios, así que atiende también este
dominio y reenvía al puerto local del stack. Habilita los módulos necesarios:

```bash
sudo a2enmod proxy proxy_http headers ssl
```

Crea `/etc/apache2/sites-available/usuarios.conf` con el vhost de HTTP; el de
HTTPS lo genera certbot a partir de este:

```apache
<VirtualHost *:80>
    ServerName usuarios.ejemplo.cl

    # Conserva el Host original: sin esto Laravel generaría las URLs con
    # 127.0.0.1 en lugar del dominio público.
    ProxyPreserveHost On

    # `expr` en vez de un valor fijo porque certbot copia este bloque al vhost
    # 443 que crea: así la cabecera sale `http` en el 80 y `https` en el 443
    # sin tener que editar el archivo generado. Sin ella Laravel emite URLs
    # absolutas http:// que el navegador bloquea como contenido mixto.
    RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}

    ProxyPass        / http://127.0.0.1:8080/
    ProxyPassReverse / http://127.0.0.1:8080/

    ErrorLog  ${APACHE_LOG_DIR}/usuarios-error.log
    CustomLog ${APACHE_LOG_DIR}/usuarios-access.log combined
</VirtualHost>
```

Actívalo y emite el certificado:

```bash
sudo a2ensite usuarios
sudo apache2ctl configtest && sudo systemctl reload apache2

# Genera el vhost 443 y la redirección desde el 80.
sudo certbot --apache -d usuarios.ejemplo.cl
```

Hasta que el stack esté arriba el sitio responde `502`: es lo esperado, el
certificado se emite igual porque lo valida Apache por el puerto 80.

> La cadena completa depende de tres piezas que deben coincidir: Apache manda
> `X-Forwarded-Proto: https`, Caddy la conserva porque su Caddyfile declara
> `trusted_proxies static private_ranges`, y Laravel la cree porque
> `bootstrap/app.php` llama a `trustProxies`. Si falta cualquiera de las tres, el
> sitio responde 200 pero se ve sin estilos.

## Paso 8. Secrets y variables del repositorio

En **Settings → Secrets and variables → Actions**.

**Secrets** (pestaña *Secrets*):

| Nombre | Valor |
| --- | --- |
| `DEPLOY_HOST` | IP pública de la instancia |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | Contenido completo de `~/.ssh/bdp-deploy` (la clave **privada**) |
| `DEPLOY_SSH_KNOWN_HOSTS` | Huella del host (ver abajo) |
| `GHCR_READ_TOKEN` | Solo si dejas el paquete privado (ver Paso 9) |

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

## Paso 9. Visibilidad del paquete en GHCR

El workflow publica con el `GITHUB_TOKEN`, que ya tiene permiso de escritura. El
único punto a decidir es cómo **lee** el servidor:

- **Paquete público** (más simple): tras el primer despliegue, en
  `github.com/users/<owner>/packages`, abre cada paquete (`app` y `web`) →
  *Package settings* → *Change visibility* → **Public**. No hace falta
  `GHCR_READ_TOKEN`.
- **Paquete privado**: crea un PAT clásico con el scope `read:packages` y
  guárdalo como secret `GHCR_READ_TOKEN`. El script hace `docker login` con él.

## Paso 10. Compuerta de aprobación (opcional)

En **Settings → Environments → New environment → `production`**, activa
*Required reviewers*. El job `deploy` queda en pausa hasta que alguien apruebe.

---

# Parte 3 — Desplegar y operar

## Paso 11. Primer despliegue

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

Los certificados los administra certbot en el host (`/etc/letsencrypt`), fuera
de los volúmenes de Docker, así que un `docker compose down --volumes` no los
toca. Respáldalos junto con `/etc/apache2/sites-available/`.

---

# Solución de problemas

| Síntoma | Causa habitual | Qué revisar |
| --- | --- | --- |
| El workflow falla en `Verificar el sitio publicado` | DNS sin propagar o Security List sin la regla de ingreso | `dig +short <dominio>`; reglas de la VCN (Paso 2) |
| `502 Bad Gateway` | `app` no arrancó | `docker compose -f compose.prod.yaml logs app` |
| certbot no obtiene certificado | El dominio no apunta a la instancia, o el 80 está cerrado | `dig +short <dominio>`; ACME valida por HTTP en el puerto 80 |
| `Could not resolve hostname :` en `scp`/`ssh` | Secretos o variables sin definir: se interpolan como cadena vacía | Paso 7. El job los valida antes de conectarse y nombra los que faltan |
| `.env: Permission denied` en el servidor | El archivo se creó con `sudo` y quedó como `root:root` | `sudo chown deploy:deploy <DEPLOY_PATH>/.env` (Paso 5) |
| El sitio carga sin estilos y la consola marca contenido mixto | Se pierde `X-Forwarded-Proto` y Laravel emite URLs `http://` | Las tres piezas del Paso 7: `RequestHeader` en Apache, `trusted_proxies` en Caddy, `trustProxies` en Laravel |
| `no alternative certificate subject name matches` | Apache no tiene vhost para el dominio y responde con el certificado de otro sitio | Paso 7: `a2ensite` y `certbot` para ESTE dominio |
| El despliegue sale verde pero solo `db` está arriba | Un comando que lee stdin se comió el resto del script | Ya corregido: el script se copia y se ejecuta desde archivo, y `compose run` usa `-T < /dev/null` |
| `502 Bad Gateway` desde Apache | El stack no escucha en `127.0.0.1:8080` | `docker compose -f compose.prod.yaml ps` y `ss -tlnp | grep 8080` |
| `denied` al hacer `pull` en el servidor | Paquete privado sin `GHCR_READ_TOKEN` | Paso 9 |
| `Permission denied (publickey)` | Clave incompleta en el secret | `DEPLOY_SSH_KEY` debe incluir las líneas `BEGIN`/`END` |
| El sitio carga sin estilos | Etiquetas distintas en `app` y `web` | `docker compose -f compose.prod.yaml ps` — la misma etiqueta en ambos |
| PHPUnit falla en CI y no en local | La base del servicio no está lista | El job publica `db-test` en `/etc/hosts` y espera el healthcheck |

Para inspeccionar lo mismo que ve el healthcheck, sin pasar por TLS ni DNS:

```bash
docker compose -f compose.prod.yaml exec web wget -q -O- http://127.0.0.1:8080/up
```
