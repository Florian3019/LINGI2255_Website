Template.PdfBracket.onRendered(function(){
  Session.set("pdfBrack/bracketCount",0);
  create();
});
Template.PdfBracket.helpers({
  'is32': function(){
    var brack = Session.get("brackets/arrayBrackets");
    return brack[0].length==16;
  },
  'is16': function(){
    var brack = Session.get("brackets/arrayBrackets");
    return brack[0].length==8;
  },
});


  var create =function(){
    var knownBrackets = [2,4,8,16,32]; // brackets with "perfect" proportions (full fields, no byes)

      var brack = Session.get("brackets/arrayBrackets");

      var sBrack = []
      for (var i in brack) {
        for (var j in brack[i]) {
          sBrack.push(brack[i][j]);
        }
      }

      var win = getNames(sBrack[sBrack.length-1][0]);
      var winner = win=="nothing"?" ":win;
      Session.set("pdfBrackets/winner",winner);


      /*Print brackets on screen*/
        getBracket(brack[0].length*2);
        getBracket(0);



    /*
     * Build our bracket "model"
     */
    function getBracket(base) {

      var closest 		= _.find(knownBrackets, function(k) { return k>=base; }),
        byes 			= closest-base;

      if(byes>0)	base = closest;

      var brackets 	= [],
        round 		= 1,
        baseT 		= base/2,
        baseC 		= base/2,
        teamMark	= 0,
        nextInc		= base/2;

      for(i=1;i<=(base-1);i++) {
        var	baseR = i/baseT,
          isBye = false;

        // if(byes>0 && (i%2!=0 || byes>=(baseT-i))) {
        //   isBye = true;
        //   byes--;
        // }

        if(round==1 &&(getNames(brack[0][i-1][0])=="nothing" || getNames(brack[0][i-1][1])=="nothing")){ //Bypass
          isBye= true;
        }

        var last = _.map(_.filter(brackets, function(b) { return b.nextGame == i; }), function(b) { return {game:b.bracketNo,teams:b.teamnames}; });



        brackets.push({
          // lastGames:	round==1 ? null : [last[0].game,last[1].game],
          lastGames:	null,
          nextGame:	nextInc+i>base-1?null:nextInc+i,
          // teamnames:	round==1 ? [getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])] : round==2? [getNames(sBrack[i-1][0])=="nothing"?" ":getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])=="nothing"?" ":getNames(sBrack[i-1][1])] :" ",
          teamnames:[getNames(sBrack[i-1][0])=="nothing"?" ":getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])=="nothing"?" ":getNames(sBrack[i-1][1])],

          bracketNo:	i,
          roundNo:	round,
          bye:		isBye,
          ter: sBrack[i-1][0].court==undefined ? "Pas de terrain" : sBrack[i-1][0].court
        });
        teamMark+=2;
        if(i%2!=0)	nextInc--;
        while(baseR>=1) {
          round++;
          baseC/= 2;
          baseT = baseT + baseC;
          baseR = i/baseT;
        }
      }

      renderBrackets(brackets);
    }

    /*
    * Format name from bracket
    */
    function getNames(match){
      if (match.id==undefined) {
        return "nothing"
      }else{
        score = isNaN(match.score)?"":" ("+match.score+")";
        return match.player1+" | "+match.player2 + score;
      }
    }

    /*
     * Inject our brackets
     */
    function renderBrackets(struct) {
      var groupCount	= _.uniq(_.map(struct, function(s) { return s.roundNo; })).length;

      count = Session.get("pdfBrack/bracketCount")%2;
      var group	= $('<div class="group'+(groupCount+1)+'" id="b'+count+'"></div>'),
        grouped = _.groupBy(struct, function(s) { return s.roundNo; });

      for(g=1;g<=groupCount;g++) {

        var round = $('<div class="r'+g+'"></div>');
        _.each(grouped[g], function(gg) {
          if(gg.bye)
            round.append('<div></div>');
          else
            round.append('<div><div class="bracketbox"><span class="info"> Terrain n° '+gg.ter+'</span><span class="teama">'+gg.teamnames[0]+'</span><span class="teamb">'+gg.teamnames[1]+'</span></div></div>');
        });
        group.append(round);
      }
      // group.append('<div class="r'+(groupCount+1)+'"><div class="final"><div class="bracketbox"><span class="teamc">'+_.last(struct).teamnames[_.random(1)]+'</span></div></div></div>');
      group.append('<div class="r'+(groupCount+1)+'"><div class="final"><div class="bracketbox"><span class="teamc">'+winner+'</span></div></div></div>');
      if((Session.get("pdfBrack/bracketCount")%2)==0){
        $('#pdfBrackets').html(group);
      }else{
        $('#pdfBrackets').append(group);
      }

      $("#pdfBrackets").hide();
      Session.set("pdfBrack/bracketCount",Session.get("pdfBrack/bracketCount")+1);
    }
  };

Template.PdfBracket.events({

  "click #pdf":function(event,template){
    var brack = Session.get("brackets/arrayBrackets");

    $(document).ready(function(){
    var pdf = new jsPDF('landscape','pt','a4');


    $("#pdfBrackets").show();
    var html = document.getElementById('b0');
    var widthH = $("#pdfBrackets").width();
    var heightH = $("#pdfBrackets").height();


    html2canvas(html,{
      width:widthH,
      height:heightH,
      onrendered: function(canvas) {

        var context = canvas.getContext('2d');

        if(brack[0].length==16){//Pool size = 32
        // Vertical lign
        context.beginPath();
        context.moveTo(1586, 467);
        context.lineTo(1586, 1367);
        context.lineWidth = 2;

        //Horizontal lign
        context.moveTo(1586,919);
        context.lineTo(1868,919);
        context.lineWidth = 2;

        //Set winner
        context.font="200% Arial";
        context.fillText(Session.get("pdfBrackets/winner"),1600, 900);

        context.stroke();
        var widthImg = 675;
      }
      else if (brack[0].length==8) { //Pool size = 16
        context.beginPath();
        context.moveTo(1043, 250);
        context.lineTo(1043, 694);
        context.lineWidth = 2;

        //Horizontal lign
        context.moveTo(1043,472);
        context.lineTo(1261,472);
        context.lineWidth = 2;

        //Set winner
        context.font="200% Arial";
        context.fillText(Session.get("pdfBrackets/winner"),1600, 900);

        context.stroke();
        var widthImg = 1000;
      }
      else{
        var widthImg = 1300;
      }



        var ratio = canvas.width/canvas.height;
        var img =canvas.toDataURL("image/jpeg,1.0");

        var w = window.open("", "Knock-offs", "width=545", "height=840");

        setTimeout(function () {
          var logo = 'data:image/jpeg;base64,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';

          var info = Session.get("brackets/infoPdf");
          if (info != undefined) var texte=info.year+" "+typesTranslate[info.type]+" "+categoriesTranslate[info.cat];
          else var texte="Knock-off tournament";

          var windowContent ="<!DOCTYPE html>";
          windowContent += '<html>';
          windowContent += '<style type="text/css">';
          windowContent += 'body{background-image:url('+logo+'); background-repeat: no-repeat; background-position: right top;}'
          windowContent += 'h3{font-family: "Arial"; font-style : italic bold;}';
          windowContent += '</style>';
          windowContent += '<head><title>Knock-off print</title></head>';
          windowContent += '<body background="url('+logo+') no-repeat right top">';
          windowContent += '<h3>'+texte+'</h3>';
          windowContent += '<img src="' + img + '" width="'+widthImg+'" height="'+widthImg/ratio+'">';
          windowContent += '</body>';
          windowContent += '</html>';

          w.document.open();
          w.document.write(windowContent);
          w.document.close();
        }, 2000);

        setTimeout(function () {
          w.print();
          w.close();
          Router.go('brackets');
        }, 3000);
      }
    })
  });
}
});
