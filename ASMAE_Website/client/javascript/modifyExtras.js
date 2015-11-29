Template.modifyExtras.events({
	'click #addExtraButton':function(event){
		// Add new extra

		var name = document.getElementById("nameExtra");
		var price = document.getElementById("priceExtra");
		var comment =  document.getElementById("commentExtra");

		var infoBox = document.getElementById("infoBoxExtra");

		if(name.value!=="" && name.value!==undefined && price.value!=="" && price.value!==undefined){
			var data={
					"name": name.value,
					"price": price.value,
					"comment": comment.value
			};
			Meteor.call('updateExtra',data);
			Meteor.call("addToModificationsLog", 
            {"opType":"Ajout d'un extra", 
            "details":name.value +": "+price.value+"€ "+ (comment.value!=="" ? "("+comment.value+")" : "") 
            });
            infoBox.setAttribute("hidden","");
            name.value = "";
			price.value = "";
			comment.value = "";
		}
		else{
			infoBox.removeAttribute("hidden");
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
    "details":data.name +": "+data.price+"€ "+ (data.comment!=="" ? "("+data.comment+")" : "")  
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
        "details":data.name +": "+data.price+"€ "+ (data.comment!=="" ? "("+data.comment+")" : "") 
        });
	}



});