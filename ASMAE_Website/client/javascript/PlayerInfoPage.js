Template.playerInfoPage.helpers({
  /*'player': function(){
    return user.findOne();
  },

  'playerAddress': function(){
    return Addresses.findOne({_id= addressID});
  }*/
'firstName': function(){
return Session.get('selected').profile.firstName;
},
'lastName': function(){
return Session.get('selected').profile.lastName;
},
'emails': function(){
return Session.get('selected').emails[0].address;
},
'phone': function(){
return Session.get('selected').profile.phone;
},
'birdth': function(){
return Session.get('selected').profile.birthDate;
},
'genre': function(){
return Session.get('selected').profile.gender;
},
'street': function(){
return Session.get('address').street;
},
'number': function(){
return Session.get('address').number;
},
'boite': function(){
return Session.get('address').boite;
},
'postal': function(){
return Session.get('address').zipCode;
},
'city': function(){
return Session.get('address').city;
},
'land': function(){
return Session.get('address').country;
},
'rank': function(){
return Session.get('selected').profile.AFT;
}
});
