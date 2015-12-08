/*
	This file defines how the pools can be managed.
	It defines helpers for:
		-> The pairs to split container
		-> The merge player container
		-> The side bar collapsable menu
		-> The pair info modal
		-> The draggable items
		-> The draggable containers
		-> Equilbrate the pools
*/


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
	return " dans "+typesTranslate[Session.get("PoolList/Type")]+">"+
			categoriesTranslate[Session.get("PoolList/Category")]+
			" (" + Session.get("PoolList/Year")+")";
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
			player1.profile.firstName + " "+ player1.profile.lastName +
			 " et " + player2.profile.firstName +" " + player2.profile.lastName + getStringOptions()
		},
		function(err, logId){
			if(err){
				console.log(err);
				return;
			}
			Meteor.call('addToUserLog', player1._id, logId);
			Meteor.call('addToUserLog', player2._id, logId);
		});
}

/******************************************************************************************************************
											mergePlayersContainerTemplate
*******************************************************************************************************************/

Template.mergePlayersContainerTemplate.onRendered(function(){
	// Add the container of this template as a container that can receive draggable objects
  	drake.containers.push(document.querySelector('#mergeplayers'));
});

Template.mergePlayersContainerTemplate.events({
	'click .close':function(event){
		document.getElementById("mergeErrorBox").style.display = "none";
	}
})

/*
	Merges two players that are in the merge container. Returns true on success, false otherwise
*/
var mergePlayers = function(document){
	var parent = document.getElementById("mergeplayers");
	var playersToMerge = parent.getElementsByClassName("pairs");
	length = playersToMerge.length;
	if(length==0 || length == 1) return;

	if(length!=2){
		console.error("Can only have 2 players in merge players");
		return false;
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

	mergeErrorBox = document.getElementById("mergeErrorBox");
	mergeErrorMessage = document.getElementById("mergeErrorMessage");
	/*
		Check compatibility
	*/
	if(type==="men"){
		if( !(player1.profile.gender==="M" && player2.profile.gender==="M") ){
			console.error("Only 2 mens can be together");
			mergeErrorBox.style.display = "block";
			mergeErrorMessage.innerHTML = "Seulement 2 hommes peuvent jouer ensemble !";
			return false;
		}
	}
	else if(type==="women"){
		if( !(player1.profile.gender==="F" && player2.profile.gender==="F") ){
			console.error("Only 2 women can be together");
			mergeErrorBox.style.display = "block";
			mergeErrorMessage.innerHTML = "Seulement 2 femmes peuvent jouer ensemble !";
			return false;
		}
	}
	else if(type==="mixed"){
		if(player1.profile.gender===player2.profile.gender){
			console.error("Only a man and a woman can be together");
			mergeErrorBox.style.display = "block";
			mergeErrorMessage.innerHTML = "Seulement un homme et une femme peuvent jouer ensemble !";
			return false;
		}
	}
	else if(type=="family"){
		if(!acceptPairForFamily(player1.profile.birthDate, player2.profile.birthDate)){ //(method in constants)
			console.error("These players can't play together for the family tournament !");
			mergeErrorBox.style.display = "block";
			mergeErrorMessage.innerHTML = "Ces deux joueurs n'ont pas le bon age pour jouer ensemble !";
			return false;
		}
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
			player1.profile.firstName + " "+ player1.profile.lastName +
			 " et " + player2.profile.firstName +" " + player2.profile.lastName +getStringOptions()
		},
		function(err, logId){
			if(err){
				console.log(err);
				return;
			}
			Meteor.call('addToUserLog', player1._id, logId);
			Meteor.call('addToUserLog', player2._id, logId);
		}
	);
	return true;
}

/******************************************************************************************************************
											Sidebar collapsable Menu
*******************************************************************************************************************/

Template.poolsSidebarCollapsableMenu.onRendered(function(){
    var c = GlobalValues.findOne({_id:"currentYear"});
    if(c===undefined) return;
    var currentYear = c.value;
    hideSuccessBox(document);
    Session.set('PoolList/Year', currentYear);
});

Template.poolsSidebarCollapsableMenu.helpers({

    'selectedYear': function(optionYear){
        var c = GlobalValues.findOne({_id:"currentYear"});

        var currentYear = c===undefined? undefined : c.value;
        return optionYear == currentYear ? 'selected' : '';
    },

	'getAllYears':function(){
		var callBack = function(err, ret){
			Session.set("PoolList/allYears", ret);
		}
		Meteor.call("getAllYears", callBack);
	},

	'getAllYearsSession':function(){
		return Session.get("PoolList/allYears");
	},


	// Returns a yearData with id year (copy of the same function in poolList.helpers)
	'getYear' : function(){
		return getYearFunct(document);
	},
});

var resetSessionVar = function(){
	Session.set("PoolList/ChosenScorePool","");
	Session.set("PoolList/ChosenCourt","");
    Session.set("selectNewCourt/saturday","Ignore");
    Session.set("selectNewCourt/sunday","Ignore");
    Session.set("selectNewCourt/staffOK","Ignore");
    Session.set("selectNewCourt/ownerOK","Ignore");
    Session.set("changeCourtsBracket","false");
    Session.set("brackets/buildingTournament",false);
}

Template.poolsSidebarCollapsableMenu.events({
	'click .PoolOption' : function(event){
		var type = event.currentTarget.dataset.type;
		var category = event.currentTarget.dataset.category;
		hideSuccessBox(document);
		Session.set('PoolList/Category', category);
		if(category==="all"){
			type="family";
		}
		Session.set('PoolList/Type', type);
		Session.set("PoolList/ChosenBrackets","");
		
		resetSessionVar();

		// Hide previous error message, if any
		mergeErrorBox = document.getElementById("mergeErrorBox");
		if(mergeErrorBox!=null && mergeErrorBox != undefined) mergeErrorBox.style.display = "none";

		var info = {"type":type, "category":category, "isPool":true};
		updateArrow(document, info);
	},

	'click .BracketOption' : function(event){
		var type = event.currentTarget.dataset.type;
		var category = event.currentTarget.dataset.category;
		hideSuccessBox(document);
		Session.set('PoolList/Category', category);
		if(category==="all"){
			type="family";
		}
		Session.set('PoolList/Type', type);
		Session.set("PoolList/ChosenBrackets","true");

		resetSessionVar();

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
	}
});

/*
	Updates the arrow of the collapsable menu
*/
var updateArrow = function(document, info){
	prevInfo = Session.get("PoolList/Selected");
	if(prevInfo!=undefined){
		// 1rst level
		var prevSelected = document.getElementById(prevInfo.type+"_glyphicon_type");
		if(prevSelected!=null) prevSelected.setAttribute("style","display:none;");
		// 2nd level
		var prevSelected = document.getElementById(prevInfo.type+"_"+prevInfo.category+"_glyphicon_category");
		prevSelected.setAttribute("style","display:none;");
		// 3rd level
		var prevSelected = document.getElementById(prevInfo.type+"_"+prevInfo.category+"_glyphicon_"+ (prevInfo.isPool ? "pool" : "bracket"));
		prevSelected.setAttribute("style","display:none;");
	}

	// 1rst level
	var selected = document.getElementById(info.type+"_glyphicon_type");
	if(selected!=null) selected.setAttribute("style","display:inline;");
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

/*
	Adds the change of a leader to the modification log
	if oldUserId is undefined, the log is adapted
*/
var addLeaderChangeToLog = function(oldUserId, newUserId){
	var hasOldUser = oldUserId!==undefined;
	var user = Meteor.users.findOne({_id:newUserId},{"profile.lastName":1, "profile.firstName":1});

	if(hasOldUser) var oldUser = Meteor.users.findOne({_id:oldUserId},{"profile.lastName":1, "profile.firstName":1});
	Meteor.call("addToModificationsLog",{
		"opType":"Changement chef de poule",
		"details":(hasOldUser?oldUser.profile.firstName + " "+oldUser.profile.lastName +" a été remplacé par ":"")+user.profile.firstName + " "+user.profile.lastName+getStringOptions()},
		function(err, logId){
			Meteor.call("addToUserLog",user._id, logId);
			if(hasOldUser) Meteor.call("addToUserLog",oldUser._id, logId);
		}
	);
}

/*
	This function takes a poolId and a removedPairId.
	It attempts to find a new leader for this pool if the removedPairId was the poolLeader. 
	If it can't find a new pool leader (there are no full pairs in the pool),
	it will remove the existing leader for that pool.
*/
var findNewPoolLeader = function(poolId, removedPairId){
	var pair = Pairs.findOne({_id:removedPairId});
	var prevPool = Pools.findOne({_id:poolId}, {pairs:1, leader:1});

	if(prevPool.leader==undefined || prevPool.leader===pair.player1._id || ((pair.player2==undefined) ? false : prevPool.leader===pair.player2._id)){
		var leaderFound = false;
		// Find the first pair in the pool that has 2 players (that is a valid pair) and set player1 as new leader
		for(var j=0;j<prevPool.pairs.length;j++){
			if(prevPool.pairs[j]===removedPairId) continue;
			var p = Pairs.findOne({_id:prevPool.pairs[j]});
			if(p.player1 && p.player2 && p.player1._id && p.player2._id){
				Pools.update({_id:poolId}, {$set:{leader:p.player1._id}});
				addLeaderChangeToLog(prevPool.leader,p.player1._id);
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

/* 
	This function applies the moves that have been made to the pairs inside pools.
	Returns a list of pair moves
*/
var movePairs = function(document){
	var table = document.getElementById("poolTable");
	var cells = table.getElementsByClassName('pairs');

	// Remember which pairs were moved
	var moves = {}; // key = newPoolId, value = [{"oldPoolId":<oldPoolId>, "pairId":<pairId>}, ...]

	/**********************************************************************
		Move the pairs to their new pool
	***********************************************************************/

	var category = Session.get('PoolList/Category');
	var type = Session.get('PoolList/Type');
	var year = Session.get('PoolList/Year');
	// Get the pairs and their pools
	for(var i=0, len=cells.length; i<len; i++){
		var c = cells[i];

		var pairId = c.id;
		var newPoolId = c.parentNode.id;
		var newPoolId = newPoolId.substring(1, newPoolId.length); // Remove css excape character "a"
		var previousPoolId = document.getElementById(pairId).getAttribute("data-startingpoolid");

		if(previousPoolId!=newPoolId){
			/*
				Pair changed position
			*/

			// Add this pair to the list of pairs that moved
			var move = {"oldPoolId":previousPoolId, "pairId":pairId};
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
				addLeaderChangeToLog(undefined, pair.player1._id);
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
					player1.profile.firstName + " "+ player1.profile.lastName +
			 		" et " + player2.profile.firstName +" " + player2.profile.lastName + " de poule " + previousPoolId + " vers poule "+newPoolId +getStringOptions()
				},
				function(err, logId){
					if(err){
						console.log(err);
						return;
					}
					Meteor.call('addToUserLog', player1._id, logId);
					Meteor.call('addToUserLog', player2._id, logId);
				}
			);
		}
	}

	return moves;
}

/*
	This function deletes or moves matches depending on that:
	If more than one pair is moved at the same time to another pool, 
	the matches these pairs have played together will be transfered to the new
	pool. Otherwise, the matches will be deleted.
*/
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

Template.poolList.onRendered(function() {
	// Restore the state of the selects, in case the user wants to come back to this page
	// (usefull when he clicks on scoreboard and presses the back button)
	Session.set("PoolList/ChosenScorePool","");
	Session.set("PoolList/ChosenBrackets","");
	// Session.set("PoolList/Year","");
	Session.set("PoolList/Type","");
	Session.set("PoolList/Category","");
});

var showPairModal = function(){
  Session.set('closeModal','pairModal');
  $('#pairModal').modal('show');
}

Template.poolList.events({
	"click #helpPool":function(event){


		var colorLegend = "";
		for(var i=0; i<colorKeys.length;i++){
			var key = colorKeys[i];
			colorLegend += "<br><span style='color:"+colors[key].color+"'>"+colors[key].label+"</span>";
		}

	    swal({
	      title:"<h1>Aide</h1>",
	      text: "<ul class='list-group' style='text-align:left'>"+
	      		"<li class='list-group-item'>Pour afficher les informations relatives à un joueur ou une paire, cliquez dessus.</li>"+
	      		"<li class='list-group-item'>Pour séparer une paire, déplacez la d'une poule vers la boîte 'Séparer une paire'.</li>"+
	            "<li class='list-group-item'>Pour créer une paire, déplacez deux joueurs compatibles dans la boîte 'Créer une paire'.</li>"+
	            "<li class='list-group-item'>Pour modifier une poule, déplacez une(des) paire(s) d'une poule à une autre. Cliquez ensuite sur sauver.</li>"+
	            "<li class='list-group-item'>Pour afficher la table des scores, cliquez sur le bouton en haut de la poule concernée.</li>"+
	            "<li class='list-group-item'>Pour changer le chef de poule, cliquez sur sa paire puis ensuite sur le bouton 'Choisir comme chef de poule'.</li>"+
	            "<li class='list-group-item'>Pour devenir responsable de cette catégorie, cliquez sur 'Devenir responsable'.</li>"+
	            "<li class='list-group-item'>Pour ajouter une poule, cliquez sur '+Poule' en bas de page.</li>"+
	            "<li class='list-group-item'>La modification d'un terrain se fait sur la page de la table des scores.</li>"+
	            "\n\n"+
	            "</ul>"+
	            "<center>"+
                      "<b>Légende:</b>"+
                        colorLegend+
                        "<br><span class='glyphicon glyphicon-star leaderStar' style='margin-right:15px'></span>Chef de poule"+
 	            "</center>",
	      type:"info",
	      customClass:"sweetAlertScroll",
	      confirmButtonText:"Ok",
	      confirmButtonColor:"#0099ff",
	      html:true
	      }
	      );

    $(document.getElementsByClassName("sweetAlertScroll")[0]).scrollTop(0);
    // document.getElementsByClassName("sweetAlertScroll")[0].scrollTop(0);
  	},

	'click #equilibrate':function(event){
		equilibrate(document);
	},

	'click .alonePair':function(event){
		var user = Meteor.user();
		if(user==null || user===undefined || !(user.profile.isStaff || user.profile.isAdmin)){
		    return; // Do nothing
		}
		var data = event.currentTarget.dataset;
		var user = Meteor.users.findOne({_id:data.playerid},{"profile.gender":1, "profile.birthDate":1});
		var pair = Pairs.findOne({_id:event.currentTarget.id});
		Session.set("PoolList/ModalData", {"POOL":data.startingpoolid, "SEX":user.profile.gender, "SHOWOPTIONS":true, "BIRTHDATE":user.profile.birthDate, "PAIR":pair});
		showPairModal();
	},

	'click .fullPair':function(event){
	  	var user = Meteor.user();
		if(user==null || user===undefined || !(user.profile.isStaff || user.profile.isAdmin)){
		    return; // Do nothing
		}
        var data = event.currentTarget.dataset;
        var pair = Pairs.findOne({_id:data.id});
        Session.set('PoolList/ModalData',{'PAIR':pair, 'POOL':data.poolid, 'SHOWOPTIONS':true});
        showPairModal();
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


		var pool = Pools.findOne({"_id":poolId}, {"pairs":1});
		var pairsToRemove = pool.pairs;

		// We need another pool to put these pairs into
		var yearData = Years.findOne({"_id":year});
		var typeData = Types.findOne({"_id":yearData[type]});
		var poolList = typeData[category];

		var receivingPool = undefined; // Pool that will receive the single players
		for(var i=0; i<poolList.length;i++){
			if(poolList[i]!==poolId){
				receivingPool = poolList[i];
				break;
			}
		}

		if(poolList.length!=1){
			// Move the pairs that might have been dragged visually into this pool
			var poolContainer = document.getElementById("a"+poolId);
			var pairs = poolContainer.getElementsByClassName("pairs");
			while(pairs.length!=0){
				// Move the pairs
				 // Can always take the 0 index, since the pairs array is dynamic
				var pairId = pairs[0].id;
				var startingpoolid = pairs[0].dataset.startingpoolid;

				if(hasBothPlayers(Pairs.findOne({_id:pairId}))){
					$("#"+pairId).detach().appendTo("#a"+startingpoolid);
				}
			}
		}

		if(pairsToRemove.length!=0){
			if(poolList.length==1 && pairsToRemove.length != 0){
				console.error("Can't remove the last pool, there are still single players linked to it");
				alert("Vous ne pouvez pas effacer la dernière poule alors qu'il reste des joueurs dans cette catégorie."+
						"\nSi vous ne souhaitez pas utiliser cette poule, il suffit de la laisser vide, cela n'aura aucun autre impact.");
				return;
			}

			// Move the pairs to the receivingPool
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

		addNewPool({"year":year, "type":type,"category":category});
	},

	'click #becomeResponsable':function(){
		var user = Meteor.users.findOne({_id:Meteor.userId()});
		if(!user.profile.isAdmin && !user.profile.isStaff){
			console.error("becomeResponsable : you don't have the required permissions !");
			return;
		}

		var year = Session.get('PoolList/Year');
		var type = Session.get('PoolList/Type');
		var category = Session.get('PoolList/Category');

		var yearData = Years.findOne({_id:year});

		var data =  {_id:yearData[type]};
		data[category.concat("Resp")] = Meteor.userId();
		Meteor.call('updateType',data);
	},

	'click #unbecomeResponsable':function(){
		var user = Meteor.users.findOne({_id:Meteor.userId()});
		if(!user.profile.isAdmin && !user.profile.isStaff){
			console.error("unbecomeResponsable : you don't have the required permissions !");
			return;
		}

		var year = Session.get('PoolList/Year');
		var type = Session.get('PoolList/Type');
		var category = Session.get('PoolList/Category');

		var yearData = Years.findOne({_id:year});

		var data =  {};
		data[category.concat("Resp")] = Meteor.userId();
		Types.update({_id:yearData[type]},{$pull:data});
	}
});

var getYearFunct = function(document){
	var year = Session.get('PoolList/Year');
	var y = Years.findOne({_id:year});

	if(year==="" || year===undefined){
		setInfo(document, "Veuillez choisir l'année");
	}

	if(year!=undefined && year !==undefined && y==undefined){
		setInfo(document, "Pas de données trouvées pour l'année "+ year);
	}
	else{
		infoBox =document.getElementById("infoBox");
		if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered
	}

	return y;
}

Template.poolList.helpers({
	'getTranslateType':function(){
		return typesTranslate[Session.get("PoolList/Type")];
	},

	'getTranslateCategory':function(){
		return categoriesTranslate[Session.get("PoolList/Category")];
	},

	// Returns a yearData with id year (copy of the same function in poolsSidebarCollapsableMenu.helpers)
	'getYear' : function(){
		return getYearFunct(document)
	},

	// Returns a typeData
	'getType' : function(yearData){
		var type = Session.get('PoolList/Type');
		if(type==="" || type===undefined){
			setInfo(document, "Veuillez choisir parmi les types homme, femme, mixte ou familles");
			return;
		}
		var t = Types.findOne({_id:yearData[type]});

		if(type!=undefined && type!=="" && t==undefined){
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
		if((poolList==undefined || poolList.length==0) && category!=undefined){
			setInfo(document, "Pas de poules trouvées"+getStringOptions());
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
		var category = Session.get('PoolList/Category');
		var poolIdList = typeData[category];
		var poolList = [];

		var totalNumberOfPairs = 0;
		var totalCompletion = 0;

		const MAXCOLUMNS = 3; // Change this value if needed
		var k = 0;
		var column = [];
		if(poolIdList){
			for(var i=0;i<poolIdList.length;i++){
				var pool = Pools.findOne({_id: poolIdList[i]});
			
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

		/*
			Update completion
		*/
		var completion = (totalNumberOfPairs==0) ? 0 : totalCompletion/totalNumberOfPairs;
		var user = Meteor.user();
		if(user!==undefined && user!==null && (user.profile.isStaff || user.profile.isAdmin)){
			if(totalNumberOfPairs!=0){
				var str = "completion.pools.".concat(category);
				updateData = {};
				updateData[str] = completion
				Types.update({_id:typeData._id},{$set:updateData});
			}
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
		poolId = Session.get("PoolList/ChosenScorePool");
    var year = Session.get('PoolList/Year');
    var type = Session.get('PoolList/Type');
    var category = Session.get('PoolList/Category');
    Session.set("printPDF/Year",year);
    Session.set("printPDF/Type",type);
    Session.set("printPDF/Cat",category);

    if(year===undefined || type===undefined || category===undefined || type==='' || category==='' || year===''){
      return;
    }
    typeSearch = {};
    typeSearch[type] = 1
    var field = category.concat("Resp");

    var yearData = Years.findOne({_id:year},typeSearch);
    Data = {};
    Data[field]=1;
    var typeData = Types.findOne({_id:yearData[type]},Data);

    if(typeData != undefined){
      var responsables = typeData[field];
      if(responsables != undefined && responsables.length>0){
    		if(poolId!=""){
    			return {_id:poolId,
            resp:responsables[0],
            info:{year:year,
                  type:type,
                  cat:category}};
    		}
    		else return "";
      }
    }
    if(poolId!=""){
  			return {_id:poolId,
          resp:-1};
  		}
  		else return "";

	},

	'getChosenCourt':function(){
		return Session.get("PoolList/ChosenCourt");
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
					var user = Meteor.user();
					if(user!==undefined && user!==null && (user.profile.isStaff===true || user.profile.isAdmin===true)){
						var isPairModal = (' ' + el.className + ' ').indexOf(' modal ') > -1;
			    		if(isPairModal){
			    			// The modal must not be draggable
			    			return false;
			    		}
			    		return true; // All other elements are draggable
		    		}
		    		return false;
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

		    		if(isToMerge || isFromMerge){
	    				mergeErrorBox = document.getElementById("mergeErrorBox");
						mergeErrorBox.style.display = "none";
		    		}

		    		if(isFromPoule && (isToAlone || isToMerge)) return false;
		    		if(isFromAlone && (isToPoule || isToSplit)) return false;
		    		if(isFromSplit && (isToAlone || isToMerge)) return false;
		    		if(isFromMerge && (isToPoule || isToSplit)) return false;
		    		if(isToMerge && target.children.length>=2) return false;
		    		return true;
  				},
			}
		).on('drag', function (el,source) {
		  	/*
				Make the screen scroll when a draggable object is near the border of the screen
		  	*/

			const scrollSpeed = 3; //px

			var m = false; // To keep dragging when near the border

			var scrollPage = function(dx,dy){
				window.scrollBy(dx,dy);
				if(m===true && drake.dragging){
					setTimeout(function(){scrollPage(dx,dy)}, 20);
				}
			}

			var scrollElem = function(dy){
				source.scrollTop += dy;
				if(keepScrollElem===true && drake.dragging){
					setTimeout(function(){scrollElem(dy)}, 20);
				}
			}

		    var onMouseMove = function(e) {
		      	if (drake.dragging) {
		        	//scroll while drag
		            e = e ? e : window.event;
		            var h = $(window).height();
		            var w = $(window).width();

				    if(h-e.y < 50) { // vertical scroll
				    	m = true;
				        scrollPage(0, scrollSpeed);
				    }
				    else if(e.y < 50){
				    	m = true;
						scrollPage(0, -scrollSpeed);
				    }
				    else if(w-e.x < 50) { // horizontal scroll
				    	m = true;
				        scrollPage(scrollSpeed,0);
				    }
				    else if(e.x < 50){
				    	m = true;
						scrollPage(-scrollSpeed,0);
				    }
				    else{
				    	m = false;
				    }
				}
		    };

			document.addEventListener('mousemove', onMouseMove);

			hideSuccessBox(document);
  		  	el.className = el.className.replace('ex-moved', '');
  	  	}).on('drop', function (el, target, source, sibling) {
	  		if(target.id==="pairstosplit"){
	  			splitPairs(el);
	  		}
	  		else if(target.id==="mergeplayers" && target.getElementsByClassName("pairs").length==2){
	  			var success = mergePlayers(document);

	  			if(success===true){
	  				var pairsToMove = document.getElementById("mergeplayers").getElementsByClassName("pairs");
		  			// Empty any player that still might be here
		  			while(pairsToMove.length!=0){
		  				$("#"+pairsToMove[0].id).detach().appendTo("#alonepairs");
		  			}
		  		}
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
/*
	This container contains pairs that do not have 2 players. They are shown separetely. Note that these
	pairs are still located in pools in the the db, like any other pair.
*/

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
		return getColorFromPlayer(player);
	},

	'getPlayer' : function(playerId){
		if(playerId==undefined) return undefined;
		return Meteor.users.findOne({_id:playerId});
	},
});

/******************************************************************************************************************
											poolItem
*******************************************************************************************************************/
/*
	This defines the item that will actually be draggable
*/
Template.poolItem.helpers({
	'getPlayer' : function(playerId){
		return Meteor.users.findOne({_id:playerId});
	},

	'getPair' : function(pairId, poolId) {
		var pair = Pairs.findOne({_id:pairId});
		if(!pair) return undefined;

		// Add this pair to the list of alone pairs, if this pair is not full
		if(!hasBothPlayers(pair)){
			return undefined;
		}
		return pair;
	},

	'getColor' : function(player){
		return getColorFromPlayer(player);
	}
});

/******************************************************************************************************************
											poolContainerTemplate
*******************************************************************************************************************/
/*
	This defines the container that contains poolItems
*/

Template.poolContainerTemplate.onRendered(function(){
	doc = document.querySelector('#a'+this.data.POOL._id);
  	drake.containers.push(doc); // Make the id this.data.ID draggable
});

/*
	Returns true the list of pairs contains at least one pair with 2 players
*/
var moreThanOnePairFunct = function(pairs){
	for(var i=0;i<pairs.length;i++){
		pair = Pairs.findOne({"_id":pairs[i]});
		if(hasBothPlayers(pair)) return true;
	}
	return false;
}

Template.poolContainerTemplate.helpers({
	'moreThanOnePair' : function(pairs){
		return moreThanOnePairFunct(pairs);
	},

	'displayPool':function(pairs){
		var user = Meteor.user();
		if(user===undefined || user===null) return moreThanOnePairFunct(pairs);
		return (user.profile.isAdmin || user.profile.isStaff || moreThanOnePairFunct(pairs));
	},

  'getStreet' : function(courtId){
      if(courtId ==undefined){
        return "Pas de terrain assigné";
      }
      else{
        var court = Courts.findOne({"courtNumber":courtId});
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
        var court = Courts.findOne({"courtNumber":courtId});
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
    Session.set("printSheets/Value", false);
		Session.set("PoolList/ChosenScorePool", event.currentTarget.dataset.poolid);
	},
});

/******************************************************************************************************************
											CategorySelect
*******************************************************************************************************************/

var typeCompletion = function(type){
	year = Session.get("PoolList/Year");
	yearSearchData = {};
	yearSearchData[type] = 1;
	yearData = Years.findOne({"_id":year}, yearSearchData);
	typeId = yearData[type];
	typeData = Types.findOne({"_id":typeId},{"completion":1});
	if(typeData==undefined || typeData.completion==undefined) return "(?)";

	typeCompletionValue = 0;
	nonEmptyCat = 0;

	var completionData = typeData["completion"];
	if(completionData==undefined) return "(?)";

	for(var i=0; i<categoriesKeys.length;i++){
		var cPools = completionData["pools"][categoriesKeys[i]];
		if(cPools!=undefined){
			nonEmptyCat+=2;
			typeCompletionValue += cPools;
		}
		if(completionData["brackets"]!=undefined){
			var cBrackets = completionData["brackets"][categoriesKeys[i]];
			if(cBrackets!=undefined){
				typeCompletionValue += cBrackets;
			}
		}
	}

	completion = (nonEmptyCat==0) ? 0 : typeCompletionValue/nonEmptyCat;

	var perc = completion*100;
	var toReturn = "("+perc.toFixed(0)+"%)";
	return toReturn;
}

Template.CategorySelect.helpers({
	'getTypeCompletion' : function(type){
		return typeCompletion(type);
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
/*
	This defines the modal that shows up when a pair is cliqued
*/

Template.modalItem.helpers({

	/*
		This returns a list of objects defining which types the pair with pairId can move to. The pair only has 1 player set.
	*/
	'getAvailableTypes':function(pairId, poolId, sex, birthDate){
		var toReturn = [];
		var type = Session.get("PoolList/Type");

		gender = sex==='F' ? "women" : "men";

		for(var i=0; i<typeKeys.length;i++){
			var key = typeKeys[i];
			var selected = type===key;
			if( type!==key && ((key==="women" && gender==="women") || (key==="men"&&gender==="men") || key==="family" || key=="mixed")){
				if((key==="family" && acceptForFamily(birthDate)) || key!=="family"){
					toReturn.push({"key":key, "value":typesTranslate[key], "selected":selected, "pairId":pairId, "poolId":poolId});
				}
			}
		}
		return toReturn;
	},

	'getModalInfo':function(){
		return Session.get("PoolList/ModalData");
	}
});

Template.modalItem.events({

	/*
		This defines what happens when the staff wants to move a player of type.
	*/
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
		var target = event.currentTarget;
		var poolId = target.dataset.poolid;
		var playerId = target.dataset.player;
		var p = Pools.findOne({_id:poolId},{"leader":1});
		var previousLeader = p.leader; // Only used for the log
		if(previousLeader!==playerId){
			Pools.update({_id:poolId},{$set:{"leader":playerId}});
			addLeaderChangeToLog(previousLeader, playerId);
		}
	}
});


/******************************************************************************************************************
											reponsablesTemplate
*******************************************************************************************************************/
/*
	This defines how the responsables are set and displayed
*/

Template.responsablesTemplate.helpers({

	'getPlayer' : function(playerId){
		if(playerId==undefined) return undefined;
		return Meteor.users.findOne({_id:playerId});
	},

	'getEmail' : function(player){
		return player.emails[0].address;
	},

	'isResponsable':function(){
		var year = Session.get('PoolList/Year');
		var type = Session.get('PoolList/Type');
		var category = Session.get('PoolList/Category');

		if(year===undefined || type===undefined || category===undefined){
			return;
		}

		var yearData = Years.findOne({_id:year});
		var data = {"_id":yearData[type]};
		data[category.concat("Resp")] = Meteor.userId();

		var search = Types.findOne(data);
		if(search===undefined) return false;
		var val = search[category.concat("Resp")];
		return val!==undefined;
	},

	'getResponsables':function(){
		var year = Session.get('PoolList/Year');
		var type = Session.get('PoolList/Type');
		var category = Session.get('PoolList/Category');

		if(year===undefined || type===undefined || category===undefined){
			return;
		}

		var field = category.concat("Resp");
		var yearData = Years.findOne({_id:year});
		var typeData = Types.findOne({_id:yearData[type]});


		var responsables = typeData[field];
        if (typeof responsables === 'undefined') {
            return [];
        }

		var respCol = [];
		const chunk = 3; // Number of columns
		/*
			Separate in multiple columns :
		*/
		for (i=0,j=responsables.length; i<j; i+=chunk) {
	    	temparray = responsables.slice(i,i+chunk);
	    	respCol.push(temparray);
		}

		return respCol;
	},
});


/******************************************************************************************************************
											Equilibrate pools
*******************************************************************************************************************/

/*
	Creates a new pool for the current category and returns its id
*/
var addNewPool = function(obj){
	var year = obj.year;
	var type = obj.type;
	var category = obj.category;

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
	var newPoolId = Pools.insert({"pairs":[],"type":type, "category":category});

	var data = {$push:{}}
	data.$push[category] = newPoolId;
	/*	Add that pool to the list of pools of the corresponding type	*/
	Types.update({_id:typeId},data);

	Meteor.call("addToModificationsLog",
	{"opType":"Ajouter poule",
	"details":
		"Poule ajoutée : "+newPoolId+getStringOptions()
	});
	return newPoolId;
}

/*
	Visually sets the same amount of pairs to each pool
*/
var equilibrate = function(document){
	var table = document.getElementById("poolTable");
	var poolContainersRow = table.rows; // Table of rows

	var totalPairs = 0;
	var poolContainers = [];
	for(var i=0;i<poolContainersRow.length;i++){
		var row = poolContainersRow[i].getElementsByTagName('td');
		for(var j=0; j<row.length;j++){
			var pairs = row[j].getElementsByClassName("pairs");
			totalPairs += pairs.length;
			poolContainers.push({"pairs":pairs,"containerId":row[j].getElementsByClassName("poolContainer")[0].id});
		}
	}

	var optimalSize = Math.round(totalPairs/poolContainers.length); // Ideal number of pairs per pool
	console.log("optimalSize : "+optimalSize);
	// For each poolContainer
	for(var i=0;i<poolContainers.length;i++){
		// This is the amount of pairs to remove from this container
		var cont = poolContainers[i];
		var amountToRemove = cont.pairs.length-optimalSize;
		for(var j=0; j<amountToRemove;j++){
			var pairToMove = cont.pairs[0];
			/*
				Now we must find somewhere to put these pairs
				Start to fill the next container
			*/
			for(var k=0;k<poolContainers.length;k++){
				var container = poolContainers[k];
				if(container.pairs.length < optimalSize){
					// Move the pair overhere !
					$('#'+pairToMove.id).detach().appendTo('#'+poolContainers[k].containerId);
					break;// We found a pool for this pair
				}
			}
		}
	}
}
