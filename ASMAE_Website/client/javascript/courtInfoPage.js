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
    }

});



Template.courtInfoPage.events({
    'click #button_lendThisYear':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, lendThisYear:true},function(err, status){if(err) console.err(err);});
    },
    
    'click #button_dontLendThisYear':function(event){
      var data = event.currentTarget.dataset;
      var courtId = data.id;
      var ownerId = data.ownerid;
      Meteor.call("updateCourt", {_id:courtId, ownerID:ownerId, lendThisYear:false},function(err, status){if(err) console.err(err);});
    },

    'click #deleteCourt': function(event){
        event.preventDefault();

        if (confirm('Etes-vous certain de vouloir supprimer définitivement ce terrain?\nToutes les données concernant ce terrain seront supprimées. Cette action est irréversible.')) {
			 
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
				Router.go('home');
	    	});
		}
    }
});