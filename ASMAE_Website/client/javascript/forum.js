/*
	This file defines helpers for the forum
*/
Template.forum.helpers({
	'getThreads':function(){
		return Threads.find();
	},

	'emptyArray':function(array){
		if(array===undefined){
			return true;
		}
		return array.length==0;
	},

	'getAuthorInfo':function(userId){
		var user = Meteor.users.findOne({_id:userId});
		return user;
	},

	'getTime' : function(date){
		return date.toLocaleString();
	},

	'getTopic':function(topicId){
		return Topics.findOne({_id:topicId});
	},

	'getLength':function(array){
		return array.length;
	},
});

Template.forum.events({
	'click #addThread':function(event){
		var threadInput = document.getElementById("threadName");
		var threadName = threadInput.value;
		threadInput.value = "";
		Meteor.call("addThread",{"name":threadName});
	},

	'click .addTopic':function(event){
		var threadId = event.currentTarget.id;
		var topicInput = document.getElementById("topicName"+threadId);
		var topicName = topicInput.value;
		topicInput.value = "";
		Meteor.call("addTopic",{"name":topicName, "threadId":threadId});
	},

	'click .topicRow':function(event){
		var topicId = event.currentTarget.id;
		
		var isDeleteButton = (' ' + event.originalEvent.srcElement.className + ' ').indexOf(' topic-delete ') > -1;
		if(isDeleteButton) return; // Do nothing
		var threadName = event.currentTarget.dataset.threadname;

		Router.go('topic',{"_id":topicId, "tname":threadName});
	},

	'click .thread-delete':function(event){
		swal({
	      title: "Êtes-vous sûr ?",
	      text: "Cette action supprimera cette catégorie, tout ses sujets et commentaires. Elle est irréversible.",
	      type: "warning",
	      showCancelButton: true,
	      cancelButtonText:"Annuler",
	      confirmButtonColor: "#DD6B55",
	      confirmButtonText: "Supprimer",
	      closeOnConfirm: false 
	  	},
	  	function(){
	  		Meteor.call('removeThread', event.currentTarget.dataset.threadid);
	  		swal({
	  			title: "Succès !",
			      text: "Catégorie supprimée.",
			      type: "success",
			      showCancelButton: false,
			      confirmButtonColor: "#3085d6",
			      confirmButtonText: "Ok",
			      closeOnConfirm: true 
	  		});
	  	});
	},

	'click .topic-delete':function(event){
		var data = event.currentTarget.dataset;

		swal({
	      title: "Êtes-vous sûr ?",
	      text: "Cette action supprimera ce sujet et tous ses commentaires. Elle est irréversible.",
	      type: "warning",
	      showCancelButton: true,
	      cancelButtonText:"Annuler",
	      confirmButtonColor: "#DD6B55",
	      confirmButtonText: "Supprimer",
	      closeOnConfirm: false 
	  	},
	  	function(){
	  		Meteor.call('removeTopic', data.threadid, data.topicid);
	  		swal({
	  			title: "Succès !",
			      text: "Sujet supprimé.",
			      type: "success",
			      showCancelButton: false,
			      confirmButtonColor: "#3085d6",
			      confirmButtonText: "Ok",
			      closeOnConfirm: true 
	  		});
	  	});
	}
});

Template.topic.events({
	'click .addPost':function(event){
		var topicId = event.currentTarget.id;
		var postInput = document.getElementById("postText"+topicId);
		var postText = postInput.value;
		postInput.value = "";
		Meteor.call("addPost",{"postText":postText, "topicId":topicId});
	},

	'click #goBack':function(event){
		Router.go('forum');
	}
});

Template.topic.helpers({
	'getAuthorInfo':function(userId){
		var user = Meteor.users.findOne({_id:userId});
		return user;
	},

	'getTime' : function(date){
		return date.toLocaleString();
	},

	'getTopic':function(topicId){
		return Topics.findOne({"_id":topicId});
	},

	settings : function(){
      return {
        fields:[
		          { key: 'time', label: 'Date', sortOrder: 0, sortDirection: 'descending', fn: function(value, object){
		           		return value.toLocaleString();
		          	}
		      	  },
		          { key:'author', label: 'Auteur', sortable: false, fn:function(value, object){
			          	var user = Meteor.users.findOne({_id:value});
			          	return user.profile.firstName + " " + user.profile.lastName;
		          	}
		          },
		          { key:'postText', label: 'Message', sortable: false}
      		],
             showFilter: false,
             noDataTmpl : Template.emptyPost
         }
    }
});