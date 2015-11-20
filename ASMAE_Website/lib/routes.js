
Router.configure({
	layoutTemplate: 'index'
});

function isRegistered() {
	var id = Meteor.userId();
	var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});
	if (pair) {
		return true;
	}
	else {
		return false;
	}
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
	name: 'home'
});

Router.route('/email-terrain', {
	template: 'courtEmail',
	name: 'courtEmail'
});

Router.route('/modifications-log', {
	template: 'modificationsLog',
	name: 'modificationsLog'
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
	}
});

Router.route('/login', {
	name: 'login',
	template: 'login'
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
	}
});

Router.route('/liste-poules', {
	name: 'poolList',
	template: 'poolList'
});

Router.route('/table-scores', {
	name: 'scoreTable',
	template: 'scoreTable'
});

Router.route('/inscription-terrain', {
	name: 'courtRegistration',
	template: 'courtRegistration'
});

Router.route('/info-terrain', {
	name: 'courtInfo',
	template: 'courtInfo'
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
	template: 'myCourts'
});

Router.route('/template-admin', {
	name: 'adminTemplate',
	template: 'adminTemplate'
});
Router.route('/admin-ajout-terrain', {
	name: 'adminAddCourt',
	template: 'adminAddCourt'
});
Router.route('/info-joueurs', {
	name: 'playersInfo',
	template: 'playersInfo',
	waitOn: function() {
		return Meteor.subscribe('Addresses');
	}
});
Router.route('/page-info-joueur', {
	name: 'playerInfoPage',
	template: 'playerInfoPage',
});
Router.route('/template-info-joueur', {
	name: 'playerInfoTemplate',
	template: 'playerInfoTemplate',
});
Router.route('/gestion-staff', {
	name: 'staffManagement',
	template: 'staffManagement'
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
	template: 'brackets'
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
	name: 'courtSearch',
	template: 'courtSearch'
});

Router.route('/print', {
	name: 'printSheets',
	template: 'printSheets'
});

Router.route('/terrains', {
	name: 'courtsList',
	template: 'courtsList'
});

Router.route('/modifier-extras',{
	name: "modifyExtras",
	template: 'modifyExtras'
});

Router.route('/confirmation-pair/:_id',{
	name: 'confirmPair',
	template: 'confirmPair',

	data: function(){
		var data = {};
		data.idPair = this.params._id;
		return data;
	}
});

Router.route('/payment', {
	name: 'payment',
	template: 'payment'
});

Router.route('/payment-confirmation', {
  name: 'paymentConfirmation',
	template: 'paymentConfirmation'
});
