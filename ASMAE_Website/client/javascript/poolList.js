// Might be useful at some point :
// https://developer.mozilla.org/en/docs/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

var drake; // Draggable object

Template.poolList.helpers({
	
	// Returns a yearData with id year
	'getYear' : function(year){
		return Years.findOne({_id:year});
	},
	
	// Returns a typeData
	'getType' : function(typeID){
		return Types.findOne({_id:typeID});
	},

	// Returns a table of pools corresponding to the table of pool ids (poolIDList)
	'getCategory' : function(poolIDList){
		list = [];
		for(var i=0;i<poolIDList.length;i++){
			list.push(Pools.findOne({_id:poolIDList[i]}));
		}
	},

	'getPair' : function(pairID) {
		return Pairs.findOne({_id:pairID});
	},

	'getPlayer' : function(playerID){
		return Users.findOne({_id:playerID});
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
	
	'getCurYear' : function() {
		return Session.get('Year');
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
		
	}

});

Template.poolItem.onRendered(function(){
  drake.containers.push(document.querySelector('#'+this.data.ID)); // Make the id this.data.ID draggable  
});