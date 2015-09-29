Meteor.methods({

	//Insert a new court in the Court database
	'insertCourt' : function(courtData){
		var data = {
			//ownerID : Meteor.userId(),
			surface : courtData.surface,
       		courtType : courtData.courtType,
       		instructions : courtData.instructions,
       		ownerComment : courtData.ownerComment

		}
		return Courts.insert(data);
	}

});