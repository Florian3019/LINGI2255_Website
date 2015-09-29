Router.configure({
    layoutTemplate: 'index'
});

Router.route('/', {
    template: 'home',
    name: 'home'
});

Router.route('/Contacts');
Router.route('/Pictures');
Router.route('/Rules');
Router.route('/TournamentRegistration');
Router.route('/SiteRegistration');
Router.route('/CourtRegistration', {
	name: 'CourtRegistration',
	template: 'CourtRegistration',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    }
});
Router.route('/CourtInfo');
Router.route('/PlayersInfo');
Router.route('/StaffManagement');
Router.route('/ProfileEdit');