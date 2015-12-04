Template.courtInfoPage.helpers({

  	'checked': function(value){
  		if(value){
  			return "glyphicon-ok lendOk"
  		}
  		else
  		{
  			return "glyphicon-remove lendNot"
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

    mapOptions: function() {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        // Map initialization options
        return {
          center: new google.maps.LatLng(this.court.coords.lat, this.court.coords.lng),
          zoom: 14
        };
      }
    },

});

var addToLog = function(opType, ownerId, courtId){
    var owner = Meteor.users.findOne({"_id":ownerId},{"profile":1});
    var court = Courts.findOne({_id:courtId}, {"addressID":1});
    var address = Addresses.findOne({_id:court.addressID});
    console.log(opType);
    Meteor.call("addToModificationsLog",
      {"opType":opType,
      "details":
          "Terrain "+ formatAddress(address) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
      },
      function(err, logId){
        if(err){
          console.log(err);
          return;
        }
        Meteor.call('addToUserLog', ownerId._id, logId);
        Meteor.call('addToCourtLog', courtId, logId);
      }
    );
}

Template.courtInfoPage.onCreated(function(){
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('exampleMap', function(map) {
    // Add a marker to the map once it's ready

    var marker1 = new google.maps.Marker({
      position: HQCoords,
      animation: google.maps.Animation.DROP,
      map: map.instance,
      icon:'HQ.png'
    });


    var marker2 = new google.maps.Marker({
      position: map.options.center,
      animation: google.maps.Animation.DROP,
      map: map.instance,
    });
  });
});

Template.courtInfoPage.onRendered(function(){
   GoogleMaps.load({key:"AIzaSyBa8fDkKPINTunoEuj0VznC6kU7PWFRJxs"});
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

      if (confirm('Etes-vous certain de vouloir supprimer définitivement ce terrain?\nToutes les données concernant ce terrain seront supprimées. Cette action est irréversible.')) {

        var owner = Meteor.users.findOne({"_id":this.court.ownerID},{"profile":1});
        var address = Addresses.findOne({_id:this.court.addressID});

        // Delete court from pool

        var poolID = Pools.findOne({courtId:this.court._id},{_id:1});

        if(poolID){
          Pools.update({_id:poolID},{$unset: {courtId:""}});
        }

        Meteor.call('deleteCourt', this.court._id, function(error, result){
  	            if(error){
  	                console.error('deleteCourt error');
  	                console.error(error);
  	            }
  	            alert("Terrain supprimé !");

                Meteor.call("addToModificationsLog",
                  {"opType":"Effacer un terrain",
                  "details":
                      "Terrain "+ formatAddress(addr) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
                  });

  				Router.go('home');
  	    	});
  		}
    }
});
