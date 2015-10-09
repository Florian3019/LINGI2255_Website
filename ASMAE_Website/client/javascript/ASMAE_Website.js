  /*#################################
              LOGIN SETTINGS
    #################################*/

  Accounts.ui.config({
    requestPermissions: {
      facebook: ['public_profile','email'], // 'user_birthday' --> requires app review from facebook
      googe: ['profile', 'email','user_birthday']
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
    // extraSignupFields: [{
    //     fieldName: 'first-name',
    //     fieldLabel: 'First name',
    //     inputType: 'text',
    //     visible: true,
    //     validate: function(value, errorFunction) {
    //       if (!value) {
    //         errorFunction("Please write your first name");
    //         return false;
    //       } else {
    //         return true;
    //       }
    //     }
    // }, {
    //     fieldName: 'last-name',
    //     fieldLabel: 'Last name',
    //     inputType: 'text',
    //     visible: true,
    // }, {
    //     fieldName: 'gender',
    //     showFieldLabel: false,      // If true, fieldLabel will be shown before radio group
    //     fieldLabel: 'Gender',
    //     inputType: 'radio',
    //     radioLayout: 'vertical',    // It can be 'inline' or 'vertical'
    //     data: [{                    // Array of radio options, all properties are required
    //         id: 1,                  // id suffix of the radio element
    //         label: 'Male',          // label for the radio element
    //         value: 'm'              // value of the radio element, this will be saved.
    //       }, {
    //         id: 2,
    //         label: 'Female',
    //         value: 'f',
    //         checked: 'checked'
    //     }],
    //     visible: true
    // }
    // }]



  });

  Template._loginButtonsLoggedInDropdownActions.helpers({
    allowChangingPassword: function() {
      // Disallow the user to change its password 
      // (which would be inexistant) if he logged in via google or facebook
      var user = Meteor.user();
      if(!user){
        return false;
      }
      if(!user.services){
        return false;
      }
      return !(user.services.google || user.services.facebook);
    }
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

  // Template.siteRegistration.events({

  //   'submit form':function(){
  //     event.preventDefault();
  //       var lastname = event.target.lastname.value;
  //       var firstname = event.target.firstname.value;
  //       var email = event.target.email.value;
  //       var phone = event.target.phone.value;
  //       var sex = event.target.sex.value;
  //       // var password = event.target.password.value;
  //       var birthDate = event.target.date.value;

        
  //       data = { 
  //         profile:{
  //           _id: Meteor.userId(),
  //           lastName : lastname,
  //           firstName : firstname,
  //           emails : [{"address": email, "verified":false}],
  //           phone : phone,
  //           gender : sex,
  //           birthDate : birthDate
  //         }
  //       };

  //       Meteor.call('updateUser', data);
  //     Router.go('home');
  //   }


  // }); 
   
  // Template.SiteRegistration.helpers({
  //   // TODO

  //   'getLastName':function(){
  //     // Must setup publish/subscribe
  //     var res = UserList.find({ _id: Meteor.userId()}, {profile: {lastName:1}});
  //     var myDoc = res.fetch();
  //     console.log(myDoc);
  //     return res;
  //   }


  // }); 

  // Additional button to allow profile editing when the user is logged in
  Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        Router.go('ProfileEdit');
    }
});

Tracker.autorun(function () {
  Meteor.subscribe("courts");
  Meteor.subscribe("addresses");
  Meteor.subscribe("users");
  Meteor.subscribe("pairs");
});