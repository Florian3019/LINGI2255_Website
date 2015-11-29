Template.selectNewCourt.events({
    'click .courtRow' : function(event){

    		var courts = event.currentTarget.lastElementChild.innerText;
    		Session.set("selectNewCourt/courts",courts);
    	
            $('#chooseCourtsModal').modal('show');
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

        $('#chooseCourtsModal')
        .on('hidden.bs.modal', function() {
            Session.set("PoolList/ChosenCourt","");
        })
        .modal('hide');
    }
  });