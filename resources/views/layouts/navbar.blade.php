<div id="navbar" class="navbar navbar-default          ace-save-state">
    <div class="navbar-container ace-save-state" id="navbar-container">
        <button type="button" class="navbar-toggle menu-toggler pull-left" id="menu-toggler" data-target="#sidebar">
            <span class="sr-only">Toggle sidebar</span>

            <span class="icon-bar"></span>

            <span class="icon-bar"></span>

            <span class="icon-bar"></span>
        </button>

        <div class="navbar-header pull-left">
            <a href="/" class="navbar-brand">
                <small>
                    <img src="/statics/custom/img/newlogo.png"/>
                </small>
            </a>
        </div>

        <div class="navbar-buttons navbar-header pull-right" role="navigation" style="margin-right: -10px;">
            <ul class="nav ace-nav">
                {{--下载的进度条,暂时先去掉--}}
                {{--收到的系统消息--}}

                 {{--收到的邮件信息,暂时去掉,如果想要可以去模板中找--}}


                {{--用户头像部分--}}
                <li class="light-blue dropdown-modal">
                    <a data-toggle="dropdown" href="#" class="dropdown-toggle" style="padding: 0 5px;">
                        <img style="max-height: 40px;" class="nav-user-photo" src="{{ !empty(session('administrator')->header_photo)? '/storage/'.session('administrator')->header_photo : '/statics/custom/img/user_32x32.png' }}" alt="Jason's Photo" />
								<span class="user-info" style="vertical-align: middle;margin-top: -17px;">
									<small></small>
									 {{ !empty(session('administrator')->cn_name)? session('administrator')->cn_name : session('administrator')->name }}
								</span>

                        <i class="ace-icon fa fa-caret-down"></i>
                    </a>

                    <ul class="user-menu dropdown-menu-right dropdown-menu dropdown-yellow dropdown-caret dropdown-close">
                        <li>
                            <a href="{{url('CenterManagement/setting')}}">
                                <i class="ace-icon fa fa-cog"></i>
                                账号设置
                            </a>
                        </li>
                        <li>
                            <a href="{{url('CenterManagement/msg')}}">
                                <i class="ace-icon fa fa-bell"></i>
                                我的消息
                            </a>
                        </li>
                        <li>
                            <a href="{{url('CenterManagement/loginLog')}}">
                                <i class="ace-icon fa fa-wpforms"></i>
                                登陆日志
                            </a>
                        </li>
                        <li>
                            <a href="{{url('Version/versionList')}}">
                                <i class="ace-icon fa fa-paper-plane-o"></i>
                                系统版本
                            </a>
                        </li>
                        <li class="divider"></li>

                        <li>
                            <a href="{{url('AccountManagement/logout')}}">
                                <i class="ace-icon fa fa-power-off"></i>
                                退出
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div><!-- /.navbar-container -->
</div>