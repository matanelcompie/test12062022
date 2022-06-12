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
                                @foreach (array_keys($data[0]) as $key)
                                <th @if($key=='full_name') style="min-width: 150px;" @endif>
                                    {{isset($columnsNames[$key]) ? $columnsNames[$key] : $key }}
                                </th>
                                @endforeach
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($data as $index=> $row)
							  
                                <tr>
                                    <td>{{$index +1}}</td>
									@php
									     $innerIndex = 0;
									@endphp
                                    @foreach ($row as  $item)
									   @php
									     $innerIndex++;
									   @endphp
									   @if ( isset($row['voter_answers_to_questionairs']) && $innerIndex ==11)
                                        <td>
									      @php
									          foreach( $item as $answer){
											      echo "<div><strong>שאלה : ". $answer['question']."</strong> </div><div>תשובה : " .$answer['answer'].
												  "<br/><br/>
												  </div>";
										       }
									       @endphp
									    </td>
									   @else
										  <td>{{$item}}</td> 
									   @endif
                                    @endforeach
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
