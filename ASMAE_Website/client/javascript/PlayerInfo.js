Template.playersInfo.events({
   'submit form': function(){
      event.preventDefault();
        var lastName = event.target.lastname.value;
        var firstName = event.target.firstname.value;
        var email = event.target.email.value;
        var sex = event.target.sex.value;
        var rank = event.target.rank.value;
        var query = {};
        if(lastName){query["profile.lastName"] = lastName;}
        if(firstName){query["profile.firstName"] = firstName;}
        if(email){query["emails.address"] = email;}
        if(sex) {query["profile.gender"] = sex;}
        if(rank) {query["profile.AFT"] = rank;}
        cursor = Meteor.users.find(query).fetch();
        Session.set('cursor', cursor);
        return false;
    },  
    'click li': function() {
        Session.set('selected', this);
        Router.go('playerInfoPage');
    }
});
Template.playersInfo.helpers({
    'player': function(){
        return Session.get('cursor');
    }
});
