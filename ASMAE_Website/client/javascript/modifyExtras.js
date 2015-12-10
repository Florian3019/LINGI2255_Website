/*
	This file defines how extras are modified or created
*/
function isValidePrice(price) {
    return (Math.floor(price * 100) === price * 100);
}

Template.modifyExtras.events({
	'click #addExtraButton':function(event){
		// Add new extra
		event.preventDefault();

		var name = document.getElementById("nameExtra");
		var price = document.getElementById("priceExtra");
		var comment =  document.getElementById("commentExtra");
		var jour = document.getElementById("dayExtra").value;
		var day = jour == "Samedi" ? "saturday" : "sunday";

		var infoBox = document.getElementById("infoBoxExtra");
		var infoBoxMsg = document.getElementById("infoMsg");
		var bol = isValidePrice(price.value);
		console.log(bol);

		if(name.value!=="" && typeof name.value !== 'undefined' && (price.value !=="") && typeof (price.value !== 'undefined') && isValidePrice(price.value)){
			var priceValue = parseFloat(price.value);
			var data={
					"name": name.value,
					"price": priceValue,
					"comment": comment.value,
					"day": day
			};
			Meteor.call('updateExtra',data);
			Meteor.call("addToModificationsLog",
            {"opType":"Ajout d'un extra",
            "details":name.value +": "+price.value+"€ "+day+" "+ (comment.value!=="" ? "("+comment.value+")" : "")
            });
            infoBox.setAttribute("hidden","");
            name.value = "";
			price.value = "";
			comment.value = "";
		}
		else if (!isValidePrice(price.value) && (price.value !=="") && typeof (price.value !== 'undefined') && name.value!=="" && typeof name.value !== 'undefined' && (price.value !=="")) {
			infoBox.removeAttribute("hidden");
			infoBoxMsg.innerHTML = "Attention le prix est incorrect, vous ne pouvez pas avoir plus deux décimales"
		}
		else{
			infoBox.removeAttribute("hidden");
			infoBoxMsg.innerHTML = "Veuillez remplir le nom et le prix"
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
    },
	'getDay': function() {
		if (this.day!=="saturday" && this.day!=="sunday") {
			console.error("Error, extra day is not saturday or sunday");
			return undefined;
		}
		return this.day=="saturday" ? "Samedi" : "Dimanche";
	}
});

var getData = function(id){
	return data={
		"_id": id,
		"name": document.getElementById("name"+id).value,
		"price": parseFloat(document.getElementById("price"+id).value),
		"comment": document.getElementById("comment"+id).value,
		"day": document.getElementById("day"+id).value
	};
}

var modifyExtra=function(id){
	var infoBox = document.getElementById("infoBoxExtra");
	var infoBoxMsg = document.getElementById("infoMsg");
	data = getData(id);
	var jour = data.day == "saturday" ? "Samedi" : "Dimanche";
	
	if(isValidePrice(data.price)) {
		infoBox.setAttribute("hidden","");

		Meteor.call('updateExtra',data);

		Meteor.call("addToModificationsLog",
	    {"opType":"Modification d'un extra",
	    "details":data.name +": "+data.price+"€ "+jour+" "+ (data.comment!=="" ? "("+data.comment+")" : "")
	    });
	}
	else {
		infoBox.removeAttribute("hidden");
		infoBoxMsg.innerHTML = "Attention le prix est incorrect, vous ne pouvez pas avoir plus deux décimales"
	}
}


Template.modifyExtras.events({
	'change .extra-name':function(event){
		extraId = event.currentTarget.dataset.id;
		modifyExtra(extraId);
	},
	'change .extra-price':function(event){
		extraId = event.currentTarget.dataset.id;
		modifyExtra(extraId);
	},
	'change .extra-comment':function(event){
		extraId = event.currentTarget.dataset.id;
		modifyExtra(extraId);
	},
	'change .extra-day':function(event) {
		extraId = event.currentTarget.dataset.id;
		modifyExtra(extraId);
	},

	'click .extra-delete':function(event){
		id = event.currentTarget.dataset.id;
		Meteor.call('removeExtra',id);

		data = getData(id);

		Meteor.call("addToModificationsLog",
        {"opType":"Effacer un extra",
        "details":data.name +": "+data.price+"€ "+data.day+" "+ (data.comment!=="" ? "("+data.comment+")" : "")
        });
	}
});


Template.modifyExtras.onRendered(function() {
	var extras = Extras.find().fetch();
	for (var i=0; i<extras.length; i++) {
		var e = extras[i];
		var daySelect = document.getElementById("day"+e._id);
		daySelect.value = e.day;
	}
});
