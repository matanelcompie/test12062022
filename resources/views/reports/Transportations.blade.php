<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        
	    <style  type="text/css">
@Media Print {
			tbody tr th, thead tr th {
                -webkit-print-color-adjust: exact; 
                text-align: right !important;
            }
            .table-bordered.driverTable{
                -webkit-print-color-adjust: exact; 
                margin:0 !important;   
                border:0 !important;   
            }
            .table-bordered .driverHeaderStyle th{
				-webkit-print-color-adjust: exact; 
                font-size:15px  !important;
				background-color:#F4F4F4 !important; 
                /* border-top:2.5px solid gray !important; */
                border: 0px !important;
            }
            .table-bordered .headerStyle th{
				-webkit-print-color-adjust: exact; 
                border-bottom:3px solid #ddd !important;
            }
			td{
				-webkit-print-color-adjust: exact; 
				padding:4px !important;
			}

        }

        /* End @Media Print */
            tbody tr th, thead tr th {text-align: right !important;}
            
            .table-bordered.driverTable{
                margin:0 !important; 
                border:0px !important;
            }
			.table-bordered .driverHeaderStyle th{
				font-size:15px;
				background-color:#F4F4F4;
                border:0px;
                /* border-top:2.5px solid gray; */
			}
           .table-bordered .headerStyle th{
                border-bottom:3px solid #ddd ;
            }
			td{
				padding:4px;
			}
        </style>
    </head>
    <body>
             <h1 class="text-center">דוח לנהג</h1>
            @foreach ($data as $driverData)
                <div class="row">
                    <div class="col-md-12">
                        <table class="table table-bordered driverTable">
                            <thead>
                                <tr class="driverHeaderStyle">
                                    <th colspan="2"><span> עיר </span> {{$city_name}}</th>
                                    <th colspan="4">
                                        <span> שם נהג </span> {{$driverData['first_name']}} {{$driverData['last_name']}} |
                                        <span> ת.ז. </span> {{$driverData['personal_identity']}} |
                                        <span> טלפון </span> {{$driverData['phone_number']}}
                                    </th>
                                    <th colspan="6"> <span> מס הסעות </span> {{count($driverData['voters'])}}</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
                <div class="row">
                     <div class="col-md-12">
                        <table class="table table-bordered">
                            <tbody>
                                    <tr class="headerStyle">
                                        <th></th>
                                        <th>קלפי</th>
                                        <th>תעודת זהות</th>
                                        <th>שם מלא</th>
                                        <th>כתובת מלאה</th>
                                        <th>בין השעות</th>
                                        <th>סוג רכב</th>
                                        <th>מס נוסעים</th>
                                        <th>טלפון</th>
                                        <th>טלפון נוסף</th>
                                    </tr>
                                    @foreach ($driverData['voters'] as $rowIndex => $voter)
                                    <tr class="text-center">
                                        <td>{{$rowIndex + 1}}</td>
                                        <td>{{$voter['cluster_street'] . ' ' . $voter['cluster_house'] . ', ' . $voter['cluster_city_name'] }} | {{$voter['cluster_name']}} </td>
                                        <td>{{$voter['personal_identity']}}</td>
                                        <td>{{$voter['last_name'] . ' ' . $voter['first_name']}}</td>
                                        <td>{{$voter['street'] . ' ' . $voter['house'] . ', '. $voter['city']}}</td>
                                        <td>{{substr($voter['from_time'],0,5)}} {{$voter['to_time'] ? ' - ' . substr($voter['to_time'],0,5) : ''}}</td>
                                        <td>@if($voter['cripple'] == 1)<img class="image-responsive" src="{{asset('/Images/accessibility.png')}}"/>@endif</td>
                                        <td>1</td>
                                        <td>{{!empty($voter['voter_phones'][0]) ? $voter['voter_phones'][0]['phone_number'] : ''}}</td>
                                        <td>{{!empty($voter['voter_phones'][1]) ? $voter['voter_phones'][1]['phone_number'] : ''}}</td>
                                    </tr>
                                    @endforeach
                            </tbody>
                        </table>
                </div>
            </div>
            @endforeach

        @if($print)
        <script>window.print();</script>
        @endif
    </body>
</html>
