Template.modifyExtras.events({
	'submit form':function(){
		event.preventDefault();

		// Add new extra
	
		var name = event.target.nameExtra.value;
		var price = event.target.priceExtra.value;
		var comment = event.target.comment.value;

		if(name && price){
			var data={
					desc: name,
					price: price,
					comment: comment
			};

			Meteor.call('insertExtra',data);
			Meteor.call("addToModificationsLog", 
            {"opType":"Ajout d'un extra", 
            "details":
                "Nom : "+name +
                " Prix : "+price+
                " Commentaire: "+comment 
            });
		}

		var extras = Extras.find().fetch();

		// delete extras which are checked

		for(var i=0;i<extras.length;i++){

			if(document.getElementById("delete"+extras[i]._id).checked){
				Meteor.call('removeExtra',extras[i]._id);

				Meteor.call("addToModificationsLog", 
                {"opType":"Effacer un extra", 
                "details":
                    "Nom : "+document.getElementById("name"+extras[i]._id).value +
                    " Prix : "+document.getElementById("price"+extras[i]._id).value+
                    " Commentaire: "+document.getElementById("comment"+extras[i]._id).value
                });

			}

			if(document.getElementById("modify"+extras[i]._id).checked){
				
				var data={
					extra: extras[i],
					name: document.getElementById("name"+extras[i]._id).value,
					price: document.getElementById("price"+extras[i]._id).value,
					comment: document.getElementById("comment"+extras[i]._id).value
				};

				Meteor.call('updateExtra',data);

				Meteor.call("addToModificationsLog", 
                {"opType":"Modification d'un extra", 
                "details":
                    "Nom : "+data.name +
                    " Prix : "+data.price+
                    " Commentaire: "+data.comment 
                });

			}
		}
}
});

Template.modifyExtras.helpers({
	
	'hasExtras' : function(){
		return Extras.find().fetch().length > 0;
	},

	'extras': function () {
     	return Extras.find();
    },

    'getName': function(){
    	return this.name;
    },

    'getPrice': function(){
    	return this.price;
    },

    'getID': function(){
    	return this._id;
    },

    'getComment': function(){
    	return this.comment;
    }


});