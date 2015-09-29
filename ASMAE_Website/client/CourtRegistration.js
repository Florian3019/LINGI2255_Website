Template.CourtRegistration.events({
    'submit form': function(event){
        event.preventDefault();
        var courtData = {
        	surface : $('[name=surface]').val(),
        	courtType : $('[name=courtType]').val(),
        	instructions : $('[name=instructions]').val(),
        	ownerComment : $('[name=ownerComment]').val()
        }
        Meteor.call('insertCourt', courtData);
    }
});