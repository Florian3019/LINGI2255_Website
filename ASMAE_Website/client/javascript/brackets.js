
// Do Session.set('brackets/update',Session.get('brackets/update') when you want to update the brackets (and only then).

const react = {reactive: false};
const emptyCourt = "Terrain ?";
const courtName = "Terrain";
const emptyScore = "";
const emptyPlayer = "?";
const placeHolderScore = "";
const placeHolderPlayer = "/";
const placeHolderCourt = "";
const inGame = "En jeu";
const playerPlaceHolderScore = "Score: --";
const waiting = "En attente";


var canModifyCourt = function(pair, round){
  var ret = (pair.tournamentCourts==undefined && round==0) || (pair.tournamentCourts!=undefined && round==pair.tournamentCourts.length)
  return ret;
}

// Takes 2 round data, and returns which court to use for this match.
var getCourt = function(courts,num){
  return (courts == undefined ) ? emptyCourt : " ("+courtName+": " + courts[num]+")";
}

/*
  Takes 2 round data, and decides which court to use for this match.
  This function must edit roundData1.data.court and roundData2.data.court
  and reflect the changes made in the database
*/
var setCourt = function(roundData1, roundData2, round,courts, num){
  pair1 = roundData1.pair; // Pair object
  pair2 = roundData2.pair; // Pair object

  automaticCourt = emptyCourt;
  /*
    Logic to choose the court
  */
  // if we can't modify the court, either we already did this computation or the user manually set the court --> don't touch it
  // Can only modify courts in increasing round order (i.e. can't modify round 5 if round 4 is not set)
//  if(canModifyCourt(pair1, round) && canModifyCourt(pair2, round)){
  //   // Automatically set the court, or leave it undefined
     automaticCourt = getCourt(courts,num);
  //   if(automaticCourt!=emptyCourt){
//       if(pair1.tournamentCourts==undefined) pair1.tournamentCourts = [];
//       if(pair2.tournamentCourts==undefined) pair2.tournamentCourts = [];

    //   pair1.tournamentCourts.push(automaticCourt);
    //   pair2.tournamentCourts.push(automaticCourt);
     //  Pairs.update({"_id":pair1._id},{$set:{"tournamentCourts":pair1.tournamentCourts}}); // update the db
     //  Pairs.update({"_id":pair2._id},{$set:{"tournamentCourts":pair2.tournamentCourts}}); // update the db
  //   }
//   }

  // if(pair1.tournamentCourts==undefined){
  //   // No data
  //   console.warn("setCourt : 2 pairs do not have a court to play");
  //   console.warn(pair1);
  //   console.warn(pair2);
  //   console.warn("round "+round);
  //   roundData1.data.court = emptyCourt;
  //   roundData2.data.court = emptyCourt;
  //   return;
  // }

  // court = pair1.tournamentCourts[round];
  // if(court!=undefined && pair2!=undefined && pair2.tournament!=undefined && court!=pair2.tournamentCourts[round]){
  //   // Inconsistent data
  //   console.error("setCourt : 2 pairs that play together are not on the same court !");
  //   console.error(pair1);
  //   console.error(pair2);
  //   console.error("court " + court + " round "+round);
  //   return;
  // }
  roundData1.data.court = automaticCourt;
  roundData2.data.court = automaticCourt;
}

var getPoints = function(pair, round){
  if(pair.tournament==undefined) return undefined;
  return pair.tournament[round];
}

var setPoints = function(pair, round, score){
  if(pair==undefined) return;
  if(pair.tournament==undefined){
    pair.tournament = [];
  }

  pair.tournament[round] = score;
  Pairs.update({"_id":pair._id}, {$set: {"tournament":pair.tournament}});
}

var getBracketData = function(pair, round, clickable){ // /!\ Round starts at 0 /!\
    /*
      Number of characters allowed for display.
      When changing this value, don't forget to change the min-width of the g_gracket h3 css element in brackets.html too
    */
    const MAXSIZE = 15;

    if(pair==undefined || pair.player1==undefined || pair.player2==undefined) return;

    pairPlayer1 = Meteor.users.findOne({_id:pair.player1._id},{profile:1});
    pairPlayer2 = Meteor.users.findOne({_id:pair.player2._id},{profile:1});

    pairPlayer1String = pairPlayer1.profile.firstName.substring(0,1) + ". " + pairPlayer1.profile.lastName;
    pairPlayer2String = pairPlayer2.profile.firstName.substring(0,1) + ". " + pairPlayer2.profile.lastName;

    data = {
            "player1":pairPlayer1String.substring(0, MAXSIZE),
            "player2":pairPlayer2String.substring(0, MAXSIZE),
            "id":pair._id,
            "score": (pair.tournament==undefined || pair.tournament.length<=round) ? inGame : getPoints(pair, round),
            "round":round,
            "display":"block",
            "placeHolder":false,
            "clickable":clickable
    };

    return data;
};

var getPlaceHolder = function(round){
  return {
    "pair":"placeHolder", 
    "data":{
      "player1":placeHolderPlayer, 
      "player2":placeHolderPlayer, 
      "id":undefined, 
      "score":placeHolderScore, 
      "round":round, 
      "display":"block",
      "clickable":false,
      "placeHolder":true,
      "court":placeHolderCourt}
    };
}

var getEmpty = function(round, court){
  return {
    "pair":"empty",
    "data":{
      "player1":emptyPlayer, 
      "player2":emptyPlayer, 
      "id":undefined, 
      "score":emptyScore, 
      "display":"block",
      "round":round,
      "clickable":false,
      "placeHolder":false,
      "court": court
    }
  };
}

var setRoundData = function(roundData){
  round = roundData.data.round;
  newRoundData = {
    "pair":roundData.pair,
    "data":{
      "player1":roundData.data.player1, 
      "player2":roundData.data.player2, 
      "id":roundData.data.id, 
      "score":undefined, 
      "display":"block",
      "round":round+1,
      "placeHolder":false,
      "clickable":roundData.clickable,
      "court": emptyCourt
    }
  };

  points = getPoints(roundData.pair, round);
  s = points==undefined ? emptyScore : points;

  // The score to display is the score of the next match !
  nextPoints = getPoints(roundData.pair, round+1);
  s2 = nextPoints == undefined ? inGame : nextPoints;
  newRoundData.data.score = s2;

  return {"s":s, "r":newRoundData};
};

var forwardData = function(roundData){
  round = roundData.data.round;
  points = getPoints(roundData.pair, round+1);
  return {
    "pair":roundData.pair,
    "data":{
      "player1":roundData.data.player1, 
      "player2":roundData.data.player2, 
      "id":roundData.data.id, 
      "score":points==undefined ? (roundData.data.player1===emptyPlayer ? emptyScore : inGame) : points,
      "display":"block",
      "round":round+1, // increase the round
      "clickable":true,
      "court": emptyCourt
    }
  };
}


// Round data format : {pair:<pair>, data:<bracketPairData>}
// Returns the best of the 2 pairs or undefined if the score is not yet known. If score is known, updates roundData with the new score
var getBestFrom2 = function(roundData1, roundData2, round){
  if(roundData1==undefined || roundData2==undefined || round==undefined){
    console.error("getBestFrom2 : Undefined data");
    return;
  }

  if(roundData1.pair==="placeHolder" && roundData2.pair==="placeHolder"){
    return getPlaceHolder(round+1);
  }
  else if(roundData1.pair==="placeHolder"){
    // The other one wins !
    return forwardData(roundData2);
  }
  else if(roundData2.pair==="placeHolder"){
    // The other one wins !
    return forwardData(roundData1);
  }

  if(roundData1.pair==="empty" || roundData2.pair==="empty"){
    return getEmpty(round+1, undefined);
  }

  // if(round <= roundData1.pair.tournament.length && round <= roundData2.pair.tournament.length){

  a = setRoundData(roundData1);
  b = setRoundData(roundData2);

  if(a.s===emptyScore || b.s===emptyScore){
    empty = getEmpty(round+1, undefined);
    return empty;
  }

  return a.s > b.s ? a.r : b.r;
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
}

var resetBrackets = function(document){
  /*  Prevent duplication of the brackets --> remove the previous one */
    var myNode = document.getElementById("gracketContainer");
    if(myNode!=undefined) clearInner(myNode);
}

var displayBrackets =  function(document,brackets){
  gracketContainer = document.getElementById("gracketContainer");
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

Template.brackets.helpers({
  'getGracketWidth':function(){
    return 350*Session.get('brackets/rounds');
  },

  'getType':function(){
    return Session.get('PoolList/Type');
  },
  'getCategory':function(){
    return Session.get('PoolList/Category');
  },
  'getYear':function(){
    return Session.get('PoolList/Year');
  },

  'getPairs':function(){
    pairs = Session.get('brackets/clicked');
    if(pairs==undefined) return;
    pair0 = Pairs.findOne({"_id":pairs[0]});
    pair1 = Pairs.findOne({"_id":pairs[1]});
    return [pair0,pair1];
  },

  'getPlayer':function(playerId){
    return Meteor.users.findOne({"_id":playerId},{"profile":1});
  },

  'getIndex':function(array, index){
    return array[index];
  },

  'getScore':function(pairId){
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

var hideStuff = function(stuff){
  for(s in stuff){
    if(year!=undefined && type!=undefined && category!=undefined && s!=undefined && s.style!=undefined){
      s.style.display = 'none';
    }
  }
}

// Helper of makeBrackets
var handleBracketErrors = function(document){
    /********************************************
      Error Handling and data gathering
    ********************************************/
    year = Session.get("PoolList/Year");
    type = Session.get("PoolList/Type");
    category = Session.get("PoolList/Category");

    pdfButton = document.getElementById("getPDF");
    startButton =  document.getElementById("start");
    // winnersSelect =  document.getElementById("winnersPerPool");
    bracketOptions = document.getElementById("bracketOptions");

    yearData = Years.findOne({_id:year},{reactive:false});
    if(yearData==undefined){
      console.info("No data found for year "+year);
      setInfo(document, "Pas de données trouvées pour l'année "+year);
      hideStuff([bracketOptions,pdfButton]);
      return;
    }
    typeId = yearData[type];
    if(typeId==undefined){
      console.info("No data found for type "+type);
      setInfo(document, "Pas de données trouvées pour le type "+typesTranslate[type] + " de l'année "+year);
      hideStuff([bracketOptions,pdfButton]);
      return;
    }
    typeData = Types.findOne({_id:typeId},{reactive:false});
    if(typeData==undefined){
      console.error("handleBracketErrors : id search on the Types DB failed");
      hideStuff([bracketOptions,pdfButton]);
      return;
    }
    if(typeData[category]==undefined){
      console.info("No matches for pools of category "+category + ", type "+type, " at year "+year);
      setInfo(document, "Pas de données trouvées pour la catégorie "
        + categoriesTranslate[category]
        + " du type "+typesTranslate[type]
        + " de l'année "+year);
      hideStuff([bracketOptions,pdfButton]);
      return;
    }

    allWinners = typeData[category.concat("Bracket")]; // List of pairIds

    if(allWinners==undefined){
      if(bracketOptions!=undefined){
        console.info("Tournament not started");
        startButton.innerHTML="Démarrer le tournoi";
        bracketOptions.style.display = 'block';
        pdfButton.style.display = 'block';
      }
      return;
    }
    if(bracketOptions!=undefined){
      startButton.innerHTML="Redémarrer le tournoi";
      bracketOptions.style.display = 'block';
      pdfButton.style.display = 'block';
    }

    if(allWinners.length==0){
      console.info("There are no matches for that year, type and category, did you create any ?");
      setInfo(document, "Pas de matchs pour l'année "+year
        + " type " + typesTranslate[type]
        + " de la catégorie " + categoriesTranslate[category]
        + ". Si vous en avez créé, cliquez sur redémarrer le tournoi pour mettre à jour");
      return;
    }
    infoBox = document.getElementById("infoBox");
    if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // hide any previous info message
    return allWinners;
}

var setCompletion = function(completion){
  year = Session.get("PoolList/Year");
  type = Session.get("PoolList/Type");
  category = Session.get("PoolList/Category");

  yearData = Years.findOne({"_id":year},{reactive:false});
  typeId = yearData[type];
  var str = "completion.brackets.";
  str = str.concat(category);
  data = {};
  data[str] = completion;
  Types.update({"_id":typeId}, {$set:data},{reactive:false});
}

var hasPoints = function(pairData){
  if(pairData==undefined || pairData.data==undefined) return false;
  var score = pairData.data.score;
  return score === parseInt(score, 10); // Test if points is an integer
}

var getCourts = function(){
  year = Session.get("PoolList/Year");
  type = Session.get("PoolList/Type");
  category = Session.get("PoolList/Category");

  var yearD = Years.findOne({"_id":year},{reactive:false});
  var typeId = yearData[type];
  var typeD = Types.findOne({"_id":typeId},{reactive:false});
  var cat = category+"Courts";

  return typeD[cat];
}

/*
  Returns the next power of two that is greater than or equal to number
*/
var getNextPowerOfTwo = function(number){
  if(number==0) return 0;
  var x = 2;
  while (x<number){
    x*=2
  }
  return x;
}

/*
  Takes an array of roundData and puts it into a nicely spread out round array
*/
var getTournamentFirstRound = function(pairs){
  var tournamentSize = getNextPowerOfTwo(pairs.length); // power of 2

  var toReturn = [];

  var m = 0;
  var k = 0; // Index in pairs
  for(var i=0; i< tournamentSize; i++){
    
    if(k<pairs.length){
      a = pairs[k];
      k++;
    }
    else{
      a = getPlaceHolder(0);
    }

    if(i%2==0){
      index = m;
    }
    else{
      index = (tournamentSize/2) + m;
      m++;
    }

    toReturn[index] = a;
  }

  return toReturn;
}


var makeBrackets = function(document){
  allWinners = handleBracketErrors(document); // Table of winner pair Id
  if(allWinners==undefined) return;
  /********************************************
    First round creation
  ********************************************/

  /*
    pair display Format :
    pair = {"player1" : <player1String>, "player2": <player2String>, id" : <pairId>, "score" : <score>, "court":<court>}
    pairs in firstRound : [item1, item2] representing a knock off match with pair1 against pair2
  */

  var courts = getCourts();

  var matchesCompleted = 0;
  var nextMatchNum = 0;

  var pairData = [];
  for(var i=0; i<allWinners.length;i++){
    pairId = allWinners[i];
    pair = Pairs.findOne({_id:pairId},{reactive:false});
    data = getBracketData(pair,0, "true");
    pairData.push({"pair":pair, "data":data});
  }

  // {pair:<pair>, data:<bracketPairData>} List of the pairs that made it this round (contains roundData)
  thisRound = getTournamentFirstRound(pairData); // Size of a power of 2 

  brackets = [];
  /********************************************
    Other rounds creation
  ********************************************/

  /*
    Fill the rest of the rounds with "?" or the score
  */

  round = 0;
  while(thisRound.length>1){
    newRound = []; // list of roundData

    if(round>0){
      // Select the best pair from the 2 for each match
      for(var i=0; i+1<thisRound.length ; i+=2){
        best = getBestFrom2(thisRound[i], thisRound[i+1], round);
        newRound.push(best); // best contains a pair and its display data
      }
    }
    else{
      newRound = thisRound;
    }

    // For each selected pair, convert that pair into an object that can be displayed
    displayData = []; // contains objects that are going to be displayed
    for(var i=0; i+1<newRound.length ; i+=2){
      // a plays against b
      a = newRound[i];
      b = newRound[i+1];

      if(a.pair!=="placeHolder" && b.pair!=="placeHolder"){
        setCourt(a, b, round,courts,nextMatchNum); // Define which court to use for that match
        nextMatchNum++;
      }
      else if(a.pair==="placeHolder" && b.score!==emptyScore && b.pair!=="placeHolder"){
        // b is playing against a placeHolder
        b.data.clickable = false;
        b.data.court = "";
        if(round==0){
          b.data.score = playerPlaceHolderScore;
        }
      }
      else if(a.pair!=="placeHolder" && a.score!==emptyScore && b.pair==="placeHolder"){
        // a is playing against a placeHolder
        a.data.clickable = false;
        a.data.court = "";
        if(round==0){
          a.data.score = playerPlaceHolderScore;
        }
      }

      if(a.pair!=="empty" && a.pair!=="placeHolder" && b.pair==="empty"){
        a.data.score = waiting;
        a.data.clickable = false;
      }
      else if(b.pair!=="empty" && b.pair!=="placeHolder" && a.pair==="empty"){
        b.data.score = waiting;
        b.data.clickable = false;
      }

      if(hasPoints(a) && hasPoints(b)) matchesCompleted += 1;

      a.data.pair2 = b.data.id;
      b.data.pair1 = a.data.id;

      displayData.push([a.data, b.data]);
    }

    // Add that object to the list of stuff to display
    if(displayData.length>0) brackets.push(displayData);

    // If newRound.length == 1 --> we are at the last 2 pairs of the tournament and need to display the winner
    if(thisRound.length==2){
      a = getBestFrom2(thisRound[0], thisRound[1], round);
      if(getPoints(a.pair, round)!==undefined){
        a.data.score = 'Gagnant';
      }
      else{
        a.data.score = emptyScore;
      }
      a.data.clickable = false;
      a.data.court = "";
      ultimateWinner = [a.data];
      brackets.push([ultimateWinner]); // Only one pair: the winner
      newRound = []; // Stop further rounds
    }

    thisRound = newRound;
    round++;
  }

  Session.set("brackets/rounds",round+1);

  completionPercentage = (nextMatchNum==0) ? 0 : matchesCompleted/nextMatchNum;
  setCompletion(completionPercentage);

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

var getStringOptions = function(){
  return "\ncatégorie: "+Session.get("PoolList/Category")+
      " type: "+Session.get("PoolList/Type") +
      " année: "+Session.get("PoolList/Year");
}

Template.brackets.events({

	// Do something when the user clicks on a player
  "click .g_team":function(event, template){
    var pairId = event.currentTarget.id;
    mod = document.getElementById("bracketModal");
    clickable = event.currentTarget.dataset.clickable;
    if(clickable==="false") return;
    round = event.currentTarget.dataset.round; // if undefined --> means '?'
    // court = event.currentTarget.dataset.court; // can be undefined

    p1 = event.currentTarget.dataset.pair1;
    if(p1!=undefined){
      // pairId is the second pair
      x = [p1, pairId]
    }
    else{
      // pairId is the first pair
      x= [pairId, event.currentTarget.dataset.pair2];
    }

    // Display modal to edit the score
    if(round!=undefined){ // Only allow to click on pairs that are not "?"
      Session.set('brackets/clicked', x);
      Session.set('brackets/round', round);
      $("#bracketModal").modal('show');
    }
  },

  'click #start':function(event){

      console.log("calling startTournament");
      year = Session.get('PoolList/Year');
      type = Session.get('PoolList/Type');
      cat = Session.get('PoolList/Category');

      maxWinners = document.getElementById("winnersPerPool").value;

      callback = function(err, status){
        Meteor.call("addToModificationsLog",
        {"opType":"Création tournoi knock-off",
        "details":
            "Paires par poule: "+maxWinners+getStringOptions()
        });


        Session.set('brackets/update',Session.get('brackets/update') ? false:true);
      };

      if(maxWinners<1){
        console.error("maxWinners can't be lower than 1");
        return;
      }
      Meteor.call('startTournament', year, type, cat, maxWinners, callback);
  },

  'click #saveScore':function(event){
    pairs = Session.get('brackets/clicked');
    if(pairId==undefined) return;
    pair0 = Pairs.findOne({_id:pairs[0]});
    pair1 = Pairs.findOne({_id:pairs[1]});

    round = Session.get('brackets/round');
    score0 = document.getElementById("scoreInput0").value;
    score0 = parseInt(score0);
    setPoints(pair0, round, score0);

    score1 = document.getElementById("scoreInput1").value;
    score1 = parseInt(score1);
    setPoints(pair1, round, score1);

    // u01 = Meteor.users.findOne("_id":pair0.player1._id},{"profile":1});
    // u02 = Meteor.users.findOne("_id":pair0.player2._id},{"profile":1});
    // u11 = Meteor.users.findOne("_id":pair1.player1._id},{"profile":1});
    // u12 = Meteor.users.findOne("_id":pair1.player2._id},{"profile":1});

    // Meteor.call("addToModificationsLog",
    // {"opType":"Modification points match knock-off",
    // "details":
    //     "Round: "+round+
    //     " Paire "+u01.profile.firstName.substring(0,1) + ". " + u01.profile.lastName + " et "+u02.profile.firstName.substring(0,1) + ". " + u02.profile.lastName +
    //     " Points: "+score0+getStringOptions()
    // });

    // Meteor.call("addToModificationsLog",
    // {"opType":"Modification points match knock-off",
    // "details":
    //     "Round: "+round+
    //     " Paire "+u11.profile.firstName.substring(0,1) + ". " + u11.profile.lastName + " et "+u12.profile.firstName.substring(0,1) + ". " + u12.profile.lastName +
    //     " Points: "+score1+getStringOptions()
    // });


    Session.set('brackets/update',Session.get('brackets/update') ? false:true); // Update the brackets to reflect the new score
  },

  'click #getPDF':function(event){
    /*
      Unhide the pdf preview window
    */
    document.getElementsByClassName('preview-pane')[0].removeAttribute('hidden');


    /*
      Create the pdf
    */
    var pdf = new jsPDF('landscape','pt','a4');
    pdf.addHTML($("#gracketContainer").css('background', '#fff'),
    function() {
      /*
      Display the pdf in the html
      */
      var string = pdf.output('datauristring');
      document.getElementsByClassName('preview-pane')[0].setAttribute('src', string);
      $("#gracketContainer").css('background', 'transparent')
    });
  }

});
