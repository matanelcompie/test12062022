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
            h1{
                    margin-top: 0 !important;
                    margin-bottom: 0 !important;
            }
			@media print {
				html,body{height:100%;width:100%;margin:0;padding:0;}
                h1{
                    margin: 2px !important;
                }
				@page {
                    size: A4 landscape;
					max-height:100%;
					max-width:100%;
					margin: 4mm 4mm 4mm 4mm; /* this affects the margin in the printer settings */
				}
                h1{
                    -webkit-print-color-adjust: exact; 
                    margin-top: 0 !important;
                    margin-bottom: 0 !important;
                }
                .date-row td{
                    padding:1px 8px !important;
                }
				.cap50Row th  {
					-webkit-print-color-adjust: exact; 
					background-color:#F0F0F0 !important; 
                    padding:1px 8px !important;
				}
				.headerRow{
					-webkit-print-color-adjust: exact; 
					border-bottom: solid 2px gray !important; 
					text-align:right;
					font-size:16px;
				}
                .headerRow th{
					-webkit-print-color-adjust: exact; 
                    padding:1px 8px !important;
                }
				.table-bordered{
					-webkit-print-color-adjust: exact; 
					border: 0 !important;
                    margin:0 !important;
				}
                .voter-row td{
					-webkit-print-color-adjust: exact; 
                    background-color: #f9f9f9 !important;
                    padding:1px 8px !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                .update-details-row .update-title{
					-webkit-print-color-adjust: exact; 
                    background-color: #f9f9f9 !important;
                    text-align: center !important;
                }
                .update-details-row td{
					-webkit-print-color-adjust: exact; 
                    padding:3px 8px !important;
                }
                .page-break td{
					-webkit-print-color-adjust: exact; 
                    page-break-after:always  !important;
                }
    		}
            

        </style>
    </head>
    <body>
		<div class="container" style='width:100%;'>
			<div class="row">
				<div class="col-md-12">
					<div class="table-responsive">

							@php $firstCaptain=true; $currentCityId=null; $currentCaptainId=null; $currentHousehold_id=null; $index=0; $needToPrintTable =false @endphp
								@foreach ($voterList as $voterIndex => $voterRow )

									@if($voterRow['captain_personal_identity'] != $currentCaptainId )

									<!-- End new captain voters table -->
										@if(!$firstCaptain)
                                                    </tbody>
                                            </table>
                                            
                                            <div height="0" style="page-break-after: always;"> &nbsp;</div>
                                            <div height="0" style="page-break-before: always;">&nbsp;</div>
										@endif
   
                                        @php
                                            $currentCaptainId = $voterRow['captain_personal_identity'];
                                            $index = 0; $firstCaptain= false; $needToPrintTable= true;
                                        @endphp
                                    @endif

                                    @if($index != 0)
                                        @if($index % 10 == 0)
                                            @php $needToPrintTable= true; @endphp
                                                    </tbody>
                                                </table>
                                                <div height="0" style="page-break-before: always;">&nbsp;</div>
                                        @else
                                            @php $needToPrintTable= false; @endphp
                                        @endif
                                    @endif

									<!-- Start new  voters table -->
                                    @if($needToPrintTable)
                                        <table class="table table-bordered">
                                            <thead>
                                                <tr class="date-row"> 
                                                    <td align="center" colSpan="13">
                                                    הליכון טיוב נתונים -  הודפס בתאריך  : @php echo date('d/m/Y H:i:s', time()); @endphp 
                                                    </td>
                                                </tr>
                                                <tr class="cap50Row">
                                                    <th colspan="5">
                                                    שר מאה 
                                                        <span style="font-size:16px">&nbsp;<b>{{$voterRow ['captain_first_name']}}
                                                        {{$voterRow ['captain_last_name']}}</b>&nbsp;&nbsp; | &nbsp;&nbsp; ת.ז {{$voterRow ['captain_personal_identity']}} &nbsp;&nbsp; | &nbsp;&nbsp;
                                                        נייד <b>{{$voterRow ['captain_phone_number']}}</b>
                                                        </span>
                                                    </th>
                                                    <th colspan="1">עיר  
                                                        <span style="font-size:16px">{{$voterRow ['captain_city_name']}} </span>
                                                    </th>
                                                    <th colspan="2">
                                                    מס' תושבים 
                                                        <span style="font-size:16px">{{$captainHash[$currentCaptainId]['voters_count']}} </span>
                                                    </th>
                                                    <th colspan="2">
                                                    מס' בתי אב
                                                        <span style="font-size:16px">{{$captainHash[$currentCaptainId]['households_count']}} </span>
                                                    </th>
                                                </tr>
                                                <tr class="headerRow">
                                                    <th class="text-right">מ"ס</th>
                                                    <th class="text-right">קוד תושב</th>
                                                    <th class="text-right"  style="width:3%">משפחה</th>
                                                    <th class="text-right" style="width:3%">שם</th>
                                                    <th class="text-right">כתובת</th>
                                                    <th class="text-right">טלפון</th>
                                                    <th class="text-right"> סטטוס סניף</th>
                                                    <th class="text-right">זרם</th>
                                                    <th class="text-right">ספרדי</th>
                                                    <th class="text-right">עדה</th>
                                                </tr>
                                            </thead>
                                            <tbody>
								        @endif

                                            @if($voterRow['household_id'] != $currentHousehold_id && !$needToPrintTable)
                                                <tr> <td colspan="10" height="10"></td> </tr>
                                            @endif

                                            @php  $index++; @endphp

											<tr class="voter-row">
												<td>{{($index)}}</td> 
												<td>{{$voterRow['voter_key']}}</td>
                                                <td>{{$voterRow['last_name']}}</td>
												<td>{{$voterRow['first_name']}}</td>

												<td>{{$voterRow['street'] .' '. $voterRow['house']}} @if($voterRow['flat']) / {{$voterRow['flat']}} @endif  {{' , ' . $voterRow ['city_name']}}</td>

												<td>{{!empty($voterRow['voter_phones'][0]) ? $voterRow['voter_phones'][0]['phone_number'] : ''}}</td>
												<td>{{$voterRow['support_status_name']}}</td>
                                                <td>{{$voterRow['religious_group_name']}}</td>
                                                <td>{{ $voterRow['sephardi'] == 1 ? 'כן' : 'לא'}}</td>
                                                <td>{{$voterRow['ethnic_group_name']}}</td>
											</tr>
                                            <tr class="update-details-row">
                                                <td colspan="4" align="center"  class="update-title" >לעדכון הפעיל:</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
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
