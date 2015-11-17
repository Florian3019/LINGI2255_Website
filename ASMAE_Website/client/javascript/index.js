Template.index.helpers({
	'isHomePage' : function(){
		if(Router.current().route.getName() === 'home'){
			return 'homePage';
		}
		else
		{
			return '';
		}
	}
});

Template.index.events({
	'click #popdb' : function(event) {
		console.log("Populating DB");
		Meteor.call("populateDB");
	}
});
