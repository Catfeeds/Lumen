
{{--当前菜单设置成只支持四级--}}
<div id="sidebar" class="sidebar responsive ace-save-state">
    <script type="text/javascript">
        try{ace.settings.loadState('sidebar')}catch(e){}
    </script>

    {{--nav-list--}}
    <ul class="nav nav-list">

        @if(!empty($sidebars))
            @foreach ($sidebars as $sidebar)
                {{--一级菜单--}}
            <li class="@if($sidebar['uri']==$uri) active   @elseif (in_array($uri,$sidebar['belong_to_uris']))  open active  @elseif (in_array($uri,$sidebar['descendants_uris'])) open  @else {{$sidebar['class']}} @endif">

                <a href="@if(!empty($sidebar['uri'])) {{url($sidebar['uri'])}} @else javascript:void(0); @endif" class="@if(!empty($sidebar['sub_menu'])) dropdown-toggle color-burn @else color-burn @endif">
                    <i class="menu-icon fa {{$sidebar['icon']}}"></i>

                    <span class="menu-text"> {{$sidebar['name']}} </span>
                    @if(!empty($sidebar['sub_menu']))
                    <b class="arrow fa fa-angle-down"></b>
                    @endif
                </a>
                <b class="arrow"></b>
                {{--如果有二级菜单--}}
                @if(!empty($sidebar['sub_menu']))
                    <ul class="submenu">
                        @foreach ($sidebar['sub_menu'] as $sidebar2)
                            <li class="@if($sidebar2['uri']==$uri) active   @elseif (in_array($uri,$sidebar2['belong_to_uris']))  open active  @elseif (in_array($uri,$sidebar2['descendants_uris'])) open @else {{$sidebar2['class']}} @endif">
                                <a href="@if(!empty($sidebar2['uri'])) {{url($sidebar2['uri'])}} @else javascript:void(0); @endif" class="@if(!empty($sidebar2['sub_menu'])) dropdown-toggle color-burn @else color-burn @endif">
                                    <i class="menu-icon fa {{$sidebar2['icon']}}"></i>{{$sidebar2['name']}}
                                    @if(!empty($sidebar2['sub_menu']))
                                        <b class="arrow fa fa-angle-down"></b>
                                    @endif
                                </a>
                                <b class="arrow"></b>
                                {{--如果有三级菜单--}}
                                @if(!empty($sidebar2['sub_menu']))
                                    <ul class="submenu">
                                        @foreach ($sidebar2['sub_menu'] as $sidebar3)
                                        <li class="@if($sidebar3['uri']==$uri) active @elseif (in_array($uri,$sidebar3['belong_to_uris']))  open active  @elseif (in_array($uri,$sidebar3['descendants_uris'])) open @else {{$sidebar3['class']}} @endif">
                                            <a href="@if(!empty($sidebar3['uri'])) {{url($sidebar3['uri'])}} @else javascript:void(0); @endif" class="@if(!empty($sidebar3['sub_menu'])) dropdown-toggle color-burn @else color-burn @endif">
                                                <i class="menu-icon fa {{$sidebar3['icon']}}"></i>{{$sidebar3['name']}}
                                                @if(!empty($sidebar3['sub_menu']))
                                                    <b class="arrow fa fa-angle-down"></b>
                                                @endif
                                            </a>
                                            <b class="arrow"></b>
                                            {{--如果有四级菜单--}}
                                            @if(!empty($sidebar3['sub_menu']))
                                                <ul class="submenu">
                                                    @foreach ($sidebar3['sub_menu'] as $sidebar4)
                                                    <li class="@if($sidebar4['uri']==$uri) active  @endif">
                                                        <a href="@if(!empty($sidebar4['uri'])) {{url($sidebar4['uri'])}} @else javascript:void(0); @endif">
                                                            <i class="menu-icon fa {{$sidebar4['icon']}}"></i>{{$sidebar4['name']}}
                                                        </a>
                                                        <b class="arrow"></b>
                                                    </li>
                                                    @endforeach
                                                </ul>
                                            @endif
                                        </li>
                                        @endforeach
                                    </ul>
                                @endif
                            </li>
                        @endforeach
                    </ul>
                @endif
            </li>
        @endforeach
    @endif
    </ul>

    <!-- 默认是收起来的，这里可以控制收关 -->
    <div class="sidebar-toggle sidebar-collapse" id="sidebar-collapse">
        <i id="sidebar-toggle-icon" class="ace-icon fa fa-angle-double-left ace-save-state" data-icon1="ace-icon fa fa-angle-double-left" data-icon2="ace-icon fa fa-angle-double-right"></i>
    </div>
    <script src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
    <script>

    </script>
</div>


