/*
  Returns the winners of the pool with id poolId. Helper of getCategoryWinners. Resets the tournament points.
*/
var getPoolWinners = function(poolId){

  pool = Pools.findOne({_id:poolId}, {pairs:1});

  const MAXWINNERS = 2; // Change this value if needed. Must be a multiple of 2

  if(MAXWINNERS%2!=0){
    console.error("MAXWINNERS must be a multiple of 2");
    return;
  }

  pairPoints = {}; // key = pair, value = total points

  // For every pair of the pool, store its total points into pairPoints
  for(var i=0; i<pool.pairs.length;i++){
    data = {"poolId":poolId};
    pairId = pool.pairs[i];
    
    // Unset previous tournament match for that pair
    Pairs.update({"_id":pairId}, {$unset:{"tournament":""}});

    data[pairId] = {$exists:true};

    toReturn = {};
    toReturn[pool.pairs[i]] = 1;
    m = Matches.find(data,toReturn).fetch(); // Get all the matches in which this pair played
    // For every match where that pair played
    for(var j=0; j<m.length; j++){
      match = m[j];

      // If the key doesn't exist yet, initialize it to 0
      if(!pairPoints[pool.pairs[i]]){
        pairPoints[pool.pairs[i]] = 0;
      }

      // Increase that pair's total score
      pairPoints[pool.pairs[i]] += match[pool.pairs[i]];
    }
  }
  keys = Object.keys(pairPoints); // List of pairIds

  // Sorter for pairPoints (by descending order)
  var pointComparator = function(a,b){
    // Return a number > 0 if a is after b
    // Return a number < 0 if a is before b
    return pairPoints[b]-pairPoints[a];
  }

  keys.sort(pointComparator);

  winners = [];
  var i = 0;
  equals = false;
  // Select the winners from all the pairs. The best pairs are first in "keys"
  for(i=0; (i<MAXWINNERS || equals) && i<keys.length; i++){
    winners.push(keys[i]);
    // TODO deal with equalities in the points
  }

  return winners;
};

/*
  Give this function a category from Years->Types->Category = list of pool ids 
  and it will return a list of pairs that were winners in their pool
*/
var getCategoryWinners = function(poolIdList){
  allWinners = []; // list of pairIds
  for(var i=0; i<poolIdList.length;i++){
    poolWinners = getPoolWinners(poolIdList[i]);
    for(var j=0; j<poolWinners.length;j++){
      allWinners.push(poolWinners[j]);
    }
  }

  return allWinners;
};

Meteor.methods({
  'startTournament': function(year, type, category){
    if(year==undefined || type==undefined || category==undefined){
      console.error("startTournament : year, type or category is undefined");
      return;
    }

    typ = {};
    typ[type] = 1;
    yearData = Years.findOne({"_id":year}, typ);
    if(yearData==undefined) return;
    typeId = yearData[type];
    if(typeId==undefined) return;
    cat = {};
    cat[category] = 1;
    typeData = Types.findOne({"_id":typeId},cat);
    if(typeData==undefined) return;
    poolIdList = typeData[category];
    if(poolIdList==undefined) return;
    var winners = getCategoryWinners(poolIdList);


    data = {"_id":typeId};
    data[category.concat("Bracket")] = winners;
    Meteor.call("updateType", data);
  }

});