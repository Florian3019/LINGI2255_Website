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

function getExtras(userId){
	var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
	var pair = Pairs.findOne({$or:[{"player1._id":userId},{"player2._id":userId}], "year":currentYear},{"_id":1});
	if(pair.player1!==undefined && userId === pair.player1._id){
		return pair.player1.extras;
	}
	else {
		if(pair.player2==undefined) return undefined;
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
			'rank': user.profile.AFT,
			'log':user.log
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

	'getInscription': function(userId){
		var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
		var pair = Pairs.findOne({$or:[{"player1._id":userId},{"player2._id":userId}], "year":currentYear},{"_id":1});
		if(pair===undefined){
			console.error("Did not find a registration !");
			return "Pas inscrit";
		}
		var pool = Pools.findOne({"pairs":pair._id},{"_id":1});
		if(pool===undefined){
			console.error("Did not find a registration !");
			return "Pas inscrit";
		}

		var query = [];
		for(var i=0; i<categoriesKeys.length;i++){
			var data = {};
			data[categoriesKeys[i]] = pool._id;
			query.push(data);
		}

		var typeData = Types.findOne({$or:query});
		if(typeData===undefined){
			console.error("Did not find a registration !");
			return "Pas inscrit";
		}

		// Determine the player's category
		var playerCategory = undefined;
		for(var i=0; i<categoriesKeys.length;i++){
			var cat = typeData[categoriesKeys[i]]; // List of pool ids
			if(cat!==undefined && cat.indexOf(pool._id)>-1){
				playerCategory = categoriesTranslate[categoriesKeys[i]];
				break;
			}
		}

		var yearQuery = [];
		for (var i=0; i<typeKeys.length;i++){
			var data = {};
			data[typeKeys[i]] = typeData._id;
			yearQuery.push(data);
		}

		// Determine the player's type
		var playerType = undefined
		var y = Years.findOne({$or:yearQuery});
		if(y===undefined){
			console.error("Did not find a registration !");
			return "Pas inscrit";
		}
		for (var i=0; typeKeys.length;i++){
			var t = y[typeKeys[i]];
			if(t!==undefined && t.indexOf(typeData._id)>-1){
				playerType = typesTranslate[typeKeys[i]];
				break;
			}
		}

		return playerType + " > " + playerCategory;
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

	'playerExtras' : function(userId){
		var extras = getExtras(userId);
		if(extras!==undefined)
		{
			var extrasArray = [];
			for(extra in extras){
				extraObject = {
					extraName: extra,
					extraQuantity: extras[extra]
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
