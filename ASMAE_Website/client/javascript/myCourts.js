Template.myCourts.helpers({
    'court': function(){
        var x = Courts.find({ownerID: Meteor.userId()});
    	return {"cursor":x, "notEmpty":x.count()>0};
  	},

    'courtAddress': function(addressID){
      var addr = Addresses.findOne({_id: addressID});
      return addressToString(addr);
    },

  	'checked': function(){
  		if(this.staffOK){
  			return "glyphicon-ok lendOk";
  		}
  		else
  		{
  			return "glyphicon-remove lendNot";
  		}
  	}

});
