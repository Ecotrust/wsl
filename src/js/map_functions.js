
function map_init() {
    var options = {
        projection: "EPSG:900913",
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                                         20037508, 20037508.34)
//        maxExtent: new OpenLayers.Bounds(-16000000, 4700000,
//        								 -11800000, 8400000)
    };

    map = new OpenLayers.Map('map', options);

    // create Google Mercator layers
    var gmap = new OpenLayers.Layer.Google(
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
			point_loc_wkt: point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_1_wms_lyr.setVisibility(false);
	ws_1_wms_lyr.displayInLayerSwitcher = false;
	ws_layers[1] = ws_1_wms_lyr;

	ws_2_wms_lyr = new OpenLayers.Layer.WMS(
		'2nd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_2nd_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20020000,2300000,-11500000,1155000',
			point_loc_wkt: point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_2_wms_lyr.setVisibility(false);
	ws_2_wms_lyr.displayInLayerSwitcher = false;
	ws_layers[2] = ws_2_wms_lyr;

	ws_3_wms_lyr = new OpenLayers.Layer.WMS(
		'3rd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_3rd_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20030000,3300000,-11500000,1155000',
			point_loc_wkt: point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_3_wms_lyr.setVisibility(false);
	ws_3_wms_lyr.displayInLayerSwitcher = false;
	ws_layers[3] = ws_3_wms_lyr;

	ws_4_wms_lyr = new OpenLayers.Layer.WMS(
		'4th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_4th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20040000,4300000,-11500000,1155000',
			point_loc_wkt: point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_4_wms_lyr.setVisibility(false);
	ws_4_wms_lyr.displayInLayerSwitcher = false;
	ws_layers[4] = ws_4_wms_lyr; 

	ws_5_wms_lyr = new OpenLayers.Layer.WMS(
		'5th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_5th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20040000,4300000,-11500000,1155000',
			point_loc_wkt: point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_5_wms_lyr.setVisibility(false);
	ws_5_wms_lyr.displayInLayerSwitcher = true;
	ws_layers[5] = ws_5_wms_lyr;

	ws_6_wms_lyr = new OpenLayers.Layer.WMS(
		'6th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_6th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: '-20040000,4300000,-11500000,1155000',
			point_loc_wkt: point_loc_wkt
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	ws_6_wms_lyr.setVisibility(false);
	ws_6_wms_lyr.displayInLayerSwitcher = false;
	ws_layers[6] = ws_6_wms_lyr;
			
	markers = new OpenLayers.Layer.Markers("Your Location");

	map.addLayers([gmap, ws_1_wms_lyr, ws_2_wms_lyr, ws_3_wms_lyr, ws_4_wms_lyr, ws_5_wms_lyr, ws_6_wms_lyr, markers]);
	lyr_switcher = new OpenLayers.Control.LayerSwitcher();	
	map.addControl(lyr_switcher);
	map.setCenter(new OpenLayers.LonLat(-15791278,7703140), 3);
	
	wkt = new OpenLayers.Format.WKT();
}

function handle_new_feature(feature) {
	console.log(feature);
	do_search(feature.geometry);
	
	if (current_vector) {
		current_vector.destroy();
		current_vector = null;
	}
		
	current_vector = feature;
	//Resets back to navigate control
	edit_control.activateControl(edit_control.controls[0]);
}

function initial_search(search_form, search_type) {
	//Clear any markers on map
	clear_markers();
	cur_huc_level = 5;
//	change_ws_level(cur_huc_level);

	if (search_type == 'full' || search_type == 'detail') { 
		geocoder.geocode(search_type, search_form, process_search);
	} else if (search_type == 'ws_name') {
		var name = $('ws_name').value;
		if (name != 'Select One') {
			get_ws_by_name(name, load_ws_results);
		} else {
			alert('Please select a watershed name first');
		}
	}
}

//Process geocode query result
function process_search(geo_result) {
	var num_locations = geo_result.locations.length;
	if (num_locations < 1) {
		alert("Location search returned no results");
	} else if (num_locations > 1) {
		//Too many results
		var div = $('loc_select');
		location_selector = new LocationSelector();
		EventController.addEventListener("LocSelectEvent", location_search);
		location_selector.load_dialog(geo_result);
	} else {
		loc = geo_result.locations[0];
		create_loc_marker(loc);
		
		//Complete location search
		location_search(loc);
	}
}

//Search for watershed given GeocoderLocation.
//Called via LocSelectEvent
function location_search(loc) {
	var lat = loc.getLat();
	var lng = loc.getLng();
	
	if (markers.markers.length > 1) {
		clear_markers();
		create_loc_marker(loc);
	}
	
	the_pt = new OpenLayers.Geometry.Point(lng, lat);
    the_pt = new OpenLayers.Feature.Vector(the_pt);
	point_loc_wkt = wkt.write(the_pt);

	//Merge location param into WMS layer to be passed with request to server
	//ws_1_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_2_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_3_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_4_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_5_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});
	//ws_6_wms_lyr.mergeNewParams({point_loc_wkt: point_loc_wkt});

	update_wms(ws_layers[cur_huc_level]);

	//Turn on current layer
	change_ws_level(cur_huc_level);
	//ws_layers[cur_huc_level].setVisibility(true);
	//ws_layers[cur_huc_level].displayInLayerSwitcher = true;

	get_ws_by_location(lng, lat);
}

//Query watershed data given its name
function get_ws_by_name(name) {
	console.log(name)
}

//Query watershed data given a point location
function get_ws_by_location(lng, lat) {
    request = new OpenLayers.Ajax.Request('php/remote_proxy.php',
    {
            parameters: 'action=get&func=get_all_ws_data_by_location&lng='+lng+'&lat='+lat+'&level='+cur_huc_level,
            method: 'get',
            onSuccess: load_ws_results,
            onFailure: alert_fail
    });

}

function alert_fail(response) {
	alert("Request failed: "+response);
}

//Process watershed query results, drawing polygon and loading tabular data
function load_ws_results(transport) {
	var response = transport.responseText;
	ws_data = parseJSON(response);
	console.log(ws_data);
	
	//pull names into one field called 'name'
	for (var i=1; i<=num_levels; i++) {
		switch (i) {
			case 1: 
				ws_data[1].name = ws_data[1].reg_n; 
				break;
			case 2: 
				ws_data[2].name = ws_data[2].subr_n; 
				break;
			case 3: 
				ws_data[3].name = ws_data[3].bas_n; 
				break;
			case 4: 
				ws_data[4].name = ws_data[4].subb_n; 
				break;
			case 5: 
				ws_data[5].name = ws_data[5].wat_n; 
				break;
			case 6: 
				ws_data[6].name = ws_data[6].subw_n; 
				break;
		}
	}
	
	var cur_ws_data = ws_data[cur_huc_level];
	var ws_html = gen_ws_stats_html(cur_ws_data);
	$('ws_stats_content').update(ws_html);

	//Build watershed 'ladder' for current location
	var ws_ladder_html = "<table id='ws_ladder_table'><tr><th>Level</th><th>Name</th><th></th></tr>";
	for (var i=1; i<=num_levels; i++) {
		if (ws_data[i]) {
			ws_ladder_html += "<tr align='center'><td>"+i+"</td><td>"+ws_data[i].name+"</td><td><input type='button' value='Go To' onclick='level_change_event("+ws_data[i].level+")'></td></tr>";
		}
	}
	ws_ladder_html += "</table>";
	$('ws_ladder_content').update(ws_ladder_html);

	//Zoom to watershed polygon
	zoom_to_cur_ws();
}

function level_change_event(level) {
	change_ws_level(level);
	update_wms(ws_layers[cur_huc_level]); 
	zoom_to_cur_ws(); 
	update_stats();
}

function update_stats() {
	//Update stats
	var ws_html = gen_ws_stats_html(ws_data[cur_huc_level]);
	$('ws_stats_content').update(ws_html);
}

function gen_ws_stats_html(ws_level_data) {
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

function zoom_to_cur_ws() {
	ws_level_data = ws_data[cur_huc_level];
	//Zoom to watershed polygon
	var bounds = new OpenLayers.Bounds(ws_level_data.left, ws_level_data.bottom, ws_level_data.right, ws_level_data.top);
	map.zoomToExtent(bounds);
}

function update_wms(layer) {
	layer.mergeNewParams({point_loc_wkt: point_loc_wkt});
}

function change_ws_level(new_level) {
	//Turn off current layer
	ws_layers[cur_huc_level].setVisibility(false);
	ws_layers[cur_huc_level].displayInLayerSwitcher = false;

	//Update level
	cur_huc_level = new_level;

	//Turn on new layer
	ws_layers[cur_huc_level].setVisibility(true);
	ws_layers[cur_huc_level].displayInLayerSwitcher = true;

	//Update layer switcher
	map.removeControl(lyr_switcher);
	lyr_switcher = new OpenLayers.Control.LayerSwitcher();
	map.addControl(lyr_switcher);
}

function load_map_results(search_results) {
	var max_features = 200;
	var num_results = search_results.length;
	markers.clearMarkers();
	for (var i=0; i<search_results.length && i<max_features; i++) {
		create_feature(search_results[i]);
	}
}

function create_loc_marker(loc) {
	var lng = loc.lng;
	var lat = loc.lat;

	//Create location marker on map
	var html = loc.address+"<br/>"+loc.city+", "+loc.state+", "+loc.zip+" "+loc.country;

	//Convert wgs84 to mercator meters
	var lonlat = sphere_to_merc(lng,lat);
	//var lonlat = new OpenLayers.LonLat(lng,lat);
	var popupSize = new OpenLayers.Size(80,80);
//	var icon = new OpenLayers.Icon('/wiser.png',size,offset);
	feature = new OpenLayers.Feature(gmap, lonlat);
	popup = feature.createPopup(false);
	popup.setOpacity(0.9);
	popup.setBackgroundColor("white");
	popup.setContentHTML(html);
	marker = feature.createMarker();
	markers.addMarker(marker);
	marker.events.register("mousedown", feature, marker_click);
}

//Convert spherical coordinates (wgs84) into mercator projects used
//by commercial map tile providers.
function sphere_to_merc(lng, lat) {
	return OpenLayers.Layer.SphericalMercator.forwardMercator(parseFloat(lng), parseFloat(lat));
}


function zoom_to(lng, lat, zoom_level) {
	//var lnglat = new OpenLayers.LonLat(lng,lat);
	var lnglat = sphere_to_merc(lng, lat);
	map.setCenter(lnglat, zoom_level);
}

function create_feature(r) {
	var lonlat = new OpenLayers.LonLat(r.lng,r.lat);
	var popupSize = new OpenLayers.Size(200,80);
//	var icon = new OpenLayers.Icon('/wiser.png',size,offset);
	feature = new OpenLayers.Feature(base_map, lonlat);
	popup = feature.createPopup(false);
	popup.setOpacity(0.9);
	popup.setBackgroundColor("white");
	popup.setContentHTML(r.name+"<br/><br/>"+r.address_1+" "+r.address_2+"<br/>"+r.city+" "+r.state+" "+r.postal_code+" "+r.province+" "+r.country);
	marker = feature.createMarker();
	markers.addMarker(marker);
	marker.events.register("mousedown", feature, marker_click);
}

function marker_click(evt) {
	var closed = false;
	if (current_popup != null) {
		if (current_popup == this.popup)
			closed = true;
		markers.map.removePopup(current_popup);
		current_popup = null;	
	}
	if (current_popup == null && !closed) {
		current_popup = this.popup;
		markers.map.addPopup(current_popup);
	}

	Event.stop(evt);
}

function clear_markers() {
	if (markers) {
		markers.clearMarkers();
	}
}

function clear_map() {
	if (current_vector) {
		current_vector.destroy();
	}
	current_vector = null;
	if (markers) {
		markers.clearMarkers();
	}
	$('spatial_search_wkt').value = '';
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
		sel_html += "<td><input type='button' value='Select' id='"+i+"' onclick='location_selector.select(this.id); location_selector.close()'>";
		sel_html += " <input type='button' value='View On Map' id='"+i+"' onclick='zoom_to("+lng+", "+lat+", 13)'></td>";
		sel_html += "<td>"+address+"<br/>";
		sel_html += city+", "+state+", "+zip+" "+country+"</td>";
		sel_html += "</tr>";

		//Add marker
		//var marker_html = address+"<br/>"+city+", "+state+", "+zip+" "+country;
		create_loc_marker(loc);
	}
	sel_html += "</table>";
	
	// Create window with scrollable text
	self.win = new Window('loc_select', {className: "bluelighting",  width:340, height:200, zIndex: 100, resizable: true, title: "Multiple Results, Select One", showEffect:Element.show, hideEffect: Effect.DropOut, destroyOnClose: true})
	
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