Template.confirmationRegistrationCourt.helpers({
    'ownerLastName' : function(owner){
        if(owner.profile.lastName){
            return owner.profile.lastName;
        }
        else {
            return '';
        }
    },
    'ownerFirstName' : function(owner){
        if(owner.profile.firstName){
            return owner.profile.firstName;
        }
        else {
            return '';
        }

    },
    'ownerEmail' : function(owner){
        if(owner.emails[0].address){
            return owner.emails[0].address;
        }
        else{
            return '';
        }
    },
    'ownerPhone' : function(owner){
        if(owner.profile.phone){
            return owner.profile.phone;
        }
        else {
            return '';
        }
    }
});
