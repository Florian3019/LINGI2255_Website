Template.sendEmailToList.events({
    'click #submitButtonSendEmail': function(){
      var subject=document.getElementById("subject").value;
      var texte=document.getElementById("mailContent").value;
      if ($("#subject").val().length === 0 || $("#mailContent").val().length === 0) {
        alert("Merci de remplir les deux champs");
      }
      else{
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
    }
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
