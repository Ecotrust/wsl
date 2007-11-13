//Assumes the prototype library for AJAX requests.  If using a different library
//simply replace them as needed in the search functions.

function GeonameSearch() {
	var me = this;
	this.process_placename_search = function (result) {
		me.do_process_placename_search(result);
	}
}
http://ws.geonames.org/searchJSON?q=london&maxRows=10
GeonameSearch.prototype.placename_search = function(placename) {
	request = new OpenLayers.Ajax.Request('http://ws.geonames.org/searchJSON', 
	{
	    method:'get',
	    parameters: 'q='+placename+'&maxRows=10',
		onSuccess: this.process_placename_search,
		onFailure: this.search_fail
	});	
}

GeonameSearch.prototype.process_placename_search = function(responseText) {
	//Extract and decode results
	var json_result = transport.responseText;
	var result_obj = parseJSON(json_result);
	//Create new object to hold results
	var geo_result = new GeonameResult();
	console.log(geo_result);	
}

function GeonameResult() {
	var me = this;
	this.process_start = function (result) {
		me.process_result(result);
	}
}