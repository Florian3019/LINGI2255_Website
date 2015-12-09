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
        var c = GlobalValues.findOne({_id:"currentYear"});
        if (c===undefined || c.value === undefined) {
            return undefined;
        }
        var y = Years.findOne({_id:c.value});
        if (y===undefined || y.tournamentDate===undefined) {
            return undefined;
        }
        var date = y.tournamentDate;
        return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    },

    'getPreviousTournamentPrice' : function(){
        var c = GlobalValues.findOne({_id:"currentYear"});
        if (c===undefined || c.value === undefined) {
            return undefined;
        }
        var y = Years.findOne({_id:c.value});
        if (y===undefined) {
            return undefined;
        }
        return y.tournamentPrice;
    }

});


Template.launchTournament.events({
    'click #launchTournamentButton': function(event){
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

        swal({
            title: "Ouverture des inscriptions",
            text: "Les informations entrées sont-elles correctes ? Après validation, les inscriptions sont ouvertes",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Confirmer",
            closeOnConfirm: true
        },
            function() {
                Meteor.call('launchTournament', launchData);
            }
        );
    },

    'click #modifyLaunchButton': function(){
        swal({
            title:"Confirmer la modification du tournoi",
            text:"Les inscriptions déjà enregistrées ne seront pas modifiées",
            type:"warning",
            showCancelButton:true,
            cancelButtonText:"Annuler",
            confirmButtonText:"Modifier le tournoi",
            confirmButtonColor:"#0099ff",
            },
            function(){
                GlobalValues.update({_id:"registrationsON"}, {$set: {
    				value : false
    			}});
            }
        );
    },

});
