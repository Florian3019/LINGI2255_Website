Template.modifyExtras.events({
	'submit form':function(){
		event.preventDefault();

		// Add new extra
	
		var name = event.target.nameExtra.value;
		var price = event.target.priceExtra.value;
		var comment = event.target.comment.value;

		if(name && price){
			var data={
					"name": name,
					"price": price,
					"comment": comment
			};

			Meteor.call('updateExtra',data);
			Meteor.call("addToModificationsLog", 
            {"opType":"Ajout d'un extra", 
            "details":
                "Nom : "+name +
                " Prix : "+price+
                " Commentaire: "+comment 
            });
		}

		event.target.nameExtra.value = "";
		event.target.priceExtra.value = "";
		event.target.comment.value = "";
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

var getData = function(id){
	return data={
		"_id": id,
		"name": document.getElementById("name"+id).value,
		"price": document.getElementById("price"+id).value,
		"comment": document.getElementById("comment"+id).value
	};
}

var modifyExtra=function(id){
	data = getData(id);

	Meteor.call('updateExtra',data);

	Meteor.call("addToModificationsLog", 
    {"opType":"Modification d'un extra", 
    "details":
        "Nom : "+data.name +
        " Prix : "+data.price+
        " Commentaire: "+data.comment 
    });
}


Template.modifyExtras.events({
	'change .extra-name':function(event){
		extraId = event.currentTarget.dataset.id;
		console.log(extraId);
		modifyExtra(extraId);
	},
	'change .extra-price':function(event){
		extraId = event.currentTarget.dataset.id;
		console.log(extraId);
		modifyExtra(extraId);
	},
	'change .extra-comment':function(event){
		extraId = event.currentTarget.dataset.id;
		console.log(extraId);
		modifyExtra(extraId);
	},

	'click .extra-delete':function(event){
		id = event.currentTarget.dataset.id;
		Meteor.call('removeExtra',id);
		
		data = getData(id);

		Meteor.call("addToModificationsLog", 
        {"opType":"Effacer un extra", 
        "details":
            "Nom : "+data.name+
            " Prix : "+data.price+
            " Commentaire: "+data.comment
        });
	}



});