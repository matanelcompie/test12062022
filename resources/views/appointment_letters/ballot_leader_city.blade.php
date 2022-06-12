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
                top:0px;
            }
            b{
                font-family: "Assistant", sans-serif;
                min-width: 15vw;
                position: absolute;
                font-size: 2vh;
            }
            .area-box_leader{
                top: 6vh;
                position: absolute;
                width: 25vw;
                text-align: center;
            }
            .area-box_leader b{
                font-size: 2.7vh;
            }
            .role-data-box_leader {
                top: 31vh;
                right: 20vw;
                position: absolute;
            }
            .last_name_leader{
                right: 20vw;
            }
            .personal_identity_leader {
                right: 48vw;
            }
            .city_name_leader {
                top: 6vh;
                right: 0;
            }
            .address_leader {
                top: 6vh;
                right: 40vw;
            }
            .ballots_leader {
                top: 13vh;
                right: 10vw;
            }
            .cities_and_ballots_address_leader {
                top: 13vh;
                right: 30vw;
                min-width: 60vh;
                position: absolute;
            }
            .date2-box_leader{
                top: 71vh;
                right: 15vw;
                min-width: 40vh;
                position: absolute;
            }

        </style>
    </head>
    <body>
        <div>
            <img src='{{asset("Images/appointment_letters/$ballot_role.jpg")}}'>
            <div class="area-box_leader" style="top:{{$margin_from_top}}06vh">
                <b> אזור {{$geo_role_data['regional_committees_name']}} </b>
            </div>
            <div class="role-data-box_leader" style="top:{{$margin_from_top}}31vh">
                <b class="first_name_leader">{{$first_name}}</b>
                <b class="last_name_leader">{{$last_name}}</b>
                <b class="personal_identity_leader">{{$personal_identity}}</b>
                <b class="city_name_leader">{{$city_name}}</b>
                <b class="address_leader">{{$street_name}} {{$house}}</b>
                <b class="ballots_leader"> קלפי {{$geo_role_data['ballots']}} </b>
                <b class="cities_and_ballots_address_leader"> {{$geo_role_data['cities_and_ballots_address']}} </b>
            </div>
            <div class="date2-box_leader" style="top:{{$margin_from_top}}71vh">
                <b class="date_leader">{{$date}} , {{$hebrew_date}}</b>
            </div>
        </div>
        <script>
            window.print();
        </script>
    </body>
</html>
