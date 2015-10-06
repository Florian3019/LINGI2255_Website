Meteor.methods({

	//Insert a new court in the Court database
	'insertCourt' : function(courtData){
		var courtAddress = {
			//name : //get user name 
			street : courtData.street,
			number : courtData.number,
			box : courtData.box,
			city : courtData.city,
			zipCode : courtData.zipCode
		}

		var addressID = Addresses.insert(courtAddress);
		var data = {
			//ownerID : Meteor.userId(),
			surface : courtData.surface,
       		courtType : courtData.courtType,
       		instructions : courtData.instructions,
       		ownerComment : courtData.ownerComment,
       		addressID : addressID

       		/*TO ADD:

       		courtNumber
       		zone
       		mapNumber
       		lendThisYear (ou alors noter l'id du tournoi (ou l'année du dernier tournoi où il était prêté), sinon je ne sais pas quand on pourra le remettre à 'false' après le tournoi)
       		availability
       		staffComment
       		
       		*/
		}

		return Courts.insert(data);
	},

	/*
		@param : userData : javascript object containing the fields of the user. It must include at least the _id field.
		
		User structure is as follows :
		{	
			.createdAt:<createdAt>,
			._id:<id>,
			.emails:[{ "address" : "<email1>", "verified" : false } , ...],
			.profile:{
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
			.services:{
				.google{
					<google stuff>
				}
				.facebook{
					<facebook stuff>
				}
			}
		}

		If the _id is not already in the DB, this will add that _id and all other fields of userData to the DB (creating a new user).
		Missing fields will be set to undefined (except for admin and staff which default to false).
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

		// existingUser = UserList.find({ _id: userData._id });

		var profile = userData.profile;

		var data = {$setOnInsert: { 'profile.isAdmin': false, 'profile.isStaff': false }, profile:{}};
		var dataProfile = data.profile;
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




		if(profile.name){
			dataProfile.name = profile.name;
		}

		if(profile.title){
			dataProfile.title = profile.title;
		}
		if(profile.firstName){
			dataProfile.firstName = profile.firstName;
		}
		if(profile.lastName){
			dataProfile.lastName = profile.lastName;
		}

		if(profile.gender){
			dataProfile.gender = profile.gender;
		}

		if(profile.addressID){
			dataProfile.addressID = profile.addressID;
		}
		if(profile.phone){
			dataProfile.phone = profile.phone;
		}
		if(profile.birthDate){
			dataProfile.birthDate = profile.birthDate;
		}
		if(profile.AFT){
			dataProfile.AFT = profile.AFT;
		}

		if(profile.isStaff){
			dataProfile.isStaff = profile.isStaff;
		}

		if(profile.isAdmin){
			dataProfile.isAdmin = profile.isAdmin;
		}

		// Write data on the DB
		writeResult = UserList.update({_id: data._id} , {$set: data}, {upsert: true});
		if(writeResult.writeConcernError){
			console.error('updateUser : ' + writeResult.writeConcernError.code + " " + writeResult.writeConcernError.errmsg);
			return;
		}
		if(writeResult.nUpserted >0){
			return true;
		}

		return false;
	}
});