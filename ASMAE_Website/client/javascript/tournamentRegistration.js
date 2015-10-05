Template.TournamentRegistration.helpers({

	'lastname': function(){
	
		var user=Meteor.user();

		if(user==null){
			return "no info";
		}
		else{
			
			var userData = UserList.find({email: user.emails[0].address}).fetch();

			if (userData[0].lastname==null){
				return "my last name";
			}
			else{
				return userData[0].lastname;
			}
		}
	},
	'firstname': function(){
		var user=Meteor.user();

		if(user==null){
			return "no info";
		}
		else{
			var userData = UserList.find({email: user.emails[0].address}).fetch();

			if (userData[0].firstname==null){
				return "my first name";
			}
			else{
				return userData[0].firstname;
			}
		}
	},
	'email': function(){
		var user=Meteor.user();

		if(user==null){
			return "no info";
		}
		else{
			var userData = UserList.find({email: user.emails[0].address}).fetch();

			if (userData[0].email==null){
				return "my_email@gmail.com";
			}
			else{
				return userData[0].email;
			}
		}
	},
	'phone': function(){
		var user=Meteor.user();

		if(user==null){
			return "no info";
		}
		else{
			var userData = UserList.find({email: user.emails[0].address}).fetch();

			if (userData[0].phone==null){
				return "000/000000";
			}
			else{
				return userData[0].phone;
			}
		}
	},
	'date': function(){
		var user=Meteor.user();

		if(user==null){
			return "no info";
		}
		else{
			var userData = UserList.find({email: user.emails[0].address}).fetch();

			if (userData[0].date==null){
				return "1990-01-01";
			}
			else{
				return userData[0].date;
			}
		}
	}
});