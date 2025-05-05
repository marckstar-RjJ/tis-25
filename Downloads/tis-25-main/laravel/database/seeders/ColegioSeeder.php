<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ColegioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncar la tabla para evitar duplicados
        Schema::disableForeignKeyConstraints();
        DB::table('colegios')->truncate();
        Schema::enableForeignKeyConstraints();

        // Lista de colegios predefinidos
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
    }
} 