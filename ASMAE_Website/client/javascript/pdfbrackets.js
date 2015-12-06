Template.PdfBracket.onRendered(function(){
  createAndDownloadPdf(document);
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

const bracketID = 'pdfBrackets';
const bracketContainer = "bracketContainer";

var createAndDownloadPdf = function(document){
  var knownBrackets = [2,4,8,16,32]; // brackets with "perfect" proportions (full fields, no byes)

      var brack = Session.get("brackets/arrayBrackets");

      var sBrack = []
      for (var i in brack) {
        for (var j in brack[i]) {
          sBrack.push(brack[i][j]);
        }
      }

      /*Print brackets on screen*/
        getBracket(brack[0].length*2);



    /*
     * Build our bracket "model"
     */
    function getBracket(base) {

      var closest     = _.find(knownBrackets, function(k) { return k>=base; }),
        byes      = closest-base;

      if(byes>0)  base = closest;

      var brackets  = [],
        round     = 1,
        baseT     = base/2,
        baseC     = base/2,
        teamMark  = 0,
        nextInc   = base/2;

      for(i=1;i<=(base-1);i++) {
        var baseR = i/baseT,
          isBye = false;

        if(round==1 &&(getNames(brack[0][i-1][0])=="nothing" || getNames(brack[0][i-1][1])=="nothing")){ //Bypass
          isBye= true;
        }

        var last = _.map(_.filter(brackets, function(b) { return b.nextGame == i; }), function(b) { return {game:b.bracketNo,teams:b.teamnames}; });



        brackets.push({
          // lastGames: round==1 ? null : [last[0].game,last[1].game],
          lastGames:  null,
          nextGame: nextInc+i>base-1?null:nextInc+i,
          // teamnames: round==1 ? [getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])] : round==2? [getNames(sBrack[i-1][0])=="nothing"?" ":getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])=="nothing"?" ":getNames(sBrack[i-1][1])] :" ",
          teamnames:[getNames(sBrack[i-1][0])=="nothing"?" ":getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])=="nothing"?" ":getNames(sBrack[i-1][1])],

          bracketNo:  i,
          roundNo:  round,
          bye:    isBye,
          ter: sBrack[i-1][0].court==undefined ? "Pas de terrain" : sBrack[i-1][0].court
        });
        teamMark+=2;
        if(i%2!=0)  nextInc--;
        while(baseR>=1) {
          round++;
          baseC/= 2;
          baseT = baseT + baseC;
          baseR = i/baseT;
        }
      }

      var w=window.open("", "Knock-offs", "width=545", "height=840");

      renderBrackets(brackets, w);
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
    function renderBrackets(struct, w) {
      var groupCount  = _.uniq(_.map(struct, function(s) { return s.roundNo; })).length;

      count = Session.get("pdfBrack/bracketCount")%2;
      var group = $('<div class="group'+(groupCount+1)+'" id="b'+count+'"></div>'),
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
      group.append('<div class="r'+(groupCount+1)+'"><div class="final"><div class="bracketbox"><span class="teamc">'+'</span></div></div></div>');
      if((Session.get("pdfBrack/bracketCount")%2)==0){
        $('#'+bracketContainer).html(group);
      }else{
        $('#'+bracketContainer).append(group);
      }
      var el = $('#'+bracketContainer);
      var h = el.height();
      var wid = el.width();
      const maxH = 1200;

      var scaleRatio = maxH/h;
      $('#'+bracketID).css({
        'transform-origin': 'top left',
        '-ms-transform': 'scale('+scaleRatio+','+scaleRatio+')',
        '-webkit-transform': 'scale('+scaleRatio+','+scaleRatio+')',
        'width':'100%',
        'transform': 'scale('+scaleRatio+','+scaleRatio+')',
      });

      // $('#'+bracketID).css({'width':wid*scaleRatio+',' 'height':h*scaleRatio});
      // $('#'+bracketID).height(h*scaleRatio);

      // console.log($("#headPdfBrackets").html());
      // console.log($("#pdfBrackets").html());
      var info = Session.get("brackets/infoPdf");
      $("#pdfHeader").html(info.year+" "+typesTranslate[info.type]+" "+categoriesTranslate[info.cat]);
      $(document).ready(function(){
        var head = $("#bracketCSS").get(0);
        w.document.getElementsByTagName('head')[0].appendChild(head);
        w.document.getElementsByTagName('body')[0].appendChild($("#pdfContainer").get(0));
        // w.print();

        Session.set("pdfBrack/bracketCount",Session.get("pdfBrack/bracketCount")+1);
        // Router.go('brackets');  
      });
      
    }
}