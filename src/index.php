<?/*basic wireframe for map archive landing pageneeds database access, random 3 maps, search, archiveneed sp to grab random maps*/include("includes/vars.php");include("includes/conn.php");include("includes/sql.php");//checking for authentication from above - if they're inside, they get entire mapbook//Browse (by ET program area, geo location, and map theme), Search text box (which covers title,theme, location, and notes fields)$full_address = $_REQUEST['full_address'];?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html xmlns="http://www.w3.org/1999/xhtml" debug="true"><head><title>Inforain: map archive</title><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"><!-- Stylesheets --><link href="../includes/inforain.css" rel="stylesheet" type="text/css"></link><link href="css/wsl.css" rel="stylesheet" type="text/css"></link><link href="window_themes/default.css" rel="stylesheet" type="text/css" ></link><link href="window_themes/alert.css" rel="stylesheet" type="text/css" ></link><link href="window_themes/lighting.css" rel="stylesheet" type="text/css" ></link><!-- Mapping tools -->
<!--<script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=ecotrust_us"></script>--><script src='http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAArXicX4ul7tp-7E4_hRe1hhSLQIrkeWpb1ovWZ_1F8jZH-Ywn0hQQ6XnVuTdgxYsS2x_Syljg5D6qjQ'></script><script src="ol/OpenLayers.js"></script><!-- Watershed locator specific code --><script src="js/Wsl.js"></script><!-- Ecotrust tools --><script src="js/Geocoder.js"></script>
<script src="js/Geonamer.js"></script><script src="js/Util.js"></script><script src="../includes/inforain.js" type="text/javascript"></script><!-- Third party tools --><script src="js/json.js"></script><script src="js/php_unserialize.js"></script><!--<script src="js/firebug/firebug.js"></script>--><script src="js/prototype.js"></script><!-- Prototype window/dialog add-on: prototype-window.xilinus.com --><script src="js/effects.js"> </script><script src="js/window.js"> </script><script src="js/window_effects.js"> </script><!-- Prototype custom event handler add-on like QT signals/slots mechanism --><script src="js/CustomEvents.js"> </script><script type="text/javascript">        <!--        //Global JS variables        var geocoder, wsl, current_popup, alertWin, load_win = null;		// avoid pink tiles		OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;		OpenLayers.Util.onImageLoadErrorColor = "transparent";		function main_init() {
			wsl = new WSLocator();			wsl.map_init();			geocoder = new YahooGeocoder();
			geonamer = new Geonamer();
			load_win = new LoadWindow();			if ($F('full_address') != "") {				wsl.initial_search('locator_search_form', 'full');			}  		}        // -->    </script></head><body onLoad="MM_preloadImages('images/ecotrust_project_over.gif'); main_init();"><div id="masthead"><a href="/"><img src="../images/inforain_logo.png" alt="Inforain" width="113" height="30" border="0" class="floatleft" /></a><? include("../includes/topnav.html"); ?>  <a href="http://www.ecotrust.org" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image3','','../images/ecotrust_project_over.gif',1)"><img src="../images/ecotrust_project.gif" alt="Ecotrust" name="Image3" width="149" height="30" border="0" class="floatright"></a></div><div id="content">  <h1>Watershed Locator</h1>  <br/>  <table>    <!-- Holds address forms table and map -->    <tr>      <td valign='top'><div id='large_form_container' name='large_form_container'> <h4>Search Form</h4>          <br/>            <p>            <table>              <tr>                <td align='right'>Full Address:</td>                <td align='right'><input size="20" type="text" maxlength="40" name="full_address" id="full_address" value="<?= $full_address ?>" class="form"></td>              </tr>              <tr>                <td></td>                <td align='right'><input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'full')"></td>              </tr>
              <tr>
                <td colspan='2' align='center'><a href='javascript:void(0)' onclick='$("advanced_search_form").toggle()'>Click For Advanced Address Search</a></td>
              </tr>
              <tr>
              <td colspan='2' align='center'>
              <div id='advanced_search_form' style='border: 1px solid; display: none'>
	              <table>	              <tr>	                <td colspan='2' align='center'><strong>-OR-</strong></td>	              </tr>	              <tr>	                <td align='right'>Street Address:</td>	                <td align='right'><input size="20" type="text" maxlength="40" id="street" name="street" value="" class="form"></td>	              </tr>	              <tr>	                <td align='right'>City:</td>	                <td align='right'><input size="20" type="text" maxlength="40" id="city" name="city" value="" class="form"></td>	              </tr>	              <tr>	                <td align='right'>State/Province:</td>	                <td align='right'><input size="20" type="text" maxlength="40" id="state" name="state" value="" class="form"></td>	              </tr>	              <tr>	                <td align='right'>Postal Code:</td>	                <td align='right'><input size="20" type="text" maxlength="40" id="zip" name="zip" value="" class="form"></td>	              </tr>	              <tr>	                <td></td>	                <td align='right'><input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'detail')"></td>	              </tr>
	              </table>
              </div>
              </td>
              </tr>              <tr>                <td colspan='2' align='center'><strong>-OR-</strong></td>              </tr>
              <tr>
                <td align='right'>Placename Search <br/>(eg. Mt. St. Helens):</td>
                <td align='right'><input size="20" type="text" maxlength="40" name="placename" id="placename" value="" class="form"></td>
              </tr>
              <tr>
                <td></td>
                <td align='right'><input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'placename')"></td>
              </tr>
              <tr>
                <td colspan='2' align='center'><strong>-OR-</strong></td>
              </tr>
              <tr>
                <td align='right'><input type="button" name="click_loc_button" value="Click Here First" class="form" onclick='wsl.turn_on_map_click_search()'></td>
                <td align='right'>
                  then click a location on the map
                </td>
              </tr>
			  <tr>
                <td colspan='2' align='center'><strong>-OR-</strong></td>
              </tr>			  <tr>
			    <td align='right'>Select a region:</td>
			    <td align='right'>
			      <select id='ws_region' name='ws_region' onChange="$('ws_name_row').show(); $('ws_name_submit_row').show()">
					<option value=''></option>
			        <option value='us'>U.S.</option>
			        <option value='bc'>Canada B.C.</option>
			      </select>
			    </td>
			  </tr>
              <tr id='ws_name_row' style='display: none'>                <td align='right'>Enter Partial<br/>Watershed Name:</td>
                <td align='right'>
                  <span style="position: relative; z-index: 24;">
                    <input type='text' id='ws_name' name='ws_name' onblur='closeSuggest()' onKeyUp="if ($F('ws_name').length > 1) wsl.ws_name_completion($F('ws_name'), $F('ws_region'));">
                    <span id='ws_name_suggest' name='ws_name_suggest'></span>
                  </span>
                </td>              </tr>              <tr id='ws_name_submit_row' style='display:none'>                <td></td>                <td align='right'><input type="submit" value="Search" class="button" onClick="wsl.initial_search('locator_search_form', 'ws_name')"></td>              </tr>            </table>
			<br/>
            *Note, this form will search for watershed data at the smallest level available first.  From there you can view larger level watersheds for a location by using the watershed ladder.            <p>        </div></td>      <td><div id="map"></div></td>    </tr>    <tr>      <td><div id='ws_stats'><h4>Watershed Stats</h4>          <div id='ws_stats_content'>Not Available</div>        </div></td>      <td><div id='ws_ladder'><h4>Watershed Ladder</h4>          <div id='ws_ladder_content'>Not Available</div>        </div></td>    </tr>  </table></div><div id="leftnav">  <? include("../includes/sidenav.html"); ?></div><div id="footer_breadcrumb">  <p class="breadcrumb"><strong>You are here:</strong><br />    <a href="/">Inforain.org</a> &raquo; Watershed Locator</p></div><div id="footer" class="smalltext">  <? include("../includes/bottomnav.html"); ?></div></body></html>