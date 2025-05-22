<?php

namespace App\Jobs;

use App\Models\OrdenDePago;
use App\Models\SolicitudDeInscripcion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpirarOrdenesPendientes implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * El tiempo en segundos durante el cual el trabajo no debe ejecutarse si otro está en ejecución.
     *
     * @return int
     */
    public function uniqueFor()
    {
        return 3600; // 1 hora
    }

    /**
     * Get the unique ID for the job.
     *
     * @return string
     */
    public function uniqueId()
    {
        return 'expirar_ordenes_pendientes';
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Iniciando proceso de expiración de órdenes pendientes');
        
        DB::beginTransaction();
        
        try {
            // Obtener órdenes pendientes cuya fecha de expiración ya pasó
            $ordenes = OrdenDePago::where('estado', OrdenDePago::ESTADO_PENDIENTE)
                ->where('fechaExpiracion', '<', now())
                ->get();
                
            $count = count($ordenes);
            Log::info("Se encontraron {$count} órdenes pendientes vencidas");
            
            if ($count === 0) {
                DB::commit();
                return;
            }
            
            foreach ($ordenes as $orden) {
                // Actualizar la orden a estado Expirada
                $orden->estado = OrdenDePago::ESTADO_EXPIRADA;
                $orden->save();
                
                Log::info("Orden #{$orden->idOrdenDePago} marcada como expirada");
                
                // Buscar y actualizar las solicitudes relacionadas
                $solicitudes = SolicitudDeInscripcion::where('idOrdenPago', $orden->idOrdenDePago)->get();
                
                foreach ($solicitudes as $solicitud) {
                    $solicitud->estado = 'Cancelada';
                    $solicitud->save();
                    Log::info("Solicitud #{$solicitud->idSolicitudDeInscripcion} marcada como cancelada");
                }
            }
            
            DB::commit();
            Log::info("Proceso de expiración completado exitosamente: {$count} órdenes procesadas");
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al procesar órdenes vencidas: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(\Throwable $exception)
    {
        Log::error('El job de expiración de órdenes falló: ' . $exception->getMessage());
    }
}
