Template.navigation.helpers({
	'isStaff': function(){
		if(Meteor.user())
		{
			return (Meteor.user().profile.isStaff || Meteor.user().profile.isAdmin);
		}
		else
		{
			return false;
		}
		
	}
});

