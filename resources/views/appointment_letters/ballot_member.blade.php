@foreach($all_geo_roles as $i => $geo_role_data)
    <div class="p1 shas_chaver" style="overflow: hidden; position: relative; background-color: white; margin: 0 auto; padding-top: 12px;  width: 899px; height: 1173px;">

    <!-- Begin shared CSS values -->
    <style class="shared-css" type="text/css" >
    body {  zoom: 136% ;}
    .shas_chaver .t {
        z-index: 2;
        position: absolute;
        white-space: pre;
        overflow: visible;
    }
    </style>
    <!-- End shared CSS values -->


    <!-- Begin inline CSS -->
    <style type="text/css" >
    .shas_chaver .p1, .shas_chaver .p2 {
        font-size: 18px;
    }
    .shas_chaver .t1_1{left:353px;bottom:1006px;word-spacing:2.4px;font-weight: 700; font-size: 1.27em}
    .shas_chaver .t13_1 {
    left: 368px;
    bottom: 975px;
    word-spacing: 2.4px;
    font-weight: 700;
    font-size: 1.27em;
}
    .shas_chaver .t2_1{left:219px;bottom:975px;}
    .shas_chaver .t3_1{left:268px;bottom:975px;}
    .shas_chaver .t4_1{left:309px;bottom:975px;word-spacing:2px;}
    .shas_chaver .t5_1{left:666px;bottom:975px;}
    .shas_chaver .t6_1{right: 50px;
    bottom: 891px;}
    .shas_chaver .t7_1{right: 50px;
    bottom: 869px;}
    .shas_chaver .t8_1{right:379px;bottom:809px;width:370px;font-weight: 700;text-align:center;}
    .shas_chaver .t9_1{right: 67px;bottom:809px;width:345px;font-weight: 700;text-align:center;}
    .shas_chaver .ta_1{left:236px;bottom:782px;width: 195px;}
    .shas_chaver .tb_1{left: 559px;bottom:782px;width: 195px;}
    .shas_chaver .tc_1{left:292px;bottom:755px;word-spacing:2.4px;font-weight: 700;}
    .shas_chaver .td_1{left: 627px;bottom:755px;word-spacing:2.4px;font-weight: 700;}
    .shas_chaver .te_1{right: 354px;bottom: 694px;font-weight: 700;}
    .shas_chaver .tf_1{left: 397px;bottom:670px;width: 195px;}
    .shas_chaver .tg_1{left: 455px;bottom:647px;word-spacing:2.4px;font-weight: 700;}
    /* .shas_chaver .th_1{left:355px;bottom:566px;word-spacing:2px;} */
    /* .shas_chaver .ti_1{left:481px;bottom:566px;} */
    .shas_chaver .tj_1{right: 51px;
    bottom: 563px;}
    /* .shas_chaver .tk_1{left:400px;bottom:501px;} */
    .shas_chaver .tl_1{right: 51px;
    bottom: 527px;}
    .shas_chaver .tm_1{left:218px;bottom:456px;word-spacing:2px;}
    /* .shas_chaver .tn_1{left:656px;bottom:456px;} */
    .shas_chaver .to_1{right: 51px;
    bottom: 466px;}
    .shas_chaver .tp_1{right: 51px;
    bottom: 443px;}
    /* .shas_chaver .tq_1{left:434px;bottom:436px;} */
    .shas_chaver .tr_1{right: 41px;bottom:444px;word-spacing:2px;}
    .shas_chaver .ts_1{left:628px;bottom:445px;word-spacing:2px;}
    .shas_chaver .tt_1{right:221px;bottom:212px;}
    .shas_chaver .tu_1{right:207px;bottom:191px;word-spacing:2px;}
    .shas_chaver .tv_1{left: 266px;
        bottom: 174px;
        width: 139px;}
    .shas_chaver .tw_1{left: 570px;
        bottom: 174px;
        width: 139px;}
    .shas_chaver .tx_1{left:180px;bottom:137px;word-spacing:1.7px;}
    .shas_chaver .ty_1{left:195px;bottom:120px;word-spacing:1.7px;}
    .shas_chaver .tz_1{left:181px;bottom:103px;word-spacing:1.7px;}
    .shas_chaver .t10_1{left:206px;bottom:86px;word-spacing:1.7px;}
    .shas_chaver .t11_1{left:304px;bottom:69px;word-spacing:1.7px;}
    .shas_chaver .t12_1{left:627px;bottom:131px;}

    .shas_chaver .tv_1 hr, .shas_chaver .tw_1 hr {
        border-width: 0.5px;
    }
    .shas_chaver .s1_1{
        font-family: Arial;
        color: rgb(0,0,0);
        font-size: 1.17em;
    }

    .shas_chaver .s2_1 {
        font-family: Arial;
        color: rgb(0,0,0);
        font-size: 1.1em;
        color: #000000;
        line-height: 1.128378em;
        word-spacing: 1px;
    }
    .shas_chaver .s2_1 b{
        font-size: 22px;
    }
    .shas_chaver .s3_1{
        font-size: 1em;
        font-family: Arial;
        color: rgb(0,0,0);
        line-height: 1.128378em;
    }

    .shas_chaver .s4_1{
        font-family: Arial;
        color: rgb(0,0,0);
        font-size: 1.17em;
        font-weight: 700;
    }

    .shas_chaver .s5_1{
        font-size: 0.83em;
        font-family: Arial;
        color: #000000;
        line-height: 1.121562em;
    }
    .shas_chaver hr {
        margin: 0;
        border-color: #000;
    }
    </style>
    <!-- End inline CSS -->

    <!-- Begin page background -->
    <div class="pg1Overlay" style="width:100%; height:100%; position:absolute; z-index:1; background-color:rgba(0,0,0,0); -webkit-user-select: none;"></div>
    <div class="pg1 pdf1" style="-webkit-user-select: none;"><object width="920" height="1300" data="{{$publicLocation}}/ballot_member_base_1.svg" type="image/svg+xml" style="width:920px; height:1300px;-moz-transform:scale(1); z-index: 0;"><svg viewBox="0 0 920 1300" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
    </defs>
    </svg></object></div>
    <!-- End page background -->
    <!-- Begin text definitions (Positioned/styled in CSS) -->
    <?php $isBallotMemberRole =  $ballot_role == 'ballot_member' ?>
    <div class="t s1_1 t1_1">ועדת הבחירות האזורית כל הוועדות</div>
    <div class="t s1_1 t13_1">כתב מינוי ל{{$geo_role_data['ballot_box_role_appointment_letter_name']}} ועדת הקלפי </div>
    <div class="t s2_1 t6_1">בהתאם לסעיף 21(ה) לחוק הבחירות לכנסת [נוסח משולב], התשכ''ט-1969 (להלן: חוק הבחירות), אני</div>
    <div class="t s2_1 t7_1">ממנה בזאת את:</div>
    <div class="t s1_1 t8_1">{{$last_name}}</div>
    <div class="t s1_1 t9_1">{{$first_name}}</div>
    <div class="t s1_1 tc_1">שם משפחה</div>
    <div class="t s1_1 td_1">שם פרטי</div>
    <div class="t s4_1 te_1" style="text-align:center;">{{$personal_identity}}</div>
    <div class="t s1_1 tg_1">מספר זהות</div>
    <div class="t s1_1 ta_1"><hr></div>
    <div class="t s1_1 tb_1"><hr></div>
    <div class="t s1_1 tf_1"><hr></div>
    <div class="t s2_1 tj_1">לשמש כ{{$geo_role_data['ballot_box_role_appointment_letter_name']}} ועדת הקלפי בקלפי מספר {{$geo_role_data['ballots']}} ביישוב {{$geo_role_data['cluster_city_name']}}<br>מטעם סיעת <b>התאחדות הספרדים שומרי תורה</b></div>
    <div class="t s2_1 tl_1">מיקום הקלפי: {{$geo_role_data['cluster_name']}} כתובת:{{$geo_role_data['ballot_address']}}</div>
    <div class="t s2_1 to_1">בהתאם לסעיף 116יט לחוק הבחירות, נושא תעודה זו רשאי להצביע בקלפי בה הוא משמש כ{{$geo_role_data['ballot_box_role_appointment_letter_name']}} {{$isBallotMemberRole ? 'ועדת' : ''}}</div>
    <div class="t s2_1 tp_1"><span>{{ $isBallotMemberRole ? '' : 'ועדת'}}</span> הקלפי, אם עבד בקלפי לפחות 6 שעות רצופות במהלכן הייתה הקלפי פתוחה להצבעה.</div>
    <!-- <div class="t s2_1 tr_1"></div> -->
    <div class="t s3_1 tt_1">{{$date}}</div>
    <div class="t s2_1 tu_1">{{$hebrew_date}}</div>
    <div class="t s5_1 tv_1"><hr></div>
    <div class="t s5_1 tw_1"><hr></div>
    <div class="t s5_1 tx_1">* חתימה ב''כ הסיעה  / ממלא מקום ב''כ הסיעה / מרכז</div>
    <div class="t s5_1 ty_1">הסיעה בוועדה האזורית / ממלא מקום מרכז הסיעה</div>
    <div class="t s5_1 tz_1">בוועדה האזורית / מרכז ארצי מטעם הסיעה / מ''מ המרכז</div>
    <div class="t s5_1 t10_1">הארצי / הממונה על איוש קלפיות מטעם הסיעה</div>
    <div class="t s5_1 t12_1">תאריך</div>

    <!-- End text definitions -->
    </div>
    <div class="p2 shas_chaver" style="overflow: hidden; position: relative; background-color: white; width: 909px; height: 1286px;margin: 0 auto;padding-top: 20px;">

     <!-- Begin inline CSS -->
     <style type="text/css" >

.shas_chaver.p2 .t1_2{left:39px;bottom:931px;word-spacing:2px;}
.shas_chaver.p2 .t2_2{
    left: 353px;
    bottom: 1123px;
    word-spacing: 2.4px;
    font-size: 1.27em !important;
}
.shas_chaver.p2 .t3_2{
    right: 525px;
    bottom: 1052px;
    word-spacing: 2px;
    font-size: 1.2em;
    font-family: Arial;
    color: #FF0000;
    line-height: 1.128378em;
    /* max-width: 200px; */
    white-space: normal;
    }
.shas_chaver.p2 .t4_2{right: 690px;bottom:910px;font-size: 1em;
    font-family: Arial;
    color: #FF0000;
    line-height: 1.128378em;}
.shas_chaver.p2 .t5_2{
    right: 525px;
    bottom: 1029px;
    word-spacing: 2px;
    font-size: 1.2em;
    font-family: Arial;
    color: #FF0000;
    line-height: 1.128378em;
    }
.shas_chaver .t6_2{right: 53px;bottom: 927px;word-spacing:unset;border-bottom: 1px solid #000;}
.shas_chaver.p2 .s3.t6_2{
    right: 53px;
    bottom: 968px;
    word-spacing: unset;
    border-bottom: 1px solid #000;
    font-size: 1.23em;
}
.shas_chaver .t7_2{left:319px;bottom:811px;}
.shas_chaver.p2 .t8_2{
    right: 399px;
    bottom: 929px;
    word-spacing: 3.1px;
} 
.shas_chaver.p2 .t9_2{
    right:50px;
    bottom: 936px;
    word-spacing:2.4px;
    top: unset;
    }
.shas_chaver.p2 .ta_2{
    right: 399px;
    bottom: 862px;
    top: unset;
    }
.shas_chaver.p2 .tb_2{
        right:50px;
        bottom: 868px;
        word-spacing:2.4px;
        top: unset;
}
.shas_chaver.p2 .tc_2{
    right: 399px;
    bottom: 798px;
    top: unset;
}
.shas_chaver.p2 .td_2{right:50px;bottom: 804px;word-spacing:2.4px;}
.shas_chaver.p2 .te_2{
    right: 399px;
    bottom: 731px;
    word-spacing: 2.4px;}
.shas_chaver.p2 .tf_2{right:50px;bottom: 739px;word-spacing:2.4px;}
.shas_chaver.p2 .th_2{
    right: 50px;
    bottom: 673px;
    top: unset;
}
.shas_chaver.p2 .ti_2{
    right: 50px;
    bottom: 613px;
    top: unset;
}
.shas_chaver.p2 .tg_2{
    right: 399px;
    bottom: 609px;
}
.shas_chaver.p2 .tk_2{
    right: 399px;
    bottom: 578px;
}
.shas_chaver .bottom-text{
    right: -32px;
    bottom: 460px;
}
.p2.shas_chaver  .s1{
    font-family: Arial;
    font-size: 1.17em;
}

.p2.shas_chaver .s2{
    font-family: Arial;
    color: rgb(0,0,0);
    font-size: 1.17em;
}

.p2.shas_chaver  .s3{
    font-size: 1.17em;
    font-family: Arial;
    font-weight: 700;
    color: rgb(0,0,0);
}

.p2.shas_chaver  .s4{
    color: rgb(0,0,0);
    font-size: 1.5em;
    font-family: "Arial";
    color: .000000;
    line-height: 1.124623em;
    font-weight: 700;
}

.p2.shas_chaver  .s5{
    color: rgb(0,0,0);
    font-size: 1.5em;
    font-family: "Arial";
    color: .000000;
    line-height: 1.124623em;
    font-weight: 700;
}

.p2.shas_chaver  .s6{
    color: rgb(0,0,0);
    font-size: 1.3em;
    font-family: "Arial";
    color: .000000;
    line-height: 1.124623em;
    /* font-weight: 700; */
}

</style>
<!-- End inline CSS -->
    <div style="page-break-before: always;height: 0;"> &nbsp;</div>
    <div style="page-break-before: always;height: 0;">&nbsp;</div>

    <!-- Begin page background -->
    <div class="pg2Overlay" style="width:100%; height:100%; position:absolute; z-index:1; background-color:rgba(0,0,0,0); -webkit-user-select: none;"></div>
    <div class="pg2 pdf2" style="-webkit-user-select: none;"><object width="909" height="1286" data="{{$publicLocation}}/ballot_member_base_new2.svg" type="image/svg+xml" style="width:909px; height:1286px; -moz-transform:scale(1); z-index: 0;margin: 0 auto;"></object></div>
    <!-- End page background -->
    <!-- Begin text definitions (Positioned/styled in CSS) -->
    <div class="t s3 t2_2">ועדת הבחירות האזורית כל הוועדות</div>
    <div class="t s1 t3_2"> קלפי מס' {{$geo_role_data['ballots']}}, ב{{$geo_role_data['cluster_city_name']}}</div> 
     <div class="t s1 t5_2">משמרת {{$geo_role_data['shift_name' ]}}</div>
    <div class="t s3 t6_2">נספח לכתב מינוי ל{{$geo_role_data['ballot_box_role_appointment_letter_name']}} ועדת הקלפי עבור {{$first_name}} {{$last_name}}</div>
    <div class="t s5 t8_2">{{$geo_role_data['cluster_city_name']}} {{$geo_role_data['ballots']}}</div>
    <div class="t s6 t9_2">עבור קלפי:</div>
    <div class="t s4 ta_2">{{$geo_role_data['ballot_iron_number']}}</div>
    <div class="t s6 tb_2">מספר ברזל:</div>
    <div class="t s4 tc_2">07:00</div>
    <div class="t s6 td_2">שעת פתיחת הקלפי:</div>
    <div class="t s4 te_2">{{$geo_role_data['shift_number']}}</div>
    <div class="t s6 tf_2">משמרת מתוכננת:</div>
    <div class="t s6 th_2">שעת התחלת משמרת:</div>
    <div class="t s4 te_2">{{$geo_role_data['shift_number']}}</div>
    <div class="t s6 ti_2">שעת סיום משמרת:</div>
    <div class="t s4 tg_2">סיום מילוי תפקידי</div>
    <div class="t s4 tk_2">ועדת הקלפי</div>
    <div class="t s4 bottom-text">
            שים לב! עם סיום עבודתך בוועדת הקלפי וודא כי הנך מקבל אישור
            על מילוי תפקידך ממזכיר ועדת הקלפי
    </div>
    <!-- End text definitions -->
    </div>
@endforeach