var getCourtNumbers = function(courts){
	var result = [];

	for(var k=0; k<courts.length;k++){
		var courtsList = courts[k].courtNumber;

		for(var t=0;t<courtsList.length;t++){
			result.push(courtsList[t]);
		}
	}

	return result;
}

var checkNumberCourts = function(courtsSat,courtsSun,poolsSat,poolsSun){

	if(courtsSat.length<poolsSat.length){
		console.error((poolsSat.length-courtsSat.length) + " terrains manquants pour samedi matin");
		return false;
	}

	if(courtsSat.length>poolsSat.length){
		console.log((courtsSat.length-poolsSat.length) + " terrains en trop pour samedi matin");
	}

	console.log('courts '+courtsSun);
	console.log('pools '+poolsSun);

	if(courtsSun.length<poolsSun.length){
		console.error((poolsSun.length-courtsSun.length) + " terrains manquants pour dimanche matin");
		return false;
	}

	if(courtsSun.length>poolsSun.length){
		console.log((courtsSun.length-poolsSun.length) + " terrains en trop pour dimanche matin");
	}

	return true;

}

/*
	Return N courts, starting at index start and using a modulo to loop through the array
	nextNumber is the next number to assign to the court if it hasn't a number yet
*/
var setCourts = function(listPairs, courts, start,final_result){

		console.log(courts);

	var result = [];
	var next=0;

	var logPairs = Math.log2(listPairs.length);
	var numMatchesFull = Math.pow(2,Math.ceil(logPairs))/2;
	var index=getOrder(numMatchesFull);

	for(var k=0;k<numMatchesFull;k++){
		result.push(-1);
	}

	var num = getNumberMatchesFirstRound(listPairs.length);

	for(var m=0;m<num;m++){
		result[index[m]]=courts[(start+next) % courts.length];
		next++;
	}

	var max=numMatchesFull;

	var begin_previous=0;
	var size_previous=result.length;

	while(result.length<(2*max-1)){ // to change

		var inter_result=[];
		var count=0;

		for(var m=0;m<size_previous;m=m+2){
			if(result[begin_previous+m]==-1){
				result.push(courts[(start+next) % courts.length]);
				next++;
			}
			else{
				result.push(result[begin_previous+m]);
			}	
		}
		begin_previous+=size_previous;
		size_previous=size_previous/2;
	}

	for(var j=0;j<result.length;j++){
		if(result[j]!=-1){
			final_result.push(result[j]);
		}
	}

	return next;
}

/*
	Return the number of matches to play for this round
*/

var getNumberMatchesFirstRound = function(nbrPairs){

	var logPairs = Math.log2(nbrPairs);

		var numMatchesFull = Math.floor(logPairs);

	if(logPairs!=numMatchesFull){
		return nbrPairs - Math.pow(2,numMatchesFull);// the nbr of pairs is not a multiple of 2
	}
	else{
		return nbrPairs/2; // the nbr of pairs is a multiple of 2
	}
}


Template.selectCourts.helpers({

	// Returns the number of pools

	'getNumberPoolsSat' : function(){
		var pools = Pools.find({$or: [{type:"mixed"},{type:"family"}]}).fetch();
		return pools.length;
	},

	'getNumberPoolsSun' : function(){
		var pools = Pools.find({$or: [{type:"men"},{type:"women"}]}).fetch();
		return pools.length;
	},

	// Returns the number of courts

	'getNumberCourtsSat' : function(){
		var courts = getCourtNumbers(Courts.find({dispoSamedi: true}).fetch());
		return courts.length;
	},

	'getNumberCourtsSun' : function(){
		var courts = getCourtNumbers(Courts.find({dispoDimanche: true}).fetch());
		return courts.length;
	}
});

Template.selectCourts.events({

	'click #selectCourts':function(event){

		var courtsSat = getCourtNumbers(Courts.find({dispoSamedi: true}).fetch());
		console.log(Courts.find({dispoSamedi: true}).fetch())
		var courtsSun = getCourtNumbers(Courts.find({dispoDimanche: true}).fetch());

		var selectedSat = [];

		var poolsSat = Pools.find({$or: [{type:"mixed"},{type:"family"}]}).fetch();
		var poolsSun = Pools.find({$or: [{type:"men"},{type:"women"}]}).fetch();

		var selectedSun = [];

		if(checkNumberCourts(courtsSat,courtsSun,poolsSat,poolsSun)==false){
			return;
		}

		for(var i=0;i<poolsSat.length;i++){
			selectedSat.push(courtsSat[i]);
		}

		for(var i=0;i<poolsSun.length;i++){
			selectedSun.push(courtsSun[i]);
		}
	
	},

	/*
		Assign courts
	*/

	'click #assignCourts':function(event){

		var numberDays = 2;

		var courtsSat = getCourtNumbers(Courts.find({dispoSamedi: true}).fetch());
		var courtsSun = getCourtNumbers(Courts.find({dispoDimanche: true}).fetch());
		var courtsTable = [courtsSat,courtsSun];

		var poolsSat = Pools.find({$or: [{type:"mixed"},{type:"family"}]}).fetch();
		var poolsSun = Pools.find({$or: [{type:"men"},{type:"women"}]}).fetch();
		var poolsTable = [poolsSat,poolsSun];

		////////// Assign courts to pools \\\\\\\\\\

		for(var g=0;g<numberDays;g++){

			var pools = poolsTable[g];
			var courts = courtsTable[g];

			for(var i=0;i<pools.length;i++){

				var pool = pools[i];

	        	pool.courtId = courts[i];
	        	Meteor.call('updatePool',pool);

	        	// add court to all the matches in the pool

	        	var matches = Matches.find({"poolId" : pool._id}).fetch();

	        	for(var f=0;f<matches.length;f++){
	        		matches[f].courtId = courts[i];
	        		Meteor.call('updateMatch',matches[f]);
	        	}
			}

		}

		////////// KnockOff Tournament \\\\\\\\\\

		var typesSaturday = ["mixed","family"];
		var typesSunday = ["men","women"];
		var typesTable = [typesSaturday,typesSunday];
		var year = Years.findOne({_id:""+new Date().getFullYear()});
		var start = 0;

		////////// Saturday and Sunday \\\\\\\\\\

		for(var g=0;g<numberDays;g++){ // loop through the days

			var typesDay = typesTable[g];

			for(var k=0;k<typesDay.length;k++){ // loop through the types

				var typeDoc = Types.findOne({_id:year[typesDay[k]]});

				for(var t=0;t<categoriesKeys.length;t++){ // loop through the categories

					var temp = categoriesKeys[t]+"Bracket";

					if(typeDoc[categoriesKeys[t]]!=null && typeDoc[temp]!=null){

			 			var nameField = categoriesKeys[t]+"Courts";
			 			typeDoc[nameField] = [];

				 		var next = setCourts(typeDoc[temp], courtsTable[g],start,typeDoc[nameField]);

			 			start=(start+next) % courtsTable[g].length;
			 		}
				}

				Meteor.call('updateType',typeDoc);
			}
		}

	}
});