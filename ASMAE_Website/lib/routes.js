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
        if(Meteor.userId()){
            this.next();
        } else {
            this.render("login");
        }
    }
});

Router.route('/court-info', {
	name: 'courtInfo',
	template: 'courtInfo',
	onBeforeAction: function(){
        if(Meteor.userId()){
            this.next();
        } else {
            this.render("login");
        }
    }
});

Router.route('/court/:_id', {
	name: 'courtInfoPage',
	template: 'courtInfoPage',
	data: function(){
		var court = Courts.findOne({ _id: this.params._id, ownerID: Meteor.userId() });
		console.log(court);
		var owner = Meteor.users.findOne({_id: court.ownerID});
		console.log(owner);
		var address = Addresses.findOne({_id: court.addressID});
		console.log(address);
		var data = {};
		data.court = court;
		data.owner = owner;
		data.address = address;
		return data;
    },
	onBeforeAction: function(){
        if(Meteor.userId()){
            this.next();
        } else {
            this.render("login");
        }
    }

	/*
	subscriptions: function(){
        return [ Meteor.subscribe('courts'), Meteor.subscribe('addresses') ]
    }
    */
});

Router.route('/my-courts', {
	name: 'myCourts',
	template: 'myCourts'
});

Router.route('/players-info', {
	name: 'playersInfo',
	template: 'playersInfo'
});
Router.route('/player-info-page', {
	name: 'playerInfoPage',
	template: 'playerInfoPage'
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