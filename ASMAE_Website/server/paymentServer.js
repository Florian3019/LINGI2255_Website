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

    //Calculate amount to pay
    var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
    var amount = Years.findOne({_id: currentYear}).tournamentPrice;

    if(data.extras)
    {
        for(extra in data.extras){
            amount += data.extras[extra] * Extras.findOne({name: extra}).price;
        }
    }


    var response = transaction({
      amount: amount,
      paymentMethodNonce: data.nonce,
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      }
    });

    if(response.success){
        var currentDate = new Date();
        var data = {
            status : "paid",
            date: currentDate,
            paymentMethod: "CreditCard"
        };

        Payments.update({"userID": Meteor.userId()} , {$set: data}, function(err, result){
            if(err){
                console.error('Payments.update error after transaction');
                console.error(err);
            }
        });

        return response;
    }
    else{
        console.log("Payment was not succesful on Braintree :"+response);
        throw new Meteor.Error("Payment was not succesful on Braintree");
    }

  }
});
