Meteor.publish('Courts', function(){
    //TODO: si user dans le staff alors publier tous les courts 
    return Courts.find({ownerID: this.userId});
});

Meteor.publish('Addresses', function(){
    //TODO: si user dans le staff alors publier tous les courts 
    return Addresses.find({userID: this.userId});
});

Meteor.publish('Questions', function(){
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
// }
