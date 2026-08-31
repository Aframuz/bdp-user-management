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
import {
  getFieldValidationProps,
  getInputValidationProps,
  getMaxLengthHint,
} from '@Hooks/usuarioFormRules';
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
                  {...getInputValidationProps('nombre')}
                  autoComplete="given-name"
                  error={errors.nombre}
                  hint={getMaxLengthHint('nombre')}
                  id="nombre"
                  label={USUARIO_CAMPOS.nombre}
                />
              </Col>
              <Col md={6}>
                <FormField
                  {...getInputValidationProps('apellido')}
                  autoComplete="family-name"
                  error={errors.apellido}
                  hint={getMaxLengthHint('apellido')}
                  id="apellido"
                  label={USUARIO_CAMPOS.apellido}
                />
              </Col>
              <Col md={6}>
                <FormField
                  {...getInputValidationProps('email')}
                  autoComplete="email"
                  error={errors.email}
                  id="email"
                  label={USUARIO_CAMPOS.email}
                  type="email"
                />
              </Col>
              <Col md={6}>
                <RutField error={errors.rut} onValidChange={setRutValido} />
              </Col>
              <Col md={6}>
                <SelectField
                  {...getFieldValidationProps('rol_id')}
                  error={errors.rol_id}
                  id="rol_id"
                  label={USUARIO_CAMPOS.rol_id}
                  options={roleOptions}
                  placeholder="Selecciona un rol"
                />
              </Col>
              <Col md={6}>
                <SelectField
                  {...getFieldValidationProps('estado')}
                  error={errors.estado}
                  id="estado"
                  label={USUARIO_CAMPOS.estado}
                  options={estados}
                  placeholder="Selecciona un estado"
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
                  {...getInputValidationProps('calle')}
                  autoComplete="street-address"
                  error={errors.calle}
                  id="calle"
                  label={USUARIO_CAMPOS.calle}
                />
              </Col>
              <Col md={6}>
                <FormField
                  {...getInputValidationProps('ciudad')}
                  autoComplete="address-level2"
                  error={errors.ciudad}
                  id="ciudad"
                  label={USUARIO_CAMPOS.ciudad}
                />
              </Col>
              <Col md={6}>
                <FormField
                  {...getInputValidationProps('codigo_postal')}
                  autoComplete="postal-code"
                  error={errors.codigo_postal}
                  hint="Opcional."
                  id="codigo_postal"
                  inputMode="numeric"
                  label={USUARIO_CAMPOS.codigo_postal}
                />
              </Col>
            </Row>
          </ContentCard>

          <ContentCard title={USUARIO_FORM_SECCIONES.nota.titulo}>
            <TextareaField
              {...getFieldValidationProps('nota')}
              error={errors.nota}
              hint={getMaxLengthHint('nota')}
              id="nota"
              label={USUARIO_CAMPOS.nota}
              placeholder="Registra al menos una observación sobre este usuario."
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
