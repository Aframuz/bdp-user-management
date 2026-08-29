<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->timestamps();
        });

        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rol_id')->constrained('roles')->restrictOnDelete();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('email')->unique();
            $table->string('rut', 30)->index();
            $table->string('telefono', 30)->nullable();
            $table->string('estado', 10)->index();
            $table->timestamps();

            $table->index(['rol_id', 'estado']);
            $table->index('created_at');
        });

        Schema::create('direcciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->cascadeOnDelete();
            $table->string('calle');
            $table->string('ciudad', 100);
            $table->string('codigo_postal', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->text('texto');
            $table->timestamps();

            $table->index(['usuario_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
        Schema::dropIfExists('direcciones');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('roles');
    }
};
