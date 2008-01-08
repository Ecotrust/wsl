/****************************************************************************
 * WSLocator class
 *
 * @copyright	2007 Ecotrust
 * @author		Tim Welch
 * @contact		twelch at ecotrust dot org
 * @license		GNU GPL 2 (See LICENSE.TXT for the full license)
 *  
 * @summary: 	manages map, searches and watershed data requests
 ***************************************************************************/

function WSLocator(){
	this.bmap = null;
	this.markers = null;
	this.lyr_switcher = null;
	this.ws_wms_lyr = null;
	this.point_loc_wkt = null;
	this.wkt = null;
	this.cur_ws_lyr_num;
	this.ws_data = null;
	this.ws_layers = [];
	this.load_msg = "";
	this.current_popup = null;
	this.cur_level_display = null;
	
	this.geocoder_search_string = "";
	this.placename_search_string = "";
	
	//Points to current SearchResult, GeocoderResult or GeonamerResult
	this.cur_search_result = null;
	
	this.num_levels = 11;
	this.us_ws_layer_nums = [0,1,2,3,4,5];
	this.bc_ws_layer_nums = [6,7,8];
	this.yukon_ws_layer_nums = [9,10];
	this.default_us_order = [5,4,3,2,1,0];
	this.default_bc_order = [8,7,6];
	this.default_yukon_order = [10,9];
	
	this.location_selector = new LocationSelector();

	var me = this;
	this.start_process_address_search = function (result) {
		me.process_address_search(result);
	}
	this.start_location_search = function (loc) {
		me.location_search(loc);
	}
	this.start_process_placename_search = function (result) {
		me.process_placename_search(result);
	}
	this.start_load_initial_ws_results = function (response) {
		me.load_initial_ws_results(response);
	}
	this.load_ws_name_completions = function (response) {
		me.do_load_ws_name_completions(response);
	}
	this.finish_level_change_event = function (response) {
		me.do_finish_level_change_event(response);
	}
	this.start_marker_click = function (evt) {
		me.marker_click(evt);
	}
	this.map_click_search = function (e) {
		me.do_map_click_search(e);
	}
	
	EventController.addEventListener("GeocodeReturnEvent", this.start_process_address_search);
	EventController.addEventListener("GeonameReturnEvent", this.start_process_placename_search);
	EventController.addEventListener("LocSelectEvent", this.start_location_search);
}

//Initialize the OL map, map controls, and WMS layers
//        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
//                                         20037508, 20037508.34)
//        maxExtent: new OpenLayers.Bounds(-18017940, 2759070,
//                                         -12840605, 12582146),
WSLocator.prototype.map_init = function() {
    this.options = {
        projection: "EPSG:900913",
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20017940, 3561354, -12300000, 11545048)
    };

    this.map = new OpenLayers.Map('map', this.options);

    //Google base map
    this.bmap = new OpenLayers.Layer.Google(
        "Google Terrain Base Layer",
        {
        	type: G_PHYSICAL_MAP,
 			'wrapDateLine':true,
        	'maxZoomLevel':16, 
        	'sphericalMercator': true
        }
    );


    // Yahoo base map
//    this.bmap = new OpenLayers.Layer.Yahoo(
//        "Base Map",
//        {
//        	'sphericalMercator': true
//        }
//    );

	//SN boundary layer for initial load
	this.sn_boundary = new OpenLayers.Layer.WMS.Untiled(
		'Salmon Nation Boundary', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'sn_visual_boundary',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913'
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);


	//US Watershed WMS layers
	us_1_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US 1st Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_watersheds',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'us_1st_field',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[0] = us_1_wms_lyr;

	us_2_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US 2nd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_watersheds',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'us_2nd_field',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[1] = us_2_wms_lyr;

	us_3_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US 3rd Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_watersheds',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'us_3rd_field',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[2] = us_3_wms_lyr;

	us_4_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US 4th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_watersheds',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'us_4th_field',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[3] = us_4_wms_lyr; 

	us_5_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US 5th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_watersheds',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'us_5th_field',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[4] = us_5_wms_lyr;

	us_6_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US 6th Field Watershed', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_watersheds',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'us_6th_field',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[5] = us_6_wms_lyr;

	//BC Watershed WMS Layers
	bc_3_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'BC Watershed (US 3rd Field Equivalent)', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'bc_3rd_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'bc_3rd_field_equivalent',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[6] = bc_3_wms_lyr;

	bc_4_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'BC Watershed (US 4th Field Equivalent)', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'bc_4th_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'bc_4th_field_equivalent',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[7] = bc_4_wms_lyr;

	bc_6_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'BC Watershed (US 6th Field Equivalent)', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'bc_6th_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'bc_6th_field_equivalent',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[8] = bc_6_wms_lyr;

	//Yukon WMS layers

	yukon_3_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'Yukon Watersheds (US 3rd Field Equivalent)', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'yukon_3rd_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'yukon_3rd_field_equivalent',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[9] = yukon_3_wms_lyr;
	
	yukon_4_wms_lyr = new OpenLayers.Layer.WMS.Untiled(
		'Yukon Watersheds (US 4th Field Equivalent)', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'yukon_4th_field_equivalent',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913',
			table: 'yukon_4th_field_equivalent',
			bbox: null,
			gid: null
		},
		{
			isBaseLayer: false, 
			opacity: 0.3} 
	);
	this.ws_layers[10] = yukon_4_wms_lyr;

	this.us_pnw_streams_lyr = new OpenLayers.Layer.WMS.Untiled(
		'US Pacific Northwest Streams', 
		"http://pearl.ecotrust.org/cgi-bin/mapserv?map=/var/www/html/apps/wsl/wsl.map", 
		{
			layers: 'us_pnw_streams',
			transparent: 'true',
			format: 'image/gif',
			srs: 'epsg:900913'
		},
		{
			isBaseLayer: false, 
			opacity: 0.7} 
	);
	this.markers = new OpenLayers.Layer.Markers("Your Location");
	this.map.addLayers([this.bmap, this.sn_boundary, this.us_pnw_streams_lyr, this.markers]);
	this.lyr_switcher = new OpenLayers.Control.LayerSwitcher();	
	this.map.addControl(this.lyr_switcher);
	this.map.addControl(new OpenLayers.Control.MousePosition());
	this.map.setCenter(new OpenLayers.LonLat(-15791278,7703140), 3);
	this.wkt = new OpenLayers.Format.WKT();
	
	Event.observe('OpenLayers_Control_PanZoom_zoomworld_innerImage', 'click', this.show_sn_boundary.bindAsEventListener(this));
	
    this.map.events.register(
    	"click", 
    	this.map, 
    	wsl.map_click_search
    );
}

/************************* Search ******************************/

WSLocator.prototype.initial_search = function (search_form, search_type) {
	//Clear any markers on map
	load_win.set_msg_and_show("Starting search...");
	this.clear_markers();
	
	switch (search_type) {

		case 'full': 
			load_win.append("Geocoding address...");
			geocoder.geocode(
				search_type, 
				{full_address: $F('full_address')}
			); 
			break;
		case 'detail':
			load_win.append("Geocoding address...");
			geocoder.geocode(
				search_type, 
				{
					street: $F('street'), 
					city: $F('city'),
					state: $F('state'),
					zip: $F('zip')
				}
			);
			break;
		case 'placename':
			this.placename_search_string = $F('placename'); 
			geonamer.placename_search(this.placename_search_string);
			break;
		case 'ws_name':
			if ($F('ws_name').length > 1) {
				var name = $F('ws_name');
				var region = $F('ws_region');
				if (name && region)
					var name = this.ws_name_data[this.cur_ws_name_index].name;
					var lng = this.ws_name_data[this.cur_ws_name_index].lng;
					var lat = this.ws_name_data[this.cur_ws_name_index].lat;
					var lonlat = OpenLayers.Layer.SphericalMercator.inverseMercator(lng, lat);
					var desc = name+"<br/>("+(lonlat.lon).toFixed(4)+","+(lonlat.lat).toFixed(4)+")";
					var ws_loc = new SearchResult(desc, lonlat.lon, lonlat.lat);
					this.location_search(ws_loc);	
			}
			break;
	}
}

/************************* Address Search ******************************/

//Process geocode query result
WSLocator.prototype.process_address_search = function (geo_result) {
	var num_locations = geo_result.locations.length;
	if (num_locations < 1) {
		load_win.append("<b>Geocoder returned no results, please try again.</b>");
	} else if (num_locations > 1) {
		//Too many results
		load_win.append("Geocoder returned multiple results...");
		load_win.hide();
		var div = $('loc_select');
		this.show_sn_boundary();
		this.map.zoomToMaxExtent();
		this.location_selector.load_dialog(geo_result);
	} else {
		var loc = geo_result.locations[0];
		load_win.append("Geocoding successful ("+loc.getLngStr(2)+","+loc.getLatStr(2)+")...");
		this.create_search_marker(loc);
		
		//Complete location search
		this.location_search(loc);
	}
}

//Search for watershed given GeocoderLocation.
//Called via LocSelectEvent
WSLocator.prototype.location_search = function (loc) {
	this.cur_search_result = loc;
	
	//Create marker for geocoded point
	if (this.markers.markers.length > 0) {
		this.clear_markers();
	}
	this.create_search_marker(this.cur_search_result);
	
	//Generate WKT of geocoded point
	var the_pt = new OpenLayers.Geometry.Point(this.cur_search_result.lng, this.cur_search_result.lat);
    the_pt = new OpenLayers.Feature.Vector(the_pt);
	this.point_loc_wkt = this.wkt.write(the_pt);

	//Get ws_data including bounds
	this.get_initial_ws_data_by_location(this.cur_search_result.lng, this.cur_search_result.lat);
}

/******************************* Map Click Search ****************************/

WSLocator.prototype.do_map_click_search = function (e) {
	//this.map.events.unregister("click", this.map, this.map_click_search);
    var lonlat = wsl.map.getLonLatFromViewPortPx(e.xy);
	lonlat = OpenLayers.Layer.SphericalMercator.inverseMercator(lonlat.lon, lonlat.lat);
	var desc = "You selected ("+(lonlat.lon).toFixed(4)+","+(lonlat.lat).toFixed(4)+")";
	load_win.set_msg_and_show(desc);
	var click_loc = new SearchResult(desc, lonlat.lon, lonlat.lat);
	this.location_search(click_loc);
}

/******************************* Geoname Search ****************************/

//Process placename search result
WSLocator.prototype.process_placename_search = function (result_set) {
	result_set.update({search_string: this.placename_search_string});
	
	if (!result_set.success || result_set.num_results < 1) {
		load_win.append("<b>Placename search returned no results, please try again.</b>");
	} else if (result_set.num_results > 1) {
		//Too many results
		load_win.append("Placename search returned multiple results...");
		load_win.hide();
		var div = $('loc_select');
		this.show_sn_boundary();
		this.map.zoomToMaxExtent();
		this.location_selector.load_dialog(result_set);
	} else {
		var geo_result = result_set.geonames[0];
		
		load_win.append("Geoname search successful ("+geo_result.getLngStr(2)+","+geo_result.getLatStr(2)+")...");
		this.create_search_marker(geo_result);
		
		//Complete geoname search
		this.location_search(geo_result);
	}
}

/***************************** Watershed Name Search *************************/

//Given a partial ws name, search for possible completions
WSLocator.prototype.ws_name_completion = function (name, region) {
    request = new OpenLayers.Ajax.Request('php/ws_search_proxy.php',
    {
            parameters: 'action=get&func=search_ws_by_partial_name&name='+name+'&region='+region,
            method: 'get',
            onSuccess: this.load_ws_name_completions,
            onFailure: this.default_fail
    });
}

WSLocator.prototype.do_load_ws_name_completions = function (transport) {
	//Extract ws data
	var response = transport.responseText;
	
	//Set global ws data
	this.ws_name_data = parseJSON(response);
	
	var html = "";
    for (var i=0;i< this.ws_name_data.length;i++) {
      // for every ws name record we create a html div 
      // each div gets an id using the array index for later retrieval 
      // define mouse event handlers to highlight places on mouseover
      // and to select a place on click
      // all events receive the postalcode array index as input parameter
      html += "<div class='suggestions' id=name"+i+" onmousedown='suggestDown("+i+")' onmouseover='suggestOver("+i+")' onmouseout='suggestOut("+i+")'>"+this.ws_name_data[i].name+'</div>';
    }
    $('ws_name_suggest').update(html);
	$('ws_name_suggest').style.visibility = "visible";
}

//Hide suggestion list
function closeSuggest() {
  $('ws_name_suggest').innerHTML = '';
  $('ws_name_suggest').style.visibility = 'hidden';
}

//Remove highlight
function suggestOut(num) {
  $('name'+ num).className = 'suggestions';
}

//Load user selection in ws_name input
function suggestDown(num) {
  closeSuggest();
  $('ws_name').value = wsl.ws_name_data[num].name;
  wsl.cur_ws_name_index = num;
}

//Highlight ws name
function suggestOver(num) {
	var cur = $('name'+ num); 
  	cur.className = 'suggestionMouseOver';
}

/************************************ Other *********************************/

//Query watershed data given its name
WSLocator.prototype.get_ws_by_name = function (name) {
	//console.log(name)
}

//Query watershed data given a point location
WSLocator.prototype.get_initial_ws_data_by_location = function (lng, lat) {

	load_win.append("Searching watersheds...");
    request = new OpenLayers.Ajax.Request('php/ws_search_proxy.php',
    {
            parameters: 'action=get&func=get_initial_ws_data_by_location&lng='+lng+'&lat='+lat,
            method: 'get',
            onSuccess: this.start_load_initial_ws_results,
            onFailure: this.default_fail
    });
}

//Query watershed data given a point location, region and level 
WSLocator.prototype.get_ws_lyr_data_by_location = function (lat, lng, region, lyr_num, callback) {
    request = new OpenLayers.Ajax.Request('php/ws_search_proxy.php',
    {
            parameters: 'action=get&func=get_ws_lyr_data_by_location&lng='+lng+'&lat='+lat+"&lyr_num="+lyr_num+"&region="+region,
            method: 'get',
            onSuccess: callback,
            onFailure: this.default_fail
    });
}

//Query watershed data given its unique watershed id
WSLocator.prototype.get_ws_lyr_data_by_id = function (id, region, lyr_num, callback) {
    request = new OpenLayers.Ajax.Request('php/ws_search_proxy.php',
    {
            parameters: 'action=get&func=get_ws_lyr_data_by_id&id='+id+"&lyr_num="+lyr_num+"&region="+region,
            method: 'get',
            onSuccess: callback,
            onFailure: this.default_fail
    });
}

WSLocator.prototype.default_fail = function (response) {
	load_win.append("<b>Request failed: "+response+"<br/>");
}

//Process initial watershed query results. load default level stats, build
//ladder with other level names, load default level WMS layer
WSLocator.prototype.load_initial_ws_results = function (transport) {
	//Extract ws data
	var response = transport.responseText;
	
	//Set global ws data
	var new_ws_data = parseJSON(response);
	
	//console.log(new_ws_data);
	
	if (!new_ws_data) {
		load_win.append("<b>Watershed search returned no results.</b>");
		return;
	} else if (new_ws_data.error) {
		load_win.append("<b>"+new_ws_data.error+"</b>");
		this.show_sn_boundary();
		return;
	} else {
		this.hide_sn_boundary();
		this.ws_data = new_ws_data;
	}

	this.rem_cur_ws_wms_lyr();
	var success = this.set_initial_ws_lyr();
	if (!success) {
		load_win.append("<b>Incomplete watershed results returned</b>");
		return false;
	}

	//Zoom to watershed polygon
	this.zoom_to_cur_ws();

	load_win.append("Loading watershed results");
	
	var cur_ws_data = this.get_cur_ws_data();
	var cur_ws_lyr = this.get_cur_ws_lyr();
	
	//Update cur WMS layer params
	this.update_ws_wms_params();

	//Add WMS layers to map
	this.add_ws_wms_lyr(this.cur_ws_lyr_num);
	
	var ws_html = this.gen_ws_stats_html(cur_ws_data);
	$('ws_stats_content').update(ws_html);

	//Build watershed 'ladder' for current location
	var ws_ladder_html = "<table id='ws_ladder_table'><tr><th>Level</th><th>Name</th><th></th></tr>";
	for (var i=0; i<this.num_levels; i++) {
		if (this.ws_data.ws_level_data[i]) {
			var data = this.ws_data.ws_level_data[i];
			ws_ladder_html += "<tr align='center'><td class='cur_level_reg' id='level_"+data.level+"_td'>"+data.level+"</td><td>"+data.name+"</td><td><input type='button' class='button' value='Go To' onclick='wsl.level_change_event("+i+"); wsl.toggle_cur_level_display(\"level_"+data.level+"_td\")'></td></tr>";
		}
	}
	ws_ladder_html += "</table>";
	$('ws_ladder_content').update(ws_ladder_html);
	this.set_initial_level_display();
	load_win.close_in(.25);
}


WSLocator.prototype.set_initial_level_display = function () {
	//get cur ws level
	var data = this.get_cur_ws_data();
	var level = data.level;
	//build ws id name
	var name = "level_"+level+"_td";

	//set style
	$(name).setStyle({background: '#d28400'});
	this.cur_level_display = $(name);
}

WSLocator.prototype.toggle_cur_level_display = function (name) {
	if (this.cur_level_display)
		this.cur_level_display.setStyle({background: '#ffffff'});
	$(name).setStyle({background: '#d28400'});
	this.cur_level_display = $(name);
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

WSLocator.prototype.set_ws_level_data = function (ws_lyr_num, ws_level_data) {
	if (ws_lyr_num != null)
		this.ws_data.ws_level_data[ws_lyr_num] = ws_level_data;
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

// Set initial watershed layer based on whether US or BC
// and what layers are available
// So, assumes watershed data has already been queried 
// Assumes that at least one level contains full data
// If the server returned no good watershed data then it should
// have errored and the client should never have gotten here
WSLocator.prototype.set_initial_ws_lyr = function (transport) {
	var region = this.get_cur_region();
	if (!region) return;
	switch(this.ws_data.region) {
		case 'us':
			//Search through levels for data
			for (var i=0; i<this.default_us_order.length;i++) {
				var cur_ws_data = this.get_ws_data_by_index(this.default_us_order[i]);
				//If the gid isn't there then it's not really loaded so skip it
				if (cur_ws_data != null && cur_ws_data.gid != null) {
					this.cur_ws_lyr_num = this.default_us_order[i];
					return true;
				}
			}
			break;
		case 'bc':
			//Search through levels for data
			for (var i=0; i<this.default_bc_order.length;i++) {
				var cur_ws_data = this.get_ws_data_by_index(this.default_bc_order[i]);
				//If the gid isn't there then it's not really loaded so skip it
				if (cur_ws_data != null && cur_ws_data.gid != null) {
					this.cur_ws_lyr_num = this.default_bc_order[i];
					return true;
				}
			}
			break;
		case 'yukon':
			//Search through levels for data
			for (var i=0; i<this.default_yukon_order.length;i++) {
				var cur_ws_data = this.get_ws_data_by_index(this.default_yukon_order[i]);
				//If the gid isn't there then it's not really loaded so skip it
				if (cur_ws_data != null && cur_ws_data.gid != null) {
					this.cur_ws_lyr_num = this.default_yukon_order[i];
					return true;
				}
			}
			break;
	}
	return false;
}

WSLocator.prototype.level_change_event = function (new_ws_lyr_num) {
	if (new_ws_lyr_num != this.cur_ws_lyr_num) {
		this.hide_sn_boundary();
		load_win.set_msg_and_show("Searching watersheds...");
		//Update WMS layer params with ws id and bounds
		this.rem_cur_ws_wms_lyr();
		this.cur_ws_lyr_num = new_ws_lyr_num;
		//Fetch watershed data
		//this.get_ws_lyr_data_by_location(this.cur_search_result.lat, this.cur_search_result.lng, this.get_cur_region(), new_ws_lyr_num, this.finish_level_change_event);
		var new_ws_data = this.get_cur_ws_data();
		this.get_ws_lyr_data_by_id(new_ws_data.id, this.get_cur_region(), new_ws_lyr_num, this.finish_level_change_event);
	}
}

//Given new watershed data for current level: add, load and zoom
//Assumes new ws level and layer has already been set, only the new
//data needs to be loaded
WSLocator.prototype.do_finish_level_change_event = function (transport) {
	//Extract ws data
	var response = transport.responseText;
	//Store ws data
	var ws_level_data = parseJSON(response);
	//console.log(ws_level_data);
	this.set_ws_level_data(this.cur_ws_lyr_num, ws_level_data);
	//Update cur WMS layer params
	this.update_ws_wms_params();
		
	if (!ws_level_data) {
		load_win.append("<b>Watershed search returned no results. Please try another level</b>");
		return;
	} else if (ws_level_data.error) {
		load_win.append("<b>"+ws_level_data.error+"</b>");
		return;
	}

	load_win.append("Loading watershed results");

	this.add_ws_wms_lyr(this.cur_ws_lyr_num);
	this.zoom_to_cur_ws(); 
	this.update_stats();
	load_win.close_in(.25);	
}

WSLocator.prototype.update_stats = function () {
	//Update stats
	var ws_html = this.gen_ws_stats_html(this.get_cur_ws_data());
	$('ws_stats_content').update(ws_html);
}

//Updates the WMS params for the current WS layer
WSLocator.prototype.update_ws_wms_params = function () {
	var ws_lyr = this.get_cur_ws_lyr();
	var ws_data = this.get_cur_ws_data();
	
	var left = parseFloat(ws_data['left']).toFixed(3);
	var bottom = parseFloat(ws_data['bottom']).toFixed(3);
	var right = parseFloat(ws_data['right']).toFixed(3);
	var top = parseFloat(ws_data['top']).toFixed(3);
	var bbox_str = left+','+bottom+','+right+','+top;
	ws_lyr.mergeNewParams({bbox: bbox_str, gid: ws_data.gid});
}

WSLocator.prototype.gen_ws_stats_html = function (ws_level_data) {
	var ws_name, ws_leng, ws_area, ws_html = null;
	ws_leng = parseFloat(ws_level_data.shape_leng).toFixed(3);	//3 decimal places
	ws_area = parseFloat(ws_level_data.shape_area).toFixed(3);	//3 decimal places
	
	//Put together current ws level stats
	ws_html = "<table class='ws_stats_table'>";
	ws_html += "<tr><td align='right'><b>Name:</b></td><td>"+ws_level_data.name+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Level:</b></td><td>"+ws_level_data.level+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Perimeter (miles):</b></td><td>"+ws_leng+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Area (sq.miles):</b></td><td>"+ws_area+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Min. Elevation (feet):</b></td><td>"+ws_level_data.elev_min+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Max. Elevation (feet):</b></td><td>"+ws_level_data.elev_max+"</td></tr>";
	ws_html += "</table>";
	ws_html += "<table class='ws_stats_table'>";
	ws_html += "<tr><td align='right'><b>Population:</b></td><td>"+ws_level_data.population+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Households:</b></td><td>"+ws_level_data.households+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Development (sq.miles):</b></td><td>"+ws_level_data.dev_sqmi+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Farmland (sq.miles):</b></td><td>"+ws_level_data.farm_sqmi+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Forestland (sq.miles):</b></td><td>"+ws_level_data.forest_sqm+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Native land (sq.miles):</b></td><td>"+ws_level_data.native_sqm+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Public land (sq.miles):</b></td><td>"+ws_level_data.public_sqm+"</td></tr>";
	ws_html += "</table>";	
	ws_html += "<table class='ws_stats_table'>";
	ws_html += "<tr><td align='right'><b>Anadromous Streams (miles):</b></td><td>"+ws_level_data.stream_mil+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Minor Dams:</b></td><td>"+ws_level_data.min_dams+"</td></tr>";
	ws_html += "<tr><td align='right'><b>Major Dams:</b></td><td>"+ws_level_data.maj_dams+"</td></tr>";
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
	if (cur_lyr && this.map.getLayerIndex(cur_lyr) >= 0) {
		this.map.removeLayer(cur_lyr);
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

WSLocator.prototype.hide_sn_boundary = function() {
	if (this.map.getLayerIndex(this.sn_boundary) >= 0)
		this.map.removeLayer(this.sn_boundary);
}

WSLocator.prototype.show_sn_boundary = function() {
	if (this.map.getLayerIndex(this.sn_boundary) == -1) {
		this.rem_cur_ws_wms_lyr();
		this.map.addLayer(this.sn_boundary);
		this.map.raiseLayer(this.markers, 1);
	}
}

//Given a SearchResult creates a marker
WSLocator.prototype.create_search_marker = function (search_loc) {
	var lng = search_loc.lng;
	var lat = search_loc.lat;

	
	//Create location marker on map

	//Convert wgs84 to mercator meters
	var lonlat = this.sphere_to_merc(lng,lat);
	//var lonlat = new OpenLayers.LonLat(lng,lat);
	var popupSize = new OpenLayers.Size(80,80);
//	var icon = new OpenLayers.Icon('/wiser.png',size,offset);
	feature = new OpenLayers.Feature(this.bmap, lonlat);
	var popup = feature.createPopup(false);
	feature.my_popup = popup;
	popup.setOpacity(0.9);
	popup.setBackgroundColor("white");
	popup.setContentHTML(search_loc.description);
	marker = feature.createMarker();
	this.markers.addMarker(marker);
	marker.events.register("click", popup, this.marker_click);
}

//Convert spherical coordinates (wgs84) into mercator projects used
//by commercial map tile providers.
WSLocator.prototype.sphere_to_merc = function (lng, lat) {
	return OpenLayers.Layer.SphericalMercator.forwardMercator(parseFloat(lng), parseFloat(lat));
}

//Project global mercator to spherical coordinates (wgs84) used
//by commercial map tile providers.
WSLocator.prototype.merc_to_sphere = function (lng, lat) {
	return OpenLayers.Layer.SphericalMercator.inverseMercator(parseFloat(lng), parseFloat(lat));
}

WSLocator.prototype.zoom_to = function (lng, lat, zoom_level) {
	//var lnglat = new OpenLayers.LonLat(lng,lat);
	var lnglat = this.sphere_to_merc(lng, lat);
	this.map.setCenter(lnglat, zoom_level);
}

WSLocator.prototype.marker_click = function (evt) {
/*	var closed = false;
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
*/
	var is_closed = false;
	if (wsl.current_popup != null) {
		if (wsl.current_popup == this)
			is_closed = true;
		wsl.map.removePopup(wsl.current_popup);
		wsl.current_popup = null;
	}
		
	if (current_popup == null && !is_closed) {
		wsl.current_popup = this;
		wsl.map.addPopup(this, true);
	}
	OpenLayers.Event.stop(evt);
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
 * SearchResult class
 *
 * Holds basic info about the current search location.  Just a basic type.
 * Essentially a subset of GeocoderResult or GeonamerResult.  This should
 * probably become a parent class 
/***************************************************************************/
function SearchResult(description, lng, lat) {
	this.type = 'basic';
	this.description = description;
	this.lng = lng;
	this.lat = lat;
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

LocationSelector.prototype.load_dialog = function (search_results) {
	var sel_html = null;
	
	if (!search_results) {
		alert('Location Selector: search result not found');
	}
	this.search_results = search_results;
	//console.log(search_results.type);
	
	switch (search_results.type) {
		case 'GeocoderResultSet':
			sel_html = "<table cellspacing='8'>";
			sel_html += "<tr><td colspan='2'>"+search_results.numLocations()+" matches returned";
			for (var i=0; i<search_results.numLocations(); i++) {
				var loc = search_results.getLocation(i);
				var lng = loc.lng;
				var lat = loc.lat;
				var description = loc.description;
				var address = loc.address;
				var city = loc.city;
				var state = loc.state;
				var zip = loc.zip;
				var country = loc.country;				

				var max_extent = wsl.map.getMaxExtent();
				var within_map = max_extent.containsLonLat(wsl.sphere_to_merc(lng,lat)); 
				if (true) {
					//Add selection entry
					sel_html += "<tr>";
					sel_html += "<td><input type='button' class='button' value='Select' id='"+i+"' onclick='wsl.location_selector.select(this.id); wsl.location_selector.close()'>";
					sel_html += " <input type='button' class='button' value='View On Map' id='"+i+"' onclick='wsl.zoom_to("+lng+", "+lat+", 13)'></td>";
					sel_html += "<td>"+address+"<br/>";
					sel_html += city+", "+state+", "+zip+" "+country+"</td>";
					sel_html += "</tr>";
			
					//Add marker
					wsl.create_search_marker(loc);
				}
			}
			sel_html += "</table>";
			break;
		case 'GeonamerResultSet':
			var num_in_map = 0;
			
			sel_html = "<table cellspacing='8'>";
			sel_html += "<tr><td colspan='2'>First "+search_results.num_results+" matches returned";
			
			for (var i=0; i<search_results.num_results; i++) {
				var geoname = search_results.getResult(i);
				var max_extent = wsl.map.getMaxExtent();
				var within_map = max_extent.containsLonLat(wsl.sphere_to_merc(geoname.lng,geoname.lat));
				if (within_map) {
					num_in_map++;
					geoname.within_map = within_map;
				}				
			}
			sel_html += "<tr><td colspan='2'>"+num_in_map+" of those results are within <a href='http://salmonnation.com'>Salmon Nation</a><br/>";	
			for (var i=0; i<search_results.num_results; i++) {
				var geoname = search_results.getResult(i);
				var lng = geoname.lng;
				var lat = geoname.lat;
				var description = geoname.description;

				if (geoname.within_map) {	
					num_in_map++;	
					//Add selection entry 
					sel_html += "<tr>";
					sel_html += "<td><input type='button' class='button' value='Select' id='"+i+"' onclick='wsl.location_selector.select(this.id); wsl.location_selector.close()'>";
					sel_html += " <input type='button' class='button' value='View On Map' id='"+i+"' onclick='wsl.zoom_to("+lng+", "+lat+", 13)'></td>";
					sel_html += "<td>"+geoname.name+"</td>";
					sel_html += "</tr>";
			
					//Add marker
					wsl.create_search_marker(geoname);
				}
			}
			
			if (num_in_map == 0)
			
			sel_html += "</table>";
			break;
	}
	
	// Create window with scrollable text
	if (!$('loc_select')) {
		this.sel_win = new Window('loc_select', {className: "bluelighting",  width:340, height:200, zIndex: 100, resizable: true, title: "Multiple Results, Select One", hideEffect: Effect.Fade, destroyOnClose: true})
	}
	
	//Load with location choices
	this.sel_win.getContent().innerHTML= "<div style='padding:10px'>"+sel_html+"</div>";
	this.sel_win.showCenter();	
}

LocationSelector.prototype.select = function (location_num) {
	wsl.hide_sn_boundary();
	switch (this.search_results.type) {
		case 'GeocoderResultSet':
			var result = this.search_results.getLocation(location_num);
			load_win.append("Selected location at ("+result.getLngStr(2)+","+result.getLatStr(2)+")");
			EventController.dispatchEvent("LocSelectEvent", new CustomEvent.Events.LocSelectEvent(result));
			break;
		case 'GeonamerResultSet':
			var result = this.search_results.getResult(location_num);
			load_win.append("Selected '"+result.name+"' at ("+result.getLngStr(2)+","+result.getLatStr(2)+")");
			EventController.dispatchEvent("LocSelectEvent", new CustomEvent.Events.LocSelectEvent(result));
			break;
	}
	load_win.show();
}

LocationSelector.prototype.close = function () {
	this.sel_win.close();
}

function LoadWindow(){
	this.msg_cont = "";
	this.msg = "";
	this.win = new Window({className: "bluelighting", width:300, height:160, zIndex: 100, resizable: false, title: "Status", showEffect: Effect.Appear, draggable:true})

	var me = this;
	this.close_in = function (x) {
		me.do_close_in(x);
	}
}

LoadWindow.prototype.append = function (str) {
	this.msg += '<br/>'+str;
	var load_msg = $('load_msg');
	if (!load_msg)
		this.set_msg_and_show(str);
	else
		load_msg.update(this.msg);
}

LoadWindow.prototype.set_msg_and_show = function (msg) {
	this.set_msg(msg);
	this.show();
}


LoadWindow.prototype.set_msg = function (msg) {
	this.msg = msg;	
	this.msg_cont = "<div><div align='center' class='alert_progress'></div><div id='load_msg'>";
	this.msg_cont += this.msg;
	this.msg_cont += "</div><br/>";
	this.win.getContent().innerHTML = this.msg_cont;
}

LoadWindow.prototype.show = function () {
	this.win.showCenter();	
}

LoadWindow.prototype.hide = function () {
	this.win.close();
}

//Hide the window after x seconds
LoadWindow.prototype.do_close_in = function (x) {
	setTimeout('load_win.hide()',x*1000)
}