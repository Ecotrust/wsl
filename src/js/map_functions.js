/****************************************************************************
 * WSLocator class
 *
 * Manages OL map, watershed WMS layers and watershed data requests
/***************************************************************************/
function WSLocator(){
	this.gmap = null;
	this.markers = null;
	this.lyr_switcher = null;
	this.ws_wms_lyr = null;
	this.point_loc_wkt = null;
	this.wkt = null;
	this.cur_huc_level;
	this.ws_data = null;
	this.current_popup = null;
	this.ws_layers = [];
	this.num_levels = 6;
	this.location_selector = new LocationSelector();

	var me = this;
	this.start_process_search = function (result) {
		me.process_search(result);
	}
	this.start_location_search = function (loc) {
		me.location_search(loc);
	}
	this.start_load_ws_results = function (response) {
		me.load_ws_results(response);
	}
}

//Initialize the OL map, map controls, and WMS layers
WSLocator.prototype.map_init = function() {
    this.options = {
        projection: "EPSG:900913",
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                                         20037508, 20037508.34)
    };

    this.map = new OpenLayers.Map('map', this.options);

    // create Google Mercator base layers
    this.gmap = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {
 
        	'maxZoomLevel':18, 
        	'sphericalMercator': true
        }
    );

	ws_1_wms_lyr = new OpenLayers.Layer.WMS(
		'1st Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_1st_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20010000,1300000,-11500000,1155000',
			point_loc_wkt: this.point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_1_wms_lyr.setVisibility(false);
	ws_1_wms_lyr.displayInLayerSwitcher = false;
	this.ws_layers[1] = ws_1_wms_lyr;

	ws_2_wms_lyr = new OpenLayers.Layer.WMS(
		'2nd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_2nd_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20020000,2300000,-11500000,1155000',
			point_loc_wkt: this.point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_2_wms_lyr.setVisibility(false);
	ws_2_wms_lyr.displayInLayerSwitcher = false;
	this.ws_layers[2] = ws_2_wms_lyr;

	ws_3_wms_lyr = new OpenLayers.Layer.WMS(
		'3rd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_3rd_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20030000,3300000,-11500000,1155000',
			point_loc_wkt: this.point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_3_wms_lyr.setVisibility(false);
	ws_3_wms_lyr.displayInLayerSwitcher = false;
	this.ws_layers[3] = ws_3_wms_lyr;

	ws_4_wms_lyr = new OpenLayers.Layer.WMS(
		'4th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_4th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20040000,4300000,-11500000,1155000',
			point_loc_wkt: this.point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_4_wms_lyr.setVisibility(false);
	ws_4_wms_lyr.displayInLayerSwitcher = false;
	this.ws_layers[4] = ws_4_wms_lyr; 

	ws_5_wms_lyr = new OpenLayers.Layer.WMS(
		'5th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_5th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20040000,4300000,-11500000,1155000',
			point_loc_wkt: this.point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_5_wms_lyr.setVisibility(false);
	ws_5_wms_lyr.displayInLayerSwitcher = true;
	this.ws_layers[5] = ws_5_wms_lyr;

	ws_6_wms_lyr = new OpenLayers.Layer.WMS(
		'6th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_6th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20040000,4300000,-11500000,1155000',
			point_loc_wkt: this.point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_6_wms_lyr.setVisibility(false);
	ws_6_wms_lyr.displayInLayerSwitcher = false;
	this.ws_layers[6] = ws_6_wms_lyr;
			
	this.markers = new OpenLayers.Layer.Markers("Your Location");
	this.map.addLayers([this.gmap, ws_1_wms_lyr, ws_2_wms_lyr, ws_3_wms_lyr, ws_4_wms_lyr, ws_5_wms_lyr, ws_6_wms_lyr, this.markers]);
	this.lyr_switcher = new OpenLayers.Control.LayerSwitcher();	
	this.map.addControl(this.lyr_switcher);
	this.map.setCenter(new OpenLayers.LonLat(-15791278,7703140), 3);
	this.wkt = new OpenLayers.Format.WKT();
}

WSLocator.prototype.initial_search = function (search_form, search_type) {
	//Clear any markers on map
	this.clear_markers();
	this.cur_huc_level = 5;
//	change_ws_level(cur_huc_level);

	if (search_type == 'full' || search_type == 'detail') {
		EventController.addEventListener("GeocodeReturnEvent", this.start_process_search); 
		geocoder.geocode(search_type, search_form);
	} else if (search_type == 'ws_name') {
		var name = $('ws_name').value;
		if (name != 'Select One') {
			get_ws_by_name(name, this.load_ws_results);
		} else {
			alert('Please select a watershed name first');
		}
	}
}

//Process geocode query result
WSLocator.prototype.process_search = function (geo_result) {
	var num_locations = geo_result.locations.length;
	if (num_locations < 1) {
		alert("Location search returned no results");
	} else if (num_locations > 1) {
		//Too many results
		var div = $('loc_select');
		EventController.addEventListener("LocSelectEvent", this.start_location_search);
		this.location_selector.load_dialog(geo_result);
	} else {
		loc = geo_result.locations[0];
		this.create_loc_marker(loc);
		
		//Complete location search
		this.location_search(loc);
	}
}

//Search for watershed given GeocoderLocation.
//Called via LocSelectEvent
WSLocator.prototype.location_search = function (loc) {
	var lat = loc.getLat();
	var lng = loc.getLng();
	
	//Create marker for geocoded point
	if (this.markers.markers.length > 1) {
		this.clear_markers();
		this.create_loc_marker(loc);
	}
	
	//Generate WKT of geocoded point
	the_pt = new OpenLayers.Geometry.Point(lng, lat);
    the_pt = new OpenLayers.Feature.Vector(the_pt);
	this.point_loc_wkt = this.wkt.write(the_pt);

	//Merge location param into WMS layer to be passed with request to server
	//ws_1_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_2_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_3_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_4_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_5_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_6_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});

	this.update_wms(this.ws_layers[this.cur_huc_level]);

	//Turn on current layer
	this.change_ws_level(this.cur_huc_level);
	//ws_layers[cur_huc_level].setVisibility(true);
	//ws_layers[cur_huc_level].displayInLayerSwitcher = true;

	this.get_ws_data_by_location(lng, lat);
}

//Query watershed data given its name
WSLocator.prototype.get_ws_by_name = function (name) {
	console.log(name)
}

//Query watershed data given a point location
WSLocator.prototype.get_ws_data_by_location = function (lng, lat) {
    request = new OpenLayers.Ajax.Request('php/remote_proxy.php',
    {
            parameters: 'action=get&func=get_all_ws_data_by_location&lng='+lng+'&lat='+lat+'&level='+this.cur_huc_level,
            method: 'get',
            onSuccess: this.start_load_ws_results,
            onFailure: this.alert_fail
    });
}

WSLocator.prototype.alert_fail = function (response) {
	alert("Request failed: "+response);
}

//Process watershed query results, drawing polygon and loading tabular data
WSLocator.prototype.load_ws_results = function (transport) {
	var response = transport.responseText;
	this.ws_data = parseJSON(response);
	console.log(this.ws_data);
	
	//pull names into one field called 'name'
	for (var i=1; i<=this.num_levels; i++) {
		switch (i) {
			case 1: 
				this.ws_data[1].name = this.ws_data[1].reg_n; 
				break;
			case 2: 
				this.ws_data[2].name = this.ws_data[2].subr_n; 
				break;
			case 3: 
				this.ws_data[3].name = this.ws_data[3].bas_n; 
				break;
			case 4: 
				this.ws_data[4].name = this.ws_data[4].subb_n; 
				break;
			case 5: 
				this.ws_data[5].name = this.ws_data[5].wat_n; 
				break;
			case 6: 
				this.ws_data[6].name = this.ws_data[6].subw_n; 
				break;
		}
	}
	
	var cur_ws_data = this.ws_data[this.cur_huc_level];
	var ws_html = this.gen_ws_stats_html(cur_ws_data);
	$('ws_stats_content').update(ws_html);

	//Build watershed 'ladder' for current location
	var ws_ladder_html = "<table id='ws_ladder_table'><tr><th>Level</th><th>Name</th><th></th></tr>";
	for (var i=1; i<=this.num_levels; i++) {
		if (this.ws_data[i]) {
			ws_ladder_html += "<tr align='center'><td>"+i+"</td><td>"+this.ws_data[i].name+"</td><td><input type='button' value='Go To' onclick='wsl.level_change_event("+this.ws_data[i].level+")'></td></tr>";
		}
	}
	ws_ladder_html += "</table>";
	$('ws_ladder_content').update(ws_ladder_html);

	//Zoom to watershed polygon
	this.zoom_to_cur_ws();
}

WSLocator.prototype.level_change_event = function (level) {
	this.change_ws_level(level);
	this.update_wms(this.ws_layers[this.cur_huc_level]); 
	this.zoom_to_cur_ws(); 
	this.update_stats();
}

WSLocator.prototype.update_stats = function () {
	//Update stats
	var ws_html = this.gen_ws_stats_html(this.ws_data[this.cur_huc_level]);
	$('ws_stats_content').update(ws_html);
}

WSLocator.prototype.gen_ws_stats_html = function (ws_level_data) {
	var ws_name, ws_leng, ws_area, ws_html = null;
	ws_leng = parseFloat(ws_level_data.shape_leng).toFixed(3);	//3 decimal places
	ws_area = parseFloat(ws_level_data.shape_area).toFixed(3);	//3 decimal places
	
	//Put together current ws level stats
	ws_html = "<table id='ws_stats_table'><tr><td align='right'><b>Name:</b></td><td>"+ws_level_data.name+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Level:</b></td><td>"+ws_level_data.level+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Perimeter:</b></td><td>"+ws_leng+" miles</td></tr>";
	ws_html += "<tr><td align='right'><b>Area:</b></td><td>"+ws_area+" sq. miles</td></tr>";
	ws_html += "</table>";	
	return ws_html;
}

WSLocator.prototype.zoom_to_cur_ws = function () {
	ws_level_data = this.ws_data[this.cur_huc_level];
	//Zoom to watershed polygon
	var bounds = new OpenLayers.Bounds(ws_level_data.left, ws_level_data.bottom, ws_level_data.right, ws_level_data.top);
	this.map.zoomToExtent(bounds);
}

WSLocator.prototype.update_wms = function (layer) {
	layer.mergeNewParams({point_loc_wkt: this.point_loc_wkt});
}

WSLocator.prototype.change_ws_level = function (new_level) {
	//Turn off current layer
	this.ws_layers[this.cur_huc_level].setVisibility(false);
	this.ws_layers[this.cur_huc_level].displayInLayerSwitcher = false;

	//Update level
	this.cur_huc_level = new_level;

	//Turn on new layer
	this.ws_layers[this.cur_huc_level].setVisibility(true);
	this.ws_layers[this.cur_huc_level].displayInLayerSwitcher = true;

	//Update layer switcher
	this.map.removeControl(this.lyr_switcher);
	this.lyr_switcher = new OpenLayers.Control.LayerSwitcher();
	this.map.addControl(this.lyr_switcher);
}

WSLocator.prototype.create_loc_marker = function (loc) {
	var lng = loc.lng;
	var lat = loc.lat;

	//Create location marker on map
	var html = loc.address+"<br/>"+loc.city+", "+loc.state+", "+loc.zip+" "+loc.country;

	//Convert wgs84 to mercator meters
	var lonlat = this.sphere_to_merc(lng,lat);
	//var lonlat = new OpenLayers.LonLat(lng,lat);
	var popupSize = new OpenLayers.Size(80,80);
//	var icon = new OpenLayers.Icon('/wiser.png',size,offset);
	feature = new OpenLayers.Feature(this.gmap, lonlat);
	popup = feature.createPopup(false);
	popup.setOpacity(0.9);
	popup.setBackgroundColor("white");
	popup.setContentHTML(html);
	marker = feature.createMarker();
	this.markers.addMarker(marker);
	marker.events.register("mousedown", feature, this.marker_click);
}

//Convert spherical coordinates (wgs84) into mercator projects used
//by commercial map tile providers.
WSLocator.prototype.sphere_to_merc = function (lng, lat) {
	return OpenLayers.Layer.SphericalMercator.forwardMercator(parseFloat(lng), parseFloat(lat));
}

WSLocator.prototype.zoom_to = function (lng, lat, zoom_level) {
	//var lnglat = new OpenLayers.LonLat(lng,lat);
	var lnglat = this.sphere_to_merc(lng, lat);
	this.map.setCenter(lnglat, zoom_level);
}

WSLocator.prototype.marker_click = function (evt) {
	var closed = false;
	if (this.current_popup != null) {
		if (this.current_popup == this.popup)
			closed = true;
		this.markers.map.removePopup(this.current_popup);
		this.current_popup = null;	
	}
	if (this.current_popup == null && !closed) {
		this.current_popup = this.popup;
		this.markers.map.addPopup(this.current_popup);
	}

	Event.stop(evt);
}

WSLocator.prototype.clear_markers = function () {
	if (this.markers) {
		this.markers.clearMarkers();
	}
}

WSLocator.prototype.clear_map = function () {
	if (this.markers) {
		this.markers.clearMarkers();
	}
}

/****************************************************************************
 * LocationSelector class
 *
 * For use when geocoder returns multiple results.
 * Generates a window containing all of the results including buttons to
 * select a location and view it on the map. 
/***************************************************************************/
function LocationSelector(){
	this.georesult = null;
}

LocationSelector.prototype.load_dialog = function (georesult) {
	this.georesult = georesult;
	var sel_html = "<table cellspacing='8'>";
	for (var i=0; i<georesult.numLocations(); i++) {
		var loc = georesult.getLocation(i);
		var lng = loc.lng;
		var lat = loc.lat;
		var address = loc.address;
		var city = loc.city;
		var state = loc.state;
		var zip = loc.zip;
		var country = loc.country;

		//Add selection entry
		sel_html += "<tr>";
		sel_html += "<td><input type='button' value='Select' id='"+i+"' onclick='wsl.location_selector.select(this.id); wsl.location_selector.close()'>";
		sel_html += " <input type='button' value='View On Map' id='"+i+"' onclick='wsl.zoom_to("+lng+", "+lat+", 13)'></td>";
		sel_html += "<td>"+address+"<br/>";
		sel_html += city+", "+state+", "+zip+" "+country+"</td>";
		sel_html += "</tr>";

		//Add marker
		//var marker_html = address+"<br/>"+city+", "+state+", "+zip+" "+country;
		wsl.create_loc_marker(loc);
	}
	sel_html += "</table>";
	
	// Create window with scrollable text
	if (!$('loc_select')) {
		self.win = new Window('loc_select', {className: "bluelighting",  width:340, height:200, zIndex: 100, resizable: true, title: "Multiple Results, Select One", showEffect:Element.show, hideEffect: Effect.DropOut, destroyOnClose: true})
	}
	
	//Load with location choices
	win.getContent().innerHTML= "<div style='padding:10px'>"+sel_html+"</div>";
	win.showCenter();	
}

LocationSelector.prototype.select = function (location_num) {
	console.log(location_num);
	var loc = this.georesult.getLocation(location_num);
	EventController.dispatchEvent("LocSelectEvent", new CustomEvent.Events.LocSelectEvent(loc));
}

LocationSelector.prototype.close = function () {
	self.win.close();
}