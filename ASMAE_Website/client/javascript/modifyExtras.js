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
		}

		var extras = Extras.find().fetch();

		// delete extras which are checked

		for(var i=0;i<extras.length;i++){

			if(document.getElementById("delete"+extras[i]._id).checked){
				Meteor.call('removeExtra',extras[i]._id);
			}

			if(document.getElementById("modify"+extras[i]._id).checked){
				
				var data={
					extra: extras[i],
					name: document.getElementById("name"+extras[i]._id).value,
					price: document.getElementById("price"+extras[i]._id).value,
					comment: document.getElementById("comment"+extras[i]._id).value
				};

				Meteor.call('updateExtra',data);
			}
		}
}
});

Template.modifyExtras.helpers({
	
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