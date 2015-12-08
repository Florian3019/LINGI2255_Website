/*
	This file defines how the player information summary page behaves.
	It also uses braintree to display payment informations
*/

Session.set('paymentFormStatus', null);

function initializeBraintree (clientToken) {

  braintree.setup(clientToken, 'dropin', {
    container: 'dropin',
    paymentMethodNonceReceived: function (event, nonce) {
      Session.set('paymentFormStatus', true);

      // we've received a payment nonce from braintree
      // we need to send it to the server, along with any relevant form data
      // to make a transaction
	  var data = {};
      data.nonce = nonce;

      Meteor.call('createTransaction', data, function (err, result) {
        Session.set('paymentFormStatus', null);
		$("#dropinModal").modal("hide");
		if(err){
			console.error(err);
	        Router.go('paymentError');
		}
		else {
	        Router.go('paymentConfirmation');
		}
      });
    }
  });
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
					  return addr.street + ", " +addr.number + ". Boite " + addr.box;
				  }
				  return addr.street + ", "+addr.number;
			  }
			},
			'city': function(){
				if(addr) return addr.zipCode +" "+ addr.city;
			},
			'land': function(){
				if(addr) return addr.country;
			},
			'rank': user.profile.AFT,
			'log':user.log
		};
	  return data;
	},

	'tournamentPrice' : function() {
		var currentYear = GlobalValues.findOne({_id:"currentYear"});
		if (!currentYear) return undefined;
		var year = Years.findOne({_id:currentYear.value});
		if (!year) return undefined;
		return year.tournamentPrice;
	},

	'canModify' : function(passedID){
		if(Meteor.userId() === passedID){
			return true;
		}
		else{
			var user = Meteor.user();
			return user!==undefined && user!==null && (user.profile.isStaff || user.profile.isAdmin);
		}
	},

	'isCurrentUser' : function(passedID){
		if(Meteor.userId() === passedID){
			return true;
		}
		else{
			return false;
		}
	},

	'isStaffOrAdmin' : function() {
		var user = Meteor.user();
		if (!user) return undefined;
		return user.profile.isStaff || user.profile.isAdmin;
	},

	/*
		Displays or hides the "modifier" button depending on the permissions of the user
	*/
	'showEdit' : function(){
		var callBack = function(err, res){
			if(err){
				console.error(err);
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

	'paymentMethod' : function(payment){
		return paymentTypesTranslate[payment.paymentMethod];
	},

	'getPayment' : function(userId){
		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
		var payment = Payments.findOne({"userID": userId, "tournamentYear": currentYear});
		return payment;
	},

	'getInscriptions': function(userId){
		var registrationInfo = getRegistrationInfoFromPlayerID(userId);
		if (typeof registrationInfo === 'undefined') {
			return undefined;
		}
		return registrationInfo;
	},

	'displayRegistration' : function(dayData) {
		if (typeof dayData === 'undefined') {
			return "Pas inscrit";
		}
		var type = dayData.playerType;
		var category = dayData.playerCategory;
		return "Tournoi "+typesTranslate[type] + ", catégorie "+category;
	},

	'isRegistered' : function(dayData) {
		return dayData !== undefined;
	},

	/*
	 * Returns true if the user given in argument is a staff member or
	 * if it is not one of the current user's partners
	 */
	'showOption' : function(userId) {
		var partnersaturdayid = Session.get("partnersaturdayid");
		var partnersundayid = Session.get("partnersundayid");
		var user = Meteor.user();
		if (user === undefined || user === null) {
			return undefined;
		}
		if (user.profile === undefined || user.profile === null) {
			return undefined;
		}
		var isStaff = user.profile.isAdmin || user.profile.isStaff;
		return isStaff || (userId != partnersaturdayid && userId != partnersundayid);
	},

	'notPaid' : function(passedID){
		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
		var payment = Payments.findOne({"userID": passedID, "tournamentYear": currentYear});
		if(payment)
		{
			return (payment.status !== "paid");
		}
		else{
			return false;
		}
	},

	'playerExtras': function(userId){
		var extras = getExtrasFromPlayerID(userId);
		if(extras!==undefined)
		{
			var extrasArray = [];
			for(extra in extras){
				var price = Extras.findOne({name:extra}).price;
				extraObject = {
					extraName: extra,
					extraQuantity: extras[extra],
					extraPrice: price
				};
				extrasArray.push(extraObject);
			}
			return extrasArray;
		}
	},

    getPlayerModLog: function (logTable) {
        var toReturn = [];
        for(var i=0;logTable!==undefined && i<logTable.length;i++){
          toReturn.push(ModificationsLog.findOne({_id:logTable[i]}));
        }
        return toReturn;
    },

    settings : function(){
      return {
        fields:[
          { key: 'userId', label: 'Utilisateur', fn: function(value, object){
            user= Meteor.users.findOne({_id:value},{"profile":1});
            return user.profile.firstName + " " + user.profile.lastName;
          }},
          { key: 'createdAt', label: 'Temps' , sortOrder: 0, sortDirection: 'descending', fn: function(value, object){return getSortableDate(value);}},
          { key: 'opType', label: "Opération"},
          { key: 'details', label: "Détails"}
      ],
      rowsPerPage:LAST_N_LOGS,
      noDataTmpl:Template.emptyLog,
      showFilter:false,
      showNavigationRowsPerPage:false,
      showNavigation:'auto'
      }
    }

});

Template.playerInfoTemplate.events({

	'click #unsubscribeSaturdayLink' : function(event) {
		event.preventDefault();

		swal({
			title: "Êtes-vous sûr ?",
			text: "Vous êtes sur le point de supprimer cette inscription",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Supprimer cette inscription",
			closeOnConfirm: false },
			function(){
				var pair = getDayPairFromPlayerID(Meteor.userId(), "saturday");
				Meteor.call('unsubscribePairFromTournament', pair._id);
				swal("Inscription supprimée", "", "success");
				Router.go('home');
			});
	},

	'click #unsubscribeSundayLink' : function(event) {
		event.preventDefault();

		swal({
			title: "Êtes-vous sûr ?",
			text: "Vous êtes sur le point de supprimer cette inscription",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Supprimer cette inscription",
			closeOnConfirm: false },
			function(){
				var pair = getDayPairFromPlayerID(Meteor.userId(), "sunday");
				Meteor.call('unsubscribePairFromTournament', pair._id);
				swal("Inscription supprimée", "", "success");
				Router.go('home');
			});
	},

	'click #button_edit' : function(event){
		/*
			Check if the button was in a popup (modal), if so, close it before going to profileEdit
		*/
		if(Session.get('closeModal') != undefined){
			var modalId = '#'+Session.get('closeModal');
			Session.set('closeModal', undefined)
			$(modalId).on('hidden.bs.modal', function() {
            	Router.go('profileEdit',{_id:event.currentTarget.dataset.userid});
        	}).modal('hide');

		}
		else{
			/*	Go to profile edit	*/
			Router.go('profileEdit',{_id:event.currentTarget.dataset.userid});
			console.log("clicked modifier");
		}
	},
	'click #deleteUser' : function(event){
		// user = Meteor.users.findOne({"_id":this.id})
		if(Session.get('closeModal') != undefined){
			if (confirm('Impossible de supprimer un joueur depuis ce menu.\n Voulez vous être redirigé ?')) {
				var modalId = '#'+Session.get('closeModal');
				Session.set('closeModal', undefined)
				$(modalId).on('hidden.bs.modal', function() {
            		Router.go('playerInfoTemplate',{_id:this.id});
        		}).modal('hide');

			}
		}
		else {
			player = Meteor.users.find({"_id": this.id}).fetch()
			if(false){
				if (confirm('Etes-vous certain de vouloir supprimer définitivement ce joueur?\n Cette action est irréversible.')) {
					Meteor.call('deleteUser',this.id);
					Router.go('home')
				}
			}
			else{
				Meteor.call('getYear',player, function(error, result){
            		if(error){
                		console.error('CourtRegistration error');
                		console.error(error);
            		}
            		else if(result == null){
                		console.error("No result");
            		}
            		else{
            			var years_in1 = result[0]
            			var max_year1 = result[1]
            			var bool =true
            			for(i = 0; years_in1 && max_year1 && i < years_in1.length; i++){
							if(years_in1[i][1] === max_year1){
								bool = false
								alert("Veuillez désinscrire le joueur du tournoi de cette année avant de le supprimer.")
								Router.go('home')
							}
						}
            		}

					if(bool && confirm('Etes-vous certain de vouloir supprimer définitivement ce joueur?\n Cette action est irréversible.')) {
						Meteor.call('deleteUser',this.id);
					}
					else if(bool){
						alert("Joueur non supprimé.")
					}
					Router.go('home')
        		});

			}
		}

	},

	'click #markAsPaid': function(event){
		Meteor.call('markAsPaid', this._id, function(err, result){
			if(err){
				console.log("Error while calling method markAsPaid");
				console.log(err);
			}
		});
	}

});


//For payments
Template.myRegistration.onRendered(function () {
  Meteor.call('getClientToken', function (err, clientToken) {
    if (err) {
      console.error('There was an error', err);
      return;
    }

    initializeBraintree(clientToken);
  });
});
