Meteor.publish('Courts', function(){
	if(this.userId) {
        var user = Meteor.users.findOne(this.userId);
        if(user.profile.isStaff || user.profile.isAdmin){
    		return Courts.find();
	    }
	    else{
	    	return Courts.find({ownerID: this.userId});
	    }
    }
    else{
    	return null;
    }
});

Meteor.publish('Addresses', function(){
    if(this.userId) {
        var user = Meteor.users.findOne(this.userId);
        if(user.profile.isStaff || user.profile.isAdmin){
    		return Addresses.find();
	    }
	    else{
	    	return Addresses.find({userID: this.userId});
	    }
    }
    else{
    	return null;
    }
});

Meteor.publish('Questions', function(){
	//TODO: eulement visible au staff
	return Questions.find();
});


Meteor.publish("users", function () {
	//var res = Meteor.users.find({},{});
	var res = Meteor.users.find({});

	return res;
});

Meteor.publish("Pairs", function () {
	var res = Pairs.find({},{});
	return res;
});

	Pools.allow({
    	'insert': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	},
    	'update': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	},
    	'remove': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	}
  	});

	Types.allow({
    	'insert': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	},
    	'update': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	},
    	'remove': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	}
  	});

	Pairs.allow({
    	'insert': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	},
    	'update': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	},
    	'remove': function (userId,doc) {
	      	/* user and doc checks ,
	      	return true to allow insert */
	      	if(Meteor.call('isStaff') || Meteor.call('isAdmin')){
	      		return true;
	  		}
	  		else{
	  			return false;
	  		}
    	}
	});


	Meteor.publish("Pools", function(){
		return Pools.find({},{});
	});

	Meteor.publish("Years", function(){
		return Years.find({},{});
	});

	Meteor.publish("Types", function(){
		return Types.find({},{});
	});


    /*
    * Only publish the pair needed. Publish nothing if player does not belong to the pair.
    * Known uses : client/myRegistration
    */
    Meteor.publish("PairInfo", function(pairID){
        var currentUser = this.userId;
        pair = Pairs.findOne({_id:pairID});
        if (!pair) {
            console.error("Error publish PairInfo : no pair matching id "+pairID+" found in the DB.");
            return undefined;
        }
        if (pair.player1._id != currentUser && pair.player2._id != currentUser) {
            console.error("Error publish PairInfo : you do not belong to the pair with ID="+pairID);
            return undefined;
        }
        return Pairs.find({_id:pairID});
    });

    /*
    * Only publish the address of the partner. Publish nothing if player does not belong to the pair.
    * Known uses : client/myRegistration
    */
    Meteor.publish("PartnerAdress", function(pairID) {
        var currentUser = this.userId;
        pair = Pairs.findOne({_id:pairID});
        if (!pair) {
            console.error("Error publish PartnerAdress : no pair matching id "+pairID+" found in the DB.");
            return undefined;
        }
        if (pair.player1._id != currentUser && pair.player2._id != currentUser) {
            console.error("Error publish PartnerAdress : you do not belong to the pair with ID="+pairID);
            return undefined;
        }
        var user;
        if(pair.player1._id != currentUser){
          user = Meteor.users.findOne({_id:pair.player1._id});
        }
        else if(pair.player2 && pair.player2._id != currentUser){
          user = Meteor.users.findOne({_id:pair.player2._id});
        }
        if(!user) {
            console.error("Error publish PartnerAdress : you do not have a partner in this pair (ID="+pairID+")");
            return undefined;
        }
        var addrID = user.profile.addressID;
        return Addresses.find({_id:addrID});


    });
// }
