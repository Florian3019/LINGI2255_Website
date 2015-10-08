Meteor.publish('courts', function(){
    //TODO: si user dans le staff alors publier tous les courts 
    return Courts.find({ownerID: this.userId});
});

Meteor.publish('addresses', function(){
    //TODO: si user dans le staff alors publier tous les courts 
    return Addresses.find({userID: this.userId});
});