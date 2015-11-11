Template.adminTemplate.showAll = function(){
	return Meteor.users.find();
}
Session.setDefault("chosen","");

Template.adminTemplate.events({
	'click .btn':function(){
		console.log("Validation");
		event.preventDefault();
		var selects = document.getElementsByName("mySelects");
			  var selectsChanged = [];
		  // loop over them all
		  for (var i=0; i<selects.length; i++) {
		     console.log(selects[i].value)
		     console.log(selects[i].id)
		     if(selects[i].id != Meteor.users.findOne()._id){
		     		if(Meteor.users.findOne().profile.isAdmin){
		     			if(selects[i].value=="Normal"){
		     				Meteor.call('turnNormal',selects[i].id);
		     			}
		     			else if(selects[i].value=="Staff"){
		     				Meteor.call('turnStaff',selects[i].id);
		     			}
		     			else if(selects[i].value=="Admin"){
		     				Meteor.call('turnAdmin',selects[i].id);
		     			}
		     		}
		     }
		     else{
		     	if(selects[i].value!=""){
			     	alert("Vous ne pouvez pas changer vos propres permissions")
			}
		     }
	  	}
	  	for (var i=0; i<selects.length; i++) {
			selects[i].value=""
		}  
	  	if(Meteor.users.findOne().profile.isStaff){
		     alert("Vous n'avez pas l'authorisation de faire des changements.\n Veuillez contacter un admin")
		     }
	  	
	
	
	}
	
	
});

Template.adminTemplate.helpers({
	'getId' : function(){
		return this._id;
	},
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
