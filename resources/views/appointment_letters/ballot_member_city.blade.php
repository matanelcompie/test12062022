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
                    size: A4 portrait;
                    max-height:100%;
                    max-width:100%;
                    margin: 0mm 0mm 0mm 0mm; /*this affects the margin in the printer settings */
                }
            }
            img {
                width: 100%;
                height: 100%;
                top:0px;
            }
            .role-data-box {
                top: 32vh;
                right: 28vw;
                position: absolute;
                font-size: 1em;
            }
            .date-box{
                top: 17.1vh;
                right: 28vw;
                position: absolute;
            }
            .date-box b, .date2-box b{
                font-weight: lighter;
                font-size: 1.5vh;
            }
            .regional_committees_name{
                top: -3vh;
            }
            .hebrew_date{
                margin-right:20vw;
                min-width: 30vw;
            }
}
            .first_name{
                right: 15vw;
            }
            .last_name{
                right: 31vw;
            }
            .personal_identity {
                top: 5.5vh;
                right: 14vw;
            }
            .city_name {
                top: 6vh;
                right: 0;
            }
            .address {
                top: 6vh;
                right: 40vw;
            }
            /* Box2*/
            .date2-box{
                top: 118.2vh;
                right: 28vw;
                position: absolute;
                font-size: 1em;
            }
            .role-more-data-box2 {
                top: 125vh;
                right: 75vw;
                position: absolute;
            }
            .role-data-box2 {
                top: 131vh;
                right: 20vw;
                position: absolute;
                font-size: 1em;
            }
            .appointment_details{
                right: -10vw;   
                top: 20vh;
                min-width: 80vw;
                font-weight: lighter;
                font-size:1.6vh;
            }
            .ballots_address{
                right: -10vw;   
                top: 26vh;
                min-width: 60vw;
                font-weight: lighter;
                font-size:1.6vh;
            }
            .attach_text{
                text-decoration: underline;
                top: 5vh;
                right: 0vw;   
                min-width: 80vw;
            }
            .cities_and_ballots{
                top: 8.5vh;
                right: 21vw;   
                min-width: 40vw;
            }
            .election_time{
                top: 13vh;
                right: 21vw;   
            }
            .election_role_shifts{
                top: 18vh;
                right: 21vw;   
            }
            .cities_ballots_shifts {
                min-width: 25vw;
                color: red;
                font-size: 1.5vh;
            }
            p {
                margin-top: 3px;
                margin-bottom: 3px;
            }
            b {
                font-family: "Assistant", sans-serif;
                min-width: 20vw;
                position: absolute;
                font-size: 2vh;
            }

        </style>
    </head>
    <body>
        <div>
                <img src='{{asset("Images/appointment_letters/$ballot_role.jpg")}}'>
                <div class="date-box" style="top:{{$margin_from_top}}17.1vh">
                    <b class="regional_committees_name">{{$geo_role_data['regional_committees_name']}}</b>
                    <b class="date">{{$date}}</b>
                    <b class="hebrew_date">{{$hebrew_date}}</b>
                </div>
                <div class="role-data-box" style="top:{{$margin_from_top}}32vh">
                    <b class="first_name">{{$first_name}}</b>
                    <b class="last_name">{{$last_name}}</b>
                    <b class="personal_identity">{{$personal_identity}}</b>
                    <b class="appointment_details"> בתחום  קלפי {{$geo_role_data['ballots']}} ב{{$geo_role_data['cluster_city_name']}} ועדת הבחירות האזורית {{$geo_role_data['regional_committees_name']}}</b>
                    <b class="ballots_address"> כתובת מקום הקלפי : {{$geo_role_data['ballots_address']}}</b>
                </div>
                <img class="attach_img" src='{{asset("Images/appointment_letters/ballot_member_attach_city.jpg")}}'>
                <div class="date2-box" style="top:{{$margin_from_top + 1}}17.7vh">
                    <b class="regional_committees_name">{{$geo_role_data['regional_committees_name']}}</b>
                    <b class="date">{{$date}}</b>
                    <b class="hebrew_date">{{$hebrew_date}}</b>
                </div>
                <div class="role-more-data-box2" style="top:{{$margin_from_top + 1 }}22vh">
                    <b class="cities_ballots_shifts">
                        <p> קלפי מס' {{$geo_role_data['ballots']}}</p>
                        <p> ב {{$geo_role_data['cluster_city_name']}}</p>
                        <p> משמרת {{$geo_role_data['shift_name']}}</p>
                     </b>  
                </div>
                <div class="role-data-box2" style="top:{{$margin_from_top + 1}}31vh">
                    <b class="attach_text">  
                        נספח לכתב מינוי 
                    <span>{{$ballot_role == 'ballot_member' ? 'לחבר ועדת הקלפי ' :'לסגן יו"ר ועדת '}}</span>  
                     עבור {{$first_name}} {{$last_name}}</b>
                    <b class="cities_and_ballots">{{$geo_role_data['cities_and_ballots']}}</b>
                    <b class="election_time"> 7:00 </b>
                    <b class="election_role_shifts">{{$geo_role_data['election_role_shifts']}}</b>
                </div>
            </div>

        <script>
            window.print();
        </script>
    </body>
</html>
