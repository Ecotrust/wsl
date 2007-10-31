<?/*basic wireframe for map archive landing pageneeds database access, random 3 maps, search, archiveneed sp to grab random maps*/include("includes/vars.php");include("includes/conn.php");//checking for authentication from above - if they're inside, they get entire mapbook//Browse (by ET program area, geo location, and map theme), Search text box (which covers title,theme, location, and notes fields)$full_address = $_REQUEST['full_address'];?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html xmlns="http://www.w3.org/1999/xhtml" debug="true"><head>	<title>Inforain: map archive</title>	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
	
	<!-- Stylesheets -->	<link href="../includes/inforain.css" rel="stylesheet" type="text/css"></link>
	<link href="window_themes/default.css" rel="stylesheet" type="text/css" ></link>
	<link href="window_themes/alert.css" rel="stylesheet" type="text/css" ></link>
	<link href="window_themes/lighting.css" rel="stylesheet" type="text/css" ></link>
	
	<!-- Mapping tools -->
	<script src='http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAArXicX4ul7tp-7E4_hRe1hhSLQIrkeWpb1ovWZ_1F8jZH-Ywn0hQQ6XnVuTdgxYsS2x_Syljg5D6qjQ'></script>    <script src="ol/OpenLayers.js"></script>
    
    <!-- Watershed locator specific code -->    <script src="js/map_functions.js"></script>
    
    <!-- Ecotrust tools -->
    <script src="js/YahooGeocoder.js"></script>
    <script src="js/GeocoderResult.js"></script>
    <script src="js/general_functions.js"></script>
    <script src="../includes/inforain.js" type="text/javascript"></script>

    <!-- Third party tools -->
    <script src="js/json.js"></script>      <script src="js/php_unserialize.js"></script>
    <script src="js/firebug/firebug.js"></script>    <script src="js/prototype.js"></script>
    <!-- Prototype window/dialog add-on: prototype-window.xilinus.com -->
	<script src="js/effects.js"> </script>
	<script src="js/window.js"> </script>
	<script src="js/window_effects.js"> </script>
	<!-- Prototype custom event handler add-on like QT signals/slots mechanism -->
	<script src="js/CustomEvents.js"> </script>
	    <script type="text/javascript">        <!--        //Global JS variables        var map, gmap, geocoder, markers, current_popup, size, offset, alertWin = null;
		// avoid pink tiles
		OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
		OpenLayers.Util.onImageLoadErrorColor = "transparent";
		function main_init() {			map_init();			geocoder = new YahooGeocoder();
			location_selector = new LocationSelector();
			if ($('full_address').value != "") {
				initial_search('locator_search_form');
			}  		}        // -->    </script></head><body onLoad="MM_preloadImages('images/ecotrust_project_over.gif'); main_init();"><div id="masthead"><a href="/"><img src="../images/inforain_logo.png" alt="Inforain" width="113" height="30" border="0" class="floatleft" /></a><? include("../includes/topnav.html"); ?><a href="http://www.ecotrust.org" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image3','','../images/ecotrust_project_over.gif',1)"><img src="../images/ecotrust_project.gif" alt="Ecotrust" name="Image3" width="149" height="30" border="0" class="floatright"></a></div><div id="content">	<h1>Watershed Locator</h1>	<table> <!-- Holds address forms table and map -->		<tr>		<td valign='top'>			<div id='large_form_container' name='large_form_container'>							<form id='locator_search_form' name='locator_search_form' method="post" onSubmit='return false'>					<table>						<tr><td align='right'>Full Address:</td><td align='right'><input size="20" type="text" maxlength="40" name="full_address" id="full_address" value="<?= $full_address ?>" class="form"></td></tr>						<tr><td></td><td align='right'><input type="submit" value="GO" class="button" onclick="initial_search('locator_search_form', 'full')"></td></tr>										<tr><td colspan='2' align='center'><strong>-OR-</strong></td></tr>						<tr><td align='right'>Street Address:</td><td align='right'><input size="20" type="text" maxlength="40" name="street" value="" class="form"></td></tr>						<tr><td align='right'>City:</td><td align='right'><input size="20" type="text" maxlength="40" name="city" value="" class="form"></td></tr>						<tr><td align='right'>State/Province:</td><td align='right'><input size="20" type="text" maxlength="40" name="state" value="" class="form"></td></tr>						<tr><td align='right'>Postal Code:</td><td align='right'><input size="20" type="text" maxlength="40" name="zip" value="" class="form"></td></tr>						<tr><td></td><td align='right'><input type="submit" value="GO" class="button" onclick="initial_search('locator_search_form', 'detail')"></td></tr>						<tr><td colspan='2' align='center'><strong>-OR-</strong></td></tr>						<tr><td align='right'>Watershed Name (Level 6):</td><td align='right'><select id='ws_name' name='ws_name'><option>Select One</option><option>Johnson Creek (OR)</option></select></td></tr>						<tr><td></td><td align='right'><input type="submit" value="GO" class="button" onclick="initial_search('locator_search_form', 'ws_name')"></td></tr>					</table>									</form>			  			</div>		</td>		<td>			<div id="map"></div>		</td>		</tr>
		<tr>
		<td>
			<div id='watershed_data'>Watershed data</div>
		</td>
		<td>
			<div id='huc_data'>Huc data</div>
		</td>
		</tr>	</table></div><div id="leftnav"> <? include("../includes/sidenav.html"); ?></div><div id="footer_breadcrumb"><p class="breadcrumb"><strong>You are here:</strong><br />    <a href="/">Inforain.org</a> &raquo; Watershed Locator</p></div><div id="footer" class="smalltext"><? include("../includes/bottomnav.html"); ?></div></body></html>