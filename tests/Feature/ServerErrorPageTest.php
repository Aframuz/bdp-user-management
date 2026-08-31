<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServerErrorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_invalid_bigint_user_id_renders_the_inertia_500_page_without_sql_details(): void
    {
        $this->get('/usuarios/asdf')
            ->assertInternalServerError()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ServerError')
                ->where('ruta', '/usuarios/asdf'))
            ->assertDontSee('SQLSTATE')
            ->assertDontSee('invalid input syntax');
    }

    public function test_json_requests_keep_the_plain_500_response(): void
    {
        $this->getJson('/usuarios/asdf')
            ->assertInternalServerError()
            ->assertHeaderMissing('X-Inertia');
    }
}
