Template.tournamentRegistration.helpers({
	'alonePlayers' : function(){
		var res = Pairs.find({player2:{$exists:false}});
		return res;
	},

	'getPlayer' : function(userId){
		return Meteor.users.find({_id:userId},{profile:1});
	},

	'getCity' :function(addressID){
		var res = Addresses.find({_id:addressID});
		return res;
	},

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
	'setGender' : function(male){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.gender':1});

			if(userData.profile.gender=="homme" && male=='true'){
				return "checked";
			}
			else if(userData.profile.gender=="femme" && male=='false'){
				return "checked";
			}
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



Template.tournamentRegistration.events({

	"change .checkboxAloneDiv input": function (event) {
		var e = document.getElementById("emailPlayer");
		var table = document.getElementById("tableAlone");
		var later = document.getElementById("checkboxLater");
		document.getElementById("later").checked = false; // reset "later" checkbox
		if(event.target.checked){
			later.style.display = 'block';
			table.style.display = 'block';
			e.setAttribute("disabled","true");
		}else{
			later.style.display = 'none';
			table.style.display = 'none';
			e.removeAttribute("disabled","false");
		}
    },

    "change .checkboxLater input": function (event) {
		var table = document.getElementById("tableAlone");
		if(event.target.checked){
			table.style.display = 'none';
		}else{
			table.style.display = 'block';
		}
    },

    "click .aloneRow" : function (event){
    	var previousId = Session.get('aloneSelected');
    	if(previousId){
    		document.getElementById(previousId).className = "aloneRow";
    	}
    	var newId = event.target.parentElement.id;
    	document.getElementById(newId).setAttribute("class", "aloneRow success");
    	Session.set('aloneSelected', newId); // Set the player's id in the session variable aloneSelected
    },

    'submit form':function(){

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

		document.getElementById("emailPlayerDiv").removeAttribute("class", "has-success has-error");
		document.getElementById("emailPlayerError").style.display = 'none'
		document.getElementById("emailPlayerOK").style.display = 'none'
		
		var errors = new Array();
		var hasError = false;

		var alone = event.target.alone.checked;
		var player2ID;
		if(!alone){
	    	var email = event.target.emailPlayer.value;
	    	// Check that we know that email
	    	var u = Meteor.users.findOne({emails: {$elemMatch: {address:email}}});
	    	if(!u){
	    		errors.push({id:"emailPlayer", error:true});
				hasError = true;
	    	}
	    	else{
	    		player2ID = u._id;
	    		errors.push({id:"emailPlayer", error:false});
	    	}
    	}

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

		addressData = {
			street : street,
			box : boxNumber,
			number : addressNumber,
			zipCode : zipcode,
			city : city,
			country : country
		};

		// If user has already an address, update that one instead of creating a new one
		var user = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
		if(user){
			addressData._id = user.profile.addressID;
			console.log("found existing address !");
		}

        player1Data = { 
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

        // Check that that email is not already in a pair
    	var currentYear = 2015;

		var playerWishes = event.target.playerWishes.value;
		var playerConstraints = event.target.playerConstraints.value;
		var BBQval = event.target.BBQ.value;

		var later = event.target.later.checked;

		var playerData = {
			_id:Meteor.userId(),
			extras:{
				BBQ:BBQval
			},
			wish:playerWishes,
			constraint:playerConstraints
			// paymentID:<paymentID>
		};


		var pairData;
		if(alone && !later){
    		// Player wants to register alone but chose a partner in the list

    		var player1_pairID = Session.get('aloneSelected'); // The player's 1 pair id, from the selected item in the list
    		if(!player1_pairID){
    			// errors.push({id:"checkboxAlone", error:true});
        		hasError = true;
        	}
    		pairData = {
    			_id:player1_pairID,
				player2:playerData
		    };

    	}
    	else{

    		if(alone){
    			// Player wants to register alone but wants to wait for another to join on him
	    		pairData = {
		    		year:currentYear,
					day: dateMatch,
					//category:<category>, TODO
					player1:playerData
		    	};
    		}
    		else{
    			// Player registers a pair
		    	pairData = {
		    		year:currentYear,
					day: dateMatch,
					//category:<category>, TODO
					player1:playerData,
					player2:{_id:player2ID} // TODO--> give all player info
		    	};
		    }
    	}
 
        for(var i in errors){
        	var d = errors[i];
        	set_error(d.id, d.error);
        }
        if(hasError) return false;


        Meteor.call('updateAddress', addressData, Meteor.userId(), null);
        Meteor.call('updateUser', player1Data);
        Meteor.call('updatePairs', pairData);
        Session.set('aloneSelected',null); // To avoid bugs if trying to register again
      	Router.go('home');
    }


  }); 