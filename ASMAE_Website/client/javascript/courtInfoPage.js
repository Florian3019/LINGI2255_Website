Template.courtInfoPage.helpers({
'firstName': function(){
	return Session.get('userC').profile.firstName;
},
'lastName': function(){
return Session.get('userC').profile.lastName;
},
'emails': function(){
return Session.get('userC').emails[0].address;
},
'phone': function(){
return Session.get('userC').profile.phone;
},
'street': function(){
return Session.get('addressC').street;
},
'number': function(){
return Session.get('addressC').number;
},
'box': function(){
return Session.get('addressC').box;
},
'zipCode': function(){
return Session.get('addressC').zipCode;
},
'city': function(){
return Session.get('addressC').city;
},
'surface': function(){
return Session.get('answerT').surface;
},
'courtType': function(){
return Session.get('answerT').courtType;
},
'instructions': function(){
return Session.get('answerT').instructions;
},
'ownerComment': function(){
return Session.get('answerT').ownerComment;
}
});