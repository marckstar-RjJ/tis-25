<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cuenta extends Model
{
    protected $table = 'cuentas';
    
    protected $fillable = [
        'email',
        'password',
        'tipo_usuario'
    ];

    /**
     * Obtener el administrador asociado a esta cuenta
     */
    public function administrador(): HasOne
    {
        return $this->hasOne(Administrador::class, 'cuenta_id');
    }

    /**
     * Obtener el tutor asociado a esta cuenta
     */
    public function tutor(): HasOne
    {
        return $this->hasOne(Tutor::class, 'cuenta_id');
    }

    /**
     * Obtener el estudiante asociado a esta cuenta
     */
    public function estudiante(): HasOne
    {
        return $this->hasOne(Estudiante::class, 'cuenta_id');
    }
}
