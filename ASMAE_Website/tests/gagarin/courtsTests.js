describe('Courts', function () {
  var server = meteor();
  var client = browser({flavor: "fiber", location: server});

  var courtID = null;
  /*
    Before each test:
    - add a court to the database
  */
  
  before(function () {
    client.execute(function() {
      Meteor.loginWithPassword("vic@vic.com", "123456"); 
    });

    return server.execute(function () {
      var address = {
        street : "Nom de la rue",
        number : 3,
        city : "LLN",
        zipCode : 1234,
        country : "Belgique"
      };

      var courtData = {
        surface : "Béton",
        courtType : "Privé",
        dispoSamedi : true,
        dispoDimanche : false
      };
      var id =  Meteor.call('updateCourt',  courtData, address);
      return id;

    }).then(function (value) {
      courtID = value;
    });
  });


  it('should insert court into database', function () {
    return server.execute(function (courtID) {
        return Courts.findOne(courtID);
    }, [courtID])
    .then(function (court) {
      console.log(court)
        expect(court).to.be.ok;
        expect(court.surface).to.equal('Béton');
    });
  });

  
  it('should insert court into database 2', function () {
    return server.execute(function () {
        return Courts.findOne({});
    })
    .then(function (value) {
        expect(value).to.equal(undefined);
    });
  });



});