var aloneDependency = new Deps.Dependency();

function isEmptyTable() {
	return Session.get("emptyTable");
}

Template.tournamentRegistration.helpers({
	'getTournamentPrice':function(){
		var currentYear = (GlobalValues.findOne({_id:"currentYear"})).value;
		return Years.findOne({_id:currentYear}).tournamentPrice;
	},

    'getPay1' : function() {
        return paymentTypes[0];
    },

    'getPay2' : function() {
        return paymentTypes[1];
    },

    'getPay3' : function() {
        return paymentTypes[2];
    },

    'alonePlayers' : function() {
        function setAlonePlayers(){

    		if (Session.get("firstTime")) {
				console.log("returning undefined yey yey");
    			return undefined;
    		}

    		function checkErrors() {
    			/**
    				This function sets an error for the element id, provided that elements with id+Error, id+OK and id+Div are set in the html.
    				If errorVisible is true, this displays the error corresponding to id. Else, sets the field to success.
    			*/
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

    			/*
    				Get all the fields and check if they are filled,
    				display error or success according to that
    	    	*/
    	        var male = document.getElementById("male").checked;
    			var female = document.getElementById("female").checked;
    	        if(!male && !female){
    	        	errors.push({id:"sex", error:true});
    	        	hasError = true;
    	        }
    	        else{
    	        	errors.push({id:"sex", error:false});
    	        }

    			// Birthdate
    	        var birthDay = document.getElementById("birthDay").value;
    			var birthMonth = document.getElementById("birthMonth").value;
    			var birthYear = document.getElementById("birthYear").value;
    	        if(!birthDay || birthDay > 31 || birthDay < 1){
    	        	errors.push({id:"birthDay", error:true});
    	        	hasError = true;
    	        }
    	        else{
    	        	errors.push({id:"birthDay", error:false});
    	        }
    			if(!birthMonth || birthMonth > 12 || birthMonth < 1){
    	        	errors.push({id:"birthMonth", error:true});
    	        	hasError = true;
    	        }
    	        else{
    	        	errors.push({id:"birthMonth", error:false});
    	        }
                var currentYear = (GlobalValues.findOne({_id:"currentYear"})).value;
                var tournamentDate = (Years.findOne({_id:currentYear})).tournamentDate;
    			if(!birthYear || birthYear < 1900 || birthYear > tournamentDate.getFullYear() - 9){
    	        	errors.push({id:"birthYear", error:true});
    	        	hasError = true;
    	        }
    	        else{
    	        	errors.push({id:"birthYear", error:false});
    	        }
    			// new Date object for the birthdate. Year : only 2 last digits. Month : from 0 to 11.
    			//var birthDate = new Date(birthYear % 100, birthMonth-1, birthDay);

    	        var dateMatch = document.getElementById("dateMatchSelect").value;
    	        if(!dateMatch){
    	        	errors.push({id:"dateMatch", error:true});
    	        	hasError = true;
    	        }
    	        else{
    	        	errors.push({id:"dateMatch", error:false});
    	        }

                if (dateMatch === 'family' && !acceptForFamily(new Date(birthYear, birthMonth-1, birthDay))) {
                    errors.push({id:"family", error:true});
                    hasError = true;
                }
                else {
                    errors.push({id:"family", error:false});
                }

    			/*
    				Display all errors
    	 		*/
    	        for(var i in errors){
    	        	var d = errors[i];
    	        	set_error(d.id, d.error);
    	        }

    	        if(hasError){
    	        	console.log("At least one field is missing or mis-filled");
    				return true;
    	        }

    			return false;
    		}

    		var check = checkErrors();
    		var e = document.getElementById("refreshErrorMessage");
    		if (check) { // An error occurred (mis-filled field)
    			e.style.display = 'block';
    			return undefined;
    		}
    		else {
    			e.style.display = 'none';
    		}

    		var temp = document.getElementById("dateMatchSelect");
    		var tournamentDateMatch = temp.options[temp.selectedIndex].value;
    		var date = new Date(document.getElementById("birthYear").value,document.getElementById("birthMonth").value-1,document.getElementById("birthDay").value);
    		var age = getAge(date);
			Session.set("age", age);

    		var male = document.getElementById("male").checked;
			var gender;
    		if (male) {
    			gender = "M";
    		}
    		else {
    			gender = "F";
    		}
			Session.set("gender",gender);

            var type = getTypeForPlayer(tournamentDateMatch, gender);
    		var category = getCategory(age);
			Session.set("type",type);
			Session.set("category",category);
            var pairsAlonePlayers = Meteor.call('getPairsAlonePlayers', type, category, date, gender, function(err, returnValue) {
				if (returnValue===undefined || returnValue.length < 1) {
					Session.set("emptyTable", true);
				}
				else {
					Session.set("emptyTable", false);
				}
                Session.set("alonePlayers", returnValue);
            });
    	}

        aloneDependency.depend(); // Refresh when button is hit
        setAlonePlayers();
        var alone = Session.get("alonePlayers");
        return alone;
    },

	'emptyTableMessage' : function() {
		aloneDependency.depend();
		var type = Session.get("type");
		var category = Session.get("category");
		var age = Session.get("age");
		var gender = Session.get("gender");
		if (type==="family") {
			if (age >= 25) {
				return "Aucun joueur seul de moins de 15 ans n\'est en attente pour le tournoi des familles.";
			}
			else {
				return "Aucun joueur seul de plus de 25 ans n\'est en attente pour le tournoi des familles.";
			}
		}
		else if(type=="mixed") {
			if (gender == "M") {
				return "Aucune joueuse dans la catégorie "+categoriesTranslate[categoriesKeys[2]]+" n\'est en attente pour le tournoi mixte.";
			}
			else {
				return "Aucun joueur dans la catégorie "+categoriesTranslate[categoriesKeys[2]]+" n\'est en attente pour le tournoi mixte.";
			}
		}
		else {
			if (gender == "M") {
				return "Aucun joueur dans la catégorie "+categoriesTranslate[categoriesKeys[2]]+" n\'est en attente pour le tournoi des doubles messieurs.";
			}
			else {
				return "Aucune joueuse dans la catégorie "+categoriesTranslate[categoriesKeys[2]]+" n\'est en attente pour le tournoi des doubles dames.";
			}
		}
	},

	'getPlayer' : function(userId){
		return Meteor.users.findOne({_id:userId},{profile:1});
	},

	'getCity' :function(addressID){
        if (typeof addressID === 'undefined') {
            return undefined;
        }
		var res = Addresses.findOne({_id:addressID});
        if (typeof res === 'undefined') {
            return undefined;
        }
		return res.city;
	},

	/*
	* @param birthDate is of type Date
	* @param todayDate give an optional today date (e. g. date of the tournament)
	*/
	'getAge' : function(birthDate){
        var currentYear = (GlobalValues.findOne({_id:"currentYear"})).value;
        var tournamentDate = (Years.findOne({_id:currentYear})).tournamentDate;
	    var age = tournamentDate.getFullYear() - birthDate.getFullYear();
	    var m = tournamentDate.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && tournamentDate.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
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

			if(userData.profile.gender=="M" && male=='true'){
				return "checked";
			}
			else if(userData.profile.gender=="F" && male=='false'){
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
	'getDate' : function(){
		var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.birthDate':1});
            if (typeof userData.profile.birthDate !== 'undefined') {
                return userData.profile.birthDate.getDate();
            }
            return "";
    	}
  	},
  	'getMonth' : function(){
    	var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.birthDate':1});
			if (typeof userData.profile.birthDate !== 'undefined') {
                return userData.profile.birthDate.getMonth()+1;
            }
            return "";
    	}
  	},
  	'getYear' : function(){
    	var user=Meteor.user();

		if(user==null){
			return "";
		}
		else{
			var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.birthDate':1});
			if (typeof userData.profile.birthDate !== 'undefined') {
                return userData.profile.birthDate.getFullYear();
            }
            return "";
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
	},

	'extras': function () {
     	return Extras.find();
    },

    'getName': function(){
    	return this.name;
    },

    'getComment': function(){
    	return this.comment;
    },
    'getID': function(){
    	return this._id;
    },

    'getPrice': function(){
    	return this.price;
    }


});



Template.tournamentRegistration.events({
	"change .extraItem":function(event){
		var extras = document.getElementsByClassName("extraItem");

		var currentYear = (GlobalValues.findOne({_id:"currentYear"})).value;
		var tournamentPrice = Years.findOne({_id:currentYear}).tournamentPrice;
		total = tournamentPrice;
		for(var i=0;i<extras.length;i++){
			var extr = extras[i];
			var quantity = parseInt(extr.value,10);
			total += extr.dataset.price * quantity;
		}

		document.getElementById("totalToPay").value = total;
	},

	"change .checkboxAloneDiv input": function (event) {
		event.preventDefault();
		var e = document.getElementById("emailPlayer");
		var table = document.getElementById("tableAlone");
		var later = document.getElementById("checkboxLater");
		var refresh = document.getElementById("refresh");
		var message = document.getElementById("emptyTableMessage");
		document.getElementById("later").checked = false; // reset "later" checkbox
		Session.set("firstTime", false);
		aloneDependency.changed();


		if(event.target.checked){
			table.style.display = 'none';
			message.style.display = 'none';

			later.style.display = 'block';
			refresh.style.display = 'block';
			e.setAttribute("disabled","true");
			if (isEmptyTable()) {
				message.style.display = 'block';
			}
			else {
				table.style.display = 'block';
			}
		}else{
			later.style.display = 'none';
			table.style.display = 'none';
			refresh.style.display = 'none';
			message.style.display = 'none';
			e.removeAttribute("disabled","false");
		}
    },

    "change .checkboxLater input": function (event) {
		event.preventDefault();
		aloneDependency.changed();
		var table = document.getElementById("tableAlone");
		var message = document.getElementById("emptyTableMessage");
		if(event.target.checked){
			table.style.display = 'none';
			refresh.style.display = 'none';
			message.style.display = 'none';
		}else{
			refresh.style.display = 'block';
			if (isEmptyTable()) {
				message.style.display = 'block';
			}
			else {
				table.style.display = 'block';
			}
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

	"click [data-action='refresh']" : function(event) {
		event.preventDefault();
		aloneDependency.changed();

		var table = document.getElementById("tableAlone");
		var message = document.getElementById("emptyTableMessage");

		table.style.display = 'none';
		message.style.display = 'none';
		if (isEmptyTable()) {
			message.style.display = 'block';
		}
		else {
			table.style.display = 'block';
		}
	},

    "submit form":function(){

      	event.preventDefault();
    	/**
			This function sets an error for the element id, provided that elements with id+Error, id+OK and id+Div are set in the html.
			If errorVisible is true, this displays the error corresponding to id. Else, sets the field to success.
    	*/
    	function set_error(id, errorVisible) {
    		const error = "Error";
    		const OK = "OK";
    		const div = "Div";

			var e = document.getElementById(id.concat(error));
			if(!errorVisible){
				e.style.display = 'none';
				if(id=='emailPlayer'){
					document.getElementById("emailPlayerErrorMessage").style.display = 'none';
				}
				document.getElementById(id.concat(div)).className = "form-group has-success has-feedback";
			}else{
				if(id=='emailPlayer'){
					document.getElementById("emailPlayerErrorMessage").style.display = 'block';
				}
				e.style.display = 'block';
				document.getElementById(id.concat(div)).className = "form-group has-error has-feedback";
			}

			e = document.getElementById(id.concat(OK));
			if(errorVisible)
				e.style.display = 'none';
			else
				e.style.display = 'block';
		}



		/*
			Returns the pair if userId is already in a pair. Else, returns false.
		*/
		function getPairId(userId){
			var currentYear = GlobalValues.findOne({_id:"currentYear"}).value;
		    var res = Pairs.findOne({$or:[{"player1._id":userId, year:currentYear},{"player2._id":userId, year:currentYear}]}, {_id:1});
			if(res !== undefined){
				return res;
			}
			return false;

		}

		// Reset the email error status
		document.getElementById("emailPlayerDiv").removeAttribute("class", "has-success has-error");
		document.getElementById("emailPlayerError").style.display = 'none';
		document.getElementById("emailPlayerOK").style.display = 'none';
		document.getElementById("emailPlayerErrorMessage").style.display = 'none';

		// Array containing the errors/success to display
		var errors = new Array();
		var hasError = false;

		var sendEmail = false; //true if we must send an email

		var alone = event.target.alone.checked; // True if the player tries to register alone
		var player2ID;
		if(!alone && $(emailPlayerDiv).is(":visible")){
			// User wants to register a pair, collect the partner's id from his email.
	    	var email = event.target.emailPlayer.value;
	    	// Check that we know that email
	    	var u = Meteor.users.findOne({emails: {$elemMatch: {address:email}}});
	    	if(!u){
	    		// Send an email to the user
	    		sendEmail=true;
	    	}
	    	else{
	    		player2ID = u._id;
	    		errors.push({id:"emailPlayer", error:false});
	    	}
    	}


    	/*
			Get all the fields and check if they are filled,
			display error or success according to that
    	*/
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

		// Birthdate
        var birthDay = event.target.birthDay.value;
		var birthMonth = event.target.birthMonth.value;
		var birthYear = event.target.birthYear.value;
        if(!birthDay || birthDay > 31 || birthDay < 1){
        	errors.push({id:"birthDay", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"birthDay", error:false});
        }
		if(!birthMonth || birthMonth > 12 || birthMonth < 1){
        	errors.push({id:"birthMonth", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"birthMonth", error:false});
        }
        var currentYear = (GlobalValues.findOne({_id:"currentYear"})).value;
        var tournamentDate = (Years.findOne({_id:currentYear})).tournamentDate;
		if(!birthYear || birthYear < 1900 || birthYear > tournamentDate.getFullYear() - 9){
        	errors.push({id:"birthYear", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"birthYear", error:false});
        }
		// new Date object for the birthdate. Year : only 2 last digits. Month : from 0 to 11.
		var birthDate = new Date(birthYear % 100, birthMonth-1, birthDay);

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

        var dateMatch = event.target.dateMatch.value;
        if(!dateMatch){
        	errors.push({id:"dateMatch", error:true});
        	hasError = true;
        }
        else{
        	errors.push({id:"dateMatch", error:false});
        }
        if (dateMatch === 'family' && !acceptForFamily(new Date(birthYear, birthMonth-1, birthDay))) {
            errors.push({id:"family", error:true});
            hasError = true;
        }
        else {
            errors.push({id:"family", error:false});
        }


        /*
			Create the address object
        */
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
			//console.log("found existing address !");
		}


		/*
			Create the object with the informations about the user
		*/
        curUserData = {
          _id: Meteor.userId(),
          profile:{
            lastName : lastname,
            firstName : firstname,
            phone : phone,
            gender : sex,
            birthDate : birthDate,
            AFT : AFT
          }
        };

    	/*
			Collect player wishes/constraints
    	*/
		var playerWish = event.target.playerWish.value;
		var courtWish = event.target.courtWish.value;
		var otherWish = event.target.otherWish.value;

		var later = event.target.later.checked; // True if the user wants to waits for another user to chose him as partner

		/*
			Create the object containing the player specific informations
		*/
		var playerData = {
			_id:Meteor.userId(),
			extras : {},
			"playerWish":playerWish,
			"courtWish":courtWish,
			"otherWish":otherWish
		};

		var extras = Extras.find().fetch();
		var extrasPlayer = playerData.extras;

		for(var i=0;i<extras.length;i++){
			extrasPlayer[extras[i].name]=document.getElementById(extras[i]._id).value;
		}

		if(!$(emailPlayerDiv).is(":visible")){
			// the user wants to confirm his registration with a pair that already exists

			var pair = Session.get("pair");


			var pairData={
					_id:pair._id,
					player2:playerData
				};

		}
		else{

			var remove; // By default, this is undefine. If it is defined, contains the id of a pair to remove

			/*
			Depending if user wants to register alone or with a pair, choose appropriate action
			*/
			var pairData;
			if(alone && !later){
			var pair = getPairId(Meteor.userId() ); // != false if the user is already in a pair
			if( pair!=false ){
				// User is already in a pair

				// Check if he is player1 or player2:
				var player;
				if(!pair.player2){
					// User is trying to register again (he was alone) but with a pair this time
					// We need to remove the existing pair with him.
					remove = pair._id;
				}
				else{
					// User is trying to register, but he is already in a pair !
					document.getElementById("alreadyRegisteredErrorMessage").style.display = 'block';
					document.getElementById("checkboxAloneDiv").className = "form-group col-md-3 checkboxAloneDiv has-error";
					console.error("User is already registered in a pair");// TODO display notification
					hasError = true;
				}
			}


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
					day: dateMatch,
					player1:playerData
				};
			}
			else{
				// Player registers a pair
				pairData = {
					day: dateMatch,
					player2:playerData,  // Player2 because search for a single player is made on pairs with empty player2 field
				};
			}
			}
		}

 		/*
			Display all errors
 		*/
        for(var i in errors){
        	var d = errors[i];
        	set_error(d.id, d.error);
        }
        if(hasError){
        	console.log("An error occured");
        	return false; // Cancel form submission if errors occured
        }

        /*
			Update the db !
        */

        Meteor.call('updateAddress', addressData, function(err, res){
        	if(err){
        		console.error("tournamentRegistration : updateAddress error");
        		console.error(err);
        	}
        	curUserData.profile.addressID = res; // Set the addressID
        	Meteor.call('updateUser', curUserData);
        });


        var callback = function(err, pairID){
        	if(err){
        		console.log("error callback updatePair");
        		console.log(err);
        		return;
        	}

        	if(sendEmail){
	        	body=body+Router.routes['confirmPair'].url({_id: pairID});
		    		var data = {
		    			intro:"",
						message:body};
					Meteor.call('emailFeedback',to,"Demande d'inscription au Charles de Lorraine",Blaze.toHTMLWithData(Template.mail,data));
	        }

        	if(remove){
        		console.log("removing pair "+ remove);
        		Meteor.call('removePair',remove);
        	}
			Meteor.call('addPairToTournament', pairID, currentYear, dateMatch);
        }

        body="Bonjour, \n " + event.target.firstname.value + " " +event.target.lastname.value + " aimerait jouer avec vous au tournoi le Charles de Lorraine. Cliquez sur le lien suivant pour vous inscrire: "; //body of the email to send
        to=event.target.emailPlayer.value; //address of the other player


		//For the payment
		//Remark: we pass the paymentMethod to pairData but it won't be linked with the Pair in the database)
		//		  This is because a player can have multiple Pairs (multiple tournaments).
		pairData.paymentMethod = $('[name=paymentMethod]:checked').val();

		pairData.year = currentYear;
        Meteor.call('updatePair', pairData, callback);
        Session.set('aloneSelected',null); // To avoid bugs if trying to register again

    	Router.go('myRegistration');
    }


  });


  Template.tournamentRegistration.onCreated(function (){
	  this.subscribe("AddressesNoSafe"); //TODO: selective addresses ?
	  this.subscribe("users");
	  Session.set("firstTime", true); // How lovely it is
  });
