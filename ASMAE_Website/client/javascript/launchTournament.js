Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker({
        format: "dd/mm/yyyy"
    });
}


Template.launchTournament.helpers({
    'registrationsON': function(){
         return GlobalValues.findOne({_id: "registrationsON"}).value;
    },

    'tournamentData': function(){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        return Years.findOne({_id: currentYear});
    },

    'tournamentDateFormat': function(date){
        return date.toLocaleDateString();
    }

});


Template.launchTournament.events({
    'submit form': function(event){
        event.preventDefault();

        var getDate = $('[name=launchTournamentDate]').val().split('/');
        var getDateObject = new Date(getDate[2], getDate[1]-1, getDate[0]);
        var price = parseFloat($('[name=tournamentPrice]').val());

        var launchData = {
            tournamentDate: getDateObject,
            tournamentPrice: price
        };

		Meteor.call('launchTournament', launchData, Meteor.userId(), function(error, result){
            if(error){
                console.error('launchTournament error');
                console.error(error);
            }
            else if(result == null){
                console.error("No result in launchTournament...");
            }

            alert("Les inscriptions au tournoi sont lancées.\n Un Email va être envoyé à tous les utilisateurs.");

            Meteor.call('emailtoAllUsers');
	    });

    },

    'click #modifyLaunchButton': function(){
        Meteor.call('deleteCurrentYear', function(err, result){
            if(err){
                console.log(err);
            }

            Meteor.call('stopTournamentRegistrations', function(error, result){
                if(error){
                    console.error('stopTournamentRegistrations error');
                    console.error(error);
                }
            });
        });
    }

});
