Template.printSheets.events({

  'click #Save':function(event){
    var full={
      year : document.getElementById("Year").value,
      type : document.getElementById("Type").value,
      cat : document.getElementById("Category").value,
    };
    Session.set("full",full);
    console.log("saved");
  },

  'click #Print':function(event){
    var info = Session.get("full")
    var year = Years.findOne({_id:info.year});
    // console.log(year);
    if(year==undefined){
      return undefined;
    }
    else{
      var type = Types.findOne({_id:year[info.type]});
      // console.log(type);
      if(type==undefined){
        return undefined
      }
      else{
        var poolList = type[info.cat];
        // console.log(poolList);
        for (var id in poolList) {
          var pool = Pools.findOne({_id:poolList[id]});
          // console.log(pool);
        }
      }
    }
    //  var pool = Pools.find({_id:})


  },
});


Template.printSheets.helpers({

'getPool':function(){
  var info = Session.get("full")
  var year = Years.findOne({_id:info.year});
  // console.log(year);
  if(year==undefined){
    return undefined;
  }
  else{
    var type = Types.findOne({_id:year[info.type]});
    // console.log(type);
    if(type==undefined){
      return undefined
    }
    else{
      var poolList = type[info.cat];
      console.log(poolList);
      return poolList;
      // for (var id in poolList) {
      //   var pool = Pools.findOne({_id:poolList[id]});
      //   console.log(pool);

    //}
    }
  }
  return undefined;
}


});
