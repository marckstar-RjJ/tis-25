<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CsrfController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sanctum/csrf-cookie', [CsrfController::class, 'show']);
