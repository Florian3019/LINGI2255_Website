Template.launchTournament.rendered=function() {
    $('#launchTournamentDate').datepicker({
        format: "dd/mm/yyyy"
    });
}


Template.launchTournament.helpers({
    'showStep1': function(){
        if(GlobalValues.findOne({_id: "registrationsON"}).value){
            return true;
        }
        else{
            var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
            var yearDocument = Years.findOne({_id: currentYear});
            if(typeof yearDocument !== 'undefined' && yearDocument["step4done"]){
                return true;
            }
            else{
                return false;
            }
        }
    },

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
    },

    'okAFTranking': function(){
		return AFTrankings;
	}

});

function isValidePrice(price) {
    return (Math.floor(price * 100) === price * 100);
}

Template.launchTournament.events({
    'click #launchTournamentButton': function(event){
        event.preventDefault();

        var getDate = $('[name=launchTournamentDate]').val().split('/');
        var getDateObject = new Date(getDate[2], getDate[1]-1, getDate[0]);
        var price = parseFloat($('[name=tournamentPrice]').val());

        var maximumAFT = $('[name=AFTranking]').val();

        var dateInput = document.getElementById("formGroupDateInput");
        var dateMsg = document.getElementById("dateError");
        var priceInput = document.getElementById("formGroupPriceInput");
        var errorMsg = document.getElementById("priceError");

        if(getDate.length==1 && getDate[0]===""){
            dateInput.className = "form-group has-error";
            dateMsg.style.display = "block";
            return;
        }

        if(isNaN(price) || !isValidePrice(price)){
            priceInput.className = "form-group has-error";
            errorMsg.style.display = "block";
            if(!isValidePrice(price)) {
               document.getElementById("priceError-message").innerHTML = "Attention le prix est incorrect, vous ne pouvez pas avoir plus de deux décimales";
            }

            return;
        }

        dateInput.className = "form-group has-success";
        priceInput.className = "form-group has-success";
        dateMsg.style.display = "none";
        errorMsg.style.display = "none";

        var launchData = {
            tournamentDate: getDateObject,
            tournamentPrice: price,
            maximumAFT: maximumAFT
        };

        swal({
            title: "Ouverture des inscriptions",
            text: "Les informations entrées sont-elles correctes ? Après validation, les inscriptions seront ouvertes",
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
