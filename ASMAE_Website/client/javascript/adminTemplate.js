

Template.adminTemplate.helpers({
	setCurrentPermission:function(){
    	user = Meteor.users.findOne({"_id":Meteor.userId()},{"profile.isAdmin":1});
    	Session.set("adminTemplate/admin", user.profile.isAdmin==true); 
	},


    // Reuses the playersInfo search !
    userCollection: function () {
        emailInput = Session.get("playersInfo/emailInput");
        if(emailInput!=undefined && emailInput!=""){
            return Meteor.users.find({$where: function(){if(this.emails[0].address!=null){return this.emails[0].address.indexOf(emailInput)>-1;}}});
        }
        firstNameInput = Session.get("playersInfo/firstNameInput");
        if(firstNameInput!=undefined && firstNameInput!=""){
            return Meteor.users.find({$where:function(){if(this.profile.firstName!=null){return this.profile.firstName.indexOf(firstNameInput)>-1}}});
        }
        lastNameInput = Session.get("playersInfo/lastNameInput");
        if(lastNameInput!=undefined && lastNameInput!=""){
            return Meteor.users.find({$where:function(){if(this.profile.lastName!=null){return this.profile.lastName.indexOf(lastNameInput)>-1}}});
        }
        phoneInput = Session.get("playersInfo/phoneInput");
        if(phoneInput!=undefined && phoneInput!="" ){
            return Meteor.users.find({$where:function(){
                if(this.profile.phone!=null){
                return this.profile.phone.indexOf(phoneInput)>-1}}});
        }
        rankInput = Session.get("playersInfo/rankInput");
        if(rankInput!=undefined && rankInput!="" ){
            return Meteor.users.find({$where:function(){
                if(this.profile.AFT!=null){
                return this.profile.AFT.indexOf(rankInput)>-1}}});
        }

        addressInput = Session.get("playersInfo/addressInput");
        if(addressInput!=undefined && addressInput!="" ){
            return Meteor.users.find({$where:function(){
                var addid = this.profile.addressID
                var theAddress = Addresses.findOne({_id:addid})
                var theString = "";
                if(theAddress!=undefined &&theAddress!=null){
                    theString +=theAddress.city+" "
                    theString +=theAddress.street+" "
                    theString += theAddress.country+" "
                    theString += theAddress.box+" "
                    theString += theAddress.number+" "
                    theString += theAddress.zipCode+" " 
                }
                if(theString!=null && theString !=""){
                    console.log(theString)
                    return (theString.indexOf(addressInput)>-1)
                }
                }});
        }

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
                { key: 'profile.isStaff', label:'Permissions', tmpl:Template.changePermissions},
            ],
            rowClass: 'adminTemplateTableRow',
            showFilter: false
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
        if(!Session.get("adminTemplate/admin")){
            alert("Vous n'avez pas l'authorisation de faire des changements.\n Veuillez contacter un admin")
            return;
        }
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

		Meteor.call("addToModificationsLog", 
		{"opType":"Changement de permission", 
		"details":
			this.profile.firstName + " " + this.profile.lastName + " est passé en mode "+value
		});

	}
});