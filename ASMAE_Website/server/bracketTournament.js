var resetPairTournament = function(pairId){
    // Unset previous tournament match for that pair
    Pairs.update({"_id":pairId}, {$unset:{"tournament":"", "tournamentCourts":""}});
}

/*
  Returns the pair id against which pairId played during the match
  @pre Assumes the structure of a match is as described in methods.js (if changes are made to that, this method will fail !)
*/
var getOtherPair = function(match, pairId){
  matchKeys = Object.keys(match);

  // Go through the keys and check if it's the last possible field of match
  for(var i=0; i<matchKeys.length;i++){
    key = matchKeys[i];

    if(!(key==="poolId" || key==="_id" || key==="courtId" || key==="day" || key===pairId)){
      // Then this must be the other pairId
      return key;
    }
  }
  console.error("The other pair (than "+pairId +") for match ");
  console.error(match)
  console.error(" was not found");
  return undefined;
}

/*
  Returns the difference of points between the pair with pairId and the other pair of the match
  --> >0 if pairId won
      <0 if pairId lost
      =0 if draw
*/
var matchPointDiff = function(match, pairId){
  return match[pairId] - match[getOtherPair(match, pairId)];
}

/*
  Returns the winners of the pool with id poolId. Helper of getCategoryWinners. Resets the tournament points.
*/
var getPoolWinners = function(poolId, MAXWINNERS){
  pool = Pools.findOne({_id:poolId}, {pairs:1});

  pairPoints = {}; // key = pair, value = {"points":<total points>, "victories":<number of victories>}

  // For every pair of the pool, store its total points into pairPoints
  for(var i=0; i<pool.pairs.length;i++){
    data = {"poolId":poolId};
    pairId = pool.pairs[i];
    
    resetPairTournament(pairId); // Remove any previous tournament data

    data[pairId] = {$exists:true};

    toReturn = {};
    toReturn[pairId] = 1;
    m = Matches.find(data,toReturn).fetch(); // Get all the matches in which this pair played

    // For every match where that pair played
    for(var j=0; j<m.length; j++){
      match = m[j];

      // If the key doesn't exist yet, initialize it to 0
      if(pairPoints[pairId]==undefined){
        pairPoints[pairId] = {"points":0, "victories":0};
      }

      // Increase that pair's total score
      score = match[pairId];
      pairPoints[pairId]["points"] += score>=0 ? score : 0;

      // Increase that pair's total victories, if it won
      if(matchPointDiff(match,pairId)>0){
        // this pair won that match !
        pairPoints[pairId]["victories"] += 1;
      }

    }
  }
  pairKeys = Object.keys(pairPoints); // List of pairIds

  oneTimeWarning = false;

  // Sorter for pairPoints (by descending order)
  var pointComparator = function(a,b){
    // Return a number > 0 if a is after b
    // Return a number < 0 if a is before b

    pointDiff = pairPoints[b]["points"]-pairPoints[a]["points"];
    if(pointDiff!=0){
      // If there is a difference in the points, return that difference
      return pointDiff;
    }

    /*
      Deal with equalities...
    */

    // pair a and b have the same number of points, sort them by the number of victories
    victDiff = pairPoints[b]["victories"]-pairPoints[a]["victories"];
    if(victDiff!=0){
      return victDiff;
    }

    // pair a and b have the same number of points and victories, sort them in regard of who won against the other
    data1 = {};
    data1[a] = {$exists:true};
    data2 = {};
    data2[b] = {$exists:true};
    m = Matches.find({$and:[data1, data2]}).fetch(); // Get all the matches in which this pair played
    if(m.length!=1){
      console.error("pointComparator : No match found (or multiple matches found) for pair "+a +" and "+b);
      return undefined;
    }

    p = matchPointDiff(m[0], a);
    if(p>0){
      // A won against b
      return -1;
    }
    else{
      // A lost against b
      if(p==0 && !oneTimeWarning){
        oneTimeWarning = true;
        // Can't have equalities...
        console.warn("pointComparator : There are equalities in the matches, selection of the pairs will be random for those equalities ...");
      }  
      return 1;
    }
  }

  pairKeys.sort(pointComparator);
  winners = [];
  var i = 0;

  // Select the winners from all the pairs. The best pairs are first in "&"
  for(i=0; i<MAXWINNERS && i<pairKeys.length; i++){
    winners.push(pairKeys[i]);
  }

  return winners;
};

/*
  Give this function a category from Years->Types->Category = list of pool ids 
  and it will return a list of pairs that were winners in their pool
*/
var getCategoryWinners = function(poolIdList, maxWinners){
  allWinners = []; // list of pairIds
  for(var i=0; i<poolIdList.length;i++){
    poolWinners = getPoolWinners(poolIdList[i], maxWinners);
    for(var j=0; j<poolWinners.length;j++){
      allWinners.push(poolWinners[j]);
    }
  }

  return allWinners;
};

Meteor.methods({
  'startTournament': function(year, type, category, maxWinners){
    if(year==undefined || type==undefined || category==undefined || maxWinners==undefined){
      console.error("startTournament : year, type or category or maxWinners is undefined");
      console.error("year : "+year);
      console.error("type : "+type);
      console.error("category : "+category);
      console.error("maxWinners : "+maxWinners);
      return;
    }
    if(maxWinners<1){
      console.error("maxWinners is smaller than 1");
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
    var winners = getCategoryWinners(poolIdList, maxWinners);


    data = {"_id":typeId};
    data[category.concat("Bracket")] = winners;
    Meteor.call("updateType", data);
  }

});