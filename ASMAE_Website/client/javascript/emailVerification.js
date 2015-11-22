Template.emailVerification.events({

'click #sendNewEmail': function(event) {
    var userId = Meteor.userId();
    var email = Meteor.user().emails[0].address;

    Meteor.call('sendNewEmail', userId);

    document.getElementById("emailSent").href = "mailto:" + email;
    document.getElementById("emailSent").innerHTML = email;
    $('#newSend').modal('show'); 
},

'click #changeEmail': function(event) {
    $('#changeEmailModal').modal('show'); 
},

'click #changeEmailConfirmation': function(event) {
    document.getElementById("email-new-group").className = "form-group";
    $('div[role="alert"]').hide();

    var userId = Meteor.userId();
    var email = $('[name=email-new]').val().trim();

    if(email == "") {
        $('#no-email-new').show();
        document.getElementById("email-new-group").className = "form-group has-error";
    }
    else if(!isValidEmail(email)) {
        $('#not-valid-email-new').show();
        document.getElementById("email-new-group").className = "form-group has-error";
    }
    else {
        data = {_id: userId, emails : [{"address": email, "verified":false}]};
        Meteor.call("updateUser", data);
        $('#new-email-success').show();
        Meteor.call('sendNewEmail', userId);
    }  
},

});

Template.emailVerification.helpers({
    getMail: function(){
        return Meteor.user().emails[0].address;
    },

     getMailto: function(){
        return "mailto:" + Meteor.user().emails[0].address;
    }
});