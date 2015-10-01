Template.CourtInfo.helpers({
  'rue': function(){
    var court = Courts.find({surface : "A"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "Rue des chatons";
    }
    else {
      return addr[0].street;
    }
  },
  'num': function(){
    var court = Courts.find({surface : "A"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "4";
    }
    else {
      return addr[0].number;
    }  },
  'box': function(){
    var court = Courts.find({surface : "A"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "222";
    }
    else {
      return addr[0].box;
    }
  },
  'zipcode': function(){
    var court = Courts.find({surface : "A"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "1348";
    }
    else {
      return addr[0].zipCode;
    }  },
  'city': function(){
    var court = Courts.find({surface : "A"}).fetch();
    var addr = Addresses.find({ _id : court[0].addressID}).fetch();
    if (addr==null) {
      return "Louvain-La-Neuve";
    }
    else {
      return addr[0].city;
    }  },
  'surface': function(){
    var court = Courts.find({surface : "A"}).fetch();
    if (court==null) {
      return "ZZ";
    }
    else {
      return court[0].surface
    }
  },
  'ttype' : function(){
    var court = Courts.find({surface : "A"}).fetch();
    if (court==null) {
      return "Tarmac";
    }
    else {
      return court[0].courtType
    }    },
  'instructions': function(){
    var court = Courts.find({surface : "A"}).fetch();
    if (court==null) {
      return "Passez par derrière le chateau";
    }
    else {
      return court[0].instructions
    }    },
  'commentaire': function(){
    var court = Courts.find({surface : "A"}).fetch();
    if (court==null) {
      return "Pas de chiens, mes chats en sont allergiques merci.";
    }
    else {
      return court[0].ownerComment
    }    }
});