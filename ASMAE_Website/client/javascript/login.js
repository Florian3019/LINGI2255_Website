Template.login.events({
    'submit form': function(event){
        document.getElementById("user").className = "form-group";
        document.getElementById("user-error-message").style.display = "none";
        document.getElementById("password").className = "form-group";
        document.getElementById("password-error-message").style.display = "none";
        
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
    		if(error){
        		console.log(error.reason);
                if(error.reason == "User not found"){
                    document.getElementById("user-error-message").style.display = "block";
                    document.getElementById("user").className = "has-error";                 
                }
                if(error.reason == "Incorrect password"){
                    document.getElementById("password-error-message").style.display = "block";
                    document.getElementById("password").className = "has-error";
                }
    		} 
            else {
        		var currentRoute = Router.current().route.getName();
        		if(currentRoute == "login"){		//Else : don't redirect
            		Router.go("home");
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
        
        function isValidEmail(email) {
            var re = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');
            return re.test(email);
        }
        
        $('div[role="alert"]').hide();
        
		var userName = $('[name=username-sign]').val().trim();
		var email = $('[name=email-sign]').val().trim();
        var password = $('[name=password-sign]').val().trim();
        if(userName == "")
            $('#no-username').show();
        else if(userName.length < 3)
            $('#not-valid-username').show();
        else if(email == "")
            $('#no-email').show();
        else if(!isValidEmail(email))
            $('#not-valid-email').show();
        else if(password == "")
            $('#no-password').show();
        else if(password.length < 6)
            $('#not-valid-password').show();
        else {
            Accounts.createUser({username: userName, email: email, password: password}, function(error){
                if(error){
                    console.log(error.reason);
                    if(error.reason == "Username already exists.")
                        $('#existing-username').show();
                    if(error.reason == "Email already exists.")
                        $('#existing-email').show();
                    if(error.reason == "Email not verified.") {
                        $('#sign-up-success').show();
                        document.getElementById("welcom-message").innerHTML = "Bienvenue " + userName;
                        document.getElementById("e-mail-registration").href="mailto:"+email;
                        document.getElementById("e-mail-registration").innerHTML=email;
                        $('#signModal').modal('show');
                    }
                } else {
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute == "login"){		//Else : don't redirect
                        Router.go("home");
                    }
                    
                }
            });
        }
	},
    
});	