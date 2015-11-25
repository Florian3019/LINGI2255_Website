Template.mySpecialFilterCourt.events({
    'keyup .courtFilter':function(event){
        privInput = event.currentTarget.value;
        Session.set("courtSearch/input", privInput);
    }
});

Template.allCourtsTable.onRendered(function(){
    Session.set("courtSearch/saturday","");
    Session.set("courtSearch/sunday","");
    Session.set("courtSearch/lend","");
    Session.set("courtSearch/input","");
    Session.set("courtSearch/courtNumber","");
})


Template.allCourtsTable.helpers({
    courtsCollection: function () {
        input = Session.get("courtSearch/input").toLowerCase();

        saturday = Session.get("courtSearch/saturday");
        sunday = Session.get("courtSearch/sunday");
        lend = Session.get("courtSearch/lend");
        courtNumb = Session.get("courtSearch/courtNumber");

        noInput = (input ==="" || input===undefined || input === null) && saturday==="Ignore" && sunday==="Ignore" && lend==="Ignore";

        if(noInput) return Courts.find({});
        inputArray = input.split(" ");
        query = {$where: function(){
            if(saturday=="Yes"){
              if(!this.dispoSamedi) return false;
            }
            else if(saturday=="No"){
              if(this.dispoSamedi) return false;
            }

            if(sunday=="Yes"){
              if(!this.dispoDimanche) return false;
            }
            else if(sunday=="No"){
              if(this.dispoDimanche) return false;
            }

            if(lend=="Yes"){
              if(!this.lendThisYear) return false;
            }
            else if(lend=="No"){
              if(this.lendThisYear) return false;
            }

            if(courtNumb!=="" && courtNumb!==null && courtNumb!==undefined){
              if(this.courtNumber.indexOf(Number(courtNumb))==-1) return false;
            }

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
            if(user!==undefined && user!==null) return user.profile.firstName + " " + user.profile.lastName;
            else return "";
          }},
          { key: 'addressID', label: 'Adresse' , fn: function(value, object){
            addr = Addresses.findOne({"_id":value});
            if(addr!==undefined){
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
                    return ret;
            }
            return "";
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

Template.courtSearchTemplate.events({
    'click .courtRow' : function(event){
        Router.go('courtInfoPage',{_id:this._id});
    },
})

Template.courtSearch.events({
    'change #saturdaySelect':function(event){
      Session.set("courtSearch/saturday",event.currentTarget.value);
    },

    'change #sundaySelect':function(event){
      Session.set("courtSearch/sunday",event.currentTarget.value);
    },

    'change #lendSelect':function(event){
      Session.set("courtSearch/lend",event.currentTarget.value);
    },

    'change #courtNumberInput':function(event){
      Session.set("courtSearch/courtNumber",event.currentTarget.value);
    }
});
