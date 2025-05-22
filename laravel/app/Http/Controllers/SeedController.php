<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

class SeedController extends Controller
{
    /**
     * Seed colegios
     */
    public function seedColegios()
    {
        try {
            // Truncar la tabla para evitar duplicados
            Schema::disableForeignKeyConstraints();
            DB::table('colegios')->truncate();
            Schema::enableForeignKeyConstraints();

            // Lista de colegios predefinidos según lo solicitado
            $colegios = [
                [
                    'nombre' => 'Instituto Eduardo Laredo',
                    'direccion' => 'Av. Principal #123',
                    'telefono' => '75123456'
                ],
                [
                    'nombre' => 'Colegio Gualberto Villaroel',
                    'direccion' => 'Calle Sucre #456',
                    'telefono' => '75654321'
                ],
                [
                    'nombre' => 'Colegio La Salle',
                    'direccion' => 'Av. La Paz #654',
                    'telefono' => '75789123'
                ],
                [
                    'nombre' => 'Colegio Loyola',
                    'direccion' => 'Av. América #789',
                    'telefono' => '75987654'
                ],
                [
                    'nombre' => 'Colegio Don Bosco',
                    'direccion' => 'Calle Potosí #987',
                    'telefono' => '75321654'
                ],
                [
                    'nombre' => 'Colegio Marryknoll',
                    'direccion' => 'Av. Educación #567',
                    'telefono' => '75369852'
                ],
                [
                    'nombre' => 'Instituto Domingo Sabio',
                    'direccion' => 'Calle Escolar #741',
                    'telefono' => '75147258'
                ]
            ];

            // Insertar los colegios en la base de datos
            foreach ($colegios as $colegio) {
                DB::table('colegios')->insert([
                    'nombre' => $colegio['nombre'],
                    'direccion' => $colegio['direccion'],
                    'telefono' => $colegio['telefono'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'mensaje' => 'Colegios insertados correctamente',
                'colegios' => DB::table('colegios')->get()
            ], 200, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al insertar colegios',
                'error' => $e->getMessage()
            ], 500, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
            ]);
        }
    }
} 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

class SeedController extends Controller
{
    /**
     * Seed colegios
     */
    public function seedColegios()
    {
        try {
            // Truncar la tabla para evitar duplicados
            Schema::disableForeignKeyConstraints();
            DB::table('colegios')->truncate();
            Schema::enableForeignKeyConstraints();

            // Lista de colegios predefinidos según lo solicitado
            $colegios = [
                [
                    'nombre' => 'Instituto Eduardo Laredo',
                    'direccion' => 'Av. Principal #123',
                    'telefono' => '75123456'
                ],
                [
                    'nombre' => 'Colegio Gualberto Villaroel',
                    'direccion' => 'Calle Sucre #456',
                    'telefono' => '75654321'
                ],
                [
                    'nombre' => 'Colegio La Salle',
                    'direccion' => 'Av. La Paz #654',
                    'telefono' => '75789123'
                ],
                [
                    'nombre' => 'Colegio Loyola',
                    'direccion' => 'Av. América #789',
                    'telefono' => '75987654'
                ],
                [
                    'nombre' => 'Colegio Don Bosco',
                    'direccion' => 'Calle Potosí #987',
                    'telefono' => '75321654'
                ],
                [
                    'nombre' => 'Colegio Marryknoll',
                    'direccion' => 'Av. Educación #567',
                    'telefono' => '75369852'
                ],
                [
                    'nombre' => 'Instituto Domingo Sabio',
                    'direccion' => 'Calle Escolar #741',
                    'telefono' => '75147258'
                ]
            ];

            // Insertar los colegios en la base de datos
            foreach ($colegios as $colegio) {
                DB::table('colegios')->insert([
                    'nombre' => $colegio['nombre'],
                    'direccion' => $colegio['direccion'],
                    'telefono' => $colegio['telefono'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'mensaje' => 'Colegios insertados correctamente',
                'colegios' => DB::table('colegios')->get()
            ], 200, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al insertar colegios',
                'error' => $e->getMessage()
            ], 500, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, X-Token-Auth, Authorization',
            ]);
        }
    }
} 