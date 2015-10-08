var cursor;
Template.playersInfo.events({
   'submit form': function(){
      event.preventDefault();
        var lastName = event.target.lastname.value;
        var firstName = event.target.firstname.value;
        var email = event.target.email.value;
        var sex = event.target.sex.value;
        var query = {};
        if(lastName){query["profile.lastName"] = lastName;}
        if(firstName){query["profile.firstName"] = firstName;}
        if(email){query["profile.emails"] = email;}
        if(sex) {query["profile.gender"] = sex;}
        cursor = Meteor.users.find(query).fetch();
        console.log(cursor);
        Session.set('cursor', cursor);
        return false;
        //Router.go('courtInfo');
    },  
    'click li': function(){
        console.log("You clicked an li element");
    }
});
Template.playersInfo.helpers({
    'player': function(){
        return Session.get('cursor');
    }
});
