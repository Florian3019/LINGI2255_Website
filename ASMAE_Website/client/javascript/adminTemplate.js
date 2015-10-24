Template.adminTemplate.showAll = function(){
	return Meteor.users.find();
}
Session.setDefault("chosen","");
Template.adminTemplate.events({
	'click .btn':function(){
		if(Session.get("chosen")=="admin"){
					Meteor.call('turnAdmin',this._id);
		}
		else if(Session.get("chosen")=="staff"){
					Meteor.call('turnStaff',this._id);
		}
		else{
					Meteor.call('turnNormal',this._id);		
		}
		
	}
	
	
});

Template.adminTemplate.helpers({
	'getEmail' : function(){
		return this.emails[0].address;
	},
	'getUserName' : function(){
		return this.username;
	},
	'isStaff' : function(){
			if(this.profile.isStaff){
				return "true";
			}
			else{
				return "false";
			}
		
	},
	'isAdmin' : function(){

		if(this.profile.isAdmin){
			return "true";
		}
		else{
			return "false";
		}	
	},
	'getCurrentState' : function(){
		if(this.profile.isAdmin){
			return "Admin";
		}
		else if(this.profile.isStaff){
			return "Staff";
		}
		else{
			return "Normal";
		}
	}
	

});
