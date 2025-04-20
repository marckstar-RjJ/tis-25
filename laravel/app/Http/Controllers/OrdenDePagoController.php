<?php

namespace App\Http\Controllers;

use App\Models\OrdenDePago;
use App\Models\SolicitudDeInscripcion;
use App\Models\Area;
use App\Models\AreasInscrita;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use PDF;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class OrdenDePagoController extends Controller
{
    /**
     * Crear una nueva orden de pago para inscripción de estudiante
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function crearOrdenPago(Request $request)
    {
        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'id_estudiante' => 'required|exists:mydb.Persona,idPersona',
            'id_usuario' => 'required|exists:mydb.Cuenta,idCuenta',
            'areas' => 'required|array|min:1|max:2',
            'areas.*' => 'exists:mydb.Area,idArea',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que no se seleccionen más de 2 áreas
        if (count($request->areas) > 2) {
            return response()->json([
                'success' => false,
                'message' => 'Solo puede seleccionar un máximo de 2 áreas'
            ], 422);
        }

        // Iniciar transacción
        DB::beginTransaction();

        try {
            // Calcular monto total (16 BOB por área)
            $costo_por_area = 16;
            $monto_total = count($request->areas) * $costo_por_area;

            // Crear orden de pago
            $orden = new OrdenDePago();
            $orden->idUsuarioSolicitante = $request->id_usuario;
            $orden->fechaCreacion = now();
            $orden->montoTotal = $monto_total;
            $orden->moneda = 'BOB';
            $orden->estado = OrdenDePago::ESTADO_PENDIENTE;
            $orden->fechaExpiracion = now()->addHours(48); // Expira en 48 horas
            $orden->save();

            // Crear solicitud de inscripción
            $solicitud = new SolicitudDeInscripcion();
            $solicitud->idEstudiante = $request->id_estudiante;
            $solicitud->idOrdenPago = $orden->idOrdenDePago;
            $solicitud->fechaSolicitud = now();
            $solicitud->estado = 'Pendiente';
            $solicitud->save();

            // Registrar áreas seleccionadas
            foreach ($request->areas as $id_area) {
                $areaInscrita = new AreasInscrita();
                $areaInscrita->idSolicitud = $solicitud->idSolicitudDeInscripcion;
                $areaInscrita->idArea = $id_area;
                $areaInscrita->save();
            }

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden de pago creada correctamente',
                'orden' => [
                    'id' => $orden->idOrdenDePago,
                    'monto' => $monto_total,
                    'fecha_expiracion' => $orden->fechaExpiracion->format('Y-m-d H:i:s')
                ]
            ], 201);

        } catch (\Exception $e) {
            // Revertir transacción en caso de error
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden de pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Generar nueva orden de pago
    public function generarOrden(Request $request)
    {
        $request->validate([
            'idUsuarioSolicitante' => 'required|exists:mydb.Cuenta,idCuenta',
            'idParticipante' => 'required|exists:mydb.Persona,idPersona',
            'idConvocatoria' => 'required|exists:mydb.Convocatoria,idConvocatoria',
            'idColegio' => 'required|exists:mydb.UnidadEducativa,idUnidadEducativa',
            'nivel' => 'required|string',
            'areas' => 'required|array|min:1|max:2',
            'areas.*' => 'exists:mydb.Areas,idAreas',
        ]);

        DB::beginTransaction();
        
        try {
            // Calcular monto total
            $areas = Area::whereIn('idAreas', $request->areas)->get();
            $montoTotal = $areas->sum('costoArea');
            
            // Crear orden de pago
            $orden = OrdenDePago::create([
                'idUsuarioSolicitante' => $request->idUsuarioSolicitante,
                'fechaCreacion' => now()->format('Y-m-d'),
                'montoTotal' => $montoTotal,
                'moneda' => 'BOB',
                'estado' => 'Pendiente',
                'fechaExpiracion' => now()->addHours(48)
            ]);
            
            // Crear solicitud de inscripción
            $solicitud = SolicitudDeInscripcion::create([
                'idConvocatoria' => $request->idConvocatoria,
                'idParticipante' => $request->idParticipante,
                'idCuentaResponsable' => $request->idUsuarioSolicitante,
                'fechaInscripcion' => now()->format('Y-m-d'),
                'idOrdenPago' => $orden->idOrdenDePago,
                'estado' => 'Pendiente',
                'idColegio' => $request->idColegio,
                'nivel' => $request->nivel
            ]);
            
            // Registrar áreas inscritas
            foreach ($request->areas as $areaId) {
                AreasInscrita::create([
                    'idInscripcion' => $solicitud->idInscripcion,
                    'idAreas' => $areaId
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'orden_id' => $orden->idOrdenDePago,
                'message' => 'Orden de pago generada correctamente'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la orden de pago: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Generar PDF de la orden de pago
    public function generarPDF($idOrden)
    {
        $orden = OrdenDePago::findOrFail($idOrden);
        $solicitud = SolicitudDeInscripcion::where('idOrdenPago', $idOrden)->first();
        
        if (!$solicitud) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }
        
        $estudiante = Persona::findOrFail($solicitud->idParticipante);
        $areasInscritas = Area::join('mydb.AreasInscritas', 'mydb.Areas.idAreas', '=', 'mydb.AreasInscritas.idAreas')
            ->where('mydb.AreasInscritas.idInscripcion', $solicitud->idInscripcion)
            ->get(['mydb.Areas.nombreArea', 'mydb.Areas.costoArea']);
            
        // Generar código QR con el ID de la orden
        $qrcode = base64_encode(QrCode::format('png')
            ->size(200)
            ->generate('ORD-' . $idOrden));
            
        $data = [
            'orden' => $orden,
            'estudiante' => $estudiante,
            'areas' => $areasInscritas,
            'qrcode' => $qrcode,
            'referencia' => 'ORD-' . str_pad($idOrden, 6, '0', STR_PAD_LEFT)
        ];
        
        $pdf = PDF::loadView('pdfs.orden_pago', $data);
        
        return $pdf->download('orden_pago_' . $idOrden . '.pdf');
    }
    
    // Listar órdenes para el administrador
    public function listarOrdenes(Request $request)
    {
        $query = OrdenDePago::with(['usuarioSolicitante.persona', 'solicitudesInscripcion.participante']);
        
        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaCreacion', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaCreacion', '<=', $request->fecha_hasta);
        }
        
        $ordenes = $query->orderBy('fechaCreacion', 'desc')->paginate(10);
        
        return response()->json($ordenes);
    }
    
    // Aprobar pago de una orden
    public function aprobarPago(Request $request, $idOrden)
    {
        $request->validate([
            'referenciaPago' => 'required|string|max:45|unique:mydb.OrdenDePago,referenciaPago,' . $idOrden . ',idOrdenDePago'
        ]);
        
        $orden = OrdenDePago::findOrFail($idOrden);
        
        if ($orden->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden aprobar órdenes con estado Pendiente'
            ], 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Actualizar la orden
            $orden->update([
                'estado' => 'Pagada',
                'fechaPago' => now(),
                'referenciaPago' => $request->referenciaPago
            ]);
            
            // Actualizar el estado de la solicitud
            SolicitudDeInscripcion::where('idOrdenPago', $idOrden)
                ->update(['estado' => 'Confirmada']);
                
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Pago aprobado correctamente'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al aprobar el pago: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Rechazar una orden de pago
    public function rechazarPago($idOrden)
    {
        $orden = OrdenDePago::findOrFail($idOrden);
        
        if ($orden->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden rechazar órdenes con estado Pendiente'
            ], 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Actualizar la orden
            $orden->update([
                'estado' => 'Cancelada'
            ]);
            
            // Actualizar el estado de la solicitud
            SolicitudDeInscripcion::where('idOrdenPago', $idOrden)
                ->update(['estado' => 'Cancelada']);
                
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Orden rechazada correctamente'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al rechazar la orden: ' . $e->getMessage()
            ], 500);
        }
    }
}
