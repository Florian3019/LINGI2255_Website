Template.tournamentRegistration.helpers({

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
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.firstName':1});
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
				addressData = Addresses.findOne({_id:userData.profile.addressID},{'zipcode':1});
				return addressData ? addressData.zipcode : "";
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



Template.tournamentRegistration.events({

    'submit form':function(){
    	// console.log(event);

    	function set_error(id,errorVisible) {
    		const error = "Error";
    		const OK = "OK";
    		const div = "Div";

			var e = document.getElementById(id.concat(error));
			if(!errorVisible){
				e.style.display = 'none';
				document.getElementById(id.concat(div)).className = "form-group has-success has-feedback";
			}else{
				e.style.display = 'block';
				document.getElementById(id.concat(div)).className = "form-group has-error has-feedback";
			}

			e = document.getElementById(id.concat(OK));
			if(errorVisible)
				e.style.display = 'none';
			else
				e.style.display = 'block';  	
		}

		var errors = new Array();
		var hasError = false;


    	var email = event.target.emailPlayer.value;
    	// Check that we know that email
    	var u = Meteor.users.findOne({emails: {$elemMatch: {address:email}}});
    	if(!u){
    		errors.push({id:"emailPlayer", error:true});
			hasError = true;
    	}
    	else{
    		errors.push({id:"emailPlayer", error:false});
    	}
    	// Check that that email is not already in a pair
    	var currentYear = 2015;


      	event.preventDefault();
        var lastname = event.target.lastname.value;
        if(!lastname){
        	errors.push({id:"lastname", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"lastname", error:false});
        }
        var firstname = event.target.firstname.value;
        if(!firstname){
        	errors.push({id:"firstname", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"firstname", error:false});
        }
        var phone = event.target.phone.value;
        var sex = event.target.sex.value;
        if(!sex){
        	errors.push({id:"sex", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"sex", error:false});
        }
        var birthDate = event.target.birth.value;
        if(!birthDate){
        	errors.push({id:"birth", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"birth", error:false});
        }
        var AFT = event.target.rank.value;
		if(!AFT || AFT==""){
        	errors.push({id:"AFT", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"AFT", error:false});
        }
        var street = event.target.street.value;
        if(!street || street==""){
        	errors.push({id:"street", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"street", error:false});
        }
        var addressNumber = event.target.addressnumber.value;
        if(!addressNumber){
        	errors.push({id:"number", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"number", error:false});
        }
        var boxNumber = event.target.box.value;

		var zipcode = event.target.zipcode.value;
        if(!zipcode){
        	errors.push({id:"zipcode", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"zipcode", error:false});
        }
        var city = event.target.city.value;
        if(!city){
        	errors.push({id:"city", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"city", error:false});
        }
        var country = event.target.country.value;
        if(!country){
        	errors.push({id:"country", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"country", error:false});
        }
        // TODO : store these in the DB
        var dateMatch = event.target.dateMatch.value;
        if(!dateMatch){
        	errors.push({id:"dateMatch", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"dateMatch", error:false});
        }
		var playerWishes = event.target.playerWishes.value;
		var playerConstraints = event.target.playerConstraints.value;

		addressData = {
			street : street,
			box : boxNumber,
			number : addressNumber,
			zipcode : zipcode,
			city : city,
			country : country
		};

		// If user has already an address, update that one instead of creating a new one
		var user = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
		if(user){
			addressData._id = user.profile.addressID;
			console.log("found existing address !");
		}

        data = { 
          _id: Meteor.userId(),
          // emails : [{"address": email, "verified":false}],
          profile:{
            lastName : lastname,
            firstName : firstname,
            phone : phone,
            gender : sex,
            birthDate : birthDate,
            AFT : AFT
          }
        };

        // console.log(addressData);
        console.log(errors);
        for(var i in errors){
        	var d = errors[i];
        	set_error(d.id, d.error);
        }
        if(hasError) return false;


        Meteor.call('updateAddress', addressData, data._id, null);
        Meteor.call('updateUser', data);
      	Router.go('home');
    }


  }); 