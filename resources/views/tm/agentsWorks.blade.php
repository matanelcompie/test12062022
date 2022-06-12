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
			table tr th{
				text-align:center;
			}
			@media print {
				html,body{height:100%;width:100%;margin:0;padding:0;}
				@page {
					max-height:100%;
					max-width:100%
				}
				img {
					width:100%;
					height:100%;
					display:block;
				}
				table tr th,td{
					text-align:center;
				}
			}
        </style>
    </head>
    <body>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
				    <div align="center"><h4>עבודת נציגים | {{$campaignName}}</h4></div>
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                               <th></th>
							   <th colspan="5" align="center">זמן</th>
							   <th colspan="2" align="center">שיחות לשעה</th>
							   <th colspan="3" align="center">שאלונים לשעה</th>
							   <th colspan="6" align="center"></th>
                            </tr>
							<tr>
								<th>שם הנציג</th>
								<th>פעילות</th>
								<th>המתנה</th>
								<th>הפסקה</th>
								<th>שיחה</th>
								<th>טיפול</th>
								<th>שעה אחרונה</th>
								<th>היום</th>
								<th>שעה אחרונה</th>
								<th>היום</th>
								<th>יחס</th>
								<th>מצב</th>
								<th>שלוחה</th>
								<th>תושב</th>
								<th>שם מלא</th>
								<th>מספר</th>
								<th>זמן מצב</th>
							</tr>
                        </thead>
                        <tbody>
                            @foreach ($data as $row)
								<tr>
									<td>{{$row['first_name']}} {{$row['last_name']}}</td>
									<td>{{$row['total_activity_time']}}</td>
									<td>{{$row['total_waiting_time']}}</td>
									<td>{{$row['total_break_time']}}</td>
									<td>{{$row['total_regular_calls_time']}}</td>
									<td>{{$row['total_action_calls_time']}}</td>
									<td>{{$row['connected'] && $row['total_calls_last_hour']}}</td>
									<td>{{$row['connected'] && $row['calls_per_hour_today']}}</td>
									<td>{{$row['connected'] && $row['quests_answered_last_hour']}}</td>
									<td>{{$row['connected'] && $row['quests_answered_today_per_hour']}}</td>
									<td>{{$row['ratio']}}</td>
									<td>{{$row['status_name']}}</td>
									<td>{{$row['dialer_number']}}</td>
									<td>{{$row['connected'] && $row['personal_identity']}}</td>
									<td>{{$row['connected'] && $row['voter_name']}}</td>
									<td>{{$row['connected'] && $row['phone_number']}}</td>
									<td>{{$row['connected'] && $row['state_duration_seconds']}}</td>
								</tr>
							@endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <script>window.print();</script>
    </body>
</html>
