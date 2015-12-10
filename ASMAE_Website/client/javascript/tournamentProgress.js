Template.closeRegistrationsBlock.events({
    'click #closeRegistrationsButton': function(){
        swal({
          title:"Confirmer la fermeture des inscriptions",
          text:"Cette opération est irréversible.",
          type:"warning",
          showCancelButton:true,
          cancelButtonText:"Annuler",
          confirmButtonText:"Fermer les inscriptions",
          confirmButtonColor:"#0099ff",
          },
          function(){
              Meteor.call('stopTournamentRegistrations', function(error, result){
                    if(error){
                        console.error('stopTournamentRegistrations error');
                        console.error(error);
                    }
                });
            }
        );
    }

});

Template.closeRegistrationsBlock.helpers({
    'registrationsON': function(){
        return GlobalValues.findOne({_id: "registrationsON"}).value;
    }
});

Template.tournamentProgress.helpers({

    'MissingSaturday': function(){
        return getNumberMissingCourts("Saturday");
    },
    'MissingSunday': function(){
        return getNumberMissingCourts("Sunday");
    },

    'stepIsDoneClass': function(stepNumber){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        var yearDocument = Years.findOne({_id: currentYear});
        if(typeof yearDocument !== 'undefined'){
            if(stepNumber == 1){
                if(GlobalValues.findOne({_id: "registrationsON"}).value){
                    return "okBlock";
                }
                else if(yearDocument["step4done"]){   //If step 4 is done (registrations are OFF)
                    return "okBlock";
                }
                else {
                    return "notokBlock";
                }
            }
            else{
                var stepField = "step"+stepNumber+"done";
                if(yearDocument[stepField]){
                    return "okBlock";
                }
                else{
                    return "notokBlock";
                }
            }
        }
        else {
            return "notokBlock";
        }

    }
});

Template.tournamentProgress.events({
    'click #doneButton2': function(){
        Meteor.call('updateDoneYears', 2, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 2");
            }
        });
    },

    'click #doneButton3': function(){
        Meteor.call('updateDoneYears', 3, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 3");
            }
        });
    },

    'click #doneButton5': function(){
        Meteor.call('updateDoneYears', 5, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 5");
            }
        });
    },

    'click #doneButton6': function(){
        Meteor.call('updateDoneYears', 6, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 6");
            }
        });
    },

    'click #doneButton7': function(){
        Meteor.call('updateDoneYears', 7, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 7");
            }
        });
    },

    'click #notDoneButton2': function(){
        Meteor.call('updateDoneYears', 2, false, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 2");
            }
        });
    },

    'click #notDoneButton3': function(){
        Meteor.call('updateDoneYears', 3, false, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 3");
            }
        });
    },

    'click #notDoneButton5': function(){
        Meteor.call('updateDoneYears', 5, false, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 5");
            }
        });
    },

    'click #notDoneButton6': function(){
        Meteor.call('updateDoneYears', 6, false, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 6");
            }
        });
    },

    'click #notDoneButton7': function(){
        Meteor.call('updateDoneYears', 7, false, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 7");
            }
        });
    },

    'click #restartTournamentButton': function(){
        Meteor.call('restartTournament', function(err, result){
            if(err){
                console.error("Error while calling restartTournamentButton");
            }
        });
    },

    'click #sendRegistrationsEmail': function(){
        Meteor.call('updateDoneYears', 2, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 2");
            }
        });

        Meteor.call('emailLaunchTournament', function(err, result){
            if(err){
                console.error("Error while calling emailLaunchTournament");
            }
        });
    },

    'click #sendPoolsEmail':function(){
        Meteor.call('updateDoneYears', 7, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 7");
            }
        });

      var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
      var poolList = new Array();
      var alltypes = ["men","women","mixed"];
      var currentYear = GlobalValues.findOne({_id:"currentYear"}).value;
      var year = Years.findOne({_id:currentYear});
      console.log(year);
      console.log(currentYear);

      if(year!=undefined){
        for(var k in alltypes){
          var type = Types.findOne({_id:year[alltypes[k]]});
          for (var i in allcat) {
            for (var j in type[allcat[i]]) {
              poolList.push(type[allcat[i]][j]);
            }
          }
        }

        var fam = Types.findOne({_id:year["family"]});
        for (var f in fam["all"]) {
          poolList.push(fam["all"][f]);
        }
      }

      for (var i in poolList) {

        Meteor.call("emailtoPoolPlayers", poolList[i], function(error, result){
          if(error){
            console.log("emailToPlayer error", error);
          }
        });

        Meteor.call("emailtoLeader", poolList[i], function(error, result){
          if(error){
            console.error("emailToLeader error", error);
          }
        });

      }
    },
    /*
        Assign courts
    */

    'click #assignCourts':function(event){

        if(getNumberMissingCourts("Saturday")>0 || getNumberMissingCourts("Sunday")>0){
            Session.set("rain",false);
            $('#notEnoughCourtsModal').modal('show');
        }
        else{
            assignCourts(false);
        }

    },
    'click #assignIndoorCourts':function(event){
        if(getNumberMissingCourts("Saturday")>0 || getNumberMissingCourts("Sunday")>0){
            Session.set("rain",true);
            $('#notEnoughCourtsModal').modal('show');
        }
        else{
            assignCourts(false);
        }
    }

});

Template.notEnoughCourtsModal.helpers({
    'findDay': function(){
        if(getNumberMissingCourts("Saturday")>0 && getNumberMissingCourts("Sunday")>0){
            return "samedi et dimanche";
        }
        else if(getNumberMissingCourts("Saturday")>0){
            return "samedi";
        }
        else if(getNumberMissingCourts("Sunday")>0){
            return "dimanche";
        }
        else{
            return "";
        }
    }
});

Template.notEnoughCourtsModal.events({
    'click .valid': function(event){
        if(Session.get("rain")){
            assignCourts(true);
        }
        else{
            assignCourts(false);
        }
    }
});


var getNumberMissingCourts = function(day){

    if(day==="Saturday"){
       pools = Pools.find({$or: [{type:"mixed"},{type:"family"}]}).fetch();
        courts = Courts.find({$and:[{dispoSamedi: true},{staffOK:true},{ownerOK:true}]},{$sort :{"HQDist":1} }).fetch();
        return Math.max(pools.length-getCourtNumbers(courts).length,0);
    }
    else{
        pools = Pools.find({$or: [{type:"men"},{type:"women"}]}).fetch();
        courts = Courts.find({$and:[{dispoDimanche: true},{staffOK:true},{ownerOK:true}]},{$sort :{"HQDist":1} }).fetch();
        return Math.max(pools.length-getCourtNumbers(courts).length,0);
    }

};

var getCourtNumbers = function(courts){
    var result = [];

    for(var k=0; k<courts.length;k++){
        var courtsList = courts[k].courtNumber;

        for(var t=0;t<courtsList.length;t++){
            result.push(courtsList[t]);
        }
    }

    return result;
}

var assignCourts = function(rain){

    /*
        Return N courts, starting at index start and using a modulo to loop through the array
        nextNumber is the next number to assign to the court if it hasn't a number yet
    */
    var setCourts = function(listPairs, courts, start,final_result){

        if(courts.length==0){
            newcourts = ["?"];
        }
        else{
            newcourts=courts;
        }

        var result = [];
        var next=0;

        var logPairs = Math.log2(listPairs.length);
        var numMatchesFull = Math.pow(2,Math.ceil(logPairs))/2;
        var index=getOrder(numMatchesFull);
        var round=0;

        for(var k=0;k<numMatchesFull;k++){
            result.push(-1);
        }

        var num = getNumberMatchesFirstRound(listPairs.length);

        for(var m=0;m<num;m++){
            result[index[m]]=newcourts[(start+next) % newcourts.length];
            next++;
        }

        round++;

        var max=numMatchesFull;

        var begin_previous=0;
        var size_previous=result.length;

        while(result.length<(2*max-1)){

            var inter_result=[];
            var count=0;

            for(var m=0;m<size_previous;m=m+2){
                if(result[begin_previous+m]==-1){
                    result.push(newcourts[(start+next) % newcourts.length]);
                    next++;
                }
                else{
                    result.push(result[begin_previous+m]);
                }
            }
            begin_previous+=size_previous;
            size_previous=size_previous/2;
            round++;
        }

        for(var j=0;j<result.length;j++){
            if(result[j]!=-1){
                final_result.push(result[j]);
            }
        }

        return next;
    };

    var numberDays = 2;

    var listCourtsSat;
    var listCourtsSun;

    if(rain){
        listCourtsSat=Courts.find({$and:[{dispoSamedi: true},{staffOK:true},{ownerOK:true},{isOutdoor:false}]},{$sort :{"HQDist":1} }).fetch();
        listCourtsSun=Courts.find({$and:[{dispoDimanche: true},{staffOK:true},{ownerOK:true},{isOutdoor:false}]},{$sort :{"HQDist":1} }).fetch();
    }
    else{
        listCourtsSat=Courts.find({$and:[{dispoSamedi: true},{staffOK:true},{ownerOK:true}]},{$sort :{"HQDist":1} }).fetch();
        listCourtsSun=Courts.find({$and:[{dispoDimanche: true},{staffOK:true},{ownerOK:true}]},{$sort :{"HQDist":1} }).fetch();
    }

    var courtsSat = getCourtNumbers(listCourtsSat);
    var courtsSun = getCourtNumbers(listCourtsSun);
    var courtsTable = [courtsSat,courtsSun];

    var poolsSat = Pools.find({$or: [{type:"mixed"},{type:"family"}]}).fetch();
    var poolsSun = Pools.find({$or: [{type:"men"},{type:"women"}]}).fetch();
    var poolsTable = [poolsSat,poolsSun];

    ////////// Assign courts to pools \\\\\\\\\\

    for(var g=0;g<numberDays;g++){

        var pools = poolsTable[g];
        var courts = courtsTable[g];

        for(var i=0;i<pools.length;i++){

            var pool = pools[i];

            if(courts.length==0){
                Pools.update({_id:pool._id},{$unset: {"courtId":""}});
            }
            else{
                var j=(i % courts.length);
                pool.courtId = courts[j];
                Meteor.call('updatePool',pool);
            }

            // add court to all the matches in the pool

            var matches = Matches.find({"poolId" : pool._id}).fetch();

            for(var f=0;f<matches.length;f++){
                matches[f].courtId = courts[i];
                Meteor.call('updateMatch',matches[f]);
            }
        }

    }

    ////////// KnockOff Tournament \\\\\\\\\\

    var typesSaturday = ["mixed","family"];
    var typesSunday = ["men","women"];
    var typesTable = [typesSaturday,typesSunday];
    var year = Years.findOne({_id:""+new Date().getFullYear()});
    var start = 0;

    ////////// Saturday and Sunday \\\\\\\\\\

    for(var g=0;g<numberDays;g++){ // loop through the days

        var typesDay = typesTable[g];

        for(var k=0;k<typesDay.length;k++){ // loop through the types

            var typeDoc = Types.findOne({_id:year[typesDay[k]]});

            for(var t=0;t<categoriesKeys.length;t++){ // loop through the categories

                var temp = categoriesKeys[t]+"Bracket";

                if(typeDoc[categoriesKeys[t]]!=null && typeDoc[temp]!=null){

                    var nameField = categoriesKeys[t]+"Courts";
                    typeDoc[nameField] = [];

                    var next = setCourts(typeDoc[temp], courtsTable[g],start,typeDoc[nameField]);

                    if(courtsTable[g].length==0){
                        start=0;
                    }
                    else{
                        start=(start+next) % courtsTable[g].length;
                    }
                }
            }

            Meteor.call('updateType',typeDoc);
        }
    }

    Meteor.call('updateDoneYears', 6, true, function(err, result){
        if(err){
            console.error("Error while calling updateDoneYears for step 6");
        }
    });
};
