Meteor.methods({


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
		console.log("staff");
		var res = Meteor.users.findOne({_id:Meteor.userId()}, {"profile.isStaff":1});
		return res ? res.profile.isStaff : false;
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
		if(!courtData.ownerID){
			console.error("updateCourt : Must provide owner id to update the court !");
			return;
		}

		var u = Meteor.users.findOne({_id:courtData.ownerID});
		if(!u){
			console.error('updateCourt : owner does not exist !');
			return;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = courtData.ownerID == Meteor.userId();

		if(! (userIsOwner || isAdmin || isStaff) ){
			console.error("updateCourt : You don't have the permissions to update a court !");
			return;
		}


       		/*TO ADD:

       		courtNumber
       		zone
       		mapNumber
       		lendThisYear (ou alors noter l'id du tournoi (ou l'année du dernier tournoi où il était prêté), sinon je ne sais pas quand on pourra le remettre à 'false' après le tournoi)      		
       		*/

		var courtId = courtData._id;
		var data = {};

		data.ownerID = courtData.ownerID;
		
		// Fill in court info
		if(courtData._id){
			data._id = courtData._id;
		}
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
		
		if(courtData.availability){
			data.availability = courtData.availability;
		}

		if(courtId){
			// Court already exists, so just update it :
			var writeResult = Courts.update({_id: courtId} , {$set: data});
			if(writeResult.writeConcernError){
				console.error('updateCourt : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
				return;
			}
			if(address){
				Meteor.call('updateAddress', address, courtData.ownerID, courtId);
			}
		}
		else{
			// Check that a court with that address does not already exist :
			if(address && Meteor.call('addressExists', address)) return;

			data.lendThisYear = true;

			// Create a new court
			var id = Courts.insert(data, function(err, addrId){
				if(err){
					console.error('updateCourt error');
					console.error(err);
					return;
				}
				// Update addressID in the user
				courtId = addrId; // remember the court id

				if(address){
					Meteor.call('updateAddress', address, courtData.ownerID, courtId);
				}

			});
			console.log("id retourne par insert : "+id);
			return id;
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
		data._id = userData._id; // Always add the id

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
		var writeResult = Meteor.users.update({_id: data._id} , {$setOnInsert: { 'profile.isAdmin': false, 'profile.isStaff': false }, $set: data}, {upsert: true});
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
			_id:<id>, // Ommit this if you want to create a new address, this will be auto-generated
			street:<street>,
			number:<number>,
			box:<box>,
			city:<city>,
			zipCode:<zipCode>,
			country:<country>
		}

		If some fields are missing, they will be left untouched.
	
	*/
	'updateAddress' : function(addressData, userId, courtId){
		if(!userId && !courtId){
			console.error("updateAddress : Must provide user id or courtId to update the address !");
			return;
		}
		if(courtId && !userId){
			console.error("updateAddress : must provide the userId of the person trying to make the request if trying to modify a court!");
			return;	
		}

		var u = Meteor.users.findOne({_id:userId});
		if(!u){
			console.error('updateAddress : that user doesn\'t exist !');
			return;
		}

		if(courtId){
			// Check that that courtId really exists :
			var c = Courts.findOne({_id:courtId});
			if(!c){
				console.error('updateAddress : that court doesn\'t exist !');
				return;
			}
			// If an address id is provided, make sure that addressId is the one from the court
			if(addressData._id && c.addressID!=addressData._id){
				console.error('updateAddress : trying to update an address not belonging to the court provided!');
				return;
			}
		}
		else{
			if(addressData._id && u.profile && u.profile.addressID && u.profile.addressID != addressData._id){
				console.error('updateAddress : trying to update an address not belonging to the user provided!');
				return;
			}	
		}

		

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		const userIsOwner = userId == Meteor.userId();
		
		if(!(userIsOwner || isAdmin || isStaff)){
			console.error("updateUser : You don't have the required permissions!");
			return;
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
				Addresses.insert(data, function(err, addrId){
					if(err){
						console.error('updateAddress error');
						console.error(err);
						return;
					} 	
					// Update addressID in the user
	        		Meteor.call('updateUser', {_id:userId, profile:{addressID:addrId}});
				});
				// Done with new insert
				return;
			}
			if(courtId){
				Addresses.insert(data, function(err, addrId){
					if(err){
						console.error('updateAddress error');
						console.error(err);
						return;
					} 	
					// Update addressID in the user
	        		Meteor.call('updateCourt', {_id:courtId, ownerID:userId, addressID:addrId});
				});
				// Done with new insert
				return;
			}
		}
		data._id = addressData._id; // set the address data


		// Add the address in the DB
		var writeResult = Addresses.update({_id: data._id} , {$set: data});
		if(writeResult.writeConcernError){
			console.error('updateAddress : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
			return;
		}
	},

	/*
		If a wish(es) is specified, it(they) must be in an array and will be appended to the list of existing wishes.
		
		A pair is structured as follows:
		{
			_id:<id>,
			year:<year>,
			day:<day,
			category:<category>,
			player1:{
				_id:<userID>,
				extras:{
					BBQ:<bbq>
				},
				wish:<wish>,
				constraint:<constraint>,
				paymentID:<paymentID>
			}
			player2:{
				_id:<userID>,
				extras:{
					BBQ:<bbq>
				},
				wish:<wish>,
				constraint:<constraint>,
				paymentID:<paymentID>
			}
		}

		@return : the pair id is successful, otherwise returns false
	*/
	'updatePairs' : function(pairData){
		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		console.log(pairData);
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
			console.error("updatePairs : You don't have the required permissions!");
			return false;
		}

		var data = {};
		if(pairData.year){
			data.year = pairData.year;
		}
		if(pairData.category){
			data.category = pairData.category;
		}


		if(pairData.day){
			data.day = pairData.day;
		}
			

		if(pairData._id){
			data._id = pairData._id;
		}

		// var p1_1;
		// var p1_2;
		// var p2_1;
		// var p2_2;
		// if(ID['player1']){
		// 	p1_1 = Pairs.findOne({player1:P1_id},{_id:1});
		// 	p1_2 = Pairs.findOne({player2:P1_id},{_id:1});
		// }

		// if(ID['player2']){
		// 	p2_1 = Pairs.findOne({player1:ID['player2']},{_id:1});
		// 	p2_2 = Pairs.findOne({player2:ID['player2']},{_id:1});
		// }
		// var err1 = p1_1 && p2_1 ? p1_1!=p2_1 : false;
		// var err2 = p1_1 && p2_2 ? p1_1!=p2_2 : false;
		// var err3 = p1_2 && p2_1 ? p1_2!=p2_1 : false;
		// var err4 = p1_2 && p2_2 ? p1_2!=p2_2 : false;
		// if(p1_1 && p1_2 || p2_1 && p2_1 || err1 || err2 || err3 || err4){
		// 	console.error("updatePairs : impossible configuration");
		// 	return;
		// }

		// if(p1_1){
		// 	pairData['_id'] = p1_1;	
		// }
		// else if(p1_2){
		// 	pairData['_id'] = p1_2;	
		// }
		// else if(p2_1){
		// 	pairData['_id'] = p2_1;	
		// }
		// else if(p2_2){
		// 	pairData['_id'] = p2_2;	
		// }


		// Player = player1 or player2
		setPlayerData = function(player){
			if(!pairData[player]) return; // Don't return false
			
			var p ={};

			var u = Meteor.users.findOne({_id:ID[player]});
			if(!u){
				console.error('updatePairs : player doesn\'t exist !');
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
				if(dataExtras['BBQ']){
					extr['BBQ'] = dataExtras['BBQ'];
					count = count+1;
				}
				if(count>0){
					p['extras'] = extr;
				}
			} 
			data[player] = p;
		}

		if(setPlayerData("player1") == false) return false;
		if(setPlayerData("player2") == false) return false;
		


		console.log(data);

		if(!pairData._id){
			var id;
			Pairs.insert(data, function(err, pairId){
				if(err){
					console.error('updatePairs error');
					console.error(err);
					return false;
				}
				id = pairId;
			});
			// Done with new insert
			return id;
		}

		// Add the address in the DB
		var writeResult = Pairs.update({_id: pairData['_id']} , {$set: data});
		if(writeResult.writeConcernError){
			console.error('updatePairs : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
			return false;
		}
		return pairData._id;
	},


	/*
		A payment is structured as follows :
		{
			_id:<id>,
			status:<status>, // paid or pending
			balance:<balance>,
			date:<data>,
			method:<method>, // Cash, Visa or Banknumber
		}

		player : can either be player1 or player2
	*/
	'updatePayment' : function(paymentData, pairId, player){
		if(!pairId){
			console.error('updatePayment : you must provide the pairId');
			return;
		}
		if(player!="player1" || player!="player2"){
			console.error('updatePayment : player is not recognized');
			return;
		}

		// Check that that pair really exists :
		var p = Pairs.findOne({_id:pairId});
		if(!p){
			console.error('updatePayment : that pair doesn\'t exist !');
			return;
		}

		const isAdmin = Meteor.call('isAdmin');
		const isStaff = Meteor.call('isStaff');
		
		if(!(isAdmin || isStaff)){
			console.error("updatePairs : You don't have the required permissions!");
			return;
		}

		var data = {};
		if(paymentData._id){
			var str = "paymentID.";
			var str2 = str.concat(player);
			if(p[str.concat(player)] && paymentData._id != p[str2]){
				console.error('updatePayment : trying to update a payment not belonging to the pair provided !');
				return;
			}
			data._id = paymentData._id;
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
			Payments.insert(data, function(err, paymId){
				if(err){
					console.error('updatePayment error');
					console.error(err);
					return;
				} 	
				var str = "paymentID.";
				var str2 = str.concat(player);
				// Update paymentID in the pair
				var upd = {};
				upd["_id"] = pairId;
				upd[str2] = paymId;
        		Meteor.call('updatePair', upd);
			});
			// Done with new insert
			return;
		}

		var writeResult = Payments.update({_id: paymentData._id} , {$set: data});
		if(writeResult.writeConcernError){
			console.error('updatePayment : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
			return;
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
	}


});