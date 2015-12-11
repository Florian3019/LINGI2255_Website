Template.playerPayments.onRendered(function(){
    Session.set('bankTransferNumber', 0);
});

Template.playerPayments.onCreated(function(){
    Session.set("playerPayments/input","");
});

Template.playerPayments.helpers({
    'getPayments':function(){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;

        var baseQuery = [{tournamentYear:currentYear}, {status:"pending"}];

        var input = Session.get("playerPayments/input"); // This is the filter input
        if(input!==undefined) input = input.toLowerCase(); // Convert to lower case for ease of use

        var noInput = (input ==="" || input===undefined || input === null);
        if(noInput) return Payments.find({$and:baseQuery});
        if(input!==undefined){
            inputArray = input.split(" ");
        }


       var query =  {$where: function(){
            if(!noInput){
                var user = Meteor.users.findOne({_id:this.userID});
                var searchString = " "+user.profile.firstName + " " + user.profile.lastName + " ";
                searchString += paymentToString(this);
                searchString = searchString.toLowerCase();
                for(var i=0; i<inputArray.length;i++){
                    if(searchString.indexOf(inputArray[i])==-1){
                        return false;
                    }
                }
            }
                return true;
            }
        };

        baseQuery.push(query);
        return Payments.find({$and:baseQuery});
    },

    'settings':function(){
        return {
            fields:[
            { key: 'userID', label:"Joueur", tmpl:Template.userLabel},
            { key: 'paymentMethod', label: 'Méthode', fn:function(value, object){
                if(value===undefined) return "/";
                else return paymentTypesTranslate[value];
            }},
            { key: 'balance', label: 'Montant', fn:function(value, object){
                if(value===undefined) return "/";
                else return value+"€";
            }},
            { key:'bankTransferNumber', label:"N° d'identification"},
            { key: '_id', label: 'Paiement', tmpl:Template.markAsPaid},
        ],
            showFilter: false,
        }
    },
});

Template.userLabel.helpers({
   'player': function(){
        var player = Meteor.users.findOne({_id: this.userID});
        return player;
    },
});

Template.markAsPaid.events({
    'click .markAsPaidLink': function(event){
        Meteor.call('markAsPaid', this._id, function(err, result){
            if(err){
                console.log("Error while calling method markAsPaid");
                console.log(err);
                return;
            }
            swal({
                title:"A payé !",
                text:"Cet utilisateur a été marqué comme ayant payé.",
                type:"success",
                confirmButtonColor:"#0099ff"
            });
        });
    },
});

Template.playerPayments.events({
  'keyup #paymentInput':function(event){
    Session.set("playerPayments/input", event.currentTarget.value);
  },

  'click #sendPaymentReminderEmail': function(event){
    swal({
      title:"Attention",
      text: "Etes-vous sur de vouloir envoyer un email à toutes les personnes qui ne sont pas en ordre de paiement ?",
      type: "warning",
      showCancelButton: true,
      cancelButtonText:"Annuler",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Continuer",
      closeOnConfirm: false},
      function(){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        Meteor.call("emailReminderToPay",currentYear, function(error, result){
          if(error){
            console.log("error", error);
          }
        });

        swal({
          title:"Succès",
          text:"Rappels de paiement envoyés!",
          type:"success",
          confirmButtonColor: "#3085d6",
          confirmButtonText:"Super!"
        });
      }
    );

  },
});
