Template.home.helpers({
    'registrationsON': function(){
        var registrationsON = GlobalValues.findOne({_id:"registrationsON"});
        if (typeof registrationsON !== 'undefined') {
            return registrationsON.value;
        }
        return false;
    }
});
