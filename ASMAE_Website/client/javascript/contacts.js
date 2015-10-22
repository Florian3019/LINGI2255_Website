Template.contacts.events({
    'submit form': function(event){
        event.preventDefault();
        var currentdate = new Date();
var datetime =    currentdate.getDate() + "/"
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
        
    	if (confirm("Merci pour votre question ! \n\nEtes vous certain de vouloir soumettre ceci ? : \n\n Nom : "+Question.lastname+"\n\n Prénom : "+Question.firstname+"\n\n Email : "+Question.email+"\n\n Question : \n "+ Question.question+"\n\n") == true) {
    	   	Meteor.call('insertQuestion', Question);
		Router.go('home');
    
    	} else {
        	
    	}
    }
});
