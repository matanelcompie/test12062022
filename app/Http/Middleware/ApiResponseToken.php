<?php

namespace App\Http\Middleware;

use Closure;
use \Illuminate\Routing\Route;
use Illuminate\Support\Facades\Auth;

class ApiResponseToken
{
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Closure  $next
   * @return mixed
   */
  public function handle($request, Closure $next)
  {
    $response =  $next($request);
    if (Auth::guard('api')->token() != null) {
      $response->header(config('jwt.header'), Auth::guard('api')->token());
    }
    return $response;
  }
}
