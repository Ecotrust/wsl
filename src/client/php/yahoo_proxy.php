<?php
/****************************************************************************
 * @copyright	2007 Ecotrust
 * @author		Tim Welch
 * @contact		twelch at ecotrust dot org
 * @license		GNU GPL 2 (See LICENSE.TXT for the full license)
 *  
 * @summary: Simple proxy script for Yahoo! Geocode API
 * Note: there is no error checking done on the input or return from Yahoo!
 * Takes either a free form 'location' variable or a set of variables. Returns
 * a JSON structure
 ***************************************************************************/

ini_set("display_errors","2");
ERROR_REPORTING(E_ALL);

require_once("JSON.php");
require_once('HttpRequest.php');
header('Content-type: text/plain');

$search_type = @$_REQUEST["search_type"];
$full_address = @$_REQUEST["full_address"];
$street = @$_REQUEST["street"];
$city   = @$_REQUEST["city"];
$state  = @$_REQUEST["state"];
$zip  = @$_REQUEST["zip"];

$url = 'http://api.local.yahoo.com/MapsService/V1/geocode?appid=ecotrust_us&output=php';
$params = "";

if ($search_type == 'full') {
	$params = '&location=' . urlencode($full_address);
} else if ($search_type == 'detail') {
	$params = '&street=' . urlencode($street) . '&city=' . urlencode($city) . 
			  '&state=' . urlencode($state) . '&zip=' . urlencode($zip);
}
$url .= $params;

$r = new HTTPRequest($url);
$serial_php_result = $r->DownloadToString();

//Convert serialized PHP result to JSON.  Inefficient... tried to unserialize
//the PHP result on the client but couldn't find a function to do it right
$php_result = unserialize($serial_php_result);
$json_service = new Services_JSON();
$json_result = $json_service->encode($php_result);
print $json_result;
?>