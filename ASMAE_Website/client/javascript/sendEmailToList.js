Template.sendEmailToList.events({
    'click #submitButtonSendEmail': function(){
      var subject=document.getElementById("subject").value;
      var texte=document.getElementById("mailContent").value;
      if ($("#subject").val().length === 0 || $("#mailContent").val().length === 0) {
        swal({
        title: "Erreur !",
        text: "Merci de remplir le sujet et le contenu de l'email.",
        type: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
        closeOnConfirm: true
        });
        return;
      }
      switch (document.getElementById("mailToList").value) {
        case "allUsers":
          Meteor.call("emailToAllUsers",subject,texte, function(error, result){
            if(error){
              console.log("error", error);
            }
          });
          break;
        case "allPlayers":
        var currentYear = GlobalValues.findOne({_id: "currentYear"}).value;
        Meteor.call("emailToPlayers",subject,texte,currentYear, function(error, result){
          if(error){
            console.log("error", error);
          }
        });
          break;
        case "allCourtOwners":
        Meteor.call("emailToCourtOwner",subject,texte, function(error, result){
          if(error){
            console.log("error", error);
          }
        });
          break;
        case "staffMember":
        Meteor.call("emailToStaff",subject,texte, function(error, result){
          if(error){
            console.log("error", error);
          }
        });
          break;
          case "email":
          var mail=document.getElementById("mails").value;
          Meteor.call("emailFeedback",mail,subject,{texte:texte}, function(error, result){
            if(error){
              console.log("error", error);
            }
          });
          break;
      }
      document.getElementById("mails").value="";
      document.getElementById("subject").value="";
      document.getElementById("mailContent").value="";
      swal({
        title: "Succès !",
        text: "Les emails ont été envoyés !",
        type: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
        closeOnConfirm: true
      });
  },
  'change select': function(e,t){
      if(document.getElementById("mailToList").value == "email"){
        $("#mailDiv").show();
      }
      else {
        $("#mailDiv").hide();
      }
     }
});
