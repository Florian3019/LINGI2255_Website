/*
  This file defines helpers for the page that shows a map displaying all the courts that are registered.
*/
function makeInfoWindowEvent(map, infowindow, contentString, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    console.log(marker);
    console.log(map);
    console.log(contentString);
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}

Template.courtMap.onCreated(function(){
  var courtId = this.data.courtId;
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('courtMap', function(map) {
    // Add a marker to the map once it's ready

    var infowindow = new google.maps.InfoWindow();

    var marker = new google.maps.Marker({
      position: HQCoords,
      animation: google.maps.Animation.DROP,
      map: map.instance,
      icon:'HQ.png'
    });

    map.instance.addListener('click', function() {
        infowindow.close();
    });

    marker.addListener('click', function() {
      infowindow.setContent("Quartier Général");
      infowindow.open(map.instance, this);
    });

    var courts = Courts.find().fetch(); 

    for(var i=0; i<courts.length;i++){
      
        (function () {
          var court = courts[i];
          if(court.coords!==undefined){
            var marker = new google.maps.Marker({
              position: court.coords,
              animation: google.maps.Animation.DROP,
              map: map.instance,
            });
            // Directly open the court if we came from another page
            if(courtId == court._id){
              var addr = Addresses.findOne(court.addressID);
              infowindow.setContent(formatAddress(addr));
              infowindow.open(map.instance, marker);
              map.instance.setCenter(new google.maps.LatLng(court.coords.lat,court.coords.lng));
            }
        
            google.maps.event.addListener(marker, 'click', function() {
                var addr = Addresses.findOne(court.addressID);
                infowindow.setContent(formatAddress(addr));
                infowindow.open(map.instance, this);
                map.instance.setCenter(new google.maps.LatLng(court.coords.lat,court.coords.lng));
            });
          }
        })();

    }
  });
});

Template.courtMap.onRendered(function(){
   GoogleMaps.load({key:Google_API_KEY_BROWSER});
});

Template.courtMap.helpers({
  mapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(HQCoords.lat,HQCoords.lng),
        zoom: 8
      };
    }
  },
});