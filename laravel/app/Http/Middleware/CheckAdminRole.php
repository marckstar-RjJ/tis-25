<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Cuenta;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obtener el id de la cuenta desde la sesión o token
        // En este ejemplo simple, lo obtenemos de la sesión o de un parámetro
        $cuentaId = $request->session()->get('cuenta_id') ?? $request->input('cuenta_id');
        
        if (!$cuentaId) {
            return response()->json([
                'mensaje' => 'No autorizado. Debe iniciar sesión como administrador.'
            ], 401);
        }
        
        // Buscar la cuenta en la base de datos
        $cuenta = Cuenta::find($cuentaId);
        
        // Verificar si la cuenta existe y es de tipo administrador
        if (!$cuenta || $cuenta->tipo_usuario !== 'administrador') {
            return response()->json([
                'mensaje' => 'No autorizado. Solo los administradores pueden realizar esta acción.'
            ], 403);
        }
        
        return $next($request);
    }
} 