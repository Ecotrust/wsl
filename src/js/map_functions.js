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
	this.cur_ws_lyr_num;
	this.ws_data = null;
	this.ws_layers = [];
	this.load_msg = "";
	
	this.num_levels = 11;
	this.us_ws_layer_nums = [0,1,2,3,4,5];
	this.bc_ws_layer_nums = [6,7,8];
	this.yukon_ws_layer_nums = [9,10];
	this.default_us_order = [4,5,3,2,1,0];
	this.default_bc_order = [8,7,6];
	this.default_yukon_order = [10,9];
	
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
	this.start_marker_click = function (evt) {
		me.marker_click(evt);
	}
	
	this.load_win = new LoadWindow();
	//this.load_win.set_msg_and_show("blort");
	
	EventController.addEventListener("GeocodeReturnEvent", this.start_process_search);
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

    //Google base map
    this.gmap = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {
 
        	'maxZoomLevel':18, 
        	'sphericalMercator': true
        }
    );

	//US Watershed WMS layers
	us_1_wms_lyr = new OpenLayers.Layer.WMS(
		'US 1st Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_1st_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[0] = us_1_wms_lyr;

	us_2_wms_lyr = new OpenLayers.Layer.WMS(
		'US 2nd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_2nd_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[1] = us_2_wms_lyr;

	us_3_wms_lyr = new OpenLayers.Layer.WMS(
		'US 3rd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_3rd_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[2] = us_3_wms_lyr;

	us_4_wms_lyr = new OpenLayers.Layer.WMS(
		'US 4th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_4th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[3] = us_4_wms_lyr; 

	us_5_wms_lyr = new OpenLayers.Layer.WMS(
		'US 5th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_5th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[4] = us_5_wms_lyr;

	us_6_wms_lyr = new OpenLayers.Layer.WMS(
		'US 6th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_6th_field',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[5] = us_6_wms_lyr;

	//BC Watershed WMS Layers
	bc_3_wms_lyr = new OpenLayers.Layer.WMS(
		'US 3rd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'bc_3rd_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[6] = bc_3_wms_lyr;

	bc_4_wms_lyr = new OpenLayers.Layer.WMS(
		'BC (US 4th Field Equivalent) Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'bc_4th_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[7] = bc_4_wms_lyr;

	bc_6_wms_lyr = new OpenLayers.Layer.WMS(
		'BC (US 6th Field Equivalent) Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'bc_6th_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.5} 
	);
	this.ws_layers[8] = bc_6_wms_lyr;
	
	this.markers = new OpenLayers.Layer.Markers("Your Location");
	this.map.addLayers([this.gmap, this.markers]);
	this.lyr_switcher = new OpenLayers.Control.LayerSwitcher();	
	this.map.addControl(this.lyr_switcher);
	this.map.setCenter(new OpenLayers.LonLat(-15791278,7703140), 3);
	this.wkt = new OpenLayers.Format.WKT();
}

WSLocator.prototype.initial_search = function (search_form, search_type) {
	//Clear any markers on map
	this.clear_markers();
	if (search_type == 'full' || search_type == 'detail') {
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
	} else if (num_locations > 1) {
		Dialog.closeInfo();
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

	//Get ws_data including bounds
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
            parameters: 'action=get&func=get_ws_data_by_location&lng='+lng+'&lat='+lat,
            method: 'get',
            onSuccess: this.start_load_ws_results,
            onFailure: this.alert_fail
    });
}

WSLocator.prototype.alert_fail = function (response) {
	alert("Request failed: "+response);
}

WSLocator.prototype.get_cur_ws_lyr = function () {
	if (this.cur_ws_lyr_num != null)
		return this.ws_layers[this.cur_ws_lyr_num];
	else
		return null;
}

WSLocator.prototype.get_ws_lyr_by_index = function (index) {
	if (this.ws_layers) {
		return this.ws_layers[index];
	} else {
		return null;
	}
}

WSLocator.prototype.get_cur_ws_data = function () {
	if (this.cur_ws_lyr_num != null)
		return this.ws_data.ws_level_data[this.cur_ws_lyr_num];
	else
		return null;
}

WSLocator.prototype.get_cur_region = function () {
	if (this.ws_data.region) {
		return this.ws_data.region;
	} else {
		return null;
	}
}

WSLocator.prototype.get_cur_region_layer_nums = function () {
	var cur_region = this.get_cur_region();
	if (!cur_region)
		return null;
	switch (cur_region) {
		case 'us':
			return this.us_ws_layer_nums;
			break;
		case 'bc':
			return this.bc_ws_layer_nums;
			break;
		case 'yukon':
			return this.yukon_ws_layer_nums;
			break;	
	}
}

WSLocator.prototype.get_cur_region_layers = function () {
	var cur_region_layer_nums = this.get_cur_region_layer_nums();
	var cur_region_layers = [];
	for (var i=0; i<cur_region_layer_nums.length; i++) {
		cur_region_layers.push(this.ws_layers[cur_region_layer_nums[i]]);
	}
	return cur_region_layers;
}

WSLocator.prototype.get_ws_data_by_index = function (index) {
	if (this.ws_data && this.ws_data.ws_level_data) {
		return this.ws_data.ws_level_data[index];
	} else {
		return null;
	} 
}

//Process watershed query results, drawing polygon and loading tabular data
WSLocator.prototype.load_ws_results = function (transport) {
	//Extract ws data
	var response = transport.responseText;
	
	//Store ws data
	this.ws_data = parseJSON(response);
	if (!this.ws_data) {
		alert ("Failed to retrieve watershed data");
		return;
	}

	console.log(this.ws_data);

	this.rem_cur_ws_wms_lyr();
	this.set_initial_ws_lyr();
	
	//Zoom to watershed polygon
	this.zoom_to_cur_ws();
	
	var cur_ws_data = this.get_cur_ws_data();
	var cur_ws_lyr = this.get_cur_ws_lyr();
	
	//Update WMS layer params with ws id and bounds
	this.update_ws_wms_params();

	//Add WMS layers to map
	this.add_ws_wms_lyr(this.cur_ws_lyr_num);
	
	var ws_html = this.gen_ws_stats_html(cur_ws_data);
	$('ws_stats_content').update(ws_html);

	//Build watershed 'ladder' for current location
	var ws_ladder_html = "<table id='ws_ladder_table'><tr><th>Level</th><th>Name</th><th></th></tr>";
	for (var i=0; i<this.num_levels; i++) {
		if (this.ws_data.ws_level_data[i]) {
			
			ws_ladder_html += "<tr align='center'><td>"+this.ws_data.ws_level_data[i].level+"</td><td>"+this.ws_data.ws_level_data[i].name+"</td><td><input type='button' value='Go To' onclick='wsl.level_change_event("+i+")'></td></tr>";
		}
	}
	ws_ladder_html += "</table>";
	$('ws_ladder_content').update(ws_ladder_html);
	
	Dialog.closeInfo()
}

// Set initial watershed layer based on whether US or BC
// and what layers are available
// So, assumes watershed data has already been queried 
WSLocator.prototype.set_initial_ws_lyr = function (transport) {
	var region = this.get_cur_region();
	if (!region) return;
	switch(this.ws_data.region) {
		case 'us':
			for (var i=0; i<this.default_us_order.length;i++) {
				if (this.get_ws_data_by_index(this.default_us_order[i]) != null) {
					this.cur_ws_lyr_num = this.default_us_order[i];
					return;
				}
			}
			break;
		case 'bc':
			for (var i=0; i<this.default_bc_order.length;i++) {
				if (this.get_ws_data_by_index(this.default_bc_order[i]) != null) {
					this.cur_ws_lyr_num = this.default_bc_order[i];
					return;
				}
			}
			break;
		case 'yukon':
			for (var i=0; i<this.default_yukon_order.length;i++) {
				if (this.get_ws_data_by_index(this.default_yukon_order[i]) != null) {
					this.cur_ws_lyr_num = this.default_yukon_order[i];
					return;
				}
			}
			break;
	}
}

WSLocator.prototype.level_change_event = function (new_ws_lyr_num) {
	if (new_ws_lyr_num != this.cur_ws_lyr_num) {
		//Update WMS layer params with ws id and bounds
		this.rem_cur_ws_wms_lyr();
		this.cur_ws_lyr_num = new_ws_lyr_num; 
		this.add_ws_wms_lyr(this.cur_ws_lyr_num);
		this.zoom_to_cur_ws(); 
		this.update_stats();
	}
}

WSLocator.prototype.update_stats = function () {
	//Update stats
	var ws_html = this.gen_ws_stats_html(this.get_cur_ws_data());
	$('ws_stats_content').update(ws_html);
}

WSLocator.prototype.update_ws_wms_params = function () {
	var cur_region_layers = this.get_cur_region_layers();
	for (var i=0; i<cur_region_layers.length; i++) {
		var ws_lyr = cur_region_layers[i];
		var ws_data = this.get_ws_data_by_index(i);
		
		//bbox: '-20010000,1300000,-11500000,1155000',
		var left = parseFloat(ws_data['left']).toFixed(3);
		var bottom = parseFloat(ws_data['bottom']).toFixed(3);
		var right = parseFloat(ws_data['right']).toFixed(3);
		var top = parseFloat(ws_data['top']).toFixed(3);
		var bbox_str = left+','+bottom+','+right+','+top;
		console.log('gid: '+ws_data.gid);
		console.log('bbox: '+bbox_str);
		ws_lyr.mergeNewParams({bbox: bbox_str, gid: ws_data.gid});
	}
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
	var ws_level_data = this.get_cur_ws_data();
	//Zoom to watershed polygon
	var bounds = new OpenLayers.Bounds(ws_level_data.left, ws_level_data.bottom, ws_level_data.right, ws_level_data.top);
	this.map.zoomToExtent(bounds);
}

WSLocator.prototype.rem_cur_ws_wms_lyr = function () {
	var cur_lyr = this.get_cur_ws_lyr();
	if (cur_lyr) {
		this.map.removeLayer(this.get_cur_ws_lyr());
	}	
}

WSLocator.prototype.add_ws_wms_lyr = function (ws_lyr_num) {
	var ws_lyr = this.get_ws_lyr_by_index(ws_lyr_num);
	//Turn on new layer
	this.map.addLayer(ws_lyr);
	this.map.raiseLayer(this.markers, 1);

	//Update layer switcher
	//this.map.removeControl(this.lyr_switcher);
	//this.lyr_switcher = new OpenLayers.Control.LayerSwitcher();
	//this.map.addControl(this.lyr_switcher);
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
	this.popup = feature.createPopup(false);
	this.popup.setOpacity(0.9);
	this.popup.setBackgroundColor("white");
	this.popup.setContentHTML(html);
	marker = feature.createMarker();
	this.markers.addMarker(marker);
	marker.events.register("mousedown", feature, this.start_marker_click);
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
	if (current_popup != null) {
		if (current_popup == this.popup)
			closed = true;
		this.map.removePopup(current_popup);
		current_popup = null;	
	}
	if (current_popup == null && !closed) {
		current_popup = this.popup;
		this.map.addPopup(current_popup);
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
		this.sel_win = new Window('loc_select', {className: "bluelighting",  width:340, height:200, zIndex: 100, resizable: true, title: "Multiple Results, Select One", showEffect:Element.show, hideEffect: Effect.DropOut, destroyOnClose: true})
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
	this.sel_win.close();
}

function LoadWindow(){
	this.msg = "";
	//this.win = Window('load', {className: "bluelighting",  width:200, height:200, zIndex: 100, resizable: false, title: "", showEffect:Element.show, hideEffect: Effect.DropOut})
	this.win = new Window({className: "bluelighting", width:300, height:300, zIndex: 100, resizable: false, title: "Status", showEffect:Effect.BlindDown, hideEffect: Effect.DropOut, draggable:true})
}

LoadWindow.prototype.append_to_msg = function (str) {
	this.msg += '\n'+str;
	$('load_msg').update(this.msg);
}

LoadWindow.prototype.set_msg_and_show = function (msg) {
	this.set_msg(msg);
	this.show();
}

LoadWindow.prototype.set_msg = function (msg) {
	this.msg = "<div><div align='center' class='alert_progress'></div><div id='load_msg'>";
	this.msg += msg;
	this.msg += "</div><br/>";
	this.win.getContent().innerHTML(this.msg);
}

LoadWindow.prototype.show = function () {
	this.win.showCenter();	
}

LoadWindow.prototype.hide = function () {
	this.win.close();
}