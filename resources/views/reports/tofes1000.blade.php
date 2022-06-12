<!DOCTYPE html>
<html dir="rtl" lang="he">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width,maximum-scale=1.0">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
       
	    <style  type="text/css">
			@Media Print 
			{
				thead tr th {text-align: right !important;}
				.large-title{
					font-size:16px;
				}
				.not_pointed {
					-webkit-print-color-adjust: exact; 
					background-color:#FFF !important;
					border:2px solid #000000;
					font-weight:bold;
				}
				.pointed {
					-webkit-print-color-adjust: exact; 
					background-color:#CBCBCB !important;
					font-weight:bold;
					border:2px solid #000000;
				}	
				.headerStyle{
					-webkit-print-color-adjust: exact; 
					background-color:#F0F0F0 !important;
					height:35px;
				}
				td{
					-webkit-print-color-adjust: exact;  
				}
				.numberStyle{
					-webkit-print-color-adjust: exact; 
					font-size:15px;
					line-height:12px;
				}
			}
			/* End @Media Print */
			
			thead tr th {text-align: right !important;}
			.large-title{
				font-size:16px;
			}
			.not_pointed {
				background-color:#FFF;
				border:2px solid #000000;
				font-weight:bold;
			}
			.pointed { 
				background-color:#CBCBCB;
				font-weight:bold;
				border:2px solid #000000;
			}
			.headerStyle{
				background-color:#F0F0F0 ;
				height:35px;
			}
			td{
				 
			}
			.numberStyle{
				font-size:15px;
				padding-bottom:5px;
				padding-top:5px;'
			}

        </style>
    </head>
    <body>
        <div class="row">
            <div class="col-md-12">
                <div class="table-responsive">
				    <table style="font-size:18px;width:100%;">
						<tbody>
						    <tr>
							<th colspan="3" align="right">
									{{$electionRoleShiftsDetails[0]}}
							</th>
							
							<th colspan="3" align="right">
									{{$electionRoleShiftsDetails[1]}}
							</th>
							<th colspan="3" align="right">
									{{$electionRoleShiftsDetails[2]}}
							</th>
							</tr>
							<tr>
								<td style="direction:ltr;" align="right">
							      @php
									  echo date('d/m/Y H:i:s'); 
								  @endphp
							   </td>
							   
							   <td align="right" colspan="6" >
							     <strong>
							      טופס 1000 | קלפי
								  {{$ballotBoxID}}
								  </strong>
							   </td>
							   <td style="width:150px">
							       <div class="large-title">
								     <span class="not_pointed">xx</span>
								     <span>תושב שלא הצביע</span>
							       </div>
							   </td>
							   <td style="width:150px">
								   <div class="large-title">
									<span class="pointed">xx</span>
									<span>תושב שהצביע</span>
								   </div>
							   </td>
							</tr>
							<tr><td colspan="9" height="10px"></td></tr>
							<tr class="headerStyle">
							   <td>עיר : 
								<strong>{{$cityName}}</strong>
							   </td>
							   <td colspan="6" align="center">
							      אשכול : 
								  <strong>{{$clusterName}}</strong>
							   </td>
							   <td colspan="2">כתובת : 
								<strong>{{$clusterAddress}}</strong>
							   </td>
							</tr>
							<tr><td colspan="7" height="10px"></td></tr>
						</tbody>
					</table>

						<?php
						$numberOfCols = 25;
						$rowsCount = sizeof($data);
						if($rowsCount >  500  ){
							if($rowsCount < 600){
								$numberOfCols = 30;
							}
							elseif($rowsCount < 875){
								$numberOfCols = 35;
							}
							else{
								$numberOfCols = 40;
							}
						}
						?>
						
                    <table  style="width:100%;direction:ltr"  >
                        <tbody style="direction:ltr" >
						<tr> 
                            @foreach ($data as $index => $row)
									<?php
									$className = 'pointed';
									if(sizeof($row->votes) == 0){
										$className ='not_' . $className;
									}
									$setNewRow=$index !=0 && ((($index+1) % $numberOfCols) == 0);
									// echo (($index % $numberOfCols)==0);
									?>						   
										<td align='center' class='{{$className. " numberStyle"}}'>
										<div>{{$row->voter_serial_number}}</div>
										</td>
										@php if($setNewRow){ echo'</tr><tr>'; } @endphp
										@php if($index == $rowsCount-1) {echo '</tr>';}  @endphp
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
