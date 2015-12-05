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
	}
});
