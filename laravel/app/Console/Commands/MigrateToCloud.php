<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateToCloud extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:migrate-to-cloud {--fresh : Drop all tables before migrating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrar la base de datos a LaravelCloud (Supabase)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando conexión a LaravelCloud...');
        
        try {
            // Verificar la conexión
            $pdo = DB::connection()->getPdo();
            $this->info('¡Conexión exitosa a LaravelCloud!');
            
            // Verificar si hay tablas existentes
            $tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            $tableCount = count($tables);
            
            $this->info("Tablas existentes: {$tableCount}");
            
            if ($tableCount > 0) {
                $tableNames = array_map(function($table) {
                    return $table->table_name;
                }, $tables);
                
                $this->info('Tablas encontradas: ' . implode(', ', $tableNames));
                
                if ($this->option('fresh')) {
                    if ($this->confirm('¿Está seguro que desea eliminar todas las tablas existentes?', false)) {
                        $this->call('migrate:fresh');
                    } else {
                        $this->info('Operación cancelada.');
                        return 0;
                    }
                } else {
                    // Ejecutar migraciones pendientes
                    $this->info('Ejecutando migraciones pendientes...');
                    $this->call('migrate');
                }
            } else {
                // Si no hay tablas, ejecutar todas las migraciones
                $this->info('No se encontraron tablas. Ejecutando todas las migraciones...');
                $this->call('migrate');
            }
            
            // Verificar las tablas después de la migración
            $this->info('Verificando tablas después de la migración...');
            $tablesAfter = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            $tableCountAfter = count($tablesAfter);
            
            $this->info("Tablas después de la migración: {$tableCountAfter}");
            
            if ($tableCountAfter > 0) {
                $tableNamesAfter = array_map(function($table) {
                    return $table->table_name;
                }, $tablesAfter);
                
                $this->info('Tablas finales: ' . implode(', ', $tableNamesAfter));
            }
            
            $this->info('¡Migración a LaravelCloud completada con éxito!');
            return 0;
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }
} 