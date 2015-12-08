Template.home.helpers({
    'registrationsON': function(){
        var registrationsON = GlobalValues.findOne({_id:"registrationsON"});
        if (typeof registrationsON !== 'undefined') {
            return registrationsON.value;
        }
        return false;
    }
});

Template.home.events({
    'click #tournamentRegistrationSundayButton': function(){
        $("#tournamentRegistrationModal").modal("hide");
    },

    'click #tournamentRegistrationSaterdayButton': function(){
        $("#tournamentRegistrationModal").modal("hide");
    }
});
