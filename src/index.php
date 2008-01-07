<?/**************************************************************************** * @copyright	2007 Ecotrust * @author		Tim Welch, Greg Robillard, Andrew Fuller * @contact		twelch at ecotrust dot org * @license		GNU GPL 2 (See LICENSE.TXT for the full license) *   * @summary: 	Basic wireframe for map archive.  Initializes map ***************************************************************************/include("includes/vars.php");include("includes/conn.php");include("includes/sql.php");//checking for authentication from above - if they're inside, they get entire mapbook//Browse (by ET program area, geo location, and map theme), Search text box (which covers title,theme, location, and notes fields)$full_address = $_REQUEST['full_address'];?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html xmlns="http://www.w3.org/1999/xhtml" debug="true"><head><title>Inforain: Watershed Locator</title><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"><!-- Stylesheets --><link href="../includes/inforain.css" rel="stylesheet" type="text/css"></link><link href="css/wsl.css" rel="stylesheet" type="text/css"></link><link href="window_themes/default.css" rel="stylesheet" type="text/css" ></link><link href="window_themes/alert.css" rel="stylesheet" type="text/css" ></link><link href="window_themes/lighting.css" rel="stylesheet" type="text/css" ></link><!--<script src="js/firebug/firebug.js"></script>--><!-- Mapping tools --><!--<script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=ecotrust_us"></script>--><script src='http://maps.google.com/maps?file=api&amp;v=2.93&amp;key=ABQIAAAArXicX4ul7tp-7E4_hRe1hhSLQIrkeWpb1ovWZ_1F8jZH-Ywn0hQQ6XnVuTdgxYsS2x_Syljg5D6qjQ'></script><script src="ol/OpenLayers.js"></script><!-- Watershed locator specific code --><script src="js/Wsl.js"></script><!-- Ecotrust tools --><script src="js/Geocoder.js"></script><script src="js/Geonamer.js"></script><script src="js/Util.js"></script><script src="../includes/inforain.js"></script><!-- Third party tools --><script src="js/json.js"></script><script src="js/php_unserialize.js"></script><script src="js/prototype.js"></script><!-- Prototype window/dialog add-on: prototype-window.xilinus.com --><script src="js/effects.js"> </script><script src="js/window.js"> </script><script src="js/window_effects.js"> </script><!-- Prototype custom event handler add-on like QT signals/slots mechanism --><script src="js/CustomEvents.js"> </script><script type="text/javascript">        <!--        //Global JS variables        var geocoder, current_popup, wsl, alertWin, load_win = null;		// avoid pink tiles		OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;		OpenLayers.Util.onImageLoadErrorColor = "transparent";		function main_init() {			wsl = new WSLocator();			wsl.map_init();			geocoder = new YahooGeocoder();			geonamer = new Geonamer();			load_win = new LoadWindow();			if ($F('full_address') != "") {				wsl.initial_search('locator_search_form', 'full');			}			Event.observe($('full_address'), 'keypress', function(event){ if(event.keyCode == Event.KEY_ENTER) alert('Enter Pressed');});		}				function check_submit(e, search_type) {			var keynum;			if(window.event) { //IE  				keynum = e.keyCode;  			} else if(e.which) { //Netscape/Firefox/Opera  				keynum = e.which;  			}			if (keynum==13) 				wsl.initial_search('locator_search_form', search_type);		}        // -->    </script></head><body onLoad="MM_preloadImages('images/ecotrust_project_over.gif'); main_init();"><div id="masthead"><a href="/"><img src="../images/inforain_logo.png" alt="Inforain" width="113" height="30" border="0" class="floatleft" /></a>  <? include("../includes/topnav.html"); ?>  <a href="http://www.ecotrust.org" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image3','','../images/ecotrust_project_over.gif',1)"><img src="../images/ecotrust_project.gif" alt="Ecotrust" name="Image3" width="149" height="30" border="0" class="floatright"></a></div><div id="contentwide">  <h1>Watershed Locator</h1>  <br />  <div id="ws_wrapper">    <div id='large_form_container' name='large_form_container'>      <h4>Search</h4>      <p>By address:<br />        <input size="18" type="text" maxlength="40" name="full_address" id="full_address" value="<?= $full_address ?>" class="form" onKeyPress="check_submit(event, 'full')">        <br />        <a href='javascript:void(0)' onclick='$("advanced_search_form").toggle()'>Advanced</a><br />        <input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'full')">      </p>      <div id='advanced_search_form' style='display: none'>        <p>Street address:<br />          <input size="18" type="text" maxlength="40" id="street" name="street" onKeyPress="check_submit(event, 'detail')">          City:<br />          <input size="18" type="text" maxlength="40" id="city" name="city" onKeyPress="check_submit(event, 'detail')">          <br />          State/Province:<br />          <input size="18" type="text" maxlength="40" id="state" name="state" onKeyPress="check_submit(event, 'detail')">          <br />          Postal Code:<br />          <input size="18" type="text" maxlength="40" id="zip" name="zip" onKeyPress="check_submit(event, 'detail')">          <br />          <input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'detail')">        </p>      </div>      <p align="center">--- OR ---</p>      <p>By placename:<br />        <input size="18" type="text" maxlength="40" name="placename" id="placename" class="form" onKeyPress="check_submit(event, 'placename')" value='Mt. St. Helens'>        <br />        <input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'placename')">      </p>      <p align="center">--- OR ---</p>      <p>By watershed:<br />        <select id='ws_region' name='ws_region' onChange="$('ws_name_row').show(); $('ws_name_submit_row').show()">          <option value=''></option>          <option value='us'>U.S.</option>          <option value='bc'>Canada B.C.</option>        </select>      </p>      <div id='ws_name_row' style='display: none'>        <p>Watershed name:<br />          <span style="position: relative; z-index: 24;">          <input type='text' id='ws_name' name='ws_name' onblur='closeSuggest()' onKeyUp="if ($F('ws_name').length > 1) wsl.ws_name_completion($F('ws_name'), $F('ws_region'));" onKeyPress="check_submit(event, 'ws_name')">          <span id='ws_name_suggest' name='ws_name_suggest'></span> </span></p>      </div>      <div id='ws_name_submit_row' style='display:none'>        <input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'ws_name')">      </div>    </div>    <div id="map_outer">      <div id="map"></div>    </div>    <div id='statsladder_outer'>    <div id='ws_stats'>      <h4>Watershed Stats</h4>      <div id='ws_stats_content'>No available watershed data</div>    </div>    <div id='ws_ladder'>      <h4>Watershed Ladder</h4>      <div id='ws_ladder_content'>No available watershed data<br />        <span class="caption">The smallest watershed level is shown first. Use this to select larger levels.</span></div>    </div>    </div>  </div></div><!--<div id="footer_breadcrumbwide">  <p class="breadcrumb"><strong>You are here:</strong><br />    <a href="/">Inforain.org</a> &raquo; Watershed Locator</p></div> --><div id="footer" class="smalltext">  <? include("../includes/bottomnav.html"); ?></div></body></html>