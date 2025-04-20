<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orden de Pago - Olimpiadas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            font-size: 14px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #004085;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #004085;
            margin-bottom: 5px;
            font-size: 24px;
        }
        .order-info {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f8f9fa;
        }
        .student-info {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f8f9fa;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .qr-container {
            text-align: center;
            margin: 20px 0;
        }
        .total {
            font-weight: bold;
            text-align: right;
            margin: 20px 0;
            font-size: 18px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 15px;
            border: 1px solid #ffeeba;
            border-radius: 5px;
            margin: 20px 0;
        }
        .instrucciones {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            margin: 20px 0;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 10px;
        }
        .id-container {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #004085;
        }
        .payment-info {
            background-color: #e2e3e5;
            color: #383d41;
            padding: 15px;
            border: 1px solid #d6d8db;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>ORDEN DE PAGO - OLIMPIADAS CIENTÍFICAS</h1>
        <p>Comprobante de inscripción y orden de pago</p>
    </div>
    
    <div class="id-container">
        <p>Orden N°: {{ $referencia }}</p>
    </div>
    
    <div class="order-info">
        <h3>Información de la Orden</h3>
        <p><strong>Fecha de Emisión:</strong> {{ $fechaEmision }}</p>
        <p><strong>Fecha Límite de Pago:</strong> {{ $fechaLimite }}</p>
        <p><strong>Estado:</strong> {{ $orden->estado }}</p>
        <p><strong>Moneda:</strong> {{ $orden->moneda }}</p>
    </div>
    
    <div class="student-info">
        <h3>Información del Estudiante</h3>
        <p><strong>Nombre Completo:</strong> {{ $estudiante->nombres }} {{ $estudiante->apellidos }}</p>
        <p><strong>CI:</strong> {{ $estudiante->Carnet }}</p>
    </div>
    
    <h3>Áreas Inscritas</h3>
    <table>
        <thead>
            <tr>
                <th>Área</th>
                <th>Costo ({{ $orden->moneda }})</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($areas as $area)
            <tr>
                <td>{{ $area->nombreArea }}</td>
                <td>{{ number_format($area->costo, 2) }} {{ $orden->moneda }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="total">
        <p>Total a Pagar: {{ number_format($orden->montoTotal, 2) }} {{ $orden->moneda }}</p>
    </div>
    
    <div class="payment-info">
        <h3>Información de Pago</h3>
        <p>Para realizar el pago, debe presentar este documento en cualquier agencia bancaria autorizada.</p>
        <p><strong>Cuenta:</strong> 1000-12345-678</p>
        <p><strong>Entidad:</strong> Banco Nacional de Bolivia</p>
        <p><strong>Concepto:</strong> {{ $referencia }}</p>
    </div>
    
    <div class="qr-container">
        <img src="data:image/png;base64,{{ $qrcode }}" alt="QR Code">
        <p>Escanea este código para verificar la orden</p>
    </div>
    
    <div class="warning">
        <p><strong>IMPORTANTE:</strong> Esta orden debe ser pagada antes de la fecha límite indicada o la inscripción será cancelada automáticamente.</p>
    </div>
    
    <div class="instrucciones">
        <h3>Instrucciones:</h3>
        <ol>
            <li>Presente este documento impreso en la entidad bancaria autorizada.</li>
            <li>Realice el pago por el monto total indicado.</li>
            <li>Conserve su comprobante de pago como respaldo.</li>
            <li>Una vez procesado el pago, la inscripción será confirmada automáticamente.</li>
        </ol>
    </div>
    
    <div class="footer">
        <p>Este documento es válido hasta: {{ $fechaLimite }}</p>
        <p>Olimpiadas Científicas Bolivia {{ date('Y') }}</p>
        <p>Para consultas: olimpiadas@ejemplo.com | Tel: 123-456-7890</p>
    </div>
</body>
</html>
