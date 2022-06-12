<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        
	    <style  type="text/css">
@Media Print {
			tbody tr th {
                -webkit-print-color-adjust: exact; 
                text-align: right !important;
                }

            .headerStyle th{
				-webkit-print-color-adjust: exact; 
                font-size:15px  !important;
				background-color:#F4F4F4 !important; 
                border-top:2.5px solid gray !important;
                border: 0px !important;
            }
			td{
				-webkit-print-color-adjust: exact; 
				padding:4px !important;
			}
			.headerRowStyle{
				-webkit-print-color-adjust: exact; 
                border-bottom:2.5px solid gray !important;

			}
        }

        /* End @Media Print */
        tbody tr th {text-align: right !important;}
			.headerStyle{
				font-size:15px;
				background-color:#F4F4F4;
                border-top:2.5px solid gray;
			}
            .headerStyle th{
                border: 0px;
            }
			td{
				padding:4px;
			}
			.headerRowStyle{
            border-bottom:2.5px solid gray;
			}

        </style>
    </head>
    <body>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <tbody>
                            @foreach ($data as $clusterIndex => $clusterData)
                                <tr class="headerStyle">
                                    <th colspan="1" >{{$clusterData['info']['name']}}</th>
                                    <th colspan="1">{{$clusterData['info']['address']}}</th>
                                    <th colspan="5">{{$clusterData['info']['city']}}</th>
                                </tr>
                                @foreach ($clusterData['rows'] as $rowIndex => $row)
                                @if($rowIndex !=0) 
                                <tr> <td> {{$rowIndex }}</td>
                                @else 
                                <tr class="headerRowStyle">
                                 @endif
                                    @foreach ($row as  $item)
                                     <td>{{$item}}</td> 
                                    @endforeach
                                </tr>
                                @endforeach
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
