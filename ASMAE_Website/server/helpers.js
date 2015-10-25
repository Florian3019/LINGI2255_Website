Meteor.methods({



		// {
		// 	_id:<id>
		// 	pair1:<pairID>,
		// 	pair2:<pairID>,
		// 	result:{
		// 			pair1Points:<points>,
		// 			pair2Points:<points>
		// 			},
		// 	court:<courtID>
		// }


		// 	[
		// 		[
		// 			[ {"name" : "Erik Zettersten", "id" : "erik-zettersten", "seed" : 1, "displaySeed": "1", "score" : 47 }, {"name" : "Andrew Miller", "id" : "andrew-miller", "seed" : 2, "score" : 30} ],
		// 			[ {"name" : "James Coutry", "id" : "james-coutry", "seed" : 3, "score" : 10}, {"name" : "Sam Merrill", "id" : "sam-merrill", "seed" : 4, "score":8}],
		// 			[ {"name" : "Anothy Hopkins", "id" : "anthony-hopkins", "seed" : 5}, {"name" : "Everett Zettersten", "id" : "everett-zettersten", "seed" : 6} ],
		// 			[ {"name" : "John Scott", "id" : "john-scott", "seed" : 7}, {"name" : "Teddy Koufus", "id" : "teddy-koufus", "seed" : 8}],
		// 			[ {"name" : "Arnold Palmer", "id" : "arnold-palmer", "seed" : 9}, {"name" : "Ryan Anderson", "id" : "ryan-anderson", "seed" : 10} ],
		// 			[ {"name" : "Jesse James", "id" : "jesse-james", "seed" : 1}, {"name" : "Scott Anderson", "id" : "scott-anderson", "seed" : 12}],
		// 			[ {"name" : "Josh Groben", "id" : "josh-groben", "seed" : 13}, {"name" : "Sammy Zettersten", "id" : "sammy-zettersten", "seed" : 14} ],
		// 			[ {"name" : "Jake Coutry", "id" : "jake-coutry", "seed" : 15}, {"name" : "Spencer Zettersten", "id" : "spencer-zettersten", "seed" : 16}]
		// 		],
		// 		[
		// 			[ {"name" : "Erik Zettersten", "id" : "erik-zettersten", "seed" : 1}, {"name" : "James Coutry", "id" : "james-coutry", "seed" : 3} ],
		// 			[ {"name" : "Anothy Hopkins", "id" : "anthony-hopkins", "seed" : 5}, {"name" : "Teddy Koufus", "id" : "teddy-koufus", "seed" : 8} ],
		// 			[ {"name" : "Ryan Anderson", "id" : "ryan-anderson", "seed" : 10}, {"name" : "Scott Anderson", "id" : "scott-anderson", "seed" : 12} ],
		// 			[ {"name" : "Sammy Zettersten", "id" : "sammy-zettersten", "seed" : 14}, {"name" : "Jake Coutry", "id" : "jake-coutry", "seed" : 15} ]
		// 		],
		// 		[
		// 			[ {"name" : "Erik Zettersten", "id" : "erik-zettersten", "seed" : 1}, {"name" : "Anothy Hopkins", "id" : "anthony-hopkins", "seed" : 5} ],
		// 			[ {"name" : "Ryan Anderson", "id" : "ryan-anderson", "seed" : 10}, {"name" : "Sammy Zettersten", "id" : "sammy-zettersten", "seed" : 14} ]
		// 		],
		// 		[
		// 			[ {"name" : "Erik Zettersten", "id" : "erik-zettersten", "seed" : 1}, {"name" : "Ryan Anderson", "id" : "ryan-anderson", "seed" : 10} ]
		// 		],
		// 		[
		// 			[ {"name" : "Erik Zettersten", "id" : "erik-zettersten", "seed" : 1} ]
		// 		]
		// 	];


	// Returns a table of pools corresponding to the table of pool ids (poolIDList)
	'getPoolList' : function(poolIdList){
		list = [];
		for(var i=0;i<poolIdList.length;i++){
			list.push(Pools.findOne({_id:poolIdList[i]}));
		}
	},

	/**
	*	@param year : year for which the brackets must be made
	*	@param matchType : one of mixed,men,women,family
	* 	@param category : preminimes, minimes, cadets, scholars, juniors, seniors or elites
	*/
	'makeBrackets' : function(year, matchType, category){

		var yearData = Years.findOne({_id:year});
		var typeId = yearData.matchType;

		var typeData = Types.findOne({_id:typeId});
		var poolIdList = typeData.category;

		var poolList = Meteor.call('getPoolList', poolIdList);

		var winners = []; // Contains the pairs selected to play during the afternoon

		// Go through all pools of that type and that category
		for(var i=0;i<poolList.length;i++){

			var results = {}; // Key : <pairId>, value : <total match points>

			/*
				For each pool, go through all the matches
			*/
			var pairMatch = poolList[i].match;
			for(var j=0; j<pairMatch.length;j++){
				/*
					For each pair in the match, add that pair's points to its total points won on all matches
				*/

				// If the pair has already been added to the list of results, increment its score, otherwise just set its new score.
				results[pairMatch.pair1] = results[pairMatch.pair1] ? results[pairMatch.pair1]+pairMatch["result.pair1Points"] : pairMatch["result.pair1Points"];
				results[pairMatch.pair2] = results[pairMatch.pair2] ? results[pairMatch.pair2]+pairMatch["result.pair2Points"] : pairMatch["result.pair2Points"];
			}

			/*
				Convert the result object to an array, so that we can sort it
			*/
			var sortable = [];
			for (var pair in results) {
				if (p.hasOwnProperty(pair)) { // Check that pair is really a key of results, and not coming from the prototype
			    	sortable.push({"pair":pair, "points":results[pair]});
			  	}
			}

			/*
				Sort by descending order based on the pair's result
			*/
			sortable.sort(function(a,b){
				// a is before b
				if(a.points > b.points){
					return -1;
				}
				// a is after b
				if(a.points < b.points){
					return 1;
				}
				// points of a are equal to points of b, thus best pair is the one who won against the other (since no egality in a match is allowed)
				if(results[a.pair] > results[b.pair]){
					// a has more points than b, so a must be before b
					return -1;
				}
				// a lost against b, so a is after b
				return 1;
			});



			// Select the best SELECTED pairs of this pool to play during the afternoon
			const SELECTED = 2; // Number of pairs to select per pool
			for (var i=0; i<SELECTED && i<sortable.length; i++){
				winners.push(sortable[i]);
			}
		} // end for each pool


		/*
			Make the brackets
			An element of the bracket is as follows :
			{
				"name":<name>,
				"id":<id>,
				"seed":<seed>,
				"displaySeed":<displaySeed>,
				"score":<score>,
			}
		*/
		var winnerMatchList = [];
		var firstRound = [];
		/*
			Just generate the first round
		*/
		for(var i=0;i<winners.length;i++){
			var pairData = Pairs.findOne({_id : winners[i]});
			var player1Data = Meteor.users.findOne({_id : pairData.player1._id});
			var player2Data = Meteor.users.findOne({_id : pairData.player2._id});

			// var pairData = {
			// 	"name":

			// };

			firstRound.push([]);
		}

		winnerMatchList.push(firstRound);

		return winnerMatchList;


	}
















});
