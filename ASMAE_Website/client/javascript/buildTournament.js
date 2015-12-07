/*
	This file defines the page where the staff can choose who is selected for the knock-offs or not.
	By default, a selection of the "n" best pairs of each pool is displayed, where "n" is defined on the 
	Knock-offs management page in the field "Winners per pool".
*/


var drake; // Draggable object

var updateSelectedNumber = function(document){
	s = document.getElementById("selectedForTournament").getElementsByClassName("pairs").length;
	ns = document.getElementById("notSelectedForTournament").getElementsByClassName("pairs").length;
	Session.set("brackets/selectedSize",[s,ns]);
}
function clearInner(node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
}

function clear(node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
  node.parentNode.removeChild(node);
}

var resetBrackets = function(document){
  /*  Prevent duplication of the brackets --> remove the previous one */
    var myNode = document.getElementById("gracketContainer");
    if(myNode!=undefined) clearInner(myNode);
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

var showPairModal = function(){
  Session.set('closeModal','pairModal');
  var user = Meteor.user();
  if(user==null || user===undefined || !(user.profile.isStaff || user.profile.isAdmin)){
    return; // Do nothing
  }
  $('#pairModal').modal('show');
}

Template.buildTournament.events({
	'click .clickablePoolItem':function(event){
        var data = event.currentTarget.dataset;
        var pair = Pairs.findOne({_id:data.id});
        Session.set('PoolList/ModalData',{'PAIR':pair, 'POOL':data.poolid, 'SHOWOPTIONS':true});
        showPairModal();
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
				resetBrackets(document);
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

		for(var i=0;i<(winners.length-1);i++){
			courts.push("?");
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
});

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
