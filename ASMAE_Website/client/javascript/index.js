Template.index.helpers({
	'isHomePage' : function(){
		if(Router.current().route.getName() === 'home'){
			return 'homePage';
		}
		else
		{
			return '';
		}
	},

	'isTournamentPage':function(){
		if(Router.current().route.getName() === 'poolList'){
			return true;
		}
		else
		{
			return false;
		}
	},

	'isStaffMember': function(){
		if(Meteor.user())
		{
			return (Meteor.user().profile.isStaff || Meteor.user().profile.isAdmin);
		}
		else
		{
			return false;
		}
	},

	'isConnected': function(){
		if(Meteor.user())
		{
			return true;
		}
		else
		{
			return false;
		}
	},

	'contentPadding': function(){
		if(Meteor.user())
		{
			return '';
		}
		else
		{
			return 'nopadding';
		}
	},
});

Template.index.events({
	'click #popdb' : function(event) {
		var nTypes2015 = [175,175,175,28];
		var nAlones2015 = [70,70,70,10];
		var nCourtSaturday2015 = 40;
		var nCourtSunday2015 = 40;
		var nCourtBoth2015 = 30;
		var nTypes2014 = [70,70,70,14];
		var nAlones2014 = [35,35,35,7];
		var nCourtSaturday2014 = 40;
		var nCourtSunday2014 = 40;
		var nCourtBoth2014 = 30;

		var nUnregistered = 200;
		var nStaff = 10;
		var nAdmin = 3;

		var tournamentData2014 = {
			tournamentDate : new Date(2014,8,11),
			tournamentPrice : 8
		}
		var tournamentData2015 = {
			tournamentDate : new Date(2015,8,12),
			tournamentPrice : 10
		}
		var tournamentDataTab = [tournamentData2014, tournamentData2015];
		var nTypesTab = [nTypes2014, nTypes2015];
		var nAlonesTab = [nAlones2014, nAlones2015];
		var nCourtSaturdayTab = [nCourtSaturday2014, nCourtSaturday2015];
		var nCourtSundayTab = [nCourtSunday2014, nCourtSunday2015];
		var nCourtBothTab = [nCourtBoth2014, nCourtBoth2015];

		Meteor.call("populateDB", tournamentDataTab, nTypesTab, nAlonesTab, nUnregistered, nCourtSaturdayTab, nCourtSundayTab, nCourtBothTab, nStaff, nAdmin);
	}
});
