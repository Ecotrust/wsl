function watershed_search(geometry) {
	request = new OpenLayers.Ajax.Request('mysql_wiser_search.php', 
	{
		parameters: $('watershed_address').serialize(), 
		method: 'get',
		onSuccess: process_search_result,
		onFailure: alert_fail
	});
}

function process_search_result(transport) {
	var response = transport.responseText;
	var search_results = parseJSON(response);

	//Generate search result text and display on page
	load_text_results(search_results);
	
	//Load results onto OpenLayers map
	load_map_results(search_results);
}

function alert_fail(transport) {
	alert(transport.responseText);
}

function load_text_results(tab_results) {
	var num_results = tab_results.length;
	var search_html = num_results +" Results:<br/><br/>";
	
	for (var i=0; i<tab_results.length; i++) {
		search_html += "ID: "+tab_results[i].id+"<br/>";
		search_html += "Name: "+tab_results[i].name+"<br/>";
		if (tab_results[i].address_1)
			search_html += "Address: "+tab_results[i].address_1;
		if (tab_results[i].address_2)
			search_html += " "+tab_results[i].address_2;
		if (tab_results[i].city)
			search_html += ", "+tab_results[i].city;
		if (tab_results[i].state)
			search_html += ", "+tab_results[i].state;
		if (tab_results[i].postal_code)
			search_html += ", "+tab_results[i].postal_code;
		if (tab_results[i].province)
			search_html += ", "+tab_results[i].province;
		if (tab_results[i].country)
			search_html += ", "+tab_results[i].country;
		
		search_html += "<br/><br/>";
	}		
	$('search_results').update(search_html);
}