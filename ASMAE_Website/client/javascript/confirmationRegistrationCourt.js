Template.confirmationRegistrationCourt.helpers({
    'ownerEmail' : function(owner){
        if(owner!==null && owner!==undefined) return '';
        if(owner.emails[0].address){
            return owner.emails[0].address;
        }
        else{
            return '';
        }
    },
});
