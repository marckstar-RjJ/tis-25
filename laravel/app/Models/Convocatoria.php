<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Convocatoria extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'nombre',
        'fecha_inicio_inscripciones',
        'fecha_fin_inscripciones',
        'costo_por_area',
        'maximo_areas',
        'activa'
    ];
    
    protected $casts = [
        'fecha_inicio_inscripciones' => 'date',
        'fecha_fin_inscripciones' => 'date',
        'costo_por_area' => 'decimal:2',
        'maximo_areas' => 'integer',
        'activa' => 'boolean'
    ];
    
    /**
     * Relación con las áreas disponibles en esta convocatoria
     */
    public function areas()
    {
        return $this->belongsToMany(Area::class, 'convocatoria_areas', 'convocatoria_id', 'area_id');
    }
    
    /**
     * Verifica si la convocatoria está actualmente abierta para inscripciones
     */
    public function estaAbierta()
    {
        $hoy = now()->startOfDay();
        return $this->activa && 
               $hoy->greaterThanOrEqualTo($this->fecha_inicio_inscripciones) && 
               $hoy->lessThanOrEqualTo($this->fecha_fin_inscripciones);
    }
}
