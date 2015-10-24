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
		return poolList;
	},

	'getArrayLength' : function(array){
		return array.length;
	},

	'equals':function(x, y){
		return x==y;
	},

	'getRemovePool' : function(){
		return {"_id":"toRemove", "pairs":[]}
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

Template.pairsToRemoveContainerTemplate.onRendered(function(){
  	drake.containers.push(document.querySelector('#pairstoremove'));
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

		/*
			Move the pairs in their new pool
		*/
		var table = document.getElementById("poolTable");
		var cells = table.getElementsByClassName('pairs');

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
		
		/*
			Remove from the db unwanted pairs
		*/
		var allTables = document.getElementById("allTables");
		console.log(allTables);
		var columnPairToRemove = allTables.rows[0];
		console.log(columnPairToRemove);
		console.log(columnPairToRemove.cells[1]);
		var pairsToRemove = columnPairToRemove.cells[1].getElementsByClassName('pairs');


		for(var i=0;i<pairsToRemove.length;i++){
			var pairId = pairsToRemove[i].id;
			var poolId = document.getElementById(pairId).getAttribute("data-startingpoolid"); // The pair's pool id

			// Remove that pair from its pool
			Pools.update({_id:poolId},{$pull : {pairs: pairId}});

			// Remove that pair from the db
			Pairs.remove({_id:pairId});
		}
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
			console.log("Can't remove a pool that is not empty");
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

		var yearData = Years.findOne({_id:year},{type:1});

		typeId = yearData[type];
		if(!typeId){
			console.error("That type doesn't exist in the db");
			return;
		}
		var newPoolId = Pools.insert({"pairs":[]});
		var data = {$push:{}}
		data.$push[category] = newPoolId;
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

	'log' : function(x){
		console.log(x);
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