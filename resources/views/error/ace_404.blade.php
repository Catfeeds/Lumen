
{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="row">
        <div class="col-xs-12">
            <!-- PAGE CONTENT BEGINS -->

            <div class="error-container">
                <div class="well">
                    <h1 class="grey lighter smaller">
                      <span class="blue bigger-125">
                         <i class="ace-icon fa fa-sitemap"></i>
                         404
                      </span>
                        当前访问页不存在
                    </h1>
                    <hr />
                <div>




                    <div class="space"></div>

                    <div class="center">
                        <a href="javascript:history.back()" class="btn btn-grey" style="border: 0;margin-right: 10px;">
                            <i class="ace-icon fa fa-arrow-left"></i>
                            返回
                        </a>

                        <a href="/" class="btn btn-primary" style="border: 0">
                            <i class="ace-icon fa fa-tachometer"></i>
                            控制台
                        </a>
                    </div>
                </div>
            </div>

            <!-- PAGE CONTENT ENDS -->
        </div><!-- /.col -->
    </div><!-- /.row -->


@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
@endsection

