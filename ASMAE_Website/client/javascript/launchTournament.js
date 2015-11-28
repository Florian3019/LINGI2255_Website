Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker({
        format: "dd/mm/yyyy"
    });
}


Template.launchTournament.helpers({
    'registrationsON': function(){
         return GlobalValues.findOne({_id: "registrationsON"}).value;
    }
});


Template.launchTournament.events({
    'submit form': function(event){
        event.preventDefault();

        var getDate = $('[name=launchTournamentDate]').val().split('/');
        var getDateObject = new Date(getDate[2], getDate[1]-1, getDate[0]);
        var price = parseFloat($('[name=tournamentPrice]').val());

        var launchData = {
            tournamentDate: getDateObject,
            tournamentPrice: price
        };

		Meteor.call('launchTournament', launchData, Meteor.userId(), function(error, result){
            if(error){
                console.error('launchTournament error');
                console.error(error);
            }
            else if(result == null){
                console.error("No result in launchTournament...");
            }

            alert("Les inscriptions au tournoi sont lancées.\n Un Email va être envoyé à tous les utilisateurs.");

            Meteor.call('emailtoAllUsers');
	    });

    },

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

    },

    'click #modifyLaunchButton': function(){
        Meteor.call('deleteCurrentYear', function(err, result){
            if(err){
                console.log(err);
            }

            Meteor.call('stopTournamentRegistrations', function(error, result){
                if(error){
                    console.error('stopTournamentRegistrations error');
                    console.error(error);
                }
            });
        });
    },

    'click #playerInfoButton':function(){
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
            console.log("emailToPlayer/error", error);
          }
        });
      }
    },

    'click #leaderInfoButton':function(){
      var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
      var poolList = new Array();
      var alltypes = ["men","women","mixed"];
      var currentYear = GlobalValues.findOne({_id:"currentYear"}).value;
      var year = Years.findOne({_id:currentYear});

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
        Meteor.call("emailtoLeader", poolList[i], function(error, result){
          if(error){
            console.log("emailToLeader/error", error);
          }
        });
      }
    },

});
