
function isStaff() {
	if(Meteor.user())
	{
		return (Meteor.user().profile.isStaff || Meteor.user().profile.isAdmin);
	}
	else
	{
		return false;
	}
}

function isAdmin() {
	if(Meteor.user())
	{
		return (Meteor.user().profile.isAdmin);
	}
	else
	{
		return false;
	}
}

Template.navigation.helpers({
	'isStaff': function(){
		return isStaff();
	},
	'isAdmin':function(){
		return isAdmin();
	},
	'isSimpleUser' : function() {
		return (!isStaff() && !isAdmin());
	},
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
