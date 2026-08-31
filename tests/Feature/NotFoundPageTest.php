<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotFoundPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_route_renders_the_inertia_page_with_the_requested_path(): void
    {
        $this->get('/informes/2024')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page
                ->component('NotFound')
                ->where('ruta', '/informes/2024'));
    }

    public function test_missing_user_renders_the_same_page(): void
    {
        $this->get('/usuarios/9999')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page->component('NotFound'));
    }

    public function test_the_requested_path_keeps_the_query_string_and_is_truncated(): void
    {
        $largo = '/informes?filtro='.str_repeat('x', 200);

        $this->get($largo)
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page->where('ruta', substr($largo, 0, 120).'...'));
    }

    public function test_requests_expecting_json_keep_the_plain_404(): void
    {
        // La tabla y los tabs piden JSON; devolverles la página rompería su manejo
        // de errores, que solo mira el status.
        $this->getJson('/usuarios/data/inexistente')
            ->assertNotFound()
            ->assertHeaderMissing('X-Inertia');
    }
}
