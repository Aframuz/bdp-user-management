import { Form } from '@inertiajs/react';
import { Breadcrumbs } from '@Components/Common/Breadcrumbs';
import { PageMeta } from '@Components/Common/PageMeta';
import { UsuarioFormBody } from '@Components/Usuarios/UsuarioFormBody';
import { focusFirstError, useUsuarioForm } from '@Hooks/useUsuarioForm';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';
import type { RoleOption, SelectOption } from '@Types/usuario';
import { usuarios } from '@Utils/routes';
import pageStyles from '@Components/Common/Page.module.css';

interface CreateProps extends SharedPageProps {
  roles: RoleOption[];
  estados: SelectOption[];
}

export default function Create({ roles, estados }: CreateProps) {
  const {
    formRef,
    valores,
    validateBeforeSubmit,
    handleFieldChange,
    setRutValido,
    setTelefonoValido,
  } = useUsuarioForm();
  const roleOptions = roles.map((rol) => ({ value: String(rol.id), label: rol.nombre }));

  return (
    <AdminLayout>
      <PageMeta
        description="Da de alta un usuario del mantenedor con sus datos personales, rol asignado y estado inicial."
        title="Registrar usuario"
      />
      <Breadcrumbs
        items={[{ label: 'Usuarios', href: usuarios.index() }, { label: 'Registrar' }]}
      />
      <div className={pageStyles['page-heading']}>
        <div>
          <p className={`${pageStyles['page-heading__eyebrow']} text-uppercase text-primary`}>
            Usuarios
          </p>
          <h1 className={pageStyles['page-heading__title']}>Registrar usuario</h1>
          <p className="mb-0 text-body-secondary">
            Completa la información solicitada. El resumen indica qué falta antes de guardar.
          </p>
        </div>
      </div>

      <Form
        action={usuarios.index()}
        method="post"
        noValidate
        onBefore={validateBeforeSubmit}
        onChange={handleFieldChange}
        onError={focusFirstError}
        options={{ preserveScroll: true }}
        ref={formRef}
      >
        {({ errors, hasErrors, processing }) => (
          <UsuarioFormBody
            errors={errors}
            estados={estados}
            hasErrors={hasErrors}
            processing={processing}
            roleOptions={roleOptions}
            setRutValido={setRutValido}
            setTelefonoValido={setTelefonoValido}
            valores={valores}
          />
        )}
      </Form>
    </AdminLayout>
  );
}
