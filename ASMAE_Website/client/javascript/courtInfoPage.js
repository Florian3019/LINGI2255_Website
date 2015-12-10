/*
  This file defines helpers and events for the court summary page. It allows the staff
  to set the flag staffOK and ownerOK to true/false. A button to modify/delete the court is shown.
*/
Template.courtInfoPage.helpers({

  	'checked': function(value){
  		if(value){
  			return "glyphicon-ok green"
  		}
  		else
  		{
  			return "glyphicon-remove red"
  		}
  	},

    'ownerEmail': function(){
      return this.owner.emails[0].address;
    },

    'ownerLastName': function(){
      if(this.owner.profile.lastName){
        return this.owner.profile.lastName;
      }
      else
        return null;
    },

    'ownerFirstName': function(){
      if(this.owner.profile.firstName){
        return this.owner.profile.firstName;
      }
      else
        return null;
    },

    'ownerPhone': function(){
      if(this.owner.profile.phone){
        return this.owner.profile.phone;
      }
      else
        return null;
    },

    'showAddress': function(addr){
        if(addr) {
            if (addr.box) {
                return addr.street + ", " + addr.number + ". Boite " + addr.box;
            }
            return addr.street + ", "+addr.number;
        }
    },

    'isOwner':function(ownerId){
      if(ownerId===undefined) return false;
      return ownerId===Meteor.userId();
    },

    'isAdminOrStaffOrOwner':function(ownerId){
      var profile = Meteor.user().profile;
      return profile.isAdmin || profile.isStaff || ownerId===Meteor.userId();
    },

    getCourtModLog: function (logTable) {
        var toReturn = [];
        for(var i=0;logTable!==undefined && i<logTable.length;i++){
          toReturn.push(ModificationsLog.findOne({_id:logTable[i]}));
        }
        return toReturn;
    },

    settings : function(){
      return {
        fields:[
          { key: 'userId', label: 'Utilisateur', fn: function(value, object){
            user= Meteor.users.findOne({_id:value},{"profile":1});
            return user.profile.firstName + " " + user.profile.lastName;
          }},
          { key: 'createdAt', label: 'Temps' , sortOrder: 0, sortDirection: 'descending', fn: function(value, object){return getSortableDate(value);}},
          { key: 'opType', label: "Opération"},
          { key: 'details', label: "Détails"}
      ],
      rowsPerPage:LAST_N_LOGS,
      noDataTmpl:Template.emptyLog,
      showFilter:false,
      showNavigationRowsPerPage:false,
      showNavigation:'auto'
      }
    },

});

Template.courtInfoPage.events({

    'click #button_ownerOK':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      var ownerOK = data.ownerok;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, "ownerOK":!ownerOK},function(err, status){if(err) console.err(err);});

      var opType = "Propriétaire "+((!ownerOK)?"":"pas ")+"OK pour un terrain";
      addToLog(opType, ownerId, courtId);
    },

    'click #button_staffOK':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      var staffOK = data.staffok;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, "staffOK":!staffOK},function(err, status){if(err) console.err(err);});

      var opType = "Staff "+((!staffOK)?"":"pas ")+"OK pour un terrain";
      addToLog(opType, ownerId, courtId);
    },

    'click #deleteCourt': function(event){
      event.preventDefault();

      var ownerID = this.court.ownerID;
      var addressID = this.court.addressID;
      var courtID = this.court._id;

      swal({
      title: "Êtes-vous sûr ?",
      text: "Vous êtes sur le point de supprimer ce terrain. Cette action est irréversible.",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Supprimer ce terrain",
      closeOnConfirm: false },
      function(){
        var owner = Meteor.users.findOne({"_id":ownerID},{"profile":1});
        var address = Addresses.findOne({_id:addressID});

        // Delete court from pool
        var poolID = Pools.findOne({courtId:courtID},{_id:1});

        if(poolID){
          Pools.update({_id:poolID},{$unset: {courtId:""}});
        }

        Meteor.call('deleteCourt', courtID, function(error, result){
                if(error){
                    console.error('deleteCourt error');
                    console.error(error);
                    return;
                }
                Meteor.call("addToModificationsLog",
                  {"opType":"Effacer un terrain",
                  "details":
                      "Terrain "+ formatAddress(address) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
                });

                swal({
                    title:"Succès !",
                    text:"Le terrain a été supprimé.",
                    type:"success",
                    confirmButtonText:"Ok",
                    confirmButtonColor: "#3085d6",
                    closeOnConfirm:true,
                    showCancelButton: false
                  },
                  function(){
                    Router.go('home');
                  });
          });
      });
    }
});
