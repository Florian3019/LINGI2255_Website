/*
  This file defines how to the page to print all the pdf in one go behaves
*/
Template.printSheets.events({

  'click #Save':function(event){
    Session.set("printSheets/Value", true);
    Session.set("printSheets/isWorkingPool",true);


    var info={
      year : document.getElementById("Year").value,
      type : document.getElementById("Type").value,
      cat : document.getElementById("Category").value,
    };
    Session.set("printSheets/info",info);



    Meteor.call("getPoolListToPrint", info, function(error, result){
      if(error){
        console.log("error", error);
        return;
      }
      if(result!== undefined && result.length==0){
        Session.set("printSheets/isWorkingPool",false);
        swal({
        title: "Information",
        text: "Aucune poule trouvée pour cette sélection. ",
        type: "info",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
        closeOnConfirm: true
        });
        return;
      }
      if(result){
        Session.set("printSheets/poolList",result);
      }
      document.getElementById("printPdf").style.display="block";
      Session.set("printSheets/isWorkingPool",false);
    });
  },

  'click #printPdf':function(event){
    var info = Session.get("printSheets/info");
    var infoData;
    if(info.type==="family"){
      infoData = info.year+"_"+typesTranslate[info.type];
    }
    var cat = info.cat == "all"? "all" :categoriesTranslate[info.cat] ;
    infoData = info.year+"_"+typesTranslate[info.type]+"_"+cat;
    console.log(infoData);

    var inpt = document.getElementsByTagName("input");
    for (var i = 0; i < inpt.length; i++) {
      inpt[i].setAttribute('type','hidden');
    }

    var win = window.open("", "Knock-offs", "width=545", "height=840");
    var head = $("#printCSS").html();
    var body = $("#printContent").html();
    win.document.write('<html><head><title>'+infoData+'</title>'+
      '<link rel="stylesheet" type="text/css" href="scoreTable.css">'+
      '<script src="http://code.jquery.com/jquery-2.1.4.min.js"></script>'+
      '<link href="https://maxcdn.bootstrapcdn.com/bootswatch/latest/paper/bootstrap.min.css" rel="stylesheet">'+
      '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/latest/js/bootstrap.min.js"></script>'+
      '<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>'+
      head+
      '</head>'+
      '<body>'+
      body+
      '</body>'
    );
    setTimeout(function(){
      win.print();
      win.close();
    }, 3000);

  }
});


Template.printSheets.onRendered(function() {
  Session.set("printSheets/poolList","");
  console.log("set to null");
});

Template.printSheetsV2.helpers({
  'getInfo':function(poolId){
    var infoPools = Session.get("printSheets/info");
    if(infoPools===undefined) return undefined;
    if(infoPools.type==="family"){
      return infoPools.year+" "+typesTranslate[infoPools.type];
    }
    var pool = Pools.findOne({_id:poolId},{category:1});
    // var cat = infoPools.cat == "all"? "all" :categoriesTranslate[infoPools.cat] ;
    return infoPools.year+" "+typesTranslate[infoPools.type]+" "+categoriesTranslate[pool.category];
  },
});

Template.printSheets.helpers({
  'getInfo':function(){
    var infoPools = Session.get("printSheets/info");
    if(infoPools.type==="family"){
      return infoPools.year+" "+typesTranslate[infoPools.type];
    }
    var cat = infoPools.cat == "all"? "all" :categoriesTranslate[infoPools.cat] ;
    return infoPools.year+" "+typesTranslate[infoPools.type]+" "+cat;
  },

  'getPool':function(){
    var poolId = Session.get("printSheets/poolList");
    if(poolId!=undefined){
      var arr = new Array(poolId.length);
      for (var i = 0; i < poolId.length; i++) {
        var tmp = {
          id : "pool"+i.toString(),
          pool:{_id:poolId[i]}
        };
        arr[i]=tmp;
      }
      return arr;
  }
  else{
    return undefined;
  }
  },

  'getOnePool':function(){
    var poolId = Session.get("printOneSheet/poolId");
    if(poolId !=undefined){
      var tab = [];
      tab.push({id:"pool0", pool:{_id:poolId}});
      return tab;
    }
    else{
      return undefined;
    }
  },

  'isOnePage':function(){
    return Session.get("printSheets/OnePage");
  },

  'getAllYears':function(){
    var callBack = function(err, ret){
      Session.set("printSheets/allYears", ret);
    }
    Meteor.call("getAllYears", callBack);
  },

  'getAllYearsSession':function(){
    return Session.get("printSheets/allYears");
  },


    'selectedYear' : function(value){
        var currentYear = GlobalValues.findOne({_id: "currentYear"});
        if(typeof currentYear !== 'undefined'){
            return value == currentYear.value ? 'selected' : '';
        }
        else{
            return '';
        }
    },

    'isWorkingPool' : function(){
      return Session.get("printSheets/isWorkingPool");
    },

    'isWorkingPrint' : function(){
      return Session.get("printSheets/isWorkingPrint");
    }

});
