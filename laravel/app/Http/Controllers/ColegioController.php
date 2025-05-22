<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Colegio;
use Illuminate\Validation\ValidationException;

class ColegioController extends Controller
{
    /**
     * Obtener todos los colegios
     */
    public function index()
    {
        $colegios = Colegio::all();
        return response()->json($colegios->toArray(), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
        ]);
    }

    /**
     * Crear un nuevo colegio
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'direccion' => 'required|string|max:255',
                'telefono' => 'required|string|max:20',
            ]);

            $colegio = Colegio::create($validatedData);

            return response()->json([
                'mensaje' => 'Colegio creado correctamente',
                'colegio' => $colegio
            ], 201, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al crear colegio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un colegio específico
     */
    public function show($id)
    {
        $colegio = Colegio::find($id);
        
        if (!$colegio) {
            return response()->json([
                'mensaje' => 'Colegio no encontrado'
            ], 404);
        }
        
        return response()->json($colegio, 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
        ]);
    }

    /**
     * Actualizar un colegio
     */
    public function update(Request $request, $id)
    {
        try {
            $colegio = Colegio::find($id);
            
            if (!$colegio) {
                return response()->json([
                    'mensaje' => 'Colegio no encontrado'
                ], 404);
            }
            
            $validatedData = $request->validate([
                'nombre' => 'string|max:255',
                'direccion' => 'string|max:255',
                'telefono' => 'string|max:20',
            ]);

            $colegio->update($validatedData);

            return response()->json([
                'mensaje' => 'Colegio actualizado correctamente',
                'colegio' => $colegio
            ], 200, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al actualizar colegio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un colegio
     */
    public function destroy($id)
    {
        $colegio = Colegio::find($id);
        
        if (!$colegio) {
            return response()->json([
                'mensaje' => 'Colegio no encontrado'
            ], 404);
        }
        
        $colegio->delete();
        
        return response()->json([
            'mensaje' => 'Colegio eliminado correctamente'
        ], 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
        ]);
    }
} 