<ul class="nav navbar-nav">
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">{{Lang::get('menu.elections')}}<strong class="caret"></strong></a>
        <ul class="dropdown-menu">
            <li>
                <a href="#">{{Lang::get('menu.voting_card')}}</a>
            </li>
            <li>
                <a href="#">{{Lang::get('menu.general_data_report')}}</a>
            </li>
            <li class="divider">
            </li>
            <li>
                <a href="#">{{Lang::get('menu.election_day')}}</a>
            </li>
        </ul>
    </li>
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">{{Lang::get('menu.applications')}}<strong class="caret"></strong></a>
        <ul class="dropdown-menu">
            <li>
                <a href="#">{{Lang::get('menu.dummy')}}</a>
            </li>
        </ul>
    </li>
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">{{Lang::get('menu.telemarketing')}}<strong class="caret"></strong></a>
        <ul class="dropdown-menu">
            <li>
                <a href="#">{{Lang::get('menu.dummy')}}</a>
            </li>
        </ul>
    </li>
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">{{Lang::get('menu.system')}}<strong class="caret"></strong></a>
        <ul class="dropdown-menu">
            <li>
                <a href="#">{{Lang::get('menu.lists')}}</a>
            </li>
            <li>
                <a href="#">{{Lang::get('menu.permissions')}}</a>
            </li>
        </ul>
    </li>
</ul>
<div class="col-sm-3 col-md-3">
    <form class="navbar-form" role="search">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="{{Lang::get('menu.search')}}" name="q">
            <div class="input-group-btn">
                <button class="btn btn-default" type="submit"><i>{{Lang::get('menu.search')}}</i></button>
            </div>
        </div>
    </form>
</div>
<ul class="nav navbar-nav navbar-left">
    <li class="dropdown">
        <a href="{{ url('/user/info') }}" class="dropdown-toggle glyphicon glyphicon-user" data-toggle="dropdown">{{  Auth::user()->name }}<strong class="caret"></strong></a>
        <ul class="dropdown-menu">
            <li><a href="{{ url('/user/info') }}">{{Lang::get('menu.private_area')}}</a></li>
            <li class="divider"></li>
            {{--<li><a href="#">{{Lang::get('menu.logout')}}</a></li>--}}
            <li>
                <a href="{{ url('/logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">{{Lang::get('menu.logout')}}</a>
                <form id="logout-form" action="{{ url('/logout') }}" method="POST" style="display: none;">
                    {{ csrf_field() }}
                </form>
            </li>
        </ul>
    </li>
</ul>