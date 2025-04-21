<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:import {file? : The SQL file to import} {--fresh : Drop all tables before import}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import a SQL file into the database (useful for LaravelCloud migration)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");
        $fresh = $this->option('fresh');
        
        // Obtener archivo a importar
        $file = $this->argument('file');
        if (!$file) {
            // Si no se especifica un archivo, buscar el más reciente
            $exportPath = storage_path('app/database-export');
            if (!File::exists($exportPath)) {
                $this->error("No se encontró el directorio de exportación en: {$exportPath}");
                return 1;
            }
            
            $files = File::files($exportPath);
            if (empty($files)) {
                $this->error("No se encontraron archivos SQL para importar en: {$exportPath}");
                return 1;
            }
            
            // Ordenar por fecha de modificación (más reciente primero)
            usort($files, function ($a, $b) {
                return filemtime($b) - filemtime($a);
            });
            
            $file = $files[0]->getPathname();
            $this->info("Usando el archivo más reciente: " . basename($file));
        } else {
            // Verificar si es ruta absoluta o relativa
            if (!File::exists($file)) {
                $relativePath = storage_path('app/database-export/' . $file);
                if (File::exists($relativePath)) {
                    $file = $relativePath;
                } else {
                    $this->error("El archivo especificado no existe: {$file}");
                    return 1;
                }
            }
        }
        
        $this->info("Importando {$file} a la base de datos {$config['database']} usando {$connection}...");
        
        // Si se especifica --fresh, eliminar todas las tablas primero
        if ($fresh) {
            if (!$this->confirm('Esto eliminará TODOS los datos existentes. ¿Está seguro?', false)) {
                $this->info('Operación cancelada.');
                return 0;
            }
            
            $this->call('migrate:fresh');
        }
        
        // Comando según el tipo de base de datos
        if ($connection === 'pgsql') {
            $command = 'PGPASSWORD="' . $config['password'] . '" psql ' .
                       '-h ' . $config['host'] . ' ' .
                       '-p ' . $config['port'] . ' ' .
                       '-U ' . $config['username'] . ' ' .
                       '-d ' . $config['database'] . ' ' .
                       '-f ' . $file;
        } elseif ($connection === 'mysql') {
            $command = 'mysql ' .
                       '-h ' . $config['host'] . ' ' .
                       '-P ' . $config['port'] . ' ' .
                       '-u ' . $config['username'] . ' ' .
                       '-p' . $config['password'] . ' ' .
                       $config['database'] . ' ' .
                       '< ' . $file;
        } else {
            $this->error("El tipo de conexión {$connection} no está soportado para importación.");
            return 1;
        }
        
        // Ejecutar el comando
        $this->info("Ejecutando: " . preg_replace('/PGPASSWORD="[^"]*"/', 'PGPASSWORD="***"', $command));
        
        $result = 0;
        system($command, $result);
        
        if ($result === 0) {
            $this->info("Base de datos importada correctamente desde: {$file}");
            return 0;
        } else {
            $this->error("Error al importar la base de datos. Código: {$result}");
            return 1;
        }
    }
} 