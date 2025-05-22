<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cuenta;
use App\Models\Estudiante;
use App\Models\Tutor;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        try {
            \Log::info('Solicitud de registro recibida', [
                'data' => $request->all()
            ]);
            
            $validatedData = $request->validate([
                'email' => 'required|email|unique:cuentas',
                'password' => 'required|min:6',
                'tipo_usuario' => 'required|in:estudiante,tutor,administrador',
                'nombre' => 'required|string',
                'apellido' => 'required|string',
                'ci' => 'required|string',
            ]);
            
            \Log::info('Validación inicial pasada, creando cuenta');

            // Crear cuenta
            $cuenta = Cuenta::create([
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'tipo_usuario' => $validatedData['tipo_usuario']
            ]);
            
            \Log::info('Cuenta creada con ID: ' . $cuenta->id);

            // Crear perfil según tipo de usuario
            if ($validatedData['tipo_usuario'] === 'estudiante') {
                $estudianteData = $request->validate([
                    'fecha_nacimiento' => 'required|date',
                    'curso' => 'required|integer',
                    'colegio_id' => 'nullable|exists:colegios,id',
                    'tutor_id' => 'nullable|exists:tutores,id',
                    'celular' => 'nullable|string',
                    'nombre_tutor' => 'required|string',
                    'apellido_tutor' => 'required|string',
                    'email_tutor' => 'required|email',
                    'celular_tutor' => 'nullable|string',
                ]);
                
                \Log::info('Datos de estudiante validados, creando perfil de estudiante', [
                    'data' => $estudianteData
                ]);

                $estudiante = Estudiante::create([
                    'cuenta_id' => $cuenta->id,
                    'nombre' => $validatedData['nombre'],
                    'apellido' => $validatedData['apellido'],
                    'ci' => $validatedData['ci'],
                    'fecha_nacimiento' => $estudianteData['fecha_nacimiento'],
                    'curso' => $estudianteData['curso'],
                    'colegio_id' => $estudianteData['colegio_id'] ?? null,
                    'tutor_id' => $estudianteData['tutor_id'] ?? null,
                ]);
                
                \Log::info('Estudiante creado con ID: ' . $estudiante->id);

                return response()->json([
                    'mensaje' => 'Estudiante registrado correctamente',
                    'cuenta' => $cuenta,
                    'estudiante' => $estudiante
                ], 201);
            } elseif ($validatedData['tipo_usuario'] === 'tutor') {
                $tutorData = $request->validate([
                    'telefono' => 'required|string',
                    'colegio_id' => 'nullable|exists:colegios,id',
                ]);
                
                \Log::info('Datos de tutor validados, creando perfil de tutor', [
                    'data' => $tutorData
                ]);

                $tutor = Tutor::create([
                    'cuenta_id' => $cuenta->id,
                    'nombre' => $validatedData['nombre'],
                    'apellido' => $validatedData['apellido'],
                    'ci' => $validatedData['ci'],
                    'telefono' => $tutorData['telefono'],
                    'colegio_id' => $tutorData['colegio_id'] ?? null,
                ]);
                
                \Log::info('Tutor creado con ID: ' . $tutor->id);

                return response()->json([
                    'mensaje' => 'Tutor registrado correctamente',
                    'cuenta' => $cuenta,
                    'tutor' => $tutor
                ], 201);
            }
            
            \Log::info('Usuario administrativo registrado');

            return response()->json([
                'mensaje' => 'Usuario registrado correctamente',
                'cuenta' => $cuenta
            ], 201);
            
        } catch (ValidationException $e) {
            \Log::error('Error de validación en registro', [
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error al registrar usuario', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'mensaje' => 'Error al registrar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $cuenta = Cuenta::where('email', $request->email)->first();

            if (!$cuenta || !Hash::check($request->password, $cuenta->password)) {
                return response()->json([
                    'mensaje' => 'Credenciales incorrectas'
                ], 401);
            }

            // Obtener datos adicionales según el tipo de usuario
            $userData = null;
            if ($cuenta->tipo_usuario === 'estudiante') {
                $userData = Estudiante::where('cuenta_id', $cuenta->id)->first();
            } elseif ($cuenta->tipo_usuario === 'tutor') {
                $userData = Tutor::where('cuenta_id', $cuenta->id)->first();
            }

            return response()->json([
                'mensaje' => 'Inicio de sesión exitoso',
                'cuenta' => $cuenta,
                'perfil' => $userData
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cerrar sesión (solo para autenticación con tokens)
     */
    public function logout(Request $request)
    {
        // Aquí podríamos invalidar tokens o marcar cookies como expiradas
        // Si se usa Laravel Sanctum o Passport para autenticación por tokens
        
        // Limpiamos la sesión HTTP (si está en uso)
        if ($request->session()->has('cuenta_id')) {
            $request->session()->forget('cuenta_id');
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        
        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente'
        ]);
    }
}
