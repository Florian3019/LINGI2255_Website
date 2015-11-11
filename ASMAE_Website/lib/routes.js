
Router.configure({
	layoutTemplate: 'index'
});

Router.onBeforeAction(function() {
	var currentUser = Meteor.userId();
	if(currentUser){
		this.next();
	} else {
		this.render("login");
	}
}, {except: ['home', 'rules']});

// onStop hook is executed whenever we LEAVE a route
Router.onStop(function(){
	// register the previous route location in a session variable
	Session.set("previousLocationPath", Router.current().route.getName());
	console.log(Router.current().route.getName());
});

Router.route('/', {
	template: 'home',
	name: 'home'
});

Router.route('/courtEmail', {
	template: 'courtEmail',
	name: 'courtEmail'
});


Router.route('/contacts', {
	name: 'contacts',
	template: 'contacts'
});
Router.route('/rules', {
	name: 'rules',
	template: 'rules'
});
Router.route('/confirmation-inscription-tournoi', {
	name: 'myRegistration',
	template: 'myRegistration'
});
Router.route('/tournament-registration',  {
	name: 'tournamentRegistration',
	template: 'tournamentRegistration',
});

Router.route('/poolList', {
	name: 'poolList',
	template: 'poolList'
});

Router.route('/scoreTable', {
	name: 'scoreTable',
	template: 'scoreTable'
});

Router.route('/court-registration', {
	name: 'courtRegistration',
	template: 'courtRegistration'
});

Router.route('/court-info', {
	name: 'courtInfo',
	template: 'courtInfo'
});

Router.route('/court/:_id', {
	name: 'courtInfoPage',
	template: 'courtInfoPage',
	data: function(){
		if (this.ready()) {
			var court = Courts.findOne(this.params._id);
			var owner = Meteor.users.findOne(court.ownerID);
			var address = Addresses.findOne(court.addressID);
			var data = {};
			data.court = court;
			data.owner = owner;
			data.address = address;
			return data;
		}
	},
	waitOn: function(){
		return [
			Meteor.subscribe('Courts'),
			Meteor.subscribe('Addresses'),
			Meteor.subscribe('users')
		]
	}
});

Router.route('/my-courts', {
	name: 'myCourts',
	template: 'myCourts'
});

Router.route('/adminTemplate', {
	name: 'adminTemplate',
	template: 'adminTemplate'
});
Router.route('/adminAddCourt', {
	name: 'adminAddCourt',
	template: 'adminAddCourt'
});
Router.route('/players-info', {
	name: 'playersInfo',
	template: 'playersInfo'
});
Router.route('/player-info-page', {
	name: 'playerInfoPage',
	template: 'playerInfoPage',
});
Router.route('/player-info-template', {
	name: 'playerInfoTemplate',
	template: 'playerInfoTemplate',
});
Router.route('/staff-management', {
	name: 'staffManagement',
	template: 'staffManagement'
});
Router.route('/profileEdit/:_id', {
	name: 'profileEdit',
	template: 'profileEdit',
	data: function(){
		if (this.ready()) {
			// var user = Meteor.users.findOne({_id:this.params._id});
			// var address = Addresses.findOne({_id:user.profile.addressID});
			// var data = {};
			// data.user = user;
			// data.address = address;
			return {ID:this.params._id};
		}
	},
	waitOn: function(){
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('users') ];
	}

});
Router.route('/brackets', {
	name: 'brackets',
	template: 'brackets'
});

Router.route('/confirmation_registration_court/:_id', {
	name: 'confirmation_registration_court',
	template: 'confirmation_registration_court',

	data: function(){
		if (this.ready()) {
			var court = Courts.findOne({ _id: this.params._id });
			var owner = Meteor.users.findOne({_id: court.ownerID});
			var address = Addresses.findOne({_id: court.addressID});
			var data = {};
			data.court = court;
			data.owner = owner;
			data.address = address;
			return data;
		}
	},
	waitOn: function(){
		return [ Meteor.subscribe('Courts'), Meteor.subscribe('Addresses'), Meteor.subscribe('users') ]
	}
});

Router.route('/modify-court/:_id', {
	name: 'modifyCourt',
	template: 'courtRegistration',

	data: function(){
		if (this.ready()) {
			var court = Courts.findOne({ _id: this.params._id, ownerID: Meteor.userId() });
			var owner = Meteor.users.findOne({_id: court.ownerID});
			var address = Addresses.findOne({_id: court.addressID});
			var data = {};
			data.court = court;
			data.owner = owner;
			data.address = address;
			return data;
		}
	},
	waitOn: function(){
		return [ Meteor.subscribe('Courts'), Meteor.subscribe('Addresses'), Meteor.subscribe('users') ]
	}

});

Router.route('/recherche-terrain', {
	name: 'courtSearch',
	template: 'courtSearch'
});

Router.route('/terrains', {
	name: 'courtsList',
	template: 'courtsList'
});

Router.route('/modify-extras',{
	name: "modifyExtras",
	template: 'modifyExtras'
});

Router.route('/confirm_pair/:_id',{
	name: 'confirmPair',
	template: 'confirmPair',

	data: function(){
		var data = {};
		data.idPair = this.params._id;
		return data;
	}
});
