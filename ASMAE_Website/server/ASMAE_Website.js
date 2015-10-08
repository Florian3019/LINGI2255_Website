Meteor.startup(function () {

	Meteor.publish("addresses", function () {
		var res = Meteor.users.findOne({_id:this.userId},{"profile.addressID":1});
		if(res){
			return Addresses.find({_id:res.profile.addressID});	
		}
    	
  	});

	Meteor.publish("users", function () {
		var res = Meteor.users.find({},{fields:{profile:1}});
		return res;
  	});

  	Meteor.publish("pairs", function () {
		var res = Pairs.find({},{});
		return res;
  	});

// code to run on server at startup
});