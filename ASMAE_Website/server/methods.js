const REGISTRATION_PRICE = 10;
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
			$set: {"profile.isAdmin":1,"profile.isStaff":1}
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
		return res ? res.profile.isStaff : false;
	},
	'turnAdmin': function(nid){
		if(Meteor.call('isAdmin')){
			Meteor.users.update({_id:nid}, {
           		$set: {"profile.isAdmin":1,"profile.isStaff":0}
         	});
		}
		else {
			console.error("updateCourt : You don't have the permissions to update a court !");
			return false;
		}
	},
	'turnStaff': function(nid){
		if(Meteor.call('isAdmin')){
			Meteor.users.update({_id:nid}, {
           		$set: {"profile.isAdmin":0,"profile.isStaff":1}
         	});
		}
		else {
			console.error("updateCourt : You don't have the permissions to update a court !");
			return false;
		}

	},
	'turnNormal': function(nid){
		if(Meteor.call('isAdmin')){
			Meteor.users.update({_id:nid}, {
	        	$set: {"profile.isAdmin":0,"profile.isStaff":0}
	      	});
		}
		else {
			console.error("updateCourt : You don't have the permissions to update a court !");
			return false;
		}
	},

	/*
	* @param birthDate is of type Date
	* @param todayDate give an optional today date (e. g. date of the tournament)
	*/
	'getAge' : function(birthDate, todayDate){
		var today;
		if (todayDate) {
			today = todayDate;
		}
		else {
			today = new Date();
		}
	    var age = today.getFullYear() - birthDate.getFullYear();
	    var m = today.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	},

	/*
	* @param birthDate is of type Date
	*/
	'getCategory' : function(birthDate, family){
		var age = Meteor.call('getAge', birthDate, undefined);
		if(age < 9){
			return undefined;
		}
		if(9 <= age && age <= 10){
			return categoriesKeys[0];
		}
		if(11 <= age && age <= 12){
			return categoriesKeys[1];
		}
		if(13 <= age && age <= 14){
			return categoriesKeys[2];
		}
		if(15 <= age && age <= 16){
			return categoriesKeys[3];
		}
		if(17 <= age && age <= 19){
			return categoriesKeys[4];
		}
		if(20 <= age && age <= 40){
			return categoriesKeys[5];
		}
		return categoriesKeys[6];
	},

	'getPairCategory' : function(type, p1, p2){
		var category;
		if(type=="family"){
			return 'none';
		}
		else{
			var cat1;
			var cat2;

			if(p1){
				// We need the birthDate
				if(p1.profile.birthDate){
					// Fetch the category corresponding to that date
					cat1 = Meteor.call('getCategory', p1.profile.birthDate);
					if(!cat1){
						console.error("Player does not fit in any category (too young)");
						return false;
					}
				}
			}
			if(p2){
				// We need the birthDate
				if(p2.profile.birthDate){
					// Fetch the category corresponding to that date
					cat2 = Meteor.call('getCategory', p2.profile.birthDate);
					if(!cat2){
						console.error("Player does not fit in any category (too young)");
						return false;
					}
				}
			}
			if(cat1 && cat2){
				// Both players are provided, check that the categories match !
				if(cat1 != cat2){
					console.error("getPairCategory : categories of the 2 players do not match !");
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

		if(dateMatch == typeKeys[3]){ // Family
			return typeKeys[3];
		}

		var gender1;
		var gender2;

		if(p1){
			gender1 = p1.profile.gender;
		}
		if(p2){
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
		if(dateMatch == "saturday"){
			if(gender1 && gender2 && gender1 == gender2){
				console.error("Saturday is mixed only !");
				return false;
			}
			if(!gender1 && !gender2){
				console.warn("No information on the gender available, setting type to mixed");
			}
			return typeKeys[2]; //mixed
		}
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
			NOTE : for the family tournament, only one list of pools :
			list:<list of poolIDs>
		}
	*/
	'updateType' : function(typeData) {
		if (!typeData) {
			console.error("updateType : no typeData provided : "+typeData);
			return;
		}

		console.log(typeData);

		var data = {};
		for (var i=0;i<categoriesKeys.length;i++){
			if(typeData[categoriesKeys[i]]!=undefined){
				if(!data.$addToSet) data['$addToSet'] = {};
				data.$addToSet[categoriesKeys[i]] = {$each : typeData[categoriesKeys[i]]};
			}
			var b = categoriesKeys[i].concat("Bracket");
			if(typeData[b]!=undefined){
				if(!data.$set) data['$set'] = {};
				data.$set[b] = typeData[b];
			}
		}
		if(!typeData._id){
			return Types.insert(data);
		}

		Types.update({_id: typeData._id} , data);
		return typeData._id;
	},

	/*
		@param courtData is structured as a court, if _id is missing,
		a new court will be created and linked to the owner. OwnerID must be provided.
		@param address is structured as an address
		(fields can be missing, if the _id field is missing, a new address will be linked to this court,
		erasing reference to previous addressID if existing). Can be null.
		This function does a check to prevent a user from adding a new court with an existing court address (preventing duplicates)
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
			availability:<availability>
		}
	*/
	'updateCourt' : function(courtData, address){
		var courtId = courtData._id;
		if(!courtData.ownerID) //New court
		{
			courtData.ownerID = Meteor.userId();
		}

		var u = Meteor.users.findOne({_id:courtData.ownerID});
		if(!u){
			console.error('updateCourt : owner does not exist !');
			return false;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = courtData.ownerID == Meteor.userId();

		if(! (userIsOwner || isAdmin || isStaff) ){
			console.error("updateCourt : You don't have the permissions to update a court !");
			return false;
		}


       		/*			TODO
       		ADD:
       		courtNumber
       		zone
       		mapNumber
       		lendThisYear (ou alors noter l'id du tournoi (ou l'année du dernier tournoi où il était prêté), sinon je ne sais pas quand on pourra le remettre à 'false' après le tournoi)
       		*/


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

		if(courtData.free !== null && typeof courtData.free !== 'undefined'){
			data.free = courtData.free;
		}

		if(typeof courtData.dispoSamedi !== 'undefined' && typeof courtData.dispoDimanche !== 'undefined')
		{
			if(courtData.dispoSamedi || courtData.dispoDimanche){
				data.lendThisYear = true;
			}
			else{
				data.lendThisYear = false;
			}
		}

		if(!courtId){
			// Check that a court with that address does not already exist :
			if(address && Meteor.call('addressExists', address)){
				console.log("Court already exists :");
				console.log(address);
				return null;
			}

			// Create a new court
			var courtId = Courts.insert(data, function(err, courtId){
				if(err){
					throw new Meteor.Error("updateCourt error: during Courts.insert", err);
				}

				// Update addressID in the user
				if(address){
					Meteor.call('updateAddress', address, courtData.ownerID, courtId);
				}
			});
		}
		else
		{
			// Court already exists, so just update it :

			Courts.update({_id: courtId} , {$set: data}, function(err, count, status){
				if(err){
					throw new Meteor.Error("updateCourt error : during Courts.update", err);
				}
				if(address){
					Meteor.call('updateAddress', address, courtData.ownerID, courtId);
				}
			});
		}
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
		var writeResult = Meteor.users.update({_id: userData._id} , {$setOnInsert: { 'profile.isAdmin': false, 'profile.isStaff': false }, $set: data}, {upsert: true});
		if(writeResult.writeConcernError){
			console.error('updateUser : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
			return;
		}
		if(writeResult.nUpserted >0){
			return true;
		}

		return false;
	},


	/*
		@param userId : Updates the address of the user with id userId.
				If courtId is provided, updates the court address (userId is then the owner's id).
				userId must be provided.
		@param AddressData : if it does not contain a field _id, this will
		create a new address for the user or court (removing the reference to the previous one if there was one) and link its
		_id to the profile.addressID field of the user or the .addressID field of the court.
		The addressData structure is as follows :
		{
			_id:<id>, // Omit this if you want to create a new address, this will be auto-generated
			street:<street>,
			number:<number>,
			box:<box>,
			city:<city>,
			zipCode:<zipCode>,
			country:<country>
		}
		If some fields are missing, they will be left untouched.
		Returns false on failure and true on success
	*/
	'updateAddress' : function(addressData, userId, courtId){
		if(!userId && !courtId){
			console.error("updateAddress : Must provide user id or courtId to update the address !");
			return false;
		}
		if(courtId && !userId){
			console.error("updateAddress : must provide the userId of the person trying to make the request if trying to modify a court!");
			return false;
		}

		var u = Meteor.users.findOne({_id:userId});
		if(!u){
			console.error('updateAddress : that user doesn\'t exist !');
			return false;
		}

		if(courtId){
			// Check that courtId really exists :
			var c = Courts.findOne({_id:courtId});
			if(!c){
				console.error('updateAddress : that court doesn\'t exist !');
				return false;
			}
			// If an address id is provided, make sure that addressId is the one from the court
			if(addressData._id && c.addressID!=addressData._id){
				console.error('updateAddress : trying to update an address not belonging to the court provided!');
				return false;
			}
		}
		else{
			if(addressData._id && u.profile && u.profile.addressID && u.profile.addressID != addressData._id){
				console.error('updateAddress : trying to update an address not belonging to the user provided!');
				return false;
			}
		}


		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = userId == Meteor.userId();

		if(!(userIsOwner || isAdmin || isStaff)){
			console.error("updateUser : You don't have the required permissions!");
			return false;
		}

		var data = {};
		data.userID = userId;

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

		if(!addressData._id){

			if(userId && !courtId){
				var addressID;
				Addresses.insert(data, function(err, addrId){
					if(err){
						console.error('updateAddress error: while insert for courtId=false');
						console.error(err);
						return false;
					}
					addressID = addrId;
					// Update addressID in the user
	        		Meteor.call('updateUser', {_id:userId, profile:{addressID:addrId}});
				});
				// Done with new insert
				return addressID;
			}
			if(courtId){
				var addressID;
				Addresses.insert(data, function(err, addrId){
					if(err){
						console.error('updateAddress error: while insert for courtId=true');
						console.error(err);
						return false;
					}
					addressID = addrId;
					// Update addressID in the user
	        		Meteor.call('updateCourt', {_id:courtId, ownerID:userId, addressID:addrId});
				});
				// Done with new insert
				return addressID;
			}
		}

		// Add the address in the DB
		var writeResult = Addresses.update({_id: addressData._id} , {$set: data}, function(err, count, status){
			if(err){
				console.error('updateAddress error : while update existing address');
				console.error(err);
				return false;
			}
		});
		return writeResult;
	},

	/*
		If a wish(es) is specified, it(they) must be in an array and will be appended to the list of existing wishes.
		If you supply the category (and no player), make sure it fits the category of both players --> not checked.
		The category will be automatically checked and set if you provide at least a player.
		The update fails if both players are not of the same category or if the supplied category does not fit the player.
		/!\ For a the family type tournament, the category should be "none"
		A pair is structured as follows:
		{
			_id:<id>,
			player1:{
				_id:<userID>,
				extras:{
					BBQ:<bbq>
				},
				wish:<wish>,
				constraint:<constraint>
			}
			player2:{
				_id:<userID>,
				extras:{
					BBQ:<bbq>
				},
				wish:<wish>,
				constraint:<constraint>
			}
			tournament :[<pointsRound1>, <pointsRound2>, ....],
			tournamentCourts:[<courtForRound1>, ...],
			day: family | saturday | sunday
			category: <category>
		}
		@return : the pair id if successful, otherwise returns false
	*/
	'updatePair' : function(pairData){
		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		ID = {};
		if(pairData.player1){
			P1_id= pairData.player1._id;
			ID['player1'] = P1_id;
		}
		if(pairData.player2){
			P2_id = pairData.player2._id;
			ID['player2'] = P2_id;
		}

		const userIsOwner = ID['player1'] == Meteor.userId() || ID['player2'] == Meteor.userId();
		if(!(userIsOwner || isAdmin || isStaff)){
			console.error("updatePair : You don't have the required permissions!");
			return false;
		}

		var data = {};
		if (pairData.day) {
			data.day = pairData.day;
		}
		if (pairData.category) {
			data.category = pairData.category;
		}

		// Player = player1 or player2
		setPlayerData = function(player){
			if(!pairData[player]) return; // Don't return false

			var p ={};

			var u = Meteor.users.findOne({_id:ID[player]});
			if(!u){
				console.error('updatePair : player doesn\'t exist !');
				return false;
			}

			p['_id'] = ID[player];
			pData = pairData[player];

			if(pData['paymentID']) p['paymentID'] = pData['paymentID'];
			if(pData['wish']) p['wish'] = pData['wish'];
			if(pData['constraint']) p['constraint'] = pData['constraint'];

			if(pData['extras']){
				extr = {};
				var count = 0;
				var dataExtras = pData['extras'];

				var extras = Extras.find().fetch();

				for(var i=0;i<extras.length;i++){

					if(dataExtras[extras[i].name]){
						extr[extras[i].name] = dataExtras[extras[i].name];
						count = count+1;
					}
				}

				if(count>0){
					p['extras'] = extr;
				}
			}

			console.log(p);
			data[player] = p;
		}

		var check1 = setPlayerData("player1");
		var check2 = setPlayerData("player2");
		if(check1 == false || check2 == false) return false;
		if(typeof check1 === 'undefined' && typeof check2 === 'undefined'){
			console.warn("No data about any player was provided to updatePair");
		}


		//Payments: add to the Payments collection
		var amount = REGISTRATION_PRICE;

		//TODO: add extras to amount

		paymentData = {
			userID : Meteor.userId(),
			status : "pending",
			paymentMethod : pairData.paymentMethod,
			balance : amount
		};
		Payments.insert(paymentData, function(err, paymId){
			if(err){
				console.error('insert payment error');
				console.error(err);
			}
			console.log("Payment successfuly inserted");
		});



		if(!pairData._id){
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
		TODO: deprecated version (we don't use Pairs anymore)

		A payment is structured as follows :
		{
			_id:<id>,
			status:<status>, // paid or pending
			balance:<balance>,
			date:<date>,
			method:<method>, // Cash, CreditCard or BankTransfer
		}
		player : can either be player1 or player2
	*/
	'updatePayment' : function(paymentData, pairId, player){
		if(!pairId){
			console.error('updatePayment : you must provide the pairId');
			return false;
		}
		if(player!="player1" || player!="player2"){
			console.error('updatePayment : player is not recognized');
			return false;
		}

		// Check that that pair really exists :
		var p = Pairs.findOne({_id:pairId});
		if(!p){
			console.error('updatePayment : that pair doesn\'t exist !');
			return false;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');

		if(!(isAdmin || isStaff)){
			console.error("updatePayment : You don't have the required permissions!");
			return false;
		}

		var data = {};
		if(paymentData._id){
			var str = "paymentID.";
			var str2 = str.concat(player);
			if(p[str2] && paymentData._id != p[str2]){
				console.error('updatePayment : trying to update a payment not belonging to the pair provided !');
				return false;
			}
		}
		if(paymentData.status){
			data.status = paymentData.status;
		}
		if(paymentData.balance){
			data.payment = paymentData.balance;
		}
		if(paymentData.date){
			data.date = paymentData.date;
		}
		if(paymentData.method){
			data.method = paymentData.method;
		}

		if(!paymentData._id){
			return Payments.insert(data, function(err, paymId){
				if(err){
					console.error('updatePayment error');
					console.error(err);
				}

				var str = "paymentID.";
				var str2 = str.concat(player);
				// Update paymentID in the pair
				var upd = {};
				upd["_id"] = pairId;
				upd[str2] = paymId;
        			Meteor.call('updatePair', upd);
				});
		}

		Payments.update({_id: paymentData._id} , {$set: data}, function(err, count, status){
			if(err){
				console.error('updatePayment error');
				console.error(err);
			}
		});
		return paymentData._id;
	},


	/*
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
	'addPairsToTournament' : function(pairID, year, dateMatch) {
		if(!pairID) {
			console.error("Error addPairsToTournament : no pairID specified");
			return undefined;
		}

		pair = Pairs.findOne({_id:pairID});
		if(!pair){
			console.error("addPairsToTournament : invalid pairID");
			return false;
		}

		var p1;
		if(pair.player1){
			p1 = Meteor.users.findOne({_id:pair.player1._id});
			if(!p1){
				console.error("addPairsToTournament : player1 does not exist !");
				return false;
			}
		}

		var p2;
		if(pair.player2){
			p2 = Meteor.users.findOne({_id:pair.player2._id});
			if(!p2){
				console.error("addPairsToTournament : player2 does not exist !");
				return false;
			}
		}

		/*
				Set the category
		*/
		type = Meteor.call('getPairType', dateMatch, p1, p2);
		if(!type) return false;

		category = Meteor.call('getPairCategory', type, p1, p2);
		if(!category) return false; // An error occured, detail of the error has already been displayed in console

		var pair = Pairs.findOne({_id:pairID});
		poolID = Meteor.call('getPoolToFill', year, type, category);

		var pool = Pools.findOne({_id:poolID});
		var pairs = pool.pairs;
		if(!pairs){
			pairs = [];
		}
		pairs.push(pairID);
		data = {};
		data._id = poolID;
		data.pairs = pairs;
		if(!pool.leader){
			data.leader=pairID;
		}
		Meteor.call('updatePool', data, function(err, poolId){
			console.log("addPairsToTournament is done");
		});
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
		if(!year || !type || !category) {
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
		if (!typeTable) {
			console.log("getPoolToFill : no Type table found for year "+year+" and type "+type+". Creating an empty one.");
			typeID = Types.insert({});
			// typeID = Meteor.call('updateType', {});
			typeTable = Types.findOne({_id:typeID});

			yearData =  {_id:year};
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
		console.log(typeTable);
		var poolList = typeTable[category];
		console.log(poolList);
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
		var poolID = Pools.insert({});

		// Assign a court to the new pool

		Meteor.call('addCourtToPool',poolID,type);

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

	'addCourtToPool' : function(PoolID, type) {

        if(!PoolID){
            console.error("addCourtToPool: This is not a valid pool");
            return;
        }

        var pool = Pools.findOne({_id: PoolID});

        if(!pool){
            console.error("addCourtToPool: This is not a valid pool");
            return;
        }

        var court;

        if(type=="mixed" || type=="family"){
        	// find a court available on Saturday
        	court = Courts.findOne({$and: [{'dispoSamedi': true},{'free':true}]});
        }
        else{
			// find a court available on Sunday
			court = Courts.findOne({$and: [{'dispoDimanche': true},{'free':true}]});
        }

        if(court){
        	// a court was found
        	pool.courtId = court._id;
        	Meteor.call('updatePool',pool);
        	court.free=false;
        	Meteor.call('updateCourt',court,null);
        }
        else{
        	console.log("addCourtToPool: No court was found")
        }

    },

	'removePair' : function(pairId){
		Pairs.remove({_id:pairId});
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

	'insertExtra' : function(Extra){
		var data ={
			name : Extra.desc,
			price : Extra.price,
			comment : Extra.comment
		}
		return Extras.insert(data);
	},

	'removeExtra' : function(ExtraID){
		Extras.remove({_id:ExtraID});
	},

	'updateExtra' : function(Extra){
		Extras.update(Extra.extra,{name: Extra.name, price: Extra.price, comment: Extra.comment});
	},

	'updateQuestionStatus': function(nemail,nquestion,ndate,nanswer){
		 Questions.update({email:nemail,question:nquestion,date:ndate}, {
        	$set: {processed: true,answer:nanswer}
      		});
	},

	//You need to add the secrets.js file inside the server folder.
/*
	@param to: is for the receiver email,
	@param subject : is for the object of the mail,
	@param data : var dataContext = {
											intro:"Bonjour tdc,",
											message:"j'aurais pu mettre un lorem..."
										};
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
									if(error) {console.log("Error: " + error)}
								}

								// Send the request
                if (Meteor.call('isStaff') || Meteor.call('isAdmin')){// || Meteor.user().emails[0].address == to) {
                  Meteor.http.post(postURL, options, onError);
                  console.log("Email sent");
                }
                else{
                  console.error("Forbidden permissions to send mail");
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
	}

});
