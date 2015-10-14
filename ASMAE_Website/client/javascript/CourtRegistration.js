Template.courtRegistration.helpers({
    'availableThisDay': function(available){
        if(typeof available === 'undefined'){
            return true;
        }
        else
        {
            return available;
        }
    },

    'selectedSurface': function(value, surfaceName){
        return value === surfaceName ? 'selected' : '';
    }
});

Template.courtRegistration.events({
    'submit form': function(event){
        event.preventDefault();
        var address = {
            street : $('[name=street]').val(),
            number : $('[name=addressNumber]').val(),
            box : $('[name=box]').val(),
            city : $('[name=city]').val(),
            zipCode : $('[name=zipCode]').val(),
            country : $('[name=country]').val()
        };
        var courtData = {
            ownerID: Meteor.userId(),
            surface : $('[name=surface]').val(),
        	courtType : $('[name=courtType]').val(),
        	instructions : $('[name=instructions]').val(),
        	ownerComment : $('[name=ownerComment]').val(),
            dispoSamedi : $('[name=dispoSamedi]').val(),
            dispoDimanche : $('[name=dispoDimanche]').val()
        };
		
		Meteor.call('updateCourt', courtData, address, function(error, results){
			if(error){
	            console.log(error.reason);
	        } else {
				console.log("les results : "+results);
	            Router.go('confirmation_registration_court', {_id: results});
	        }
	    });
    }
});