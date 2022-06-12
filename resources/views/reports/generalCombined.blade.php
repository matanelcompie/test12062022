<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <style type="text/css">
            thead tr th {text-align: right !important;}
        </style>
    </head>
    <body>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{{$extraData['combinedName']}}</th>
                                <th>מספר תושבים</th>
                                <th>מספר בתי אב</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($data as $index => $row)
                                <tr>
                                    <td>{{$index +1}}</td>
									<td>{{$row->combine_name}}</td> 
									<td>{{$row->voters_count}}</td> 
									<td>{{$row->households_count}}</td> 
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        @if($print)
        <script>window.print();</script>
        @endif
    </body>
</html>
