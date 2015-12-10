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
        if(currentYear == ""){ //Tournament didn't launch yet
            return "notokBlock";
        }
        else {
            var yearDocument = Years.findOne({_id: currentYear});
            if(typeof yearDocument !== 'undefined'){
                if(stepNumber == 1){
                    return "okBlock";
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
                console.error("currentYear doesn't exist in Years");
                return undefined;
            }
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
    Meteor.call('assignCourts', rain, function(err, result) {
        console.error("Error assignCourts : "+err);
    });
};
