Template.myCourts.helpers({

    'court': function(){
    	return Courts.find({ownerID: Meteor.userId()});
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
