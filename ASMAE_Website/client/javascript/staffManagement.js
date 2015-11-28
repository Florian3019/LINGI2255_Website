var ison = false;
Template.staffManagement.events({
	'click .btn-md':function(){
		if(this.processed) {
			document.getElementById("pop-up-message-title").innerHTML="Votre response";  
			document.getElementById("message").innerHTML=this.answer;
             $('#pop-up-message').modal('show');
        }
		else{
			var val = comment.value.trim();
			if(val == ""){
				document.getElementById("pop-up-message-title").innerHTML="Attention";  
                document.getElementById("message").innerHTML="Veuillez remplir le champ de réponse avant d'envoyer un mail";
                $('#pop-up-message').modal('show');
			}
			else{
				Meteor.call('emailFeedback',this.email,"Reponse à votre question",comment.value);
				Meteor.call('updateQuestionStatus',this.email,this.question,this.date,comment.value);
                document.getElementById("pop-up-message-title").innerHTML="Email envoyé";  
				document.getElementById("message").innerHTML="Votre message a bien été envoyé";
                $('#pop-up-message').modal('show');

			}
		}
	}


});
Template.staffManagement.helpers({

	'hasQuestions':function(){
		return Questions.find().count()>0;
	},

	'showStaff' : function(){
		return Questions.find();
	},
	'isProcessed' : function(){
		if(this.processed)
			return "Oui";
		else
			return "Non";
	},
	'showIt' : function(){
		if(this.processed){
			return "display:none";
		}
		else
			return "display:block";

	},
	'dontShowIt' : function(){
		if(this.processed){
			return "display:block";
		}
		else
			return "display:none";
	}

});
