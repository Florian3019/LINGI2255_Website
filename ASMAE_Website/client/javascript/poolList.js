// Might be useful at some point :
// https://developer.mozilla.org/en/docs/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

var drake; // Draggable object


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
		var category = Session.get('PoolCategory');
		var type = Session.get('PoolType');
		var year = Session.get('Year');

		c = cells[i];

		var pairId = c.id;
		var newPoolId = c.parentNode.id;
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
			prevPool = Pools.findOne({_id:previousPoolId}, {pairs:1, leader:1});
			
			leaderFound = false;
			if(prevPool.leader==undefined || prevPool.leader==pairId){
				// Find the first pair in the pool that has 2 players (that is a valid pair) and set it as new leader
				for(var j=0;j<prevPool.pairs.length;j++){
					p = Pairs.findOne({_id:prevPool.pairs[j]});
					if(p.player1 && p.player2 && p.player1._id && p.player2._id){
						Pools.update({_id:previousPoolId}, {$set:{leader:p._id}});
						leaderFound = true;
						break;
					}
				}
				if(!leaderFound){
					// No more valid pair in the pool, remove its leader
					Pools.update({_id:previousPoolId}, {$unset:{leader:""}});
				}
			}
			
			/*
				If this is the only valid pair in the new pool, set the pair as leader of the new pool
			*/
			newPool = Pools.findOne({_id:newPoolId}, {leader:1});

			if(newPool.leader==undefined){
				Pools.update({_id:newPoolId}, {$set:{leader:pairId}});
			}

			// Add that pair to the new pool
			Pools.update({_id:newPoolId}, {$push : {pairs: pairId}});

			// Set the new pool id to that pair :
			document.getElementById(pairId).setAttribute("data-startingpoolid", newPoolId);
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

var removeUnwantedPairs = function(document){
	var allTables = document.getElementById("allTables");
	var columnPairToRemove = allTables.rows[0];
	var pairsToRemove = columnPairToRemove.cells[1].getElementsByClassName('pairs');

	for(var i=0;i<pairsToRemove.length;i++){
		var pairId = pairsToRemove[i].id;
		var poolId = document.getElementById(pairId).getAttribute("data-startingpoolid"); // The pair's pool id

		// Remove that pair from its pool
		Pools.update({_id:poolId},{$pull : {pairs: pairId}});
		data = {};
		data[pairId] = {$exists:true};
		matchsToRemove = Matches.find(data).fetch();

		// Remove all matches in which this pair exists
		for(var j=0; j<matchsToRemove.length;j++){
			m = matchsToRemove[j];
			Matches.remove({_id:m._id});
		}

		// Remove that pair from the db
		Pairs.remove({_id:pairId});
	}
}

var setInfo = function(document, msg){
  infoBox = document.getElementById("infoBox");
  infoMsg = document.getElementById("infoMsg");
  if(infoBox!=undefined ){ // check that the box is already rendered
  	infoBox.removeAttribute("hidden");
  	infoMsg.innerHTML = msg;
  }
}

function getSelectedText(document, elementId) {
    var elt = document.getElementById(elementId);

    if (elt.selectedIndex == -1)
        return null;

    return elt.options[elt.selectedIndex].text;
}

Template.poolList.helpers({

	// // Returns a yearData with id year
	'getYear' : function(){
		var year = Session.get('Year');
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
		var type = Session.get('PoolType');
		var t = Types.findOne({_id:yearData[type]});

		if(type!=undefined && t==undefined){
			setInfo(document, "Pas de données trouvées pour le type "+ getSelectedText(document, "PoolType") + " de l'année "+Session.get('Year'));
		}
		else{
			infoBox =document.getElementById("infoBox");
			if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered
		}

		return t;
	},

	// Returns a list of poolData
	'getPools' : function(typeData){
		category = Session.get('PoolCategory');
		poolIdList = typeData[category];
		poolList = [];
		
		const MAXCOLUMNS = 3; // Change this value if needed
		var k = 0;
		var column = [];
		if(poolIdList){
			for(var i=0;i<poolIdList.length;i++){
				pool = Pools.findOne({_id: poolIdList[i]});
				
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

		if(poolList.length==0 && category!=undefined){
			setInfo(document, "Pas de poules trouvées pour la catégorie " + getSelectedText(document, "PoolCategory")
				+ " du type " + getSelectedText(document, "PoolType") 
				+ " de l'année "+Session.get('Year'));
		}
		else{
			infoBox =document.getElementById("infoBox");
			if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered
		}

		return poolList;
	},

	'getArrayLength' : function(array){
		return array.length;
	},

	'getRemovePool' : function(){
		return {"_id":"toRemove", "pairs":[]}
	},

	/*
		Initializes the draggable interface
	*/
	'resetDrake' : function(){
		drake = dragula(
			{	
				/*	Defines what can be moved/dragged	*/
				moves : function(el, source, handle, sibling) {
		    		var isPairModal = (' ' + el.className + ' ').indexOf(' pairInfoModal ') > -1
		    		if(isPairModal){
		    			// The modal must not be draggable
		    			return false;
		    		}
		    		return true; // All other elements are draggable
		  		}
			}
		).on('drag', function (el) {
			document.getElementById("successBox").setAttribute("hidden",""); // Hide success message if any
  		  	el.className = el.className.replace('ex-moved', '');
	  	}).on('drop', function (el) {
	    	el.className += ' ex-moved';
	  	}).on('over', function (el, container) {
	    	container.className += ' ex-over';
	  	}).on('out', function (el, container) {
	  		if(container!=null) container.className = container.className.replace('ex-over', '');
	 	});
	}

});

Template.pairsToRemoveContainerTemplate.onRendered(function(){
	// Add the container of this template as a container that can receive draggable objects
  	drake.containers.push(document.querySelector('#pairstoremove'));
});

Template.poolList.onRendered(function() {
	// Restore the state of the selects, in case the user wants to come back to this page 
	// (usefull when he clicks on scoreboard and presses the back button)
	document.getElementById("PoolCategory").value = Session.get('PoolCategory') ? Session.get('PoolCategory') : "";
	document.getElementById("PoolType").value = Session.get('PoolType') ? Session.get('PoolType') : "";
	document.getElementById("Year").value = Session.get('Year') ? Session.get('Year') : "";
});

Template.poolList.events({
	'click .PoolType':function(event){
		document.getElementById("successBox").setAttribute("hidden",""); // Hide success message if any
		Session.set('PoolType', event.target.value);
	},
	'click .PoolCategory':function(event){
		document.getElementById("successBox").setAttribute("hidden",""); // Hide success message if any
		Session.set('PoolCategory', event.target.value);
	},
	'click .Year':function(event){
		document.getElementById("successBox").setAttribute("hidden",""); // Hide success message if any
		Session.set('Year', event.target.value);
	},

	/*
		Collects the state of the table of pools to save it into the db
	*/
	'click #save':function(event){
		/*
			Move the pairs in their new pool
		*/
		moves = movePairs(document);
		
		/*
			Delete / Move the matches to be consistent with the pair changes !
		*/
		deleteAndMoveMatches(moves);

		/*
			Remove from the db unwanted pairs
		*/
		removeUnwantedPairs(document);

		/*
			Display success message
		*/
		document.getElementById("successBox").removeAttribute("hidden");
	},

	'click #removePool' : function(event){
		var poolId = event.currentTarget.dataset.poolid;
		var category = Session.get('PoolCategory');
		var type = Session.get('PoolType');
		var year = Session.get('Year');
		/*
			Move the pairs from that pool in the 'to remove pairs'
		*/
		// Start by finding the pool container of the pool we'd like to remove, and take the pairs inside it
		var pairsToRemove = document.getElementById(poolId).children;
		if(pairsToRemove.length != 0){
			console.error("Can't remove a pool that is not empty");
			return;
		}

		Meteor.call('removePool', poolId, year, type, category);
	},

	'click #addPool':function(event){
		var category = Session.get('PoolCategory');
		var type = Session.get('PoolType');
		var year = Session.get('Year');

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
		var newPoolId = Pools.insert({"pairs":[]});
		var data = {$push:{}}
		data.$push[category] = newPoolId;
		/*	Add that pool to the list of pools of the corresponding type	*/
		Types.update({_id:typeId},data);
	}
});

Template.poolItem.helpers({
	'getPlayer' : function(playerId){
		return Meteor.users.findOne({_id:playerId});
	},

	'getModalId' : function(){
		return '#pairModal'+this._id;
	},

	'getModalPureId' : function(){
		return 'pairModal' + this._id;
	},

	'getPair' : function(pairId) {
		var pair = Pairs.findOne({_id:pairId})
		if(!pair) return undefined;
		return (pair.player1 && pair.player2) ? pair : undefined;
	},

	'getColor' : function(player){
		if(player.wish || player.constraint){
			return 'orange';
		}
	}
});

Template.poolContainerTemplate.onRendered(function(){
  	drake.containers.push(document.querySelector('#'+this.data.POOL._id)); // Make the id this.data.ID draggable 
});

Template.poolContainerTemplate.helpers({
	'moreThanOnePair' : function(pairs){
		return pairs.length>0;
	}
});