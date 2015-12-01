Template.mySpecialFilterPlayers.events({
    'keyup .playerFilter':function(event){
        Session.set("playerInfo/input", event.currentTarget.value);
    }
});

Template.playersInfo.onRendered(function(){
    Session.set("playerInfo/perm","");
    Session.set("playerInfo/input","");
}),

Template.playersInfo.helpers({
    userCollection: function () {
        input = Session.get("playerInfo/input")
        if(input!==undefined) input = input.toLowerCase();

        perm = Session.get("playerInfo/permissions");

        noInput = (input ==="" || input===undefined || input === null) && perm==="Ignore";

        if(noInput) return Meteor.users.find();
        if(input!==undefined) inputArray = input.split(" ");
        query = {$where: function(){
            if(perm=="Admin"){
              if(!this.profile.isAdmin) return false;
            }
            else if(perm=="Staff"){
              if(!this.profile.isStaff) return false;
            }
            else if(perm=="Normal"){
                if(this.profile.isStaff || this.profile.isAdmin) return false;
            }

            if(input!==undefined){
                var searchString = playerToString(this);

                for(var i=0; i<inputArray.length;i++){
                    if(searchString.indexOf(inputArray[i])==-1){
                        return false;
                    }
                }
            }
            return true;
            }
        };

        return Meteor.users.find(query);
    },

    settings : function(){
        return {
            fields:[
                { key: 'profile.lastName', label: 'Nom', fn:function(value, object){
                    if(value===undefined) return "/";
                    else return value;
                }},
                { key: 'profile.firstName', label: 'Prénom', fn:function(value, object){
                    if(value===undefined) return "/";
                    else return value;
                }},
                { key: 'emails', label: 'Email', hidden:true , fn: function(value, object){
                    return value[0].address;
                }},
                { key: 'profile.gender', label:"Sexe"},
                { key: 'profile.phone', label: "Numéro"},
                { key: 'profile.birthDate', label: "Naissance", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "" : value.toLocaleDateString()}},
                { key: 'profile.AFT', label: "AFT"},
                { key: 'profile.addressID', label: "Adresse",hidden:true , fn: function(value, object){
                    addr = Addresses.findOne({"_id":value});
                    if(addr==undefined) return "";
                    var ret = ""
                    if(addr.street != undefined) {
                        ret = ret+addr.street + ", ";
                    }
                    if(addr.number != undefined) {
                        ret = ret+addr.number + ", ";
                    }
                    if(addr.box != undefined) {
                            ret = ret+addr.box + ", ";
                    }
                    if(addr.city != undefined) {
                        ret = ret+addr.city + ", ";
                    }
                    if(addr.zipCode != undefined) {
                        ret = ret+addr.zipCode + ", ";
                    }
                    if(addr.country != undefined) {
                        ret = ret+addr.country;
                    }
                    return ret
                }},
                { key: 'profile.isStaff', label:'Permissions', tmpl:Template.changePermissions},
                { key: '_id', label:"Paiement", fn: function(value, object){
                        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
            		    var payment = Payments.findOne({"userID": value, "tournamentYear": currentYear});
                        if(payment===undefined){
                            return "Pas inscrit";
                        }
                        else{
                            return paymentTranslate[payment.status] + " ("+payment.balance+"€ )";
                        }
                    }
                },
                { key: '_id', label:"Méthode", hidden:true ,fn: function(value, object){
                        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
                        var payment = Payments.findOne({"userID": value, "tournamentYear": currentYear});
                        if(payment===undefined){
                            return "Pas inscrit";
                        }
                        else{
                            return paymentTypesTranslate[payment.paymentMethod];
                        }
                    }
                }
            ],
             filters: ['NomDeFamille'],
             rowClass: "playerInfoRow",
             showColumnToggles:true
        }
    }

});

Template.playersInfo.events({
    'click .playerInfoRow' : function(event){
        var isPermSelect = (' ' + event.originalEvent.srcElement.className + ' ').indexOf(' myPermissionSelects ') > -1;
        if(isPermSelect) return; // Don't allow to change page if we clicked on the select
        Router.go('playerInfoTemplate',{_id:this._id});
    },
    'change #permSelect':function(event){
        Session.set("playerInfo/permissions",event.currentTarget.value);
    },
});


Template.changePermissions.events({
    'click .myPermissionSelects':function(event){
        var target = event.currentTarget;
        var value = event.currentTarget.value;
        var userId = target.id;
        if(value==="Normal"){
            Meteor.call('turnNormal',userId);
        }
        else if(value==="Staff"){
            Meteor.call('turnStaff',userId);
        }
        else if(value==="Admin"){
            Meteor.call('turnAdmin',userId);
        }

        Meteor.call("addToModificationsLog",
        {"opType":"Changement de permission",
        "details":
            this.profile.firstName + " " + this.profile.lastName + " est passé en mode "+value
        },
        function(err, logId){
            if(err){
                console.log(err);
                return;
            }
            Meteor.call('addToUserLog', userId, logId);
        }
        );

    }
});

Template.changePermissions.helpers({
    isDisabled : function(userId){
        if(Meteor.userId()===userId) return "disabled"; // disallow user to change his own permissions

        user = Meteor.users.findOne({"_id":Meteor.userId()},{"profile.isAdmin":1});
        if(user.profile.isAdmin==true) return "";
        return "disabled";
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
