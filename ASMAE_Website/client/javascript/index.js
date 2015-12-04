/*
	This file defines helpers for the staff menu and for the populate database
*/
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
		//if(Meteor.user())
		var showNavBar = Session.get('showNavBar');
		if(showNavBar)
		{
			return '';
		}
		else
		{
			return 'nomargin';
		}
	},

	'showNavBar': function(){
		 return Session.get('showNavBar');
	}

});

Template.index.events({
	'click #popdb' : function(event) {
		/*
		 * 2015 data
		 */
		var nMen2015 = [20, 20, 20, 0, 10, 0, 20];
		var nWomen2015 = [10, 0, 20, 20, 10, 30];
		var nMixed2015 = [30, 20, 40, 0, 0, 30, 0];
		var nFamily2015 = 30;
		var nPairs2015 = [nMen2015,nWomen2015,nMixed2015,nFamily2015];
		var nAloneMen2015 = [10, 10, 5, 0, 2, 9, 0];
		var nAloneWomen2015 = [10, 10, 5, 0, 2, 9, 0];
		var nAloneMixed2015 = [10, 10, 5, 0, 2, 9, 0];
		var nAloneFamily2015 = 10;
		var nAlones2015 = [nAloneMen2015,nAloneWomen2015,nAloneMixed2015,nAloneFamily2015];

		var nCourtSaturday2015 = 40;
		var nCourtSunday2015 = 40;
		var nCourtBoth2015 = 60;

		/*
		 * 2014 data
		 */
		var nMen2014 = [10, 20, 20, 0, 10, 0, 20];
		var nWomen2014 = [10, 0, 20, 20, 10, 10];
		var nMixed2014 = [10, 20, 40, 0, 0, 10, 0];
		var nFamily2014 = 30;
		var nPairs2014 = [nMen2014,nWomen2014,nMixed2014,nFamily2014];
		var nAloneMen2014 = [0, 10, 5, 0, 2, 9, 0];
		var nAloneWomen2014 = [10, 10, 5, 0, 2, 9, 0];
		var nAloneMixed2014 = [10, 10, 5, 0, 2, 9, 0];
		var nAloneFamily2014 = 10;
		var nAlones2014 = [nAloneMen2014,nAloneWomen2014,nAloneMixed2014,nAloneFamily2014];

		var nCourtSaturday2014 = 20;
		var nCourtSunday2014 = 20;
		var nCourtBoth2014 = 10;

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
		var nPairsTab = [nPairs2014, nPairs2015];
		var nAlonesTab = [nAlones2014, nAlones2015];
		var nCourtSaturdayTab = [nCourtSaturday2014, nCourtSaturday2015];
		var nCourtSundayTab = [nCourtSunday2014, nCourtSunday2015];
		var nCourtBothTab = [nCourtBoth2014, nCourtBoth2015];

		Meteor.call("populateDB", tournamentDataTab, nPairsTab, nAlonesTab, nUnregistered, nCourtSaturdayTab, nCourtSundayTab, nCourtBothTab, nStaff, nAdmin);
	},
	'click #popdbtest' : function(event) {
		/*
		 * 2015 data
		 */
		var nMen2015 = [3, 0, 0, 0, 0, 0, 0];
		var nWomen2015 = [0, 0, 0, 0, 0, 0];
		var nMixed2015 = [0, 0, 0, 0, 0, 0, 0];
		var nFamily2015 = 0;
		var nPairs2015 = [nMen2015,nWomen2015,nMixed2015,nFamily2015];
		var nAloneMen2015 = [0, 0, 0, 0, 0, 0, 0];
		var nAloneWomen2015 = [0, 0, 0, 0, 0, 0, 0];
		var nAloneMixed2015 = [0, 0, 0, 0, 0, 0, 0];
		var nAloneFamily2015 = 0;
		var nAlones2015 = [nAloneMen2015,nAloneWomen2015,nAloneMixed2015,nAloneFamily2015];

		var nCourtSaturday2015 = 5;
		var nCourtSunday2015 = 5;
		var nCourtBoth2015 = 0;

		/*
		 * 2014 data
		 */
		var nUnregistered = 0;
		var nStaff = 1;
		var nAdmin = 1;

		var tournamentData2015 = {
			tournamentDate : new Date(2015,8,12),
			tournamentPrice : 10
		}
		var tournamentDataTab = [tournamentData2015];
		var nPairsTab = [nPairs2015];
		var nAlonesTab = [nAlones2015];
		var nCourtSaturdayTab = [nCourtSaturday2015];
		var nCourtSundayTab = [nCourtSunday2015];
		var nCourtBothTab = [nCourtBoth2015];

		Meteor.call("populateDB", tournamentDataTab, nPairsTab, nAlonesTab, nUnregistered, nCourtSaturdayTab, nCourtSundayTab, nCourtBothTab, nStaff, nAdmin);
	}
});
