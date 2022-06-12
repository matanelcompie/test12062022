@foreach($all_geo_roles as $i => $geo_role_data)
    <div class="shas_hiluf_yor" style="overflow: hidden; position: relative; background-color: white; width:910px; height: 1255px;margin: 0px auto;">

    <!-- Begin shared CSS values -->
    <style type="text/css">
	@media  print {
		@page  {
			margin-left: 0.4 inch;
			margin-right: 0.4 inch;
			margin-top: 0;
			margin-bottom: 0;
		}		
		div {
			page-break-inside: avoid;
		}
	}
    </style>
    </head>

    <!-- Begin shared CSS values -->
    <style class="shared-css" type="text/css" >
    body {  zoom: 100% ;}
    @media  print {
        @page  {
            size: A4 portrait;
            max-height:100%;
            max-width:100%;
            margin: 0mm 0mm 0mm 0mm; /* this affects the margin in the printer settings */
        }
    }

    </style>
    <!-- End shared CSS values -->


    <!-- Begin inline CSS -->
    <style type="text/css" >

    .shas_hiluf_yor .t {
        z-index: 2;
        position: absolute;
        white-space: pre;
        overflow: visible;
    }
    .shas_hiluf_yor .t3_2 {
        right: 690px;
        top: 273px;
    }
    .shas_hiluf_yor .t4_2 {
        right: 532px;
        top: 271px;
    }
    .shas_hiluf_yor .t5_2 {
        right: 350px;
        top: 272px;
    }

    .shas_hiluf_yor .ta_2 {
        right: 711px;
        top: 357px;
    }
    .shas_hiluf_yor .tb_2{
        right: 544px;
        top: 357px;
    }
    .shas_hiluf_yor .tc_2 {
        right: 361px;
        top: 357px;
    }

    .shas_hiluf_yor .th_2 {
        right: 707px;
        top: 442px;
    }
    .shas_hiluf_yor .th_3 {
        right: 416px;
        top: 481px;
    }
    .shas_hiluf_yor .ti_2 {
        right: 366px;
        top: 444px;
    }
    .shas_hiluf_yor .s1{
        word-spacing: 1px;
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
        font-weight: 700;
        font-size: 18px;
    }

    .shas_hiluf_yor .s2{
        FONT-FAMILY: Helvetica, Arial, sans-serif;
        color: rgb(0,0,0);
        FONT-WEIGHT: bold;
        font-size: 18px;
    }

    .shas_hiluf_yor .s3{
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
        font-size: 18px;
    }
    .shas_hiluf_yor .s2.tr_2 {
        right: 150px;
        bottom: 473px;
        font-size: 18px;
    }
    .shas_hiluf_yor .s4{
        font-size: 20px;
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
        font-weight: 700;
    }

    .shas_hiluf_yor .s5{
        font-size: 24px;
        FONT-FAMILY: Helvetica, Arial, sans-serif;
        color: rgb(0,0,0);
        FONT-WEIGHT: bold;
    }

    .shas_hiluf_yor .s6{
        font-size: 24px;
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
        font-weight: 700;
    }

    .shas_hiluf_yor .s7{
        font-size: 30px;
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
        font-weight: 700;
    }

    .shas_hiluf_yor .s8{
        font-size: 24px;
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
    }

    .shas_hiluf_yor .s9{
            font-size: 14px;
        FONT-FAMILY: Helvetica, Arial, sans-serif;
        color: rgb(0,0,0);
        FONT-WEIGHT: bold;
    }

    .shas_hiluf_yor .sa{
            font-size: 14px;
        FONT-FAMILY: Arial;
        color: rgb(0,0,0);
        font-weight: 700;
    }
    .shas_hiluf_yor .prev_leader_details{
        right: 355px;
        top: 564px;
    }
    .shas_hiluf_yor .prev_leader_details .first_name{
        right: 105px;
        position: relative;
    }
    .shas_hiluf_yor .prev_leader_details .last_name{
        right: 230px;
        position: relative;
    }

    </style>
    <!-- End inline CSS -->


    <!-- Begin page background -->
    <div class="pg2Overlay" style="width:100%; height:100%; position:absolute; z-index:1; background-color:rgba(0,0,0,0); -webkit-user-select: none;"></div>
        <img src="{{$publicLocation}}/ballot_leader_page1_new.jpg" style="width:100%; height:100%; position:absolute; z-index:1; background-color:rgba(0,0,0,0); -webkit-user-select: none;">
        <!-- <div class="pg2 pdf2" style="-webkit-user-select: none;"><object width="920" height="1300" data="{{$publicLocation}}/ballot_leader_base_4.svg" type="image/svg+xml" style="width:920px; height:1300px; -moz-transform:scale(1); z-index: 0;"></object></div> -->
        <!-- End page background -->
        <div class="t3_2 t s2">{{$personal_identity}}</div>
        <div class="t4_2 t s1">{{$last_name}}</div>
        <div class="t5_2 t s1">{{$first_name}}</div>

        <div class="ta_2 t s1">{{$street_name}}</div>
        <div class="tb_2 t s1">רח'</div>
        <div class="tc_2 t s1">{{$city_name}}</div>

        <div class="th_2 t s1">{{$geo_role_data['cluster_city_name']}}</div>
        <div class="th_3 t s1"><span> {{$geo_role_data['cluster_name']}} </span><span>כתובת:</span><span>{{$geo_role_data['ballot_address']}}</span></div>
        <div class="ti_2 t s2">{{$geo_role_data['ballots']}}</div>
        <div class="prev_leader_details t s1">{{$geo_role_data['previous_leader_personal_identity']}} <span class="first_name">{{$geo_role_data['previous_leader_first_name']}}</span> <span class="last_name">{{$geo_role_data['previous_leader_last_name']}}</span> </div>
        <div class="tr_2 t s2">{{$date}}</div>
        <!-- End text definitions -->
    </div>

    <div height="0" style="page-break-after: always;height:0;"> &nbsp;</div>
    <div height="0" style="page-break-before: always;height:0;">&nbsp;</div>

<div class="p2 shas_hiluf_yor" style="overflow: hidden; position: relative; background-color: white; width: 916px; height: 1294px;margin: 0 auto;">


   
    <!-- Begin inline CSS -->
    <style type="text/css" >
    .shas_hiluf_yor.p2 .t3_2{    
        right: 607px;
        bottom: 1007px;
        word-spacing: 2px;
        font-size: 1.2em;
        font-family: Arial;
        color: #FF0000;
        line-height: 1.528378em;
        max-width: 242px;
        white-space: normal;
        top: unset;
        }
    .shas_hiluf_yor.p2 .t4_2{
        right: 690px;
        bottom:910px;
        font-size: 1em;
        font-family: Arial;
        color: #FF0000;
        line-height: 1.128378em;
        }
    .shas_hiluf_yor.p2 .t5_2{
            right: 607px;
            bottom:990px;
            word-spacing:2px;
            font-size: 1.2em;
            font-family: Arial;
            color: #FF0000;
            line-height: 1.128378em;
            top: unset;
        }
    .shas_hiluf_yor.p2 .s3.t6_2{
        right: 100px;
        bottom: 893px;
        word-spacing:2.4px;
        border-bottom: 1px solid #000;
        font-size: 1.32em;
    }
    .shas_hiluf_yor.p2 .t7_2{left:319px;bottom:811px;}
    .shas_hiluf_yor.p2 .t8_2{right: 490px;bottom: 848px;word-spacing:3.1px;} 
    .shas_hiluf_yor.p2 .t9_2{
        right:100px;
        bottom: 855px;
        word-spacing:2.4px;
        top: unset;
        }
    .shas_hiluf_yor.p2 .ta_2{
            right: 490px;
            bottom: 781px;
            top: unset;
        }
    .shas_hiluf_yor.p2 .tb_2{
            right:100px;
            bottom: 787px;
            word-spacing:2.4px;
            top: unset;
    }
    .shas_hiluf_yor.p2 .tc_2{
        right: 490px;
        bottom: 716px;
        top: unset;
    }
    .shas_hiluf_yor.p2 .td_2{right:100px;bottom: 723px;word-spacing:2.4px;}
    .shas_hiluf_yor.p2 .te_2{right:500px;bottom: 650px;word-spacing:2.4px;}
    .shas_hiluf_yor.p2 .tf_2{right:100px;bottom: 658px;word-spacing:2.4px;}
    .shas_hiluf_yor.p2 .th_2{
        right: 100px;
        bottom: 592px;
        top: unset;
    }
    .shas_hiluf_yor.p2 .ti_2{
        right: 100px;
        bottom: 532px;
        top: unset;
    }
    .shas_hiluf_yor.p2 .tg_2{
        right: 500px;
        bottom: 525px;
    }
    .shas_hiluf_yor.p2 .tk_2{
        right: 500px;
        bottom: 492px;
    }
    .shas_hiluf_yor .bottom-text{
        right: 0;
        bottom: 133px;
    }
    .shas_hiluf_yor.p2  .s1{
        font-family: Arial;
        font-size: 1.17em;
    }

    .shas_hiluf_yor.p2 .s2{
        font-family: Arial;
        color: rgb(0,0,0);
        font-size: 1.17em;
    }

    .shas_hiluf_yor.p2  .s3{
        font-size: 1.17em;
        font-family: Arial;
        font-weight: 700;
        color: rgb(0,0,0);
    }

    .shas_hiluf_yor.p2  .s4{
        color: rgb(0,0,0);
        font-size: 1.7em;
        font-family: "Arial";
        line-height: 1.124623em;
        font-weight: 700;
    }

    .shas_hiluf_yor.p2  .s5{
        color: rgb(0,0,0);
        font-size: 1.7em;
        font-family: "Arial";
        line-height: 1.124623em;
        font-weight: 700;
    }

    .shas_hiluf_yor.p2  .s6{
        color: rgb(0,0,0);
        font-size: 1.27em;
        font-family: "Arial";
        line-height: 1.124623em;
        font-weight: 100;
    }

    </style>
    <!-- End inline CSS -->

    <!-- Begin page background -->
    <div class="pg2Overlay" style="width:100%; height:100%; position:absolute; z-index:1; background-color:rgba(0,0,0,0); -webkit-user-select: none;"></div>
    <img src="{{$publicLocation}}/ballot_leader_page2.png" style="width:100%; height:100%; position:absolute; z-index:1; background-color:rgba(0,0,0,0); -webkit-user-select: none;">

    <!-- <div class="pg2 pdf2" style="-webkit-user-select: none;"><object width="909" height="1286" data="{{$publicLocation}}/ballot_member_base_2.svg" type="image/svg+xml" style="width:909px; height:1286px; -moz-transform:scale(1); z-index: 0;margin: 0 auto;"></object></div> -->
    <!-- End page background -->
    <!-- Begin text definitions (Positioned/styled in CSS) -->
    <div id="main-div">
        <div class="t t3_2"> קלפי מס' {{$geo_role_data['ballots']}}, ב{{$geo_role_data['cluster_city_name']}}</div> 
        <div class="t t5_2">משמרת {{$geo_role_data['shift_number' ]}}</div>
        <div class="t s3 t6_2">נספח לאישור חילוף גברי עבור {{$first_name}} {{$last_name}}</div>
        <div class="t s5 t8_2">{{$geo_role_data['cluster_city_name']}} {{$geo_role_data['ballots']}}</div>
        <div class="t s6 t9_2"> עבור קלפי:</div>
        <div class="t s4 ta_2">{{$geo_role_data['ballot_iron_number']}}</div>
        <div class="t s6 tb_2">מספר ברזל:</div>
        <div class="t s4 tc_2">07:00</div>
        <div class="t s6 td_2">שעת פתיחת הקלפי:</div>
        <div class="t s4 te_2">{{$geo_role_data['shift_number']}}</div>
        <div class="t s6 tf_2">משמרת מתוכננת:</div>
        <div class="t s6 th_2">שעת התחלת משמרת:</div>
        <div class="t s6 ti_2">שעת סיום משמרת:</div>
        <div class="t s4 tg_2">סיום מילוי תפקידי</div>
        <div class="t s4 tk_2">ועדת הקלפי</div>
        <div class="t s4 bottom-text">
            שים לב! עם סיום עבודתך בוועדת הקלפי וודא כי הנך מקבל אישור
            על מילוי תפקידך ממזכיר ועדת הקלפי
        </div>
    </div>
    <!-- End text definitions -->
    </div>
@endforeach