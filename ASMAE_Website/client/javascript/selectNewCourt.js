Template.selectNewCourt.events({
    'click #newCourtCancel':function(event){
        Session.set("PoolList/ChosenCourt","");
        Session.set("selectNewCourt/saturday","Ignore");
        Session.set("selectNewCourt/sunday","Ignore");
        Session.set("selectNewCourt/staffOK","Ignore");
        Session.set("selectNewCourt/ownerOK","Ignore");
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
            Session.set("selectNewCourt/saturday","No");
            return false;
        }
    },
    'isSunday':function(){
        if(Session.get("PoolList/Type")==="mixed" || Session.get("PoolList/Type")==="family"){
            Session.set("selectNewCourt/sunday","Yes");
            return true;
        }
        else{
            Session.set("selectNewCourt/sunday","No");
            return false;
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

Template.chooseCourtsModal.events({
    'click .valid': function(event){

        if(Session.get("changeCourtsBracket")==="true"){

            var round = Session.get("PoolList/ChosenRound");
            var courtNumber = document.getElementById("selectCourt").value; // new court
            var court = Session.get("PoolList/ChosenCourt"); // old court
            var year = Years.findOne({_id:Session.get("PoolList/Year")});
            var typeID = year[Session.get("PoolList/Type")];
            var type = Types.findOne({_id:typeID});
            var listCourts = type[Session.get("PoolList/Category")+"Courts"];
            var changeAll = document.getElementById("all").checked;

            if(listCourts!= undefined){
                console.log("No court!");
                $('#chooseCourtsModal')
                    .on('hidden.bs.modal', function() {
                        Session.set("PoolList/ChosenCourt","");
                        Session.set("selectNewCourt/saturday","Ignore");
                        Session.set("selectNewCourt/sunday","Ignore");
                        Session.set("selectNewCourt/staffOK","Ignore");
                        Session.set("selectNewCourt/ownerOK","Ignore");
                    })
                    .modal('hide');
            }

            for(var i=0;i<listCourts.length;i++){
                if(listCourts[i][1]==court && (changeAll || (listCourts[i][0]==round))){
                    listCourts[i][1] = parseInt(courtNumber);
                }
            }

            Meteor.call("updateType",type);
            
            Session.set("changeCourtsBracket","false");
        }
        else{

            var courtNumber = document.getElementById("selectCourt").value
            var poolId = Session.get("PoolList/poolID"); 
            var pool = Pools.findOne({_id:poolId});
            pool.courtId = parseInt(courtNumber);

            Meteor.call('updatePool',pool);
        }

        var newCourtData = Courts.findOne({"courtNumber":courtNumber});
        var oldCourtData = Courts.findOne({"courtNumber":court});

        var newCourtAddress = Addresses.findOne({_id:newCourtData.addressID});
        var oldCourtAddress = Addresses.findOne({_id:oldCourtAddress.addressID});

        Meteor.call("addToModificationsLog",
        {"opType":"Changement de terrain",
        "details":
            "Le terrain N°"+ court + " " + formatAddress(oldCourtAddress) + " de la poule "+poolId+" est maintenant le terrain N°"+courtNumber+ " "+ formatAddress(newCourtAddress)+ getStringOptions()
        },
            function(err, logId){
                if(err){
                    console.log(err);
                    return;
                }
                Meteor.call('addToCourtLog', newCourtData._id, logId);
                Meteor.call('addToCourtLog', oldCourtData._id, logId);
            }
        );

        $('#chooseCourtsModal')
        .on('hidden.bs.modal', function() {
            Session.set("PoolList/ChosenCourt","");
            Session.set("selectNewCourt/saturday","Ignore");
            Session.set("selectNewCourt/sunday","Ignore");
            Session.set("selectNewCourt/staffOK","Ignore");
            Session.set("selectNewCourt/ownerOK","Ignore");
        })
        .modal('hide');
    }
  });