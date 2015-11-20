module.exports = function () {

this.Before(function () {

    this.AuthenticationHelper = {

      logout: function () {
        client.executeAsync(function (done) {
          Meteor.logout(done);
        });
      }
    };

  });
};
