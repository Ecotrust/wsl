
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
        	type: G_HYBRID_MAP, 
        	'maxZoomLevel':18, 
        	'sphericalMercator': true
        }
    );

    // create WMS layer
    //var wms = new OpenLayers.Layer.WMS(
    //    "World Map",
    //    "http://world.freemap.in/tiles/",
    //    {'layers': 'factbook-overlay', 'format':'png'},
    //    {
    //        'opacity': 0.4,
    //        'isBaseLayer': false,'wrapDateLine': true
    //    }
    //);

	//var base_map = new OpenLayers.Layer.WMS(
	//	"OpenLayers WMS", 
	//	"http://labs.metacarta.com/wms/vmap0", 
	//	{layers: 'basic'} );
			
	markers = new OpenLayers.Layer.Markers("Location");
    //vector = new OpenLayers.Layer.Vector("Editable Vectors");
    //map.addLayer(vector);	
	
	map.addLayers([gmap, markers]);
	map.addControl(new OpenLayers.Control.LayerSwitcher());
	map.addControl(new OpenLayers.Control.MousePosition());
	//map.addControl(new OpenLayers.Control.EditingToolbar(vector));
	
	//map.addControl(new OpenLayers.Control.PanZoomBar());	
	//size = new OpenLayers.Size(10,17);
	//offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	//map.setCenter(new OpenLayers.LonLat(-117,43), 3);
	
	//map.zoomToMaxExtent()
	map.setCenter(new OpenLayers.LonLat(-14255200,6600000), 4);
	//map.zoomTo(4);
}

//Wrong way to use a google base layer, cannot do vector drawing correctly.  From examples/google.html
function map_init_old() {
    map = new OpenLayers.Map( 
    	'map', 
    	{
    		controls: [new OpenLayers.Control.MouseDefaults()], 
    		'numZoomLevels':16
    	}
    );

    var gmap = new OpenLayers.Layer.Google( "Google Hybrid" , {type: G_HYBRID_MAP, 'maxZoomLevel':16} );
    map.addLayers([gmap]);
    
    layer = new OpenLayers.Layer.WMS( "OpenLayers WMS", 
            "http://labs.metacarta.com/wms/vmap0", {layers: 'basic', 'transparent':true}, 
              {isBaseLayer: false} );
    layer.setVisibility(false);
    
 	var twms = new OpenLayers.Layer.WMS( 
 		"World Map", 
 		"http://world.freemap.in/cgi-bin/mapserv?", 
        {
			map: '/www/freemap.in/world/map/factbooktrans.map', transparent:'true',
			layers: 'factbook', 'format':'png'
        }, {
        	'reproject': true
		} 
	);
    map.addLayer(twms);
    
    markers = new OpenLayers.Layer.Markers("markers");
    map.addLayer(markers);
    
    // create a vector layer for drawing
    var vector = new OpenLayers.Layer.Vector("Editable Vectors");
    map.addLayer(vector);

    //map.setCenter(new OpenLayers.LonLat(10.205188,48.857593), 5);
    map.setCenter(new OpenLayers.LonLat(-122,45), 5);
    map.addControl( new OpenLayers.Control.LayerSwitcher() );
    map.addControl( new OpenLayers.Control.PanZoomBar() );
    map.addControl( new OpenLayers.Control.MousePosition() );
    map.addControl(new OpenLayers.Control.EditingToolbar(vector));
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
	
	if (search_type == 'full' || search_type == 'detail') { 
		geocoder.geocode(search_type, search_form, process_search);
	} else if (search_type == 'ws_name') {
		var name = $('ws_name').value;
		level = 6;
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
		console.log("multiple results");
		location_selector = new LocationSelector();
		EventController.addEventListener("LocSelectEvent", location_search);
		location_selector.load_dialog(geo_result);
	} else {
		loc = geo_result.locations[0];
		console.log(loc);
		var lng = loc.lng;
		var lat = loc.lat;

		//Create location marker on map
		var loc_html = loc.address+"<br/>"+loc.city+", "+loc.state+", "+loc.zip+" "+loc.country;
		create_loc_marker(lng, lat, loc_html);
		
		//Complete location search
		location_search(loc);
	}
}

//Search for watershed given GeocoderLocation.
//Called via LocSelectEvent
function location_search(evt) {
	var location_result = evt.data;
	var lat = location_result.getLat();
	var lng = location_result.getLng();
	get_ws_by_location(lng, lat);
}

//Query watershed data given its name
function get_ws_by_name(name) {
	console.log(name)
}

//Query watershed data given a point location
function get_ws_by_location(lng, lat) {
	console.log(lng);
	console.log(lat);
}

//Process watershed query results, drawing polygon and loading tabular data
function load_ws_results(ws_results) {
	
}

function load_map_results(search_results) {
	var max_features = 200;
	var num_results = search_results.length;
	markers.clearMarkers();
	for (var i=0; i<search_results.length && i<max_features; i++) {
		create_feature(search_results[i]);
	}
}

function create_loc_marker(lng, lat, html) {
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
		var marker_html = address+"<br/>"+city+", "+state+", "+zip+" "+country;
		create_loc_marker(lng, lat, marker_html);
	}
	sel_html += "</table>";
	
	// Create window with scrollable text
	self.win = new Window('loc_select', {className: "bluelighting",  width:340, height:200, zIndex: 100, resizable: true, title: "Multiple Results, Select One", showEffect:Element.show, hideEffect: Effect.DropOut, destroyOnClose: true})
	
	//Load with location choices
	win.getContent().innerHTML= "<div style='padding:10px'>"+sel_html+"</div>";
	
	win.showCenter();
	
	//Load location choices onto map
}

LocationSelector.prototype.select = function (location_num) {
	console.log(location_num);
	var loc = this.georesult.getLocation(location_num);
	EventController.dispatchEvent("LocSelectEvent", new CustomEvent.Events.LocSelectEvent(loc));
}

LocationSelector.prototype.close = function () {
	self.win.close();
}