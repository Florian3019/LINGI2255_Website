/*
	This file defines helpers for the page that is displayed after a court has correctly been registered.
*/
Template.confirmationRegistrationCourt.helpers({
    'ownerEmail' : function(owner){
        if(owner === null || owner === undefined) return '';
        if(owner.emails[0].address){
            return owner.emails[0].address;
        }
        else{
            return '';
        }
    },
});
