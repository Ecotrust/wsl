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