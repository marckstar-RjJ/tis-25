<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $areas = Area::all();
            return response()->json($areas);
        } catch (\Exception $e) {
            \Log::error('Error al obtener áreas:' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener la lista de áreas'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para crear una nueva área (futura implementación)
        return response()->json(['message' => 'Funcionalidad para crear área no implementada'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Lógica para mostrar un área específica (futura implementación)
         try {
            $area = Area::findOrFail($id);
            return response()->json($area);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Área no encontrada'], 404);
        } catch (\Exception $e) {
            \Log::error('Error al obtener área ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener el área'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Lógica para actualizar un área (futura implementación)
        return response()->json(['message' => 'Funcionalidad para actualizar área no implementada'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Lógica para eliminar un área (futura implementación)
        return response()->json(['message' => 'Funcionalidad para eliminar área no implementada'], 501);
    }
}
