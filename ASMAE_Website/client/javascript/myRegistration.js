
Template.registerHelper("checkedIf",function(value){
  return value?"checked":"";
});

Template.myRegistration.helpers({

'setCurrentPlayer': function(){
	var user = Meteor.users.findOne({_id:Meteor.userId()});
  // console.log(user);
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
      return user.profile.phone;
      },
      'birdth': function(){
      return user.profile.birthDate;
      },
      'genre': function(){
      return user.profile.gender;
      },
      'street': function(){
        if(addr) return addr.street;
      },
      'number': function(){
        if(addr) return addr.number;
      },
      'boite': function(){
        if(addr) return addr.box;
      },
      'postal': function(){
        if(addr) return addr.zipCode;
      },
      'city': function(){
        if(addr) return addr.city;
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
      return user.profile.phone;
      },
      'birdth': function(){
      return user.profile.birthDate;
      },
      'genre': function(){
      return user.profile.gender;
      },
      'street': function(){
        if(addr) return addr.street;
      },
      'number': function(){
        if(addr) return addr.number;
      },
      'boite': function(){
        if(addr) return addr.box;
      },
      'postal': function(){
        if(addr) return addr.zipCode;
      },
      'city': function(){
        if(addr) return addr.city;
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


// Template.myRegistration.rendered = function () {
