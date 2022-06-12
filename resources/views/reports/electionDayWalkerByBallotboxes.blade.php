<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
	<meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		<link rel="stylesheet" href="{{ URL::asset('css/responsive.css') }}">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

        <style type="text/css">
			thead tr th {text-align: right !important;}
            tbody tr td {text-align: right !important;}

			@media print {
				@page {
                    size: A4 landscape;
					max-height:100%;
					max-width:100%;
					margin: 4mm 4mm 4mm 4mm; /* this affects the margin in the printer settings */
				}
				.ballotbox th  {
					-webkit-print-color-adjust: exact; 
					background-color:#F0F0F0 !important; 
				}
				.headerRow {
					-webkit-print-color-adjust: exact; 
					border-bottom: solid 2px gray !important; 
					text-align:right;
					font-size:16px;
				}
				.table-bordered{
					-webkit-print-color-adjust: exact; 
					border: 0 !important;
				}
    		}
			.ballotbox th  {
					background-color:#F0F0F0; 
			}
			.headerRow {
				border-bottom: solid 2px gray; 
				text-align:right;
				font-size:16px;
			}
			.table-bordered{
				border: 0 ;
			}
        </style>
    </head>
    <body>
	<div class="container" style='width:100%;'>
		<h1 align="center"> <span>דוח הליכון יום בחירות</span> </h1>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
						@foreach ($data as $row)
						<table class="table table-bordered table-striped" style='margin-top:25px;'>
							<thead>
								<tr> 
									<td align="center" colSpan="13">
									הודפס בתאריך  : @php echo date('d/m/Y H:i:s', time()); @endphp 
									</td>
								 </tr>
								<tr class="ballotbox">
								   <th colSpan="3"><label>עיר</label> <strong>{{$row['cluster_city_name']}} </strong></th>
								   <th colspan="2">
								  		 אשכול
								     <span>{{$row['cluster_name']}}</span>
								   </th>
								   <th colspan="2">
								   		מספר קלפי
								   <span>{{$row['ballotbox_name']}} </span>
								   </th>
								    <th colspan="2">
								   		כתובת קלפי
								     <span>{{$row['cluster_address']}}</span>
								   </th>
								   <th colspan="2">
								   		מס' בתי אב
								   <span>{{$row['num_of_households']}} </span>
								   </th>
								   <th colspan="2">
								   		מס' תושבים
								   <span>{{$row['num_of_voters']}} </span>
								   </th>
                                </tr>
								<tr class="headerRow">
									<!-- <th>מ"ס</th> -->
									<th>מס' בבית אב</th>
									<th>מס' בוחר בקלפי</th>
									<th>קוד תושב</th>
									<th style="min-width:60px;">שם משפחה</th>
									<th style="min-width:60px;">שם פרטי</th>
									<th>כתובת</th>
									<!-- <th>גיל</th> -->
									<th>טלפון</th>
									<th>טלפון נוסף</th>
									<th>הסעה</th>
									<th>סטטוס סניף</th>
									<th>שר 100</th>
									<th>זמן הצבעה צפוי</th>
								</tr>

								</thead>
							<tbody>

									@foreach ($row['voters'] as $voter)
									    <tr>
								           <!-- <td>{{($loop->index+1)}}</td> -->
										   <td>{{$voter['index_in_household']}}</td>
										   <td>{{$voter['voter_serial_number']}}</td>
										   <td>{{$voter['voter_key']}}</td>
										   <td>{{$voter['last_name']}}</td>
										   <td>{{$voter['first_name']}}</td>
										   <td>{{$voter['address']}}</td>
										   <!-- <td>{{$voter['age']}}</td> -->
										   <td>{{$voter['first_phone']}}</td>
										   <td>{{$voter['second_phone']}}</td>
										   <td>{{$voter['transport']}}</td>
										   <td>{{$voter['support_status_name']}}</td>
										   <td>{{$voter['captain_first_name'] }} {{$voter['captain_last_name']}}</td>
										   <td>{{$voter['prev_vote_time']}}</td>
								        </tr>
									@endforeach
								</tbody>
						</table>	
						<div style="page-break-after: always;"> &nbsp;</div>
						<div style="page-break-before: always;">&nbsp;</div>							
						@endforeach

                </div>
            </div>
        </div>
	</div>
        @if($printMode)
        	<script>window.print();</script>
		@endif
    </body>
</html>
