<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Convocatoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ConvocatoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $convocatorias = Convocatoria::with('areas')->get();
            return response()->json($convocatorias);
        } catch (\Exception $e) {
            \Log::error('Error al obtener convocatorias: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener la lista de convocatorias'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'fecha_inicio_inscripciones' => 'required|date',
                'fecha_fin_inscripciones' => 'required|date|after_or_equal:fecha_inicio_inscripciones',
                'costo_por_area' => 'required|numeric|min:0',
                'maximo_areas' => 'required|integer|min:1',
                'areas' => 'required|array|min:1',
                'areas.*' => 'exists:areas,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $convocatoria = Convocatoria::create([
                'nombre' => $request->nombre,
                'fecha_inicio_inscripciones' => $request->fecha_inicio_inscripciones,
                'fecha_fin_inscripciones' => $request->fecha_fin_inscripciones,
                'costo_por_area' => $request->costo_por_area,
                'maximo_areas' => $request->maximo_areas,
                'activa' => $request->activa ?? true
            ]);

            // Asociar áreas seleccionadas a la convocatoria
            $convocatoria->areas()->attach($request->areas);

            DB::commit();

            $convocatoria->load('areas');
            return response()->json($convocatoria, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear convocatoria: ' . $e->getMessage());
            return response()->json(['message' => 'Error al crear la convocatoria'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $convocatoria = Convocatoria::with('areas')->findOrFail($id);
            return response()->json($convocatoria);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Convocatoria no encontrada'], 404);
        } catch (\Exception $e) {
            \Log::error('Error al obtener convocatoria ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener la convocatoria'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $convocatoria = Convocatoria::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:255',
                'fecha_inicio_inscripciones' => 'sometimes|required|date',
                'fecha_fin_inscripciones' => 'sometimes|required|date|after_or_equal:fecha_inicio_inscripciones',
                'costo_por_area' => 'sometimes|required|numeric|min:0',
                'maximo_areas' => 'sometimes|required|integer|min:1',
                'activa' => 'sometimes|required|boolean',
                'areas' => 'sometimes|required|array|min:1',
                'areas.*' => 'exists:areas,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $convocatoria->update($request->only([
                'nombre', 
                'fecha_inicio_inscripciones', 
                'fecha_fin_inscripciones',
                'costo_por_area',
                'maximo_areas',
                'activa'
            ]));

            // Actualizar áreas si se proporcionan
            if ($request->has('areas')) {
                $convocatoria->areas()->sync($request->areas);
            }

            DB::commit();

            $convocatoria->load('areas');
            return response()->json($convocatoria);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Convocatoria no encontrada'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al actualizar convocatoria ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar la convocatoria'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $convocatoria = Convocatoria::findOrFail($id);
            $convocatoria->delete();
            
            return response()->json(['message' => 'Convocatoria eliminada correctamente']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Convocatoria no encontrada'], 404);
        } catch (\Exception $e) {
            \Log::error('Error al eliminar convocatoria ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error al eliminar la convocatoria'], 500);
        }
    }
    
    /**
     * Obtener convocatorias actualmente abiertas para inscripción
     */
    public function convocatoriasAbiertas()
    {
        try {
            $hoy = now()->startOfDay();
            $convocatorias = Convocatoria::with('areas')
                ->where('activa', true)
                ->where('fecha_inicio_inscripciones', '<=', $hoy)
                ->where('fecha_fin_inscripciones', '>=', $hoy)
                ->get();
                
            return response()->json($convocatorias);
        } catch (\Exception $e) {
            \Log::error('Error al obtener convocatorias abiertas: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener las convocatorias disponibles'], 500);
        }
    }
    
    /**
     * Gestionar las áreas de una convocatoria
     */
    public function actualizarAreas(Request $request, string $id)
    {
        try {
            $convocatoria = Convocatoria::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'areas' => 'required|array|min:1',
                'areas.*' => 'exists:areas,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $convocatoria->areas()->sync($request->areas);
            
            $convocatoria->load('areas');
            return response()->json($convocatoria);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Convocatoria no encontrada'], 404);
        } catch (\Exception $e) {
            \Log::error('Error al actualizar áreas de convocatoria ' . $id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar las áreas de la convocatoria'], 500);
        }
    }
}
