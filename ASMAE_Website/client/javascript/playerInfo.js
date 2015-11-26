Template.mySpecialFilterPlayers.events({
    'keyup .playerFilter':function(event){
        Session.set("playerInfo/input", event.currentTarget.value);
    }
});

Template.playersInfo.onRendered(function(){
    Session.set("playerInfo/perm","");
    Session.set("playerInfo/input","");
})

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
                { key: 'profile.lastName', label: 'Nom'},
                { key: 'profile.firstName', label: 'Prénom'},
                { key: 'emails', label: 'Email', fn: function(value, object){
                    return value[0].address;
                }},
                { key: 'profile.gender', label:"Sexe"},
                { key: 'profile.phone', label: "Numéro"},
                { key: 'profile.birthDate', label: "Naissance", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "undefined" : value.toLocaleDateString()}},
                { key: 'profile.AFT', label: "AFT"},
                { key: 'profile.addressID', label: "Adresse", fn: function(value, object){
                    addr = Addresses.findOne({"_id":value});
                    if(addr==undefined) return "Pas défini";
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
        //Router.go('playerInfoPage',{_id:this._id});
        Session.set('selected', this);
        Router.go('playerInfoPage');
    },
    'change #permSelect':function(event){
        Session.set("playerInfo/permissions",event.currentTarget.value);
    },
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

        Meteor.call("addToModificationsLog", 
        {"opType":"Changement de permission", 
        "details":
            this.profile.firstName + " " + this.profile.lastName + " est passé en mode "+value
        });

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