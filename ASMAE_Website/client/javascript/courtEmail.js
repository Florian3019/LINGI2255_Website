Template.courtEmail.returnAllCourts = function(){
	return Courts.find();
}

Template.courtEmail.events({
	'click .reactive-table tbody tr' : function(event){
		var target = event.currentTarget;
		var courtSelected = (' ' + target.className + ' ').indexOf(' courtSelected ') > -1;
		if(courtSelected){
			// Unselected it
			target.removeAttribute("id","");
			target.className = target.className.replace('courtSelected', '');
		}
		else{
			// Select it
       		target.className += ' courtSelected';
       		target.id = this._id;
       	}
    },

    'click #Boutton': function(event){
	console.log("Check d'une Check");
        event.preventDefault();
         var checkboxes = document.getElementsByClassName("courtSelected");

		  var checkboxesChecked = [];
	  // loop over them all
	  for (var i=0; i<checkboxes.length; i++) {

	     // And stick the checked ones onto an array...
		//print des adresses mails correspondant aux checkbox checkées.
		var em = Meteor.users.findOne({_id:Courts.findOne({_id : checkboxes[i].id}).ownerID}).emails[0].address;
		//Print du texte à envoyer
	     	if(mail.value!=""){
	     		Meteor.call('emailFeedback',em,"Charles De Lorraine : mail relatif à votre terrain",mail.value);
			checkboxesChecked.push(checkboxes[i]);
	     		Meteor.call("addToModificationsLog", {"opType":"Envoi de mails aux courtsowners","details": "Mail envoyé : "+mail.value+"\n à : "+em});
	     	}
	  }
	  // Return the array if it is non-empty, or null
	  if(checkboxesChecked.length > 0){		
	  	if(checkboxesChecked.length==1){
	  		alert("Mail envoyé !")
	  	}
	  	else{
	  		alert("Mails envoyés !")
	  	}
	  	Router.go('home');	  
	  }
	  else{
	  	alert("vous n'avez pas coché de case ou entré de texte pour le mail que vous désirez envoyer.")
	  }
        
    },
    'click #SelectAll':function(event){
    	console.log("SelectAll");
        event.preventDefault();
        var checkboxes = document.getElementsByTagName("tbody")[0].children;
 		for (var i=0; i<checkboxes.length; i++) {
	     	// And stick the checked ones onto an array...
	     	var target = checkboxes[i];
			var courtSelected = (' ' + target.className + ' ').indexOf(' courtSelected ') > -1;
			if(!courtSelected){
				// Select it
	       		target.className += ' courtSelected';
	       		target.id = this._id;
	       	}
	  	}
	
    },
    'click #UnselectAll':function(event){
    	console.log("UnselectAll");
        event.preventDefault();
         var checkboxes = document.getElementsByTagName("tbody")[0].children;
		 for (var i=0; i<checkboxes.length; i++) {
		     // And stick the checked ones onto an array...
	     	var target = checkboxes[i];
			var courtSelected = (' ' + target.className + ' ').indexOf(' courtSelected ') > -1;
			if(courtSelected){
				// Unselected it
				target.removeAttribute("id","");
				target.className = target.className.replace('courtSelected', '');
	       	}
		  }
	
    }
    
});

