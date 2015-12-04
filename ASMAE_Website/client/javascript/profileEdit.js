/*
	This file allows the user to modify its profile
*/
Template.profileEdit.helpers({
	mail : function(){
		return this.user.emails[0].address;
	},
  getDate : function(){
    return this.user.profile.birthDate.getDate();
  },
  getMonth : function(){
    return this.user.profile.birthDate.getMonth()+1;
  },
  getYear : function(){
    return this.user.profile.birthDate.getFullYear();
  },
});

Template.profileEdit.helpers({
	'getPlayer' : function(){
		var user = Meteor.users.findOne({_id:this.ID});
		var address = Addresses.findOne({_id:user.profile.addressID});
		var data = {};
		data.user = user;
		data.address = address;

		return data;
	}

});

Template.profileEdit.events({
	'submit form': function(event){
		event.preventDefault();
		var address = {
			street : $('[name=street]').val(),
			number : $('[name=addressNumber]').val(),
			box : $('[name=box]').val(),
			city : $('[name=city]').val(),
			zipCode : $('[name=zipcode]').val(),
			country : $('[name=country]').val(),
			isCourtAddress : false
		};

		var user = Meteor.users.findOne({_id:this.ID},{"profile.addressID":1});

		// If user has an address, update that one
		if(user.addressID!==undefined){
			address._id = user.addressID;
		}

		var lastName = $('[name=lastname]').val();
		var firstName = $('[name=firstname]').val();
		//var email TODO
		var sex = $('[name=sex]').val();
		var rank = $('[name=rank]').val();

	    var birthDay = event.target.birthDay.value;
	    var birthMonth = event.target.birthMonth.value;
	    var birthYear = event.target.birthYear.value;

	    var birthDate = new Date(birthYear % 100, birthMonth-1, birthDay);

		var userData = {
			_id: this.ID,
			profile:{
				lastName : lastName,
				firstName : firstName,
				phone : $('[name=phone]').val(),
				gender : sex,
				birthDate : birthDate,
				AFT : rank,
			}
		};

		Meteor.call('updateAddress',address, function(error, result){
			if(error){
				console.error('profileEdit adress error');
				console.error(error);
			}
			else if(result == null){
				console.error("No result");
			}

			userData.profile.addressID = result;// Link the address
			Meteor.call("updateUser", userData);
		});

		Router.go('home');

	}
});
