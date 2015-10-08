Template.courtInfo.helpers({

  'court': function(){
    return Courts.findOne({surface: "Synthetique"});
  },

  'courtAddress': function(addressID){
      return Addresses.findOne({_id: addressID});
  }

  /*
  'rue': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    console.log("Table : ");
    console.table(Courts.find().fetch());
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "Rue des chatons";
    }
    else {
      return addr[0].street;
    }
  },
  'num': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "4";
    }
    else {
      return addr[0].number;
    }  },
  'box': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "222";
    }
    else {
      return addr[0].box;
    }
  },
  'zipcode': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "1348";
    }
    else {
      return addr[0].zipCode;
    }  },
  'city': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "Louvain-La-Neuve";
    }
    else {
      return addr[0].city;
    }  },
  'surface': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    if (court==null) {
      return "Tarmac";
    }
    else {
      return court[0].surface
    }
  },
  'ttype' : function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    if (court==null) {
      return "Privé";
    }
    else {
      return court[0].type;
    }    },
  'instructions': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    if (court==null) {
      return "Passez par derrière le chateau";
    }
    else {
      return court[0].instructions
    }    },
  'commentaire': function(){
    var court = Courts.find({surface : "Beton"}).fetch();
    if (court==null) {
      return "Pas de chiens, mes chats en sont allergiques merci.";
    }
    else {
      return court[0].ownerComment
    }    }

    */
});
