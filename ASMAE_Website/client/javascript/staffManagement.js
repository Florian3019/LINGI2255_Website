var ison = false;
Template.staffManagement.events({
	'click #questionButton':function(){
		if(this.processed) {
			document.getElementById("pop-up-message-title").innerHTML="Votre response";
			document.getElementById("message").innerHTML=this.answer;
             $('#pop-up-message').modal('show');
        }
		else{
			var val = comment.value.trim();
			if(val == ""){
				document.getElementById("pop-up-message-title").innerHTML="Attention !";
                document.getElementById("message").innerHTML="Veuillez remplir le champ de réponse avant d'envoyer un mail";
                $('#pop-up-message').modal('show');
			}
			else{
				Meteor.call('emailFeedback',this.email,"Reponse à votre question",comment.value);
				Meteor.call('updateQuestionStatus',this.email,this.question,this.date,comment.value);
                document.getElementById("pop-up-message-title").innerHTML="Email envoyé";
				document.getElementById("message").innerHTML="Votre message a bien été envoyé";
				Router.go('home');
                $('#pop-up-message').modal('show');
			}
		}
	}


});
Template.staffManagement.helpers({
	questionsCollection: function () {
	    return Questions.find();
	},

	settings : function(){
      return {
        fields:[
        	{ key: 'lastname', label: "Nom"},
        	{ key: 'firstname', label: "Prénom"},
        	{ key: 'email', label:"Email"},
            { key: 'question', label: "Question"},
            { key: 'date', label:"Date", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "" : value.toLocaleDateString()}},
            { key: 'processed', label:"Déja traité", tmpl: Template.processedLabel},
            { key: 'processed', label:"Répondre", tmpl: Template.answerLabel}
      		],
      		noDataTmpl:Template.emptyQuestions
      	}
	}
});
