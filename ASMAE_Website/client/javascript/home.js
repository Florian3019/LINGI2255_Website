Template.home.events({

	'click #becomeAdmin' : function(event){
		console.log("You are now admin");
		Meteor.users.update({_id:Meteor.userId()}, {$set: {"profile.isAdmin":true}});
		Meteor.users.update({_id:Meteor.userId()}, {$set: {"profile.isStaff":false}});
		var a ={
			intro:"cc",
			texte:"",
			important:"",
			encadr:"",
		};
		Meteor.call('emailFeedback',"cyberdjalex@icloud.com","Object",a);
	},

	'click #becomeStaff' : function(event){
		console.log("You are now staff");
		Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.isStaff":true}});
		Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.isAdmin":false}});
	},

	'click #becomeNormal' : function(event){
		console.log("You are now normal");
		Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.isStaff":false}});
		Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.isAdmin":false}});
	}

});
