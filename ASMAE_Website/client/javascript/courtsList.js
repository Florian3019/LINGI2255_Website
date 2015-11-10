Template.courtsList.helpers({
  'courts': function(){
    return Courts.find({lendThisYear : true});
  },

  'courtOwner': function(ownerID){
    var owner = Meteor.users.findOne(ownerID);
    if(owner.profile.firstName){
      return owner.profile.firstName + " " + owner.profile.lastName;
    }
    else{
      return owner.emails[0].address;
    }
  },

  'courtAddress': function(addressID){
    var addr = Addresses.findOne({_id: addressID});
    return addr.street + ", " + addr.number+ ", " +addr.city+ ", " +addr.zipCode;
  },

  'checkedForDay': function(day){
    if(day){
      return "glyphicon-ok lendOk"
    }
    else
    {
      return "glyphicon-remove lendNot"
    }
  }

});
