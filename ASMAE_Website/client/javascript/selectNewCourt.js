Template.selectNewCourt.events({
    'click #newCourtCancel':function(event){
        restoreSession();
    },

    'click .courtRow' : function(event){
		var courts = event.currentTarget.lastElementChild.innerText;
		Session.set("selectNewCourt/courts",courts);
	
        $('#chooseCourtsModal').modal('show');
     }
});

Template.selectNewCourt.helpers({
    'isSaturday':function(){
        if(Session.get("PoolList/Type")==="men" || Session.get("PoolList/Type")==="women"){
            Session.set("selectNewCourt/saturday","Yes");
            return true;
        }
        else{
            Session.set("selectNewCourt/saturday","Ignore");
            return null;
        }
    },
    'isSunday':function(){
        if(Session.get("PoolList/Type")==="mixed" || Session.get("PoolList/Type")==="family"){
            Session.set("selectNewCourt/sunday","Yes");
            return true;
        }
        else{
            Session.set("selectNewCourt/sunday","Ignore");
            return null;
        }
    },
    'isStaffOk':function(){
        Session.set("selectNewCourt/staffOK","Yes");
        return true;
    },
    'isOwnerOk':function(){
        Session.set("selectNewCourt/ownerOK","Yes");
        return true;
    }
});

Template.chooseCourtsModal.helpers({
    'CourtsNumber': function(){

    	var courts = Session.get("selectNewCourt/courts",courts);
        if(courts==undefined) return undefined;
    	var courtsArray = courts.split(',');
    	return courtsArray;
    },
    'getChangeCourtsBracket': function(){
        if(Session.get("changeCourtsBracket")==="true"){
            return true;
        }
        else{
            return false;
        }
    }
  });

var getStringOptions = function(){
    return " dans "+typesTranslate[Session.get("PoolList/Type")]+">"+
            categoriesTranslate[Session.get("PoolList/Category")]+
            " (" + Session.get("PoolList/Year")+")";
}

var restoreSession = function(){
    Session.set("PoolList/ChosenCourt","");
    Session.set("selectNewCourt/saturday","Ignore");
    Session.set("selectNewCourt/sunday","Ignore");
    Session.set("selectNewCourt/staffOK","Ignore");
    Session.set("selectNewCourt/ownerOK","Ignore");
    Session.set("changeCourtsBracket","false");
};

var addToLog = function(opType,details,newCourtData,oldCourtData){
    Meteor.call("addToModificationsLog",
    {"opType":opType,
    "details":
        details
    },
        function(err, logId){
            if(err){
                console.log(err);
                return;
            }
            if(newCourtData!=undefined){
                Meteor.call('addToCourtLog', newCourtData._id, logId);
            }   
            if(oldCourtData!=undefined){
                Meteor.call('addToCourtLog', oldCourtData._id, logId);
            }
        }
    );
};

var changeCourtPool = function(listDouble,newCourtNumber,oldCourtNumber,behavior){

    var poolId = Session.get("PoolList/poolID"); 
    var pool = Pools.findOne({_id:poolId});

    if(behavior!=="keepBoth"){
        for(var i=0;i<listDouble.length;i++){
            if(behavior==="swap"){
                
                var newCourtData = Courts.findOne({"courtNumber":newCourtNumber});
                var oldCourtData = Courts.findOne({"courtNumber":listDouble[i].courtId});
                var newCourtAddress = Addresses.findOne({_id:newCourtData.addressID});
                var oldCourtAddress = Addresses.findOne({_id:oldCourtData.addressID});
                var details = "Le terrain N°"+ listDouble[i].courtId + " " + formatAddress(oldCourtAddress) + " de la poule "+listDouble[i]._id+" est maintenant le terrain N°"+oldCourtNumber+ " "+ formatAddress(newCourtAddress)+ getStringOptions();

                addToLog("Changement de terrain",details,newCourtData,oldCourtData);

                listDouble[i].courtId=oldCourtNumber;
                Meteor.call('updatePool',listDouble[i]);
            }
            if(behavior==="delete"){
                var oldCourtData = Courts.findOne({"courtNumber":listDouble[i].courtId});
                addToLog("Changement de terrain","Le terrain de la poule "+listDouble[i]._id+" a été supprimé"+ getStringOptions(),newCourtData,oldCourtData);
                Pools.update({_id:listDouble[i]._id},{$unset: {"courtId":""}});
            }
        }
    }

    var newCourtData = Courts.findOne({"courtNumber":newCourtNumber});
    var oldCourtData = Courts.findOne({"courtNumber":pool.courtId});
    var newCourtAddress = Addresses.findOne({_id:newCourtData.addressID});

    if(oldCourtData==undefined){
        var details = "Le terrain N°"+ newCourtNumber + " " + formatAddress(oldCourtAddress) + "a été assigné à la poule "+pool._id+ getStringOptions();
        addToLog("Assignation de terrain",details,newCourtData,oldCourtData);

        pool.courtId = newCourtNumber;
        Meteor.call('updatePool',pool);
        return;
    }

    var oldCourtAddress = Addresses.findOne({_id:oldCourtData.addressID});
    var details = "Le terrain N°"+ pool.courtId + " " + formatAddress(oldCourtAddress) + " de la poule "+pool._id+" est maintenant le terrain N°"+newCourtNumber+ " "+ formatAddress(newCourtAddress)+ getStringOptions();
    addToLog("Changement de terrain",details,newCourtData,oldCourtData);

    pool.courtId = newCourtNumber;
    Meteor.call('updatePool',pool);
}

var changeCourtKnockOff = function(listDouble,newCourtNumber,oldCourtNumber,behavior){

    var pos = Session.get("PoolList/ChosenPos");
    var year = Years.findOne({_id:Session.get("PoolList/Year")});
    var typeID = year[Session.get("PoolList/Type")];
    var type = Types.findOne({_id:typeID});
    var listCourts = type[Session.get("PoolList/Category")+"Courts"];
    var changeAll = document.getElementById("all").checked;
    var foundSame=false;

    if(behavior!=="keepBoth"){
        for(var i=0;i<listDouble.length;i++){

            for(var k=0;k<categoriesKeys.length;k++){
                var field = categoriesKeys[k]+"Courts";
                var listCourts = listDouble[i][field];

                if(listCourts!=undefined){
                    if(listDouble[i]._id===typeID && Session.get("PoolList/Category").concat("Courts")===field){
                        foundSame=true;
                
                        for(var m=0;m<listCourts.length;m++){
                            if(listCourts[m]==newCourtNumber){
                                if(behavior==="swap"){
                                    listCourts[m]=oldCourtNumber;
                                    console.log(listCourts);
                                }
                                if(behavior==="delete"){
                                    listCourts[m]="?";
                                }
                            }
                            else if(changeAll && listCourts[m]==oldCourtNumber && oldCourtNumber!=-1){
                                listCourts[m]=newCourtNumber;
                            }
                        }
                        listCourts[pos] = newCourtNumber;
                        console.log(listCourts);
                    }
                    else{
                        for(var m=0;m<listCourts.length;m++){
                            if(listCourts[m]==newCourtNumber){
                                if(behavior==="swap"){
                                    listCourts[m]=oldCourtNumber;
                                }
                                if(behavior==="delete"){
                                    listCourts[m]="?";
                                }
                            }
                        }
                    }
                }

            }
            Meteor.call('updateType',listDouble[i]);
        }
    }

    if(!foundSame){
        listCourts[pos] = newCourtNumber;

        if(changeAll && oldCourtNumber!=-1){
            for(var i=0;i<listCourts.length;i++){
                if(listCourts[i]==oldCourtNumber){
                    listCourts[i]=newCourtNumber;
                }
            }
        }

        callback = function(err, retVal){
            restoreSession();
         };

        Meteor.call("updateType",type,callback);

    }
}


Template.chooseCourtsModal.events({
    'click .valid': function(event){

        var newCourtNumber = parseInt(document.getElementById("selectCourt").value);
        var oldCourtNumber = Session.get("PoolList/ChosenCourt");
        
        Session.set("selectNewCourt/newCourtNumber",newCourtNumber);
        Session.set("selectNewCourt/oldCourtNumber",oldCourtNumber);

        var request = {$or:[]};

        var year = Years.findOne({_id:""+new Date().getFullYear()});
        var typesIDS = [];

        for(var i=0; i<typeKeys.length;i++){
            typesIDS.push(year[typeKeys[i]]);
        }

         for(var i=0; i<typesIDS.length;i++){  
            var sub_request=[];   
            for(var k=0;k<categoriesKeys.length;k++){
                data = {};
                data[categoriesKeys[k].concat("Courts")]=newCourtNumber;
                sub_request.push(data);
            }
            request["$or"].push({$and: [{_id:typesIDS[i]},{$or:sub_request}]});
         }
    
        $('#chooseCourtsModal')
        .on('hidden.bs.modal', function() {
            var ok = Session.get("changeCourtsBracket")==="true";
            var listDoublePools = Pools.find({"courtId":newCourtNumber}).fetch();
            var listDoubleKnockOff = Types.find(request).fetch();

            Session.set("selectNewCourt/listDoublePools",listDoublePools);
            Session.set("selectNewCourt/listDoubleKnockOff",listDoubleKnockOff);

            if((!ok && listDoublePools.length!=0) || (ok && listDoubleKnockOff.length!=0)){
                $('#AlertModal').modal('show');
            }
            else{
                if(Session.get("changeCourtsBracket")==="true"){
                    changeCourtKnockOff(listDoubleKnockOff,newCourtNumber,oldCourtNumber,"keepBoth");
                }
                else{
                    changeCourtPool(listDoublePools,newCourtNumber,oldCourtNumber,"keepBoth");
                }
            }
        })
        .modal('hide');
    }
  });

Template.AlertModal.helpers({
    'UsedWhen': function(){
        if(Session.get("changeCourtsBracket")==="true"){
            return "l'après-midi";
        }
        else{
            return 'la matiné';
        }
    },
    'canSwap': function(){
        if(Session.get("PoolList/ChosenCourt")==-1){
            return false;
        }
        else{
            return true;
        }
    }
});

Template.AlertModal.events({
    'click .valid': function(event){

        var behavior = $('input[name="double"]:checked').val();
        var newCourtNumber =  Session.get("selectNewCourt/newCourtNumber");
        var oldCourtNumber = Session.get("selectNewCourt/oldCourtNumber");

        if(Session.get("changeCourtsBracket")==="true"){
            var listDouble = Session.get("selectNewCourt/listDoubleKnockOff");
            changeCourtKnockOff(listDouble,newCourtNumber,oldCourtNumber,behavior);
        }
        else{
            var listDouble = Session.get("selectNewCourt/listDoublePools");
            changeCourtPool(listDouble,newCourtNumber,oldCourtNumber,behavior);
        }

        $('#AlertModal')
        .on('hidden.bs.modal', function() {
            restoreSession();
        })
        .modal('hide');
    },
    'click .cancel': function(event){
        $('#AlertModal')
        .on('hidden.bs.modal', function() {
            restoreSession();
        })
        .modal('hide');
    }
});