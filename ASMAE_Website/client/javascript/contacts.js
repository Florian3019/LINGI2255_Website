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
        Meteor.call('insertQuestion', Question);
    }
});

