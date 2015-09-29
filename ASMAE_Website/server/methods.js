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
	}

});