Template.PdfBracket.onRendered(function(){
  Session.set("pdfBrack/bracketCount",0);

});

Template.PdfBracket.events({
  // "click #add": function(event, template){
  "click #pdf":function(event,template){
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
        getBracket(0);
        $("#b1").hide();



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

        // console.log(brack[0][i-1][0]);

        brackets.push({
          // lastGames:	round==1 ? null : [last[0].game,last[1].game],
          lastGames:	null,
          nextGame:	nextInc+i>base-1?null:nextInc+i,
          // teamnames:	round==1 ? [getNames(brack[0][i-1][0]),getNames(brack[0][i-1][1])] : round==2? [" ","Ici ça merde"]/*[getNames(brack[1][i-1][0]),getNames(brack[1][i-1][1])] */:" ",
          teamnames:	round==1 ? [getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])] : round==2? [getNames(sBrack[i-1][0])=="nothing"?" ":getNames(sBrack[i-1][0]),getNames(sBrack[i-1][1])=="nothing"?" ":getNames(sBrack[i-1][1])] :" ",
          // teamnames:	round==1 ? [exampleTeams[teamMark],exampleTeams[teamMark+1]] : [last[0].teams[_.random(1)],last[1].teams[_.random(1)]],
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
        return match.player1+" | "+match.player2;
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
          else if (g<3)
            round.append('<div><div class="bracketbox"><span class="info">'+gg.ter+'</span><span class="teama">'+gg.teamnames[0]+'</span><span class="teamb">'+gg.teamnames[1]+'</span></div></div>');
          else
          round.append('<div><div class="bracketbox"><span class="info">'+gg.ter+'</span><span class="teama">'+'</span><span class="teamb">'+'</span></div></div>');
        });
        group.append(round);
      }
      // group.append('<div class="r'+(groupCount+1)+'"><div class="final"><div class="bracketbox"><span class="teamc">'+_.last(struct).teamnames[_.random(1)]+'</span></div></div></div>');
      group.append('<div class="r'+(groupCount+1)+'"><div class="final"><div class="bracketbox"><span class="teamc">'+'</span></div></div></div>');
      if((Session.get("pdfBrack/bracketCount")%2)==0){
        $('#pdfBrackets').html(group);
      }else{
        $('#pdfBrackets').append(group);
      }

      $("#pdfBrackets").hide();
      Session.set("pdfBrack/bracketCount",Session.get("pdfBrack/bracketCount")+1);
    }

  // },
  //
  // "click #pdf":function(event,template){

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
        var img =canvas.toDataURL("image/jpeg,1.0");
        // pdf.addImage(img,'JPEG',10,10,500,300);
          pdf.addImage(img,'JPEG',10,10,canvas.width>600? 600 : canvas.width,canvas.height?640:canvas.height);
        // pdf.rect(10,10,800,550); //Size of the page => rect draw in pdf
        var info = Session.get("brackets/infoPdf");
        if(info != undefined){
          var filename = "knockoff_"+info.year+"_"+info.type+"_"+info.cat+".pdf";
        }
        else{
          var filename= "knockoff.pdf"
        }
        pdf.output('save', filename);
        $("#pdfBrackets").hide();
        Router.go('brackets');

      }
    })
  });
}
});
