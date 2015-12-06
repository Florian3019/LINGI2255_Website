/*
  This file defines how pairs are chosen for the knock-offs.
*/

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
        pairPoints[pairId] = {"points":0, "victories":0, "pairId":pairId, "poolId":poolId, "courtNumber":pool.courtId};//TODO : courtNumber
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

  var comparePoints = function(a,b){

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
};

  pairKeys.sort(comparePoints);
  var i = 0;


  winnerPairPoints = [];
  loserPairPoints = [];
  // Select the winners from all the pairs. The best pairs are first in "&"
  for(i=0; i<MAXWINNERS && i<pairKeys.length; i++){
    winnerPairPoints.push(pairPoints[pairKeys[i]]);
  }
  for(i = i/*keep old value*/; i<pairKeys.length;i++){
    loserPairPoints.push(pairPoints[pairKeys[i]]);
  }
  return {"loserPairPoints":loserPairPoints, "winnerPairPoints":winnerPairPoints};
};

/*
  Give this function a category from Years->Types->Category = list of pool ids 
  and it will return a list of pairs that were winners in their pool
*/
var getCategoryWinners = function(poolIdList, maxWinners){
  allWinnersPairPoints = [];
  allLosersPairPoints = [];
  
  for(var i=0; i<poolIdList.length;i++){
    poolWinners = getPoolWinners(poolIdList[i], maxWinners);
    allLosersPairPoints = allLosersPairPoints.concat(poolWinners.loserPairPoints);
    allWinnersPairPoints = allWinnersPairPoints.concat(poolWinners.winnerPairPoints);
  }

  console.log(allWinnersPairPoints);

  var comparePoints = function(a,b){

  pointDiff = b["points"]-a["points"];

  if(pointDiff!=0){
      // If there is a difference in the points, return that difference
      return pointDiff;
    }

    /*
      Deal with equalities...
    */

    // pair a and b have the same number of points, sort them by the number of victories
    victDiff = b["victories"]-a["victories"];
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
};

 allWinnersPairPoints.sort(comparePoints);
 allLosersPairPoints.sort(comparePoints);

  return {"loserPairPoints":allLosersPairPoints, "winnerPairPoints":allWinnersPairPoints};
};

Meteor.methods({

  /*
    Sets the winners into the db in types[<category>Brackets]
  */
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

    console.log("startTournament");
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

    var winnersData = getCategoryWinners(poolIdList, maxWinners);
    return winnersData;
  },

    // Returns a table of pools corresponding to the table of pool ids (poolIDList)
  'getPoolList' : function(poolIdList){
    list = [];
    for(var i=0;i<poolIdList.length;i++){
      list.push(Pools.findOne({_id:poolIdList[i]}));
    }
  },

  /**
  * @param year : year for which the brackets must be made
  * @param matchType : one of mixed,men,women,family
  *   @param category : preminimes, minimes, cadets, scholars, juniors, seniors or elites
  */
  'makeBrackets' : function(year, matchType, category){

    var yearData = Years.findOne({_id:year});
    var typeId = yearData.matchType;

    var typeData = Types.findOne({_id:typeId});
    var poolIdList = typeData.category;

    var poolList = Meteor.call('getPoolList', poolIdList);

    var winners = []; // Contains the pairs selected to play during the afternoon

    // Go through all pools of that type and that category
    for(var i=0;i<poolList.length;i++){

      var results = {}; // Key : <pairId>, value : <total match points>

      /*
        For each pool, go through all the matches
      */
      var pairMatch = poolList[i].match;
      for(var j=0; j<pairMatch.length;j++){
        /*
          For each pair in the match, add that pair's points to its total points won on all matches
        */

        // If the pair has already been added to the list of results, increment its score, otherwise just set its new score.
        results[pairMatch.pair1] = results[pairMatch.pair1] ? results[pairMatch.pair1]+pairMatch["result.pair1Points"] : pairMatch["result.pair1Points"];
        results[pairMatch.pair2] = results[pairMatch.pair2] ? results[pairMatch.pair2]+pairMatch["result.pair2Points"] : pairMatch["result.pair2Points"];
      }

      /*
        Convert the result object to an array, so that we can sort it
      */
      var sortable = [];
      for (var pair in results) {
        if (p.hasOwnProperty(pair)) { // Check that pair is really a key of results, and not coming from the prototype
            sortable.push({"pair":pair, "points":results[pair]});
          }
      }

      /*
        Sort by descending order based on the pair's result
      */
      sortable.sort(function(a,b){
        // a is before b
        if(a.points > b.points){
          return -1;
        }
        // a is after b
        if(a.points < b.points){
          return 1;
        }
        // points of a are equal to points of b, thus best pair is the one who won against the other (since no egality in a match is allowed)
        if(results[a.pair] > results[b.pair]){
          // a has more points than b, so a must be before b
          return -1;
        }
        // a lost against b, so a is after b
        return 1;
      });



      // Select the best SELECTED pairs of this pool to play during the afternoon
      const SELECTED = 2; // Number of pairs to select per pool
      for (var i=0; i<SELECTED && i<sortable.length; i++){
        winners.push(sortable[i]);
      }
    } // end for each pool


    /*
      Make the brackets
      An element of the bracket is as follows :
      {
        "name":<name>,
        "id":<id>,
        "seed":<seed>,
        "displaySeed":<displaySeed>,
        "score":<score>,
      }
    */
    var winnerMatchList = [];
    var firstRound = [];
    /*
      Just generate the first round
    */
    for(var i=0;i<winners.length;i++){
      var pairData = Pairs.findOne({_id : winners[i]});
      var player1Data = Meteor.users.findOne({_id : pairData.player1._id});
      var player2Data = Meteor.users.findOne({_id : pairData.player2._id});
      firstRound.push([]);
    }

    winnerMatchList.push(firstRound);

    return winnerMatchList;


  }

});