/*
	This file defines helpers for the forum
*/
Template.forum.helpers({
	'getThreads':function(){
		return Threads.find();
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
		Meteor.call('removeThread', event.currentTarget.dataset.threadid);
	},

	'click .topic-delete':function(event){
		var data = event.currentTarget.dataset;
		Meteor.call('removeTopic', data.threadid, data.topicid);
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