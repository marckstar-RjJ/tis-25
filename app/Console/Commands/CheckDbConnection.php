<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckDbConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:check-connection';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar la conexión a la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando conexión a la base de datos...');
        
        try {
            $connection = config('database.default');
            $config = config("database.connections.{$connection}");
            
            // Mostrar información de conexión
            $this->info("Conexión: {$connection}");
            $this->info("Host: {$config['host']}");
            $this->info("Puerto: {$config['port']}");
            $this->info("Base de datos: {$config['database']}");
            $this->info("Usuario: {$config['username']}");
            
            // Intentar conectarse
            $startTime = microtime(true);
            DB::connection()->getPdo();
            $endTime = microtime(true);
            
            // Verificar si hay tablas
            $tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            
            $this->info('¡Conexión exitosa!');
            $this->info(sprintf('Tiempo de conexión: %.2f ms', ($endTime - $startTime) * 1000));
            $this->info('Tablas encontradas: ' . count($tables));
            
            if (count($tables) > 0) {
                $this->table(
                    ['Nombre de la tabla'],
                    array_map(function ($table) {
                        return [(array) $table][$table->table_name ?? 'table_name'];
                    }, $tables)
                );
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error de conexión: ' . $e->getMessage());
            return 1;
        }
    }
} 