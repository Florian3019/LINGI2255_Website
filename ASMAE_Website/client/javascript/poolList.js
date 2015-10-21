// Might be useful at some point :
// https://developer.mozilla.org/en/docs/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

var drake; // Draggable object

Template.poolList.helpers({
	'log' : function(x, text){
		console.log(text);
		console.log(x);
	},

	// // Returns a yearData with id year
	'getYear' : function(){
		var year = Session.get('Year');
		var y = Years.findOne({_id:year});
		return y;
	},
	
	// Returns a typeData
	'getType' : function(yearData){
		var type = Session.get('PoolType');
		var t = Types.findOne({_id:yearData[type]});
		return t;
	},

	// Returns a list of poolData
	'getPools' : function(typeData){
		category = Session.get('PoolCategory');
		poolIdList = typeData[category];
		poolList = [];
		for(var i=0;i<poolIdList.length;i++){
			pool = Pools.findOne({_id: poolIdList[i]});
			poolList.push(pool);
		}
		return poolList;
	},

	'getArrayLength' : function(array){
		return array.length;
	},

	'equals':function(x, y){
		return x==y;
	},

	'newRow' : function(){

		return false;

		var colNumber = Session.get("ColNumber");
		if(colNumber>= 1*2){
			Session.set("ColNumber", 0);
			return true;
		}
		else{
			Session.set("ColNumber", colNumber+1);
			return false;
		}

	},

	'resetDrake' : function(){
		drake = dragula().on('drag', function (el) {
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

Template.poolList.onCreated(function() {
	Session.set('PoolCategory', null);
	Session.set('PoolType', null);
	Session.set('PoolDay', null);
});

Template.poolList.events({
	'click .PoolType':function(event){
		Session.set('PoolType', event.target.value);
	},
	'click .PoolCategory':function(event){
		Session.set('PoolCategory', event.target.value);
	},
	'click .Year':function(event){
		Session.set('Year', event.target.value);
	},

	/*
		Collects the state of the table of pools to save it into the db
	*/
	'click #save':function(event){
		var table = document.getElementById("poolTable");
		var cells = table.getElementsByClassName('Pairs');

		// Get the pairs and their pools
		for(var i=0, len=cells.length; i<len; i++){
			var category = Session.get('PoolCategory');
			var type = Session.get('PoolType');
			var year = Session.get('Year');

			c = cells[i];
			// Will probably have to change the path to the id, since we changed the html
			var pairId = c.id;
			var newPoolId = c.parentNode.id;
			var previousPoolId = document.getElementById(pairId).getAttribute("data-startingpoolid");

			if(previousPoolId!=newPoolId){
				/*
					Pair changed position
				*/

				// Remove that pair from the previous pool
				Pools.update({_id:previousPoolId},{$pull : {pairs: pairId}});

				// Add that pair to the new pool
				Pools.update({_id:newPoolId}, {$push : {pairs: pairId}});

				// Set the new pool id to that pair :
				document.getElementById(pairId).setAttribute("data-startingpoolid", newPoolId);
			}
		}
		
	},

	'click #addPool':function(event){
		var category = Session.get('PoolCategory');
		var type = Session.get('PoolType');
		var year = Session.get('Year');

		if(! (category&&type&&year)){
			return;
		}

		var yearData = Years.findOne({_id:year},{type:1});

		var newPoolId = Pools.insert({"pairs":[]});
		var data = {$push:{}}
		data.$push[category] = newPoolId;
		Types.update({_id:yearData[type]},data);
	}
});

Template.poolItem.helpers({
	'getPlayer' : function(playerId){
		return Meteor.users.findOne({_id:playerId});
	},


	'getPair' : function(pairId) {
		var pair = Pairs.findOne({_id:pairId})
		return (pair.player1 && pair.player2) ? pair : undefined;
	},
});

Template.poolContainerTemplate.onRendered(function(){
  	drake.containers.push(document.querySelector('#'+this.data.POOL._id)); // Make the id this.data.ID draggable 
});