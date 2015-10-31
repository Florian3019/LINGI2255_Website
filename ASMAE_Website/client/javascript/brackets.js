

// Returns the winners of the pool with id poolId.
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
    data[pool.pairs[i]] = {$exists:true};

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
  console.log("pairPoints");
  console.log(pairPoints);
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
    // If there are equalities in the points, add the next pair too
    // if(i+1<keys.length && pairPoints[keys[i]] == pairPoints[keys[i+1]]){
    //   equals = true;
    // }
    // else{
    //   equals = false;
    // }
  }

  console.log(winners);

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


Template.brackets.onRendered(function(){
    year = Session.set("brackets/Year",null);
    type = Session.set("brackets/PoolType",null);
    category = Session.set("brackets/PoolCategory",null);
});

Template.brackets.helpers({

  'makeBrackets' : function(){


    /*  Prevent duplication of the brackets --> remove the previous one */
    parent = document.getElementById("wrapper");
    if(parent!= undefined){
      // Remove a pre-existing gracket element
      child = document.getElementById("gracketContainer");
      if(child) parent.removeChild(child);

      // Add an empty gracket element
      var div = document.createElement("div");
      div.className = "my_gracket";
      div.id = "gracketContainer";
      parent.appendChild(div);
    }


    /*
      Number of characters allowed for display. 
      When changing this value, don't forget to change the min-width of the g_gracket h3 css element in brackets.html too
    */
    const MAXSIZE = 25;
    year = Session.get("brackets/Year");
    type = Session.get("brackets/PoolType");
    category = Session.get("brackets/PoolCategory");

    yearData = Years.findOne({_id:year});
    if(yearData==undefined) return;
    typeId = yearData[type];
    if(typeId==undefined) return;
    typeData = Types.findOne({_id:typeId});
    if(typeData==undefined) return;
    poolListId = typeData[category];
    if(poolListId==undefined) return;
    allWinners = getCategoryWinners(poolListId);
    console.log(allWinners);

    /*
      pair Format : 
      pair = {"player1" : <player1String>, "player2": <player2String>, id" : <pairId>, "score" : <score> }
      pairs in firstRound : [item1, item2] representing a knock off match with pair1 against pair2
    */
    firstRound = [];
    /*
      Create the firstRound
    */
    for(var i=0; i<allWinners.length;i+=2){ // Take them 2 by 2
      pairId = allWinners[i];
      pair1 = Pairs.findOne({_id:pairId});

      pair1Player1 = Meteor.users.findOne({_id:pair1.player1._id},{profile:1});
      pair1Player2 = Meteor.users.findOne({_id:pair1.player2._id},{profile:1});

      pair1Player1String = pair1Player1.profile.firstName + " " + pair1Player1.profile.lastName;
      pair1Player2String = pair1Player2.profile.firstName + " " + pair1Player2.profile.lastName;
      data1 = {
              "player1":pair1Player1String.substring(0, MAXSIZE), 
              "player2":pair1Player2String.substring(0, MAXSIZE), 
              "id":pair1._id, 
              "score":"en jeu"
      };
      
      if(i+1<allWinners.length){
        pair2 = Pairs.findOne({_id:allWinners[i+1]});  

        pair2Player1 = Meteor.users.findOne({_id:pair2.player1._id},{profile:1});
        pair2Player2 = Meteor.users.findOne({_id:pair2.player2._id},{profile:1});

        pair2Player1String = pair2Player1.profile.firstName + " " + pair2Player1.profile.lastName;
        pair2Player2String = pair2Player2.profile.firstName + " " + pair2Player2.profile.lastName;

        data2 = {
            "player1":pair2Player1String.substring(0, MAXSIZE), 
            "player2":pair2Player2String.substring(0, MAXSIZE), 
            "id":pair2._id, 
            "score":"en jeu"
        };

        firstRound.push([data1, data2]);
      }

      // TODO do something if number of pairs is odd
      // else{
      //   data2 = {"player1":"vide", "player2":"vide", "id":undefined, "score":"/"};
      // }
    }

    brackets = [firstRound];

    /*
      Fill the rest of the rounds with "?"
    */
    n = Math.floor(firstRound.length);
    empty = {"player1":"?", "player2":"?", "id":undefined, "score":"?"};
    // n must be a multiple of 2
    while(n>0){
      nextRound = [];

      if(n!=1){
        for(var i=0; i<Math.floor(n/2); i++){
          nextRound.push([empty,empty]);
        }
      }
      else{
        nextRound.push([empty]);
      }
      brackets.push(nextRound);
      n= Math.floor(n/2);
    }
    return brackets;
  },

  'displayBrackets': function(brackets){
    var myFunction = function($){

      console.warn("Make sure the min-width of the .gracket_h3 element is set to width of the largest name/player. Gracket needs to build its canvas based on the width of the largest element. We do this my giving it a min width. I'd like to change that!");
      console.log("brackets:");
      console.log(brackets);
      TestData = [
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten", "score" : 47 }, {"player1" : "Andrew Miller", "player2" : "Andrew Miller S", "id" : "andrew-miller", "score" : 30} ],
         [ {"player1" : "James Coutry", "player2" : "James Coutry S", "id" : "james-coutry", "score" : 10}, {"player1" : "Sam Merrill", "player2" : "Sam Merrill S", "id" : "sam-merrill", "score":8}],
         [ {"player1" : "Anothy Hopkins", "player2" : "Anothy Hopkins S", "id" : "anthony-hopkins"}, {"player1" : "Everett Zettersten", "player2" : "Everett Zettersten S", "id" : "everett-zettersten"} ],
         [ {"player1" : "John Scott", "player2" : "John Scott S", "id" : "john-scott"}, {"player1" : "Teddy Koufus", "player2" : "Teddy Koufus S", "id" : "teddy-koufus"}],
         [ {"player1" : "Arnold Palmer", "player2" : "Arnold Palmer S", "id" : "arnold-palmer"}, {"player1" : "Ryan Anderson", "player2" : "Ryan Anderson S", "id" : "ryan-anderson"} ],
         [ {"player1" : "Jesse James", "player2" : "Jesse James S", "id" : "jesse-james"}, {"player1" : "Scott Anderson", "player2" : "Scott Anderson S", "id" : "scott-anderson"}],
         [ {"player1" : "Josh Groben", "player2" : "Josh Groben S", "id" : "josh-groben"}, {"player1" : "Sammy Zettersten", "player2" : "Sammy Zettersten S", "id" : "sammy-zettersten"} ],
         [ {"player1" : "Jake Coutry", "player2" : "Jake Coutry S", "id" : "jake-coutry"}, {"player1" : "Spencer Zettersten", "player2" : "Spencer Zettersten S", "id" : "spencer-zettersten"}]
       ], 
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten"}, {"player1" : "James Coutry", "player2" : "James Coutry S", "id" : "james-coutry"} ],
         [ {"player1" : "Anothy Hopkins", "player2" : "Anothy Hopkins S", "id" : "anthony-hopkins"}, {"player1" : "Teddy Koufus", "player2" : "Teddy Koufus S", "id" : "teddy-koufus"} ],
         [ {"player1" : "Ryan Anderson", "player2" : "Ryan Anderson S", "id" : "ryan-anderson"}, {"player1" : "Scott Anderson", "player2" : "Scott Anderson S", "id" : "scott-anderson"} ],
         [ {"player1" : "Sammy Zettersten", "player2" : "Sammy Zettersten S", "id" : "sammy-zettersten"}, {"player1" : "Jake Coutry", "player2" : "Jake Coutry S", "id" : "jake-coutry"} ]
       ],
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten"}, {"player1" : "Anothy Hopkins", "player2" : "Anothy Hopkins S", "id" : "anthony-hopkins"} ],
         [ {"player1" : "Ryan Anderson", "player2" : "Ryan Anderson S", "id" : "ryan-anderson"}, {"player1" : "Sammy Zettersten", "player2" : "Sammy Zettersten S", "id" : "sammy-zettersten"} ]
       ],
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten"}, {"player1" : "Ryan Anderson", "player2" : "Ryan Anderson S", "id" : "ryan-anderson"} ]
       ],
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten"} ]
       ]
     ];

     testData2 = [
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten"}, {"player1" : "Ryan Anderson", "player2" : "Ryan Anderson S", "id" : "ryan-anderson"} ]
       ],
       [
         [ {"player1" : "Erik Zettersten", "player2" : "Erik Zettersten S", "id" : "erik-zettersten"} ]
       ]
     ];

      // Load script (script HAS TO BE in the public folder)
      $.getScript( "javascript/jquery.gracket.js" )
          .done(function( script, textStatus ) {
            // console.log( textStatus );
            // initializer
          $(".my_gracket").gracket({ src : brackets });
          })
        .fail(function( jqxhr, settings, exception ) {
          console.error("Error loading jquery.gracket :" + exception);
        })
      ;

    }; // end my function
    jQuery(myFunction(jQuery));
  },


  'getType':function(){
    return Session.get('brackets/PoolType');
  },
  'getCategory':function(){
    return Session.get('brackets/PoolCategory');
  },
  'getYear':function(){
    return Session.get('brackets/Year');
  },


});



Template.brackets.events({

	// Do something when the user clicks on a player
  "click .g_team":function(event, template){
    var pairId = event.currentTarget.id;
    console.log(pairId);

  	// TODO : redirect to player profile ?

  },

  'click .PoolType':function(event){
    Session.set('brackets/PoolType', event.target.value);
  },
  'click .PoolCategory':function(event){
    Session.set('brackets/PoolCategory', event.target.value);
  },
  'click .Year':function(event){
    Session.set('brackets/Year', event.target.value);
  },

});
