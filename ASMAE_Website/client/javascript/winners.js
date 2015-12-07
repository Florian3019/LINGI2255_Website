var getPairData = function(pairId){
	var pair = Pairs.findOne({_id:pairId});
	var u1 = Meteor.users.findOne({_id:pair.player1._id});
	var u2 = Meteor.users.findOne({_id:pair.player2._id});

	return u1.profile.firstName + " " + u1.profile.lastName + " & "+u2.profile.firstName + " "+u2.profile.lastName;
}

Template.winners.helpers({
	'getWinners':function(){
		return Winners.find();
	},

	'settings':function(){
		return {
			fields:[
				{key: "year", label:"Année", sortOrder: 0, sortDirection: 'descending'},
				{ key:"type", label:'Type', sortOrder: 1, fn:function(value, object){
					return typesTranslate[value];
				}},
				{ key:"category", label:"Catégorie",sortOrder: 2, fn:function(value, object){
					return categoriesTranslate[value];
				}},
				{ key: 'first', label: "Finale", fn:function(value, object){
					return getPairData(value);
				}},
				{ key: 'second', label: "Demi-finale", fn:function(value, object){
					return getPairData(value);
				}}
			],
			showFilter:false,
			rowsPerPage:30
		};
	},

})