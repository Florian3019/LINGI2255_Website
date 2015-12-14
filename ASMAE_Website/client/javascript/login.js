/*
    This file defines login settings
*/


 /*#################################
              LOGIN SETTINGS
    #################################*/
  Accounts.ui.config({
    requestPermissions: {
      facebook: ['public_profile','email'], // 'user_birthday' --> requires app review from facebook
      googe: ['profile', 'email','user_birthday']
    },
    /*
      Which fields to display in the user creation form.
      One of 'USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL',
      'USERNAME_ONLY', or 'EMAIL_ONLY'
    */
    passwordSignupFields: 'EMAIL_ONLY',
  });

  Template._loginButtonsLoggedInDropdownActions.helpers({
    allowChangingPassword: function() {
      // Disallow the user to change its password
      // (which would be inexistant) if he logged in via google or facebook
      var user = Meteor.user();
      if(!user){
        return false;
      }
      if(!user.services){
        return false;
      }
      return !(user.services.google || user.services.facebook);
    }
  });

  // On logout, go back to the home page
  accountsUIBootstrap3.logoutCallback = function(error) {
    if(error) console.log("Error:" + error);
    Router.go('home');
  }
  accountsUIBootstrap3.setLanguage('fr');

  // Additional button to allow profile editing when the user is logged in
  Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        Router.go('profileEdit',{_id:Meteor.userId()});
    }
});

var beforeUserCreationFunction = function(email){
    
    document.getElementById("e-mail-registration").href="mailto:"+email;
    document.getElementById("e-mail-registration").innerHTML=email;
    $('#signModal').modal('show');
}

Accounts.createUser = _.wrap(Accounts.createUser, function(createUser) {
    document.getElementById("login-buttons-password").innerHTML='<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Chargement...';
    // Store the original arguments
    var args = _.toArray(arguments).slice(1),
        user = args[0];
        origCallback = args[1];

    var newCallback = function(error) {
        // do my stuff

        if(error) {
            origCallback.call(this, error);
        }
        else {
            beforeUserCreationFunction(user.email);
            origCallback.call(this, error);
        }        
    };

    createUser(user, newCallback);
});

Template.login.events({
    
    'submit form': function(event) {
        document.getElementById("user").className = "form-group";
        document.getElementById("user-error-message").style.display = "none";
        document.getElementById("no-user-message").style.display = "none";

        document.getElementById("password").className = "form-group";
        document.getElementById("password-error-message").style.display = "none";
        document.getElementById("no-password-error-message").style.display = "none";

        event.preventDefault();
        var email = $('[name=email]').val().trim();
        var password = $('[name=password]').val().trim();
        Meteor.loginWithPassword(email, password, function(error){
            if(email == "") {
                document.getElementById("no-user-message").style.display = "block";
                document.getElementById("user").className = "form-group has-error";
            }
            else {
                if(error){
                    console.log(error.reason);
                    if(error.reason == "User not found"){
                        document.getElementById("user-error-message").style.display = "block";
                        document.getElementById("user").className = "form-group has-error";                 
                    }
                    if(error.reason == "Incorrect password"){
                        document.getElementById("password-error-message").style.display = "block";
                        document.getElementById("password").className = "form-group has-error";
                    }
                    if(error.reason == "User has no password set") {
                        document.getElementById("no-password-error-message").style.display = "block";
                        document.getElementById("user").className = "form-group has-error";
                    }        
                } 
                else {
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute == "login"){		//Else : don't redirect
                        Router.go("home");
                    }
                }
            }
		});
    },
	
	'click #facebook-login': function(event) {
         Meteor.loginWithFacebook({requestPermissions: ['email', 'user_about_me']}, function(error){
            if(error){
        		console.log(error.reason);
    		} else {
        		var currentRoute = Router.current().route.getName();
        		if(currentRoute == "login"){		//Else : don't redirect
            		Router.go("home");
        		}
    		}
		 });
	},
	
	'click #google-login': function(event) { // https://developers.google.com/accounts/docs/OAuth2Login#scopeparameter
         Meteor.loginWithGoogle({requestPermissions: ['email']}, function(error){
            if(error){
        		console.log(error.reason);
    		} else {
        		var currentRoute = Router.current().route.getName();
        		if(currentRoute == "login"){		//Else : don't redirect
            		Router.go("home");
        		}
    		}
		 });
	},
    
	'click #sign-up': function(event) { 

        document.getElementById("inputEmailGroup").className = "form-group";
        document.getElementById("inputPasswordGroup").className = "form-group";
        
        $('div[role="alert"]').hide();
        
		var email = $('[name=email-sign]').val().trim();
        var password = $('[name=password-sign]').val().trim();
        
        if(email == "") {
            $('#no-email').show();
            document.getElementById("inputEmailGroup").className = "form-group has-error";
        }
        else if(!isValidEmail(email)) {
            $('#not-valid-email').show();
            document.getElementById("inputEmailGroup").className = "form-group has-error";
        }
        else if(password == "") {
            $('#no-password').show();
            document.getElementById("inputPasswordGroup").className = "form-group has-error";
        }
        else if(password.length < 6) {
            $('#not-valid-password').show();
            document.getElementById("inputPasswordGroup").className = "form-group has-error";
        }
        else {
            $('#sign-up').hide();
            $('#sign-up-chargement').show();

            Accounts.createUser({email: email, password: password}, function(error){
                if(error){
                    console.log(error.reason);
                    if(error.reason === "Email already exists.") {
                        $('#existing-email').show();
                        document.getElementById("inputEmailGroup").className = "form-group has-error";
                    }
                    else 
                       console.log('We are sorry but something went wrong.');
                
                $('#sign-up-chargement').hide();
                $('#sign-up').show();
                }
                else {
                    console.log("test");
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute === "login"){		//Else : don't redirect
                        Router.go("home");
                    }
                    
                    // Show pop up.
                    $('#sign-up-success').show();                    
                }
            });
        }
	},
    
    'click #forgottenPassword': function(event) {

        swal({
            title: "Changement de mot de passe", 
            text: "Un email sera envoyé a votre adresse email afin de réinitialiser votre mot de passe.\nVeuillez rentrer votre adresse email dans le champ suivant.", 
            type: "input",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirmer",
            cancelButtonText:"Annuler",
            closeOnConfirm: false,
            inputPlaceholder: "Write something"
        },

        function(email) {
            if (email === "") {
                swal.showInputError("Veuillez entrer une adresse email !");
                return false;
            }
            else if(!isValidEmail(email)) {
                swal.showInputError("Veuillez entrer une adresse email valide !");
                return false;
            }
            else { // The email format is valid
                var email = email.trim();
                console.log(email);
                Accounts.forgotPassword({email: email}, function(error) {
                    if (error) {
                        console.log(error.reason);
                        if (error.message == 'User not found [403]')
                            swal.showInputError("Cette adresse mail n'existe pas.");
                    } 
                    else {
                        swal("Succès !", "Un email a été envoyé, vérifiez votre boite mail.", "success");  
                    }
                });
            }
        });
    },
    
});	