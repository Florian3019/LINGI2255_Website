Template.mySpecialFilterPlayers.events({
    'keyup .playerFilter':function(event){
        Session.set("playerInfo/input", event.currentTarget.value);
    }
});

Template.playersInfo.onRendered(function(){
    Session.set("playerInfo/isAdmin","");
    Session.set("playerInfo/isStaff","");
    Session.set("playerInfo/input","");
})

Template.playersInfo.helpers({
    userCollection: function () {
        input = Session.get("playerInfo/input")
        if(input!==undefined) input = input.toLowerCase();

        isStaff = Session.get("playerInfo/isStaff");
        isAdmin = Session.get("playerInfo/isAdmin");

        noInput = (input ==="" || input===undefined || input === null) && isStaff==="Ignore" && isAdmin==="Ignore";

        if(noInput) return Meteor.users.find();
        if(input!==undefined) inputArray = input.split(" ");
        query = {$where: function(){
            if(isAdmin=="Yes"){
              if(!this.profile.isAdmin) return false;
            }
            else if(isAdmin=="No"){
              if(this.profile.isAdmin) return false;
            }

            if(isStaff=="Yes"){
              if(!this.profile.isStaff) return false;
            }
            else if(isStaff=="No"){
              if(this.profile.isStaff) return false;
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
                { key: 'profile.isStaff', label:'Staff', tmpl:Template.isStaffLabel},
                { key: 'profile.isAdmin', label:'Admin', tmpl:Template.isAdminLabel},
            ],
             filters: ['NomDeFamille'],
             rowClass: "playerInfoRow"
        }
    }
    
});

Template.playersInfo.events({
    'click .playerInfoRow' : function(event){
        //Router.go('playerInfoPage',{_id:this._id});
        Session.set('selected', this);
        Router.go('playerInfoPage');
    },
    'change #adminSelect':function(event){
        Session.set("playerInfo/isAdmin",event.currentTarget.value);
    },

    'change #staffSelect':function(event){
        Session.set("playerInfo/isStaff",event.currentTarget.value);
    }
});
