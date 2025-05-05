<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tutor extends Model
{
    protected $table = 'tutores';
    
    protected $fillable = [
        'cuenta_id',
        'nombre',
        'apellido',
        'ci',
        'telefono',
        'colegio_id'
    ];

    /**
     * Obtener la cuenta asociada a este tutor
     */
    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(Cuenta::class, 'cuenta_id');
    }

    /**
     * Obtener los estudiantes asociados a este tutor
     */
    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'tutor_id');
    }
} 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tutor extends Model
{
    protected $table = 'tutores';
    
    protected $fillable = [
        'cuenta_id',
        'nombre',
        'apellido',
        'ci',
        'telefono',
        'colegio_id'
    ];

    /**
     * Obtener la cuenta asociada a este tutor
     */
    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(Cuenta::class, 'cuenta_id');
    }

    /**
     * Obtener los estudiantes asociados a este tutor
     */
    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'tutor_id');
    }
} 