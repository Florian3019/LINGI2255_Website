UserList = new Mongo.Collection('userlist');
Courts = new Mongo.Collection('Courts');

if (Meteor.isClient) {
  Template.SiteRegistration.events({
    
    'submit form':function(){
      event.preventDefault();
        var lastname = event.target.lastname.value;
        var firstname = event.target.firstname.value;
        var email = event.target.email.value;
        var phone = event.target.phone.value;
        var sex = event.target.sex.value;
        var password = event.target.password.value;
        
        UserList.insert({
        lastname : lastname,
        firstname : firstname,
        email : email,
        phone : phone,
        sex : sex,
        password : password
    });  
    Router.go('home');
   }
   });    
   
  
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Router.route('/', {
    template: 'home',
    name: 'home'
});

Router.configure({
    layoutTemplate: 'index'
});

Router.route('/Contacts');
Router.route('/Pictures');
Router.route('/Rules');
Router.route('/TournamentRegistration');
Router.route('/SiteRegistration');
Router.route('/CourtRegistration');
Router.route('/CourtInfo');
Router.route('/PlayersInfo');
Router.route('/StaffManagement');
