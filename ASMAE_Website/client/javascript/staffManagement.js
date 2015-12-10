/*
	This file defines how the staff can answer to the questions asked by users.
*/
var ison = false;
Template.staffManagement.events({
	'click #questionButton':function(){
		if(this.processed) {
            swal("Votre response", this.answer);
        }
		else{
			var val = comment.value.trim();
			if(val == ""){
				swal({
			        title: "Attention !",
			        text: "Veuillez remplir le champ de réponse avant d'envoyer un mail",
			        type: "error",
			        confirmButtonColor: "#3085d6",
			        confirmButtonText: "Ok",
			        closeOnConfirm: true
       			});
			}
			else{
				swal({
        			title: "Email envoyé !",
        			text: "Votre message a bien été envoyé",
			        type: "success",
			        confirmButtonColor: "#3085d6",
			        confirmButtonText: "Ok",
			        closeOnConfirm: true
      			});

				Meteor.call('emailFeedback',this.email,"Reponse à votre question",comment.value);
				Meteor.call('updateQuestionStatus',this.email,this.question,this.date,comment.value);

				comment.value = '';
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
