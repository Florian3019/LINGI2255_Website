/*
	Global helpers
*/
Template.registerHelper("equals", function (x,y) {
    return x==y;
});

Template.registerHelper("log", function (value, text) {
    console.log(text);
    console.log(value);
});

Template.registerHelper('isAdmin', function(){
	var res = Meteor.users.findOne({_id:Meteor.userId()}, {"profile.isAdmin":1});
	return res!==undefined ? res.profile.isAdmin : false;
});

Template.registerHelper('isStaff', function(){
	var res = Meteor.users.findOne({_id:Meteor.userId()}, {"profile.isStaff":1});
	return res!==undefined ? res.profile.isStaff : false;
});

Template.registerHelper('isAdminOrStaff', function(){
	var res = Meteor.users.findOne({_id:Meteor.userId()}, {"profile.isAdmin":1, "profile;isStaff":1});
	return res!==undefined ? (res.profile.isAdmin||res.profile.isStaff) : false;
});

Template.registerHelper('isSaturdayRegistered', function(){
	return isSaturdayRegistered(Meteor.userId());
});

Template.registerHelper('isSundayRegistered', function(){
	return isSundayRegistered(Meteor.userId());
});

Template.registerHelper('and', function(a, b){
	return a && b;
});

Template.registerHelper('getAge', function(birthDate) {
    return getAge(birthDate);
});
