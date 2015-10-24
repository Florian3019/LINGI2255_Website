// Takes a player id as argument
Template.playerInfoTemplate.helpers({
	'getPlayer' : function(){
		var user = Meteor.users.findOne({_id:this.ID}); // this.ID = <userid>
		if(!user) return;
		var addr = Addresses.findOne({_id:user.profile.addressID});
		console.log("myRegistration : "+user.profile.addressID);
		data = {
			'firstName': function(){
				return user.profile.firstName;
			},
			'lastName': function(){
				return user.profile.lastName;
			},
			'emails': function(){
				return user.emails[0].address;
			},
			'phone': function(){
			  var phone = user.profile.phone;
			  if(!phone) return;
			  phone = phone.substring(0,4) + "/" + phone.substring(4,6) + "." + phone.substring(6,8) + "." + phone.substring(8,10);
			  return phone;
			},
			'birth': function(){
			  var date = user.profile.birthDate;
			  if(!date) return;
			  date = date.substring(8,10) + "/" + date.substring(5,7) + "/" + date.substring(0,4);
			  return date;
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
			'rank': function(){
				return user.profile.AFT;
			}
		};
	    return data;
	},

	'showEdit' : function(){
		var callBack = function(err, res){
			if(err){
				console.log(err);
				return;
			}
			if(res==true){
				document.getElementById("button_edit").removeAttribute("hidden");
			}
		}

		if(Meteor.userId() == this.ID) callBack(undefined, true);
		Meteor.call('isStaff', callBack);
		Meteor.call('isAdmin', callBack);
	}

});

Template.playerInfoTemplate.events({
	'click #button_edit' : function(event){
		/*
			Check if the button was in a popup (modal), if so, close it before going to profileEdit
		*/
		var modalId = event.currentTarget.dataset.modal;
		if(modalId) $('#'+modalId).modal('hide');

		Router.go('profileEdit',{_id:event.currentTarget.dataset.userid});
		console.log("clicked modifier");
	},

})