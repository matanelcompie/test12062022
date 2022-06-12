<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        
	    <style  type="text/css">
        @media print {
            html,body{height:100%;width:100%;margin:0;padding:0;}
                @page {
                    size: A4 landscape;
                    max-height:100%;
                    max-width:100%;
                    margin: 0mm 0mm 0mm 0mm; /*this affects the margin in the printer settings */
                }
            }
            img {
                width: 100%;
                height: 100%;
                top:0;
            }
            b {
                font-family: "Assistant", sans-serif;
                min-width: 15vw;
                position: absolute;
                font-size: 2vh;
            }
            p{
                margin-top: 0;
                margin-bottom: 1vh;
            }
            .title{
                top: 16.8vh;
                right: 38vw;
                position: absolute;
                font-size: 2.8vh;
            }
            .date {
                top: 20vh;
                right: 65vw;
                position: absolute;                
            }
            .hebrew_date {
                top: 20vh;
                right: 75vw;
                position: absolute;
            }
            .city_name {
                top: 20vh;
                right: 47vh;
                position: absolute;
            }
            /* Admin data */
            .admin-data-box {
                top: 34vh;
                right: 5vw;
                position: absolute;
            }
            .personal_identity_num{
                margin-right: 3.2vh;  
            }
            .admin_first_name{
                right: 6vh;
            }
            .admin_last_name{
                right: 30vw;
            }
            .admin_personal_identity {
                direction: ltr;
                top: 1.4vh;
                right: 35.5vw;
                min-width : 40vw;
            }
            .admin_role_description{
                top: 6.5vh;
                right: -2vw;
                min-width: 40vh;
            }
            .admin_shass_name{
                top: 9.5vh;
                right: 10.5vw;
                min-width: 15vh;
            }
            .admin_shass_nick{
                top: 9.5vh;
                right: 39vh;
            }
            /*Role data*/
            .role-data-box {
                top: 49vh;
                right: 5vw;
                position: absolute;
            }
            .first_name{
                right: 10vw;
            }
            .last_name{
                right: 40vw;
            }
            .personal_identity {
                direction: ltr;
                top: -1.8vh;
                right: 51.5vw;
                min-width : 40vw;
            }
            .address {
                top: 5vh;
                right: 13vw;
                min-width : 40vw;
            }
            .cities_and_ballots_address {
                top: 16vh;
                right: 0vh;
                min-width: 65vh;
            }


        </style>
    </head>
    <body>
        <div>
        <img src='{{asset("Images/appointment_letters/$ballot_role.jpg")}}'>
        <b class="title" style="top:{{$margin_from_top}}16.8vh"> ועדת הבחירות האזורית אזור {{$regional_committees_name}}</b>
        <b class="date" style="top:{{$margin_from_top}}20vh">{{$date}}</b>
        <b class="hebrew_date" style="top:{{$margin_from_top}}20vh">{{$hebrew_date}}</b>
        <b class="city_name" style="top:{{$margin_from_top}}20vh">{{$cluster_city_name}}</b>
        <div class="admin-data-box" style="top:{{$margin_from_top}}34vh">
            <b class="admin_first_name">משה</b>
            <b class="admin_last_name">ארבל</b>
            <b class="admin_personal_identity">
                <?php $adminIdentity = '065970022' ?>
                @for($i=0; $i <= 8; $i++ )
                   <span class="personal_identity_num"> {{$adminIdentity[$i]}} </span>
                @endfor
            </b>
            <b class="admin_role_description">מרכז ארצי של רשימת המועמדים לכנסת ה-21</b>
            <b class="admin_shass_name">סיעת שס</b>
            <b class="admin_shass_nick">שס</b>
        </div>
        <div class="role-data-box" style="top:{{$margin_from_top}}49vh">
            <b class="first_name">{{$first_name}}</b>
            <b class="last_name">{{$last_name}}</b>
            <b class="personal_identity">
                 @for($i=0; $i <= 8; $i++ )
                   <span class="personal_identity_num">{{ $personal_identity[$i] }} </span>
                @endfor
            </b>
            <b class="address">{{$city_name}} @if($street_name), {{$street_name}} {{$house}} @endif</b>
            <b class="cities_and_ballots_address">
                @foreach($cities_and_ballots_address as $ballot_details_row)
                <p> קלפי {{ $ballot_details_row }} </p>
                @endforeach
            </b>
        </div>
        </div>
        <script>
            window.print();
        </script>
    </body>
</html>
