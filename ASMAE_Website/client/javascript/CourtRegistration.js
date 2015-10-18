Template.courtRegistration.helpers({
    'availableThisDay': function(available){
        if(available === null){
            return 'checked';
        }
        else
        {
            if(available){
                return 'checked';
            }
            else{
                return '';
            }
        }
    },

    'selectedSurface': function(value, surfaceName){
        return value === surfaceName ? 'selected' : '';
    },

    'isPrivate': function(value){
        if(value === "privé"){
            return 'checked';
        }
        else{
            return '';
        }
    },
    'isClub': function(value){
        console.log(value);
        if(value === "club"){
            return 'checked';
        }
        else{
            return '';
        }
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

        var id; //Used for the update of a court
        if(this.court){
            id = this.court._id;
        }
        var courtData = {
            _id : id,
            ownerID : Meteor.userId(),
            surface : $('[name=surface]').val(),
        	courtType : $('[name=courtType]:checked').val(),
        	instructions : $('[name=instructions]').val(),
        	ownerComment : $('[name=ownerComment]').val(),
            dispoSamedi : $('[name=dispoSamedi]').is(":checked"),
            dispoDimanche : $('[name=dispoDimanche]').is(":checked")
        };

        console.log("dans le submit: "+ courtData.dispoSamedi);
        console.log("dans le submit: "+ courtData.dispoDimanche);

		Meteor.call('updateCourt', courtData, address, function(courtId){
			Router.go('confirmation_registration_court', {_id: results});
	    });
    }
});