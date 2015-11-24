Session.set('paymentFormStatus', null);

// Create data object for payment
function getFormData(){

	var user = Meteor.user();
	var extras = getExtras();

  	var data = {
    	firstName : user.profile.firstName,
    	lastName : user.profile.lastName,
    	email : user.emails[0].address
  	};
	if(extras)
	{
		data.extras = extras;
	}
  	return data;
}

function initializeBraintree (clientToken) {

  braintree.setup(clientToken, 'dropin', {
    container: 'dropin',
    paymentMethodNonceReceived: function (event, nonce) {
      Session.set('paymentFormStatus', true);

      // we've received a payment nonce from braintree
      // we need to send it to the server, along with any relevant form data
      // to make a transaction
      var data = getFormData();
      data.nonce = nonce;

      Meteor.call('createTransaction', data, function (err, result) {
        Session.set('paymentFormStatus', null);
		$("#dropinModal").modal("hide");
        Router.go('paymentConfirmation');
      });
    }
  });
}

function getExtras(){
	var id = Meteor.userId();
	var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});
	if(pair.player1 && id === pair.player1._id){
		return pair.player1.extras;
	}
	else {
			return pair.player2.extras;
	}
}

// Takes a player id as argument
Template.playerInfoTemplate.helpers({

	/*
		Returns an object containing functions
		that are used by the template to display information
		about the player id passed as argument to the template
	*/
	'getPlayer' : function(){
		var user = Meteor.users.findOne({_id:this.ID}); // this.ID = <userid>
		if(!user) return;
		var addr = Addresses.findOne({_id:user.profile.addressID});
		data = {
			'id' : this.ID,
			'firstName' : user.profile.firstName,
			'lastName': user.profile.lastName,
			'emails': user.emails[0].address,
			'phone': function(){
			  var phone = user.profile.phone;
			  if(!phone) return;
			  phone = phone.substring(0,4) + "/" + phone.substring(4,6) + "." + phone.substring(6,8) + "." + phone.substring(8,10);
			  return phone;
			},
			'birth': function(){
			  var date = user.profile.birthDate;
			  if(!date) return;
				month = date.getMonth()+1
			  return date.getDate() + "/" + month + "/" + date.getFullYear();
			},
			'gender': function(){
				return user.profile.gender;
			},
			'address': function(){
			  if(addr) {
				  if (addr.box) {
					  return addr.number + ", " + addr.street + ". Boite " + addr.box;
				  }
				  return addr.number + ", " + addr.street;
				}
			},
			'city': function(){
				if(addr) return addr.zipCode +" "+ addr.city;
			},
			'land': function(){
				if(addr) return addr.country;
			},
			'rank': user.profile.AFT
		};
	  return data;
	},

	'isCurrentUser' : function(passedID){
		if(Meteor.userId() === passedID){
			return true;
		}
		else{
			return false;
		}
	},

	/*
		Displays or hides the "modifier" button depending on the permissions of the user
	*/
	'showEdit' : function(){
		var callBack = function(err, res){
			if(err){
				console.log(err);
				return;
			}
			if(res==false){
				document.getElementById("button_edit").removeAttribute("hidden");
			}
		}

		if(Meteor.userId() == this.ID) callBack(undefined, true);
		Meteor.call('isStaff', callBack);
		Meteor.call('isAdmin', callBack);
	},


	'paymentStatusClass': function () {
		return Session.get('paymentFormStatus') ? 'hide' : '';
	},
 	'notPaymentStatusClass': function () {
    	return Session.get('paymentFormStatus') ? '' : 'hide';
 	},

	'getExtras' : function() {
		getExtras();
	},

	'paymentMethod' : function(){
		var payment = Payments.findOne({"userID": Meteor.userId()});
		if(payment){
			return paymentTypesTranslate[payment.paymentMethod];
		}
		else {
			console.error("No payment in database for this user!");
		}

	},

	'paymentBalance' : function(){
		var payment = Payments.findOne({"userID": Meteor.userId()});
		if(payment)
		{
			return payment.balance;
		}
	},

	'notPaid' : function(passedID){
		if(Meteor.userId() === passedID){
			var payment = Payments.findOne({"userID" : Meteor.userId()});
			if(payment)
			{
				return (payment.status !== "paid");
			}
			else{
				return false;
			}
		}
		else{
			return false;
		}
	},

});

Template.playerInfoTemplate.events({
	'click #button_edit' : function(event){
		/*
			Check if the button was in a popup (modal), if so, close it before going to profileEdit
		*/
		var modalId = event.currentTarget.dataset.modal;
		if(modalId) $(modalId).modal('hide');

		/*	Go to profile edit	*/
		Router.go('profileEdit',{_id:event.currentTarget.dataset.userid});
		console.log("clicked modifier");
	},

});


//For payments
Template.myRegistration.onRendered(function () {
  Meteor.call('getClientToken', function (err, clientToken) {
    if (err) {
      console.log('There was an error', err);
      return;
    }

    initializeBraintree(clientToken);
  });
});
