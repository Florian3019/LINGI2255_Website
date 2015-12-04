Template.playerPayments.onRendered(function(){
    Session.set('bankTransferNumber', 0);
});

Template.playerPayments.helpers({
    'payments': function(){
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        var bankTransferNumber = Session.get('bankTransferNumber');
        if(bankTransferNumber > 0){
            var x = Payments.find({'status': "pending", 'tournamentYear': currentYear, 'paymentMethod': paymentTypes[1], 'bankTransferNumber': bankTransferNumber});
        }
        else{
            var x = Payments.find({'status': "pending", 'tournamentYear': currentYear});
        }
    	return {"cursor":x, "notEmpty":x.count()>0};
  	},

    'player': function(){
        var player = Meteor.users.findOne({_id: this.userID});
        return player;
    },

    'transformPaymentMethod': function(){
        return paymentTypesTranslate[this.paymentMethod];
    }

});

Template.playerPayments.events({
    'click .markAsPaidLink': function(event){
        Meteor.call('markAsPaid', this._id, function(err, result){
			if(err){
				console.log("Error while calling method markAsPaid");
				console.log(err);
			}
		});
    },

    'click #sendPaymentReminderEmail': function(event){
        //TODO: send email
    },

    'submit form': function(event){
        event.preventDefault();
        var bankTransferNumber = parseInt($('[name=bankTransferSearchField]').val());
        Session.set('bankTransferNumber', bankTransferNumber);
    }
});
