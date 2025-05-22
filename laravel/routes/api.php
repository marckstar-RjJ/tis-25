<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdenDePagoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ColegioController;
use App\Http\Controllers\SeedController;
use App\Http\Middleware\CheckAdminRole;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\ConvocatoriaController;

// Rutas de autenticación
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Rutas para colegios - Acceso público solo para listar y ver detalles
Route::get('/colegios', [ColegioController::class, 'index']);
Route::get('/colegios/{id}', [ColegioController::class, 'show']);

// Rutas para colegios - Solo administradores pueden crear, actualizar y eliminar
Route::middleware([CheckAdminRole::class])->group(function () {
    Route::post('/colegios', [ColegioController::class, 'store']);
    Route::put('/colegios/{id}', [ColegioController::class, 'update']);
    Route::delete('/colegios/{id}', [ColegioController::class, 'destroy']);
    
    // Rutas para convocatorias (solo administradores)
    Route::apiResource('/convocatorias', ConvocatoriaController::class);
    Route::patch('/convocatorias/{id}/areas', [ConvocatoriaController::class, 'actualizarAreas']);
});

// Ruta temporal para seeder de colegios
Route::get('/seed/colegios', [SeedController::class, 'seedColegios']);

// Rutas para órdenes de pago
Route::post('/ordenes', [OrdenDePagoController::class, 'generarOrden']);
Route::get('/ordenes/{id}/pdf', [OrdenDePagoController::class, 'generarPDF']);
Route::get('/ordenes', [OrdenDePagoController::class, 'listarOrdenes']);
Route::patch('/ordenes/{id}/aprobar', [OrdenDePagoController::class, 'aprobarPago']);
Route::patch('/ordenes/{id}/rechazar', [OrdenDePagoController::class, 'rechazarPago']);

// Rutas para Áreas (protegidas, ejemplo básico)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/areas', [AreaController::class, 'index']);
    // Aquí irían otras rutas protegidas para áreas (crear, inscribir, etc.)
    // Ejemplo: Route::post('/estudiantes/{estudiante}/areas', [InscripcionController::class, 'inscribir']);
});

// Rutas públicas para obtener información
Route::get('/areas', [AreaController::class, 'index']);
Route::get('/convocatorias-abiertas', [ConvocatoriaController::class, 'convocatoriasAbiertas']);

Route::get('/test', function () {
    return response()->json(['message' => 'API funcionando correctamente']);
});
