Template.adminAddCourt.helpers({
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

Template.adminAddCourt.events({
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
        var user = {
            firstName : $('[name=firstName]').val(),
            lastName : $('[name=lastName]').val(),
            address : $('[name=address]').val()
        };
        var query = {};
        if(user.lastName){query["profile.lastName"] = user.lastName;}
        if(user.firstName){query["profile.firstName"] = user.firstName;}
        if(user.address){query["emails.address"] = user.address;}
        cursor = Meteor.users.find(query).fetch();
        var id, currentOwnerID; //Used for the update of an existing court
        if(this.court){
            id = this.court._id;
            if(cursor.length > 0) {
                currentOwnerID = cursor[0]._id;
            }
            else {
                currentOwnerID = this.court.ownerID;
            }
            
        }
        else {
            if(cursor.length > 0) {
                currentOwnerID = cursor[0]._id;
            }
            else {
                currentOwnerID = this.court.ownerID;
            }
        }
        var courtData = {
            _id : id,
            ownerID : currentOwnerID,
            surface : $('[name=surface]').val(),
        	courtType : $('[name=courtType]:checked').val(),
        	instructions : $('[name=instructions]').val(),
        	ownerComment : $('[name=ownerComment]').val(),
            dispoSamedi : $('[name=dispoSamedi]').is(":checked"),
            dispoDimanche : $('[name=dispoDimanche]').is(":checked")
        };

		Meteor.call('updateCourt', courtData, address, function(error, result){
            if(error){
                console.error('CourtRegistration error');
                console.error(error);
            }
            else if(result == null){
                console.error("No result");
            }
			Router.go('confirmation_registration_court', {_id: result});
	    });
    }
});