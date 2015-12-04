// Currently setup with guillaume leurquin's secrets. Please change this when going to production
var Google_API_KEY_SERVER = "AIzaSyAoAQpteuybI8u7FAfpxtF_TFBTdJ4BAyY";

Meteor.methods({
	/*
		Converts an address string to gps coordinates (latitude and longitude).
		This asks google servers for the conversion.
	*/
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