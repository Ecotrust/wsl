// This library assumes the use of the prototype library for AJAX requests.  If using 
// a different library simply replace them as needed in the search functions.

/****************************************************************************
 * Geonamer class
 *
 * Client for geoname.org web service
/***************************************************************************/
function Geonamer() {
	var me = this;
	this.process_placename_search = function (result) {
		me.do_process_placename_search(result);
	}
	this.max_rows = 20;
}

Geonamer.prototype.placename_search = function(placename) {
	request = new OpenLayers.Ajax.Request('php/geonamer_proxy.php', 
	{
	    method:'get',
	    parameters: 'q='+placename+'&maxRows='+this.max_rows,
		onSuccess: this.process_placename_search,
		onFailure: this.search_fail
	});	
}

Geonamer.prototype.do_process_placename_search = function(transport) {
	//Extract and decode results
	var json_result = transport.responseText;
	var search_res = parseJSON(json_result);
	console.log(search_res);

	//Create new object to hold results
	var geo_result_set = new GeonamerResultSet();

	//Verify there is a result
	if (!search_res) {
		EventController.dispatchEvent("GeonameReturnEvent", new CustomEvent.Events.GeonameReturnEvent(geo_result_set));
	}
	
	//Load number of results
	var num_results = 0;
	if (search_res.totalResultsCount > this.max_rows)
		num_results = this.max_rows;
	else
		num_results = search_res.totalResultsCount;
	geo_result_set.update({num_results: num_results, total_results: search_res.totalResultsCount});
	
	//Set status
	if (search_res.totalResultsCount == 0) {
		geo_result_set.update({success: false});
		EventController.dispatchEvent("GeonameReturnEvent", new CustomEvent.Events.GeonameReturnEvent(geo_result_set));
		return;
	} else {
		geo_result_set.update({success: true});
	}

	//Load results
	for (var i=0; i<search_res.geonames.length; i++) {
		geo_result_set.addGeoResult(search_res.geonames[i]);
	}
	EventController.dispatchEvent("GeonameReturnEvent", new CustomEvent.Events.LocSelectEvent(geo_result_set));
}

/****************************************************************************
 * GeonamerResultSet class
 *
 * Contains one or more search results from a geonames search
/***************************************************************************/
function GeonamerResultSet() {
	this.type = "GeonamerResultSet";
	this.num_results = 0;
	this.total_results = 0;
	this.search_string = null;  //Original search string
	this.success = false;		//Geocoding succeeded or not
	this.geonames = Array();	//Search results
	
	//Force binding to 'this' object on event callbacks
	var me = this;
	this.process_start = function (result) {
		me.process_result(result);
	}
}

GeonamerResultSet.prototype.getResult = function (index) {
	return this.geonames[index];
}

GeonamerResultSet.prototype.addGeoResult = function (geoname) {
	var new_geo_result = new GeonamerResult(geoname);
	this.geonames.push(new_geo_result);
}

//Update parameter values.  Takes a JS hash of options
GeonamerResultSet.prototype.update = function (options) {
	Util.updateParams(this, options);
}

/****************************************************************************
 * GeonamerResult class
 *
 * A single geonames search result
/***************************************************************************/
function GeonamerResult(options) {
	Util.updateParams(this, options);
	this.description = this.name+"<br/>("+this.lat+","+this.lng+")";
}

//Trimmed to dp # of decimal places
GeonamerResult.prototype.getLngStr = function (dp){
  return this.lng.toFixed(dp);
}

//Trimmed to dp # of decimal places
GeonamerResult.prototype.getLatStr = function (dp){
  return this.lat.toFixed(dp);
}