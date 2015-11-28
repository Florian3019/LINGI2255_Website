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

	},
	'isAdmin':function(){
		if(Meteor.user())
		{
			return (Meteor.user().profile.isAdmin);
		}
		else
		{
			return false;
		}
	},
	'registered': function() {		
		var pair = getPairFromPlayerID();;
		if (pair) {
			return true;
		}
		else {
			return false;
		}
	},
	'registrationsON': function(){
        var registrationsON = GlobalValues.findOne({_id:"registrationsON"});
        if (typeof registrationsON !== 'undefined') {
            return registrationsON.value;
        }
        return false;
    }

    'marginNavBar': function(){
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
