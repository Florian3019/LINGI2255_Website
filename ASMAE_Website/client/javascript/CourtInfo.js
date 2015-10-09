Template.courtInfo.events({
   'submit form': function(){
      event.preventDefault();
        var lastName = event.target.lastname.value;
        var firstName = event.target.firstname.value;
        var street = event.target.street.value;
        var addressNumber = event.target.addressNumber.value;
        var box = event.target.box.value;
        var zipCode = event.target.zipCode.value;
        var city = event.target.city.value;
        var country = event.target.country.value;
        var surface = event.target.surface.value;
        var courtType = event.target.courtType.value;
        var queryAd = {};
        var queryP = {};
        var query = {};
        if(street){queryAd["street"] = street;}
        if(addressNumber){queryAd["number"] = addressNumber;}
        if(box){queryAd["box"] = box;}
        if(zipCode) {queryAd["zipCode"] = zipCode;}
        if(city) {queryAd["city"] = city;}
        if(country) {queryAd["country"] = country;}

        if(lastName){queryP["profile.lastName"] = lastName;}
        if(firstName){queryP["profile.firstName"] = firstName;}
        var adr = Addresses.find(queryAd).fetch();
        var pers = Meteor.users.find(queryP).fetch();
        var ID;
        var answer = [];
        
        if (adr[0] != null && pers[0] != null){ 
            for(var i = 0; i<adr.length;i++){
                for(var j = 0; j<pers.length;j++){
                    if(adr[i].userID == pers[j]._id) {
                        ID = adr[i].userID;
                        i = adr.length;
                        j = pers.length;
                    }
                }
            }
        }
        

        if(surface != "NoType") {query["surface"] = surface;}
        if(courtType) {query["courtType"] = courtType;}
        if(ID) {
            query["ownerID"] = ID;
            answer[0] = Courts.find(query).fetch();
        }
        else {
            if(adr[0]==null) {
                for(var j = 0; j<pers.length;j++){
                    query["ownerID"] = pers[j]._id;
                    answer[j] = Courts.find(query).fetch();
                }
            }
            if(pers[0]==null) {
                for(var i = 0; i<adr.length;i++){
                    query["ownerID"] = adr[i].ownerID;
                    query[i] = Courts.find(query).fetch();
                }
            }
        }
        Session.set('answer', answer[0]);
        return false;
    },  
    'click li': function() {
        Session.set('answerT', this);
        var userC = Meteor.users.find({_id: this.ownerID}).fetch()[0];
        Session.set('userC',userC);
        Session.set('addressC',Addresses.find({_id: userC.profile.addressID}).fetch()[0]);
        Router.go('courtInfoPage');
    }
});
Template.courtInfo.helpers({
      'court': function(){
    return Courts.findOne();
  },
    'player': function(){
        return Session.get('answer');
    }
});
