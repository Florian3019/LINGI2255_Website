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
    }

});

var formatAddress = function(addr){
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
};

Template.courtInfoPage.events({
    'click #button_ownerOK':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, ownerOK:true},function(err, status){if(err) console.err(err);});

      var owner = Meteor.users.findOne({"_id":ownerId},{"profile":1});
      var court = Courts.findOne({_id:courtId}, {"addressID":1});
      var address = Addresses.findOne({_id:court.addressID});

      Meteor.call("addToModificationsLog",
        {"opType":"Propriétaire OK pour un terrain",
        "details":
            "Terrain "+ formatAddress(address) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
        });
    },

    'click #button_ownerNotOK':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, ownerOK:false},function(err, status){if(err) console.err(err);});

      var owner = Meteor.users.findOne({"_id":ownerId},{"profile":1});
      var court = Courts.findOne({_id:courtId}, {"addressID":1});
      var address = Addresses.findOne({_id:court.addressID});

      Meteor.call("addToModificationsLog",
        {"opType":"Propriétaire pas OK pour un terrain",
        "details":
            "Terrain "+ formatAddress(address) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
        });
    },

    'click #button_staffOK':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, staffOK:true},function(err, status){if(err) console.err(err);});

      var owner = Meteor.users.findOne({"_id":ownerId},{"profile":1});
      var court = Courts.findOne({_id:courtId}, {"addressID":1});
      var addr = Addresses.findOne({_id:court.addressID});

      Meteor.call("addToModificationsLog",
        {"opType":"Staff OK pour un terrain",
        "details":
            "Terrain "+ formatAddress(addr) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
        });

    },

    'click #button_staffNotOK':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, staffOK:false},function(err, status){if(err) console.err(err);});

      var owner = Meteor.users.findOne({"_id":ownerId},{"profile":1});
      var court = Courts.findOne({_id:courtId}, {"addressID":1});
      var addr = Addresses.findOne({_id:court.addressID});

      Meteor.call("addToModificationsLog",
        {"opType":"Staff pas OK pour un terrain",
        "details":
            "Terrain "+ formatAddress(addr) +" du propriétaire "+owner.profile.lastName + " "+owner.profile.firstName
        });
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
