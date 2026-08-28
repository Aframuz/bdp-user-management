<?php

use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\UsuarioCsvExportController;
use App\Http\Controllers\UsuarioDataTableController;
use App\Http\Controllers\UsuarioTabController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/usuarios');

Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
Route::get('/usuarios/data', UsuarioDataTableController::class)->name('usuarios.data');
Route::get('/usuarios/export', UsuarioCsvExportController::class)->name('usuarios.export');
Route::get('/usuarios/create', [UsuarioController::class, 'create'])->name('usuarios.create');
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
Route::get('/usuarios/{usuario}', [UsuarioController::class, 'show'])->name('usuarios.show');
Route::get('/usuarios/{usuario}/tabs/{tab}', UsuarioTabController::class)
    ->whereIn('tab', ['general', 'direcciones', 'notas'])
    ->name('usuarios.tabs.show');
Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
