/*
    This file defines helpers and events for the page where a visitor or regular user can
    ask questions to the staff.
*/
Template.contacts.events({
    'click #sub': function(event){
	console.log("envoi d'une question");
        event.preventDefault();
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

        var Question = {
            lastname : $('[name=lastname]').val(),
            firstname : $('[name=firstname]').val(),
            email : $('[name=email]').val(),
            date : datetime,
            question : $('[name=question]').val(),
        	}

        if(Question.question===undefined || Question.question==="" ||Question.firstname==="" || Question.firstname===undefined || Question.lastname==="" || Question.lastname===undefined || Question.email === ""|| Question.email===undefined){
            swal({
              title:"Erreur!",
              text:"Veuillez remplir tous les champs!",
              type:"error",
              confirmButtonText:"Ok",
              confirmButtonColor: "#3085d6",
              closeOnConfirm:true,
              showCancelButton: false
            });
            return;
        }

        Meteor.call('insertQuestion', Question);

        swal({
          title:"Succès!",
          text:"Email envoyé!",
          type:"success",
          confirmButtonText:"Super!",
          confirmButtonColor: "#3085d6",
          closeOnConfirm:true,
          showCancelButton: false
        },
        function(){
            Router.go("home");
        });
    }
});

Template.contacts.helpers({
    getMail: function(){
        return Meteor.user().emails[0].address;
    },

    getFirstName: function(){
        return Meteor.user().profile.firstName;
    },

    getLastName: function(){
        return Meteor.user().profile.lastName;
    }
});
