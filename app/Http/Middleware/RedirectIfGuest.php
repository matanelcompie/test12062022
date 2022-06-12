<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class RedirectIfGuest {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure                 $next
     * @param  string|null              $guard
     *
     * @return mixed
     */
    public function handle ( $request, Closure $next, $guard = null ) {

        if ( !Auth::guard( $guard )->check() ) {
            $originalRoute = $request->path();
            $request->session()->put( 'original_url', $originalRoute );

            return redirect( 'login' );
        }

        return $next( $request );
    }
}
