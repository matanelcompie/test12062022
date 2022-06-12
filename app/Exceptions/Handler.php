<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

use App\Models\ApiError;
use App\Libraries\Helper;
use Auth;
use Barryvdh\Debugbar\Facade as Debugbar;
use Log;

class Handler extends ExceptionHandler
{
  /**
   * A list of the exception types that should not be reported.
   *
   * @var array
   */
  protected $dontReport = [
    \Illuminate\Auth\AuthenticationException::class,
    \Illuminate\Auth\Access\AuthorizationException::class,
    \Symfony\Component\HttpKernel\Exception\HttpException::class,
    \Illuminate\Database\Eloquent\ModelNotFoundException::class,
    \Illuminate\Session\TokenMismatchException::class,
    \Illuminate\Validation\ValidationException::class,
  ];

  /**
   * Report or log an exception.
   *
   * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
   *
   * @param  \Exception  $exception
   * @return void
   */
  public function report(Exception $exception)
  {
    Debugbar::addThrowable($exception->getMessage() . " " . $exception->getCode());
    parent::report($exception);
  }

  /**
   * Render an exception into an HTTP response.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Exception  $exception
   * @return \Illuminate\Http\Response
   */
  public function render($request, Exception $exception)
  {
    //set json error to true in .env to return system errors in json format
    $statusCode = method_exists($exception, 'getStatusCode') ?
      $exception->getStatusCode() :
      500;
    $errorMessage = $exception->getMessage();
    $errorTrace = $exception->getTraceAsString();
    $user = Auth::user();

    $apiError = new ApiError;
    $apiError->key = Helper::getNewTableKey('api_errors', 8, Helper::DIGIT);
    $apiError->user_id = ($user && $user->voter_id) ? $user->id : null;
    $apiError->external_user_id = ($user && !$user->voter_id) ? $user->id : null;
    $apiError->status_code = $statusCode;
    $apiError->message = $errorMessage;
    $apiError->trace = $errorTrace;
    $apiError->save();

    $jsonError = config('app.json_error');
    if ($jsonError) {
      $jsonOutput = app()->make("JsonOutput");
      $jsonOutput->setErrorCode(config('errors.system.SYSTEM_ERROR'));
      $jsonOutput->setErrorData(['system_code' => $apiError->key]);
      //$jsonOutput->setErrorMessage($returnErrorMessage, $statusCode);
      return $jsonOutput->returnJson();
    } else if ($exception instanceof \Predis\Connection\ConnectionException) {
      Debugbar::addMessage('Error connection redis', "end-check:redis-error");
      $jsonOutput = app()->make("JsonOutput");
      $jsonOutput->setErrorCode(config('errors.system.ERROR_REDIS_CONNECTION'));
      $jsonOutput->setErrorMessage('redis error connection');
      return   $jsonOutput->returnJson();
    } else {
      return parent::render($request, $exception);
    }
  }


  /**
   * Convert an authentication exception into an unauthenticated response.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Illuminate\Auth\AuthenticationException  $exception
   * @return \Illuminate\Http\Response
   */
  protected function unauthenticated($request, AuthenticationException $exception)
  {
    if ($request->expectsJson()) {
      return response()->json(['error' => 'Unauthenticated.'], 401);
    }

    return redirect()->guest('login');
  }
}
