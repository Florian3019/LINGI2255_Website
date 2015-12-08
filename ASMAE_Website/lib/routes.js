/*
	This file defines routes for the website, what should be loaded for each route and
	special actions to be made when the user moves to or from a page
*/

Router.configure({
	layoutTemplate: 'index',
	loadingTemplate:'loading',
	waitOn: function() {
    	return [Meteor.subscribe('GlobalValues')
    	];
  	}
});

Router.onBeforeAction(function() {
	if(!Meteor.isServer && !Meteor.userId()){
		this.render("login");
	} else {
        if(!(Meteor.user().emails[0].verified))
            this.render("emailVerification");
        else
			this.next();
	}
}, {except: ['home', 'rules', 'login', 'faq', 'poolList', 'courtMap', 'winners']});


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
		return [ Meteor.subscribe('Years') ]
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/gagnants', {
	template:'winners',
	name:"winners",
	waitOn: function(){
		return [ Meteor.subscribe('Winners'), Meteor.subscribe('Pairs'),Meteor.subscribe('users')  ]
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/carte-terrains/:_id?', {
	template: 'courtMap',
	name: 'courtMap',
	data: function(){
		if (this.ready()) {
			return {"courtId":this.params._id};
		}
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	},
	waitOn: function(){
		return [ Meteor.subscribe('Courts'), Meteor.subscribe('Addresses')  ]
	},
});

Router.route('/staff-faq', {
	template: 'staffFaq',
	name: 'staffFaq',
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/modifications-log', {
	template: 'modificationsLog',
	name: 'modificationsLog',
	waitOn: function(){
		return [ Meteor.subscribe('ModificationsLog'), Meteor.subscribe('users') ]
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/contacts', {
	name: 'contacts',
	template: 'contacts',
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/reglement', {
	name: 'rules',
	template: 'rules',
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/email-verification', {
	template: 'emailVerification',
	name: 'emailVerification',
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/mon-inscription', {
	name: 'myRegistration',
	template: 'myRegistration',
	onBeforeAction: function() {
		if (isRegistered(Meteor.userId())) {
			this.next();
		}
		else {
			this.render("login");
		}
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});
Router.route('/inscription-tournoi-samedi',  {
	name: 'tournamentRegistrationSaturday',
	template: 'tournamentRegistration',
	waitOn: function(){
		var res = [
			Meteor.subscribe('users')
		];
		return res;
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	},
	data : function() {
		if (this.ready()) {
			return {day:"saturday"};
		}
	}
});

Router.route('/inscription-tournoi-dimanche',  {
	name: 'tournamentRegistrationSunday',
	template: 'tournamentRegistration',
	waitOn: function(){
		var res = [
			Meteor.subscribe('users')
		];
		return res;
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	},
	data : function() {
		if (this.ready()) {
			return {day:"sunday"};
		}
	}
});

Router.route('/liste-poules', {
	name: 'poolList',
	template: 'poolList',
	waitOn: function(){
		return [
					Meteor.subscribe('Years'),
					Meteor.subscribe('Types'),
					Meteor.subscribe('users'),
					Meteor.subscribe('Pairs'),
					Meteor.subscribe('Pools'),
					Meteor.subscribe('Matches'),
					Meteor.subscribe('Addresses')
					]
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/table-scores', {
	name: 'scoreTable',
	template: 'scoreTable',
	waitOn: function(){
		return [ 	Meteor.subscribe('Matches'),
					Meteor.subscribe('Users'),
					Meteor.subscribe('Pairs'),
					Meteor.subscribe('Addresses') ]
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/inscription-terrain', {
	name: 'courtRegistration',
	template: 'courtRegistration',
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
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
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/admin-ajout-terrain', {
	name: 'adminAddCourt',
	template: 'adminAddCourt',
	waitOn: function(){
		return [ Meteor.subscribe('users') ]
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/info-joueurs', {
	name: 'playersInfo',
	template: 'playersInfo',
	waitOn: function() {
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('users'), Meteor.subscribe('Payments')];
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
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
		return [Meteor.subscribe('Addresses'), Meteor.subscribe('users')];
	}
});

Router.route('/gestion-staff', {
	name: 'staffManagement',
	template: 'staffManagement',
	waitOn: function() {
		return Meteor.subscribe('Questions');
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
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
	},
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}

});
Router.route('/brackets', {
	name: 'brackets',
	template: 'brackets',
	waitOn: function(){
		return [Meteor.subscribe('Years'), Meteor.subscribe('Types'), Meteor.subscribe('Pairs') ];
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
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
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/print', {
	name: 'printSheets',
	template: 'printSheets',
	onAfterAction: function(){
    Session.set("printSheets/poolList","");
    Session.set("printSheets/isWorkingPrint",false);
    Session.set("printSheets/isWorkingPool",false);
		Session.set('showNavBar', true);
	},
  onStop:function(){
    Session.set("printSheets/info");
    Session.set("printOneSheet/poolId");
    Session.set("printSheets/OnePage");
  }
});

Router.route('/terrains', {
	name: 'courtsList',
	template: 'courtsList',
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/print-bracket', {
	name: 'PdfBracket',
	template: 'PdfBracket',
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/forum', {
	name: 'forum',
	template: 'forum',
	waitOn: function(){
		return [ Meteor.subscribe('Topics'), Meteor.subscribe('Threads')]
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
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
		return [Meteor.subscribe('Pairs'), Meteor.subscribe('users')];
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
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
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
	template: 'faq',
	onAfterAction: function(){
		Session.set('showNavBar', false);
	}
});

Router.route('/deroulement-tournoi', {
  	name: 'tournamentProgress',
	template: 'tournamentProgress',
	waitOn: function() {
		return [Meteor.subscribe('Years'), Meteor.subscribe('Extras')];
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/paiements-des-joueurs', {
  	name: 'playerPayments',
	template: 'playerPayments',
	waitOn: function() {
		return [Meteor.subscribe('Years'), Meteor.subscribe('Payments')];
	},
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});

Router.route('/envoyer-mail', {
  	name: 'sendEmailToList',
	template: 'sendEmailToList',
	onAfterAction: function(){
		Session.set('showNavBar', true);
	}
});
