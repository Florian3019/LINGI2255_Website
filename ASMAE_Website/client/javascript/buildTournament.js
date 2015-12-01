
var drake; // Draggable object

var updateSelectedNumber = function(document){
	s = document.getElementById("selectedForTournament").getElementsByClassName("pairs").length;
	ns = document.getElementById("notSelectedForTournament").getElementsByClassName("pairs").length;
	Session.set("brackets/selectedSize",[s,ns]);
}

Template.buildTournament.helpers({
	'getNotSelectedSize':function(){
		var x = Session.get("brackets/selectedSize");
		if(x!==undefined) return x[1];
	},

	'getSelectedSize':function(){
		var x = Session.get("brackets/selectedSize");
		if(x!==undefined) return x[0];
	},

	'getCurrentlyBuilding':function(){
		return Session.get("brackets/buildingTournament");
	},

	'resetDrake':function(){
		drake = dragula(
			{
				/*	Defines what can be moved/dragged	*/
				moves : function(el, source, handle, sibling) {
					if(Meteor.user().profile.isStaff===true || Meteor.user().profile.isAdmin===true){
						return true;
		    		}
		    		return false;
		  		},
		  		accepts: function (el, target, source, sibling) {
		    		return true;
  				},
			}
		).on('drag', function (el,source) {
		  	/*
				Make the screen scroll when an draggable object is near the border of the screen
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

				    if(h-e.y < 50) {
				    	m = true;
				        scrollPage(0, scrollSpeed);
				    }
				    else if(e.y < 50){
				    	m = true;
						scrollPage(0, -scrollSpeed);
				    }
				    else if(w-e.x < 50) {
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
  		  	el.className = el.className.replace('ex-moved', '');
  	  	}).on('drop', function (el, target, source, sibling) {
	  		updateSelectedNumber(document);
	    	el.className += ' ex-moved';
	  	}).on('over', function (el, container) {
	    	container.className += ' ex-over';
	  	}).on('out', function (el, container) {
	  		if(container!=null) container.className = container.className.replace('ex-over', '');
	 	});
	  }
});

var getStringOptions = function(){
	return " dans "+typesTranslate[Session.get("PoolList/Type")]+">"+
			categoriesTranslate[Session.get("PoolList/Category")]+
			" (" + Session.get("PoolList/Year")+")";
};

Template.buildTournament.events({
	'click .clickablePoolItem':function(event){
		showPairModal(event);
	},

	'click #continueToTournament':function(event){
		var selected = document.getElementById("selectedForTournament").getElementsByClassName("pairs");

		var callback = function(err, status){
			if(err){
				console.error("buildTournament error");
				console.error(err);
				Session.set("brackets/buildingTournament",true);
				return;
			}
	    	Session.set("brackets/buildingTournament",false);
			Session.set('brackets/update',Session.get('brackets/update') ? false:true);

			Meteor.call("addToModificationsLog",
		        {"opType":"Création tournoi knock-off",
		        "details": getStringOptions()
	        });
		};

		winners = [];

		for(var i=0; i< selected.length;i++){
			winners.push(selected[i].id);
		}

		courts = [];
		var logPairs = Math.log2(winners.length);
		var numMatchesFull = Math.pow(2,Math.ceil(logPairs))/2;
		var init = getNumberMatchesFirstRound(winners.length);
		console.log(init);
		var round=0;
		var count=0;
		var first=true;
		var filled = numMatchesFull/2;

		for(var i=0;i<(winners.length-1);i++){
			if((count==init+1 && first) || count==filled+1){
				round++;
				filled=filled/2;
				count=0;
				first=false;
			}
			courts.push([round,"?"+i]);
			count++;
		}

		type = Session.get("PoolList/Type");
		category = Session.get("PoolList/Category");
		year = Session.get("PoolList/Year");

		Session.set("brackets/buildingTournament",false);

	    typ = {};
	    typ[type] = 1;
	    yearData = Years.findOne({"_id":year}, typ);
	    if(yearData==undefined) return;
	    typeId = yearData[type];
	    if(typeId==undefined) return;

	    data = {"_id":typeId};
	    data[category.concat("Bracket")] = winners;
	    data[category.concat("Courts")] = courts;
	    Meteor.call("updateType", data, callback);
	}
});

var hasBothPlayers = function(pair){
	return (pair!=undefined) && pair.player1!=undefined && pair.player2 !=undefined;
}

var showPairModal = function(event){
	user = Meteor.user();
	if(user==null || !(user.profile.isStaff || user.profile.isAdmin)){
		return; // Do nothing
	}
	mod = $('#pairModal'+event.currentTarget.dataset.id);
	console.log(mod);
	mod.modal('show');
}


Template.buildTournamentItem.helpers({
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

Template.buildContainer.onRendered(function(){
 	/*
		Add the containers
 	*/
 	container = document.querySelector('#'+this.data.ID);
 	drake.containers.push(container);

	// updateSelectedNumber(document);
});

// Template.buildContainer.events({
// 	'change .buildContainer':function(event){
// 		console.log("hi");
// 		updateSelectedNumber(document);
// 	}
// })

Template.buildContainer.helpers({
	'getLoserPairPoints':function(){
		var pairPoints = Session.get("brackets/pairPoints");
		if(pairPoints!==undefined){
			Session.set("brackets/selectedSize",[pairPoints.winnerPairPoints.length,pairPoints.loserPairPoints.length]);
			return pairPoints.loserPairPoints;
		}
	},

	'getWinnerPairPoints':function(){
		var pairPoints = Session.get("brackets/pairPoints");
		if(pairPoints!==undefined){
			Session.set("brackets/selectedSize",[pairPoints.winnerPairPoints.length,pairPoints.loserPairPoints.length]);
			return pairPoints.winnerPairPoints;
		}
	},
})
