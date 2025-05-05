<?php

namespace App\Console;

use App\Jobs\ExpirarOrdenesPendientes;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Ejecutar job para expirar órdenes pendientes cada hora
        $schedule->job(new ExpirarOrdenesPendientes())
            ->hourly()
            ->name('expirar_ordenes_pendientes')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/ordenes-expiracion.log'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

