Template.mapForOneCourt.onCreated(function(){
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('courtMap', function(map) {
    // Add a marker to the map once it's ready

    var marker1 = new google.maps.Marker({
      position: HQCoords,
      animation: google.maps.Animation.DROP,
      map: map.instance,
      icon:'HQ.png'
    });


    var marker2 = new google.maps.Marker({
      position: map.options.center,
      animation: google.maps.Animation.DROP,
      map: map.instance,
    });
  });
});

Template.mapForOneCourt.onRendered(function(){
   GoogleMaps.load({key:Google_API_KEY_BROWSER});
});

Template.mapForOneCourt.helpers({
    mapOptions: function() {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        // Map initialization options
        console.log(this);
        return {
          center: new google.maps.LatLng(this.coords.lat, this.coords.lng),
          zoom: 14
        };
      }
    },
})