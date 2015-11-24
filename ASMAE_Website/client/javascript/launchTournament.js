Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker();
}

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


    }
});
