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

var setRoundData = function(roundData){
  newRoundData = {data:{}};
  newRoundData.pair = roundData.pair;
  newRoundData.data.player1 = roundData.data.player1;
  newRoundData.data.player2 = roundData.data.player2;
  newRoundData.data.id = roundData.data.id;

  s = undefined;
  if(round<roundData.pair.tournament.length){
    s = roundData.pair.tournament[round];
  }
  else{
    s = '?';
  }

  // The score to display is the score of the next match !
  newRoundData.data.score = round+1<roundData.pair.tournament.length ? roundData.pair.tournament[round+1] : 'en jeu';
  newRoundData.data.round = round+1;
  return {"s":s, "r":newRoundData};
};


// Round data format : {pair:<pair>, data:<bracketPairData>}
// Returns the best of the 2 pairs or undefined if the score is not yet known. If score is known, updates roundData with the new score
var getBestFrom2 = function(roundData1, roundData2, round){
  if(roundData1==undefined || roundData2==undefined || round==undefined) return undefined;
  if(roundData1.pair && roundData2.pair && roundData1.pair.tournament && roundData2.pair.tournament && round <= roundData1.pair.tournament.length && round <= roundData2.pair.tournament.length){
      
      a = setRoundData(roundData1);
      b = setRoundData(roundData2);

      if(a.s==='?' || b.s==='?') return undefined;

      return a.s > b.s ? a.r : b.r;
  }

  return undefined;
};

var resetBrackets = function(document){
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
}

var setInfo = function(document, msg){
  infoBox = document.getElementById("infoBox");
  infoMsg = document.getElementById("infoMsg");
  if(infoBox!=undefined ){ // check that the box is already rendered
    infoBox.removeAttribute("hidden");
    infoMsg.innerHTML = msg;
  }
}

function getSelectedText(document, elementId) {
    var elt = document.getElementById(elementId);

    if (elt.selectedIndex == -1)
        return null;

    return elt.options[elt.selectedIndex].text;
}

Template.brackets.helpers({

  'makeBrackets' : function(){
    
    resetBrackets(document);

    Session.get('brackets/Start'); // Just to make this function reactive to the button press
    year = Session.get("brackets/Year");
    type = Session.get("brackets/PoolType");
    category = Session.get("brackets/PoolCategory");

    startButton =  document.getElementById("start");


    yearData = Years.findOne({_id:year});
    if(yearData==undefined){
      console.info("No data found for year "+year);
      setInfo(document, "Pas de données trouvées pour l'année "+year);
      if(year!=undefined && type!=undefined && category!=undefined) startButton.style.visibility = 'hidden';
      return;  
    } 
    typeId = yearData[type];
    if(typeId==undefined){
      console.info("No data found for type "+type);
      setInfo(document, "Pas de données trouvées pour le type "+getSelectedText(document, "PoolType") + " de l'année "+year);
      if(year!=undefined && type!=undefined && category!=undefined) startButton.style.visibility = 'hidden';
      return;  
    } 
    typeData = Types.findOne({_id:typeId});
    if(typeData==undefined){
      console.error("makeBrackets : id search on the Types DB failed");
      if(year!=undefined && type!=undefined && category!=undefined) startButton.style.visibility = 'hidden';
      return;  
    }
    if(typeData[category]==undefined){
      console.info("No matches for pools of category "+category + ", type "+type, " at year "+year);
      setInfo(document, "Pas de données trouvées pour la catégorie "
        + getSelectedText(document, "PoolCategory")  
        + " du type "+getSelectedText(document, "PoolType") 
        + " de l'année "+year);
      if(year!=undefined && type!=undefined && category!=undefined) startButton.style.visibility = 'hidden';
      return;
    }

    allWinners = typeData[category.concat("Bracket")]; // List of pairIds
    
    if(allWinners==undefined){
      if(startButton!=undefined){
        console.info("Tournament not started");
        startButton.innerHTML="Démarrer le tournoi";
        startButton.style.visibility = 'visible';
      }
      return;
    }
    if(startButton!=undefined){
      startButton.innerHTML="Redémarrer le tournoi";
      startButton.style.visibility = 'visible';
    } 

    if(allWinners.length==0){
      console.info("There are no matches for that year, type and category, did you create any ?");
      setInfo(document, "Pas de matchs pour l'année "+year
        + " type " + getSelectedText(document, "PoolType")
        + " de la catégorie " + getSelectedText(document, "PoolCategory")
        + ".Si vous en avez créé, cliquez sur redémarrer le tournoi pour mettre à jour");
      return;
    }
    infoBox = document.getElementById("infoBox");
    if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // hide any previous info message

    thisRound = []; // {pair:<pair>, data:<bracketPairData>} List of the pairs that made it this round (contains roundData)

    /*
      pair display Format : 
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
      newRound = []; // list of roundData

      // Select the best pair from the 2 for each match
      for(var i=0; i+1<thisRound.length ; i+=2){
        best = getBestFrom2(thisRound[i], thisRound[i+1], round);
        newRound.push(best); // best contains a pair and its display data
      }

      // For each selected pair, convert that pair into an object that can be displayed
      nextRound = []; // contains objects that are going to be displayed
      for(var i=0; i+1<newRound.length ; i+=2, round){
        // a plays against b
        a = newRound[i];
        b = newRound[i+1];

        nextRound.push([a==undefined ? empty:a.data, b==undefined ? empty:b.data]);
      } 

      // Add that object to the list of stuff to display
      if(nextRound.length>0) brackets.push(nextRound);

      // If newRound.length == 1 --> only 2 pairs in the tournament
      // If nextRound.length == 2 --> we are at the last 2 pairs of the tournament and need to display the winner
      if(newRound.length==1 || nextRound.length==2){

        // If there are only 2 pairs in the tournament, we need to take the information from the firstRound (or in this case thisRound)
        // If there are only 2 pairs in the tournament, we need to take the information from the newly created round
        a = newRound.length==1 ? getBestFrom2(thisRound[0], thisRound[1], round) : getBestFrom2(newRound[0], newRound[1], round+1);
        r = newRound.length==1 ? round : round+1;

        // Set the score to be the same score as the round we currently are at (and not the next round, as done by getBestFrom2)
        if(a!=undefined){
          if(r<a.pair.tournament.length){
            a.data.score = a.pair.tournament[r];
          }
          else{
            a.data.score = '?';
          }
        }
        ultimateWinner = [a==undefined ? empty:a.data];
        brackets.push([ultimateWinner]); // Only one pair: the winner
      }

      thisRound = newRound;
      round++;
    }

    return brackets;
  },

  'displayBrackets': function(brackets){
    var myFunction = function($){

      console.warn("Make sure the min-width of the .gracket_h3 element is set to width of the largest name/player. Gracket needs to build its canvas based on the width of the largest element. We do this my giving it a min width. I'd like to change that!");

      // Load script (script HAS TO BE in the public folder)
      $.getScript( "javascript/jquery.gracket.js" )
          .done(function( script, textStatus ) {
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
    pair = Pairs.findOne({"_id":pairId}, {"tournament":1});

    if(pair==undefined){
      console.warn("getScore warning : pair not found with pairId provided");
      return;
    }

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
    mod = document.getElementById("bracketModal");
    round = event.currentTarget.dataset.round;

    // Display modal to edit the score
    if(round!=undefined){ // Only allow to click on pairs that are not "?"
      Session.set('brackets/clicked', pairId);
      Session.set('brackets/round', round);
      $("#bracketModal").modal('show');
    }
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
    // resetBrackets(document);
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
