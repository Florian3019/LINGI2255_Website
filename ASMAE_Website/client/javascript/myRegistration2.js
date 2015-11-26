Template.myRegistration2.helpers({
  'displayOk': function(){
    Session.set("myRegistration/displayOk", true);
    var player = Meteor.users.findOne({"_id": Meteor.userId()})
    Meteor.call('getYear',player, function(error, result){
      if(error){
        console.error('CourtRegistration error');
        console.error(error);
      }
      else if(result == null){
        console.error("No result");
      }
      else{
        if(result[0].length == 0){
          Session.set("myRegistration/displayOk", false);
        }
        else {
          Session.set("myRegistration/String",result);
        }
      }       
    });
  },
  'getDisplayOK': function(){
    return Session.get("myRegistration/displayOk");
  },
  'makeString': function(){
    var obj = Session.get("myRegistration/String")[0];
    var id = Meteor.userId();
    result = [];
    for(i = 0; i<obj.length;i++){
      var pair_id = obj[i][3];
      var pair = Pairs.findOne({'_id':pair_id});
      var str;
      if(pair.player2 == undefined){
        str = ", Partenaire: /"
      }
      else if(pair.player1._id == id){
        var player2 = Meteor.users.findOne({'_id':pair.player2._id})
        str = ", Partenaire: "+player2.profile.firstName+" "+player2.profile.lastName
      }
      else{
        var p2 = Meteor.users.findOne({'_id':pair.player1._id})
        str = ", Partenaire: "+player2.profile.firstName+" "+player2.profile.lastName
      }
      //result.push("Type: "+obj[i][0]+", Catégorie: "+obj[i][2]+str)
      var str_return = "Type: "+obj[i][0]+", Catégorie: "+obj[i][2]+str
      ret_obj = {'id': pair_id,'value':str_return}
      result.push(ret_obj)
    }
    console.log(result)
    return result;
  }
});
Template.myRegistration2.events({
  'click .playerFound': function(event) {
    if(confirm("Voulez vous vous désinscrire ?")){
      var pair_id = event.currentTarget.dataset.pairid
      var pair = Pairs.findOne({'_id':pair_id});
      console.log(pair)
      if(pair.player2 == undefined){
        Pairs.remove({'_id':pair_id});
        var pools = Pools.find().fetch()
        var pool_id
        for(i = 0; i < pools.length; i++){
          for(k = 0; k<pair_id.length; k++){
            if(pair_id==pools[i].pairs[k]){
              pool_id = pools[i]._id
              var array = []
              for(l = 0; l<pair_id.length; l++){
                if(k != l){
                  array.push(pools[i].pairs[l])
                }
              }
              break;
            }
          }
        }
        Pairs.update({'_id': pool_id}, {$set: {'pairs': array}});
      }
      else {
        if(pair.player1._id == Meteor.userId()){
          Pairs.update({'_id': pair_id}, {$set: {'player1': pair.player2}});
        }
        Pairs.update({'_id': pair_id}, {$unset: {'player2': ""}});
        pair = Pairs.findOne({'_id':pair_id});
        var email = pair.player1.emails[0].address
      }
      Router.go('home');
    }
  }
});