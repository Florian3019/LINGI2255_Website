Template.confirmation_registration_player.helpers({
	
	'user': function() {
		var userData = Meteor.users.findOne({_id:Meteor.userId()});
		return userData;
	},
	
	'birthDate': function() {
		var date = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.birthDate':1})).profile.birthDate;
		date = date.substring(8,10) + "/" + date.substring(5,7) + "/" + date.substring(0,4);
		return date;
	},
	
	'phoneNbr': function() {
		var phone = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.phone':1})).profile.phone;
		phone = phone.substring(0,4) + "/" + phone.substring(4,6) + "." + phone.substring(6,8) + "." + phone.substring(8,10);
		return phone;
	},
	
	'address': function() {
		var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
		var add = Addresses.findOne({_id:userData.profile.addressID});
		if (add.box) {
			return add.number + ", " + add.street + ". Boite " + add.box;
		}
		return add.number + ", " + add.street;
	},
	
	'zip': function() {
		var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
		var z = Addresses.findOne({_id:userData.profile.addressID});
		return z.zipCode
	},
	
	'city': function() {
		var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
		var c = Addresses.findOne({_id:userData.profile.addressID});
		return c.city
	},
});