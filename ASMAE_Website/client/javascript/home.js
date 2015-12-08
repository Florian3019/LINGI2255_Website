Template.home.helpers({
    'registrationsON': function(){
        var registrationsON = GlobalValues.findOne({_id:"registrationsON"});
        if (typeof registrationsON !== 'undefined') {
            return registrationsON.value;
        }
        return false;
    },
    'getFormattedDate': function() {
        var date = getTournamentDate();
		if (!date) {
			return undefined;
		}
		var month;
		var d = date.getDate();
		switch(date.getMonth()) {
			case 0: month="janvier"; break;
			case 1: month="février"; break;
			case 2: month="mars"; break;
			case 3: month="avril"; break;
			case 4: month="mai"; break;
			case 5: month="juin"; break;
			case 6: month="juillet"; break;
			case 7: month="août"; break;
			case 8: month="septembre"; break;
			case 9: month="octobre"; break;
			case 10: month="novembre"; break;
			case 11: month="décembre"; break;
			default: month="septembre"; break;
		}
		return "Les "+ d + " et "+(d+1)+" "+month+" "+date.getFullYear();
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
