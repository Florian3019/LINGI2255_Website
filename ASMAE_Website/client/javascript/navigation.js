Template.navigation.helpers({
	'isStaff': function(){
		return (Meteor.user().profile.isStaff || Meteor.user().profile.isAdmin);
	}
});

