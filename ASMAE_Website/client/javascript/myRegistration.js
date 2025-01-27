function hasPairPlayer(status, userId, day) {
	var pair = getDayPairFromPlayerID(userId, day);

    if(!pair){
      if(status == "true"){
        return "Pas inscrit";
      }
      return false;
    }

	var partnerEmail;
    var partner;
    if(pair.player1 && pair.player1._id != Meteor.userId()){
		partner = Meteor.users.findOne({_id:pair.player1._id});
    }
    else if(pair.player2 && pair.player2._id != Meteor.userId()){
		partner = Meteor.users.findOne({_id:pair.player2._id});
    }
	if(pair.player1 && pair.player1._id == Meteor.userId()){
		partnerEmail = pair.player1.partnerEmail;
    }
    else if(pair.player2 && pair.player2._id == Meteor.userId()){
		partnerEmail = pair.player2.partnerEmail;
    }

    if(!partner){
      if(status == "true") {
		  if (partnerEmail) {
			  return "En attente d'un partenaire dont l'email est "+partnerEmail;
		  }
		  else {
			  return "En attente d'un partenaire";
		  }
	  }
      return false;
    }
    if(status) {
		Session.set("partner"+day+"id",partner._id);
		return "Inscrit avec un partenaire";
	}

    return true;
}

function setPairPlayer(userId, day) {
	var pair = getDayPairFromPlayerID(userId, day);
    if(!pair){
      return false;
    }

    if(pair.player1 && pair.player1._id != Meteor.userId()){
      return pair.player1._id;
    }
    else if(pair.player2 && pair.player2._id != Meteor.userId()){
      return pair.player2._id;
    }
    return undefined;
}

Template.myRegistration.helpers({
	'setCurrentPlayer': function(){
		return Meteor.userId();
	},

	'hasSaturdayPairPlayer' : function(status){
		return hasPairPlayer(status, Meteor.userId(), "saturday");
	},

	'hasSundayPairPlayer' : function(status) {
		return hasPairPlayer(status, Meteor.userId(), "sunday");
	},

	// Returns the player playing with the current player, if any
	'setSaturdayPairPlayer': function(){
		return setPairPlayer(Meteor.userId(), "saturday");
	},
	'setSundayPairPlayer': function() {
		return setPairPlayer(Meteor.userId(), "sunday");
	},
	'currentYear' : function() {
		var currentYear = GlobalValues.findOne({_id:"currentYear"});
		if (!currentYear) {return undefined;}
		return currentYear.value;
	}
});

Template.myRegistration.onCreated(function (){
    var pairs = getPairsFromPlayerID(Meteor.userId());
  if(pairs){
    this.subscribe("PairsInfo");
  this.subscribe("PartnersAdresses");
  }
});
