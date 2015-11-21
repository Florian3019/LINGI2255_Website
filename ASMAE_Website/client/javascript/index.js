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
		var nTypes2015 = [175,175,175,28];
		var nAlones2015 = [70,70,70,10];
		var nUnregistered2015 = 200;
		var nCourt2015 = 70;
		var nStaff2015 = 10;
		var nAdmin2015 = 3;
		var nTypes2014 = [175,175,175,28];
		var nAlones2014 = [70,70,70,10];
		var nUnregistered2014 = 200;
		var nCourt2014 = 70;
		var nStaff2014 = 10;
		var nAdmin2014 = 3;
		Meteor.call("populateDB", new Date(2015, 8, 12), nTypes2015, nAlones2015, nUnregistered2015, nCourt2015, nStaff2015, nAdmin2015);
		Meteor.call("populateDB", new Date(2014, 8, 11), nTypes2014, nAlones2014, nUnregistered2014, nCourt2014, nStaff2014, nAdmin2014);
	}
});
