<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Convocatoria;
use App\Models\Area;
use Carbon\Carbon;

class ConvocatoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todas las áreas disponibles
        $areas = Area::all();
        
        if ($areas->isEmpty()) {
            // Si no hay áreas, crear algunas áreas por defecto
            $areasDatos = [
                ['nombre' => 'Matemática', 'descripcion' => 'Olimpiada de Matemática'],
                ['nombre' => 'Física', 'descripcion' => 'Olimpiada de Física'],
                ['nombre' => 'Química', 'descripcion' => 'Olimpiada de Química'],
                ['nombre' => 'Astronomía', 'descripcion' => 'Olimpiada de Astronomía'],
                ['nombre' => 'Informática', 'descripcion' => 'Olimpiada de Informática'],
                ['nombre' => 'Biología', 'descripcion' => 'Olimpiada de Biología'],
                ['nombre' => 'Robótica', 'descripcion' => 'Olimpiada de Robótica']
            ];
            
            foreach ($areasDatos as $areaDato) {
                Area::create($areaDato);
            }
            
            // Recargar las áreas
            $areas = Area::all();
        }
        
        // Convocatoria 1: Actual
        $convocatoria1 = Convocatoria::create([
            'nombre' => 'Olimpiadas oh sansi! 2025',
            'fecha_inicio_inscripciones' => Carbon::now()->subDays(5),
            'fecha_fin_inscripciones' => Carbon::now()->addDays(25),
            'costo_por_area' => 16.00,
            'maximo_areas' => 2,
            'activa' => true
        ]);
        
        // Asociar todas las áreas a la primera convocatoria
        $convocatoria1->areas()->attach($areas->pluck('id'));
        
        // Convocatoria 2: Futura
        $convocatoria2 = Convocatoria::create([
            'nombre' => 'Olimpiadas de Verano 2025',
            'fecha_inicio_inscripciones' => Carbon::now()->addMonths(2),
            'fecha_fin_inscripciones' => Carbon::now()->addMonths(3),
            'costo_por_area' => 20.00,
            'maximo_areas' => 3,
            'activa' => true
        ]);
        
        // Asociar solo algunas áreas a la segunda convocatoria
        $areasVerano = $areas->whereIn('nombre', ['Matemática', 'Física', 'Informática', 'Robótica']);
        $convocatoria2->areas()->attach($areasVerano->pluck('id'));
        
        // Convocatoria 3: Pasada
        $convocatoria3 = Convocatoria::create([
            'nombre' => 'Olimpiadas de Invierno 2024',
            'fecha_inicio_inscripciones' => Carbon::now()->subMonths(6),
            'fecha_fin_inscripciones' => Carbon::now()->subMonths(5),
            'costo_por_area' => 15.00,
            'maximo_areas' => 2,
            'activa' => false
        ]);
        
        // Asociar solo algunas áreas a la tercera convocatoria
        $areasInvierno = $areas->whereIn('nombre', ['Química', 'Biología', 'Matemática']);
        $convocatoria3->areas()->attach($areasInvierno->pluck('id'));
    }
}
