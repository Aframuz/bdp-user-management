import { Alert, Col, Row } from 'react-bootstrap';
import { ContentCard } from '@Components/Common/ContentCard';
import { FormField } from '@Components/Common/FormField';
import { AlertCircleIcon } from '@Components/Common/Icons';
import { SelectField } from '@Components/Common/SelectField';
import { TextareaField } from '@Components/Common/TextareaField';
import { RutField } from '@Components/Usuarios/RutField';
import { TelefonoField } from '@Components/Usuarios/TelefonoField';
import { UsuarioFormResumen } from '@Components/Usuarios/UsuarioFormResumen';
import { useUsuarioFormProgreso } from '@Hooks/useUsuarioFormProgreso';
import { USUARIO_CAMPOS, USUARIO_FORM_SECCIONES } from '@Hooks/usuarioFormSecciones';
import type { SelectOption, UsuarioFormData } from '@Types/usuario';
import styles from './UsuarioFormBody.module.css';

interface UsuarioFormBodyProps {
  errors: Record<string, string | undefined>;
  estados: SelectOption[];
  hasErrors: boolean;
  processing: boolean;
  roleOptions: SelectOption[];
  setRutValido: (valido: boolean) => void;
  setTelefonoValido: (valido: boolean) => void;
  valores: Partial<UsuarioFormData>;
}

/**
 * Cuerpo del formulario de registro: los campos a la izquierda y el resumen a la
 * derecha. Vive fuera de `Create` porque el estado del formulario solo existe dentro
 * del render prop de `<Form>`, y `useUsuarioFormProgreso` necesita leerlo desde un
 * componente de verdad.
 */
export function UsuarioFormBody({
  errors,
  estados,
  hasErrors,
  processing,
  roleOptions,
  setRutValido,
  setTelefonoValido,
  valores,
}: UsuarioFormBodyProps) {
  const progreso = useUsuarioFormProgreso(valores, errors);

  return (
    <>
      {hasErrors && (
        <Alert aria-live="assertive" className="d-flex align-items-center gap-2" variant="danger">
          <AlertCircleIcon aria-hidden="true" />
          Revisa los campos marcados antes de continuar.
        </Alert>
      )}

      <Row className={`${styles['usuario-form']} g-4`}>
        <Col lg={8}>
          <ContentCard title={USUARIO_FORM_SECCIONES['datos-personales'].titulo}>
            <Row className="g-4">
              <Col md={6}>
                <FormField
                  autoComplete="given-name"
                  error={errors.nombre}
                  id="nombre"
                  label={USUARIO_CAMPOS.nombre}
                  maxLength={100}
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  autoComplete="family-name"
                  error={errors.apellido}
                  id="apellido"
                  label={USUARIO_CAMPOS.apellido}
                  maxLength={100}
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  autoComplete="email"
                  error={errors.email}
                  id="email"
                  label={USUARIO_CAMPOS.email}
                  required
                  type="email"
                />
              </Col>
              <Col md={6}>
                <RutField error={errors.rut} onValidChange={setRutValido} />
              </Col>
              <Col md={6}>
                <SelectField
                  error={errors.rol_id}
                  id="rol_id"
                  label={USUARIO_CAMPOS.rol_id}
                  options={roleOptions}
                  placeholder="Selecciona un rol"
                  required
                />
              </Col>
              <Col md={6}>
                <SelectField
                  error={errors.estado}
                  id="estado"
                  label={USUARIO_CAMPOS.estado}
                  options={estados}
                  placeholder="Selecciona un estado"
                  required
                />
              </Col>
              <Col md={6}>
                <TelefonoField error={errors.telefono} onValidChange={setTelefonoValido} />
              </Col>
            </Row>
          </ContentCard>

          <ContentCard title={USUARIO_FORM_SECCIONES.direccion.titulo}>
            <Row className="g-4">
              <Col xs={12}>
                <FormField
                  autoComplete="street-address"
                  error={errors.calle}
                  id="calle"
                  label={USUARIO_CAMPOS.calle}
                  maxLength={255}
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  autoComplete="address-level2"
                  error={errors.ciudad}
                  id="ciudad"
                  label={USUARIO_CAMPOS.ciudad}
                  maxLength={100}
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  autoComplete="postal-code"
                  error={errors.codigo_postal}
                  hint="Opcional."
                  id="codigo_postal"
                  label={USUARIO_CAMPOS.codigo_postal}
                  maxLength={20}
                />
              </Col>
            </Row>
          </ContentCard>

          <ContentCard title={USUARIO_FORM_SECCIONES.nota.titulo}>
            <TextareaField
              error={errors.nota}
              id="nota"
              label={USUARIO_CAMPOS.nota}
              maxLength={1000}
              placeholder="Registra al menos una observación sobre este usuario."
              required
            />
          </ContentCard>
        </Col>

        <Col lg={4}>
          <UsuarioFormResumen processing={processing} progreso={progreso} />
        </Col>
      </Row>
    </>
  );
}
