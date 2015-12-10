  (function () {

    'use strict';

    Meteor.methods({
      'addUser': function() {
          Meteor.users.remove({});
          Accounts.createUser({
              email: "test@test.com",
              password: "123456"
          });
          var user = Meteor.users.find().fetch()[0];
          Meteor.users.update(user._id, {
              $set: {"emails.0.verified": true}
  		  });
      },

      'addUserAdmin': function() {
          Meteor.users.remove({});
          Accounts.createUser({
              email: "test@test.com",
              password: "123456"
          });
          var user = Meteor.users.find().fetch()[0];
          Meteor.users.update(user._id, {
              $set: {"emails.0.verified": true}
  		  });

          Meteor.call('turnAdminInsecure', user._id);
      },
      'addYear2015Tests' : function(){
        GlobalValues.update({_id:"currentYear"}, {$set: {
        value : "2015"
      }});
      }

    });

})();
