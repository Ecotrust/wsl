/****************************************************************************
 * GeocoderResult class
 *
 * Generalized structure for storing a geocoder result.  Used by geocoder
 * service objects (YahooGeocoder, GoogleGeocoder) to provide results to the
 * geocoder client in a common form
 ***************************************************************************/
function GeocoderResult(){
	//Requested address
	this.address = null;
	//Geocoding succeeded or not
	this.success = false;
	//Detailed result status
	this.status = "";
	//Human understandeable statusStr
	this.statusStr = null;
	//Array of GeocoderLocation objects
	this.locations = Array(); 
}

GeocoderResult.prototype.getAddress = function (){
  return this.address;
}

GeocoderResult.prototype.setAddress = function (address){
  this.address = address;
}

GeocoderResult.prototype.getSuccess = function (){
  return this.success;
}

GeocoderResult.prototype.setSuccess = function (success){
  this.success = success;
}

GeocoderResult.prototype.getStatus = function (){
  return this.status;
}

GeocoderResult.prototype.setStatus = function (status){
  this.status = status;
}

GeocoderResult.prototype.getStatusStr = function (){
  return this.statusStr;
}

GeocoderResult.prototype.setStatusStr = function (statusStr){
  this.statusStr = statusStr;
}

GeocoderResult.prototype.addLocation = function (loc_data) {
  var new_location = new GeocoderLocation(loc_data);
  this.locations.push(new_location);
}

GeocoderResult.prototype.getLocation = function (num) {
  return this.locations[num];
}

GeocoderResult.prototype.numLocations = function (num) {
  return this.locations.length;
}

GeocoderResult.prototype.toHTML = function (){
  return "<strong>Geocode Request</strong>:" + 
    "<br>Status: " + this.statusStr +
    "<br>Accuracy: " + this.accuracyStr + 
    "<br>Latitude: " + this.lat + 
    "<br>Longitude: " + this.lng;
}

/****************************************************************************
 * GeocoderLocation class
 *
 * Holds information for a single geocoder result including
 * location and textual information.  Created by the geocoder service
 * object and used by the geocode requester.
/***************************************************************************/
function GeocoderLocation(result) {
	if (result.address)
		this.address = result.address;
	else 
		this.address = "";
		
	if (result.city)
		this.city = result.city;
	else
		this.city = "";
		
	if (result.state)
		this.state = result.state;
	else
		this.state = "";
		
	if (result.zip)
		this.zip = result.zip;
	else
		this.zip = "";
		
	if (result.country)
		this.country = result.country;
	else
		this.country = "";
		
	if (result.accuracy)
		this.accuracy = result.accuracy;
	else
		this.accuracy = null;
		
	if (result.accuracyStr)
		this.accuracyStr = result.accuracyStr;
	else
		this.accuracyStr = "";
		
	if (result.scale)
		this.scale = result.scale;
	else
		this.scale = null;
		
	if (result.lat)
		this.lat = result.lat;
	else
		this.lat = null;
		
	if (result.lng)
		this.lng = result.lng;
	else
		this.lng = null;
		
	if (result.id)
		this.id = result.id;
	else
		this.id = null;
}

GeocoderLocation.prototype.getAddress = function (){
  return this.address;
}

GeocoderLocation.prototype.getAccuracy = function (){
  return this.accuracy;
}

GeocoderLocation.prototype.getAccuracyStr = function (){
  return this.accuracyStr;
}

GeocoderLocation.prototype.getLat = function (){
  return this.lat;
}

GeocoderLocation.prototype.getLng = function (){
  return this.lng;
}

GeocoderLocation.prototype.getRadius = function (){
  return this.radius;
}

GeocoderLocation.prototype.getScale = function (){
  return this.scale;
}

GeocoderLocation.prototype.toHTML = function () {
  return "Address: " + this.address + 
    "<br>Accuracy: " + this.accuracyStr +
    "<br>Scale: " + addCommas(this.scale) +
    "<br>Lng: " + this.lng +
    "<br>Lat: " + this.lat;
}
