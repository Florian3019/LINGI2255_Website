Template.brackets.onRendered(function(){
    year = Session.set("brackets/Year",null);
    type = Session.set("brackets/PoolType",null);
    category = Session.set("brackets/PoolCategory",null);
});

var getBracketData = function(pair, round){ // /!\ Round starts at 0 /!\
    /*
      Number of characters allowed for display. 
      When changing this value, don't forget to change the min-width of the g_gracket h3 css element in brackets.html too
    */
    const MAXSIZE = 25;

    pairPlayer1 = Meteor.users.findOne({_id:pair.player1._id},{profile:1});
    pairPlayer2 = Meteor.users.findOne({_id:pair.player2._id},{profile:1});

    pairPlayer1String = pairPlayer1.profile.firstName + " " + pairPlayer1.profile.lastName;
    pairPlayer2String = pairPlayer2.profile.firstName + " " + pairPlayer2.profile.lastName;
    
    data = {
            "player1":pairPlayer1String.substring(0, MAXSIZE), 
            "player2":pairPlayer2String.substring(0, MAXSIZE), 
            "id":pair._id, 
            "score": (pair.tournament==undefined || pair.tournament.length<=round) ? "en jeu" : pair.tournament[round],
            "round":round
    };

    return data;
};

// Round data format : {pair:<pair>, data:<bracketPairData>}
// Returns the best of the 2 pairs or undefined if the score is not yet known. If score is known, updates roundData with the new score
var getBestFrom2 = function(roundData1, roundData2, round){
  if(roundData1==undefined || roundData2==undefined || round==undefined) return undefined;
  if(roundData1.pair && roundData2.pair && roundData1.pair.tournament && roundData2.pair.tournament && round <= roundData1.pair.tournament.length && round <= roundData2.pair.tournament.length){
      // The score to display is the score of the next match !

      newRoundData1 = {data:{}};
      newRoundData1.pair = roundData1.pair;
      newRoundData1.data.player1 = roundData1.data.player1;
      newRoundData1.data.player2 = roundData1.data.player2;
      newRoundData1.data.id = roundData1.data.id;

      s1 = undefined;
      console.log("round " + round);
      if(round<roundData1.pair.tournament.length){
        s1 = roundData1.pair.tournament[round];
      }
      else{
        s1 = '?';
      }
      newRoundData1.data.score = round+1<roundData1.pair.tournament.length ? roundData1.pair.tournament[round+1] : 'en jeu';
      newRoundData1.data.round = round+1;

      newRoundData2 = {data:{}};
      newRoundData2.pair = roundData2.pair;
      newRoundData2.data.player1 = roundData2.data.player1;
      newRoundData2.data.player2 = roundData2.data.player2;
      newRoundData2.data.id = roundData2.data.id;

      s2 = undefined;
      if(round<roundData2.pair.tournament.length){
        s2 = roundData2.pair.tournament[round];
      }
      else{
        s2 = '?';
      }
      newRoundData2.data.score = round+1<roundData2.pair.tournament.length ? roundData2.pair.tournament[round+1] : 'en jeu';
      newRoundData2.data.round = round+1;

      if(s1==='?' || s2==='?') return undefined;

      return s1 > s2 ? newRoundData1 : newRoundData2;
  }

  return undefined;
};

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
    Session.get('brackets/Start'); // Just to make this function reactive to the button press
    year = Session.get("brackets/Year");
    type = Session.get("brackets/PoolType");
    category = Session.get("brackets/PoolCategory");

    yearData = Years.findOne({_id:year});
    if(yearData==undefined) return;
    typeId = yearData[type];
    if(typeId==undefined) return;
    typeData = Types.findOne({_id:typeId});
    if(typeData==undefined) return;
    allWinners = typeData[category.concat("Bracket")]; // List of pairIds
    if(allWinners==undefined){
      console.error("Tournament not started");
      return;
    }
    console.log(allWinners);

    thisRound = []; // {pair:<pair>, data:<bracketPairData>} List of the pairs that made it this round

    /*
      pair Format : 
      pair = {"player1" : <player1String>, "player2": <player2String>, id" : <pairId>, "score" : <score> }
      pairs in firstRound : [item1, item2] representing a knock off match with pair1 against pair2
    */
    firstRound = []; 
    /*
      Create the firstRound
    */
    for(var i=0; i+1<allWinners.length;i+=2){ // Take them 2 by 2
      pairId = allWinners[i];
      pair1 = Pairs.findOne({_id:pairId});
      data1 = getBracketData(pair1,0);

      if(i+1<allWinners.length){
        pairId2 = allWinners[i+1];
        pair2 = Pairs.findOne({_id:pairId2});  
        data2 = getBracketData(pair2,0);
        firstRound.push([data1, data2]);
        thisRound.push({"pair":pair1, "data":data1});
        thisRound.push({"pair":pair2, "data":data2});
      }
    }

    brackets = [firstRound];

    /*
      Fill the rest of the rounds with "?" or the score
    */
    empty = {"player1":"?", "player2":"?", "id":undefined, "score":"?", "round":undefined};

    round = 0;
    while(thisRound.length>1){
      // console.log("allWinners : " + allWinners.length);
      // console.log("thisRound : "+thisRound.length);

      // round = allWinners.length*2/thisRound.length -1; // Starts at 0
      newRound = []; // list of roundData

      // Select the best pair from the 2
      for(var i=0; i+1<thisRound.length ; i+=2){
        best = getBestFrom2(thisRound[i], thisRound[i+1], round);
        newRound.push(best);
      }


      // For each selected pair, convert that pair into an object that can be displayed
      nextRound = [];
      for(var i=0; i+1<newRound.length ; i+=2, round){
        // a plays against b
        a = newRound[i];
        b = newRound[i+1];

        nextRound.push([a==undefined ? empty:a.data, b==undefined ? empty:b.data]);
      } 

      // Add that object to the list of stuff to display
      brackets.push(nextRound);

      if(nextRound.length==1){
        console.log(round+1);
        a = getBestFrom2(newRound[0], newRound[1], round+1);
        if(a!=undefined){
          if(round+1<a.pair.tournament.length){
            a.data.score = a.pair.tournament[round+1];
          }
          else{
            a.data.score = '?';
          }
          console.log(a.data);
        }
        
        brackets.push([[a==undefined ? empty:a.data]]);
      }

      thisRound = nextRound;
      round++;
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

  'getScore':function(){
    pairId = Session.get('brackets/clicked');
    if(pairId==undefined) return;
    pair = Pairs.findOne({_id:pairId}, {tournament:1});

    round = Session.get('brackets/round');
    if(pair.tournament!=undefined && round<pair.tournament.length){
      return pair.tournament[round];  
    }
    return 0;
  }
});



Template.brackets.events({

	// Do something when the user clicks on a player
  "click .g_team":function(event, template){
    var pairId = event.currentTarget.id;
    console.log(pairId);

    mod = document.getElementById("bracketModal");
    round = event.currentTarget.dataset.round;
    console.log("round :" + round);
    // console.log(event);
    if(round!=undefined){
      Session.set('brackets/clicked', pairId);
      Session.set('brackets/round', round);
      $("#bracketModal").modal('show');
    }
    // mod.modal('show');
    // mod.modal('hide');

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

  'click #start':function(event){
    Session.set('brackets/Start', true);
    Meteor.call('startTournament', Session.get('brackets/Year'), Session.get('brackets/PoolType'), Session.get('brackets/PoolCategory'));
  },

  'click #saveScore':function(event){
    pairId = Session.get('brackets/clicked');
    if(pairId==undefined) return;
    pair = Pairs.findOne({_id:pairId}, {tournament:1});

    round = Session.get('brackets/round');
    score = document.getElementById("scoreInput").value;
    score = parseInt(score);
    newTournament = pair.tournament;

    if(newTournament==undefined){
      newTournament = [];
    }

    if(round>=newTournament.length){
      // The score is new, so we need to add it to the array
      if(round==newTournament.length){
        newTournament.push(score);
      }
      else{
        console.error("saveScore error : trying to set the score for a round whose previous score isn't set yet");
        return;
      }
    }
    else{
      // Score already existed, but is now modified
      newTournament[round] = score;
    }


    Pairs.update({_id:pairId}, {$set: {tournament:newTournament}});

  }

});
