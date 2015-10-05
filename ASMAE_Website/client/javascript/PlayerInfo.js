Template.PlayersInfo.helpers({
  //Don't work
  'nom': function(){
    var player = users.find({username : "Amalingreau"}).fetch();
    player=null;
    if (player==null) {
      return "Combéfis";
    }
    else {
      return "default name";
    }
  },
  'prenom': function(){
    var player = users.find({username : "Amalingreau"}).fetch();
    player=null;
    if (player==null) {
      return "Sébastien";
    }
    else {
      return "default first name";
    }
  }
});
