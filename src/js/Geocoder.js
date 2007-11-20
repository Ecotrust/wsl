function YahooGeocoder() {
	var me = this;
	this.process_start = function (result) {
		me.process_result(result);
	}
}

YahooGeocoder.prototype.geocode = function(search_type) {
	//Serialize search form and send geocode request to proxy script
	//this.result_callback = callback;
	var params = 'search_type='+escape(search_type);
	switch (search_type) {
		case 'full': 
			params += '&full_address='+$F('full_address'); 
			break;
		case 'detail':
			params += '&street='+$F('street');
			params += '&city='+$F('city');
			params += '&state='+$F('state');
			params += '&zip='+$F('zip');
			break;
	}

	request = new OpenLayers.Ajax.Request('php/yahoo_proxy.php', 
	{
	    method:'get',
	    parameters: params,
		onSuccess: this.process_start,
		onFailure: this.geocode_fail
	});
}

YahooGeocoder.prototype.geocode_fail = function() {
	alert('Failure to connect to geocoder service');
}

YahooGeocoder.prototype.process_result = function(transport) {
	//Extract and decode results
	var json_result = transport.responseText;
	var result_obj = parseJSON(json_result);
	
	//Create new object to hold results
	var geo_result = new GeocoderResult();	

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
	        geo_result.addLocation({address:loc.Address, 
	        					 city: loc.City,
	        					 state: loc.State,
	        					 zip: loc.Zip,
	        					 country: loc.Country,
	                             precision: loc.precision,
	                             lat: loc.Latitude, 
	                             lng: loc.Longitude,
	                             id: 1+1}); 	
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
		this.lat = parseFloat(result.lat);
	else
		this.lat = null;
		
	if (result.lng)
		this.lng = parseFloat(result.lng);
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

//Trimmed to dp # of decimal places
GeocoderLocation.prototype.getLatStr = function (dp){
  return this.lat.toFixed(dp);
}

GeocoderLocation.prototype.getLng = function (){
  return this.lng;
}

//Trimmed todp # of decimal places
GeocoderLocation.prototype.getLngStr = function (dp){
  return this.lng.toFixed(dp);
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
