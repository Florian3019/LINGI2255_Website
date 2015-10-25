
Template.myRegistration.helpers({
  'setCurrentPlayer': function(){
  	return Meteor.userId();
  },


  'hasPairPlayer' : function(status){
    var id = Meteor.userId();
    var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});

    if(!pair){
      if(status == "true"){
        return "Vous n'êtes pas inscrit";
      }
      return false;
    }

    var user;
    if(pair.player1 && pair.player1._id != Meteor.userId()){
      user = Meteor.users.findOne({_id:pair.player1._id});
    }
    else if(pair.player2 && pair.player2._id != Meteor.userId()){
      user = Meteor.users.findOne({_id:pair.player2._id});
    }

    if(!user){
      if(status == "true") return "En attente d'un partenaire";
      return false;
    }
    if(status) return "Vous êtes inscrit et avez un partenaire !";

    return true;
  },

  // Returns the player playing with the current player, if any
  'setPairPlayer': function(){
    var id = Meteor.userId();
    var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});
    if(!pair){
      return false;
    }

    var user;
    if(pair.player1 && pair.player1._id != Meteor.userId()){
      return pair.player1._id;
    }
    else if(pair.player2 && pair.player2._id != Meteor.userId()){
      return pair.player2._id;
    }
    return undefined;
  }

});

Template.myRegistration.onCreated(function (){
	var id = Meteor.userId();
    var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});
	if(pair){
    this.subscribe("PairInfo");
	this.subscribe("PartnerAdress");
  }
});
