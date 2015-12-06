/*
  This file defines how the brackets are created. It uses the plugin in public/jquery.gracket.js to display it on the page.
  As this is directly modifying the html, meteor is not really used to that and this poses various page update challenges.

  The main frame is the following:
  0. Check for any errors and display them to the user if need be.
  1. Fetch the best players from each pool : this is done in server/bracketTournament.js
  2. From that list, ask the user if he is ok with it : this is done in client/buildTournament.js
  3. When he's ok with it, that list needs to be converted in something that can be displayed, and by adding the placeholders
     if the number of pairs is not a power of 2.
     The order in which the pairs play against each other is determined in the function getOrder().
     The conversion to display data is done by makeBrackets()
  4. Once the display data has been generated, the display of the knock-offs is done by calling displayBrackets(), which in turns calls
     the plugin jquery.gracket.js, which inserts the html into the page.


  Do Session.set('brackets/update',!Session.get('brackets/update')) when you want to update the brackets (and only then).
*/


const react = {reactive: false};
const emptyCourt = "?";
const courtName = "";
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
  return (courts == undefined) ? emptyCourt : courts[num];
}

/*
  Takes 2 round data, and decides which court to use for this match.
  This function must edit roundData1.data.court and roundData2.data.court
  and reflect the changes made in the database
*/
var setCourt = function(roundData1, roundData2,courts, num){
  pair1 = roundData1.pair; // Pair object
  pair2 = roundData2.pair; // Pair object

  automaticCourt = emptyCourt;

  automaticCourt = getCourt(courts,num);
  roundData1.data.court = automaticCourt;
  roundData2.data.court = automaticCourt;
  roundData1.data.pos = num;
  roundData2.data.pos = num;
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

var forwardData = function(roundData, canEditScore){
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
      "clickable":canEditScore,
      "court": emptyCourt
    }
  };
}


// Round data format : {pair:<pair>, data:<bracketPairData>}
// Returns the best of the 2 pairs or undefined if the score is not yet known. If score is known, updates roundData with the new score
var getBestFrom2 = function(roundData1, roundData2, round, canEditScore){
  if(roundData1==undefined || roundData2==undefined || round==undefined){
    console.error("getBestFrom2 : Undefined data");
    return;
  }

  if(roundData1.pair==="placeHolder" && roundData2.pair==="placeHolder"){
    return getPlaceHolder(round+1);
  }
  else if(roundData1.pair==="placeHolder"){
    // The other one wins !
    return forwardData(roundData2, canEditScore);
  }
  else if(roundData2.pair==="placeHolder"){
    // The other one wins !
    return forwardData(roundData1, canEditScore);
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

    /*
      Written by the author of the plugin :
      Make sure the min-width of the .gracket_h3 element is set to width of the largest name/player.
      Gracket needs to build its canvas based on the width of the largest element.
      We do this my giving it a min width. I'd like to change that!
    */

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

var hideInfo = function(document){
    infoBox = document.getElementById("infoBox");
    if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // hide any previous info message
}

Template.brackets.helpers({
  'translateType':function(type){
    return typesTranslate[type];
  },

  'isLoading':function(){
    return Session.get('brackets/isLoading');
  },

  'translateCategory':function(category){
    return categoriesTranslate[category];
  },

  'getGracketWidth':function(){
    return 270*Session.get('brackets/rounds');
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

  'getScore':function(pair){
    round = Session.get('brackets/round');
    if(pair.tournament!=undefined && round<pair.tournament.length){
      return getPoints(pair, round);
    }
    return 0;
  },

  'getAllWinners' : function(){
    Session.get('brackets/update');
    return handleBracketErrors(document);
  },

  'buildingTournament' : function(){
    return Session.get('brackets/buildingTournament');
  },

});

var hideStuff = function(document, hideType, hide){
  var stuff;
  if(hideType==="empty"){
    stuff = document.getElementsByClassName("hideIfEmpty");
  }
  else if(hideType==="notStarted"){
    stuff = document.getElementsByClassName("hideIfNotStarted");
  }
  else if(hideType==="showIfNotStarted"){
    stuff = document.getElementsByClassName("showIfNotStarted");
  }
  for(var i=0; i<stuff.length;i++){
    var s = stuff[i];
    if(s.style===undefined){
        s.setAttribute("style","display:block");
    }
    s.style.display = hide ? 'none':'block';
  }
}

var showAll = function(document){
  hideStuff(document, "empty", false);
  hideStuff(document, "notStarted", false);
}

// Helper of makeBrackets
var handleBracketErrors = function(document){
    /********************************************
      Error Handling and data gathering
    ********************************************/
    var year = Session.get("PoolList/Year");
    var type = Session.get("PoolList/Type");
    var category = Session.get("PoolList/Category");


    Session.set("brackets/infoPdf",{"year":year,"type":type,"cat":category});
    var startButton =  document.getElementById("startText");
    var pdfButton = document.getElementById("getPDF");

    yearData = Years.findOne({_id:year},{reactive:false});
    if(yearData==undefined){
      console.info("No data found for year "+year);
      $("#buttonPdf").hide();
      setInfo(document, "Pas de données trouvées pour l'année "+year);
      hideStuff(document, "empty", true);
      return;
    }
    typeId = yearData[type];
    if(typeId==undefined){
      console.info("No data found for type "+type);
      $("#buttonPdf").hide();
      setInfo(document, "Pas de données trouvées pour le type "+typesTranslate[type] + " de l'année "+year);
      hideStuff(document, "empty", true);
      return;
    }
    typeData = Types.findOne({_id:typeId},{reactive:false});
    if(typeData==undefined){
      console.error("handleBracketErrors : id search on the Types DB failed");
      setInfo(document, "Oups... Une erreur s'est produite");
      hideStuff(document, "empty", true);
      return;
    }
    if(typeData[category]==undefined){
      console.info("No matches for pools of category "+category + ", type "+type, " at year "+year);
      setInfo(document, "Pas de données trouvées pour la catégorie "
        + categoriesTranslate[category]
        + " du type "+typesTranslate[type]
        + " de l'année "+year);
      hideStuff(document, "empty", true);
      return;
    }

    var allWinners = typeData[category.concat("Bracket")]; // List of pairIds

    if(startButton!=undefined && startButton!=null) startButton.innerHTML="Démarrer ce knock-off";

    if(allWinners==undefined){
      if(bracketOptions!=undefined){
        console.info("Tournament not started");
        if(startButton!=undefined && startButton!=null) {
          startButton.innerHTML="Démarrer ce knock-off";
        }
        if(bracketOptions!==undefined && bracketOptions!=null) bracketOptions.style.display = 'block';
        if(pdfButton!==undefined  && pdfButton!==null) pdfButton.style.display = 'block';
      }
      console.info("Knock-offs not started");


      var user = Meteor.user();
      if(user===undefined || user===null || !(user.profile.isStaff || user.profile.isAdmin)){
        setInfo(document, "Les knock-off n'ont pas encore commencés pour cette catégorie!");
      }
      else{
        setInfo(document, "Les knock-off n'ont pas encore commencés. Cliquez sur démarrer ce knock-off pour en créer un.");
      }
      hideStuff(document, "notStarted", true);
      hideStuff(document, "showIfNotStarted",false);
      return;
    }



    if(allWinners.length==0){
      console.info("There are no matches for that year, type and category, did you create any ?");
      var user = Meteor.user();
      if(user===undefined || user===null || !(user.profile.isStaff || user.profile.isAdmin)){
        setInfo(document, "Les knock-off n'ont pas encore commencés pour cette catégorie!");
      }
      else{
        setInfo(document, "Pas de matchs pour l'année "+year
          + " type " + typesTranslate[type]
          + " de la catégorie " + categoriesTranslate[category]
          + ". Si vous en avez créé, cliquez sur démarrer le knock-off pour mettre à jour");
      }
      hideStuff(document, "notStarted", true);
      hideStuff(document, "showIfNotStarted",false);
      return;
    }

    if(startButton!=undefined && startButton!=null) startButton.innerHTML="Redémarrer ce knock-off";

    hideInfo(document);
    showAll(document);

    return allWinners;
}

var setCompletion = function(completion){
  var user = Meteor.user();
  if(user===undefined || user==null || !(user.profile.isStaff || user.profile.isAdmin)){
    return;
  }
  var year = Session.get("PoolList/Year");
  var type = Session.get("PoolList/Type");
  var category = Session.get("PoolList/Category");

  var yearData = Years.findOne({"_id":year},{reactive:false});
  var typeId = yearData[type];
  var str = "completion.brackets.";
  str = str.concat(category);
  var data = {};
  data[str] = completion;
  Types.update({"_id":typeId}, {$set:data},{reactive:false});
}

var hasPoints = function(pairData){
  if(pairData==undefined || pairData.data==undefined) return false;
  var score = pairData.data.score;
  return score === parseInt(score, 10); // Test if points is an integer
}

var getCourts = function(field){
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
  Returns the order in which to fill the first round of the tournament
*/
var getOrder = function(size){

  var partial = function(n ,ni,result){

    var half = result.length/2;

    for(var i=0;i<ni;i++){
      result[ni+i] = result[i]+n;
      result[half+ni+i] = result[half+i]+n;
    }
  }

  var result=[];

  for(var k=0;k<size;k++){
    if(k==size/2){
      result.push(1);
    }
    else{
      result.push(0);
    }
  }

  var n=size/2;
  var ni=1;

  while(n>1){
    partial(n,ni,result);
    n=n/2;
    ni=ni*2;
  }

  return result;
}

/*
  Takes an array of roundData and puts it into a nicely spread out round array
*/
var getTournamentFirstRound = function(pairs){
  var tournamentSize = getNextPowerOfTwo(pairs.length); // power of 2
  var toReturn = [];
  var indexTable = getOrder(tournamentSize);

  var k = 0; // Index in pairs
  for(var i=0; i< tournamentSize; i++){

    if(k<pairs.length){
      a = pairs[k];
      k++;
    }
    else{
      a = getPlaceHolder(0);
    }
    index = indexTable[i];
    toReturn[index] = a;
  }

  return toReturn;
}


var makeBrackets = function(document){
  allWinners = handleBracketErrors(document); // Table of winner pair Id
  if(allWinners==undefined){
    resetBrackets(document);
    return;
  }
  // hideInfo(document);
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
  
  var user = Meteor.user();
  var canEditScore = user!==undefined && user!==null && (user.profile.isAdmin || user.profile.isStaff);

  var pairData = [];
  for(var i=0; i<allWinners.length;i++){
    pairId = allWinners[i];
    pair = Pairs.findOne({_id:pairId},{reactive:false});
    data = getBracketData(pair,0, canEditScore);
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
        best = getBestFrom2(thisRound[i], thisRound[i+1], round,canEditScore);
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
        setCourt(a, b,courts,nextMatchNum); // Define which court to use for that match
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
      a = getBestFrom2(thisRound[0], thisRound[1], round,canEditScore);
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


  Session.set("brackets/arrayBrackets",brackets);
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
  return " dans "+typesTranslate[Session.get("PoolList/Type")]+">"+
      categoriesTranslate[Session.get("PoolList/Category")]+
      " (" + Session.get("PoolList/Year")+")";
}

Template.brackets.onRendered(function(){
  Session.set('brackets/buildingTournament', false); // By default, we are not building the tournament
  Session.set('brackets/isLoading', false);
});

Template.brackets.events({

  // change the court

  "click .changeCourtsBracket":function(event){

    var user = Meteor.user();

    if(user!==undefined && user!==null && (Meteor.user().profile.isStaff || Meteor.user().profile.isAdmin)){

      if(event.currentTarget.firstElementChild==null){
        return;
      }
      var pos = event.currentTarget.firstElementChild.dataset.pos;
      var court = event.currentTarget.firstElementChild.dataset.courtn;

      if(isNaN(court)){
        Session.set("PoolList/ChosenCourt",-1);
      }
      else{
        Session.set("PoolList/ChosenCourt",parseInt(court));
      }

      Session.set("PoolList/ChosenPos",pos);
      Session.set("changeCourtsBracket","true");
    }
    else{
      if( event.currentTarget.firstElementChild!=undefined){
        var courtNum = event.currentTarget.firstElementChild.dataset.courtn;
        var court = Courts.findOne({"courtNumber":parseInt(courtNum)});
        var address = Addresses.findOne({_id:court.addressID});
        var owner = Meteor.users.findOne({_id:court.ownerID});

        Session.set("PoolList/ModalCourtData", {"NUM":courtNum, "OWNER":owner, "ADDRESS":address, "COURT":court});
        $('#CourtInfoModal').modal('show');
      }
    }

  },

	// Do something when the user clicks on a player
  "click .changeScoreBracket":function(event, template){
    var user = Meteor.user();
    if(user==null || user===undefined || !(user.profile.isAdmin || user.profile.isStaff)){
      return; // No action must be done
    }

    var pairId = event.currentTarget.dataset.id;
    mod = document.getElementById("bracketModal");
    clickable = event.currentTarget.dataset.clickable;
    if(clickable==="false") return;
    round = event.currentTarget.dataset.round; // if undefined --> means '?'
    // court = event.currentTarget.dataset.court; // can be undefined

    p1 = event.currentTarget.dataset.pair1;
    if(p1!=="undefined"){
      // pairId is the second pair
      x = [p1, pairId]
    }
    else{
      // pairId is the first pair
      x= [pairId, event.currentTarget.dataset.pair2];
    }

    // Display modal to edit the score
    if(round!=="undefined"){ // Only allow to click on pairs that are not "?"
      Session.set('brackets/clicked', x);
      Session.set('brackets/round', round);
      $("#bracketModal").modal('show');
    }
  },

  'click #start':function(event){
      Session.set("brackets/isLoading",true);

      var infoBox =document.getElementById("infoBox");
      if(infoBox!=undefined) infoBox.setAttribute("hidden",""); // check if infoBox is already rendered and hide it
      console.log("calling startTournament");
      var year = Session.get('PoolList/Year');
      var type = Session.get('PoolList/Type');
      var cat = Session.get('PoolList/Category');

      var maxWinners = document.getElementById("winnersPerPool").value;

      callback = function(err, retVal){
        Session.set("brackets/isLoading",false);
        var hasNoPairs = retVal.winnerPairPoints.length == 0 && retVal.loserPairPoints.length ==0;
        if(hasNoPairs){
          // Cancel operation
          setInfo(document, "Pas de matchs pour l'année "+year
          + " type " + typesTranslate[type]
          + " de la catégorie " + categoriesTranslate[cat]
          + ". Si vous en avez créé, cliquez sur démarrer le knock-off pour mettre à jour");

          return;
        }
        else{
          hideInfo(document);
          Session.set('brackets/buildingTournament', true);
        }
        Session.set("brackets/pairPoints",retVal);
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

    u01 = Meteor.users.findOne({"_id":pair0.player1._id},{"profile":1});
    u02 = Meteor.users.findOne({"_id":pair0.player2._id},{"profile":1});
    u11 = Meteor.users.findOne({"_id":pair1.player1._id},{"profile":1});
    u12 = Meteor.users.findOne({"_id":pair1.player2._id},{"profile":1});

    var callback = function(err, logId){
      if(err){
        console.error(err);
        return;
      }
        Meteor.users.update({"_id":pair0.player1._id},{$addToSet:{"log":logId}});
        Meteor.users.update({"_id":pair0.player2._id},{$addToSet:{"log":logId}});
        Meteor.users.update({"_id":pair1.player1._id},{$addToSet:{"log":logId}});
        Meteor.users.update({"_id":pair1.player2._id},{$addToSet:{"log":logId}});
    }

    Meteor.call("addToModificationsLog",
    {"opType":"Modification points match knock-off",
    "details":
        "Round: "+round+
        u01.profile.firstName + " " + u01.profile.lastName + " et "+u02.profile.firstName + " " + u02.profile.lastName +
        " "+score0+ " VS "+
        u11.profile.firstName + " " + u11.profile.lastName + " et "+u12.profile.firstName + " " + u12.profile.lastName +
        " "+score1 +
        getStringOptions()
    }, callback);

    Session.set('brackets/update',Session.get('brackets/update') ? false:true); // Update the brackets to reflect the new score
  },

  'click #getPDF':function(event){
    Router.go('PdfBracket');
  }
});
