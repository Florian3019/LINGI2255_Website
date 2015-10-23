Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
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
	
});	