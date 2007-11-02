<?php
ini_set("display_errors","2");
ERROR_REPORTING(E_ALL);

require_once('HttpRequest.php');

//Expects result from server to be JSON
function query_remote_db($params="") {
	//Combine param keys and values intro strings
	$param_arr = array();
	foreach ($params as $key => $value) {
		$enc_param_str = urlencode($key)."=".urlencode($value);
		array_push($param_arr, $enc_param_str);
	}
	//Build the param string
	$param_str = implode('&', $param_arr);
	//Build the URL
	$URL = "http://pearl.ecotrust.org/apps/wsl/watershed_query.php?".$param_str;

	//Query the remote server
	$r = new HTTPRequest($URL);

	//Unpackage the result
	$result = $r->DownloadToString();
	if ($result) {
		$data = unserialize($result);
		return $data;
	} else {
		return null;
	}
}

function get_subwat_names() {
	$params = Array ('action'=>'get',
					 'function'=>'subwat_names'
					 );	
	$names = query_remote_db($params);
	return $names; 
}

print get_subwat_names();

?>