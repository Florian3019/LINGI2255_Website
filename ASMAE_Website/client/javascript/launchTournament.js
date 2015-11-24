Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker();
}


Template.launchTournament.helpers({
    'registrationsON': function(){
         return GlobalValues.findOne({_id: "registrationsON"}).value;
    }
});


Template.launchTournament.events({
    'submit form': function(event){
        event.preventDefault();

        var getDate = $('[name=launchTournamentDate]').val().split('/');
        var getDateObject = new Date(getDate[2], getDate[0]-1, getDate[1]);
        var price = parseFloat($('[name=tournamentPrice]').val());

        var launchData = {
            tournamentDate: getDateObject,
            tournamentPrice: price
        };

		Meteor.call('launchTournament', launchData, function(error, result){
            if(error){
                console.error('launchTournament error');
                console.error(error);
            }
            else if(result == null){
                console.error("No result in launchTournament...");
            }

            if(confirm("Les inscriptions au tournoi sont lancées.")){
                Router.go('home');
            }

	    });

    },

    'click #closeRegistrationsButton': function(){
        if(confirm("Confirmer la fermeture des inscriptions:"))
        {
                Meteor.call('stopTournamentRegistrations', function(error, result){
                    if(error){
                        console.error('stopTournamentRegistrations error');
                        console.error(error);
                    }
                });
        }

    }

});
