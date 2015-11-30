// Useful link : http://stackoverflow.com/questions/16439055/retrieve-id-after-insert-in-a-meteor-method-call


/*
	/!\
	On the client, Meteor.call is asynchronous - it returns undefined and its return value can only be accesses via a callback.
	Helpers, on the other hand, execute synchronously.
	/!\
*/

Meteor.methods({

	//TODO: remove this when going to production !!!
	'turnAdminInsecure' : function(nid){
		Meteor.users.update({_id:nid}, {
			$set: {"profile.isAdmin":true,"profile.isStaff":true}
		});

	},

	'activateGlobalValuesDB' : function() {
		if (!GlobalValues.findOne({_id:"currentYear"})) {
			GlobalValues.insert({_id:"currentYear", value:""});
		}
		if(GlobalValues && !GlobalValues.findOne({_id:"nextCourtNumber"})) {
			GlobalValues.insert({_id:"nextCourtNumber", value:1});
		}
		if (!GlobalValues.findOne({_id:"registrationsON"})) {
			GlobalValues.insert({_id:"registrationsON", value: false});
		}
	},

	// Method to launch the tournament registrations for this year's tournament.
	'launchTournament': function(launchTournamentData){
		if(Meteor.call('isAdmin')){
			var data = {};
			if(typeof launchTournamentData.tournamentDate === 'undefined') {
				console.error("launchTournament: No date for the tournament");
				return undefined;
			}

			data.tournamentDate = launchTournamentData.tournamentDate;
			data._id = ""+data.tournamentDate.getFullYear();	//Must be a string

			if (typeof Years.findOne({_id:data._id}) !== 'undefined') {
				console.error("Tournament already exists");
				return undefined;
			}

			if(typeof launchTournamentData.tournamentPrice === 'undefined') {
				console.error("launchTournament: No price for the tournament");
				return undefined;
			}

			data.tournamentPrice = launchTournamentData.tournamentPrice;

			//Insert in database

			GlobalValues.update({_id:"currentYear"}, {$set: {
				value : data._id
			}}, function(err, result){
				if(err){
					throw new Meteor.Error("update GlobalValues currentYear in launchTournament error: ", err);
				}
			});

			GlobalValues.update({_id:"registrationsON"}, {$set: {
				value : true
			}}, function(err, result){
				if(err){
					throw new Meteor.Error("update GlobalValues registrationsON in launchTournament error: ", err);
				}
			});

			//Add the stepXdone fields
			data.step2done = false;
			data.step3done = false;
			data.step4done = false;
			data.step5done = false;
			data.step6done = false;

			var insertedYearID = Years.insert(data);
			console.log("Tournament launched for year "+data._id);

			//Put all the courts ownerOK and staffOK to false for this year's tournament
			Courts.update({}, {ownerOK: false, staffOK: false});

			return insertedYearID;
		}
		else {
			console.error("You are not an administrator, you don't have the permission to do this action.");
			return false;
		}
	},

	'deleteCurrentYear': function(){
			if(!Meteor.call('isAdmin')){
				console.error("You don't have the permission to do that.");
				return false;
			}

			var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
			Years.remove({_id: currentYear});

			Meteor.call('restartTournament'); 	//Set currentYear to ""
	},

	'setCurrentYear' : function(currentYear) {
		if (typeof currentYear !== 'string') {
			console.error("Error setCurrentYear, you must provide a string denoting the year of the tournament");
			return undefined;
		}
		GlobalValues.update({_id:"currentYear"}, {$set:{
			value : currentYear
		}}, {upsert:true});
	},

	'stopTournamentRegistrations': function(){
		if(Meteor.call('isAdmin')){

			var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
			Years.update({_id: currentYear}, {$set: {
				step4done: true
			}});

			GlobalValues.update({_id:"registrationsON"}, {$set: {
				value : false
			}}, function(err, result){
				if(err){
					throw new Meteor.Error("update GlobalValues registrationsON in stopTournamentRegistrations error: ", err);
				}
			});
		}
		else{
			console.error("You don't have the permission to do that.");
			throw new Meteor.Error("stopTournamentRegistrations: ", err);
		}
	},

	'getAllYears': function(){
		allYears = Years.find({}).fetch();

		var y = [];
		for(var i=0; i<allYears.length;i++){
			y.push(allYears[i]._id);
		}
		return y;
	},

	'getNextCourtNumber' : function() {
		if (GlobalValues && !GlobalValues.findOne({_id:"nextCourtNumber"})) {
			console.error("No court number yet !");
			return 1;
		}
		return GlobalValues.findOne({_id:"nextCourtNumber"});
	},

	'setNextCourtNumber' : function(value) {
		globalValueDocument = GlobalValues.findOne({_id:"nextCourtNumber"});
		if (typeof globalValueDocument === 'undefined') {
			console.error("Error setNextCourtNumber : globalValueDocument not found");
			return undefined;
		}
		GlobalValues.update(globalValueDocument, {$set: {
			value : value
		}}, function(err, result){
			if(err){
				throw new Meteor.Error("update GlobalValues error: ", err);
			}
		});
	},

	'objectIsEmpty' : function(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }
	    return true;
	},

	/*
		Returns true if the address addr is already a court address present in the DB.
	*/
	'addressExists' : function(addr){
		if(addr._id && Courts.find({addressID:addr._id})) return true;
		if(addr.zipCode && addr.street && addr.number){
			if(addr.box)
				if(Addresses.find({zipCode:addr.zipCode, street:addr.street, number:addr.number, box:addr.box}).count() > 0)
					return true;
			else
				if(Addresses.find({zipCode:addr.zipCode, street:addr.street, number:addr.number}).count() > 0) return true;
		}
		return false;
	},

	'isAdmin' : function(){
		var res = Meteor.users.findOne({_id:Meteor.userId()}, {"profile.isAdmin":1});
		return res ? res.profile.isAdmin : false;
	},

	'isStaff' : function(){
		var res = Meteor.users.findOne({_id:Meteor.userId()}, {"profile.isStaff":1});
		return (res ? res.profile.isStaff : false);
	},

	'turnAdmin': function(nid){
		if(Meteor.call('isAdmin')){
			Meteor.users.update({_id:nid}, {
           		$set: {"profile.isAdmin":true,"profile.isStaff":true}
         	});
		}
		else {
			console.error("Error turning admin");
			return false;
		}
	},

	'turnStaff': function(nid){
		if(Meteor.call('isAdmin')){
			Meteor.users.update({_id:nid}, {
           		$set: {"profile.isAdmin":false,"profile.isStaff":true}
         	});
		}
		else {
			console.error("Error turnning staff");
			return false;
		}
	},

	'turnNormal': function(nid){
		if(Meteor.call('isAdmin')){
			Meteor.users.update({_id:nid}, {
	        	$set: {"profile.isAdmin":false,"profile.isStaff":true}
	      	});
		}
		else {
			console.error("Error turning normal");
			return false;
		}
	},

	'deleteUser': function(nid){
		if(nid === Meteor.userId() || Meteor.call('isAdmin') || Meteor.call('isStaff'))
		{
			userToDelete = Meteor.users.findOne({"_id":nid});
			addressId = userToDelete.profile.addressID;
			if(addressId != undefined){
				Addresses.remove({_id:addressId});
				Meteor.users.update({_id: nid} , {$set: {"profile.addressID": undefined}});
			}
			courtId = Courts.findOne({"ownerID":nid});
			if(courtId != undefined){
				Courts.remove({_id:courtId});
				//Meteor.users.update({_id: nid} , {$set: {"profile.courtID": undefined}});
			}
			Meteor.users.update({_id: nid} , {$set: {"profile.isStaff": false}});
			Meteor.users.update({_id: nid} , {$set: {"profile.isAdmin": false}});
			Meteor.users.update({_id: nid} , {$set: {"services": undefined}});
			Meteor.users.update({_id: nid} , {$set: {"profile.phone": undefined}});
		}
		else {
			console.error("You don't have the permission to do that.");
		}

	},

	'getPairCategory' : function(type, p1, p2){
		var category;
		if(type==="family"){
			return 'all';
		}
		else{
			var cat1;
			var cat2;

			if(p1){
				// We need the birthDate
				if(p1.profile.birthDate){
					// Fetch the category corresponding to that date
					cat1 = getCategoryForBirth(p1.profile.birthDate);
					if(!cat1){
						console.error("Player 1 does not fit in any category (too young). Age : "+getAge(p1.profile.birthDate) +" / "+cat1);
						return false;
					}
				}
			}
			if(p2){
				// We need the birthDate
				if(p2.profile.birthDate){
					// Fetch the category corresponding to that date
					cat2 = getCategoryForBirth(p2.profile.birthDate);
					if(!cat2){
						console.error("Player 2 does not fit in any category (too young). Age : "+getAge(p2.profile.birthDate) + " / "+cat2);
						return false;
					}
				}
			}
			if(cat1 && cat2){
				// Both players are provided, check that the categories match !
				if(cat1 != cat2){
					console.error("getPairCategory : categories of the 2 players do not match ! "+cat1+" and "+cat2);
					return false;
				}
				return cat1;
			}
			else if(cat1){
				return cat1;
			}
			else if(cat2){
				return cat2;
			}
			else{
				// No way of knowing the category since no player is provided
				console.error("getPairCategory : no way to know the category, no player provided !");
				return false;
			}
		}
	},

	/*
		@param pair : the pair for which the type has to be chosen
		@param matchDate : either "sunday", "saturday" or "family"
		Returns the type of the pair, either mixed, family, men or women
	*/
	'getPairType' : function(dateMatch, p1, p2){
		var type;

		var gender1;
		var gender2;
		var birthDate1;
		var birthDate2;

		if(p1){
			birthDate1 = p1.profile.birthDate;
			gender1 = p1.profile.gender;
		}
		if(p2){
			birthDate2 = p2.profile.birthDate;
			gender2 = p2.profile.gender;
		}

		if(dateMatch == "sunday"){
			if(gender1 && gender2 && gender1 != gender2){
				console.error("Sunday is men or women only ! no mix allowed !");
				return false;
			}
			if(!gender1 && !gender2){
				console.warn("No information on the gender available !");
				return false;
			}
			if(gender1){
				return gender1=="M" ? typeKeys[0] : typeKeys[1]; // men or women
			}
			if(gender2){
				return gender2=="M" ? typeKeys[0] : typeKeys[1]; // men or women
			}
		}
		else if(dateMatch == "saturday"){ // Mixed
			if(typeof gender1 !== undefined && typeof gender2 !== undefined && gender1 == gender2){
				console.error("Saturday is mixed only !");
				return false;
			}
			if(!gender1 && !gender2){
				console.warn("No information on the gender available, setting type to mixed");
			}
			return typeKeys[2]; //mixed
		}
		else if (dateMatch == "family") {
			if((p1 && p2 && !acceptPairForFamily(birthDate1, birthDate2)) || (!p1 && !acceptForFamily(birthDate2)) || (!p2 && !acceptForFamily(birthDate1))) {
				console.error("Error registering a pair for the family tournament, ages are "+birthDate1+" and "+birthDate2);
				return false;
			}
			else {
				return typeKeys[3]; // family
			}
		}

		console.error("Error : date match unrecognized");
		return false;
	},

	/**
		@param yearDate is structured as a year.
		This is the top-level structure in the database
		One "table" year per year
		A year structure is as follows :
		{
			_id:<date>,
			mixed:<typeID>,
			men:<typeID>,
			women:<typeID>,
			family:<typeID>
		}
	*/
	'updateYear' : function(yearData) {
		if (!yearData) {
			console.error("updateYear : no yearData provided : "+yearData);
			return;
		}
		if(!yearData._id) {
			console.error("updateYear : please specify an ID (the year !).")
			return;
		}

		var data = {};

		if(yearData.mixed) {
			data.mixed = yearData.mixed;
		}
		if(yearData.men) {
			data.men = yearData.men;
		}
		if(yearData.women) {
			data.women = yearData.women;
		}
		if(yearData.family) {
			data.family = yearData.family;
		}

		Years.update({_id: yearData._id} , Meteor.call('objectIsEmpty', data) ? {} : {$set: data}, {upsert: true});
		return yearData._id;
	},

	/*
		@param typeData is structured as a type
		A type structure is as follows :
		{
			// Can only $addToSet
			_id:<typeID>
			preminimes:<list of poolIDs>
			minimes:<list of poolIDs>
			cadets:<list of poolIDs>
			scolars:<list of poolIDs>
			juniors:<list of poolIDs>
			seniors:<list of poolIDs>
			elites:<list of poolIDs>
			// Can only $set
			preminimesBracket:<list of pairId>
			minimesBracket:<list of pairId>
			cadetsBracket:<list of pairId>
			scolarsBracket:<list of pairId>
			juniorsBracket:<list of pairId>
			seniorsBracket:<list of pairId>
			elitesBracket:<list of pairId>
			listBracket:<list of pairID>


			// Staff responsables
				Can only add a single staff for each update to a category.
			preminimesResp:<list of userId>
			minimesResp:<list of userId>
			cadetsResp:<list of userId>
			scolarsResp:<list of userId>
			juniorsResp:<list of userId>
			seniorsResp:<list of userId>
			elitesResp:<list of userId>
			listResp:<list of pairID>

			NOTE : for the family tournament, only one list of pools :
			all:<list of poolIDs>
		}
	*/
	'updateType' : function(typeData) {
		if (!typeData) {
			console.error("updateType : no typeData provided : "+typeData);
			return;
		}
		var hasData = false;
		var data = {};
		for (var i=0;i<categoriesKeys.length;i++){
			if(typeData[categoriesKeys[i]]!=undefined){
				if(!data.$addToSet) data['$addToSet'] = {};
				data.$addToSet[categoriesKeys[i]] = {$each : typeData[categoriesKeys[i]]};
				hasData = true;
			}
			var b = categoriesKeys[i].concat("Bracket");
			if(typeData[b]!=undefined){
				if(data.$set===undefined) data['$set'] = {};
				data.$set[b] = typeData[b];
				hasData = true;
			}

			var c = categoriesKeys[i].concat("Courts");
			if(typeData[c]!=undefined){
				if(data.$set===undefined) data['$set'] = {};
				data.$set[c] = typeData[c];
				hasData = true;
			}

			var r = categoriesKeys[i].concat("Resp");
			if(typeData[r]!=undefined){
				if(data.$addToSet===undefined) data.$addToSet = {};
				data.$addToSet[r] = typeData[r];
				hasData = true;
			}
		}
		if(!typeData._id){
			return Types.insert(data);
		}
		if(!hasData){
			console.warn("Warning : called updateType with no input");
			return;
		}
		Types.update({_id: typeData._id} , data);
		return typeData._id;
	},

	/*
		@param courtData is structured as a court, if _id is missing,
		a new court will be created and linked to the owner. OwnerID must be provided.
		A court structure is as follows :
		{
			_id:<courtId>,
			addressID:<addressID>,
			ownerID:<ownerID>,
			surface:<surface>,
			type:<type>,
			instructions:<instructions>,
			ownerComment:<ownerComment>,
			staffComment:<staffComment>,
			dispoSamedi:<boolean>,
			dispoDimanche:<boolean>,
			ownerOK:<boolean>,
			staffOK:<boolean>,
			numberOfCourts: <integer>
		}
	*/
	'updateCourt' : function(courtData){
		var courtId = courtData._id;
		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = courtData.ownerID == Meteor.userId();

		if(! (userIsOwner || isAdmin || isStaff) ){
			console.error("updateCourt : You don't have the permissions to update a court !");
			return false;
		}

		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;

		var data = {};

		data.ownerID = courtData.ownerID;

		// Fill in court info
		if(courtData.addressID){
			data.addressID = courtData.addressID;
		}
		if(courtData.surface){
			data.surface = courtData.surface;
		}
		if(courtData.courtType){
			data.courtType = courtData.courtType;
		}
		if(courtData.instructions){
			data.instructions = courtData.instructions;
		}
		if(courtData.ownerComment){
			data.ownerComment = courtData.ownerComment;
		}

		if((isStaff||isAdmin) && courtData.staffComment){
			data.staffComment = courtData.staffComment;
		}

		if(courtData.dispoSamedi !== null && typeof courtData.dispoSamedi !== 'undefined'){
			data.dispoSamedi = courtData.dispoSamedi;
		}
		if(courtData.dispoDimanche !== null && typeof courtData.dispoSamedi !== 'undefined'){
			data.dispoDimanche = courtData.dispoDimanche;
		}

		if(courtData.ownerOK !== null && typeof courtData.ownerOK !== 'undefined'){
			data.ownerOK = courtData.ownerOK;
		}

		if(courtData.staffOK !== null && typeof courtData.staffOK !== 'undefined'){
			data.staffOK = courtData.staffOK;
		}


		if(courtData.numberOfCourts){
			data.numberOfCourts = courtData.numberOfCourts;

			//CourtNumber
			var courtNumberArray = [];
			var globalValueDocument = Meteor.call('getNextCourtNumber', currentYear);
			nextCourtNumber = globalValueDocument.value;

			for(var i = 0; i < data.numberOfCourts; i++){
				courtNumberArray[i] = nextCourtNumber;
				nextCourtNumber++;
			}
			data.courtNumber = courtNumberArray;

			//Update nextCourtNumber global value
			Meteor.call('setNextCourtNumber', currentYear, nextCourtNumber);
		}


		if(courtId === undefined){
			// Create a new court
			return Courts.insert(data, function(err, courtId){
				if(err){
					throw new Meteor.Error("updateCourt error: during Courts.insert", err);
				}
			});
		}

		// Court already exists, so just update it :
		Courts.update({_id: courtId} , {$set: data}, function(err, count, status){
			if(err){
				throw new Meteor.Error("updateCourt error : during Courts.update", err);
			}
		});
		return courtId;
	},

	'deleteCourt' : function(courtId){
		if(!courtId){
			console.error("deleteCourt: no courtId in argument");
			return false;
		}

		var court = Courts.findOne(courtId);
		if(!court)
		{
			console.error("deleteCourt: no court correponds to courtId");
			return false;
		}

		var u = Meteor.users.findOne(court.ownerID);
		if(!u){
			console.error('deleteCourt : owner does not exist');
			return false;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = court.ownerID == Meteor.userId();

		if(userIsOwner || isAdmin || isStaff){

			Addresses.remove(court.addressID, function(err){
				if(err){
					throw new Meteor.Error("deleteCourt: error while deleting court address", err);
				}
			});

			Courts.remove(courtId, function(err){
				if(err){
					throw new Meteor.Error("deleteCourt: error while deleting court", err);
				}
			});

		}
		else
		{
			console.error("deleteCourt : You don't have the permissions to delete a court !");
			return false;
		}

	},

	/*
		@param : userData : javascript object containing the fields of the user. It must include at least the _id field.
		User structure is as follows :
		{
			createdAt:<createdAt>,
			_id:<id>,
			emails:[{ "address" : "<email1>", "verified" : false } , ...],
			profile:{
				name:<name>,
				title:<title>,
				firstName:<firstName>,
				lastName:<lastName>,
				addressID:<addressID>,
				phone:<phone>,
				birthDate:<birthDate>,
				AFT:<AFT>,
				isStaff:<isStaff>,
				isAdmin:<isAdmin>,
				gender:<gender>
			},
			services:{
				google{
					<google stuff>
				}
				facebook{
					<facebook stuff>
				}
			}
		}
		If the _id is not already in the DB, this will add that _id and all other fields of userData to the DB (creating a new user).
		Missing fields will not be included (except for admin and staff which default to false).
		The function will return true.
		If the _id is already in the DB, this will update the fields of the existing in regard of the fields in userData.
		Missing fields will be left as they were before.
		The function will return false.
	*/
	'updateUser' : function(userData){
		if(!userData._id){
			console.error("updateUser : Must provide user id to update the user !");
			return;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = userData._id == Meteor.userId();

		if(!(userIsOwner || isAdmin || isStaff)){
			console.error("updateUser : You don't have the required permissions!");
			return;
		}

		var profile = userData.profile;

		var data = {};

		if(userData.createdAt){
			data.createdAt = userData.createdAt;
		}

		if(userData.services){
			data.services = userData.services;
		}

		if(userData.emails){
			data.emails = userData.emails; // Array of {address:"...@...com", verified:"true or false"}
		}

		if(profile){
			if(profile.name){
				data["profile.name"] = profile.name;
			}
			if(profile.title){
				data["profile.title"] = profile.title;
			}
			if(profile.firstName){
				data["profile.firstName"] = profile.firstName;
			}
			if(profile.lastName){
				data["profile.lastName"] = profile.lastName;
			}

			if(profile.gender){
				data["profile.gender"] = profile.gender;
			}

			if(profile.addressID){
				var a = Addresses.findOne({_id:profile.addressID});
				if(!a){
					console.error('updateUsers : addressID provided does not exist !');
					return;
				}
				data["profile.addressID"] = profile.addressID;
			}
			if(profile.phone){
				data["profile.phone"] = profile.phone;
			}
			if(profile.birthDate){
				data["profile.birthDate"] = profile.birthDate;
			}
			if(profile.AFT){
				data["profile.AFT"] = profile.AFT;
			}

			if(isAdmin && profile.isStaff){
				data["profile.isStaff"] = profile.isStaff;
			}

			if(isAdmin && profile.isAdmin){
				data["profile.isAdmin"] = profile.isAdmin;
			}
		}

		// Write data on the DB
		var writeResult;
		if(data["profile.isStaff"]!=undefined || data["profile.isAdmin"]!= undefined) {
			writeResult = Meteor.users.update({_id: userData._id} , {$setOnInsert: { 'profile.isAdmin':data["profile.isAdmin"] , 'profile.isStaff': data["profile.isStaff"]}, $set: data}, {upsert: true});
		}
		else {
			writeResult = Meteor.users.update({_id: userData._id} , {$setOnInsert: { 'profile.isAdmin': false, 'profile.isStaff': false }, $set: data}, {upsert: true});
		}
		if(writeResult.writeConcernError){
			console.error('updateUser : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
			return;
		}
		if(writeResult.nUpserted >0){
			return true;
		}

		return false;
	},

	'sendNewEmail' : function(userId){
		Accounts.sendVerificationEmail(userId);
	},
	/*
		@param AddressData : if it does not contain a field _id, this will
		create a new address
		The addressData structure is as follows :
		{
			_id:<id>, // Omit this if you want to create a new address, this will be auto-generated
			street:<street>,
			number:<number>,
			box:<box>,
			city:<city>,
			zipCode:<zipCode>,
			country:<country>,
			isCourtAddress:<boolean>
		}
		Returns the addressID
	*/
	'updateAddress' : function(addressData){
		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');

		userHasAddress = Meteor.user().profile.addressID !==undefined;
		if(userHasAddress && addressData._id!==undefined && !(isAdmin ||isStaff) ){
			userIsOwner = addressData._id == Meteor.user().profile.addressID;
			if(!userIsOwner){
				console.error("updateUser : You don't have the required permissions!");
				return false;
			}
		}

		var data = {};

		if(addressData.street){
			data.street = addressData.street;
		}
		if(addressData.box){
			data.box = addressData.box;
		}
		if(addressData.number){
			data.number = addressData.number;
		}
		if(addressData.city){
			data.city = addressData.city;
		}
		if(addressData.zipCode){
			data.zipCode = addressData.zipCode;
		}
		if(addressData.country){
			data.country = addressData.country;
		}
		if(addressData.isCourtAddress){
			data.isCourtAddress = addressData.isCourtAddress;
		}

		if(addressData._id === undefined){
			return Addresses.insert(data, function(err, addrId){
				if(err){
					console.error('updateAddress error on insert');
					console.error(err);
				}
			});
		}

		// Add the address in the DB
		Addresses.update({_id: addressData._id} , {$set: data}, function(err, count, status){
			if(err){
				console.error('updateAddress error : while update existing address');
				console.error(err);
			}
		});
		return addressData._id;
	},

	/*
		If you supply the category (and no player), make sure it fits the category of both players --> not checked.
		The category will be automatically checked and set if you provide at least a player.
		The update fails if both players are not of the same category or if the supplied category does not fit the player.
		/!\ For a the family type tournament, the category should be "all"
		A pair is structured as follows:
		{
			_id:<id>,
			player1:{
				_id:<userID>,
				extras:{
					<name>:<number>
				},
				playerWish:<playerWish>,
				courtWish:<courtWish>,
				otherWish:<otherWish>
			},
			player2:{
				_id:<userID>,
				extras:{
					<name>:<number>
				},
				playerWish:<playerWish>,
				courtWish:<courtWish>,
				otherWish:<otherWish>
			},
			tournament :[<pointsRound1>, <pointsRound2>, ....],
			tournamentCourts:[<courtForRound1>, ...],
			year:<year>
		}
		@return : the pair id if successful, otherwise returns false
	*/
	'updatePair' : function(pairData){
		if(typeof pairData === undefined){
			console.error("updatePair : pairData is undefined");
			return;
		}
		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		ID = {};
		if(pairData.player1){
			P1_id= pairData.player1._id;
			ID["player1"] = P1_id;
		}
		if(pairData.player2){
			P2_id = pairData.player2._id;
			ID["player2"] = P2_id;
		}
		const userIsOwner = ID['player1'] == Meteor.userId() || ID['player2'] == Meteor.userId();
		if(!(userIsOwner || isAdmin || isStaff)){
			console.error("updatePair : You don't have the required permissions!");
			return false;
		}

		var data = {};
		if (pairData.year) {
			data.year = pairData.year;
		}

		//Amount for extras
		var extrasAmount = [];

		// Player = player1 or player2
		// Returns false only when an error occurs, otherwise true
		setPlayerData = function(player){
			var p ={};

			var u = Meteor.users.findOne({_id:ID[player]});

			if(typeof u === 'undefined'){
				console.error("updatePair : "+player+" "+ID[player]+" doesn\'t exist !");
				return false;
			}

			p['_id'] = ID[player];
			pData = pairData[player];

			if(pData['playerWish']) p['playerWish'] = pData['playerWish'];
			if(pData['courtWish']) p['courtWish'] = pData['courtWish'];
			if(pData['otherWish']) p['otherWish'] = pData['otherWish'];

			if(pData['extras']){
				var extr = {};
				var count = 0;
				var extrAmount = 0;

				var dataExtras = pData['extras'];

				var extras = Extras.find().fetch();

				for(var i=0; i<extras.length; i++){

					if(dataExtras[extras[i].name]){
						var currentExtraNumber = dataExtras[extras[i].name]
						extr[extras[i].name] = currentExtraNumber;

						extrAmount += currentExtraNumber * extras[i].price;			// Add number * price to amount
						count = count+1;
					}
				}

				if(count>0){
					p['extras'] = extr;
				}
				extrasAmount[player] = extrAmount;
			}

			data[player] = p;
			return true;
		}

		var check1, check2;
		if (typeof pairData["player1"] !== "undefined") {
			check1 = setPlayerData("player1");
		}
		if (typeof pairData["player2"] !== "undefined") {
			check2 = setPlayerData("player2");
		}

		if(check1 == false || check2 == false) return false; // an error occurred
		if(typeof check1 === "undefined" && typeof check2 === "undefined"){
			console.warn("Warning : No data about any player was provided to updatePair. Ignore if intended.");
		}


		//Payments: add to the Payments collection
		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
	    var amount = Years.findOne({_id: currentYear}).tournamentPrice;

		//Add extras to amount
		if(check1 && pairData["player1"].extras)
		{
			amount += extrasAmount["player1"];
		}
		else if(check2 && pairData["player2"].extras)
		{
			amount += extrasAmount["player2"];
		}


		var paymentUser = Meteor.userId();

		paymentData = {
			userID : paymentUser,
			tournamentYear : currentYear,
			status : "pending",
			paymentMethod : pairData.paymentMethod,
			balance : amount
		};

		//Check if payment already exists for this player
		var paymentAlreadyExists = Payments.findOne({'userID': paymentUser, 'tournamentDate': currentYear});
		if(paymentAlreadyExists){
			console.error("updatePair: Payment already exists for this player");
		}
		else {

			//Send emails if the payment method is by cash or by bank transfer
			if(pairData.paymentMethod === paymentTypes[2]){		//Cash
        	var user = Meteor.users.findOne({_id:paymentData.userID});
        	var data = {
          		intro:"Bonjour "+user.profile.firstName+",",
          		important:"Nous avons bien reçu votre inscription",
          		texte:"Lors de celle-ci vous avez choisi de payer par cash. Ceci devra se faire le jour du tournoi directement au quartier général. L'adresse de celui-ci et le montant du votre inscription sont repis dans l'encadré suivant.",
          		encadre:"Le montant de votre inscription s'élève à "+ amount+" €.\n Merci de prendre cette somme le jour du tournoi au quartier général qui se trouve à l'adresse : Place des Carabiniers, 5 à 1030 Bruxelles."
        	};
        	Meteor.call('emailFeedback',user.emails[0].address,"Concernant votre inscription au tournoi",data);
				/*

					Envoyer un mail contenant les informations pour payer par cash:
					- addresse du QG : on peut l'hardcoder ici?
					- montant à payer: accessible via la variable amount

				*/
			}
			else if(pairData.paymentMethod === paymentTypes[1]){ 	//BankTransfer
        		var bank = "BE33 3753 3397 1254";
        		var user = Meteor.users.findOne({_id:paymentData.userID});
        		var data = {
          			intro:"Bonjour "+user.profile.firstName+",",
          			important:"Nous avons bien reçu votre inscription",
          			texte:"Lors de celle-ci vous avez choisi de payer par virement bancaire. Merci de faire celui-ci au plus vite afin que l'on puisse considérer votre inscription comme finalisée. Vous retrouverez les informations utiles dans l'encadré suivant.",
          			encadre:"Le montant de votre inscription s'élève à "+ amount+" €.\n Merci de nous faire parvenir cette somme sur le compte bancaire suivant : "+ bank+ " au nom de ASBL ASMAE (Place des Carabiniers 5 à 1030 Bruxelles) et d'y insérer les nom et prénom du joueur ainsi que le jour où il joue au tournoi."
        		};
        		Meteor.call('emailFeedback',user.emails[0].address,"Concernant votre inscription au tournoi",data);
					/*

						Envoyer un mail contenant les informations pour payer par virement bancaire:
						- compte bancaire: hardcoder pour le moment. Je mettrai peut-être un formulaire pour l'admin.
						- communication: ce serait pratique d'avoir une communication structurée comme ça le staff
							peut facilement vérifier valider qu'il a payé en rentrant cette communication dans un
							input sur le site web. Si j'ai le temps plus tard je ferai ça ;)
						- montant à payer: accessible via la variable amount

					*/
			}

			if(userIsOwner){
				Payments.insert(paymentData, function(err, paymId){
					if(err){
						console.error('insert payment error');
						console.error(err);
					}
				});
			}
			else { 		//Only used for popDB: insert a payment for both players
				paymentData.userID = ID['player1'];
				Payments.insert(paymentData, function(err, paymId){
					if(err){
						console.error('insert payment error');
						console.error(err);
					}
				});

				paymentData.userID = ID['player2'];
				Payments.insert(paymentData, function(err, paymId){
					if(err){
						console.error('insert payment error');
						console.error(err);
					}
				});

			}

		}


		if(!pairData._id){ 		// New Pair
			return Pairs.insert(data, function(err, res){
				if(err){
					console.error("updatePair error");
					console.error(err);
				}
			});
		}
		Pairs.update({_id: pairData['_id']} , {$set: data}, function(err, count, status){
			if(err){
				console.error('updatePair error');
				console.error(err);
			}
		});

		return pairData['_id'];
	},

	/*
		/!\  IF changes are made to the structure of a match, don't forget to update the method getOtherPair in bracketTournament.js !!!			/!\


		If no _id is provided, creates a new match. Else, updates it.
		A match is structured as follows :
		{
			_id:<id>,
			poolId:<poolId>,
			<pairID>:<points>,
			<pairID>:<points>,
			courtId:<courtID>,
			day:<matchDate> // Saturday or Sunday
		}
		matchData is expected to be formated like this :
		{
			_id:<id>, // Optional
			poolId:<poolId>,
			pair1: {pairId: <pairID>, points:<points>}, // Note : the order pair1/pair2 is irrelevant and is just for the convenience of parsing the data
			pair2: {pairId: <pairID>, points:<points>}
		}
		Automatically adds the match to the right pool if one is created (must provide pair1 and pair2 or creation will fail)
		providing pair1, pair2 and the poolId is enough to update the right match without giving the id of the match
		@return match id on success
	*/
	'updateMatch' : function(matchData){

		if(!matchData){
			console.error("updateMatch : matchData is undefined");
			return;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');

		if(!(isAdmin || isStaff)){
			console.error("updateMatch : You don't have the required permissions!");
			return;
		}


		data = {};
		var dataID;

		pairDataProdided = false;

		if(matchData.pair1) data[matchData.pair1.pairId] = matchData.pair1.points; // <pairID>:<points>
		if(matchData.pair2) data[matchData.pair2.pairId] = matchData.pair2.points; // <pairID>:<points>

		if(matchData.pair1 && matchData.pair2){
			/*
				Check if this pair already exists
				The pair ("pairId1", "pairId2") is a primary key
			*/
			d1 = {};
			d1[matchData.pair1.pairId] = {$exists:true};
			d2 = {};
			d2[matchData.pair2.pairId] = {$exists:true};

			matchId = Matches.findOne(
						{
							$and: [
								{"poolId":matchData.poolId}, // I want to find only matches belonging to this pool
								{$and: [d1,d2]} // A match has to have both fields for pair1 and pair2 set
							]
						}
					);

			// Set the day for the match

			if(matchData.pair1.day=="saturday" || matchData.pair1.day=="family"){
				data.day="Saturday";
			}
			else{
				data.day="Sunday";
			}

			if(matchId){
				// The match already exists
				if(matchData._id && (matchData._id != matchId)){ // If user provided an id, it must match the one we found, otherwise the DB is not consistent
					console.error("updateMatch : a match with the same pairs is already existing or the id provided is not correct");
					return;
				}
				dataID = matchId;
			}
			else{
				// No match found in the db
				if(matchData._id){
					// This should never happen, user provided an id but we did not find its corresponding pair in the db...
					// Either the db is broken or user gave a inexistant id
					console.error("updateMatch : the id's are auto-generated, the id you provided did not match any known match");
					return;
				}
			}
			pairDataProdided = true;
		}
		else{
			// If user did not provide both pairs, he must have provided the id
			if(!matchData._id){
				console.error("updateMatch : trying to update a match without providing either of the 2 pairs or the match id");
				return;
			}
			dataID = matchData._id;
		}

		if(matchData.poolId) data.poolId = matchData.poolId;

		if(!dataID){

			// Can only create a match if the user provided both pairs and the poolId
			if(!pairDataProdided){
				console.error("updateMatch : Trying to create a match without setting the pair data");
				return;
			}
			if(!data.poolId){
				console.error("updateMatch : Trying to create a match without providing the poolId");
				return;
			}

			return Matches.insert(data, function(err, id){
				if(err){
					console.error('updateMatch error (insert)');
					console.error(err);
				}
			});
		}

		Matches.update({_id: dataID} , {$set: data}, function(err, count, status){
			if(err){
				console.error('updateMatch error (update)');
				console.error(err);
			}
		});
		return dataID;
	},

	/*
		A pool is structured as follows:
		{
			_id:<id>,
			court:<court>, --> To remove
			pairs:[<pairID>, <pairID>, ...], // Will append pairs to existing array (no duplicates possible)
			leader:<pairId>, // Leader is the player1 from the pair
			courtId:<courtID>,
		}
		@return pool id on success
	*/
	'updatePool' : function(poolData){
		var data = {};

		set = undefined;

		if(poolData.courtId){
			if(!set) set = {};
			set["courtId"] = poolData.courtId;
		}
		if(poolData.leader){
			if(!set) set = {};
			set["leader"] = poolData.leader;
		}

		if(poolData.type){
			if(!set) set = {};
			set["type"] = poolData.type;
		}

		if(set) data["$set"] = set;

		addToSet = undefined;
		if(poolData.pairs){
			if(!addToSet) addToSet = {};
			addToSet["pairs"] = {$each: poolData.pairs};
		}
		// if(poolData.matches){
		// 	if(!addToSet) addToSet = {};
		// 	addToSet["matches"] = {$each: poolData.matches};
		// }

		if(addToSet) data["$addToSet"] = addToSet;

		if(!poolData._id){
			return Pools.insert(data, function(err, poolID){
				if(err){
					console.error('updatePool error');
					console.error(data);
					console.error(err);
				}
			});
		}


		// if(Object.keys(data.$set).length==0) delete data.$set;
		// if(Object.keys(data.$addToSet).length==0) delete data.$addToSet;
		// console.log("testEmptyObject");
		// console.log(data.$set);
		// console.log(Meteor.call('objectIsEmpty', data.$set));
		// console.log(Meteor.call('objectIsEmpty', {}));
		// console.log(Meteor.call('objectIsEmpty', {"hello":1}));


		// if(Meteor.call('objectIsEmpty', data.$set)) delete data.$set;
		// if(Meteor.call('objectIsEmpty', data.$addToSet)) delete data.$addToSet;

		Pools.update({_id: poolData._id} , data, function(err, count, status){
			if(err){
				console.error('updatePool error ');
				console.error(data);
				console.error(err);
			}
		});
		return poolData._id;

	},

	// Removes the pool and all its dependencies. Does not erase its pairs nor matches from the db.
	'removePool' : function(poolId, year, type, category){
		if(! (category&&type&&year)){
			return;
		}

		dataY = {};
		dataY[type] = 1;
		// We need to find the type's id, since it's what contains the poolid
		var yearData = Years.findOne({_id:year},dataY);
		var typeId = yearData[type];

		// Remove the poolId from the category of the type
		var typeData = Types.findOne({_id:typeId});
		var data = {$pull:{}};
		data.$pull[category] = poolId;

		// DB call
		Types.update({_id:typeId}, data);
		Pools.remove({_id:poolId});
	},

	'removeAllMatchesWithPair' : function(pairId){
		matchSearch = {};
		matchSearch[pairId] = {$exists:true};
		Matches.remove(matchSearch);
	},

	/*
		@param pairID a valid ID for a pair that is the Pairs table
		Category of the pair is automatically set
		dateMatch : one of "saturday", "sunday", "family"
		Adds the pair in the tournament on the right pool.
	 */
	'addPairToTournament' : function(pairID, year, dateMatch) {
		var registrationsON = GlobalValues.findOne({_id: "registrationsON"}).value;
		if(!registrationsON){
			console.error("Error in addPairToTournament: the registrations to the tournament are not opened.");
			return undefined;
		}

		if(!pairID) {
			console.error("Error addPairToTournament : no pairID specified");
			return undefined;
		}

		var pair = Pairs.findOne({_id:pairID});
		if(typeof pair === 'undefined'){
			console.error("addPairToTournament : invalid pairID, "+pairID+"/ "+pair);
			return false;
		}

		var p1;
		if(pair.player1){
			p1 = Meteor.users.findOne({_id:pair.player1._id});
			if(!p1){
				console.error("addPairToTournament : player1 does not exist !");
				return false;
			}
		}

		var p2;
		if(pair.player2){
			p2 = Meteor.users.findOne({_id:pair.player2._id});
			if(!p2){
				console.error("addPairToTournament : player2 does not exist !");
				return false;
			}
		}

		/*
				Set the category
		*/
		var type = Meteor.call('getPairType', dateMatch, p1, p2);
		if(typeof type === undefined) {
			console.error("addPairToTournament : getPairType returns undefined");
		}
		if(type === false) {
			console.error("addPairToTournament : getPairType returns false");
			return false;
		}

		var category = Meteor.call('getPairCategory', type, p1, p2);
		if(category === false) return false; // An error occured, detail of the error has already been displayed in console

		var poolID = Meteor.call('getPoolToFill', year, type, category);

		var pool = Pools.findOne({_id:poolID});
		var pairs = pool.pairs;
		if(!pairs){
			pairs = [];
		}
		pairs.push(pairID);
		var data = {};
		data._id = poolID;
		data.type=type;
		data.pairs = pairs;
		if(pool.leader==undefined){
			data.leader=pair.player1._id;
		}
		Meteor.call('updatePool', data);
	},

	/*
		@param year is the year of the tournament to consider
		@param type is the type of the tournament to consider (men, mixed, women or family)
		@param category is the age category of the tournament : preminimes, minimes, cadets, scholars, juniors, seniors or elites
		Returns the ID of the current pool to fill.
		The pools are filled one by one directly after a player has registered.
		If the upper-level table does not exist (year or type), creates an empty one then adds the pair.
	*/
	'getPoolToFill' : function(year, type, category) {
		if(typeof year=== undefined || typeof type=== undefined || typeof category=== undefined) {
			console.log("year :"+year+", type :"+type+", category:"+category);
			console.error("Error GetPoolToFill : no year and/or type and/or category specified");
			return undefined;
		}

		var yearTable = Years.findOne({_id:year});
		if (!yearTable) {
			console.log("getPoolToFill : no Year table found for year "+year+". Creating an empty one.");
			yearTable = Meteor.call('updateYear', {_id:year});
		}

		var typeID = yearTable[type];

		var typeTable = Types.findOne({_id:typeID});

		// No type table for now
		if (typeTable==undefined) {
			console.log("getPoolToFill : no Type table found for year "+year+" and type "+type+". Creating an empty one.");
			typeID = Types.insert({});
			// typeID = Meteor.call('updateType', {});
			typeTable = Types.findOne({_id:typeID});

			yearData = {_id:year};
			yearData[type] = typeID;
			yearTable = Meteor.call('updateYear',yearData);
		}

		return Meteor.call('getNextPoolInPoolList', typeTable, type, category);
	},

	/*
		@param typeTable an object stored in the table Types
		@param category : minimes, seniors,...
		Helper of the *getPoolToFill* function
		Returns the current pool on which a pair should be registered
		This pool should be the first 'not full' pool it encounters while iterating over the list of pools
		If all current pools are full, create a new pool, update the Types table and returns the poolID
	*/
	'getNextPoolInPoolList' : function(typeTable, type, category) {
		var poolList = typeTable[category];
		if(poolList){
			for(var i=0;i<poolList.length;i++){
				pool = Pools.findOne({_id:poolList[i]});
				if (!pool) {
					console.error("getNextPoolInPollList : Error, no pool with ID "+poolList[i]+" found in Pools table");
					return undefined;
				}
				// Pool not full
				const maxNbrPairsInPool = 6;
				if (pool.pairs.length < maxNbrPairsInPool) {
					return poolList[i];
				}
			}
		}

		// no 'not full' pool found, creating a new one
		var poolID = Pools.insert({'type':type});

		poolList = [poolID];
		data = {};
		data._id = typeTable._id;

		data[category] = poolList;

		// Update the type table concerned with the new pool
		Meteor.call('updateType', data);
		return poolID;

		// Meteor.call('updatePool', {}, thisCallback);
	},

	/*
		Returns the list of the IDs of all the pools in the DB
	 */
	'getPools' : function() {
		var list = []
		Pools.find().forEach(function(data){
			list.push(data._id);
		})
	},

	'insertQuestion' : function(Question){
		var data ={
			lastname : Question.lastname,
			firstname: Question.firstname,
			email : Question.email,
			question : Question.question,
			date : Question.date,
			processed : false
		}
		return Questions.insert(data)
	},

	'removeExtra' : function(extraId){
		if(Meteor.call('isAdmin') || Meteor.call('isStaff')){
			Extras.remove({_id:extraId});
		}
		else {
			console.error("You don't have the permission to do that.");
		}
	},

	'updateExtra' : function(extraData){
		if(Meteor.call('isAdmin') || Meteor.call('isStaff')){
			data = {};
			extraId = undefined;
			if(extraData._id!==undefined){
				extraId = extraData._id;
			}
			if(extraData.name!==undefined){
				data.name = extraData.name;
			}
			if(extraData.price!==undefined){
				data.price = extraData.price;
			}
			if(extraData.comment!==undefined){
				data.comment = extraData.comment;
			}
			if(extraId===undefined){
				extraId = Extras.insert(data);
				return extraId;
			}
			data2 = {$set:data};
			Extras.update({_id:extraId}, data2);
			return extraId;
		}
		else {
			console.error("You don't have the permission to do that.");
		}
	},

	'updateQuestionStatus': function(nemail,nquestion,ndate,nanswer){
		if(Meteor.call('isAdmin') || Meteor.call('isStaff')){
			Questions.update({email:nemail,question:nquestion,date:ndate}, {
        		$set: {processed: true,answer:nanswer}
      		});
		}
		else {
			console.error("You don't have the permission to do that.");
		}
	},

	//You need to add the secrets.js file inside the server folder.
/*
	@param to: is for the receiver email,
	@param subject : is for the object of the mail,
	@param data : var data = {
      intro:"Bonjour Joseph !",
			important:"lorem1",
			texte:"lorem 2",
			encadre:"final2"};
	*/
	'emailFeedback': function (to, subject, data) {


							// Don't wait for result
							this.unblock();

							// Define the settings
							var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
							var options =   {
								auth: "api:" + process.env.MAILGUN_API_KEY,
									params: {
										"from":"Le Charles de Lorraine <staff@lecharlesdelorraine.com>",
										"to":to,
										"subject": subject,
										"html": SSR.render("mailing",data),
									}
								}
								var onError = function(error, result) {
									if(error) {console.error("Error: " + error)}
								}

								// Send the request
                var user = Meteor.users.findOne({_id:Meteor.userId()});
                var usermail = user.emails[0].address;
                if(Meteor.call('isStaff') || Meteor.call('isAdmin') || usermail==to){
                  Meteor.http.post(postURL, options, onError);
                  console.log("Email sent");
                }
                else{
                  console.error("Forbidden permissions to send mail");
                }
	},

  'emailtoAllUsers':function(){
    var mails=[];
    var usersCursor = Meteor.users.find();
    usersCursor.forEach( function(user) {
      mails.push(user.emails[0].address);
    });
    var subject = "[Le Charles De Lorraine] Lancement des inscriptions";
    var data  ={
      intro:"Bonjour,",
      important:"Nous avons une grande nouvelle à vous annoncer !",
      texte:"Dès aujourd'hui, vous avez la possibilité de vous inscrire à notre nouvelle édition du tournoi de tennis Le Charles de Lorraine.\n",
      encadre:"N'hésitez donc plus et allez vous inscire sur notre site internet !"
    };
    //TODO decomment when out of production
    // for (var i in mails) {
    //   Meteor.call('emailFeedback',mails[i],subject,data);
    // }
    console.log("Mails not send due to MAILGUN");

  },

  'emailtoPoolPlayers':function(poolId){
    if(poolId != undefined){
      var mails = [];
      var pool = Pools.findOne({_id:poolId});
      for (var i in pool.pairs) {
        var p = Pairs.findOne({_id:pool.pairs[i]});
        if(p.player1!=undefined){
          var p1 = Meteor.users.findOne({_id:p.player1._id});
          mails.push(p1.emails[0].address);
        }
        if(p.player2!=undefined){
          var p2 = Meteor.users.findOne({_id:p.player2._id});
          mails.push(p2.emails[0].address);
        }
      }
      var leaduser = Meteor.users.findOne({_id:pool.leader});
      var leader= leaduser.profile.firstName+" "+leaduser.profile.lastName+" ("+leaduser.profile.phone+")"; //string

      var fam = Types.findOne({"all":poolId});
      if(fam==undefined){
        var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
        var responsableList=[];
        var type = Types.findOne({$or:[{"preminimes":poolId},{"minimes":poolId},{"cadets":poolId},{"scolars":poolId},{"juniors":poolId},{"seniors":poolId},{"elites":poolId}]});
        for (var j in allcat){
          var cat = allcat[j];
          if(type[cat].indexOf(poolId)>-1){ //Look if our pool is in a cat
            var r= cat.concat("Resp")
            var resplist=type[r];
            if (resplist!=undefined && resplist.length>0){
              for (var k = 0; k < resplist.length; k++) {
                responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
              }
            }
          }
        }
      }
      else{
        var responsableList=[];
        var resplist = fam["allResp"];
        if (resplist!=undefined && resplist.length>0){
          for (var k = 0; k < resplist.length; k++) {
            responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
          }
        }
      }
      var responsables="";//string
      for (var i = 0; i < responsableList.length; i++) {
        responsables += responsableList[i].profile.firstName+" "+responsableList[i].profile.lastName+" ("+responsableList[i].profile.phone+")";
      }

      var adresse="";//string
      if(pool.courtId!=undefined){
        court = Courts.findOne({"courtNumber":pool.courtId});
        if(court && court.addressID){
          address = Addresses.findOne({_id:court.addressID});
          adresse = address.street+" "+address.number+" "+address.zipCode+" "+address.city;
        }
      }
      if(responsableList.length>1){
        var encadre="Voici le nom et le numéro de téléphone des membres du staff qui encadrent votre poule :" + responsables +"\n Votre chef de poule est : "+leader+". C'est auprès de lui que vous obtiendrez les dernières informations."+"\n La poule se déroulera à l'adresse suivante : "+adresse;
      }else{
        var encadre="Voici le nom et le numéro de téléphone du membre du staff qui encadre votre poule :" + responsables +"\n Votre chef de poule est : "+leader+". C'est auprès de lui que vous obtiendrez les dernières informations."+"\n La poule se déroulera à l'adresse suivante : "+adresse;
      }
      var subject = "Quelques informations concernant votre poule.";
      var data = {
        intro:"Bonjour,",
        important:"",
        texte:"Nous voici bientôt arrivé à notre très attendu tournoi de tennis Le Charles de Lorraine et pour que tout se déroule pour le mieux, vous trouverez les informations concernant votre poule dans l'encadré suivant.",
        encadre:encadre,
      };
      //TODO decomment when out of production
      // for (var i in mails) {
      //   Meteor.call('emailFeedback',mails[i],subject,data);
      // }
      console.log("Mails not send due to MAILGUN");

    }
    else{
      console.error("emailtoPoolPlayers/ UNDEFINED POOLID");
    }
  },

  'emailtoLeader':function(poolId){
    if(poolId!=undefined){
      var pool = Pools.findOne({_id:poolId});
      leader = Meteor.users.findOne({_id:pool.leader});

      var fam = Types.findOne({"all":poolId});
      if(fam==undefined){
        var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
        var responsableList=[];
        var type = Types.findOne({$or:[{"preminimes":poolId},{"minimes":poolId},{"cadets":poolId},{"scolars":poolId},{"juniors":poolId},{"seniors":poolId},{"elites":poolId}]});
        for (var j in allcat){
          var cat = allcat[j];
          if(type[cat].indexOf(poolId)>-1){ //Look if our pool is in a cat
            var r= cat.concat("Resp")
            var resplist=type[r];
            if (resplist!=undefined && resplist.length>0){
              for (var k = 0; k < resplist.length; k++) {
                responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
              }
            }
          }
        }
      }
      else{
        var responsableList=[];
        var resplist = fam["allResp"];
        if (resplist!=undefined && resplist.length>0){
          for (var k = 0; k < resplist.length; k++) {
            responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
          }
        }
      }
      var responsables="";//string
      for (var i = 0; i < responsableList.length; i++) {
        responsables += responsableList[i].profile.firstName+" "+responsableList[i].profile.lastName+" ("+responsableList[i].profile.phone+")";
      }
      var subject = "[IMPORTANT] Concernant le déroulement du tournoi de tennis Le Charles de Lorraine.";
      var data={
        intro:"Bonjour "+leader.profile.firstName+",",
        important:"Vous avez été choisi pour être le chef de la poule à laquelle vous allez jouer.",
        texte:"Cette responsabilité ne vous demande que quelques instants au début à la fin de la poule. Premièrement, il vous sera demandé d'aller récupérer la feuille de poule au quartier général avant d'aller jouer. Ensuite, veillez à ce que les points de chaque match soient inscrits dans les cases correspondantes. Finalement, nous vous demanderons aussi de ramener cette feuille au quartier général. Si vous avez besoin de plus d'informations, n'hésitez pas à contacter un membre du staff ou un responsable.",
        encadre:"Les responsables de votre poules sont : "+responsables+"\n Merci d'avance pour votre implication !",
      };
      //TODO decomment when out of production
      // Meteor.call('emailFeedback',leader.emails[0].address,subject,data);
      console.log("Mails not send due to MAILGUN");


    }
  },

  /* This function is to the remain player in a pair when the other is unregistered*/
  'emailtoAlonePairsPlayer':function(alonePlayerId,pair){
    var alonePlayer = Meteor.users.findOne({_id:alonePlayerId});

    if(alonePlayer!=undefined){
      if(alonePlayerId==pair.player1._id || alonePlayerId==pair.player2._id){
        var to = alonePlayer.emails[0].address;
        var subject= "Concernant votre paire au tournoi de tennis.";
        var data ={
          intro:"Bonjour "+alonePlayer.profile.firstName+",",
          important:"Nous avons une mauvaise nouvelle pour vous.",
          texte:"Votre partenaire ne souhaite plus s'inscrire pour notre tournoi de tennis Le Charles de Lorraine.",
          encadre:"C'est pourquoi nous vous invitons à venir choisir un nouveau partenaire sur notre site !"
        };

        var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
        var options =   {
          auth: "api:" + process.env.MAILGUN_API_KEY,
          params: {
            "from":"Le Charles de Lorraine <staff@lecharlesdelorraine.com>",
            "to":to,
            "subject": subject,
            "html": SSR.render("mailing",data),
          }
        }
        var onError = function(error, result) {
          if(error) {console.error("Error: " + error)}
        }
        Meteor.http.post(postURL, options, onError);
        console.log("Email sent");
      }else{
        console.error("Vous n'avez pas les permissions requises");
      }
    }else{
      console.error("Alone player is undefined");
    }
  },

	/*
		You can't modify these entries once they are added.
		An entry is as follows :
		{
			userId : <userId> // Automatically generated
			opType : <operationType> // String describing the type of the operation (mandatory)
			details : <all usefull informations about the operation> // short String describing the operation (optional)
			createdAt : <date> // automatically generated
		}
	*/
	'addToModificationsLog':function(logData){
		if(logData==undefined){
			console.error("addToModificationsLog error : logData is undefined");
			return;
		}
		if(logData.opType==undefined){
			console.error("addToModificationsLog error : missing operation type");
			console.log(logData);
			return;
		}

		data = {};

		data.userId = Meteor.userId();

		var date = new Date();
		data.createdAt = date;

		data.opType = logData.opType;
		if(logData.details!=undefined) data.details = logData.details;

		ModificationsLog.insert(data);
	},

	'getYear':function(player){
		function get_pair_id(player){
			var pairs = Pairs.find().fetch()
			var pair_in = []
			for(i = 0; i < pairs.length; i++){
				for(j = 0; j < player.length; j++){
					if((pairs[i].player1 && player[j]._id==pairs[i].player1._id) || (pairs[i].player2 && player[j]._id==pairs[i].player2._id)){
						pair_in.push(pairs[i]._id);
					}
				}
			}
			return pair_in;
		}
		function get_pool_id(pair_id){
			var pools = Pools.find().fetch()
			var pool_in = []
			for(i = 0; i < pools.length; i++){
				for(j = 0; j<pools[i].pairs.length; j++){
					for(k = 0; k<pair_id.length; k++){
						if(pair_id[k]==pools[i].pairs[j]){
							pool_in.push([pools[i]._id, pair_id[k]]);
						}
					}
				}
			}
			return pool_in;
		}
		function get_type (pool_id) {
			var types = Types.find().fetch()
			var type_in = []
			for(i = 0; i < types.length; i++){
				for(k = 0; k < pool_id.length; k++){
					for(j = 0; types[i].preminimes !== undefined && j < types[i].preminimes.length; j++){
						if(types[i].preminimes[j] === pool_id[k][0]){
							type_in.push(['Préminimes',types[i]._id, pool_id[k][1]]);
						}
					}
					for(j = 0; types[i].minimes !== undefined && j < types[i].minimes.length; j++){
						if(types[i].minimes[j] === pool_id[k][0]){
							type_in.push(['Minimes',types[i]._id, pool_id[k][1]]);
						}
					}
					for(j = 0; types[i].cadets !== undefined && j < types[i].cadets.length; j++){
						if(types[i].cadets[j] === pool_id[k][0]){
							type_in.push(['Cadets',types[i]._id, pool_id[k][1]]);
						}
					}
					for(j = 0; types[i].scolars !== undefined && j < types[i].scolars.length; j++){
						if(types[i].scolars[j] === pool_id[k][0]){
							type_in.push(['Scolaires',types[i]._id, pool_id[k][1]]);
						}
					}
					for(j = 0; types[i].juniors !== undefined && j < types[i].juniors.length; j++){
						if(types[i].juniors[j] === pool_id[k][0]){
							type_in.push(['Juniors',types[i]._id, pool_id[k][1]]);
						}
					}
					for(j = 0; types[i].seniors !== undefined && j < types[i].seniors.length; j++){
						if(types[i].seniors[j] === pool_id[k][0]){
							type_in.push(['Seniors',types[i]._id, pool_id[k][1]]);
						}
					}
					for(j = 0; types[i].elites !== undefined && j < types[i].elites.length; j++){
						if(types[i].elites[j] === pool_id[k][0]){
							type_in.push(['Elites',types[i]._id, pool_id[k][1]]);
						}
					}
				}
			}
			return type_in;
		}
		function get_year(type_id) {
			var years = Years.find().fetch()
			year_in = []
			for(i = 0; i < years.length; i++){
				for(j = 0; j < type_id.length; j++){
					if(years[i].men === type_id[j][1]){
						year_in.push(['Homme',years[i]._id, type_id[j][0], type_id[j][2]]);
					}
					else if(years[i].women === type_id[j][1]){
						year_in.push(['Femme',years[i]._id, type_id[j][0], type_id[j][2]]);
					}
					else if(years[i].mixed === type_id[j][1]){
						year_in.push(['Mixte',years[i]._id, type_id[j][0], type_id[j][2]]);
					}
					else if(years[i].family === type_id[j][1]){
						year_in.push(['Famille',years[i]._id, type_id[j][0], type_id[j][2]]);
					}
				}
			}
			return year_in;
		}
		function get_max_year(){
			var years = Years.find().fetch();
			var max_year = years[0]._id;
			for(i = 0; i < years.length; i++){
				if(years[i]._id > max_year){
					max_year = years[i]._id;
				}
			}
			return max_year;
		}
		function make_all(player){
			var pair_id;
			var new_player;
			if(player.length || player.length == 0){
				new_player = player;
			}
			else{
				new_player = [player];
			}

			if(new_player.length != 0){
				pair_id = get_pair_id(new_player);
			}
			pool_id = get_pool_id(pair_id);
			type_id = get_type(pool_id);
			year_id = get_year(type_id);
			return year_id;
		}
		ret = [make_all(player), get_max_year()];
		return ret;
	},

	'unsubscribeTournament': function(pair_id){
		if(!(Meteor.call('isStaff') || Meteor.call('isAdmin')))
		{
			console.error("You don't have the permission do to that");
			throw new Meteor.error("unsubscribeTournament: no permissions");
			return false;
		}

		var pair = Pairs.findOne({'_id':pair_id});
		var save = Pairs.findOne({'_id':pair_id});
        if(typeof pair.player2 === 'undefined'){
          Pairs.remove({'_id':pair_id});
          var pools = Pools.find().fetch();
          var pool_id;
          for(i = 0; i < pools.length; i++){
              var poolPairs = pools[i].pairs;
              for(k = 0; k < poolPairs.length; k++){
                  if(pair_id == pools[i].pairs[k]){
                      pool_id = pools[i]._id;
                      var array = [];
                      for(l = 0; l < pair_id.length; l++){
                          if(k != l){
                              array.push(pools[i].pairs[l]);
                          }
                      }
                      break;
                      Pools.update({'_id': pool_id}, {$set: {'pairs': array}});
                  }
              }
          }
        }
        else {
          if(pair.player1._id == Meteor.userId()){
            Pairs.update({'_id': pair_id}, {$set: {'player1': pair.player2}});
          }
          Pairs.update({'_id': pair_id}, {$unset: {'player2': ""}});

          //Send email in secure
          var aloneId=Pairs.findOne({_id:pair_id}).player1._id;
          Meteor.call("emailtoAlonePairsPlayer",aloneId,save);
        }
	},

	/*
	*	Used for the steps of the tournamentProgress template.
	*	It updates the stepXdone value of the current year (in Years) with true (where X is the step number).
	*/
	'updateDoneYears' : function(stepNumber, booleanValue){
		if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
			var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
			var stepField = "step"+stepNumber+"done";
			var data = {};
			data[stepField] = booleanValue;
			return Years.update({_id: currentYear}, {$set: data});
		}
		else {
			console.error("")
			throw new Meteor.error("You don't have the permissions to call updateDoneYears");
		}
	},

	//Put currentYear to ""
	'restartTournament': function(){
		if(!Meteor.call('isAdmin')){
			console.error("You don't have the permissions to do that");
			throw new Meteor.error("You don't have the permissions to restart a tournament");
		}

		return GlobalValues.update({_id: "currentYear"}, {$set: {
			value: ""
		}});
	},


	'checkAFTranking': function(firstName, lastName, AFTranking){

		var url = "http://www.aftnet.be/Portail-AFT/Joueurs/Resultats-recherche-affilies.aspx?mode=searchname&nom="+lastName+"&prenom="+firstName;
		var response = HTTP.get(url);

		//var affiliationNumber = "4013748";
		//var url = "http://www.aftnet.be/Portail-AFT/Joueurs/Fiche-signaletique-membre.aspx?numfed="+affiliationNumber;
		//var response = HTTP.get(url);
		var stringToFind = "plc_lt_zoneContent_pageplaceholder_pageplaceholder_lt_zoneSubPage_pageplaceholder_pageplaceholder_lt_zoneContent_AFT_Member_Profile_lblClassementValue";
		var beginIndex = response.content.search(stringToFind);
		if(beginIndex > 0)
		{
			var i = beginIndex + stringToFind.length + 23;
			var result = "";
			while(response.content.charAt(i) != '<'){
				result += response.content.charAt(i);
				i++;
			}

			if(result == AFTranking){	//The entered AFT ranking corresponds to the AFT ranking on aftnet.be
				return true;
			}
			else {
				return false;
			}
		}
		else {		//Player not found on aftnet.be
			return true;
		}

	}


});
