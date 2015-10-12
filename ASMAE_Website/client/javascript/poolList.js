Content = {};
Content._dep = new Deps.Dependency;

// Might be useful at some point :
// https://developer.mozilla.org/en/docs/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

var drake; // Draggable object

Template.poolList.helpers({
	'getPools' : function(){
		// var res = Pools.find({},{});
		// return res;

		// var MenMinimesSa = [{"PairId":"mm1Sa"}, {"PairId":"mm2Sa"}];
		var MM1 = [{"PairId":"mm1Su", "Player1":{"Name":"A"}, "Player2":{"Name":"B"}}, 
					{"PairId":"mm2Su", "Player1":{"Name":"Jonathan", "Wish":"MOAR BEEER"}, "Player2":{"Name":"C"}}];

		// var MenSeniorsSa = [{"PairId":"ms1Sa"}, {"PairId":"ms2Sa"}];
		var MM2 = [{"PairId":"ms1Su", "Player1":{"Wish":"I'm the best", "Name":"Aurélien"}, "Player2":{"Name":"Florian"}}, 
					{"PairId":"ms2Su", "Player1":{"Name":"Guillaume"}, "Player2":{"Name":"Romain", "Constraint":"8h c'est tot"}}];

		// var WomenMinimesSa = [{"PairId":"wm1Sa"}, {"PairId":"wm2Sa"}];
		var MM3 = [{"PairId":"wm1Su","Player1":{"Name":"D"}, "Player2":{"Name":"E"}},
					{"PairId":"wm2Su", "Player1":{"Name":"F"}, "Player2":{"Name":"G"}}];

		// var WomenSeniorsSa = [{"PairId":"ws1Sa"}, {"PairId":"ws2Sa"}];
		var MM4 = [{"PairId":"ws1Su","Player1":{"Name":"I"}, "Player2":{"Name":"J"}},
					{"PairId":"ws2Su", "Player1":{"Name":"K"}, "Player2":{"Name":"L"}}];

		var menMinimesPoolSu = [
			{"PoolName":"Pool 1", "Pairs":MM1, "PoolId":"pid1"}, 
			{"PoolName":"Pool 2", "Pairs":MM2, "PoolId":"pid2"}, 
			{"PoolName":"Pool 3", "Pairs":MM3, "PoolId":"pid3"}, 
			{"PoolName":"Pool 4", "Pairs":MM4, "PoolId":"pid4"}
		];
		// var menSa = [{"Category":"Minimes", "Pairs":MenMinimesSa}, {"Category":"Seniors", "Pairs":MenSeniorsSa}];
		// var womenSa = [{"Category":"Minimes", "Pairs":WomenMinimesSa}, {"Category":"Seniors", "Pairs":WomenSeniorsSa}];

		var menSu = [{"Category":"Minimes", "Pools":menMinimesPoolSu}];

		// var typeSa = [{"Type":"Men", "Data":menSa}, {"Type":"Women", "Data":womenSa}];
		var typeSu = [{"Type":"Men", "PoolCategories":menSu}];
		var day = [{"Day":"Sunday", "PoolType":typeSu}];

		return day;
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
		Content._dep.changed();
	},
	'click .PoolCategory':function(event){
		Session.set('PoolCategory', event.target.value);
		Content._dep.changed();
	},
	'click .PoolDay':function(event){
		Session.set('PoolDay', event.target.value);
		Content._dep.changed();
	},
	'click #save':function(event){
		var table = document.getElementById("poolTable");
		var cells = table.getElementsByClassName('Pairs');

		// Get the pairs and their pools
		for(var i=0, len=cells.length; i<len; i++){

			var category = Session.get('PoolCategory');
			var type = Session.get('PoolType');
			var day = Session.get('PoolDay');

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