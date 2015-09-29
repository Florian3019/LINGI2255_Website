UserList = new Mongo.Collection('userlist');
Courts = new Mongo.Collection('Courts');
Addresses = new Mongo.Collection('Addresses');


/*#################################
            METEOR CLIENT
  #################################*/
if (Meteor.isClient) {


  /*#################################
              LOGIN SETTINGS
    #################################*/

  Accounts.ui.config({
    requestPermissions: {
      facebook: ['public_profile','email'],
      googe: ['profile', 'email']
    },
    /*
      If true, forces the user to approve the 
      app's permissions, even if previously approved. 
      Currently only supported with Google.
    */
    forceApprovalPrompt: {
      google:true
    },
    /*
      Which fields to display in the user creation form. 
      One of 'USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL', 
      'USERNAME_ONLY', or 'EMAIL_ONLY'
    */
    passwordSignupFields: 'USERNAME_AND_EMAIL',



    /*
      Additional signup fiels required when creating a new account
      TODO : edit this for our needs
    */
    extraSignupFields: [{
        fieldName: 'first-name',
        fieldLabel: 'First name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write your first name");
            return false;
          } else {
            return true;
          }
        }
    }, {
        fieldName: 'last-name',
        fieldLabel: 'Last name',
        inputType: 'text',
        visible: true,
    }, {
        fieldName: 'gender',
        showFieldLabel: false,      // If true, fieldLabel will be shown before radio group
        fieldLabel: 'Gender',
        inputType: 'radio',
        radioLayout: 'vertical',    // It can be 'inline' or 'vertical'
        data: [{                    // Array of radio options, all properties are required
            id: 1,                  // id suffix of the radio element
            label: 'Male',          // label for the radio element
            value: 'm'              // value of the radio element, this will be saved.
          }, {
            id: 2,
            label: 'Female',
            value: 'f',
            checked: 'checked'
        }],
        visible: true
    }, {
        fieldName: 'country',
        fieldLabel: 'Country',
        inputType: 'select',
        showFieldLabel: true,
        empty: 'Please select your country of residence',
        data: [{
            id: 1,
            label: 'United States',
            value: 'us'
          }, {
            id: 2,
            label: 'Spain',
            value: 'es',
        }],
        visible: true
    }, {
        fieldName: 'terms',
        fieldLabel: 'I accept the terms and conditions',
        inputType: 'checkbox',
        visible: true,
        saveToProfile: false,
        validate: function(value, errorFunction) {
            if (value) {
                return true;
            } else {
                errorFunction('You must accept the terms and conditions.');
                return false;
            }
        }
    }]



  });

  // On logout, go back to the home page
  accountsUIBootstrap3.logoutCallback = function(error) {
    if(error) console.log("Error:" + error);
    Router.go('home');
  }
  accountsUIBootstrap3.setLanguage('fr');

  /*#################################
          REGISTRATION SETTINGS
    #################################*/

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
   
  // Additional button to allow profile editing when the user is logged in
  Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        Router.go('ProfileEdit');
    }
});
  
}

/*#################################
            METEOR SERVER
  #################################*/


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
Router.route('/ProfileEdit');
