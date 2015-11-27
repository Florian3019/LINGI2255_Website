Template.confirmPair.helpers({
	'getNameOtherPlayer' : function(idPair){

		var pair = Pairs.findOne({_id:idPair});

		if(!pair){
			return "undefined pair";
		}

		var  idPlayer= pair.player1._id;

		Session.set("pair", pair);

		if(idPlayer){
			return Meteor.users.findOne({_id:idPlayer}).profile.firstName + " " + Meteor.users.findOne({_id:idPlayer}).profile.lastName;
		}
		else{
			return "undefined";
		}
	}
});
