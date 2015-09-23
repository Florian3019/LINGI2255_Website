if (Meteor.isClient) {
  
  
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
