import { Head, Link } from '@inertiajs/react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { ExclamationCircle } from 'react-bootstrap-icons';
import { Breadcrumbs } from '../../Components/Common/Breadcrumbs';
import { FormField } from '../../Components/Common/FormField';
import { SelectField } from '../../Components/Common/SelectField';
import { TextareaField } from '../../Components/Common/TextareaField';
import { useUsuarioForm } from '../../Hooks/useUsuarioForm';
import { AdminLayout } from '../../Layouts/AdminLayout';
import type { SharedPageProps } from '../../Types/inertia';
import type { RoleOption, SelectOption } from '../../Types/usuario';
import { usuarios } from '../../Utils/routes';

interface CreateProps extends SharedPageProps {
    roles: RoleOption[];
    estados: SelectOption[];
}

export default function Create({ roles, estados }: CreateProps) {
    const { data, errors, hasErrors, processing, setField, submit } = useUsuarioForm();
    const roleOptions = roles.map((rol) => ({ value: String(rol.id), label: rol.nombre }));

    return (
        <AdminLayout>
            <Head title="Registrar usuario" />
            <Breadcrumbs items={[{ label: 'Usuarios', href: usuarios.index() }, { label: 'Registrar' }]} />
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Usuarios</p>
                    <h1>Registrar usuario</h1>
                    <p>Completa la información solicitada. Los campos con asterisco son obligatorios.</p>
                </div>
            </div>

            <Form noValidate onSubmit={submit}>
                {hasErrors && (
                    <Alert aria-live="assertive" className="d-flex align-items-center gap-2" variant="danger">
                        <ExclamationCircle aria-hidden="true" />
                        Revisa los campos marcados antes de continuar.
                    </Alert>
                )}

                <Card className="content-card mb-4">
                    <Card.Body>
                        <h2 className="section-title">Datos personales</h2>
                        <Row className="g-4">
                            <Col md={6}>
                                <FormField autoComplete="given-name" error={errors.nombre} id="nombre"
                                    label="Nombre" maxLength={100}
                                    onChange={(event) => setField('nombre', event.target.value)} required
                                    value={data.nombre} />
                            </Col>
                            <Col md={6}>
                                <FormField autoComplete="family-name" error={errors.apellido} id="apellido"
                                    label="Apellido" maxLength={100}
                                    onChange={(event) => setField('apellido', event.target.value)} required
                                    value={data.apellido} />
                            </Col>
                            <Col md={6}>
                                <FormField autoComplete="email" error={errors.email} id="email" label="Email"
                                    onChange={(event) => setField('email', event.target.value)} required
                                    type="email" value={data.email} />
                            </Col>
                            <Col md={6}>
                                <FormField error={errors.rut} id="rut" label="RUT/RUN"
                                    onChange={(event) => setField('rut', event.target.value)}
                                    placeholder="12.345.678-9" required value={data.rut} />
                            </Col>
                            <Col md={6}>
                                <FormField autoComplete="tel" error={errors.telefono} hint="Opcional. Solo números."
                                    id="telefono" label="Teléfono"
                                    onChange={(event) => setField('telefono', event.target.value)}
                                    type="number" value={data.telefono} />
                            </Col>
                            <Col md={3}>
                                <SelectField error={errors.rol_id} id="rol_id" label="Rol"
                                    onChange={(event) => setField('rol_id', event.target.value)}
                                    options={roleOptions} placeholder="Selecciona un rol" required
                                    value={data.rol_id} />
                            </Col>
                            <Col md={3}>
                                <SelectField error={errors.estado} id="estado" label="Estado"
                                    onChange={(event) => setField('estado', event.target.value)}
                                    options={estados} placeholder="Selecciona un estado" required
                                    value={data.estado} />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="content-card mb-4">
                    <Card.Body>
                        <h2 className="section-title">Dirección</h2>
                        <Row className="g-4">
                            <Col md={6}>
                                <FormField autoComplete="street-address" error={errors.calle} id="calle"
                                    label="Calle" maxLength={255}
                                    onChange={(event) => setField('calle', event.target.value)} required
                                    value={data.calle} />
                            </Col>
                            <Col md={3}>
                                <FormField autoComplete="address-level2" error={errors.ciudad} id="ciudad"
                                    label="Ciudad" maxLength={100}
                                    onChange={(event) => setField('ciudad', event.target.value)} required
                                    value={data.ciudad} />
                            </Col>
                            <Col md={3}>
                                <FormField autoComplete="postal-code" error={errors.codigo_postal}
                                    hint="Opcional." id="codigo_postal" label="Código postal" maxLength={20}
                                    onChange={(event) => setField('codigo_postal', event.target.value)}
                                    value={data.codigo_postal} />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="content-card mb-4">
                    <Card.Body>
                        <h2 className="section-title">Nota u observación</h2>
                        <TextareaField error={errors.nota} id="nota" label="Nota" maxLength={1000}
                            onChange={(event) => setField('nota', event.target.value)}
                            placeholder="Registra al menos una observación sobre este usuario." required
                            value={data.nota} />
                    </Card.Body>
                </Card>

                <div className="form-actions">
                    <Link className="btn btn-outline-secondary" href={usuarios.index()}>Cancelar</Link>
                    <Button disabled={processing} type="submit">
                        {processing ? 'Guardando…' : 'Guardar usuario'}
                    </Button>
                </div>
            </Form>
        </AdminLayout>
    );
}
