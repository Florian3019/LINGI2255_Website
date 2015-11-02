
// Do Session.set('brackets/update',Session.get('brackets/update') when you want to update the brackets (and only then).

Template.brackets.onRendered(function(){
    year = Session.set("brackets/Year",null);
    type = Session.set("brackets/PoolType",null);
    category = Session.set("brackets/PoolCategory",null);
});

const react = {reactive: false};

var canModifyCourt = function(pair, round){
  var ret = (pair.tournamentCourts==undefined && round==0) || (pair.tournamentCourts!=undefined && round==pair.tournamentCourts.length)
  return ret;
}

// Takes 2 round data, and returns which court to use for this match. 
var getCourt = function(roundData1, roundData2, round){
  return "hello"; // TODO
}

/*  
  Takes 2 round data, and decides which court to use for this match. 
  This function must edit roundData1.data.courtId and roundData2.data.courtId 
  and reflect the changes made in the database
*/
var setCourt = function(roundData1, roundData2, round){
  if(a == undefined || b==undefined){
    return;
  }

  pair1 = roundData1.pair; // Pair object
  pair2 = roundData2.pair; // Pair object


  /*
    Logic to choose the court
  */
  // if we can't modify the court, either we already did this computation or the user manually set the courtId --> don't touch it
  // Can only modify courts in increasing round order (i.e. can't modify round 5 if round 4 is not set)
  if(canModifyCourt(pair1, round) && canModifyCourt(pair2, round)){
    // Automatically set the courtId, or leave it undefined
    automaticCourtId = getCourt(roundData1, roundData2, round);
    if(automaticCourtId!=undefined){
      if(pair1.tournamentCourts==undefined) pair1.tournamentCourts = [];
      if(pair2.tournamentCourts==undefined) pair2.tournamentCourts = [];

      pair1.tournamentCourts.push(automaticCourtId);
      pair2.tournamentCourts.push(automaticCourtId);
      Pairs.update({"_id":pair1._id},{$set:{"tournamentCourts":pair1.tournamentCourts}}); // update the db
      Pairs.update({"_id":pair2._id},{$set:{"tournamentCourts":pair2.tournamentCourts}}); // update the db
    }
  }

  if(pair1.tournamentCourts==undefined){
    // No data
    console.warn("setCourt : 2 pairs do not have a court to play");
    console.warn(pair1);
    console.warn(pair2);
    console.warn("round "+round);
    roundData1.data.courtId = undefined;
    roundData2.data.courtId = undefined;
    return;
  }

  courtId = pair1.tournamentCourts[round];
  if(courtId!=undefined && courtId!=pair2.tournamentCourts[round]){
    // Inconsistent data
    console.error("setCourt : 2 pairs that play together are not on the same court !");
    console.error(pair1);
    console.error(pair2);
    console.error("courtId " + courtId + " round "+round);
    return;
  }

  roundData1.data.courtId = courtId;
  roundData2.data.courtId = courtId;
}

var getPoints = function(pair, round){
  return pair.tournament[round];
}

var setPoints = function(pair, round, points){
  if(pair.tournament==undefined){
    pair.tournament = [];
  }

  if(round>=pair.tournament.length){
      // The score is new, so we need to add it to the array
      if(round==pair.tournament.length){
        pair.tournament.push(score);
      }
      else{
        console.error("saveScore error : trying to set the score for a round whose previous score isn't set yet");
        return;
      }
    }
    else{
      // Score already existed, but is now modified
      pair.tournament[round] = score;
    }
}

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
            "score": (pair.tournament==undefined || pair.tournament.length<=round) ? "en jeu" : getPoints(pair, round),
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
    s = getPoints(roundData.pair, round);
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

function clearInner(node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
}

function clear(node) {
  while (node.hasChildNodes()) {
    clear(node.firstChild);
  }
  node.parentNode.removeChild(node);
  // console.log(node, "cleared!");
}

var resetBrackets = function(document){
  /*  Prevent duplication of the brackets --> remove the previous one */
    var myNode = document.getElementById("gracketContainer");
    // $('#gracketContainer').empty();

    // if(myNode!=undefined) while (myNode.firstChild) {
    //   myNode.removeChild(myNode.firstChild);
    // }
    if(myNode!=undefined) clearInner(myNode);

    console.log("resetBrackets");
    console.log(document.getElementById("gracketContainer"));
    // if(parent!= undefined){
    //   // Remove a pre-existing gracket element
    //   child = document.getElementById("gracketContainer");
    //   // $("#gracketContainer").empty();
    //   if(child!=undefined) parent.removeChild(child);

    //   $(".g_round").remove();

    //   // Add an empty gracket element
    //   var div = document.createElement("div");
    //   div.className = "my_gracket";
    //   div.id = "gracketContainer";
    //   parent.appendChild(div);
    // }
}

var displayBrackets =  function(document,brackets){
  console.log("displayBrackets");
  if(gracketContainer!=undefined) gracketContainer.removeAttribute("hidden");
  gracket = document.getElementsByClassName("my_gracket");
  
  if(gracket.length==0) return;
  
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
};

var setInfo = function(document, msg){
  infoBox = document.getElementById("infoBox");
  infoMsg = document.getElementById("infoMsg");
  if(infoBox!=undefined ){ // check that the box is already rendered
    infoBox.removeAttribute("hidden");
    infoMsg.innerHTML = msg;
  }
  g = document.getElementById("gracketContainer");
  if(g!=undefined) g.setAttribute("hidden","");
};

function getSelectedText(document, elementId) {
    var elt = document.getElementById(elementId);
    if(elt==undefined) return null;

    if (elt.selectedIndex == -1)
        return null;
    return elt.options[elt.selectedIndex].text;
}

Template.brackets.helpers({
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
      return getPoints(pair, round);  
    }
    return 0;
  },

  'getAllWinners' : function(){
    Session.get('brackets/update');
    return handleBracketErrors(document);
  }

});

// Helper of makeBrackets
var handleBracketErrors = function(document){
    /********************************************
      Error Handling and data gathering
    ********************************************/
    year = Session.get("brackets/Year");
    type = Session.get("brackets/PoolType");
    category = Session.get("brackets/PoolCategory");

    startButton =  document.getElementById("start");

    yearData = Years.findOne({_id:year});
    if(yearData==undefined){
      console.info("No data found for year "+year);
      setInfo(document, "Pas de données trouvées pour l'année "+year);
      if(year!=undefined && type!=undefined && category!=undefined && startButton!=undefined) startButton.style.visibility = 'hidden';
      return;  
    } 
    typeId = yearData[type];
    if(typeId==undefined){
      console.info("No data found for type "+type);
      setInfo(document, "Pas de données trouvées pour le type "+getSelectedText(document, "PoolType") + " de l'année "+year);
      if(year!=undefined && type!=undefined && category!=undefined && startButton!=undefined) startButton.style.visibility = 'hidden';
      return;  
    } 
    typeData = Types.findOne({_id:typeId});
    if(typeData==undefined){
      console.error("handleBracketErrors : id search on the Types DB failed");
      if(year!=undefined && type!=undefined && category!=undefined && startButton!=undefined) startButton.style.visibility = 'hidden';
      return;  
    }
    if(typeData[category]==undefined){
      console.info("No matches for pools of category "+category + ", type "+type, " at year "+year);
      setInfo(document, "Pas de données trouvées pour la catégorie "
        + getSelectedText(document, "PoolCategory")  
        + " du type "+getSelectedText(document, "PoolType") 
        + " de l'année "+year);
      if(year!=undefined && type!=undefined && category!=undefined && startButton!=undefined) startButton.style.visibility = 'hidden';
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
        + ". Si vous en avez créé, cliquez sur redémarrer le tournoi pour mettre à jour");
      return;
    }
    infoBox = document.getElementById("infoBox");
    if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // hide any previous info message
    // gracketContainer = document.getElementById("gracketContainer");
    // console.log(gracketContainer);
    // console.log("handleBracketErrors");
    return allWinners;
}

var makeBrackets = function(document){
  allWinners = handleBracketErrors(document);
  if(allWinners==undefined) return;
  /********************************************
    First round creation
  ********************************************/
   thisRound = []; // {pair:<pair>, data:<bracketPairData>} List of the pairs that made it this round (contains roundData)

  /*
    pair display Format : 
    pair = {"player1" : <player1String>, "player2": <player2String>, id" : <pairId>, "score" : <score>, "courId":<courtId>}
    pairs in firstRound : [item1, item2] representing a knock off match with pair1 against pair2
  */
  firstRound = []; 
  /*
    Create the firstRound
  */
  for(var i=0; i+1<allWinners.length;i+=2){ // Take them 2 by 2
    pairId = allWinners[i];
    pair1 = Pairs.findOne({_id:pairId},{reactive:false});
    data1 = getBracketData(pair1,0);

    if(i+1<allWinners.length){
      pairId2 = allWinners[i+1];
      pair2 = Pairs.findOne({_id:pairId2},{reactive:false});  
      data2 = getBracketData(pair2,0);
      a = {"pair":pair1, "data":data1};
      b = {"pair":pair2, "data":data2};
      setCourt(a, b, 0);
      firstRound.push([a.data, b.data]);

      thisRound.push(a);
      thisRound.push(b);
    }
  }

  brackets = [firstRound];

  /********************************************
    Other rounds creation
  ********************************************/

  /*
    Fill the rest of the rounds with "?" or the score
  */
  empty = {"player1":"?", "player2":"?", "id":undefined, "score":"?", "round":undefined, 'courtId':undefined};

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

      setCourt(a, b, round+1); // Define which court to use for that match
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

      if(a!=undefined){
        if(r<a.pair.tournament.length){
          a.data.score = 'Gagnant';
          // a.data.score = getPoints(pair, r);
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
}

Template.gracketTemplate.helpers({
  'makeBrackets': function(){
    return makeBrackets(document);
  },

  'displayBrackets' : function(brackets){
    resetBrackets(document);
    displayBrackets(document, brackets);
  }
})

Template.gracketTemplate.onRendered(function(){
  resetBrackets(document);
  brackets = makeBrackets(document);
  displayBrackets(document, brackets);
});

var changed = false;

Template.brackets.events({

	// Do something when the user clicks on a player
  "click .g_team":function(event, template){
    var pairId = event.currentTarget.id;
    mod = document.getElementById("bracketModal");
    round = event.currentTarget.dataset.round; // if undefined --> means '?'
    courtId = event.currentTarget.dataset.courtid; // can be undefined

    // Display modal to edit the score
    if(round!=undefined){ // Only allow to click on pairs that are not "?"
      Session.set('brackets/clicked', pairId);
      Session.set('brackets/round', round);
      $("#bracketModal").modal('show');
    }
  },

  'click .PoolType':function(event){
    if(Session.get('brackets/PoolType') != event.target.value){
     Session.set('brackets/PoolType', event.target.value);
     changed = true;
     Session.set('brackets/update',Session.get('brackets/update') ? false:true);
    }
  },
  'click .PoolCategory':function(event){
    // if(Session.get('brackets/PoolCategory') != event.target.value) resetBrackets(document);
    if(Session.get('brackets/PoolCategory') != event.target.value){
     Session.set('brackets/PoolCategory', event.target.value);
     console.log("changed");
     changed = true;
     Session.set('brackets/update',Session.get('brackets/update') ? false:true);
    }
  },
  'click .Year':function(event){
    // if(Session.get('brackets/Year') != event.target.value) resetBrackets(document);
    if(Session.get('brackets/Year') != event.target.value){
     Session.set('brackets/Year', event.target.value);
     changed = true;
     Session.set('brackets/update',Session.get('brackets/update') ? false:true);
    }
  },

  'click #start':function(event){
    if(changed){
      callback = function(err, status){
        changed = false;
        Session.set('brackets/update',Session.get('brackets/update') ? false:true);
      };
      console.log("calling startTournament");
      year = Session.get('brackets/Year');
      type = Session.get('brackets/PoolType');
      cat = Session.get('brackets/PoolCategory');
      Meteor.call('startTournament', year, type, cat, callback);
    }
  },

  'click #saveScore':function(event){
    pairId = Session.get('brackets/clicked');
    if(pairId==undefined) return;
    pair = Pairs.findOne({_id:pairId}, {tournament:1});

    round = Session.get('brackets/round');
    score = document.getElementById("scoreInput").value;
    score = parseInt(score);
    setPoints(pair, round, score);
    Pairs.update({"_id":pairId}, {$set: {"tournament":pair.tournament}});
    changed = true;
    Session.set('brackets/update',Session.get('brackets/update') ? false:true); // Update the brackets to reflect the new score
  }

});
