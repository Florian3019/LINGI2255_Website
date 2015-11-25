Template.mySpecialFilterCourt.events({
    'keyup .courtFilter':function(event){
        privInput = event.currentTarget.value;
        Session.set("courtSearch/input", privInput);
    }
});

var addressToString = function(theAddress){
    var theString = "";
    if(theAddress!=undefined &&theAddress!=null){
        theString +=theAddress.city+" ";
        theString +=theAddress.street+" ";
        theString += theAddress.country+" ";
        theString += theAddress.box+" ";
        theString += theAddress.number+" ";
        theString += theAddress.zipCode+" ";
    }
    return theString;
};

var courtToString = function(court){
    if(court===undefined || court===null){
        return "";
    }
    var theString = "";

    var user = Meteor.users.findOne({_id:court.ownerID});
    theString += user.profile.lastName + " " + user.profile.firstName + " ";

    var address = Addresses.findOne({_id:court.addressID});
    theString += addressToString(address);

    theString += court.surface;
    theString += court.courtType;

    return theString.toLowerCase();
};


Template.allCourtsTable.helpers({
    courtsCollection: function () {
        input = Session.get("courtSearch/input").toLowerCase();

        if(input ==="" || input===undefined || input === null) return Courts.find({});
        inputArray = input.split(" ");
        query = {$where: function(){
            var searchString = courtToString(this);

            for(var i=0; i<inputArray.length;i++){
                if(searchString.indexOf(inputArray[i])==-1){
                    return false;
                }
            }
            return true;
            }
        };
        return Courts.find(query);
    },

    settings : function(){
      return {
        fields:[
          { key: 'ownerID', label: 'Propriétaire', fn: function(value, object){
            user= Meteor.users.findOne({_id:value},{"profile":1});
            return user.profile.firstName + " " + user.profile.lastName;
          }},
          { key: 'addressID', label: 'Adresse' , fn: function(value, object){
            addr = Addresses.findOne({"_id":value});
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
          { key: 'surface', label: "Surface"},
          { key: 'dispoSamedi', label:"Samedi", tmpl:Template.dispoSaturdayLabel},
          { key: 'dispoDimanche', label:"Dimanche", tmpl:Template.dispoSundayLabel},
          { key: 'lendThisYear', label:"Loué", tmpl:Template.dispoLendLabel},
          { key: 'courtType', label:"Type"},
          { key: 'instructions', label:"Instructions"},
          { key: 'ownerComment', label:"Commentaire propriétaire"},
          { key: 'staffComment', label:"Commentaire staff"},
          { key: 'courtNumber', label:"Numéros"}
      ],
             filters: ['NomDeFamille'],
             rowClass: "courtRow"
      }
    }
});

Template.courtSearch.events({
    'click .courtRow' : function(event){
        Router.go('courtInfoPage',{_id:this._id});
    }
});
