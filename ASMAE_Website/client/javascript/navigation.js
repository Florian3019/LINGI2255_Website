Template.navigation.helpers({
	'isStaff': function(){
		return (Meteor.users.findOne().profile.isStaff||Meteor.users.findOne().profile.isAdmin)
	}
});

