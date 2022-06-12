jQuery(document).ready(function() {

    // Event of modal being shown
    $('#basicModal').on('shown.bs.modal', function () {
        // Empty al the passwords inputs
        $(".shas-password").val("");

        $("#error_box").css("display", "none");
        $("#error_box" ).html("");

        // Enable reset password button after ajax call failed
        $("#btn_reset_password").removeClass('disabled');
    });

    $("#form_reset_password").submit(function( event ) {
        if ( !validateUser() ) {
            console.log('passwords do not match');
            $("#error_box").css("display", "block");
            $( "#error_box" ).html("סיסמא לא זהה לאשר סיסמא");
        } else {
            // Disable reset password button while ajax is being processed
            $("#btn_reset_password").addClass('disabled');

            $.ajax({
                type: "POST",
                url:  password_url,
                data: {
                    old_password: $('#old_password').val(),
                    password: $('#password').val(),
                    confirm_password: $('#confirm_password').val()
                },
                dataType: "json",
                success: function(data) {
                    console.log(data);

                    // Disable reset password button fter ajax call success
                    $("#btn_reset_password").addClass('disabled');

                    $("#error_box").css("display", "block");
                    $("#error_box" ).html(data.data);
                },
                error:function(data) {
                    console.log(data);

                    // Enable reset password button after ajax call failed
                    $("#btn_reset_password").removeClass('disabled');

                    var reponseText = JSON.parse(data.responseText);
                    console.log(reponseText);

                    $("#error_box").css("display", "block");
                    $("#error_box" ).html(reponseText.message);
                }
            });
        }

        event.preventDefault();
    });

});

/*
*  This function validates user data.
*/
function validateUser() {
    password = $('#password').val();
    confirm_password = $('#confirm_password').val();
    console.log('In password validation');

    if ( password != confirm_password ) {
        return false;
    } else {
        return true;
    }
}