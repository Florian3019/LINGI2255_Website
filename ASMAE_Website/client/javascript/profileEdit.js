/*Template.profileEdit.helpers({
	'lastname': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.lastName':1});
			return userData ? userData.profile.lastName : "";
		}
	},
	'firstname': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.firstname':1});
			return userData ? userData.profile.firstName : "";
		}
	},
	'phone': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.phone':1});
			return userData ? userData.profile.phone : "";
		}
	},
	'date': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.birthDate':1});
			return userData ? userData.profile.birthDate : "";
		}
	},
	'AFT': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.AFT':1});
			return userData ? userData.profile.AFT : "";
		}
	},
	'gender': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.gender':1});
			return userData ? userData.profile.gender : "";
		}
	},
	'street': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
			if (!userData){
				return "";
			}
			else{
				addressData = Addresses.findOne({_id:userData.profile.addressID}, {'street':1});
				return addressData ? addressData.street : "";
			}
		}
	},
	'addressNumber': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
			if (!userData){
				return "";
			}
			else{
				addressData = Addresses.findOne({_id:userData.profile.addressID}, {'number':1});
				return addressData ? addressData.number : "";
			}
		}
	},
	'boxNumber': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
			if (!userData){
				return "";
			}
			else{
				addressData = Addresses.findOne({_id:userData.profile.addressID},{'box':1});
				return addressData ? addressData.box : "";
			}
		}
	},
	'zipcode': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
			if (!userData){
				return "";
			}
			else{
				addressData = Addresses.findOne({_id:userData.profile.addressID},{'zipCode':1});
				return addressData ? addressData.zipCode : "";
			}
		}
	},
	'city': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
			if (!userData){
				return "";
			}
			else{
				addressData = Addresses.findOne({_id:userData.profile.addressID},{'city':1});
				return addressData ? addressData.city : "";
			}
		}
	},
	'country': function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
			if (!userData){
				return "";
			}
			else{
				addressData = Addresses.findOne({_id:userData.profile.addressID},{'country':1});
				return addressData ? addressData.country : "";
			}
		}
	}
});
*/
Template.profileEdit.events({
	'submit form': function(event){
		event.preventDefault();
		var address = {
			street : $('[name=street]').val(),
			number : $('[name=addressNumber]').val(),
			box : $('[name=box]').val(),
			city : $('[name=city]').val(),
			zipCode : $('[name=zipcode]').val(),
			country : $('[name=country]').val()
		};


		Meteor.call('updateAddress',address,this.user._id, function(error, result){
			if(error){
				console.error('profileEdit adress error');
				console.error(error);
			}
			else if(result == null){
				console.error("No result");
			}
		});

		var lastName = $('[name=lastname]').val();
		var firstName = $('[name=firstname]').val();
		//var email TODO
		var sex = $('[name=sex]').val();
		var rank = $('[name=rank]').val();

		var userData = {
			_id: this.user._id,
			profile:{
				lastName : lastName,
				firstName : firstName,
				phone : $('[name=phone]').val(),
				gender : sex,
				birthDate : $('[name=birth]').val(),
				AFT : rank,
			}
		};

		Meteor.call('updateUser',userData, function(error, result){
			if(error){
				console.error('profileEdit player error');
				console.error(error);
			}
			else if(result == null){
				console.error("No result");
			}

		});
		Router.go('home');

	}
});
