<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Colegio extends Model
{
    protected $table = 'colegios';
    
    protected $fillable = [
        'nombre',
        'direccion',
        'telefono'
    ];

    /**
     * Obtener los estudiantes asociados a este colegio
     */
    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'colegio_id');
    }
} 