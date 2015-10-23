Template.courtInfoPage.helpers({

  	'checked': function(value){
  		if(value){
  			return "glyphicon-ok lendOk"
  		}
  		else
  		{
  			return "glyphicon-remove lendNot"
  		}
  	}

});



Template.courtInfoPage.events({
    'click #deleteCourt': function(event){
        event.preventDefault();

        if (confirm('Etes-vous certain de vouloir supprimer définitivement ce terrain?\nToutes les données concernant ce terrain seront supprimées. Cette action est irréversible.')) {
			Meteor.call('deleteCourt', this.court._id, function(error, result){
	            if(error){
	                console.error('deleteCourt error');
	                console.error(error);
	            }
	            alert("Terrain supprimé !");
				Router.go('home');
	    	});
		}
    }
});