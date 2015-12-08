Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker({
        format: "dd/mm/yyyy"
    });
}


Template.launchTournament.helpers({
    'registrationsON': function(){
         return GlobalValues.findOne({_id: "registrationsON"}).value;
    },

    'tournamentData': function(){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        return Years.findOne({_id: currentYear});
    },

    'tournamentDateFormat': function(date){
        return date.toLocaleDateString();
    },

    'extras': function(){
        return Extras.find();
    },

    'getPreviousTournamentDate' : function(){
        var previousTournamentDate = Session.get('previousTournamentDate');
        if(typeof previousTournamentDate !== 'undefined'){
            var m = previousTournamentDate.getMonth() + 1;
            return previousTournamentDate.getDate()+'/'+ m +'/'+previousTournamentDate.getFullYear();
        }
    },

    'getPreviousTournamentPrice' : function(){
        var previousTournamentPrice = Session.get('previousTournamentPrice');
        if(typeof previousTournamentPrice !== 'undefined'){
            return previousTournamentPrice;
        }
    }

});


Template.launchTournament.events({
    'submit #launchTournamentForm': function(event){
        event.preventDefault();

        var getDate = $('[name=launchTournamentDate]').val().split('/');
        var getDateObject = new Date(getDate[2], getDate[1]-1, getDate[0]);
        var price = parseFloat($('[name=tournamentPrice]').val());

        var dateInput = document.getElementById("formGroupDateInput");
        var dateMsg = document.getElementById("dateError");
        var priceInput = document.getElementById("formGroupPriceInput");
        var errorMsg = document.getElementById("priceError");
        
        if(getDate.length==1 && getDate[0]===""){    
            dateInput.className = "form-group has-error";
            dateMsg.style.display = "block";
            return; 
        }
        
        if(isNaN(price)){
            priceInput.className = "form-group has-error";
            errorMsg.style.display = "block";
            return; 
        }

        dateInput.className = "form-group has-success";
        priceInput.className = "form-group has-success";
        dateMsg.style.display = "none";
        errorMsg.style.display = "none";

        var launchData = {
            tournamentDate: getDateObject,
            tournamentPrice: price
        };

		Meteor.call('launchTournament', launchData, Meteor.userId(), function(error, result){
            if(error){
                console.error('launchTournament error');
                console.error(error.error);
                if(error.error === "A tournament already exists for this year"){
                    alert(error.error);
                }
            }
            else if(result == null){
                console.error("No result in launchTournament...");
            }
	    });

    },

    'click #modifyLaunchButton': function(){
        swal({
            title:"Confimer la modification du tournoi",
            text:"Cette opération est irréversible.",
            type:"warning",
            showCancelButton:true,
            cancelButtonText:"Annuler",
            confirmButtonText:"Modifier le tournoi",
            confirmButtonColor:"#0099ff",
            },
            function(){
                var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
                var previousTournament = Years.findOne({_id: currentYear});
                Session.set('previousTournamentDate', previousTournament.tournamentDate);
                Session.set('previousTournamentPrice', previousTournament.tournamentPrice);

                Meteor.call('deleteCurrentTournament', function(err, result){
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
            }
        );
    },

});
