// Might be useful at some point :
// https://developer.mozilla.org/en/docs/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

var drake; // Draggable object

var setInfo = function(document, msg){
  infoBox = document.getElementById("infoBox");
  infoMsg = document.getElementById("infoMsg");
  if(infoBox!=undefined ){ // check that the box is already rendered
  	infoBox.removeAttribute("hidden");
  	infoMsg.innerHTML = msg;
  }
}

var getStringOptions = function(){
	return "\ncatégorie: "+Session.get("PoolList/Category")+
			" type: "+Session.get("PoolList/Type") +
			" année: "+Session.get("PoolList/Year");
}

var hideSuccessBox = function(document){
	var box = document.getElementById("successBox")
	if(box!=undefined) box.setAttribute("hidden",""); // Hide success message if any
};

/******************************************************************************************************************
											pairsToSplitContainerTemplate
*******************************************************************************************************************/

Template.pairsToSplitContainerTemplate.onRendered(function(){
	// Add the container of this template as a container that can receive draggable objects
  	drake.containers.push(document.querySelector('#pairstosplit'));
});

var splitPairs = function(pairDiv){
	var pairId = pairDiv.id;
	var startingPool = pairDiv.dataset.startingpoolid;

	if(startingPool==undefined){
		console.error("splitPairs : startingpoolid is undefined");
		return;
	}

	var pair = Pairs.findOne({"_id":pairId});

	if(pair==undefined){
		console.error("splitPairs : pair is undefined");
		return;
	}

	/*
		Remove any existing match with that pair
	*/
	Meteor.call("removeAllMatchesWithPair", pairId, function(err, doc){
		if(err){
			console.error("splitPairs/removeAllMatchesWithPair error");
			console.error(err);
		}
	});

	/*
		Make sure that the pool always has a valid leader
	*/
	findNewPoolLeader(startingPool, pair._id);

	/*
		Remove the player 2 from the pair, as well as any tournament match/courts
	*/
	Pairs.update({"_id":pairId}, {$unset:{"player2":"", "tournamentCourts":"", "tournament":""}}, function(err, doc){
		if(err){
			console.error(err);
		}
	});

	/*
		Create a new pair where player1 is the player2 of the pair
	*/
	var newPairId = Pairs.insert({"player1":pair.player2, "day":pair.day, "category":pair.category});

	/*
		Add that newly created pair to the starting pool
	*/
	Meteor.call("updatePool", {"_id":startingPool, "pairs":[newPairId]}, function(err, poolId){
		if(err){
			console.error("splitPairs/updatePool error");
			console.error(err);
		}
	});

	var player1 = Meteor.users.findOne({"_id":pair.player1._id},{"profile":1});
	var player2 = Meteor.users.findOne({"_id":pair.player2._id},{"profile":1});


	Meteor.call("addToModificationsLog",
		{"opType":"Séparation de paire",
		"details":
			"Paire séparée : "+player1.profile.firstName + " "+ player1.profile.lastName +
			 " et " + player2.profile.firstName +" " + player2.profile.lastName + getStringOptions()
		});
}

/******************************************************************************************************************
											mergePlayersContainerTemplate
*******************************************************************************************************************/

Template.mergePlayersContainerTemplate.onRendered(function(){
	// Add the container of this template as a container that can receive draggable objects
  	drake.containers.push(document.querySelector('#mergeplayers'));
});

var mergePlayers = function(document){
	var parent = document.getElementById("mergeplayers");
	var playersToMerge = parent.getElementsByClassName("pairs");
	length = playersToMerge.length;
	if(length==0 || length == 1) return;

	if(length!=2){
		console.error("Can only have 2 players in merge players");
		return;
	}
	type = Session.get("PoolList/Type");
	var pairId1 = playersToMerge[0].id;
	var poolId1 = playersToMerge[0].dataset.startingpoolid;
	var pairId2 = playersToMerge[1].id;
	var poolId2 = playersToMerge[1].dataset.startingpoolid;

	var pair1 = Pairs.findOne({"_id":pairId1});
	var pair2 = Pairs.findOne({"_id":pairId2});

	var player1 = Meteor.users.findOne({"_id":pair1.player1._id},{"profile":1});
	var player2 = Meteor.users.findOne({"_id":pair2.player1._id},{"profile":1});
	/*
		Check compatibility
	*/
	if(type==="men"){
		if( !(player1.profile.gender==="M" && player2.profile.gender==="M") ){
			console.error("Only 2 mens can be together");
			return;
		}
	}
	else if(type==="women"){
		if( !(player1.profile.gender==="F" && player2.profile.gender==="F") ){
			console.error("Only 2 women can be together");
			return;
		}
	}
	else if(type==="mixed"){
		if(player1.profile.gender===player2.profile.gender){
			console.error("Only a man and a woman can be together");
			return;
		}
	}
	else if(type=="family"){
		// TODO
		console.warn("family not yet implemented !");
	}

	// Remove pair2 from pool2
	Pools.update({"_id":poolId2}, {$pull:{"pairs":pairId2}});

	// Add player1 of pair2 to pair1
	Pairs.update({"_id":pairId1}, {$set:{"player2":pair2.player1}});

	// Remove pair2 from the db
	Pairs.remove({"_id":pairId2});

	/*
		Check if this pair is the only eligible pair as pool leader
	*/
	var pool = Pools.findOne({"_id":poolId1},{"leader":1});
	if(pool.leader==undefined){
		Pools.update({_id:poolId1}, {$set:{"leader":pair1.player1._id}});	
	} 

	Meteor.call("addToModificationsLog",
		{"opType":"Fusion de 2 joueurs",
		"details":
			"Joueurs : "+player1.profile.firstName + " "+ player1.profile.lastName +
			 " et " + player2.profile.firstName +" " + player2.profile.lastName +getStringOptions()
		});
}

/******************************************************************************************************************
											Sidebar collapsable Menu
*******************************************************************************************************************/

/*
	Updates the arrow of the collapsable menu
*/
var updateArrow = function(document, info){
	prevInfo = Session.get("PoolList/Selected");
	if(prevInfo!=undefined){
		// 1rst level
		var prevSelected = document.getElementById(prevInfo.type+"_glyphicon_type");
		prevSelected.setAttribute("style","display:none;");
		// 2nd level
		var prevSelected = document.getElementById(prevInfo.type+"_"+prevInfo.category+"_glyphicon_category");
		prevSelected.setAttribute("style","display:none;");
		// 3rd level
		var prevSelected = document.getElementById(prevInfo.type+"_"+prevInfo.category+"_glyphicon_"+ (prevInfo.isPool ? "pool" : "bracket"));
		prevSelected.setAttribute("style","display:none;");
	}

	// 1rst level
	var selected = document.getElementById(info.type+"_glyphicon_type");
	selected.setAttribute("style","display:inline;");
	// 2nd level
	var selected = document.getElementById(info.type+"_"+info.category+"_glyphicon_category");
	selected.setAttribute("style","display:inline;");
	// 3rd level
	var selected = document.getElementById(info.type+"_"+info.category+"_glyphicon_"+ (info.isPool ? "pool" : "bracket"));
	selected.setAttribute("style","display:inline;");

	Session.set("PoolList/Selected", info);
};

/*
	Collapses all menus when a new one is clicked
*/
var collapseMenus = function(document, event){
	info = Session.get("PoolList/Selected");
	if(info==undefined) return;

	var classList = event.classList;
	var id = event.id;
	var typeEvent;
	var type;
	if(classList.contains("collapseType")){
		typeEvent = true;
	}
	else{
		var s = id.split("_");
		type = s[1];
		typeEvent = false; // category event
	}

	menus = document.querySelectorAll("[aria-expanded=true]");
	for(var i=0; i<menus.length;i++){
		var m = menus[i];
		if(typeEvent){
			if(m.id != id){
				m.click();
			}
		}
		else{
			if(m.id != id && m.id != "btn_"+type){
				m.click();
			}
		}
	}
};

/******************************************************************************************************************
											poolList
*******************************************************************************************************************/

var findNewPoolLeader = function(poolId, removedPairId){
	pair = Pairs.findOne({_id:removedPairId});
	prevPool = Pools.findOne({_id:poolId}, {pairs:1, leader:1});

	if(prevPool.leader==undefined || prevPool.leader===pair.player1._id || ((pair.player2==undefined) ? false : prevPool.leader===pair.player2._id)){
		leaderFound = false;
		// Find the first pair in the pool that has 2 players (that is a valid pair) and set player1 as new leader
		for(var j=0;j<prevPool.pairs.length;j++){
			if(prevPool.pairs[j]===removedPairId) continue;
			p = Pairs.findOne({_id:prevPool.pairs[j]});
			if(p.player1 && p.player2 && p.player1._id && p.player2._id){
				Pools.update({_id:poolId}, {$set:{leader:p.player1._id}});
				leaderFound = true;
				break;
			}
		}
		if(!leaderFound){
			// No more valid pair in the pool, remove its leader
			Pools.update({_id:poolId}, {$unset:{leader:""}});
		}
	}
}

// Returns a list of pair moves
var movePairs = function(document){
	var table = document.getElementById("poolTable");
	var cells = table.getElementsByClassName('pairs');

	// Remember which pairs were moved
	moves = {}; // key = newPoolId, value = [{"oldPoolId":<oldPoolId>, "pairId":<pairId>}, ...]

	/**********************************************************************
		Move the pairs to their new pool
	***********************************************************************/

	// Get the pairs and their pools
	for(var i=0, len=cells.length; i<len; i++){
		var category = Session.get('PoolList/Category');
		var type = Session.get('PoolList/Type');
		var year = Session.get('PoolList/Year');

		c = cells[i];

		var pairId = c.id;
		var newPoolId = c.parentNode.id;
		newPoolId = newPoolId.substring(1, newPoolId.length); // Remove css excape character "a"
		var previousPoolId = document.getElementById(pairId).getAttribute("data-startingpoolid");

		if(previousPoolId!=newPoolId){
			/*
				Pair changed position
			*/

			// Add this pair to the list of pairs that moved
			move = {"oldPoolId":previousPoolId, "pairId":pairId};
			if(!moves[newPoolId]){
				moves[newPoolId] = [move]; // Create a new entry
			}
			else{
				moves[newPoolId].push(move);
			}

			// Remove that pair from the previous pool
			Pools.update({_id:previousPoolId},{$pull : {pairs: pairId}});

			/*
				If the pair we moved was a leader, update the new leader of the old pool
			*/
			findNewPoolLeader(previousPoolId, pairId);

			/*
				If this is the only valid pair in the new pool, set the pair as leader of the new pool
			*/
			newPool = Pools.findOne({_id:newPoolId}, {leader:1});

			if(newPool.leader==undefined){
				pair = Pairs.findOne({_id:pairId},{"player1":1});
				Pools.update({_id:newPoolId}, {$set:{leader:pair.player1._id}}); // Set player1 of the pair as new leader
			}

			// Add that pair to the new pool
			Pools.update({_id:newPoolId}, {$push : {pairs: pairId}});

			// Set the new pool id to that pair :
			document.getElementById(pairId).setAttribute("data-startingpoolid", newPoolId);

			pair = Pairs.findOne({"_id":pairId});
			var player1 = Meteor.users.findOne({"_id":pair.player1._id},{"profile":1});
			var player2 = Meteor.users.findOne({"_id":pair.player2._id},{"profile":1});


			Meteor.call("addToModificationsLog",
				{"opType":"Mouvement paire",
				"details":
					"Paire : "+player1.profile.firstName + " "+ player1.profile.lastName +
			 		" et " + player2.profile.firstName +" " + player2.profile.lastName + " de poule " + previousPoolId + " vers poule "+newPoolId +getStringOptions()
				});
		}
	}

	return moves;
}

var deleteAndMoveMatches = function(moves){
	keys = Object.keys(moves);

	/*
	 	For every pool that has new pairs
	*/
	for(var i=0; i<keys.length;i++){
		key = keys[i]; // New pool id
		move = moves[key]; // List of pairs that moved
		/*
			For every pair that moved to that new pool
		*/
		for(var j = 0; j<move.length ;j++){
			pairId = move[j].pairId; // Pair that moved
			prevPoolId = move[j].oldPoolId;	// Pool id from which that pair moved

			// Collect matches of that pool that contain that pair

			data = {"poolId":prevPoolId};
			data[pairId] = {$exists:true};
			matchesWithThatPair = Matches.find(data).fetch();

			/*
				For every match of the previous pool that contains that pair
			*/
			for(var k=0; k<matchesWithThatPair.length;k++){
				match = matchesWithThatPair[k];
				/*
					Test if another pair that moved to the new pool was
					coming from the same old pool (basically if they moved together)
				*/
				found = false;
				// For every pair that also moved to this new pool
				for(var l=j+1 /*Start at the pair after the one we are currently at*/; l<move.length;l++){
					testPair = move[l].pairId;
					// If the other pair from that match is in the same new pool as that pair, move the match
					// (and that they're different--> should always be the case, but just to make sure)
					if(match[testPair]!=undefined && testPair!=pairId){
						/*
							testPair and pairId moved to the same pool together
						*/

						// Update the poolId of the match to be the new pool
						Matches.update({_id:match._id}, {$set:{"poolId":key}});

						// There can only be one match with testPair and pairID --> no need to test the rest
						found = true;
						break;
					}
				}
				if(!found){
					// The pair moved to a new pool without their opponent

					// Remove that match from the db
					Matches.remove({_id:match._id});
				}
			}
		}
	}
}

var getCourtNumbers = function(courts){
			var result = [];

			for(var k=0; k<courts.length;k++){
				var courtsList = courts[k].courtNumber;

				for(var t=0;t<courtsList.length;t++){
					result.push(courtsList[t]);
				}
			}

			return result;
		}

Template.poolList.onRendered(function() {
	// Restore the state of the selects, in case the user wants to come back to this page
	// (usefull when he clicks on scoreboard and presses the back button)
	Session.set("PoolList/ChosenScorePool","");
	Session.set("PoolList/ChosenBrackets","");
});

Template.poolList.events({

	'click .PoolOption' : function(event){
		var type = event.currentTarget.dataset.type;
		var category = event.currentTarget.dataset.category;
		hideSuccessBox(document);
		Session.set('PoolList/Category', category);
		Session.set('PoolList/Type', type);
		Session.set("PoolList/ChosenScorePool","");
		Session.set("PoolList/ChosenBrackets","");

		var info = {"type":type, "category":category, "isPool":true};
		updateArrow(document, info);
	},

	'click .BracketOption' : function(event){
		var type = event.currentTarget.dataset.type;
		var category = event.currentTarget.dataset.category;
		hideSuccessBox(document);
		Session.set('PoolList/Category', category);
		Session.set('PoolList/Type', type);
		Session.set("PoolList/ChosenBrackets","true");
		Session.set("PoolList/ChosenScorePool","");

		var info = {"type":type, "category":category, "isPool":false};
		updateArrow(document, info);
	},

	'click .collapsableMenu' : function(event){
		collapseMenus(document, event.currentTarget);
	},

	'click .Year':function(event){
		hideSuccessBox(document);
		Session.set('PoolList/Year', event.target.value);
		Session.set("PoolList/ChosenScorePool","");
	},

	/*
		Collects the state of the table of pools to save it into the db
	*/
	'click #savePools':function(event){
		/*
			Move the pairs in their new pool
		*/
		moves = movePairs(document);

		/*
			Delete / Move the matches to be consistent with the pair changes !
		*/
		deleteAndMoveMatches(moves);

		/*
			Display success message
		*/
		document.getElementById("successBox").removeAttribute("hidden");
	},

	'click #removePool' : function(event){
		var poolId = event.currentTarget.dataset.poolid;
		var category = Session.get('PoolList/Category');
		var type = Session.get('PoolList/Type');
		var year = Session.get('PoolList/Year');


		pool = Pools.findOne({"_id":poolId}, {"pairs":1});
		pairsToRemove = pool.pairs;

		if(pairsToRemove.length!=0){
			// We need another pool to put these pairs into
			yearData = Years.findOne({"_id":year});
			typeData = Types.findOne({"_id":yearData[type]});
			poolList = typeData[category];

			if(poolList.length==1 && pairsToRemove.length != 0){
				console.error("Can't remove the last pool, there are still single players linked to it");
				return;
			}

			receivingPool = poolList[0]; // Pool that will receive the single players
			Pools.update({"_id":receivingPool}, {$addToSet:{"pairs":{$each:pairsToRemove}}});
		}

		for(var i=0; i<pairsToRemove.length;i++){
			Meteor.call("removeAllMatchesWithPair",pairsToRemove[i]);
			Pairs.update({"_id":pairsToRemove[i]}, {$unset:{"tournament":"", "tournamentCourts":""}});
		}

		Meteor.call('removePool', poolId, year, type, category);
		Meteor.call("addToModificationsLog",
		{"opType":"Retirer poule",
		"details":
			"Poule retirée : "+poolId+getStringOptions()
		});
	},

	'click #addPool':function(event){

		var category = Session.get('PoolList/Category');
		var type = Session.get('PoolList/Type');
		var year = Session.get('PoolList/Year');

		if(! (category&&type&&year)){
			return;
		}

		/*
			Get the year data corresponding to the year selected
		*/
		var yearData = Years.findOne({_id:year},{type:1});

		/*
			Get the type data corresponding to the type selected
		*/
		typeId = yearData[type];
		if(!typeId){
			console.error("That type doesn't exist in the db");
			return;
		}

		/*	Create the new pool	*/
		var newPoolId = Pools.insert({"pairs":[],"type":type});

		var data = {$push:{}}
		data.$push[category] = newPoolId;
		/*	Add that pool to the list of pools of the corresponding type	*/
		Types.update({_id:typeId},data);

		Meteor.call("addToModificationsLog",
		{"opType":"Ajouter poule",
		"details":
			"Poule ajoutée : "+newPoolId+getStringOptions()
		});
	},

	/*
		Assign courts
	*/

	'click #assignCourts':function(event){

		/*
			Return N courts, starting at index start and using a modulo to loop through the array
			nextNumber is the next number to assign to the court if it hasn't a number yet
		*/
		var getNCourts = function(previouscourts, courts, n, start){
			var result = [];

			if(typeof previouscourts === "undefined"){

				for(var k=0; k<n;k++){
					result.push(courts[(start+k) % courts.length]);
				}

			}
			else{
				var l = previouscourts.length-1;

				var strt = 0;

				if(previouscourts.length%2!=0){
					strt=1
				}

				if(previouscourts.length<=n){
					for(var k=0; k<n;k++){
						result.push(previouscourts[l-k]);
					}
				}
				else{
					for(var k=strt; k<n+strt;k++){
						result.push(previouscourts[l-(2*k)]);
					}
				}

				result = result.reverse();

			}

			return result;
		}

		/*
			Return the number of matches to play for this round
		*/

		var getNumberMatches = function(nbrPools,round){

			if(round<0){
				return 0;
			}

			if(round==0 && nbrPools>1 && (nbrPools % 2)!=0){
					nbrPools = nbrPools - 1;
			}
			if(nbrPools>1 && (nbrPools % 2)!=0){
					nbrPools = nbrPools + 1;
			}

			var rem=0;

			for(var k=0;k<round;k++){
				if((nbrPools % 2)==0){
					nbrPools = nbrPools/2 + rem;
					rem = Math.max(rem-1,0);
				}
				else{
					nbrPools = (nbrPools-1)/2;
					rem=1;
				}
			}

			if(round==0 && nbrPools>1){
				if((nbrPools % 2)!=0){
					nbrPools = nbrPools - 1;
				}
			}

			return nbrPools;
		}

		var numberDays = 2;

		var courtsSat = getCourtNumbers(Courts.find({dispoSamedi: true}).fetch());
		var courtsSun = getCourtNumbers(Courts.find({dispoDimanche: true}).fetch());
		var courtsTable = [courtsSat,courtsSun];

		var poolsSat = Pools.find({$or: [{type:"mixed"},{type:"family"}]}).fetch();
		var poolsSun = Pools.find({$or: [{type:"men"},{type:"women"}]}).fetch();
		var poolsTable = [poolsSat,poolsSun];

		////////// Assign courts to pools \\\\\\\\\\

		if(poolsSat.length>courtsSat.length){
			console.error("Assign courts: Not enough courts for saturday morning ("+ (poolsSat.length-courtsSat.length)+" missing)");
			return;
		}

		if(poolsSat.length<courtsSat.length){
			console.log("Assign courts: " + (courtsSat.length-poolsSat.length) + " courts won't be assigned to any pool (Saturday)");
		}

		if(poolsSun.length>courtsSun.length){
			console.error("Assign courts: Not enough courts for sunday morning ("+(poolsSun.length-courtsSun.length) +" missing)");
			return;
		}

		if(poolsSun.length<courtsSun.length){
			console.log("Assign courts: " + (courtsSun.length-poolsSun.length) + " courts won't be assigned to any pool (Sunday)");
		}

		for(var g=0;g<numberDays;g++){

			var pools = poolsTable[g];
			var courts = courtsTable[g];

			for(var i=0;i<pools.length;i++){

				var pool = pools[i];

	        	pool.courtId = courts[i];
	        	Meteor.call('updatePool',pool);

	        	// add court to all the matches in the pool

	        	var matches = Matches.find({"poolId" : pool._id}).fetch();

	        	for(var f=0;f<matches.length;f++){
	        		matches[f].courtId = courts[i];
	        		Meteor.call('updateMatch',matches[f]);
	        	}
			}

		}

		////////// KnockOff Tournament \\\\\\\\\\

		var typesSaturday = ["mixed","family"];
		var typesSunday = ["men","women"];
		var typesTable = [typesSaturday,typesSunday];
		var year = Years.findOne({_id:""+new Date().getFullYear()});
		var start = 0;

		////////// Saturday and Sunday \\\\\\\\\\

		var typesDocs= [];
		
		for(var g=0;g<numberDays;g++){
			typesDocs.push([]);
			var types = typesTable[g];
			for(var k=0;k<types.length;k++){
				if(year[types[k]]){
					var temp = Types.findOne({_id:year[types[k]]});

					if(typeof temp !== "undefined"){
						typesDocs[g].push(temp);
					}
				}
			}
		}

		var finished = false;
		var first = true;
		var round = 0;

		while(!finished){
			finished = true;

			for(var g=0;g<numberDays;g++){

				var typesDoc = typesDocs[g];

				for(var k=0;k<typesDoc.length;k++){

					for(var t=0;t<categoriesKeys.length;t++){

						if(typesDoc[k][categoriesKeys[t]]!=null){
				 			var nameField = categoriesKeys[t]+"Courts";

				 			var nbr = getNumberMatches(typesDoc[k][categoriesKeys[t]].length,round);

				 			if(!first &&typesDoc[k][nameField].length<(2*typesDoc[k][categoriesKeys[t]].length-1)){
				 				typesDoc[k][nameField]=typesDoc[k][nameField].concat(getNCourts(typesDoc[k][nameField],courtsTable[g],nbr,start));
				 				finished=false;
				 			}

				 			if(first){
				 				typesDoc[k][nameField] = getNCourts(undefined, courtsTable[g],nbr,start);
				 				finished = false;
				 			}

				 			start=(start+nbr) % courtsTable[g].length;
				 		}
					}
				}
			}

			start = 0;
			first=false;
			round++;
		}

		for(var g=0;g<numberDays;g++){
			for(var k=0;k<typesDocs[g].length;k++){
				var types = typesDocs[g];
				Meteor.call('updateType',types[k]);
			}
		}
	}
});

Template.poolList.helpers({

	// Returns the number of pools

	'getNumberPools' : function(){
		var pools = Pools.find().fetch();
		return pools.length;
	},

	// Returns the number of courts

	'getNumberCourts' : function(){
		var courts = getCourtNumbers(Courts.find().fetch());
		return courts.length;
	},

	// // Returns a yearData with id year
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

	// Returns a typeData
	'getType' : function(yearData){
		var type = Session.get('PoolList/Type');
		var t = Types.findOne({_id:yearData[type]});

		if(type!=undefined && t==undefined){
			setInfo(document, "Pas de données trouvées pour le type "+ typesTranslate[Session.get("PoolList/Type")] + " de l'année "+Session.get('PoolList/Year'));
		}
		else{
			infoBox =document.getElementById("infoBox");
			if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered
		}

		return t;
	},

	'thereIsNoPool' : function(typeData){
		category = Session.get('PoolList/Category');
		poolList = typeData[category];
		if(poolList==undefined || poolList.length==0 && category!=undefined){
			setInfo(document, "Pas de poules trouvées pour la catégorie " + categoriesTranslate[Session.get("PoolList/Category")]
				+ " du type " + typesTranslate[Session.get("PoolList/Type")]
				+ " de l'année "+Session.get('PoolList/Year'));
			return true;
		}
		else{
			infoBox =document.getElementById("infoBox");
			if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered
			return false;
		}
	},

	// Returns a list of poolData
	'getPools' : function(typeData){
		category = Session.get('PoolList/Category');
		poolIdList = typeData[category];
		poolList = [];

		totalNumberOfPairs = 0;
		totalCompletion = 0;

		const MAXCOLUMNS = 3; // Change this value if needed
		var k = 0;
		var column = [];
		if(poolIdList){
			for(var i=0;i<poolIdList.length;i++){
				pool = Pools.findOne({_id: poolIdList[i]});

				totalNumberOfPairs += pool.pairs==undefined ? 0 : pool.pairs.length;
				poolCompletion = pool.completion;
				totalCompletion += (pool.pairs==undefined ? 0 : pool.pairs.length) * (poolCompletion==undefined ? 0 : poolCompletion);

				if(k>=MAXCOLUMNS){
					poolList.push(column);
					column = [];
					k=0;
				}
				column.push(pool);
				k++;
			}
			if(column.length>0){
				poolList.push(column);
			}
		}

		var completion = (totalNumberOfPairs==0) ? 0 : totalCompletion/totalNumberOfPairs;

		if(totalNumberOfPairs!=0){
			var str = "completion.pools.".concat(category);
			updateData = {};
			updateData[str] = completion
			Types.update({_id:typeData._id},{$set:updateData});
		}
		return poolList;
	},

	'getArrayLength' : function(array){
		return array.length;
	},

	'getRemovePool' : function(){
		return {"_id":"toRemove", "pairs":[]}
	},

	'getChosenScorePool' : function(){
		poolId = Session.get("PoolList/ChosenScorePool")
		if(poolId!=""){
			return {_id:poolId};
		}
		else return "";
	},

	'chosenBrackets' : function(){
		return Session.get("PoolList/ChosenBrackets");
	},

	/*
		Initializes the draggable interface
	*/
	'resetDrake' : function(){
		drake = dragula(
			{
				/*	Defines what can be moved/dragged	*/
				moves : function(el, source, handle, sibling) {
					var isPairModal = (' ' + el.className + ' ').indexOf(' pairInfoModal ') > -1;
		    		if(isPairModal){
		    			// The modal must not be draggable
		    			return false;
		    		}
		    		return true; // All other elements are draggable
		  		},
		  		accepts: function (el, target, source, sibling) {
		    		var isToPoule = (' ' + target.className + ' ').indexOf(' poule ') > -1;
		    		var isToAlone = target.id==="alonepairs";
		    		var isToSplit = target.id==="pairstosplit";
		    		var isToMerge = target.id==="mergeplayers";

		    		var isFromPoule = (' ' + source.className + ' ').indexOf(' poule ') > -1;
		    		var isFromAlone = source.id==="alonepairs";
		    		var isFromSplit = source.id==="pairstosplit";
		    		var isFromMerge = source.id==="mergeplayers";

		    		if(isFromPoule && (isToAlone || isToMerge)) return false;
		    		if(isFromAlone && (isToPoule || isToSplit)) return false;
		    		if(isFromSplit && (isToAlone || isToMerge)) return false;
		    		if(isFromMerge && (isToPoule || isToSplit)) return false;
		    		if(isToMerge && target.children.length>=2) return false;
		    		return true;
  				},
			}
		).on('drag', function (el) {
			hideSuccessBox(document);
  		  	el.className = el.className.replace('ex-moved', '');
	  	}).on('drop', function (el, target, source, sibling) {
	  		if(target.id==="pairstosplit"){
	  			splitPairs(el);
	  		}
	  		else if(target.id==="mergeplayers" && target.getElementsByClassName("pairs").length==2){
	  			mergePlayers(document);
	  		}
	    	el.className += ' ex-moved';
	  	}).on('over', function (el, container) {
	    	container.className += ' ex-over';
	  	}).on('out', function (el, container) {
	  		if(container!=null) container.className = container.className.replace('ex-over', '');
	 	});
	}

});

/******************************************************************************************************************
											alonePairsContainerTemplate
*******************************************************************************************************************/

Template.alonePairsContainerTemplate.onRendered(function(){
	// Add the container of this template as a container that can receive draggable objects
  	drake.containers.push(document.querySelector('#alonepairs'));
});

var hasBothPlayers = function(pair){
	return (pair!=undefined) && pair.player1!=undefined && pair.player2 !=undefined;
}

Template.alonePairsContainerTemplate.helpers({
	'getAlonePairs' : function(typeData){
		category = Session.get('PoolList/Category');
		poolIdList = typeData[category];
		poolList = [];
		if(poolIdList){
			for(var i=0;i<poolIdList.length;i++){
				pool = Pools.findOne({"_id": poolIdList[i]});
				if(pool==undefined) continue;
				for(var j=0; j<pool.pairs.length;j++){
					var pair = Pairs.findOne({"_id":pool.pairs[j]});
					if(!hasBothPlayers(pair)){
						poolList.push({"pair":pair, "startingPoolId":pool._id});
					}
				}
			}
		}
		return poolList;
	},

	'getColor' : function(player){
		if(player.wish || player.constraint){
			return 'orange';
		}
	},

	'getPlayer' : function(playerId){
		if(playerId==undefined) return undefined;
		return Meteor.users.findOne({_id:playerId});
	},
});

/******************************************************************************************************************
											poolItem
*******************************************************************************************************************/

Template.poolItem.helpers({
	'getPlayer' : function(playerId){
		return Meteor.users.findOne({_id:playerId});
	},

	'getPair' : function(pairId, poolId) {
		var pair = Pairs.findOne({_id:pairId})
		if(!pair) return undefined;

		// Add this pair to the list of alone pairs, if this pair is not full
		if(!hasBothPlayers(pair)){
			return undefined;
		}
		return pair;
	},

	'getColor' : function(player){
		if(player.wish || player.constraint){
			return 'orange';
		}
	}
});

/******************************************************************************************************************
											poolContainerTemplate
*******************************************************************************************************************/

Template.poolContainerTemplate.onRendered(function(){
	doc = document.querySelector('#a'+this.data.POOL._id);
  	drake.containers.push(doc); // Make the id this.data.ID draggable
});

Template.poolContainerTemplate.helpers({
	'moreThanOnePair' : function(pairs){
		for(var i=0;i<pairs.length;i++){
			pair = Pairs.findOne({"_id":pairs[i]});
			if(hasBothPlayers(pair)) return true;
		}
		return false;
	},
  'getStreet' : function(courtId){
      if(courtId ==undefined){
        return "Pas de terrain assigné";
      }
      else{
        var court = Courts.findOne({"courtNumber":pool.courtId});
        if(court.addressID==undefined){
          return "";
        }
        else{
          var address = Addresses.findOne({_id:court.addressID});
          if(address == undefined){
            return "";
          }
          else{
            return address.street+" "+address.number;
          }}}
  },
  'getTown' : function(courtId){
      if(courtId ==undefined){
        return "";
      }
      else{
        var court = Courts.findOne({"courtNumber":pool.courtId});
        if(court.addressID==undefined){
          return "";
        }
        else{
          var address = Addresses.findOne({_id:court.addressID});
          if(address == undefined){
            return "";
          }
          else{
            return address.zipCode+" "+address.city;
          }}}
  },
  'hasCourt' : function(address){
    if (address==undefined) {
      return true;
    }
    else{
      return false;
    }
  }
});

Template.poolContainerTemplate.events({
	'click .scoreButton' : function(event){
		Session.set("PoolList/ChosenScorePool", event.currentTarget.dataset.poolid);
	},
});

/******************************************************************************************************************
											CategorySelect
*******************************************************************************************************************/

Template.CategorySelect.helpers({
	'getTypeCompletion' : function(type){
		year = Session.get("PoolList/Year");
		yearSearchData = {};
		yearSearchData[type] = 1;
		yearData = Years.findOne({"_id":year}, yearSearchData);
		typeId = yearData[type];
		typeData = Types.findOne({"_id":typeId},{"completion":1});
		if(typeData==undefined || typeData.completion==undefined) return "(?)";

		typeCompletion = 0;
		nonEmptyCat = 0;

		var completionData = typeData["completion"];
		if(completionData==undefined) return "(?)";

		for(var i=0; i<categoriesKeys.length;i++){
			var cPools = completionData["pools"][categoriesKeys[i]];
			if(cPools!=undefined){
				nonEmptyCat+=2;
				typeCompletion += cPools;
			}
			if(completionData["brackets"]!=undefined){
				var cBrackets = completionData["brackets"][categoriesKeys[i]];
				if(cBrackets!=undefined){
					typeCompletion += cBrackets;
				}
			}
		}

		completion = (nonEmptyCat==0) ? 0 : typeCompletion/nonEmptyCat;

		var perc = completion*100;
		var toReturn = "("+perc.toFixed(0)+"%)";
		return toReturn;
	},

	'getCategories' : function(){
		var toReturn = [];
		for(var i=0;i<categoriesKeys.length;i++){
			key = categoriesKeys[i];
			toReturn.push({"key":key, "value":categoriesTranslate[key]});
		}

		return toReturn;
	}
});

/******************************************************************************************************************
											poolBracketsSelect
*******************************************************************************************************************/

var formatPerc = function(perc){
	return "("+perc.toFixed(0)+"%)";
}

Template.poolBracketsSelect.helpers({
	'getBracketCompletion' : function(type, category){
		year = Session.get("PoolList/Year");
		yearSearchData = {};
		yearSearchData[type] = 1;
		yearData = Years.findOne({"_id":year}, yearSearchData);
		typeId = yearData[type];
		typeData = Types.findOne({"_id":typeId},{"completion.brackets":1});
		if(typeData==undefined || typeData.completion==undefined || typeData.completion.brackets==undefined || typeData.completion.brackets[category]==undefined) return "(?)";
		var perc = typeData.completion.brackets[category]*100;
		return formatPerc(perc);
	},

	'getPoulesCompletion' : function(type, category){
		year = Session.get("PoolList/Year");
		yearSearchData = {};
		yearSearchData[type] = 1;
		yearData = Years.findOne({"_id":year}, yearSearchData);
		typeId = yearData[type];
		typeData = Types.findOne({"_id":typeId},{"completion.pools":1});
		if(typeData==undefined || typeData.completion==undefined || typeData.completion.pools==undefined || typeData.completion.pools[category]==undefined) return "(?)";
		var perc = typeData.completion.pools[category]*100;
		return formatPerc(perc);
	},

	'getCategoryCompletion' : function(type, category){
		year = Session.get("PoolList/Year");
		yearSearchData = {};
		yearSearchData[type] = 1;
		yearData = Years.findOne({"_id":year}, yearSearchData);
		typeId = yearData[type];

		searchData = {};
		searchData["completion.pools.".concat(category)] = 1;
		searchData["completion.brackets.".concat(category)] = 1;
		typeData = Types.findOne({"_id":typeId},searchData);
		if(typeData==undefined || typeData.completion==undefined || typeData.completion.pools==undefined || typeData.completion.pools[category]==undefined) return "(?)";
		cPool = typeData.completion.pools[category];
		cBrackets = 0;
		if(typeData.completion.brackets!=undefined) cBrackets = (typeData.completion.brackets[category]==undefined) ? 0 : typeData.completion.brackets[category];
		var completion = (cBrackets + cPool)/2
		var perc = completion*100;
		return formatPerc(perc);
	}
})

/******************************************************************************************************************
											modalItem
*******************************************************************************************************************/

Template.modalItem.helpers({
	'getAvailableTypes':function(pairId, poolId, sex){
		var toReturn = [];
		var type = Session.get("PoolList/Type");

		gender = sex==='F' ? "women" : "men";

		for(var i=0; i<typeKeys.length;i++){
			var key = typeKeys[i];
			var selected = type===key ? true : false;
			if( type!==key && ((key==="women" && gender==="women") || (key==="men"&&gender==="men") || key==="family" || key=="mixed")){

				if(key!=="family"){
					toReturn.push({"key":key, "value":typesTranslate[key], "selected":selected, "pairId":pairId, "poolId":poolId});
				}
				else{
					// TODO, implement family !!!
				}
			}
		}
		return toReturn;
	},
});

Template.modalItem.events({
	'click .typeChosing' :function(event){
		// Remove this pair from the pool (pair is alone)
		Pools.update({"_id":this.poolId},{"$pull":{"pairs":this.pairId}});

		type = this.key;
		dateMatch = undefined;
		if(type==="women" || type==="men"){
			dateMatch="sunday";
		}
		else if(type==="mixed"){
			dateMatch = "saturday";
		}
		else if(type==="family"){
			dateMatch = "family";
		}

		year = Session.get("PoolList/Year");

		// Add the pair to the new type:
		Meteor.call("addPairToTournament",this.pairId, year, dateMatch);
		$('#pairModal'+this.pairId).modal('hide');
	},

	'click .setLeader':function(event){
		target = event.currentTarget;
		poolId = target.dataset.poolid;
		playerId = target.dataset.player;
		pool = Pools.update({_id:poolId},{$set:{"leader":playerId}});
	}
})
