
Template.myRegistration.helpers({

'setCurrentPlayer': function(){
	var user = Meteor.users.findOne({_id:Meteor.userId()});
  // console.log(user);
  if(!user) return;
  var addrID = user.profile.addressID;
	var addr = Addresses.findOne({_id:addrID});

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
		  phone = phone.substring(0,4) + "/" + phone.substring(4,6) + "." + phone.substring(6,8) + "." + phone.substring(8,10);
		  return phone;
      },
      'birth': function(){
		  var date = user.profile.birthDate;
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


'hasPairPlayer' : function(status){
  var id = Meteor.userId();
  var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});

  if(!pair){
    if(status == "true"){
      return "Vous n'êtes pas inscrit";
    }
    return false;
  }

  var user;
  if(pair.player1._id != Meteor.userId()){
    user = Meteor.users.findOne({_id:pair.player1._id});
  }
  else if(pair.player2 && pair.player2._id != Meteor.userId()){
    user = Meteor.users.findOne({_id:pair.player2._id});
  }

  if(!user){
    if(status == "true") return "En attente d'un partenaire";
    return false;
  }
  if(status) return "Vous êtes inscrit et avez un partenaire !";

  return true;
},

'setPairPlayer': function(){
  var id = Meteor.userId();
  var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});
  if(!pair){
    return false;
  }

  var user;
  if(pair.player1._id != Meteor.userId()){
    user = Meteor.users.findOne({_id:pair.player1._id});
  }
  else if(pair.player2 && pair.player2._id != Meteor.userId()){
    user = Meteor.users.findOne({_id:pair.player2._id});
  }

  if(!user) return false;

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
		  phone = phone.substring(0,4) + "/" + phone.substring(4,6) + "." + phone.substring(6,8) + "." + phone.substring(8,10);
		  return phone;
      },
      'birth': function(){
		  var date = user.profile.birthDate;
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
}


});

Template.myRegistration.onCreated(function (){
	var id = Meteor.userId();
    var pair = Pairs.findOne({$or:[{"player1._id":id},{"player2._id":id}]});
	this.subscribe("PairInfo", pair._id);
	this.subscribe("PartnerAdress", pair._id);
});
