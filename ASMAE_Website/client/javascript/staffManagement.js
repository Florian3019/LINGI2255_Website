var ison = false;
Template.staffManagement.events({
	'click .btn':function(){
		if(this.processed)
			alert(this.answer)
		else{
			if(comment.value==""){
				alert("Veuillez remplir le champ de réponse avant d'envoyer un mail")
			}
			else{
				Meteor.call('emailFeedback',this.email,"Reponse à votre question",comment.value,Meteor.userId());
				Meteor.call('updateQuestionStatus',this.email,this.question,this.date,comment.value);
				Router.go('home');
				alert("Votre message a bien été envoyé");

			}
		}
	}


});
Template.staffManagement.helpers({
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
