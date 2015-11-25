Template.playerInfoPage.helpers({
	dataHelpers: function() {
		return Session.get('selected')._id;
	}
});

/*
Template.playerInfoPage.events({
	"click": function(event){
		event.preventDefault();
		Router.go('profileEdit',{"_id":Session.get('selected')._id});
	}
});
*/