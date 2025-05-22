<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdenDePago extends Model
{
    use HasFactory;

    protected $table = 'mydb.OrdenDePago';
    protected $primaryKey = 'idOrdenDePago';
    public $timestamps = false;

    protected $fillable = [
        'idUsuarioSolicitante',
        'fechaCreacion',
        'montoTotal',
        'moneda',
        'estado',
        'fechaPago',
        'referenciaPago',
        'fechaExpiracion'
    ];

    protected $casts = [
        'fechaCreacion' => 'datetime',
        'fechaPago' => 'datetime',
        'fechaExpiracion' => 'datetime',
        'estado' => 'string',
        'montoTotal' => 'decimal:2'
    ];

    /**
     * Constantes para los valores del enum de estado
     */
    const ESTADO_PENDIENTE = 'Pendiente';
    const ESTADO_PAGADA = 'Pagada';
    const ESTADO_CANCELADA = 'Cancelada';
    const ESTADO_EXPIRADA = 'Expirada';

    /**
     * Relación con la cuenta del usuario solicitante
     */
    public function usuarioSolicitante()
    {
        return $this->belongsTo(Cuenta::class, 'idUsuarioSolicitante', 'idCuenta');
    }

    /**
     * Relación con las solicitudes de inscripción
     */
    public function solicitudesInscripcion()
    {
        return $this->hasMany(SolicitudDeInscripcion::class, 'idOrdenPago', 'idOrdenDePago');
    }

    /**
     * Verificar si la orden de pago está pendiente
     */
    public function estaPendiente()
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    /**
     * Verificar si la orden de pago está pagada
     */
    public function estaPagada()
    {
        return $this->estado === self::ESTADO_PAGADA;
    }

    /**
     * Verificar si la orden de pago está cancelada
     */
    public function estaCancelada()
    {
        return $this->estado === self::ESTADO_CANCELADA;
    }

    /**
     * Verificar si la orden de pago está expirada
     */
    public function estaExpirada()
    {
        return $this->estado === self::ESTADO_EXPIRADA;
    }

    /**
     * Obtener una colección de los posibles estados
     */
    public static function getEstados()
    {
        return [
            self::ESTADO_PENDIENTE,
            self::ESTADO_PAGADA,
            self::ESTADO_CANCELADA,
            self::ESTADO_EXPIRADA
        ];
    }
}
