/*
	This file defines helpers for the top navigation bar
*/
Template.navigation.helpers({
	'registered': function() {
		return getPairsFromPlayerID(Meteor.userId()) !== undefined;
	},
	'registrationsON': function(){
        var registrationsON = GlobalValues.findOne({_id:"registrationsON"});
        if (typeof registrationsON !== 'undefined') {
            return registrationsON.value;
        }
        return false;
    },
	'isSaturdayRegistered' : function() {
		return isSaturdayRegistered(Meteor.userId());
	},
	'isSundayRegistered' : function() {
		return isSundayRegistered(Meteor.userId());
	},
	'isBothRegistered' : function() {
		return isBothRegistered();
	}
});

Template.navigation.events({

	'click #tournamentNavigation': function(){

		Session.set('showNavBar', true);
		
		var $window = $(window);
		var wWidth  = $window.width();
		if (wWidth <= 750) { // Only in mobile screen (not 767px cause marge of 17px)
			// Go mobile menu
			window.location.hash = '#menu-mobile';
		}

	},

	'click .toToggle': function() {
		var $window = $(window);
		var wWidth  = $window.width();
		$(window).scrollTop(0);
		if (wWidth <= 750) { // Only in mobile screen (not 767px cause marge of 17px)
			$("button.navbar-toggle").click();
		}
	},
});
