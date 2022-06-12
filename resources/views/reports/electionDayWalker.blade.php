<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
          <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <style type="text/css">
            thead tr th {text-align: right !important;}
            tbody tr td{text-align: right !important;}
			table tbody tr td {page-break-inside: avoid;}
			@media print {
				@page {
                    size: A4 landscape;
					max-height:100%;
					max-width:100%;
					margin: 4mm 4mm 4mm 4mm; /* this affects the margin in the printer settings */
				}
				.cap50Row th  {
					-webkit-print-color-adjust: exact; 
					background-color:#F0F0F0 !important; 
				}
				.headerRow{
					-webkit-print-color-adjust: exact; 
					border-bottom: solid 2px gray !important; 
					text-align:right;
					font-size:16px;
				}
    		}
			.cap50Row th  {
					background-color:#F0F0F0 !important; 
			}
			.headerRow{
				border-bottom: solid 2px gray !important; 
				text-align:right;
				font-size:16px;
			}


        </style>
    </head>
    <body>
	<div class="container" style='width:100%;'>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
				<h1 align="center"> <span>דוח הליכון יום בחירות</span> </h1>
				@foreach ($data as $index => $voter)

					<!-- Display captain table on captain change -->
					@if($voter['firstCaptainVoter'])
					@php $currentCaptain = $itemsHash[$voter['captain_voter_id']] @endphp
						<table class="table table-bordered table-striped">
							<thead>
								<tr> 
									<td align="center" colSpan="13">
									הודפס בתאריך  : @php echo date('d/m/Y H:i:s', time()); @endphp 
									</td>
								 </tr>
									<tr class="cap50Row">   
										<th colspan="8">
											שר מאה 
											<span style="font-size:16px;">&nbsp;
											<b>
												{{$currentCaptain['captain_first_name']}}
											 	{{$currentCaptain['captain_last_name']}}
											 </b>
											&nbsp;&nbsp;&nbsp; | ת.ז {{$currentCaptain['captain_personal_identity']}}&nbsp;&nbsp;&nbsp;
											<b>{{$currentCaptain['captain_phone_number']}}</b>&nbsp;</span>
										</th>
										<th colspan="3">
										מס' תושבים 
										<span style="font-size:16px">{{$currentCaptain['voters_count']}} </span>
										</th>
										<th colspan="3">
										מס' בתי אב
										<span style="font-size:16px">{{$currentCaptain['households_count']}} </span>
										</th>
									</tr>
									<tr class="headerRow">
										<!-- <th>מ"ס</th> -->
										<th>כתובת - עיר</th>
										<th style="min-width:60px;">שם משפחה</th>
										<th style="min-width:60px;">שם פרטי</th>
										<th>קוד תושב</th>
										<!-- <th>גיל</th> -->
										<th>טלפון</th>
										<th>טלפון נוסף</th>
										<th>סטטוס סניף</th>
										<th>הסעה</th>
										<th>כתובת קלפי</th>
										<th>קלפי</th>
										<th>מספר בוחר</th>
										<th>זמן הצבעה צפוי</th>
									</tr>
								</thead>
								<tbody>
							@endif
									<!-- Display city row on city change -->
									@if($voter['firstCaptainVoter'] || $voter['cluster_city_name'] != $data[$index-1]['cluster_city_name'])
									<tr><td colspan="13">עיר <span style="font-size:16px">{{$voter['cluster_city_name']}}</span></td></tr>
									@endif
									<tr>
										<!-- <td>{{$voter['index_in_captain']}}</td> -->
										<td>{{$voter['address']}}</td>
										<td>{{$voter['last_name']}}</td>
										<td>{{$voter['first_name']}}</td>
										<td>{{$voter['voter_key']}}</td>
										<!-- <td>{{$voter['age']}}</td> -->
										<td>{{$voter['first_phone']}}</td>
										<td>{{$voter['second_phone']}}</td>
										<td>{{$voter['support_status_name']}}</td>
										<td>{{$voter['transport']}}</td>
										<td>{{$voter['cluster_name']}}</td>
										<td>{{$voter['mi_id']}}</td>
										<td>{{$voter['voter_serial_number']}}</td>
										<td>{{$voter['prev_vote_time']}}</td>
									</tr>

							@if(isset($data[$index +1]) && $data[$index +1]['firstCaptainVoter'])
								</tbody>
							</table>
								<div style="page-break-after: always;"> &nbsp;</div>
								
								@if($printMode)
								<div style="page-break-before: always;">&nbsp;</div>
								@endif
							@endif

							@endforeach
                </div>
            </div>
        </div>
	</div>
        <script>window.print();</script>
    </body>
</html>
