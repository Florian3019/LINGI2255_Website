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
		Meteor.call('isStaff',Meteor.userId(), callBack);
		Meteor.call('isAdmin',Meteor.userId(), callBack);
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
		if(Session.get('closeModal') != undefined){
			var modalId = '#pairModal'+Session.get('closeModal')
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

		user = Meteor.users.findOne({"_id":this.id})
		if(Session.get('closeModal') != undefined){	
			if (confirm('Impossible de supprimer un joueur depuis ce menu.\n Voulez vous être redirigé ?')) {
				Session.set('selected', user);
				var modalId = '#pairModal'+Session.get('closeModal')
				Session.set('closeModal', undefined)
				$(modalId).on('hidden.bs.modal', function() {
            		Router.go('playerInfoPage');
        		}).modal('hide');
        		
			}
		}
		else {
			
			player1 = Pairs.find({"player1._id": this.id}).fetch()
			player2 = Pairs.find({"player2._id": this.id}).fetch()
			if(player1.length == 0 && player2 == 0){
				console.log(user)
				if (confirm('Etes-vous certain de vouloir supprimer définitivement ce joueur?\n Cette action est irréversible.')) {
					Meteor.call('deleteUser',this.id);
					Router.go('home')
				}
			}
			else{
				pools = Pools.find().fetch()
				var pool_in = []
				for(i = 0; i < pools.length; i++){
					for(j = 0; j<pools[i].pairs.length; j++){
						for(k = 0; k<player1.length; k++){
							if(pools[i].pairs[j] === player1[k]._id){
								pool_in.push(pools[i]._id);      
							}
						}
						for(k = 0; k<player2.length; k++){
							if(pools[i].pairs[j] === player2[k]._id){
								pool_in.push(pools[i]._id);
							}
						}
					}
				}
				types = Types.find().fetch()
				var types_in = []
				for(i = 0; i < types.length; i++){
					for(j = 0; j < pool_in.length; j++){
						for(k = 0; types[i].preminimes !== undefined && k < types[i].preminimes.length; k++){
							if(types[i].preminimes[k] === pool_in[j]){
								types_in.push(types[i]._id);
								k = types[i].preminimes.length;   
							}	
						}
						for(k = 0; types[i].minimes !== undefined && k < types[i].minimes.length; k++){
							if(types[i].minimes[k] === pool_in[j]){
								types_in.push(types[i]._id); 
								k = types[i].preminimes.length;     
							}	
						}
						for(k = 0; types[i].cadets !== undefined && k < types[i].cadets.length; k++){
							if(types[i].cadets[k] === pool_in[j]){
								types_in.push(types[i]._id);
								k = types[i].preminimes.length;      
							}	
						}
						for(k = 0; types[i].scolars !== undefined && k < types[i].scolars.length; k++){
							if(types[i].scolars[k] === pool_in[j]){
								types_in.push(types[i]._id);
								k = types[i].preminimes.length;      
							}	
						}
						for(k = 0; types[i].juniors !== undefined && k < types[i].juniors.length; k++){
							if(types[i].juniors[k] === pool_in[j]){
								types_in.push(types[i]._id); 
								k = types[i].preminimes.length;     
							}	
						}
						for(k = 0; types[i].seniors !== undefined && k < types[i].seniors.length; k++){
							if(types[i].seniors[k] === pool_in[j]){
								types_in.push(types[i]._id); 
								k = types[i].preminimes.length;     
							}	
						}
						for(k = 0; types[i].elites !== undefined && k < types[i].elites.length; k++){
							if(types[i].elites[k] === pool_in[j]){
								types_in.push(types[i]._id);  
								k = types[i].preminimes.length;    
							}	
						}
					}
				}
				console.log(types_in)
				alert("impossible de supprimer ce joueur")
				Router.go('home')
			}
		}
		
	}

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
