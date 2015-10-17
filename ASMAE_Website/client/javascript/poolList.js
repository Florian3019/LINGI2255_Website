/* a priori useless
Content = {};
Content._dep = new Deps.Dependency;
*/

// Might be useful at some point :
// https://developer.mozilla.org/en/docs/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

var drake; // Draggable object

Template.poolList.helpers({
	'getPools' : function(){
		return Meteor.call('getPools');
	},
	
	'getPoolList' : function(typeID) {
		
	}

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
	
	'getYear' : function() {
		return Session.get('Year');
	}

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
		//Content._dep.changed();
	},
	'click .PoolCategory':function(event){
		Session.set('PoolCategory', event.target.value);
		//Content._dep.changed();
	},
	'click .Year':function(event){
		Session.set('Year', event.target.value);
		//Content._dep.changed();
	},
	'click #save':function(event){
		var table = document.getElementById("poolTable");
		var cells = table.getElementsByClassName('Pairs');

		// Get the pairs and their pools
		for(var i=0, len=cells.length; i<len; i++){

			var category = Session.get('PoolCategory');
			var type = Session.get('PoolType');
			var year = Session.get('Year');

			c = cells[i];
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