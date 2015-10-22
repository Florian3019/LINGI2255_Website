Router.configure({
    layoutTemplate: 'index'
});

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
Router.route('/myRegistration', {
	name: 'myRegistration',
	template: 'myRegistration'
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

Router.route('/poolList', {
	name: 'poolList',
	template: 'poolList'
});

Router.route('/scoreTable/:poolId', {
	name: 'scoreTable',
	template: 'scoreTable',
	data: function(){
		return Pools.findOne({_id:this.params.poolId});
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
Router.route('/profileEdit', {
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
	
	data: function(){
		var lastName = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.lastName':1})).profile.lastName;
		var firstName = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.firstName':1})).profile.firstName;
		var date = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.birthDate':1})).profile.birthDate;
		date = date.substring(8,10) + "/" + date.substring(5,7) + "/" + date.substring(0,4);
		var phone = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.phone':1})).profile.phone;
		phone = phone.substring(0,4) + "/" + phone.substring(4,6) + "." + phone.substring(6,8) + "." + phone.substring(8,10);
		var gender = (Meteor.users.findOne({_id:Meteor.userId()}, {'profile.gender':1})).profile.gender;
		var userData = Meteor.users.findOne({_id:Meteor.userId()}, {'profile.addressID':1});
		var addr = Addresses.findOne({_id:userData.profile.addressID});
		if (addr.box) {
			address = addr.number + ", " + addr.street + ". Boite " + addr.box;
		}
		else {
			address = addr.number + ", " + addr.street;
		}
		var city = addr.zipCode + " " + addr.city;
		
		var data = {};
		data.lastName = lastName;
		data.firstName = firstName;
		data.birthDate = date;
		data.phone = phone;
		data.address = address;
		data.city = city;
		data.gender = gender;
		return data;
    },
	
	onBeforeAction: function() {
		var previousLocationPath=Session.get("previousLocationPath");
		// Redirect to Home if we are not coming from the tournament registration page
		if(previousLocationPath!="tournamentRegistration"){
			this.redirect("/")
		}
		this.next();
	}
});

Router.route('/confirmation_registration_court/:_id', {
	name: 'confirmation_registration_court',
	template: 'confirmation_registration_court',
	
	data: function(){
		var court = Courts.findOne({ _id: this.params._id, ownerID: Meteor.userId() });
		console.log(court);
		var owner = Meteor.users.findOne({_id: court.ownerID});
		var address = Addresses.findOne({_id: court.addressID});
		var data = {};
		data.court = court;
		data.owner = owner;
		data.address = address;
		return data;
    }
	
	/*
	onBeforeAction: function() {
		var previousLocationPath=Session.get("previousLocationPath");
		// Redirect to Home if we are not coming from the tournament registration page
		if(previousLocationPath!="courtRegistration"){
			this.redirect("/")
		}
		this.next();
	}*/
});

Router.route('/modify-court/:_id', {
	name: 'modifyCourt',
	template: 'courtRegistration',
	
	data: function(){
		var court = Courts.findOne({ _id: this.params._id, ownerID: Meteor.userId() });
		var owner = Meteor.users.findOne({_id: court.ownerID});
		var address = Addresses.findOne({_id: court.addressID});
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
    },
    waitOn: function(){
        return [ Meteor.subscribe('courts'), Meteor.subscribe('addresses') ]
    }	
	
});

Router.route('/search-court', {
	name: 'courtSearch',
	template: 'courtSearch'
});

Router.route('/confirm_pair/:_id',{
	name: 'confirmPair',
	template: 'confirmPair',

	data: function(){
		var data = {};
		data.idPair = this.params._id;
		return data;
	},
	onBeforeAction: function(){
        if(Meteor.userId()){
            this.next();
        } else {
            this.render("login");
        }
    }
});