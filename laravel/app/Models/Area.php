<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'nombre',
        'descripcion'
    ];
    
    /**
     * Relación con las convocatorias a las que pertenece esta área
     */
    public function convocatorias()
    {
        return $this->belongsToMany(Convocatoria::class, 'convocatoria_areas', 'area_id', 'convocatoria_id');
    }
}
