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
        <style type="text/css" media="print">

			table tbody tr td {page-break-inside: avoid;}
			thead tr th {text-align: right !important;}
            tbody tr td {text-align: right !important;}

			@media print {
				html,body{height:100%;width:100%;margin:0;padding:0;}
				@page {
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
				.table-bordered{
					-webkit-print-color-adjust: exact; 
					border: 0 !important;
				}
    		}

        </style>
    </head>
    <body>
		<div class="container" style='width:100%;'>
			<div class="row">
				<div class="col-md-12">
					<div class="table-responsive">
						<div class="text-center"><h1>הליכון שר מאה</h1></div>

							@php $firstCaptain=true;$currentCityId=null; $currentCaptainId=null; $currentHousehold_id=null; $index=1; @endphp
								@foreach ($voterList as $voterIndex => $voterRow )
									@if($voterRow['captain_personal_identity'] != $currentCaptainId)

									<!-- End new captain voters table -->
										@if(!$firstCaptain)
												</tbody>
										</table>
										
										<div style="page-break-after: always;"> &nbsp;</div>
										<div style="page-break-before: always;">&nbsp;</div>
										@endif

									@php $currentCaptainId = $voterRow['captain_personal_identity'];
										$index = 1;$firstCaptain=false;
									@endphp
									<!-- Start new captain voters table -->

								<table class="table table-bordered table-striped">
									<thead>
										<tr> 
											<td align="center" colSpan="13">
											הודפס בתאריך  : @php echo date('d/m/Y H:i:s', time()); @endphp 
											</td>
										</tr>
										<tr class="cap50Row">
											<th colspan="7">
											שר מאה 
												<span style="font-size:18px">&nbsp;<b>{{$voterRow ['captain_first_name']}}
												{{$voterRow ['captain_last_name']}}</b>&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; ת.ז {{$voterRow ['captain_personal_identity']}} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
												נייד <b>{{$voterRow ['captain_phone_number']}}</b>
												</span>
											</th>
											<th colspan="2">עיר  
												<span style="font-size:18px">{{$voterRow ['captain_city_name']}} </span>
											</th>
											<th colspan="2">
											מס' תושבים 
												<span style="font-size:18px">{{$captainHash[$currentCaptainId]['voters_count']}} </span>
											</th>
											<th colspan="2">
											מס' בתי אב
												<span style="font-size:18px">{{$captainHash[$currentCaptainId]['households_count']}} </span>
											</th>
										</tr>
										<tr class="headerRow">
											<th class="text-right">מ"ס</th>
											<th class="text-right">כתובת</th>
											<th class="text-right"  style="width:3%">משפחה</th>
											<th class="text-right" style="width:3%">שם</th>
											<th class="text-right">ת"ז</th>
											<th class="text-right">גיל</th>
											<th class="text-right">טלפון</th>
											<th class="text-right">טל' נוסף</th>
											<th class="text-right">ס.סניף</th>
											<th class="text-right" style="width:1%"  width="1%">הסעה</th>
											<th class="text-right">כתובת קלפי</th>
											<th class="text-right">קלפי</th>
											<th class="text-right">תושב</th>
										</tr>
									</thead>
									<tbody>
								@endif
								@php
										$currentCityId = $voterRow ['city_id'];

										$ballotMiId = $voterRow['mi_id'];
										$lastDigit = substr($ballotMiId, -1);
										$ballotMiId = substr($ballotMiId, 0, strlen($ballotMiId) - 1) . '.' . $lastDigit;
									@endphp
											<tr>
												@if($voterRow['household_id'] != $currentHousehold_id)
												<td>{{($index)}}</td> @php  $index++; @endphp
												<td>{{$voterRow['street'] .' '. $voterRow['house']}} @if($voterRow['flat']) / {{$voterRow['flat']}} @endif  {{' , ' . $voterRow ['city_name']}}</td>
												@else<td></td><td></td>@endif
												<td style="width:3%">{{$voterRow['last_name']}}</td>
												<td style="width:3%">{{$voterRow['first_name']}}</td>
												<td>{{$voterRow['personal_identity']}}</td>
												<td>{{(date("Y") - explode('-',$voterRow['birth_date'])[0])}}</td>
												<td>{{!empty($voterRow['voter_phones'][0]) ? $voterRow['voter_phones'][0]['phone_number'] : ''}}</td>
												<td>{{!empty($voterRow['voter_phones'][1]) ? $voterRow['voter_phones'][1]['phone_number'] : ''}}</td>
												<td>{{$voterRow['support_status_name']}}</td>
												<td style="width:1%" width="1%">{{!empty($voterRow['voter_transportations_id']) && ($voterRow['voter_transportations_id'] != -1) ? 'כן' : ''}}</td>
												<td>{{$voterRow['cluster_street'] .' '. $voterRow['cluster_house']}} {{' , ' . $voterRow ['cluster_city_name']}}</td>
												<td>{{$ballotMiId}}</td>
												<td>{{$voterRow['voter_serial_number']}}</td>
											</tr>
									@php $currentHousehold_id = $voterRow['household_id'];@endphp
								@endforeach

					</div>
				</div>
			</div>
		</div>
        <script>window.print();</script>
    </body>
</html>
