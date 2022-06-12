<div style="position:relative;">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <img src="{{URL::asset('Images/shas-large-icon.png')}}" class="middle shas-icon" alt="Shas icon" >
                <h1 class="text-center">התאחדות הספרדים העולמית שומרי תורה</h1> 
                <h1 class="text-center"> בחירות לכנסת ה - 24 </h1> 
                <h2 class="text-center under-line">טופס שכר פעיל</h2>
                <div id="voter-details">
                    <p>
                    <b>שם פרטי:</b> <span> &#10240 &#10240 {{$first_name}} &#10240 &#10240  </span> 
                    <b>שם משפחה:</b> <span>&#10240 &#10240 {{$last_name}} &#10240 &#10240 </span> 
                    <b>.ת.ז:</b> <span> &#10240 &#10240 {{$personal_identity}} &#10240 &#10240 </span> 
                    </p>
                    <p>
                    <b> תאריך לידה:</b> <span>  &#10240 &#10240 / &#10240 &#10240  / {{substr ($birth_date, 0, 4)}} </span> 
                    <b> טלפון: </b> <span>&#10240 {{$phone_number}} &#10240 </span> 
                    <b> כתובת: </b> <span > &#10240 {{$city}} {{$street}} {{$house}} &#10240  </span>
                    </p>
                    <p>
                    <b> מטה/עיר: </b>
                                @if($assigned_city_name) {{$assigned_city_name}}  |
                                @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 </span> @endif
                    <b>  תפקיד: </b>
                                @if($election_role_name)  {{$election_role_name}} |
                                @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 </span> @endif
                    <b>  קלפי: </b>
                                @if($ballots) {{ $ballots }} |
                                @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 </span> @endif
                    <b>   משמרת: </b>
                                @if($shifts) {{ $shifts }} 
                                @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 </span> @endif
                                
                    </p>
                </div>
                <h4> 
                    שכר נטו  {{$total_payment}} ₪  
                    עבור שכר עבודה ו/או שימוש בטלפון ו/או שימוש ברכב בתקופת הבחירות לכנסת ה- 24. <br>
                    השכר נטו וכולל כל תוספת והפרשה המוקנית בחוק לעובד לרבות נסיעות ו- 4% פדיון דמי חופשה  וכל זכות המוקנית בחוק  מכל מין וסוג שהוא <br>
                    הסכם זה הינו בהתאם לתיקון חוק הבחירות לכנסת מס' 75 הקובע כי הוראות שעות חוק עבודה ומנוחה אינם חלות עליו <br>
                </h4>
            </div>
        </div>
        <h4>בחתימתי על מסמך זה אני מסכים, מצהיר מאשר ומתחייב, כדלהלן: </h4>
        <div class="row">
            <div class="col-md-12 agreement-texts" >

                @foreach($agreement_texts as $i => $text)
                    <p>{{ $text}}</p>
                @endforeach

                @foreach($agreement_texts_bold as $i => $text)
                    <p> <b>{{ $text}}</b></p>
                @endforeach

            </div>
        </div>

        <div class="row bank-details-box">
            <b>פרטי בנק:</b> 
            <p>
            <b> שם הבנק: </b>  <span class="bank-details"> @if($bank_name)   {{$bank_name}}  
                            @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 </span> @endif
                        </span>
            <b> שם הסניף: </b>  <span class="bank-details">
                            @if($bank_branch_name)   {{$bank_branch_name}}  
                            @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 </span>  @endif
                        </span> 
            <b> מספר הסניף: </b> <span class="bank-details">
                            @if($bank_branch_number)   {{$bank_branch_number}}  
                            @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 </span>  @endif
                        </span>
            </p>
            <p>
            <b>  מספר חשבון: </b> <span class="bank-details">
                            @if($bank_account_number) &#10240 &#10240 {{$bank_account_number}} &#10240 &#10240 
                            @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 </span>  @endif
                        </span>
            <b>  שם בעל החשבון: </b> <span class="bank-details">
                        @if($bank_owner_name) &#10240 &#10240 {{$bank_owner_name}} &#10240 &#10240 
                        @else <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240  </span> @endif
                        </span>
            </p>
            <p>

            <b> החשבון על שמי </b>  <span>&#10240</span> @if($is_activist_bank_owner) <span class="circle">כן</span> @else <span> כן</span>  @endif
                    <span>&#10240 / &#10240</span>  
                    לא  <span>&#10240</span>
                @if(!$is_activist_bank_owner)
                    @if(!$other_owner_type)
                        – פרט קירבה   
                        <span class="under-line bank-details">&#10240 &#10240 &#10240 &#10240 &#10240 </span>
                    @else
                        קירבה - {{$other_owner_type}}
                    @endif
                @endif
            </p>
        </div>
        <br>
        <div class="row">
            <div class="col-md-6 text-center" >
                <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240</span> <br>
                <b>חתימת העובד</b>
            </div>
            <div class="col-md-6 text-center" >
                <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240</span> <br>
                <b>חתימת ראש המטה</b>
            </div>
        </div>
        
        <p class="row"> <hr style="margin-top: 10px;"> </p>

        <p class="text-center" style="font-size: 14px;">רח' שלמה הלוי מומו ירושלים ת.ד. 34263 מיקוד 9134102 טל' 02-3733200 פקס' 02-6511371 giz@shas.org.il</p>
    </div>

    {{-- Attachment page: --}}

    <div style="page-break-after: always;height: 0;"> &nbsp;</div>
    <div style="page-break-before: always;height: 0;">&nbsp;</div>

    <div style="position:relative;">
        <div class="container">

            <h2 style="text-decoration: underline;text-align: center;">  נספח לעובד קלפי  </h2>
            <div class="row">
                <div class="col-md-12 agreement-texts" >

                    @foreach($attache_texts as $i => $text)
                        <p>{{ $text}}</p>
                    @endforeach

                </div>
            </div>
        </div>
        <br><br><br><br>
        <h3 style="text-align: center">
            כלל ההוראות החלות בהסכם ביני לבין מפלגת ש"ס חלות על נספח זה במלואם.
       </h3>
       <br><br>
        <div class="row">
            <div class="col-md-6 text-center" >
                <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240</span> <br>
                <b>חתימת העובד</b>
            </div>
            <div class="col-md-6 text-center" >
                <span class="under-line"> &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240 &#10240</span> <br>
                <b>חתימת ראש המטה</b>
            </div>
        </div>
    
    </div>


    @if($from_city_export)
        <div style="page-break-after: always;height: 0;"> &nbsp;</div>
        <div style="page-break-before: always;height: 0;">&nbsp;</div>
    @endif
</div>

