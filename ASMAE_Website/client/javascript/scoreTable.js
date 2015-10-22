Template.scoreTable.helpers({

	// Returns a list of pairs
	'getPairs' : function(poolId){
		var pairList = [];
		var pool = Pools.findOne({_id:poolId});
		for(var i=0;i<pool.pairs.length;i++){
			var pair = Pairs.findOne({_id:pool.pairs[i]});
			if(pair.player1 && pair.player2) pairList.push(pair);
		}
		return pairList;
	},

	'getPlayer' : function(userId){
		var res = Meteor.users.findOne({_id:userId},{profile:1});
		return res;
	},

	'equals' : function(x, y){
		return x==y;
	},

	'getMatch' : function(pair1, pair2){
		var poolId = this._id;

		// TODO
		// var match = Pools.findOne(
		// 	{
		// 		"_id":poolId, 
		// 		"matchs":
		// 			{
		// 				"$or":
		// 					[
		// 						"$elemMatch" :  
		// 							{
		// 								{
		// 									"$and" : [{"pair1":pair1}, {"pair2":pair2}]
		// 							 	},
		// 							 	{
		// 							 		"$and" : [{"pair1":pair2}, {"pair2":pair1}]
		// 							 	}
		// 							}
		// 					]
		// 			}
		// 	}
		// );

		// if(!match){
		// 	// Create new match and return it TODO
		// 	console.log("create new match");
		// }
		// else{
		// 	// Return this match
		// 	return match;
		// }

	}

});

Template.scoreTable.events({
	'click #save' : function(event){
		var points = document.getElementsByClassName("points");
		var poolId = this._id; // "this" is the parameter of the template
		for(var i=0; i<points.length;i++){
			var score = points[i].value;
			//TODO
			console.log(points[i]);
		}
	}
});