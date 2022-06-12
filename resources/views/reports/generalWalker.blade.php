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
			table tbody tr td {page-break-inside: avoid;}
			thead tr th {text-align: right !important;}
			tbody tr td {text-align: right !important;}
			table tbody tr td.subHeader {border:0px !important;  }

        @media print {
			@page {
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
				background-color:#F0F0F0 !important; 
			}
			.headerRow {
				border-bottom: solid 2px gray !important; 
				text-align:right;
				font-size:16px;
			}
			.table-bordered{
					border: 0;
			}
        </style>
    </head>
    <body>
	<div class="container" style='width:100%;'>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
				   		<h1 align="center" style="text-align:center;font-weight:bold;"><strong>דוח הליכון כללי</strong></h1>
                            @foreach ($data as $row)
							<table class="table table-bordered table-striped">
								<thead>
									<tr> 
										<td align="center" colSpan="12">
										הודפס בתאריך  : @php echo date('d/m/Y H:i:s', time()); @endphp 
										</td>
									</tr>
									<tr class="ballotbox">
										<th colspan="3"   class="subHeader">עיר
												: <span style="font-size:18px">{{$cityName}}</span>
										</th>
										<th colspan="2"   class="subHeader">אשכול
											: <span style="font-size:18px">{{$row['cluster_name']}}</span>
										</th>
										<th colspan="2" style="border-right:1px solid #fff;"  class="subHeader">
											מספר קלפי : 
											<span style="font-size:18px">{{$row['mi_id']}}</span>
										</th>
										<th colspan="3" style="border-right:1px solid #fff;" class="subHeader">
												מס' תושבים : 
												<span style="font-size:18px">{{$row['voter_count']}} </span>
										</th>
									</tr>
									<tr class="headerRow">
										<th style="text-align:center">מס"ד</th>
										<th style="text-align:center">מס' קלפי</th>
										<th style="text-align:center">מס' בוחר</th>
										<th style="text-align:center">ת"ז</th>
										<th style="text-align:center">שם מלא</th>
										<th style="text-align:center">רחוב</th>
										<th style="text-align:center">מספר</th>
										<th style="text-align:center">טלפון</th>
										<th style="text-align:center">טלפון נוסף</th>
										<th style="text-align:center">סטטוס סופי</th>
									</tr>
								</thead>
							<tbody>
								@foreach ($row['ballot_box_voters'] as $voter)
								<tr>
								  <td width="5%">{{($loop->index+1)}}</td>
								  <td width="10%" >{{$row['formattedBallotBox']}}</td>
								  <td width="8%">{{$voter['voter_serial_number']}}</td>
								  <td width="12%">{{$voter['personal_identity']}}</td>
								  <td>{{$voter['first_name'] .' '.$voter['last_name']}}</td>
								  <td>{{!empty($voter['street_name'])?$voter['street_name']:$voter['mi_street']}}</td>
								  <td>{{$voter['house']}}</td>
								  <td>{{isset($voter['voter_phones'][0])?$voter['voter_phones'][0]['phone_number']:''}}</td>
								  <td>{{isset($voter['voter_phones'][1])?$voter['voter_phones'][1]['phone_number']:''}}</td>
							      <td width="10%">{{isset($voter['supportStatusName'])?$voter['supportStatusName']:''}}</td>
								</tr>
								@endforeach
							</tbody>
                        </tbody>
                            @endforeach
                    </table>
                </div>
            </div>
        </div>
	</div>
        <script>window.print();</script>
    </body>
</html>
