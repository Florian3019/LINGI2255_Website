
Router.configure({
	layoutTemplate: 'index'
});

function isRegistered() {
	return getPairFromPlayerID() !== undefined;
}

Router.onBeforeAction(function() {
	if(!Meteor.isServer && !Meteor.userId()){
		this.render("login");
	} else {
        if(!(Meteor.user().emails[0].verified))
            this.render("emailVerification");
        else
			this.next();
	}
}, {except: ['home', 'rules', 'login']});


// onStop hook is executed whenever we LEAVE a route
Router.onStop(function(){
	// register the previous route location in a session variable
	Session.set("previousLocationPath", Router.current().route.getName());
	console.log(Router.current().route.getName());
});

Router.route('/', {
	template: 'home',
	name: 'home',
	waitOn: function(){
		return [ Meteor.subscribe('GlobalValues'), Meteor.subscribe('Years') ]
	}
});

Router.route('/email-terrain', {
	template: 'courtEmail',
	name: 'courtEmail'
});

Router.route('/modifications-log', {
	template: 'modificationsLog',
	name: 'modificationsLog',
	waitOn: function(){
		return [ Meteor.subscribe('ModificationsLog'), Meteor.subscribe('users') ]
	}
});

Router.route('/contacts', {
	name: 'contacts',
	template: 'contacts'
});

Router.route('/reglement', {
	name: 'rules',
	template: 'rules'
});

Router.route('/email-verification', {
	template: 'emailVerification',
	name: 'emailVerification'
});

Router.route('/mon-inscription', {
	name: 'myRegistration',
	template: 'myRegistration',
	onBeforeAction: function() {
		if (isRegistered()) {
			this.next();
		}
		else {
			this.render("login");
		}
	},
	waitOn: function(){
		return [
			Meteor.subscribe('GlobalValues'),
		]
	}
});
Router.route('/mon-inscription2', {
	name: 'myRegistration2',
	template: 'myRegistration2',
	onBeforeAction: function() {
		if (isRegistered()) {
			this.next();
		}
		else {
			this.render("login");
		}
	},
	waitOn: function(){
		return [
			Meteor.subscribe('GlobalValues'),
		]
	}
});
Router.route('/inscription-tournoi',  {
	name: 'tournamentRegistration',
	template: 'tournamentRegistration',
	onBeforeAction: function() {
		if (!isRegistered()) {
			this.next();
		}
		else {
			this.render("login");
		}
	},
	waitOn: function(){
		return [
			Meteor.subscribe('GlobalValues'),
			Meteor.subscribe('users')
		]
	}
});

Router.route('/liste-poules', {
	name: 'poolList',
	template: 'poolList',
	waitOn: function(){
		return [ Meteor.subscribe('Years'), Meteor.subscribe('Types'), Meteor.subscribe('users'), Meteor.subscribe('Pairs'), Meteor.subscribe('Pools'), Meteor.subscribe('Matches'), Meteor.subscribe('GlobalValues')]
	}
});

Router.route('/table-scores', {
	name: 'scoreTable',
	template: 'scoreTable',
	waitOn: function(){
		return [ Meteor.subscribe('Matches'), Meteor.subscribe('Users'), Meteor.subscribe('Pairs'), Meteor.subscribe('GlobalValues') ]
	}
});

Router.route('/inscription-terrain', {
	name: 'courtRegistration',
	template: 'courtRegistration'
});

Router.route('/info-terrain', {
	name: 'courtInfo',
	template: 'courtInfo',
	waitOn: function() {
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('Courts')];
	}
});

Router.route('/terrain/:_id', {
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

Router.route('/mes-terrains', {
	name: 'myCourts',
	template: 'myCourts',
	waitOn: function() {
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('Courts')];
	}
});

Router.route('/lancer-inscriptions-tournoi', {
	name: 'launchTournament',
	template: 'launchTournament',
	waitOn: function(){
		return [ Meteor.subscribe('GlobalValues') ]
	}
});

Router.route('/admin-ajout-terrain', {
	name: 'adminAddCourt',
	template: 'adminAddCourt',
	waitOn: function(){
		return [ Meteor.subscribe('users') ]
	}
});

Router.route('/info-joueurs', {
	name: 'playersInfo',
	template: 'playersInfo',
	waitOn: function() {
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('users'), Meteor.subscribe('Payments')];
	}
});

Router.route('/page-info-joueur/:_id', {
	name: 'playerInfoTemplate',
	template: 'playerInfoTemplate',
	data: function(){
		if (this.ready()) {
			return {ID:this.params._id};
		}
	},
	waitOn: function() {
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('users'), Meteor.subscribe('GlobalValues')];
	}
});

Router.route('/gestion-staff', {
	name: 'staffManagement',
	template: 'staffManagement',
	waitOn: function() {
		return Meteor.subscribe('Questions');
	}
});
Router.route('/editer-profil/:_id', {
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
	template: 'brackets',
	waitOn: function(){
		return [Meteor.subscribe('Years'), Meteor.subscribe('Types'), Meteor.subscribe('Pairs') ];
	}
});

Router.route('/confirmation-inscription-terrain/:_id', {
	name: 'confirmationRegistrationCourt',
	template: 'confirmationRegistrationCourt',

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

Router.route('/modifier-terrain/:_id', {
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
	name: 'courtSearchTemplate',
	template: 'courtSearchTemplate',
	waitOn: function(){
		return [ Meteor.subscribe('Courts'), Meteor.subscribe('Addresses'), Meteor.subscribe('users') ]
	}
});

Router.route('/print', {
	name: 'printSheets',
	template: 'printSheets'
});

Router.route('/terrains', {
	name: 'courtsList',
	template: 'courtsList'
});

Router.route('/forum', {
	name: 'forum',
	template: 'forum',
	waitOn: function(){
		return [ Meteor.subscribe('Topics'), Meteor.subscribe('Threads')]
	}
});

Router.route('/modifier-extras',{
	name: "modifyExtras",
	template: 'modifyExtras',
	waitOn: function(){
		return [ Meteor.subscribe('Extras')]
	}
});

Router.route('/confirmation-pair/:_id',{
	name: 'confirmPair',
	template: 'confirmPair',

	data: function(){
		var data = {};
		data.idPair = this.params._id;
		return data;
	},
	waitOn: function() {
		return [Meteor.subscribe('Pairs'), Meteor.subscribe('users'), Meteor.subscribe('GlobalValues')];
	}
});

Router.route('/topic/:_id/:tname',{
	name: 'topic',
	template: 'topic',

	data: function(){
		var data = {};
		data.topicId = this.params._id;
		data.threadName  = this.params.tname;
		return data;
	},

	waitOn: function(){
		return [ Meteor.subscribe('Threads'), Meteor.subscribe('Topics') ];
	}
});

Router.route('/payment', {
	name: 'payment',
	template: 'payment',
	waitOn: function(){
		return [ Meteor.subscribe('Payments')];
	}
});

Router.route('/payment-confirmation', {
  name: 'paymentConfirmation',
	template: 'paymentConfirmation',
	waitOn: function() {
		return [Meteor.subscribe('Payments')];
	}
});

Router.route('/payment-error', {
  name: 'paymentError',
	template: 'paymentError',
	waitOn: function() {
		return [Meteor.subscribe('Payments')];
	}
});

Router.route('/faq', {
  	name: 'faq',
	template: 'faq'
});

Router.route('/deroulement-tournoi', {
  	name: 'tournamentProgress',
	template: 'tournamentProgress',
	waitOn: function(){
		return [ Meteor.subscribe('GlobalValues') ]
	}
});
