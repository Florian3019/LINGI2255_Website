/*
	Thread structure:
	{
		_id:<threadId>,
		name:<threadName>,
		topics:[
			<topicId1>, ...
		]
	}

	Topic structure:
	{
		_id:<topicId>,
		name:<topic name>,
		lastUpdatedTime:<Date>,
		lastUpdatedUser:<userId>,
		posts:[<post1>,...]
	}

	Post structure:
	{
		time:<Date>,
		author:<userId>,
		postText:<post text>
	}
*/

var isAllowed = function(){
	if( !(Meteor.call('isAdmin') || Meteor.call('isStaff')) ){
		return false;
	}
	return true;
}

Meteor.methods({
	/*	
		threadData:
		{
			name:<threadName>
		}
		Returns the threadId on success, undefined otherwise
	*/
	'addThread':function(threadData){
		if(!isAllowed()){
			console.error("addThread : You don't have the required permissions !");
			return;
		}

		data = {};
		if(threadData.name!==undefined && threadData.name!==""){
			data.name = threadData.name;
		}
		else{
			console.error("addThread : thread name is undefined or empty");
			return;
		}
		data.topics = []; // Initialize empty topics
		return Threads.insert(data);
	},


	/*
		topicData:
		{
			threadId:<threadId>
			name:<topicName>
		}
		Returns the topicId on success, undefined otherwise
	*/
	'addTopic':function(topicData){
		console.log(topicData);
		if(!isAllowed()){
			console.error("addTopic : You don't have the required permissions !");
			return;
		}

		data = {};
		if(topicData.name!==undefined && topicData.name!==""){
			data.name = topicData.name;
		}
		else{
			console.error("addTopic : topic name is undefined or empty");
			return;
		}

		threadId = undefined;
		if(topicData.threadId!==undefined){
			threadId = topicData.threadId;
		}
		else{
			console.error("addTopic : threadId is undefined");
			return;
		}

		/*
			Add default info
		*/
		data.lastUpdatedUser = Meteor.userId();
		data.lastUpdatedTime = new Date();
		data.posts = []; // empty post list

		/*
			Create a new topic
		*/
		topicId = Topics.insert(data);

		/*
			Link it to the thread
		*/
		Threads.update({_id:threadId}, {$push:{"topics":topicId}});
		return topicId;
	},


	/*
		postData:
		{	
			topicId:<topicId>,
			postText:<post text>
		}
		Returns true on success
	*/
	'addPost':function(postData){
		if(!isAllowed()){
			console.error("addPost : You don't have the required permissions !");
			return;
		}

		data = {};

		topicId = undefined;
		if(postData.topicId!==undefined){
			topicId = postData.topicId;
		}
		else{
			console.error("addPost : topicId is undefined");
			return false;
		}

		if(postData.postText!==undefined && postData.postText !== ""){
			data.postText = postData.postText;
		}
		else{
			console.error("addPost : postText is undefined or empty");
			return false;
		}

		data.author = Meteor.userId();
		data.time = new Date();

		Topics.update({_id:topicId},{$push:{"posts":data}, $set:{"lastUpdatedTime":data.time, "lastUpdatedUser":Meteor.userId()}});
		return true;
	}

});