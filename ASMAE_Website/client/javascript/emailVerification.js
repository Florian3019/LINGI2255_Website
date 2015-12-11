Template.emailVerification.events({

    'click #sendNewEmail': function(event) {
        var userId = Meteor.userId();
        var email = Meteor.user().emails[0].address;

        Meteor.call('sendNewEmail', userId);

       swal({
            html:true, 
            title:'<i>Un email vient d\'être envoyé !</i>', 
            text: '<p>Un email de vérification vient juste d\'être envoyé à l\'adresse suivante : <a id="emailSent" href="mailto:'+email+'">'+email+'</a></p><confirmButtonColorr><p> Verifiez votre messagerie personnelle.</p>',
            type: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Ok",
            closeOnConfirm: true
        });
    },

    'click #changeEmail': function(event) {
        swal({
            title: "Changer votre adresse mail", 
            text: "Si vous desirez changer d'adresse mail veuillez remplir le champs suivant", 
            type: "input",
            inputType: "email",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirmer",
            cancelButtonText:"Annuler",
            closeOnConfirm: false
        }, function(email) {
            var userId = Meteor.userId();
            var email = email.trim();

            if (email === "") {
                swal.showInputError("Veuillez entrer une adresse email !");
                return false;
            }
            else if(!isValidEmail(email)) {
                swal.showInputError("Veuillez entrer une adresse email valide !");
                return false;
            }
            else {
                var data = {_id: userId, emails : [{"address": email, "verified":false}]};
                Meteor.call("updateUser", data);
                Meteor.call('sendNewEmail', userId);
                swal("Votre adresse mail a bien été mise à jour!", "Un email de confirmation vous a été envoyé", "success");
            }
        });
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