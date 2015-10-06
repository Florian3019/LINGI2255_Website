Meteor.methods({


	/*
		Returns true if the address addr is already a court address present in the DB.
	*/
	'addressExists' : function(addr){
		if(addr._id && Courts.find({addressID:addr._id})) return true;
		if(addr.zipCode && addr.street && addr.number){
			if(addr.box) if(Courts.find({zipCode:addr.zipCode, street:addr.street, number:addr.number, box:addr.box})) return true;
			else if(Courts.find({zipCode:addr.zipCode, street:addr.street, number:addr.number})) return true;
		}
		return false;
	},

	/*
		@param courtData is structured as a court, if _id is missing, 
		a new court will be created and linked to the owner. OwnerID or _id must be provided.
		@param address is structured as an address
		(fields can be missing, if the _id field is missing, a new address will be linked to this court, 
		erasing reference to previous addressID if existing). Can be null.

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
		if(!(courtData.ownerID || courtData._id)){
			console.error("updateUser : Must provide user id to update the court !");
			return;
		}


       		/*TO ADD:

       		courtNumber
       		zone
       		mapNumber
       		lendThisYear (ou alors noter l'id du tournoi (ou l'année du dernier tournoi où il était prêté), sinon je ne sais pas quand on pourra le remettre à 'false' après le tournoi)      		
       		*/

		var addrData = {};
		if(address){
			if(address._id){
				addrData._id = address._id;
			}
			if(address.street){
				addrData.street = address.street;
			}
			if(address.box){
				addrData.box = address.box;
			}
			if(address.number){
				addrData.number = address.number;
			}
			if(address.city){
				addrData.city = address.city;
			}
			if(address.zipCode){
				addrData.zipCode = address.zipCode;
			}
			if(address.country){
				addrData.country = address.country;
			}
		}


		var courtId = courtData._id;
		var data = {};

		if(data.ownerID){
			data.ownerID = courtData.ownerID;
		}
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
		if(courtData.type){
			data.type = courtData.type;
		}
		if(courtData.instructions){
			data.instructions = courtData.instructions;
		}
		if(courtData.ownerComment){
			data.ownerComment = courtData.ownerComment;
		}
		if(courtData.staffComment){
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
				console.log("before address update");
				console.log(courtId);
				Meteor.call('updateAddress', addrData, null, courtId);
			}
		}
		else{
			// Check that a court with that address does not already exist :
			if(address && Meteor.call('addressExists', addrData)) return;

			// Create a new court
			Courts.insert(data, function(err, addrId){
				if(err){
					console.error('updateCourt error');
					console.error(err);
					return;
				}
				// Update addressID in the user
				courtId = addrId; // remember the court id

				if(address){
					console.log("before address update");
					console.log(courtId);
					Meteor.call('updateAddress', addrData, null, courtId);
				}

			});
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
		console.log('userProfile');
		console.log(profile);
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
				console.log("addressId updateUser");
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

			if(profile.isStaff){
				data["profile.isStaff"] = profile.isStaff;
			}

			if(profile.isAdmin){
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
		@param userID : Updates the address of the user with id userId. 
		@param AddressData : if it does not contain a field _id, this will
		create a new address for the user (removing the reference to the previous one if there was one) and link its
		_id to the profile.addressID field of the user.

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
		console.log('updateAddress');
		if(!userId && !courtId){
			console.error("updateAddress : Must provide user id or courtId to update the address !");
			return;
		}
		if(userId && courtId){
			console.error("updateAddress : userId and courtId can't be set at the same time !");
			return;	
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

		if(!addressData._id){

			if(userId){
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
	        		Meteor.call('updateCourt', {_id:courtId, addressID:addrId});
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

		if(userId){
			Meteor.call('updateUser', {_id:userId, "profile.addressID":id}); // link address to the user
		}
		if(courtId){
			Meteor.call('updateCourt', {_id:courtId, addressID:addrId});
		}

		if(writeResult.nUpserted >0){
			return true;
		}

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