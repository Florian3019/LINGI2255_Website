/*
  This page defines how the scores for a pool can be modified.
  The scores are modified live and in symmetries.
*/

Template.scorePage.onRendered(function(){
  if(this.data.isForPdf=="true"){
    var elements = document.getElementsByClassName("toHideForPdf");
    for(var i=0; i<elements.length;i++){
      var el = elements[i];
      if(el.style===undefined) el.style = "display:none";
      else el.style.display = "none";
    }
  }
});

Template.scoreTable.onRendered(function(){
    if(this.data.isForPdf=="true"){
    var elements = document.getElementsByClassName("toHideForPdf");
    for(var i=0; i<elements.length;i++){
      var el = elements[i];
      if(el.style===undefined) el.style = "display:none";
      else el.style.display = "none";
    }
  }
})

var isForCurrentYear = function(){
  var year = Session.get("PoolList/Year");
  if (year === "" || year===undefined){
    return false;
  }

  var c = GlobalValues.findOne({_id:"currentYear"});
    if(c===undefined) return false;
    var currentYear = c.value;
  return currentYear===year;
}

Template.scorePage.helpers({
    'isForCurrentYear':function(){
      return isForCurrentYear();
    },

    'isFamilyCat':function(){
        return Session.get('PoolList/Type')==="family";
    },

    'getTranslateType':function(){
      return typesTranslate[Session.get("PoolList/Type")];
    },

    'getTranslateCategory':function(){
      return categoriesTranslate[Session.get("PoolList/Category")];
    },
        // Returns a yearData with id year (copy of the same function in poolsSidebarCollapsableMenu.helpers)
    'getYear' : function(){
      var year = Session.get('PoolList/Year');
      var y = Years.findOne({_id:year});
      return y;
    },

    // Returns a typeData
    'getType' : function(yearData){
      var type = Session.get('PoolList/Type');
      var t = Types.findOne({_id:yearData[type]});
      return t;
    },
});

Template.scoreTableInfo.helpers({
  'getLeader' : function(poolId){
    if(poolId==undefined) return undefined;
    pool = Pools.findOne({_id:poolId},{leader:1});
    if(pool.leader!=undefined){
        user = Meteor.users.findOne({_id:pool.leader});
        return user;
    }
    return undefined;
  },

  'getEmail' : function(user){
    if(user.emails){
      return user.emails[0].address;
    }
    else{
      return undefined;
    }
  },

  'getOneResponsable':function(poolId){
    var query = [];
    for(var i=0; i<categoriesKeys.length;i++){
      var dat = {};
      dat[categoriesKeys[i]] = poolId;
      query.push(dat);
    }

    var typeData = Types.findOne({$or:query});

    if(typeData===undefined){
      console.error("getOneResponsable : error, did not find the poolId");
      return;
    }

    for(var i=0; i<categoriesKeys.length;i++){
      var cat = categoriesKeys[i];
      var catData = typeData[cat];
      if(catData!==undefined && catData.indexOf(poolId)>-1){
        var respIdList = typeData[cat+"Resp"];
        if(respIdList===undefined || respIdList.length==0) return undefined;
        return Meteor.users.findOne({_id:respIdList[0]});
      }
    }

    console.error("getOneResponsable : error, did not find the poolId");
    return undefined;
  },

  'getCourt': function(poolId){
    if(poolId==undefined) return undefined;
    Session.set("PoolList/poolID",poolId);

    pool = Pools.findOne({_id:poolId});
    if(pool.courtId!=undefined){

      court = Courts.findOne({"courtNumber":pool.courtId});

      if(court && court.addressID){
        address = Addresses.findOne({_id:court.addressID});
        return {id:pool.courtId,
                address:address};
      }
    }
    return undefined;
  },
});

Template.scoreTable.events({
  'change .points':function(event){
    score = event.currentTarget.value;
    if(score == "") score = "-1";
    data = event.currentTarget.dataset;
    pairId = data.pairid;
    otherPairId = data.otherpairid;
    matchId = data.matchid;

    // the fact that this is pair1 and not pair2 is irrelevant for the update (just for parsing convenience)
    data = {"_id":matchId, pair1:{"pairId":pairId, "points":parseInt(score,10)}};
    // Update the DB !
    Meteor.call("updateMatch", data);

    playersName1 = getPairPlayers(pairId);
    playersName2 = getPairPlayers(otherPairId);

    Meteor.call("addToModificationsLog",
    {"opType":"Modification points match poule",
    "details":
        playersName1.names[0]+" "+playersName1.names[1] +
        " VS " + playersName2.names[0]+" "+playersName2.names [1] +
        " Points: "+data.pair1.points+getStringOptions()
    },
      function(err, logId){
        if(err){
          console.error(err);
          return;
        }
        Meteor.call('addToUserLog', playersName1.ids[0], logId);
        Meteor.call('addToUserLog', playersName1.ids[1], logId);
        Meteor.call('addToUserLog', playersName2.ids[0], logId);
        Meteor.call('addToUserLog', playersName2.ids[1], logId);
      }
    );
  }
})

Template.scoreTable.helpers({
  'isForCurrentYear':function(){
    return isForCurrentYear();
  },

  // Returns a list of pairs that are in this pool
  'getPairs' : function(poolId){
    var pairList = [];
    var pool = Pools.findOne({_id:poolId},{reactive:false});
    if(!pool){
      return;
    }
    for(var i=0;i<pool.pairs.length;i++){
      var pair = Pairs.findOne({_id:pool.pairs[i]});
      if(pair.player1 && pair.player2) pairList.push(pair);
    }

    var totalMatches = 0;
    var completedMatches = 0;

    var user = Meteor.user();
    if(user!==undefined && user!==null && ((user.profile.isStaff || user.profile.isAdmin) && isForCurrentYear())){
      // Create a match for each of these pairs, if it does not yet exist
      for(var i=0;i<pairList.length;i++){
        for(var j=0;j<i;j++){
          pairId1 = pairList[i]._id;
          pairId2 = pairList[j]._id;

          var d1 = {};
          d1[pairId1] = {$exists:true};
          var d2 = {};
          d2[pairId2] = {$exists:true};


          var match = Matches.findOne(
            {
              $and: [
                {"poolId":poolId}, // I want to find only matches belonging to this pool
                {$and: [d1,d2]} // A match has to have both fields for pair1 and pair2 set
              ]
            }
          );

          totalMatches += 1;

          if(match==undefined){
            // Match does not exist, create a new one

            data = {"poolId":poolId};
            data.pair1 = {"pairId": pairId1, "points":-1};
            data.pair2 = {"pairId": pairId2, "points":-1};
            Meteor.call("updateMatch", data); // This will create a new match and link it to the pool
          }
          else{
            if(match[pairId1]>=0 && match[pairId2]>=0) completedMatches += 1;
          }
        }
      }

      var completion = (totalMatches==0) ? 0 : completedMatches/totalMatches;
      Pools.update({_id:poolId}, {$set:{"completion":completion}},{reactive:false});
      console.log("pool completion "+completion);
    }

    return pairList;
  },

  'getPlayer' : function(userId){
    var res = Meteor.users.findOne({_id:userId},{profile:1});
    return res;
  },

  'getPoints' : function(match, pairId){
    var points = match[pairId];
    if(points<0) return;
    return points;
  },

  'getMatch' : function(poolId, pairId1, pairId2){
    var d1 = {};
    d1[(pairId1)] = {$exists:true};
    var d2 = {};
    d2[(pairId2)] = {$exists:true};

    var match = Matches.findOne(
      {
        $and: [
          {"poolId":poolId}, // I want to find only matches belonging to this pool
          {$and: [d1,d2]} // A match has to have both fields for pair1 and pair2 set
        ]
      }
    );

    return match ? match : undefined;
  },

  'isToPrint':function(){
    return Session.get("printSheets/Value");

  }

});

var getStringOptions = function(){
  return " dans "+typesTranslate[Session.get("PoolList/Type")]+" en "+
      categoriesTranslate[Session.get("PoolList/Category")]+
      " (" + Session.get("PoolList/Year")+")";
}

var getPairPlayers = function(pairId){
  var p = Pairs.findOne({_id:pairId},{"player1._id":1, "player2._id":1});
  var info = {"profile.firstName":1, "profile.lastName":1};
  var u1 = Meteor.users.findOne({_id:p.player1._id},info);
  var u2 = Meteor.users.findOne({_id:p.player2._id},info);

  return {"names":[u1.profile.firstName + " "+u1.profile.lastName, u2.profile.firstName + " "+u2.profile.lastName],"ids":[u1._id, u2._id]};
}

Template.scorePage.events({
  'click #helpScore':function(event){
    swal({
        title:"<h1>Aide</h1>",
        text: "<ul class='list-group' style='text-align:left'>"+
                "<li class='list-group-item'>Pour changer de terrain, cliquez sur 'Assigner un terrain' ou sur le terrain actuel.</li>"+
                "<li class='list-group-item'>La ligne du dessus dans le tableau correspond au score de la paire dans la colonne.</li>"+
                "<li class='list-group-item'>Pour devenir responsable de cette catégorie, cliquez sur 'Devenir responsable'.</li>"+
                "<li class='list-group-item'>Pour imprimer le pdf, cliquez sur le bouton correspondant en bas de page.</li>"+
                "<li class='list-group-item'>Le score qui est en haut est pour la paire qui est à gauche. Le score qui est en bas est pour la paire qui est au dessus.</li>"+
              "</ul>",
        type:"info",
        customClass:"sweetAlertScroll",
        confirmButtonText:"Ok",
        confirmButtonColor:"#0099ff",
        html:true
        }
        );
  },
  'click #scoreTableBack':function(event){
    Session.set("PoolList/ChosenScorePool","");
  },

  'change #checkBoxEmptyTable' : function(event){
    checked = document.getElementById(event.target.id).checked;
    Session.set("scoreTable/emptyTable", checked);
  },

  'click #changeCourt':function(event){
    var user = Meteor.user();
    if(user!==undefined && user!==null && ((user.profile.isStaff || user.profile.isAdmin) && isForCurrentYear())){
        var poolID = Session.get("PoolList/poolID");
        var pool = Pools.findOne({_id:poolId});
        if(pool.courtId==undefined){
          Session.set("PoolList/ChosenCourt",-1);
        }
        else{
          Session.set("PoolList/ChosenCourt",pool.courtId);
        }
    }
    else{

      var poolID = Session.get("PoolList/poolID");
      var pool = Pools.findOne({_id:poolId});
      var court = Courts.findOne({"courtNumber":pool.courtId});
      var address = Addresses.findOne({_id:court.addressID});
      var owner = Meteor.users.findOne({_id:court.ownerID});

      Session.set("PoolList/ModalCourtData", {"NUM":pool.courtId, "OWNER":owner, "ADDRESS":address, "COURT":court});
      $('#CourtInfoModal').modal('show');
    }
  },

  'click #getPDF':function(event){
    var poolId = event.currentTarget.dataset.pool;
    Session.set("printOneSheet/poolId", poolId);
    var info ={
      year:Session.get("printPDF/Year"),
      type:Session.get("printPDF/Type"),
      cat:Session.get("printPDF/Cat"),
    };
    Session.set("printSheets/info",info);
    Session.set("printSheets/OnePage",true)
    Router.go("printSheets");
  }
});

Template.courtSearchTemplate.events({
    'click .courtRow' : function(event){
        Router.go('courtInfoPage',{_id:this._id});
    },
})
