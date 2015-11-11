Template.courtEmail.returnAllCourts = function(){
	return Courts.find();
}

Template.courtEmail.helpers({
	'getId' : function(){
		return this._id;
	},
	'getUserId' : function(){
		return this.ownerID;
	},
	'getUserMail': function(){
		var ownID = this.ownerID;
		console.log(Meteor.users.findOne({_id:this.ownerID}))
		return Meteor.users.findOne({_id:this.ownerID}).emails[0].address
	},
	'getOwnerName' : function(){
		var ownID = this.ownerID;
		console.log(Meteor.users.findOne({_id:this.ownerID}).profile.name)
		return Meteor.users.findOne({_id:this.ownerID}).profile.name
	},
	'getSurfaceType': function(){
		return this.surface;
	},
	'getTypeOfPrivacy': function(){
		return this.courtType;
	},
	'SpecialInstructions': function(){
		return this.instructions
	},
	'SpecialComments': function(){
		return this.ownerComment
	},
	'GetAddress' : function(){
		var addressID = this.addressID
		console.table(Addresses.findOne(addressID).street)
		return Addresses.find(addressID)
	},
	'GetStreet' : function(){
		return this.street
	},
	'GetPostalNumber' : function(){
		return this.number
	},
	'GetBoxNumber': function(){
		if(this.box!=null){
			return ("/"+this.box)
		}
		else{
			return "";
		}
	},
	'GetPostCode': function(){
		return this.zipCode
	},
	'GetCity': function(){
		return this.city
	},
	'GetCountry': function(){
		return this.country
	}
	
	

});

Template.courtEmail.events({
    'click #Boutton': function(event){
	console.log("Check d'une Check");
        event.preventDefault();
         var checkboxes = document.getElementsByName("myCheckBoxes");
		  var checkboxesChecked = [];
	  // loop over them all
	  for (var i=0; i<checkboxes.length; i++) {
	     // And stick the checked ones onto an array...
	     if (checkboxes[i].checked) {
		//print des adresses mails correspondant aux checkbox checkées.
		var em = Meteor.users.findOne({_id:Courts.findOne({_id : checkboxes[i].id}).ownerID}).emails[0].address
		console.log(em)
		//Print du texte à envoyer
		console.log(mail.value)
	     	if(mail.value!=""){
	     		Meteor.call('emailFeedback',em,"Charles De Lorraine : mail relatif à votre terrain",mail.value);
			checkboxesChecked.push(checkboxes[i]);
	     		Meteor.call("addToModificationsLog", {"opType":"Envoi de mails aux courtsowners","details": "Mail envoyé : "+mail.value+"\n à : "+em});
	     	}
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
         var checkboxes = document.getElementsByName("myCheckBoxes");
	 for (var i=0; i<checkboxes.length; i++) {
	     // And stick the checked ones onto an array...
	     checkboxes[i].checked= true;
	  }
	
    },
    'click #UnselectAll':function(event){
    	console.log("UnselectAll");
        event.preventDefault();
         var checkboxes = document.getElementsByName("myCheckBoxes");
	 for (var i=0; i<checkboxes.length; i++) {
	     // And stick the checked ones onto an array...
	     checkboxes[i].checked= false;
	  }
	
    }
    
});

