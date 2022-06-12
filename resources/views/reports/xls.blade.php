<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <style type="text/css">
            thead tr th {text-align: right !important;}
        </style>
    </head>
    <body>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    @foreach (array_keys((array) $data[0]) as $key)
                        <th>{{isset($columnsNames[$key])?$columnsNames[$key]:$key}}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($data as $index => $row)
                    <?php $row = (array) $row;?>
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
    </body>
</html>
