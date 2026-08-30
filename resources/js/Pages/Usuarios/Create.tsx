import { Form, Link } from '@inertiajs/react';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';
import { Breadcrumbs } from '@Components/Common/Breadcrumbs';
import { FormField } from '@Components/Common/FormField';
import { AlertCircleIcon } from '@Components/Common/Icons';
import { PageMeta } from '@Components/Common/PageMeta';
import { RutField } from '@Components/Usuarios/RutField';
import { SelectField } from '@Components/Common/SelectField';
import { TelefonoField } from '@Components/Usuarios/TelefonoField';
import { TextareaField } from '@Components/Common/TextareaField';
import { focusFirstError, useUsuarioForm } from '@Hooks/useUsuarioForm';
import { AdminLayout } from '@Layouts/AdminLayout';
import type { SharedPageProps } from '@Types/inertia';
import type { RoleOption, SelectOption } from '@Types/usuario';
import { preloadPage } from '@Utils/pageModules';
import { usuarios } from '@Utils/routes';
import pageStyles from '@Components/Common/Page.module.css';

interface CreateProps extends SharedPageProps {
    roles: RoleOption[];
    estados: SelectOption[];
}

export default function Create({ roles, estados }: CreateProps) {
    const {
        formRef, validateBeforeSubmit, clearFieldError, setRutValido, setTelefonoValido,
    } = useUsuarioForm();
    const roleOptions = roles.map((rol) => ({ value: String(rol.id), label: rol.nombre }));

    return (
        <AdminLayout>
            <PageMeta
                description="Da de alta un usuario del mantenedor con sus datos personales, rol asignado y estado inicial."
                title="Registrar usuario"
            />
            <Breadcrumbs items={[{ label: 'Usuarios', href: usuarios.index() }, { label: 'Registrar' }]} />
            <div className={pageStyles['page-heading']}>
                <div>
                    <p className={`${pageStyles['page-heading__eyebrow']} text-uppercase text-primary`}>Usuarios</p>
                    <h1 className={pageStyles['page-heading__title']}>Registrar usuario</h1>
                    <p className="mb-0 text-body-secondary">
                        Completa la información solicitada. Los campos con asterisco son obligatorios.
                    </p>
                </div>
            </div>

            <Form
                action={usuarios.index()}
                method="post"
                noValidate
                onBefore={validateBeforeSubmit}
                onChange={clearFieldError}
                onError={focusFirstError}
                options={{ preserveScroll: true }}
                ref={formRef}
            >
                {({ errors, hasErrors, processing }) => (
                    <>
                        {hasErrors && (
                            <Alert aria-live="assertive" className="d-flex align-items-center gap-2" variant="danger">
                                <AlertCircleIcon aria-hidden="true" />
                                Revisa los campos marcados antes de continuar.
                            </Alert>
                        )}

                        <Card className="mb-4 overflow-hidden rounded-4 border shadow">
                            <Card.Body className={pageStyles['content-card__body']}>
                                <h2 className="mb-4 border-bottom pb-3 fs-5 fw-bold">Datos personales</h2>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <FormField autoComplete="given-name" error={errors.nombre} id="nombre"
                                            label="Nombre" maxLength={100} required />
                                    </Col>
                                    <Col md={6}>
                                        <FormField autoComplete="family-name" error={errors.apellido} id="apellido"
                                            label="Apellido" maxLength={100} required />
                                    </Col>
                                    <Col md={6}>
                                        <FormField autoComplete="email" error={errors.email} id="email" label="Email"
                                            required type="email" />
                                    </Col>
                                    <Col md={6}>
                                        <RutField error={errors.rut} onValidChange={setRutValido} />
                                    </Col>
                                    <Col md={6}>
                                        <TelefonoField error={errors.telefono} onValidChange={setTelefonoValido} />
                                    </Col>
                                    <Col md={3}>
                                        <SelectField error={errors.rol_id} id="rol_id" label="Rol"
                                            options={roleOptions} placeholder="Selecciona un rol" required />
                                    </Col>
                                    <Col md={3}>
                                        <SelectField error={errors.estado} id="estado" label="Estado"
                                            options={estados} placeholder="Selecciona un estado" required />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 overflow-hidden rounded-4 border shadow">
                            <Card.Body className={pageStyles['content-card__body']}>
                                <h2 className="mb-4 border-bottom pb-3 fs-5 fw-bold">Dirección</h2>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <FormField autoComplete="street-address" error={errors.calle} id="calle"
                                            label="Calle" maxLength={255} required />
                                    </Col>
                                    <Col md={3}>
                                        <FormField autoComplete="address-level2" error={errors.ciudad} id="ciudad"
                                            label="Ciudad" maxLength={100} required />
                                    </Col>
                                    <Col md={3}>
                                        <FormField autoComplete="postal-code" error={errors.codigo_postal}
                                            hint="Opcional." id="codigo_postal" label="Código postal" maxLength={20} />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 overflow-hidden rounded-4 border shadow">
                            <Card.Body className={pageStyles['content-card__body']}>
                                <h2 className="mb-4 border-bottom pb-3 fs-5 fw-bold">Nota u observación</h2>
                                <TextareaField error={errors.nota} id="nota" label="Nota" maxLength={1000}
                                    placeholder="Registra al menos una observación sobre este usuario." required />
                            </Card.Body>
                        </Card>

                        <div className="d-flex flex-column-reverse flex-md-row justify-content-end gap-2">
                            <Link
                                className="btn btn-outline-secondary"
                                href={usuarios.index()}
                                onFocus={() => void preloadPage('Usuarios/Index')}
                                onPointerEnter={() => void preloadPage('Usuarios/Index')}
                                prefetch="hover"
                            >
                                Cancelar
                            </Link>
                            <Button disabled={processing} type="submit">
                                {processing ? 'Guardando…' : 'Guardar usuario'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </AdminLayout>
    );
}
