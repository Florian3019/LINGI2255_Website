Template.printSheets.events({

  'click #Save':function(event){
    var info={
      year : document.getElementById("Year").value,
      type : document.getElementById("Type").value,
      cat : document.getElementById("Category").value,
    };
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
        Session.set("printSheets/poolList",poolList);
        // for (var id in poolList) {
        //   var pool = Pools.findOne({_id:poolList[id]});
        //   console.log(pool);

      //}
      }
    }
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

Template.printSheets.onRendered(function() {
  Session.set("printSheets/poolList","");
  console.log("set to null");
});

Template.printSheets.helpers({
  'getPool':function(){
    poolId = Session.get("printSheets/poolList");
      return poolId;
    }
  //   var info = Session.get("full")
  //   var year = Years.findOne({_id:info.year});
  //   // console.log(year);
  //   if(year==undefined){
  //     return undefined;
  //   }
  //   else{
  //     var type = Types.findOne({_id:year[info.type]});
  //     // console.log(type);
  //     if(type==undefined){
  //       return undefined
  //     }
  //     else{
  //       var poolList = type[info.cat];
  //       console.log(poolList);
  //       Session.set("printSheets",poolList);
  //       // for (var id in poolList) {
  //       //   var pool = Pools.findOne({_id:poolList[id]});
  //       //   console.log(pool);
  //
  //     //}
  //     }
  //   }
  //   return undefined;
  // }


});
