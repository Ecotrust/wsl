<?php
include_once("php/JSON.php");
header('Content-type: text/plain');

function query_db() {
	//Query Pearl PostGIS database
	$URL="http://pearl.ecotrust.org/apps/watershed_locator/watershed_query.php";
	if ($_SERVER["REDIRECT_QUERY_STRING"])
		$URL .= "?".$_SERVER["REDIRECT_QUERY_STRING"];
	$result = file_get_contents($URL);
	
	if ($result) {
		$loc_data = unserialize($result);
		return $loc_data;
	} else {
		return null;
	}
}



$json_service = new Services_JSON();
$result_json = $json_service->encode($search_results);
print $result_json;
?>