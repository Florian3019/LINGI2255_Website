/*
	This file defines how a user can register for the tournament
*/
var aloneDependency = new Deps.Dependency();

function isEmptyTable() {
	return Session.get("tournamentRegistration/emptyTable");
}

/**
 *	Sets the alone players in the table
 *	regarding the type and category of the
 *	user that wants to register for this tournament.
 *	Performs first a check on the fields that have to be filled
 *	in order to determine type and category.
 */
function setAlonePlayers(document){

	if (Session.get("tournamentRegistration/firstTime")) {
		return undefined;
	}

	var check = checkAloneErrors(document);
	var e = document.getElementById("refreshErrorMessage");
	if (check) { // An error occurred (mis-filled field)
		e.style.display = 'block';
		var table = document.getElementById("tableAlone");
		table.style.display = 'none';
		return undefined;
	}
	else {
		e.style.display = 'none';
	}

	var temp = document.getElementById("dateMatchSelect");
	var tournamentDateMatch = temp.options[temp.selectedIndex].value;
	var date = new Date(document.getElementById("birthYear").value,document.getElementById("birthMonth").value-1,document.getElementById("birthDay").value);
	var age = getAge(date);
	Session.set("tournamentRegistration/age", age);

	var sex = document.getElementById("sex").value;
	if (sex !== "F" && sex !== "M") {
		console.error("Error, user should have chosen a sex");
		return undefined;
	}
	var gender = sex;
	Session.set("tournamentRegistration/gender",gender);

	var type = getTypeForPlayer(tournamentDateMatch, gender);
	var category = getCategory(age);
	Session.set("tournamentRegistration/type",type);
	Session.set("tournamentRegistration/category",category);
	var pairsAlonePlayers = Meteor.call('getPairsAlonePlayers', type, category, date, gender, function(err, returnValue) {
		if (returnValue===undefined || returnValue.length < 1) {
			Session.set("tournamentRegistration/emptyTable", true);
		}
		else {
			Session.set("tournamentRegistration/emptyTable", false);
		}
		Session.set("tournamentRegistration/alonePlayers", returnValue);
	});
}

function set_error(id,errorVisible) {
		const error = "Error";
		const OK = "OK";
		const div = "Div";
		var e = document.getElementById(id.concat(error));
		if(!errorVisible){
			e.style.display = 'none';
			document.getElementById(id.concat(div)).className = "form-group AFTOK has-feedback";
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


function checkAloneErrors(document) {
	/**
		This function sets an error for the element id, provided that elements with id+Error, id+OK and id+Div are set in the html.
		If errorVisible is true, this displays the error corresponding to id. Else, sets the field to success.
	*/

	var errors = new Array();
	var hasError = false;

	/*
		Get all the fields and check if they are filled,
		display error or success according to that
	*/
	var sex = document.getElementById("sex").value;
	if(sex !== "M" && sex !== "F"){
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

Template.tournamentRegistration.helpers({
	'saturdayRegistration' : function() {
		var routeName = Router.current().route.getName();
		return routeName=="tournamentRegistrationSaturday";
	},
	'sundayRegistration' : function() {
		var routeName = Router.current().route.getName();
		return routeName=="tournamentRegistrationSunday";
	},
	'getSaturdayData' : function() {
		var parts = location.href.split('/');
		var id = parts.pop();
		var user = Meteor.users.findOne({_id:id});
		user["day"] = "saturday";
		return {data:user};
	},
	'getSundayData' : function() {
		var parts = location.href.split('/');
		var id = parts.pop();
		var user = Meteor.users.findOne({_id:id});
		user["day"] = "sunday";
		return {data:user};
	}
});

Template.tournamentRegistrationTemplate.helpers({

	'getAddress' : function(addressID) {
		return Addresses.findOne({_id:addressID});
	},

	'isSaturday' : function(day) {
		return day=="saturday";
	},

	'isSunday' : function(day) {
		return day=="sunday";
	},

	'getDay' : function() {
		var saturday = this.day=="saturday";
		var sunday = this.day=="sunday";
		var day = saturday ? "samedi" : "dimanche";
		return {saturday:saturday, sunday:sunday, day:day};
	},

	'getTournamentPrice':function(){
		var currentYear = (GlobalValues.findOne({_id:"currentYear"})).value;
		return Years.findOne({_id:currentYear}).tournamentPrice;
	},

	'getTranslatedDay' : function(day) {
		if (day!=="saturday" && day!=="sunday") {
			return undefined;
		}
		return day=="saturday" ? "samedi" : "dimanche";
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
		aloneDependency.depend(); // Refresh when button is hit

        setAlonePlayers(document);
        var alone = Session.get("tournamentRegistration/alonePlayers");
        return alone;
    },

	'emptyTableMessage' : function() {
		aloneDependency.depend();
		var type = Session.get("tournamentRegistration/type");
		var category = Session.get("tournamentRegistration/category");
		var age = Session.get("tournamentRegistration/age");
		var gender = Session.get("tournamentRegistration/gender");
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
				return "Aucune joueuse dans la catégorie "+categoriesTranslate[category]+" n\'est en attente pour le tournoi mixte.";
			}
			else {
				return "Aucun joueur dans la catégorie "+categoriesTranslate[category]+" n\'est en attente pour le tournoi mixte.";
			}
		}
		else {
			if (gender == "M") {
				return "Aucun joueur dans la catégorie "+categoriesTranslate[category]+" n\'est en attente pour le tournoi des doubles messieurs.";
			}
			else {
				return "Aucune joueuse dans la catégorie "+categoriesTranslate[category]+" n\'est en attente pour le tournoi des doubles dames.";
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


	'getDate' : function(date){
		return date!==undefined ? date.getDate() : undefined;
  	},
  	'getMonth' : function(date){
    	return date!==undefined ? date.getMonth()+1 : undefined;;
  	},
  	'getYear' : function(date){
    	return date!==undefined ? date.getFullYear() : undefined;
	},
	'getFormattedDate' : function(day) {
		var date = getTournamentDate();
		if (!date || !day) {
			return undefined;
		}
		var month;
		var d = date.getDate();
		d = day=="saturday" ? d : d+1;
		switch(date.getMonth()) {
			case 0: month="janvier"; break;
			case 1: month="février"; break;
			case 2: month="mars"; break;
			case 3: month="avril"; break;
			case 4: month="mai"; break;
			case 5: month="juin"; break;
			case 6: month="juillet"; break;
			case 7: month="août"; break;
			case 8: month="septembre"; break;
			case 9: month="octobre"; break;
			case 10: month="novembre"; break;
			case 11: month="décembre"; break;
			default: month="septembre"; break;
		}
		return d + " "+month+" "+date.getFullYear();
	},

	'extras': function (day) {
     	var extras = Extras.find({day:day}).fetch();
		if (extras===undefined) {
			return undefined;
		}
		var playerExtras = getDayExtrasFromPlayerID(Meteor.userId(),day);
		if (playerExtras === undefined) {
			return extras;
		}
		for (var i=0; i<playerExtras.length; i++) {
			var pExtra = playerExtras[i];
			for(var j=0; j<extras.length; j++) {
				var ex = extras[j];
				var qty = pExtra[ex.name];
				if (qty !== undefined) {
					ex.quantity = qty;
				}
			}
		}
		return extras;
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
    },

	'getQuantity': function(){
		return this.quantity;
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

var refreshAlonePlayers = function(event, document){
	event.preventDefault();
	aloneDependency.changed();

	var table = document.getElementById("tableAlone");
	var message = document.getElementById("emptyTableMessage");

	table.style.display = 'none';
	message.style.display = 'none';

	if(!document.getElementById('alone').checked || document.getElementById("later").checked){
		return;
	}
	if (isEmptyTable()) {
		message.style.display = 'block';
	}
	else {
		table.style.display = 'block';
	}
}


Template.tournamentRegistrationTemplate.events({
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

	"change .alonePlayerChangeListener":function(event){
        refreshAlonePlayers(event, document);
	},

	"change #alone": function (event) {
		event.preventDefault();
		var e = document.getElementById("emailPlayer");
		var table = document.getElementById("tableAlone");
		var later = document.getElementById("checkboxLater");
		var message = document.getElementById("emptyTableMessage");
		document.getElementById("later").checked = false; // reset "later" checkbox
		Session.set("tournamentRegistration/firstTime", false);
		aloneDependency.changed();

		if(event.target.checked){
			table.style.display = 'none';
			message.style.display = 'none';

			later.style.display = 'block';
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
			message.style.display = 'none';
			e.removeAttribute("disabled","false");
		}
    },

    "change #later": function (event) {
		event.preventDefault();
		aloneDependency.changed();
		var table = document.getElementById("tableAlone");
		var message = document.getElementById("emptyTableMessage");
		if(event.target.checked){
			table.style.display = 'none';
			message.style.display = 'none';
		}else{
			if (isEmptyTable()) {
				message.style.display = 'block';
			}
			else {
				table.style.display = 'block';
			}
		}
    },

    "click .aloneRow" : function (event){
    	var previousId = Session.get("tournamentRegistration/aloneSelected");
    	var newId = event.target.parentElement.id;
		var prevDoc = document.getElementById(previousId);
		var newDoc = document.getElementById(newId);
		if (newDoc==prevDoc) {
			if (newDoc.classList.contains("tr-selected-alone-row")) {
				newDoc.classList.remove("tr-selected-alone-row");
				Session.set("tournamentRegistration/aloneSelected", null);
			}
			else {
				newDoc.classList.add("tr-selected-alone-row");
				Session.set("tournamentRegistration/aloneSelected", newId);
			}
		}
		else {
			if (prevDoc && prevDoc.classList.contains("tr-selected-alone-row")) {
				prevDoc.classList.remove("tr-selected-alone-row");
			}
			if (!newDoc.classList.contains("tr-selected-alone-row")) {
				newDoc.classList.add("tr-selected-alone-row");
			}
			console.log(previousId + " / "+newId);
	    	Session.set("tournamentRegistration/aloneSelected", newId);
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
				var e = document.getElementById("AFTcheat");
				e.style.display = 'none';
				var e = document.getElementById("AFTDiv")
				e.className = "form-group has-feedback";

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


		// Reset the email error status
		document.getElementById("emailPlayerDiv").removeAttribute("class", "has-success has-error");
		document.getElementById("emailPlayerError").style.display = 'none';
		document.getElementById("emailPlayerOK").style.display = 'none';
		document.getElementById("emailPlayerErrorMessage").style.display = 'none';

		var alonePlayers = setAlonePlayers(document); // assigns type and category to session variable
		var userType = Session.get("tournamentRegistration/type");
		var userCategory = Session.get("tournamentRegistration/category");

		var parts = location.href.split('/');
		var userID = parts.pop();

		function getDayFromValue(dateMatchValue) {
			if (dateMatchValue == "family") {
				return "saturday";
			}
			return dateMatchValue;
		}
		var day = getDayFromValue(event.target.dateMatch.value);

		// Array containing the errors/success to display
		var errors = new Array();
		var hasError = false;

		var unregisteredPartner = false;
		var givenEmail = false;

		var mailNotifyAlreadyRegisteredPartner = false;
		var mailNotifyUnregisteredPartner = false;
		var mailNotifyAloneUser = false;

		var alone = event.target.alone.checked; // True if the player tries to register alone
		var partnerID;
		var partnerData;
		var partnerPair;
		var partnerEmail;
		if(!alone && $(emailPlayerDiv).is(":visible")){
			// User wants to register a pair, collect the partner's id from his email.
	    	var email = event.target.emailPlayer.value;
			if (!email || email.indexOf('@') == -1 || email.indexOf('.') == -1 || email.indexOf('@') > email.indexOf('.')) {
				errors.push({id:"emailPlayer", error:true});
			}
			else {
				// Check that we know that email
		    	var u = Meteor.users.findOne({emails: {$elemMatch: {address:email}}});
		    	if(u === undefined){
		    		unregisteredPartner = true;
					partnerEmail = email;
					errors.push({id:"emailPlayer", error:false});
					givenEmail = true;
		    	}
		    	else{
		    		partnerID = u._id;
					partnerPair = getDayPairFromPlayerID(partnerID, day);
					if (partnerPair === undefined) {
						// Partner is registered on the site but not on the tournament
						unregisteredPartner = true;
						partnerEmail = email;
						errors.push({id:"emailPlayer", error:false});
						givenEmail = true;
					}
					else {
						if (partnerPair !== undefined && partnerPair.player1 !== undefined && partnerPair.player2 !== undefined) {
							// Partner is already in a pair that has 2 players
							errors.push({id:"emailPlayer", error:true});
						}
						else {
							var partnerInfo = getTypeAndCategoryFromPairID(partnerPair._id);
							var partnerType = partnerInfo.playerType;
							var partnerCategory = partnerInfo.playerCategory;
							if (partnerPair !== undefined && (partnerCategory !== userCategory || partnerType !== userType)) {
								// This player is already registered for this tournament and does not have the same category or the same type as the current player
								errors.push({id:"emailPlayer", error:true});
							}
							else {
								if (partnerPair.player1) {
									partnerData = partnerPair.player1;
								}
								else if(partnerPair.player2) {
									partnerData = partnerPair.player2;
								}
								else {
									console.error("Such a weird error, partner should be in player1 or player2");
									return false;
								}
								partnerEmail = email;
								errors.push({id:"emailPlayer", error:false});
								givenEmail = true;
							}
						}
					}
		    	}
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
        if(sex !== "M" && sex !== "F"){
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
			Create the address object
        */
		var addressData = {
			street : street,
			box : boxNumber,
			number : addressNumber,
			zipCode : zipcode,
			city : city,
			country : country
		};

		var user = Meteor.users.findOne({_id:userID});

		// If user has already an address, update that one instead of creating a new one
		var userWithAddress = Meteor.users.findOne({_id:userID}, {'profile.addressID':1});
		if(userWithAddress){
			addressData._id = user.profile.addressID;
		}

		/*
			Create the object with the informations about the user
		*/
        var curUserData = {
          _id: userID,
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

		var extras = Extras.find({day:day}).fetch();
		var extrasPlayer = playerData.extras;

		for(var i=0;i<extras.length;i++){
			extrasPlayer[extras[i].name]=document.getElementById(extras[i]._id).value;
		}

		/*
		 * Fill pair info
		 */
		var pairData;

		if(givenEmail) {
			// User gives his/her partner email address
			if (unregisteredPartner) {
				playerData.partnerEmail = partnerEmail;
				pairData = {
					player2: playerData
				};
				mailNotifyUnregisteredPartner = true;
			}
			else {
				// update the pair containing the partner
				pairData = {
					_id:partnerPair._id,
					player1:playerData,
					player2:partnerData
				};
				mailNotifyAlreadyRegisteredPartner = true;
			}
		}
		else {
			// User did not specify a partner email
			if (!alone) {
				var message = document.getElementById("noPartnerChosen");
				message.style.display = 'block';
				return false;
			}
			else {
				if(later) {
					pairData = {
						player1:playerData
					};
					mailNotifyAloneUser = true;
				}
				else {
					// Current user has to choose a partner between the alone players in the table
					var selectedPartnerPairID = Session.get("tournamentRegistration/aloneSelected");
					if (selectedPartnerPairID === null || selectedPartnerPairID === undefined ||  document.getElementById(selectedPartnerPairID) === null || document.getElementById(selectedPartnerPairID) === undefined) {
						var message = document.getElementById("noPartnerChosen");
						message.style.display = 'block';
						return false;
					}
					selectedPartnerPair = Pairs.findOne({_id:selectedPartnerPairID});
					if (selectedPartnerPair.player1) {
						partnerData = selectedPartnerPair.player1;
					}
					else if(selectedPartnerPair.player2) {
						partnerData = selectedPartnerPair.player2;
					}
					else {
						console.error("Such a weird error, selectedPartner should be player1 or player2");
						return false;
					}
					pairData = {
						_id:selectedPartnerPairID,
						player1:partnerData,
						player2:playerData
					}
					mailNotifyAlreadyRegisteredPartner = true;
				}
			}

		}

		// Delete the current player's pair for that day if any
		var pair = getDayPairFromPlayerID(userID, day);
		if (pair !== undefined) {
			Meteor.call('unsubscribePairFromTournament', pair._id, userID);
		}

		/*
			Check the AFT ranking online
		*/
		Meteor.call('checkAFTranking', firstname, lastname, AFT, function(err, result){
			$('#submitRegistration').hide();
            $('#submit-chargement').show();

			if(err){
				console.error("Error while checking AFT ranking");
				console.error(err);
			}
			if(result == true){ //OK
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
					Session.set('aloneSelected',null); // To avoid bugs if trying to register again
		        	if(err){
		        		console.log("error callback updatePair");
		        		console.log(err);
		        		return;
		        	}
					var callbackInception = function (err, result) {
						Router.go('myRegistration');
					};
					Meteor.call('addPairToTournament', pairID, currentYear, dateMatch, callbackInception);
					var type = Session.get("tournamentRegistration/type");
					var category = Session.get("tournamentRegistration/category");
					var firstname = curUserData.firstName;
					var lastname = curUserData.lastName;
					if (mailNotifyAloneUser) {
						var dataMail = {
							intro:"Bonjour"+firstname+",",
							important:"Merci pour votre inscription au tournoi.",
							texte:"Vous êtes bien inscrit dans la catégorie : '"+category+"' du type '"+ type+"'."
						};
						Meteor.call("emailFeedback",user.emails[0].address,"Concernant votre inscription au tournoi",dataMail, function(error, result){
							if(error){
								console.log("error", error);
							}
						});
					}
					else if(mailNotifyUnregisteredPartner) {
						//TODO secure this with given a pairID which is half-full
						// Send mail to partnerEmail (this is an email yey yey !) : "Hey ! firstname lastname wants to player with you in type and category at our great tournament"
						Meteor.call("emailInvitPeople",curUserData._id, partnerEmail, function(error, result){
							if(error){
								console.log("error", error);
							}
						});
					}
					else if(mailNotifyAlreadyRegisteredPartner) {
						// Send mail to partnerID : "Hey ! firstname lastname wants to player with you ! To register with him, first delete your previous registration for that day, then click on the link in this email, see you love !"
						Meteor.call("emailToAlreadyRegisteredUser", curUserData._id, partnerID, function(error, result){
							if(error){
								console.log("error", error);
							}
						});
					}
					// else : no mail
				}

				//For the payment
				//Remark: we pass the paymentMethod to pairData but it won't be linked with the Pair in the database)
				//		  This is because a player can have multiple Pairs (multiple tournaments).
				pairData.paymentMethod = $('[name=paymentMethod]:checked').val();

				pairData.year = currentYear;
		        Meteor.call('updatePair', pairData, callback);
			}
			else {	//The players cheats on the AFT ranking

				var e = document.getElementById("AFTcheat");
				e.style.display = 'block';
				var e = document.getElementById("AFTDiv")
				e.className = "form-group has-error has-feedback";

				$('#submit-chargement').hide();
				$('#submitRegistration').show();
			}
		});

    }


  });


	Template.tournamentRegistrationTemplate.onCreated(function (){
		this.subscribe("AddressesNoSafe");
		this.subscribe("users");
		Session.set("tournamentRegistration/firstTime", true);
	});

	/**
	 * Auto-complete
	 */
	Template.tournamentRegistrationTemplate.onRendered(function () {
		var user=Meteor.user();
		if(typeof user==='undefined') {
			console.error("Error, no user defined in registration page, should have been redirected.");
			return;
		}
		if(typeof user.profile==='undefined') {
			// No info on this user, do nothing
			return;
		}
		var sexSelect = document.getElementById('sex');
		sexSelect.value = user.profile.gender!==undefined ? user.profile.gender : "default";

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
