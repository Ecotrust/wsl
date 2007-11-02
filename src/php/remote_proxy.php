<?php
/******************************************************************************
* Used to connect to a remote server.  Gets around rule of 
* browsers not allowing requests outside of the current domain.  Note cURL 
* is not used.  This script should work with PHP4.  Note the QUERY_STRING
* variable name differs from PHP version to version.  Check phpinfo() if its
* not working for you, e.g. your GET params are not being passed on.
* 
* @copyright	2007 Ecotrust
* @author		Tim Welch
* @contact		twelch at ecotrust dot org
******************************************************************************/

require_once('HttpRequest.php');
header('Content-type: text/html');

ini_set("display_errors","2");
ERROR_REPORTING(E_ALL);

//Build the URL
$URL = "http://pearl.ecotrust.org/apps/wsl/watershed_query.php";
if (@$_SERVER["QUERY_STRING"])
	$URL .= "?".$_SERVER["QUERY_STRING"];

//Query the remote server
$r = new HTTPRequest($URL);

//Unpackage the result
$result = $r->DownloadToString();
print $result;
?>
