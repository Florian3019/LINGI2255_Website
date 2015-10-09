Router.configure({
    layoutTemplate: 'index'
});

// onStop hook is executed whenever we LEAVE a route
Router.onStop(function(){
  // register the previous route location in a session variable
  Session.set("previousLocationPath",Router.current().route.getName());
});

Router.route('/', {
    template: 'home',
    name: 'home'
});

Router.route('/contacts', {
	name: 'contacts',
	template: 'contacts'
});
Router.route('/pictures', {
	name: 'pictures',
	template: 'pictures'
});
Router.route('/rules', {
	name: 'rules',
	template: 'rules'
});
Router.route('/tournament-registration',  {
	name: 'tournamentRegistration',
	template: 'tournamentRegistration',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    }
});
Router.route('/court-registration', {
	name: 'courtRegistration',
	template: 'courtRegistration',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    }
});
Router.route('/court-info', {
	name: 'courtInfo',
	template: 'courtInfo',

	subscriptions: function(){
        return [ Meteor.subscribe('courts'), Meteor.subscribe('addresses') ]
    }
});
Router.route('/players-info', {
	name: 'playersInfo',
	template: 'playersInfo'
});
Router.route('/player-info-page', {
	name: 'playerInfoPage',
	template: 'playerInfoPage',
});
Router.route('/court-info-page', {
	name: 'courtInfoPage',
	template: 'courtInfoPage',
});
Router.route('/staff-management', {
	name: 'staffManagement',
	template: 'staffManagement'
});
Router.route('/profile-edit', {
	name: 'profileEdit',
	template: 'profileEdit'
});
Router.route('/brackets', {
	name: 'brackets',
	template: 'brackets'
});

Router.route('/confirmation_registration_player', {
	name: 'confirmation_registration_player',
	template: 'confirmation_registration_player',
	onBeforeAction: function() {
		var previousLocationPath=Session.get("previousLocationPath");
		// Redirect to Home if we are not coming from the tournament registration page
		if(previousLocationPath!="tournamentRegistration"){
			this.redirect("/")
		}
		this.next();
	}
});