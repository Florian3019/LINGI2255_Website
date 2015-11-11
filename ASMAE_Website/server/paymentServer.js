var gateway;

Meteor.startup(function () {
  var braintree = Meteor.npmRequire('braintree');
  gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    publicKey: "ddp2cds2fstvd2qg",
    privateKey: "b5d0e2585edbf79cb532386a7c4358d0",   // Secret
    merchantId: "xcck6hkrzgdd3cnc"
  });
});

Meteor.methods({
  getClientToken: function (clientId) {
    var generateToken = Meteor.wrapAsync(gateway.clientToken.generate, gateway.clientToken);
    var options = {};

    if (clientId) {
      options.clientId = clientId;
    }

    var response = generateToken(options);

    return response.clientToken;
  },
  createTransaction: function (data) {
    var transaction = Meteor.wrapAsync(gateway.transaction.sale, gateway.transaction);
    // this is very naive, do not do this in production!
    var amount = parseInt(data.quantity, 10) * 15;

    var response = transaction({
      amount: amount,
      paymentMethodNonce: data.nonce,
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      }
    });

    // ...
    // perform a server side action with response
    // ...

    return response;
  }
});
