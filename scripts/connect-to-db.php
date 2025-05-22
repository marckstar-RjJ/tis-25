<?php
// Script simple para probar la conexión a la base de datos
try {
    $host = 'db.nuyiywyebrcjgttvvkir.supabase.co';
    $port = '5432';
    $database = 'postgres';
    $username = 'postgres';
    $password = 'TIS2-525Olimpiadas';

    echo "Intentando conectar a la base de datos PostgreSQL...\n";
    echo "Host: $host\n";
    echo "Puerto: $port\n";
    echo "Base de datos: $database\n";
    echo "Usuario: $username\n";
    
    $dsn = "pgsql:host=$host;port=$port;dbname=$database;sslmode=require";
    $pdo = new PDO($dsn, $username, $password);
    
    // Establecer el modo de error para lanzar excepciones
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "¡Conexión exitosa a la base de datos!\n";
    
    // Verificar tablas
    $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "Tablas encontradas (" . count($tables) . "):\n";
        foreach ($tables as $table) {
            echo "- $table\n";
        }
    } else {
        echo "No se encontraron tablas en la base de datos.\n";
    }
    
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage() . "\n";
    exit(1);
} 