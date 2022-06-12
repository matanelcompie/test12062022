<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
          <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <style type="text/css">
        @media print {table thead tbody tr th td {page-break-inside: avoid;}}
            thead tr th {text-align: right !important;}
        </style>
    </head>
    <body>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
				    <div align="center"><h1>תוצאות חיפוש פניות</h1></div>
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                            <th>#</th>
                            <th>תאריך פניה</th>
                            <th>נושא</th>
                            <th>תת נושא</th>
                            <th>תיאור</th>
                            <th>שם התושב</th>
                            <th>יעד לסיום טיפול</th>
                            <th>עובד מטפל</th>
                            <th>צוות מטפל</th>
                            <th>סטטוס</th>
                            <th>טלפון</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($data as $row)
									    <tr>
                                            <td>{{$row->requests_key}}</td>
                                            <td>{{date("d/m/Y", strtotime($row->request_date))}}</td>
                                            <td>{{$row->topic_name}}</td>
                                            <td>{{$row->sub_topic_name}}</td>
                                            <td>{{$row->description}}</td>
                                            <td>{{!empty($row->voter_name)? $row->voter_name : $row->unknown_voter_name}}</td>
                                            <td>{{date("d/m/Y", strtotime($row->target_close_date))}}</td>
                                            <td>{{$row->user_handler}}</td>
                                            <td>{{$row->team_handler_name}}</td>
                                            <td>{{$row->request_status_name}}</td>
                                            <td>{{is_null($row->request_source_phone) ? '' : $row->request_source_phone}}</td>
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
