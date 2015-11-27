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
});

Template.index.events({
	'click #popdb' : function(event) {
		var nTypes2015 = [175,175,175,28];
		var nAlones2015 = [70,70,70,10];
		var nUnregistered2015 = 200;
		var nCourtSaturday2015 = 40;
		var nCourtSunday2015 = 40;
		var nCourtBoth2015 = 30;
		var nStaff2015 = 10;
		var nAdmin2015 = 3;
		var nTypes2014 = [70,70,70,14];
		var nAlones2014 = [35,35,35,7];
		var nUnregistered2014 = 0;
		var nCourtSaturday2014 = 40;
		var nCourtSunday2014 = 40;
		var nCourtBoth2014 = 30;
		var nStaff2014 = 0;
		var nAdmin2014 = 0;

		//Meteor.call("populateDB", new Date(2014, 8, 11), nTypes2014, nAlones2014, nUnregistered2014, nCourtSaturday2014, nCourtSunday2014, nCourtBoth2014, nStaff2014, nAdmin2014);
		Meteor.call("populateDB", new Date(2015, 8, 12), nTypes2015, nAlones2015, nUnregistered2015, nCourtSaturday2015, nCourtSunday2015, nCourtBoth2015, nStaff2015, nAdmin2015);
		Meteor.call('setCurrentYear', "2015");
	},

	'click #activateDB' : function(event) {
		Meteor.call('activateDB');
	}
});
