Template.CourtRegistration.events({
    'submit form': function(event){
        event.preventDefault();
        var courtData = {
            street : $('[name=street]').val(),
            number : $('[name=addressNumber]').val(),
            box : $('[name=box]').val(),
            city : $('[name=city]').val(),
            zipCode : $('[name=zipCode]').val(),
        	surface : $('[name=surface]').val(),
        	courtType : $('[name=courtType]').val(),
        	instructions : $('[name=instructions]').val(),
        	ownerComment : $('[name=ownerComment]').val()
        }
        Meteor.call('insertCourt', courtData);
    }
});