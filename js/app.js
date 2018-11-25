var locations = [
	{
		name: '6th October University',
		lat: 29.976316,
		lng: 30.948192
	},
	{
		name: '6th October Hospital',
		lat: 29.978202,
		lng: 30.949905
	},
	{
		name: '6th October University library',
		lat: 29.97358,
		lng: 30.943167
	},
	{
		name: 'Al Hosari  Mosque',
		lat: 29.972562,
		lng: 30.943892
	},
	{
		name: 'Rosto Restaurant',
		lat: 29.97425,
		lng: 30.944973
	},
	{
		name: 'Dolphin Mall',
		lat: 29.977479,
		lng: 30.955005
	},
	{
		name: 'Gad Restaurant',
		lat: 29.973961,
		lng: 30.946361
	}
];

var map;
var clientID = "ZTAB0LQC0ZTQJZISUENRPANP0CXMRAKQUXD5BV2SLYZLZNMN";;
var clientSecret = "EUMMQPP5G0ZU5USX3AEYDRYXDPWSTWVT1CHYHCGBJV40ADPX";

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.URL = "";
	this.street = "";
	this.city = "";

	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var result = data.response.venues[0];
		self.URL = result.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
		self.street = result.location.formattedAddress[0];
    self.city = result.location.formattedAddress[1];
	}).fail(function() {
		alert("Error with the Foursquare API call. Please refresh the page.");
	});

	this.contentString = '<div><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	var highlightedIcon = makeMarkerIcon('009688');

	this.marker.addListener('click', function(){


		this.setIcon(highlightedIcon);
		self.contentString = '<div><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";

    self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 2000);

	});

		this.selectedLocation = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};

	function makeMarkerIcon(markerColor) {
	        var markerImage = new google.maps.MarkerImage(
	          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	          '|40|_|%E2%80%A2',
	          new google.maps.Size(25, 30),
	          new google.maps.Point(0, 0),
	          new google.maps.Point(10, 34),
	          new google.maps.Size(25,30));
	        return markerImage;
	      }


};

function AppViewModel() {
	var self = this;

	this.searchLocation = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 15,
			center: {lat:  29.972492, lng: 30.944769 }
	});

	locations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredMarks = ko.computed( function() {
		var filter = self.searchLocation().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) != -1);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);


}


function w3_open() {
	document.getElementById("mySidebar").style.display = "block";
}
function w3_close() {
	document.getElementById("mySidebar").style.display = "none";
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}

function handlingError() {
	alert("Failed to load Google Maps. Please Try again.");
}
