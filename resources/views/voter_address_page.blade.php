<html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" >
        <link rel="stylesheet" href="https://cdn.rtlcss.com/bootstrap/v4.2.1/css/bootstrap.min.css">
    </head>
    <body>
        <style>
            body {
                direction:rtl;
                background-color: #edf3f7;
            }
            .container{
                padding-top: 20px;
            }
        </style>
        <div class="container">

        @if(!empty($voter_id))
            <form action="/api/elections/voter/ballot-address">
                <div class="form-group">
                    <label>הזן תעודת זהות</label>
                    <input type="text" name="personal_identity" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">שלח</button>
            </form>
            <table class="table table-bordered">
                <thead>
                    <th>עיר</th>
                    <th>אשכול</th>
                    <th>כתובת קלפי</th>
                    <th>קלפי</th>
                    <th>שם מלא</th>
                </thead>
                <tbody>
                    <tr>
                        <td>{{$city_name}}</td>
                        <td>{{$cluster_name}}</td>
                        <td>{{$street_name}}</td>
                        <td>{{$ballot_box_mi_id}}</td>
                        <td>{{$first_name}} {{$last_name}}</td>
                    </tr>
                </tbody>
            </table>
        @else
        
        @if(!empty($personal_identity)) <h1 style='text-align: center;color: red;'> לא נמצא תושב! </h1> @endif
        <form action="/api/elections/voter/ballot-address">
            <div class="form-group">
                <label>הזן תעודת זהות</label>
                <input type="text" name="personal_identity" class="form-control">
            </div>
            <button type="submit" class="btn btn-primary">שלח</button>
        </form>
        @endif
        </div>
    </body>
</html>