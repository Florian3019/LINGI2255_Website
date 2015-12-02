var Google_API_KEY_BROWSER = "AIzaSyBa8fDkKPINTunoEuj0VznC6kU7PWFRJxs";

var Google_API_KEY_SERVER = "AIzaSyAoAQpteuybI8u7FAfpxtF_TFBTdJ4BAyY";

Meteor.methods({
	'loadMap':function(){
		 GoogleMaps.load({key:Google_Maps_API_key});
	},

	'geoCode':function(addressString){
		var geo = new GeoCoder({
			geocoderProvider: "google",
			  httpAdapter: "https",
			  apiKey: Google_API_KEY_SERVER
		});
		var result = geo.geocode(addressString);
		return result;
	}

});