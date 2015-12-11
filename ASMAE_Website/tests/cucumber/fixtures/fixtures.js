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
      },

    'popdbtest' : function(event) {
      /*
       * 2015 data
       */
      var nMen2015 = [30, 0, 0, 0, 0, 0, 0];
      var nWomen2015 = [0, 0, 0, 0, 0, 0];
      var nMixed2015 = [0, 0, 0, 0, 0, 0, 0];
      var nFamily2015 = 0;
      var nPairs2015 = [nMen2015,nWomen2015,nMixed2015,nFamily2015];
      var nAloneMen2015 = [0, 0, 0, 0, 0, 0, 0];
      var nAloneWomen2015 = [0, 0, 0, 0, 0, 0, 0];
      var nAloneMixed2015 = [0, 0, 0, 0, 0, 0, 0];
      var nAloneFamily2015 = 0;
      var nAlones2015 = [nAloneMen2015,nAloneWomen2015,nAloneMixed2015,nAloneFamily2015];

      var nCourtSaturday2015 = 10;
      var nCourtSunday2015 = 10;
      var nCourtBoth2015 = 10;

      /*
       * 2014 data
       */
      var nUnregistered = 0;
      var nStaff = 1;
      var nAdmin = 1;

      var tournamentData2015 = {
        tournamentDate : new Date(2015,8,12),
        tournamentPrice : 10
      }
      var tournamentDataTab = [tournamentData2015];
      var nPairsTab = [nPairs2015];
      var nAlonesTab = [nAlones2015];
      var nCourtSaturdayTab = [nCourtSaturday2015];
      var nCourtSundayTab = [nCourtSunday2015];
      var nCourtBothTab = [nCourtBoth2015];

      Meteor.call("populateDB", tournamentDataTab, nPairsTab, nAlonesTab, nUnregistered, nCourtSaturdayTab, nCourtSundayTab, nCourtBothTab, nStaff, nAdmin, true);
    }

    });

})();
