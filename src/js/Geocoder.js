function YahooGeocoder() {
	var me = this;
	this.process_start = function (result) {
		me.process_result(result);
	}
}

YahooGeocoder.prototype.geocode = function(search_type, params) {
	//Build search request and send to proxy script
	var param_str = 'search_type='+escape(search_type);
	switch (search_type) {
		case 'full': 
			param_str += '&full_address='+params.full_address; 
			break;
		case 'detail':
			param_str += '&street='+params.street;
			param_str += '&city='+params.city;
			param_str += '&state='+params.state;
			param_str += '&zip='+params.zip;
			break;
	}
	request = new OpenLayers.Ajax.Request(
		'php/yahoo_proxy.php', 
		{
		    method:'get',
		    parameters: param_str,
			onSuccess: this.process_start,
			onFailure: this.geocode_fail
		}
	);
}

YahooGeocoder.prototype.geocode_fail = function() {
	alert('Geocode service failed');
}

YahooGeocoder.prototype.process_result = function(transport) {
	//Extract and decode results
	var json_result = transport.responseText;
	var result_obj = parseJSON(json_result);
	
	//Create new object to hold results
	var geo_result = new GeocoderResultSet();	

	//Verify there is a result
	if (!result_obj) {
		geo_result.setSuccess(false);
		EventController.dispatchEvent("GeocodeReturnEvent", new CustomEvent.Events.LocSelectEvent(geo_result));
		//this.result_callback(geo_result);
		return;
	} else {
		geo_result.setSuccess(true);
	}
	
	//Build new result set depending on how many results there are
	var result = result_obj.ResultSet.Result;
	if (isArray(result)) {
		//Multiple results
		for (var i=0; i<result.length; i++) {
			var loc = result[i];
			var description = loc.Address+"<br/>"+loc.City+", "+loc.State+", "+loc.Zip+" "+loc.Country;
	        geo_result.addLocation(
	        	{
	        		description: description,
	        		address:loc.Address, 
	        		city: loc.City,
	        		state: loc.State,
	        		zip: loc.Zip,
	        		country: loc.Country,
	                precision: loc.precision,
	                lat: loc.Latitude, 
	                lng: loc.Longitude,
	                id: 1+1
				}
			); 	
		}
	} else {
		//Single result
        geo_result.addLocation({address:result.Address, 
        					   city: result.City,
        					   state: result.State,
        					   zip: result.Zip,
        					   country: result.Country,
                               precision: result.precision,
                               lat: result.Latitude, 
                               lng: result.Longitude,
                               id: 1});                         
	}
	EventController.dispatchEvent("GeocodeReturnEvent", new CustomEvent.Events.LocSelectEvent(geo_result));
	//this.result_callback(geo_result);
}




/****************************************************************************
 * GeocoderResultSet class
 *
 * Generalized structure for storing a geocoder result.  Used by geocoder
 * service objects (YahooGeocoder, GoogleGeocoder) to provide results to the
 * geocoder client in a common form
 ***************************************************************************/
function GeocoderResultSet(){
	this.type = "GeocoderResultSet";
	//Requested address
	this.address = null;
	//Geocoding succeeded or not
	this.success = false;
	//Detailed result status
	this.status = "";
	//Human understandeable statusStr
	this.statusStr = null;
	//Array of GeocoderResult objects
	this.locations = Array(); 
}

GeocoderResultSet.prototype.getAddress = function (){
  return this.address;
}

GeocoderResultSet.prototype.setAddress = function (address){
  this.address = address;
}

GeocoderResultSet.prototype.getSuccess = function (){
  return this.success;
}

GeocoderResultSet.prototype.setSuccess = function (success){
  this.success = success;
}

GeocoderResultSet.prototype.getStatus = function (){
  return this.status;
}

GeocoderResultSet.prototype.setStatus = function (status){
  this.status = status;
}

GeocoderResultSet.prototype.getStatusStr = function (){
  return this.statusStr;
}

GeocoderResultSet.prototype.setStatusStr = function (statusStr){
  this.statusStr = statusStr;
}

GeocoderResultSet.prototype.addLocation = function (loc_data) {
  var new_location = new GeocoderResult(loc_data);
  this.locations.push(new_location);
}

GeocoderResultSet.prototype.getLocation = function (num) {
  return this.locations[num];
}

GeocoderResultSet.prototype.numLocations = function (num) {
  return this.locations.length;
}

GeocoderResultSet.prototype.toHTML = function (){
  return "<strong>Geocode Request</strong>:" + 
    "<br>Status: " + this.statusStr +
    "<br>Accuracy: " + this.accuracyStr + 
    "<br>Latitude: " + this.lat + 
    "<br>Longitude: " + this.lng;
}

/****************************************************************************
 * GeocoderResult class
 *
 * Holds information for a single geocoder result including
 * location and textual information.  Created by the geocoder service
 * object and used by the geocode requester.
/***************************************************************************/
function GeocoderResult(options) {
	this.address = "";
	this.city = "";
	this.state = "";
	this.zip = "";
	this.country = "";
	this.accuracy = null;
	this.accuracyStr = "";
	this.scale = null;
	this.lat = null;
	this.lng = null;
	this.id = null;
	
	Util.updateParams(this, options);
	this.lat = parseFloat(this.lat);
	this.lng = parseFloat(this.lng);
	this.description = this.address+"<br/>"+this.city+", "+this.state+", "+this.zip+" "+this.country;
}

GeocoderResult.prototype.getAddress = function (){
  return this.address;
}

GeocoderResult.prototype.getAccuracy = function (){
  return this.accuracy;
}

GeocoderResult.prototype.getAccuracyStr = function (){
  return this.accuracyStr;
}

GeocoderResult.prototype.getLat = function (){
  return this.lat;
}

//Trimmed to dp # of decimal places
GeocoderResult.prototype.getLatStr = function (dp){
  return this.lat.toFixed(dp);
}

GeocoderResult.prototype.getLng = function (){
  return this.lng;
}

//Trimmed todp # of decimal places
GeocoderResult.prototype.getLngStr = function (dp){
  return this.lng.toFixed(dp);
}

GeocoderResult.prototype.getRadius = function (){
  return this.radius;
}

GeocoderResult.prototype.getScale = function (){
  return this.scale;
}

GeocoderResult.prototype.toHTML = function () {
  return "Address: " + this.address + 
    "<br>Accuracy: " + this.accuracyStr +
    "<br>Scale: " + addCommas(this.scale) +
    "<br>Lng: " + this.lng +
    "<br>Lat: " + this.lat;
}
