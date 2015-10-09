Template.navigation.isStaff = function(){
	
	return (Meteor.users.findOne().profile.isStaff||Meteor.users.findOne().profile.isAdmin)
}

Template.navigation.isStaff = function(){
	return (Meteor.users.findOne().profile.isStaff||Meteor.users.findOne().profile.isAdmin);
}

