Template.myCourts.helpers({

    'court': function(){
    	return Courts.find({ownerID: Meteor.userId()});
  	},

    'courtAddress': function(addressID){
      var addr = Addresses.findOne({_id: addressID});
      return addr.street + ", " + addr.number;
    },

  	'checked': function(){
  		if(this.lendThisYear){
  			return "glyphicon-ok lendOk"
  		}
  		else
  		{
  			return "glyphicon-remove lendNot"
  		}
  	}

});
