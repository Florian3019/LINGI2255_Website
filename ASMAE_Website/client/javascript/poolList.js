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
		Meteor.call('getYearData', year, function(error, result){
			Session.set('YearInfo', result);
		});
	},
	
	// Returns a typeData
	'getType' : function(yearData, type){
		Meteor.call('getTypeData', yearData, type, function(error, result){
			Session.set('TypeInfo', result);
		});
	},

	// Returns a list of poolData
	'getPools' : function(typeData, category){
		Meteor.call('getPoolsData', typeData, category, function(error, result){
			Session.set('PoolsInfo', result);
		});
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
	
	'getYearInfo' : function(){
		return Session.get('YearInfo');
	},

	'getPoolsInfo' : function(){
		return Session.get('PoolsInfo');
	},

	'getTypeInfo' : function(){
		return Session.get('TypeInfo');
	},

	'getCurCategory' : function(){
		return Session.get('PoolCategory');
	},

	'getCurType' : function(){
		return Session.get('PoolType');
	},

	'getCurDay' : function(){
		return Session.get('PoolDay');
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
			/*
				
				REDO this part to make it work with database changes 

			*/
		var table = document.getElementById("poolTable");
		var cells = table.getElementsByClassName('Pairs');

		// Get the pairs and their pools
		for(var i=0, len=cells.length; i<len; i++){


			var category = Session.get('PoolCategory');
			var type = Session.get('PoolType');
			var year = Session.get('Year');

			c = cells[i];
			console.log(c);
			// Will probably have to change the path to the id, since we changed the html
			var pairId = c.id;
			var poolId = c.parentNode.id;
			
			// TODO save the data
			console.log(pairId);
			console.log(poolId);
		}
		
	},

	'click #addPool':function(event){
		// TODO
		console.log("clicked add pool");
	}

});

Template.poolItem.helpers({
	'getPlayers' : function(player1, player2){
		Meteor.call('getPlayerData', player1, function(error, result){
			if(result)	document.getElementById ? document.getElementById(player1).innerHTML = result.profile.lastName + " " + result.profile.firstName : undefined;	
		});
		Meteor.call('getPlayerData', player2, function(error, result){
			if(result) document.getElementById(player2) ? document.getElementById(player2).innerHTML = result.profile.lastName + " " + result.profile.firstName : undefined;
		});
	},


	'getPair' : function(pairId) {
		Meteor.call('getPairData', pairId, function(error, result){
			Session.set('PairInfo', result);
		});
	},

	'getPairInfo' : function(){
		return Session.get('PairInfo');
	},


});

Template.poolItem.onRendered(function(){
  drake.containers.push(document.querySelector('#'+this.data.POOLID)); // Make the id this.data.ID draggable  
});