Template.closeRegistrationsBlock.events({
    'click #closeRegistrationsButton': function(){
        if(confirm("Confirmer la fermeture des inscriptions:"))
        {
            Meteor.call('stopTournamentRegistrations', function(error, result){
                if(error){
                    console.error('stopTournamentRegistrations error');
                    console.error(error);
                }
            });
        }
    }

});

Template.closeRegistrationsBlock.helpers({
    'registrationsON': function(){
        return GlobalValues.findOne({_id: "registrationsON"}).value;
    }
});

Template.tournamentProgress.helpers({
    'stepIsDoneClass': function(stepNumber){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        if(currentYear === ""){ //Tournament didn't launch yet
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
                throw new Meteor.error("currentYear doesn't exist in Years");
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

        Meteor.call('emailtoAllUsers', function(err, result){
            if(err){
                console.error("Error while calling emailtoAllUsers");
            }
        });
    },

    'click #sendPoolsEmail':function(){
        Meteor.call('updateDoneYears', 6, true, function(err, result){
            if(err){
                console.error("Error while calling updateDoneYears for step 6");
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
    }

});
