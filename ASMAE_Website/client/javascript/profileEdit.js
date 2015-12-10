Template.profileEdit.onRendered(function () {
	var user = Meteor.user();
	var rankSelect = document.getElementById('rank');
	if(typeof user.profile.AFT !== 'undefined'){
		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
		var maximumAFT = Years.findOne({_id: currentYear}, {fields: {maximumAFT: 1}}).maximumAFT;
		var maxAFTindex = AFTrankings.indexOf(maximumAFT);
		var userAFTindex = AFTrankings.indexOf(user.profile.AFT);
		if(userAFTindex > maxAFTindex){
			rankSelect.value = "NC";
		}
		else{
			rankSelect.value = user.profile.AFT;
		}
	}
	else{
		rankSelect.value = "NC";
	}

});

/*
	This file allows the user to modify its profile
*/
Template.profileEdit.helpers({
	'mail': function(){
		return this.user.emails[0].address;
	},
  	'getDate': function(){
    	return this.user.profile.birthDate.getDate();
  	},
  	'getMonth': function(){
    	return this.user.profile.birthDate.getMonth()+1;
  	},
  	'getYear' : function(){
    	return this.user.profile.birthDate.getFullYear();
  	},

	'getPlayer' : function(){
		var user = Meteor.users.findOne({_id:this.ID});
		var address = Addresses.findOne({_id:user.profile.addressID});
		var data = {};
		data.user = user;
		data.address = address;

		return data;
	},

	'okAFTranking': function(){
		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
		var maximumAFT = Years.findOne({_id: currentYear}, {fields: {maximumAFT: 1}}).maximumAFT;
		var AFTarray = [];
		var i = 0;
		while(AFTrankings[i] !== maximumAFT){
			AFTarray.push(AFTrankings[i]);
			i++;
		}
		AFTarray.push(maximumAFT);
		return AFTarray;
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
		var sex = $('[name=sex]').val();
		var rank = $('[name=rank]').val();

	    var birthDay = event.target.birthDay.value;
	    var birthMonth = event.target.birthMonth.value;
	    var birthYear = event.target.birthYear.value;

	    var birthDate = new Date(birthYear, birthMonth-1, birthDay);

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

		swal({
			title: "Succès !",
			text: "Ce profil a bien été mis à jour.",
			type: "success",
			showCancelButton: false,
			confirmButtonColor: "#3085d6",
			confirmButtonText: "Ok",
			closeOnConfirm: true
		});

	}
});
