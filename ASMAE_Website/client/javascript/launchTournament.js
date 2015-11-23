Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker();
}

Template.launchTournament.events({
    'submit form': function(event){
        event.preventDefault();

        var launchData = {
            tournamentDate: $('[name=launchTournamentDate]').val(),
            tournamentPrice: $('[name=tournamentPrice]').val()
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


    }
});
