Template.tournamentRegistration.helpers({

	'lastname': function(){
	
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			
			var userData = Meteor.users.find({_id:Meteor.userId()}, {'profile.lastName':1}).fetch();
			if (!userData[0].profile.lastName){
				return "my last name";
			}
			else{
				return userData[0].profile.lastName;
			}
		}
	},
	'firstname': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.find({_id:Meteor.userId()}, {'profile.firstName':1}).fetch();
			if (!userData[0].profile.firstName){
				return "my first name";
			}
			else{
				return userData[0].profile.firstName;
			}
		}
	},
	'email': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.find({_id:Meteor.userId()}, {'emails':1}).fetch();
			if (!userData[0].emails[0]){
				return "";
			}
			else{
				return userData[0].emails[0].address;
			}
		}
	},
	'phone': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.find({_id:Meteor.userId()}, {'profile.phone':1}).fetch();
			if (!userData[0].profile.phone){
				return "";
			}
			else{
				return userData[0].profile.phone;
			}
		}
	},
	'date': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.find({_id:Meteor.userId()}, {'profile.birthDate':1}).fetch();
			if (!userData[0].profile.birthDate){
				return "";
			}
			else{
				return userData[0].profile.birthDate;
			}
		}
	}



});



Template.tournamentRegistration.events({

    'submit form':function(){
    	console.log(event);
      event.preventDefault();
        var lastname = event.target.lastname.value;
        var firstname = event.target.firstname.value;
        var email = event.target.email.value;
        var phone = event.target.phone.value;
        var sex = event.target.sex.value;
        console.log(sex);
        // var password = event.target.password.value;
        var birthDate = event.target.birth.value;

        // TODO : store address info 
        var address = event.target.address.value;
        var addressNumber = event.target.addressnumber.value;
        var boxNumber = event.target.box.value;
		var zipcode = event.target.zipcode.value;
        var city = event.target.city.value;
        var country = event.target.country.value;
        var AFT = event.target.rank.value;
        var dateMatch = event.target.dateMatch.value;
		var playerWishes = event.target.playerWishes.value;
		var playerConstraints = event.target.playerConstraints.value;


        data = { 
          _id: Meteor.userId(),
          emails : [{"address": email, "verified":false}],
          profile:{
            lastName : lastname,
            firstName : firstname,
            phone : phone,
            gender : sex,
            birthDate : birthDate
          }
        };

        console.log(data);

        Meteor.call('updateUser', data);
      	Router.go('home');
    }


  }); 