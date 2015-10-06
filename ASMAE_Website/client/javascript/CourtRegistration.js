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
        	type : $('[name=courtType]').val(),
        	instructions : $('[name=instructions]').val(),
        	ownerComment : $('[name=ownerComment]').val()
        };
        Meteor.call('updateCourt', courtData, address);
        Router.go('home');
    }
});