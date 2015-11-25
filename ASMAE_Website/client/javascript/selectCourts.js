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
var getNCourts = function(previouscourts, courts, n, start){
	var result = [];

	if(typeof previouscourts === "undefined"){

		console.log(n);

		for(var k=0; k<n;k++){
			result.push(courts[(start+k) % courts.length]);
		}

	}
	else{
		var l = previouscourts.length-1;

		var strt = 0;
		var last;

		if(previouscourts.length%2!=0){
			strt=1
		}

		if(previouscourts.length<=n){
			for(var k=0; k<n && l>=k;k++){
				result.push(previouscourts[l-k]);
			}

			last=k;
		}
		else{
			for(var k=strt; k<n+strt && l>=(2*k);k++){
				result.push(previouscourts[l-(2*k)]);
			}
			last=k;
		}

		result = result.reverse();

		for(var k=last; k<n;k++){
			result.push(courts[(start+k) % courts.length]);
		}

	}

	return result;
}

/*
	Return the number of matches to play for this round
*/

var getNumberMatches = function(nbrPairs,round){

	if(round<0){
		return 0;
	}

	var logPairs = Math.log2(nbrPairs);

	if(round==0){

		// get the number of matches to play for the first round

		var numMatchesFull = Math.floor(logPairs);

		if(logPairs!=numMatchesFull){
			return nbrPairs - Math.pow(2,numMatchesFull);// the nbr of pairs is not a multiple of 2
		}
		else{
			return nbrPairs/2; // the nbr of pairs is a multiple of 2
		}
	}

	// get the number of matches for the other rounds
	// get the number of match for the first round if the nbr of pairs were a power of 2
	var full = Math.pow(2,Math.floor(logPairs))/2;

	for(var k=0;k<round;k++){
		full=full/2;
	}

	return full;
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

		var typesDocs= [];

		for(var g=0;g<numberDays;g++){
			typesDocs.push([]);
			var types = typesTable[g];
			for(var k=0;k<types.length;k++){
				if(year[types[k]]){
					var temp = Types.findOne({_id:year[types[k]]});

					if(typeof temp !== "undefined"){
						typesDocs[g].push(temp);
					}
				}
			}
		}

		var finished = false;
		var first = true;
		var round = 0;

		while(!finished){
			finished = true;

			for(var g=0;g<numberDays;g++){

				var typesDoc = typesDocs[g];

				for(var k=0;k<typesDoc.length;k++){

					for(var t=0;t<categoriesKeys.length;t++){

						var temp = categoriesKeys[t]+"Bracket";

						if(typesDoc[k][categoriesKeys[t]]!=null && typesDoc[k][temp]!=null){

				 			var nameField = categoriesKeys[t]+"Courts";

				 			var nbr = getNumberMatches(typesDoc[k][temp].length,round);

				 			if(!first &&typesDoc[k][nameField].length<(typesDoc[k][temp].length-1)){
				 				typesDoc[k][nameField]=typesDoc[k][nameField].concat(getNCourts(typesDoc[k][nameField],courtsTable[g],nbr,start));
				 				finished=false;
				 			}

				 			if(first){
				 				typesDoc[k][nameField] = getNCourts(undefined, courtsTable[g],nbr,start);
				 				finished = false;
				 			}

				 			start=(start+nbr) % courtsTable[g].length;
				 		}
					}
				}
			}

			start = 0;
			first=false;
			round++;
		}

		for(var g=0;g<numberDays;g++){
			for(var k=0;k<typesDocs[g].length;k++){
				var types = typesDocs[g];
				Meteor.call('updateType',types[k]);
			}
		}
	}
});