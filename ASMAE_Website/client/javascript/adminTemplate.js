Template.adminTemplate.helpers({
	setCurrentPermission:function(){
    	user = Meteor.users.findOne({"_id":Meteor.userId()},{"profile.isAdmin":1});
    	Session.set("adminTemplate/admin", user.profile.isAdmin==true); 
	},

    userCollection: function () {
        return Meteor.users.find();
    },

    settings : function(){
        return {
            fields:[
                { key: 'profile.firstName', label: 'Prénom'},
                { key: 'profile.lastName', label: 'Nom'},
                { key: 'emails', label: 'Email', fn: function(value, object){
                    return value[0].address;
                }},
                { key: 'profile.gender', label:"Sexe"},
                { key: 'profile.phone', label: "Numéro"},
                { key: 'profile.birthDate', label: "Naissance", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "undefined" : value.toLocaleDateString()}},
                { key: 'profile.isStaff', label:'Staff', tmpl:Template.changePermissions},
            ],
            rowClass: 'adminTemplateTableRow'
        }
    }

});

Template.changePermissions.helpers({
    isDisabled : function(userId){
    	if(Meteor.userId()===userId) return "disabled"; // disallow user to change his own permissions
    	if(Session.get("adminTemplate/admin")===true) return "";
    	else return "disabled";
    },

    getSelected : function(object, option){
    	currentOption = object.profile.isAdmin==true ? "admin" : (object.profile.isStaff==true ? "staff" : "normal");

    	if(option===currentOption){
    		return "selected";
    	}
    	else{
    		return "";
    	}
    }
});

Template.changePermissions.events({
	'click .myPermissionSelects':function(event){
	    var target = event.currentTarget;
	    var value = event.currentTarget.value;
	    if(value==="Normal"){
			Meteor.call('turnNormal',target.id);
		}
		else if(value==="Staff"){
			Meteor.call('turnStaff',target.id);
		}
		else if(value==="Admin"){
			Meteor.call('turnAdmin',target.id);
		}
	}
});