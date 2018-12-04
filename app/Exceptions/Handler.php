<?php
/**
 * Created by Lumen.
 * User: Lumen
 * Date: 17/9/21
 * Time: 上午9:02
 */
namespace App\Exceptions;

use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * 自定义顶级异常处理器[当某些异常没有被捕获的时候,是由顶级异常处理器进行处理的]
 * @author sam.shan  <sam.shan@ruis-ims.cn>
 */
class Handler extends ExceptionHandler
{
    /**
     * 包含不需要被记录的异常类型。
     * 默认情况下，由 404 错误导致的异常结果并不会被记录到日志文件。
     * 你可以根据你的需求增加其它异常类型到这个数组中。
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];



    /**
     * 方法用来记录异常或将它们发送到像是 BugSnag 的外部服务上。
     * 默认情况下，当异常被记录时，report 方法只是简单的发送异常到基类，当然你也可以随意的来记录这些异常。
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $e
     * @return void
     */
    public function report(Exception $e)
    {
        parent::report($e);
    }

    /**
     * 将指定的异常转换成 HTTP 响应再发送到浏览器。
     * 默认情况下，异常会被发送到基类并帮你生成响应。但你可以随意检查异常类型或返回自定义的响应
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $e
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\Response|\Laravel\Lumen\Http\ResponseFactory
     * @throws ApiException
     */
    public function render($request, Exception $e)
    {

        //处理自定义的APIException异常
        if($e instanceof ApiException) {
            $response=get_api_response($e->getCode(),$e->getMessage());
            return  response()->json($response);
        }else if($e instanceof NotFoundHttpException){
            if($request->ajax() || is_postman())  TEA('414');
            return response(view('error.404'));
             //return redirect('error/404');
        }else if($e instanceof ApiParamException){
            $response = get_api_exception_response($e->getMessage());
            return response()->json($response);
        }else if ($e instanceof ApiSapException) {
            $response=get_api_sap_exception_response($e->getCode(),$e->getMessage());
            return  response()->json($response);
        }
        return parent::render($request, $e);
    }
}

