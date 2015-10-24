Template.adminTemplate.showAll = function(){
	return Meteor.users.find();
}
Session.setDefault("chosen","");
Template.adminTemplate.events({
	'click .btn':function(){
		if(Meteor.user().profile.isAdmin){
			if(Session.get("chosen")=="admin"&&Meteor.user()._id!=this._id){
						Meteor.call('turnAdmin',this._id);
			}
			else if(Session.get("chosen")=="staff"&&Meteor.user()._id!=this._id){
						Meteor.call('turnStaff',this._id);
			}
			else{
				if(Meteor.user()._id!=this._id){
						Meteor.call('turnNormal',this._id);		
				}
			}
		
		}
		else{
			alert("Vous êtes membre du Staff,\n Seul un administrateur peut changer les permissions d'un membre.\n\n Veuillez contacter un admin pour effectuer un changement")
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
