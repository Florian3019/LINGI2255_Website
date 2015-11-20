Template.index.helpers({
	'isHomePage' : function(){
		if(Router.current().route.getName() === 'home'){
			return 'homePage';
		}
		else
		{
			return '';
		}
	},

	'isTournamentPage':function(){
		if(Router.current().route.getName() === 'poolList'){
			return true;
		}
		else
		{
			return false;
		}
	},

	'isStaffMember': function(){
		if(Meteor.user())
		{
			return (Meteor.user().profile.isStaff || Meteor.user().profile.isAdmin);
		}
		else
		{
			return false;
		}
	},

	'getAllYears':function(){
		return ALLYEARS; // constant.js
	},

	'getYear' : function(){
		var year = Session.get('PoolList/Year');
		var y = Years.findOne({_id:year});

		if(year!=undefined && y==undefined){
			setInfo(document, "Pas de données trouvées pour l'année "+ year);
		}
		else{
			infoBox =document.getElementById("infoBox");
			if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered
		}

		return y;
	},
});


Template.index.events({
	'click #popdb' : function(event) {
		console.log("Populating DB");
		Meteor.call("populateDB");
	}
});
