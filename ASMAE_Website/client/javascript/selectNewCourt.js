Template.selectNewCourt.events({
    'click #newCourtCancel':function(event){
        Session.set("PoolList/ChosenCourt","");
    },

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
    }
  });

var getStringOptions = function(){
    return " dans "+typesTranslate[Session.get("PoolList/Type")]+">"+
            categoriesTranslate[Session.get("PoolList/Category")]+
            " (" + Session.get("PoolList/Year")+")";
}

Template.chooseCourtsModal.events({
    'click .valid': function(event){
    	var courtNumber = document.getElementById("selectCourt").value

    	var poolId = Session.get("PoolList/poolID");

    	var pool = Pools.findOne({_id:poolId});
    	pool.courtId = parseInt(courtNumber);

    	Meteor.call('updatePool',pool);

        Meteor.call("addToModificationsLog",
        {"opType":"Changement de terrain",
        "details":
            "Le terrain de la poule "+poolId+" est maintenant "+courtNumber+ getStringOptions()
        });

        $('#chooseCourtsModal')
        .on('hidden.bs.modal', function() {
            Session.set("PoolList/ChosenCourt","");
        })
        .modal('hide');
    }
  });