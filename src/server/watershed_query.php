<?php
/****************************************************************************
 * @copyright   2007 Ecotrust
 * @author      Tim Welch
 * @contact     twelch at ecotrust dot org
 * @license     GNU GPL 2 (See LICENSE.TXT for the full license)
 *  
 * @summary: 	Performs spatial queries given an action, a function, and any 
 * necessary input data
 ******************************************************************************/

/******************************** GLOBALS **********************************/
include_once('util_functions.php');
include_once("JSON.php");
include_once('../../../sec/wsl/config.php');

$db = pg_connect("dbname=$pg_db user=$pg_user host=$pg_host port=5432");

$us_ws_params = array();
$us_ws_params[0]['table'] = 'us_1st_field';
$us_ws_params[0]['name'] = 'reg_n';
$us_ws_params[0]['part_id_field'] = 'first';
$us_ws_params[0]['whole_id_field'] = 'region';
$us_ws_params[0]['level'] = 1;

$us_ws_params[1]['table'] = 'us_2nd_field';
$us_ws_params[1]['name'] = 'subr_n';
$us_ws_params[1]['part_id_field'] = 'second';
$us_ws_params[1]['whole_id_field'] = 'subreg';
$us_ws_params[1]['level'] = 2;

$us_ws_params[2]['table'] = 'us_3rd_field';
$us_ws_params[2]['name'] = 'bas_n';
$us_ws_params[2]['part_id_field'] = 'third';
$us_ws_params[2]['whole_id_field'] = 'basin';
$us_ws_params[2]['level'] = 3;

$us_ws_params[3]['table'] = 'us_4th_field';
$us_ws_params[3]['name'] = 'subbas_n';
$us_ws_params[3]['part_id_field'] = 'fourth';
$us_ws_params[3]['whole_id_field'] = 'subbas';
$us_ws_params[3]['level'] = 4;

$us_ws_params[4]['table'] = 'us_5th_field';
$us_ws_params[4]['name'] = 'water_n';
$us_ws_params[4]['part_id_field'] = 'fifth';
$us_ws_params[4]['whole_id_field'] = 'waters';
$us_ws_params[4]['level'] = 5;

$us_ws_params[5]['table'] = 'us_6th_field';
$us_ws_params[5]['name'] = 'subwat_n';
$us_ws_params[5]['part_id_field'] = 'sixth';
$us_ws_params[5]['whole_id_field'] = 'subwat';
$us_ws_params[5]['level'] = 6;

$bc_ws_params[0]['table'] = 'bc_3rd_field_equivalent';
$bc_ws_params[0]['name'] = 'basin_n';
$bc_ws_params[0]['part_id_field'] = 'third';
$bc_ws_params[0]['level'] = 3;

$bc_ws_params[1]['table'] = 'bc_4th_field_equivalent';
$bc_ws_params[1]['name'] = 'subbas_n';
$bc_ws_params[1]['part_id_field'] = 'fourth';
$bc_ws_params[1]['level'] = 4;

$bc_ws_params[2]['table'] = 'bc_6th_field_equivalent';
$bc_ws_params[2]['name'] = 'subwat_n';
$bc_ws_params[2]['part_id_field'] = 'sixth';
$bc_ws_params[2]['level'] = 6;

$yukon_ws_params[0]['table'] = 'yukon_3rd_field_equivalent';
$yukon_ws_params[0]['name'] = 'bas_n';
$yukon_ws_params[0]['part_id_field'] = 'third';
$yukon_ws_params[0]['level'] = 3;

$yukon_ws_params[1]['table'] = 'yukon_4th_field_equivalent';
$yukon_ws_params[1]['name'] = 'subb_n';
$yukon_ws_params[1]['part_id_field'] = 'fourth';
$yukon_ws_params[1]['level'] = 4;

//Get request variables
$action = $_REQUEST['action'];
$func = $_REQUEST['func'];
$result = null;
$error;

switch($func) {
 case 'get_initial_ws_data_by_location':
   $lng = $_REQUEST['lng'];
   $lat = $_REQUEST['lat'];

   //Validate
   if (!isNumeric($lng)) {
     $error = "Invalid longitude";
   } else if (!isNumeric($lat)) {
     $error = "Invalid latitude";
   }
   
   if (!$error)
     $result = get_initial_ws_data_by_location($lng, $lat);
   else
     $result->error = $error;
   break;

 case 'get_ws_lyr_data_by_location':
   $lng = $_REQUEST['lng'];
   $lat = $_REQUEST['lat'];
   $lyr_num = $_REQUEST['lyr_num'];
   $region = $_REQUEST['region'];

   //Validate
   if (!isNumeric($lng)) {
     $error = "Invalid longitude";
   } else if (!isNumeric($lat)) {
     $error = "Invalid latitude";
   } else if (!isInt($lyr_num)) {
     $error = "Invalid layer number";
   } else if (!isRegion($region)) {
     $error = "Invalid region";
   }

   if (!$error)
     $result = get_ws_lyr_data_by_location($lng, $lat, $lyr_num, $region);
   else
     $result->error = $error;
   break;

 case 'get_ws_lyr_data_by_id':
   $id = $_REQUEST['id'];
   $lyr_num = $_REQUEST['lyr_num'];
   $region = $_REQUEST['region'];

   //Validate
   if (!isAlphNumSp($id)) {
     $error = "Invalid id";
   } else if (!isInt($lyr_num)) {
     $error = "Invalid layer number";
   } else if (!isRegion($region)) {
     $error = "Invalid region";
   }

   if (!$error)
     $result = get_ws_lyr_data_by_id($id, $lyr_num, $region);
   else
     $result->error = $error;
   break;

 case 'search_ws_by_partial_name':
   $name = $_REQUEST['name'];
   $region = $_REQUEST['region'];
   
   //Validate
   if (!isAlphNumSp($name)) {
     $error = "Invalid partial name";
   } else if (!isRegion($region)) {
     $error = "Invalid region";
   }   
   
   if (!$error)
     $result = search_ws_by_partial_name($name, $region);
   else
     $result->error = $error;
   break;
}

$json_service = new Services_JSON();
$result_json = $json_service->encode($result);
print $result_json;

/****************************** MAIN FUNCTIONS *******************************/

function get_initial_ws_data_by_location($lng, $lat) {
  $ws_data = null;  //Object to hold all 
  $ws_level_data = array();
  $in_ws = false;
  $in_bc = false;
  $in_yukon = false;

  $in_ws = check_if_in_ws_bound($lng, $lat);
  if ($in_ws) {
    $in_us = check_if_in_us($lng, $lat);
    if (!$in_us) {
      $in_bc = check_if_in_bc($lng, $lat);
      if (!$in_bc) 
        $in_yukon = check_if_in_yukon($lng, $lat);
    }
  }

  if ($in_ws) {
    if ($in_us) {
      $ws_data->region = 'us';
      $level_data = get_initial_us_ws_data_by_location($lng, $lat);
      $ws_data->ws_level_data = $level_data;
    } else if ($in_bc) {
      $ws_data->region = 'bc';
      $level_data = get_initial_bc_ws_data_by_location($lng, $lat);
      $ws_data->ws_level_data = $level_data;
    } else if ($in_yukon) {
      $ws_data->region = 'yukon';
      $level_data = get_initial_yukon_ws_data_by_location($lng, $lat);
      $ws_data->ws_level_data = $level_data;
    }

    if (!$ws_data->ws_level_data) {
      $ws_data->error = "No watershed data found at this location";
    }
  } else {
    $ws_data->error = "Your location is outside the watershed boundary where no data is available. Please try another.";
  }

  return $ws_data;
}

function get_ws_lyr_data_by_location($lng, $lat, $lyr_num, $region) {
  $ws_lyr_data = null;  //Object to hold all 

  switch ($region) {
  case 'us':
    $ws_lyr_data = get_us_ws_lyr_data_by_location($lng, $lat, $lyr_num);
    break;
  case 'bc':
    $ws_lyr_data = get_bc_ws_lyr_data_by_location($lng, $lat, $lyr_num);
    break;
  case 'yukon':
    $ws_lyr_data = get_yukon_ws_lyr_data_by_location($lng, $lat, $lyr_num);
    break;
  }
  return $ws_lyr_data;
}

function get_ws_lyr_data_by_id($id, $lyr_num, $region) {
  $ws_lyr_data = null;  //Object to hold all 

  switch ($region) {
  case 'us':
    $ws_lyr_data = get_us_ws_lyr_data_by_id($id, $lyr_num);
    break;
  case 'bc':
    $ws_lyr_data = get_bc_ws_lyr_data_by_id($id, $lyr_num);
    break;
  case 'yukon':
    $ws_lyr_data = get_yukon_ws_lyr_data_by_id($id, $lyr_num);
    break;
  }
  return $ws_lyr_data;
}

function search_ws_by_partial_name($name, $region) {
  global $us_ws_params;
  global $bc_ws_params;
  global $yukon_ws_params;
  $ws_data = array();  //Object to hold all 
  $table_name = "";
  $name_field = "";

  switch ($region) {
  case 'us':
    $table_name = $us_ws_params[5]['table'];
    $name_field = $us_ws_params[5]['name'];
    $level = 6;
    break;
  case 'bc':
    $table_name = $bc_ws_params[2]['table'];
    $name_field = $bc_ws_params[2]['name'];
    $level = 6;
    break;
  case 'yukon':
    $table_name = $yukon_ws_params[1]['table'];
    $name_field = $yukon_ws_params[1]['name'];
    $level = 4;
    break;
  }

  $name = pg_escape_string($name);

  $sql = "SELECT gid, $name_field as name,
            x(centroid(the_geom)) as lng, 
            y(centroid(the_geom)) as lat
          FROM $table_name
          WHERE $name_field ILIKE '%$name%'
          LIMIT 10";
  $result = pg_query($sql);
  
  $i=0;
  while ($row = pg_fetch_object($result)) {
    $ws_data[$i]['gid'] = $row->gid;
    $ws_data[$i]['name'] = $row->name;
    $ws_data[$i]['lng'] = $row->lng;
    $ws_data[$i]['lat'] = $row->lat;
    $i++;
  }
  return $ws_data;
}

/********************************* Other Functions **********************************/

function check_if_in_ws_bound($lng, $lat) {
  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);
  $sql = "SELECT gid FROM
          watershed_boundary
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
  $result = pg_query($sql);
  $row = null;
  $row = pg_fetch_object($result);
  
  if ($row && $row->gid != null) {
    return true;
  } else {
    return false;
  }
}

function check_if_in_us($lng, $lat) {
  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);
  $sql = "SELECT gid FROM
          us_watershed_outline
          where WITHIN(GeomFromText('POINT($lng $lat)',-1), the_geom) LIMIT 1";
  $result = pg_query($sql);
  $row = null;
  $row = pg_fetch_object($result);
  if ($row && $row->gid != null) {
    return true;
  } else {
    return false;
  }
}

function check_if_in_bc($lng, $lat) {
  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);
  $sql = "SELECT gid FROM
          bc_watershed_outline
          where WITHIN(GeomFromText('POINT($lng $lat)',-1), the_geom) LIMIT 1";
  $result = pg_query($sql);
  $row = null;
  $row = pg_fetch_object($result);
  if ($row && $row->gid != null) {
    return true;
  } else {
    return false;
  }
}

function check_if_in_yukon($lng, $lat) {
  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);
  $sql = "SELECT gid FROM
          yukon_watershed_outline
          where WITHIN(GeomFromText('POINT($lng $lat)',-1), the_geom) LIMIT 1";
  $result = pg_query($sql);
  $row = null;
  $row = pg_fetch_object($result);
  if ($row && $row->gid != null) {
    return true;
  } else {
    return false;
  }
}

//Returns gid, name and bounds of default US level 6 and names of 5 other levels
//at the given location (level 6 knows about the 5 levels above it.  
//With all this info client can zoom to level 6, give detailed 6 info
//and build the ladder in order to search other watersheds.
function get_initial_us_ws_data_by_location($lng, $lat) {
  global $us_ws_params;
  $num_levels = count($us_ws_params);
  $last = $num_levels-1;
  $ws_level_data = array();
  $result = null;

  //Search watershed layers from 6 to 1 (5 to 0 actually) in order until we find some data.  Fail if none.
  for ($i=$last; $i>=0; $i--) {
    //Get full field data for last available and id's for 1 to last.
    $name = $us_ws_params[$i]['name'];
    $table = $us_ws_params[$i]['table'];
    $field_names = get_all_us_ws_id_fields_by_level($i);

    $lng = pg_escape_string($lng);
    $lat = pg_escape_string($lat);

    $sql = "select gid, $field_names, $name as name, 
          shape_leng, shape_area, stream_mil,
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          leed_sqft, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table 
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
    $result = pg_query($sql);

    if (pg_num_rows($result)>0) {
      $last = $i;  //Update last available level
      break;
    } else if ($i==0) {
      return null;
    }
  }

  $row = pg_fetch_array($result);
  if (!$row['gid'])
    return null;

  //Query lower levels using id segments from 6th field.  Lower level id segments are not unique to a level, have to build complete id up to that level.
  $part_ids = array();
  for ($j=0; $j<=$last; $j++) {
    //Get level specific id
    $part_id_field = $us_ws_params[$j]['part_id_field'];
    $part_id = $row[$part_id_field];
    array_push($part_ids, $part_id);

    //build complete id
    $whole_id = build_ws_id_by_level($part_ids, $j);
    //print "wholeid:$whole_id   ";
    
    //Query name using complete id
    $whole_id_field = $us_ws_params[$j]['whole_id_field'];
    $name_field = $us_ws_params[$j]['name'];
    $table = $us_ws_params[$j]['table'];
    $ws_level_data[$j]['level'] = $us_ws_params[$j]['level'];

    if ($part_id == "XX") {  //'XX' == no data available at that level
      $ws_level_data[$j]['name'] = null;
      $ws_level_data[$j]['id'] = null;
      $ws_level_data[$j]['id_field'] = null;
    } else {
      $sql = "select $name_field from $table where $whole_id_field = '$whole_id'";
      //print $sql. "   ";
      $result = pg_query($sql);
      $name_row = pg_fetch_array($result);

      if (!$name_row || !$name_row[$name_field])
	continue;
      else {
	//print "     ".$name_row[$name_field]."     ";
	$ws_level_data[$j]['name'] = $name_row[$name_field];
	$ws_level_data[$j]['id'] = $whole_id;
	$ws_level_data[$j]['id_field'] = $whole_id_field;
      }
    }
  }  
  $ws_level_data[$last] = $ws_level_data[$last]+$row;
  return $ws_level_data;
}

//Returns string of ws field names available at the current level
//Returned string is ready to be put into an SQL query.
function get_all_us_ws_param_names_by_level($level) {
  global $us_ws_params;
  $ws_name_str = "";
  for ($i=0; $i<=$level; $i++) {
    $field_name = $us_ws_params[$i]['name'];
    if ($i==0) {
      $ws_name_str .= $field_name;
    } else {
      $ws_name_str .= ", $field_name";
    }
  }
  return $ws_name_str;
}

function get_all_us_ws_id_fields_by_level($level) {
  global $us_ws_params;
  $ws_field_str = "";
  for ($i=0; $i<=$level; $i++) {
    $field_id = $us_ws_params[$i]['part_id_field'];
    if ($i==0) {
      $ws_field_str .= $field_id;
    } else {
      $ws_field_str .= ", $field_id";
    }
  }
  return $ws_field_str;
}

function build_ws_id_by_level($ids, $level) {
  $id = "";
  for ($i=0; $i<=$level; $i++) {
    $id .= $ids[$i];
  }
  return $id;
}

function get_us_ws_lyr_data_by_location($lng, $lat, $lyr_num) {
  global $us_ws_params;
  $name = $us_ws_params[$lyr_num]['name'];
  $table = $us_ws_params[$lyr_num]['table'];

  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);

  $sql = "select gid, $name as name, shape_leng, shape_area,
          stream_mil, leed_sqft, 
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
  $result = pg_query($sql);

  $row = pg_fetch_array($result);
  $row['level'] = $us_ws_params[$lyr_num]['level'];
  return $row;
}

//Match on whole watershed id
function get_us_ws_lyr_data_by_id($id, $lyr_num) {
  global $us_ws_params;

  $name = $us_ws_params[$lyr_num]['name'];
  $table = $us_ws_params[$lyr_num]['table'];
  $whole_id_field = $us_ws_params[$lyr_num]['whole_id_field'];

  $num_us_levels = count($us_ws_params);
  if ($lyr_num < 0 || $lyr_num > $num_us_levels-1) {
    $ws_data->error = "Invalid layer number for region";
    return $ws_data;
  }  

  $id = pg_escape_string($id);

  $sql = "select gid, $name as name, shape_leng, shape_area,
          stream_mil, leed_sqft, 
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table
          where $whole_id_field = $id LIMIT 1";
  $result = pg_query($sql);

  if (!$row = pg_fetch_array($result)) {
    $ws_data->error = "Search failed, check id";
    return $ws_data;
  }

  $row['level'] = $us_ws_params[$lyr_num]['level'];
  $row['id'] = $id;
  $row['id_field'] = $whole_id_field;
  return $row;
}

/*************************** BC Functions ****************************/

function get_initial_bc_ws_data_by_location($lng, $lat) {
  global $bc_ws_params;
  global $us_ws_params;
  $num_bc_levels = count($bc_ws_params);
  $num_us_levels = count($us_ws_params);
  $last = $num_bc_levels-1;
  $ws_level_data = array();
  $result = null;
  //Search watershed layers in order 6,4,3 (indexes 2,1,0) until we find some data.  Fail if none.
  for ($i=$last; $i>=0; $i--) {
    //Get full field data for last available and id's for 1 to last.
    $name = $bc_ws_params[$i]['name'];
    $table = $bc_ws_params[$i]['table'];
    $field_names = get_all_bc_ws_id_fields_by_level($i);

    $lng = pg_escape_string($lng);
    $lat = pg_escape_string($lat);

    //Get full field data for last available and id's for other levels
    $sql = "select gid, $field_names, $name as name, 
            shape_leng, shape_area, stream_mil, road_mi,
            population, households, min_dams, maj_dams, 
            dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
            public_sqm, elev_min, elev_max, leed_bldg, 
            leed_sqft, 
            ymin(box3d(the_geom)) as bottom,
            xmax(box3d(the_geom)) as right,
            ymax(box3d(the_geom)) as top,
            xmin(box3d(the_geom)) as left
            from $table
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
    $result = pg_query($sql);

    if (pg_num_rows($result)>0) {
      $last = $i;  //Update last available level
      break;
    } else if ($i==0) {
      return null;
    }
  }

  $row = pg_fetch_array($result);
  if (!$row['gid'])
    return null;

  //Query lower level id's from 6th field.  Can assume lower level id's are unique
  $part_ids = array();
  $result_index = null;
  for ($j=0; $j<$num_bc_levels; $j++) {
    $result_index = $j+$num_us_levels;
    //Get level unique ws id
    $part_id_field = $bc_ws_params[$j]['part_id_field'];
    $part_id = $row[$part_id_field];
    
    //Query name using id
    $name_field = $bc_ws_params[$j]['name'];
    $table = $bc_ws_params[$j]['table'];
    $ws_level_data[$result_index]['level'] = $bc_ws_params[$j]['level'];
    if ($part_id == "") {  //If no id then no data available at that level
      $ws_level_data[$result_index]['name'] = null;
      $ws_level_data[$result_index]['id'] = null;
      $ws_level_data[$result_index]['id_field'] = null;
    } else {
      $sql = "select $name_field from $table where $part_id_field = '$part_id'";
      $result = pg_query($sql);
      $name_row = pg_fetch_array($result);
      if (!$name_row || !$name_row[$name_field])
	continue;
      else {
	$ws_level_data[$result_index]['name'] = $name_row[$name_field];
	$ws_level_data[$result_index]['id'] = $part_id;
	$ws_level_data[$result_index]['id_field'] = $part_id_field;
      }
    }
  }  
  $ws_level_data[$result_index] = $ws_level_data[$result_index]+$row;
  return $ws_level_data;
}

function get_all_bc_ws_id_fields_by_level($level) {
  global $bc_ws_params;
  $ws_field_str = "";
  for ($i=0; $i<=$level; $i++) {
    $field_id = $bc_ws_params[$i]['part_id_field'];
    if ($i==0) {
      $ws_field_str .= $field_id;
    } else {
      $ws_field_str .= ", $field_id";
    }
  }
  return $ws_field_str;
}

function get_bc_ws_lyr_data_by_location($lng, $lat, $lyr_num) {
  global $us_ws_params;
  global $bc_ws_params;
  $num_us_levels = count($us_ws_params);
  $lyr_num -= $num_us_levels;

  $table = $bc_ws_params[$lyr_num]['table'];
  $name = $bc_ws_params[$lyr_num]['name'];
  $level = $bc_ws_params[$lyr_num]['level'];

  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);

  $sql = "select gid, $name as name,
          shape_leng, shape_area, stream_mil, road_mi,
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          leed_sqft, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
  $result = pg_query($sql);

  $row = pg_fetch_array($result);
  $row['level'] = $level;
  return $row;
}

//Match on unique part id
function get_bc_ws_lyr_data_by_id($id, $lyr_num) {
  global $us_ws_params;
  global $bc_ws_params;
  $num_us_levels = count($us_ws_params);
  $lyr_num = $lyr_num - $num_us_levels;

  if ($lyr_num < 0) {
    $ws_data->error = "Invalid layer number for region";
    return $ws_data;
  }  

  $name = $bc_ws_params[$lyr_num]['name'];
  $table = $bc_ws_params[$lyr_num]['table'];
  $part_id_field = $bc_ws_params[$lyr_num]['part_id_field'];
  $id = pg_escape_string($id);

  $sql = "select gid, $name as name, shape_leng, shape_area,
          stream_mil, leed_sqft, 
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table
          where $part_id_field = '$id' LIMIT 1";
  $result = pg_query($sql);

  if (!$row = pg_fetch_array($result)) {
    $ws_data->error = "Search failed, check id";
    return $ws_data;
  }

  $row['level'] = $bc_ws_params[$lyr_num]['level'];
  $row['id'] = $id;
  $row['id_field'] = $part_id_field;
  return $row;
}

/********************************** Yukon Functions ****************************/

//Returns gid, name and bounds of default Yukon level 4 and names of other level
//at the given location (level 4 knows about it level 3 parent.  
//With all this info client can zoom to level 4, give detailed 4 info
//and build the ladder in order to search other watersheds.
function get_initial_yukon_ws_data_by_location($lng, $lat) {
  global $yukon_ws_params;
  global $bc_ws_params;
  global $us_ws_params;
  $num_yukon_levels = count($yukon_ws_params);
  $num_bc_levels = count($bc_ws_params);
  $num_us_levels = count($us_ws_params);
  $last = $num_yukon_levels-1;
  $ws_level_data = array();
  $result = null;
  //Search watershed layers in order 6,4 (indexes 1,0) until we find some data.  Fail if none.
  for ($i=$last; $i>=0; $i--) {
    //Get full field data for last available and id's for 1 to last.
    $name = $yukon_ws_params[$i]['name'];
    $table = $yukon_ws_params[$i]['table'];
    $field_names = get_all_yukon_ws_id_fields_by_level($i);

    $lng = pg_escape_string($lng);
    $lat = pg_escape_string($lat);

    //Get full field data for last available and id's for other levels
    $sql = "select gid, $field_names, $name as name, 
            shape_leng, shape_area, stream_mil, road_mi,
            population, households, min_dams, maj_dams, 
            dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
            public_sqm, elev_min, elev_max, leed_bldg, 
            leed_sqft, 
            ymin(box3d(the_geom)) as bottom,
            xmax(box3d(the_geom)) as right,
            ymax(box3d(the_geom)) as top,
            xmin(box3d(the_geom)) as left
            from $table
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
    $result = pg_query($sql);

    if (pg_num_rows($result)>0) {
      $last = $i;  //Update last available level
      break;
    } else if ($i==0) {
      return null;
    }
  }

  $row = pg_fetch_array($result);
  if (!$row['gid'])
    return null;

  //Query lower level id's from 6th field.  Can assume lower level id's are unique
  $part_ids = array();
  $result_index = null;
  for ($j=0; $j<$num_yukon_levels; $j++) {
    $result_index = $j+$num_us_levels+$num_bc_levels;
    //Get level unique ws id
    $part_id_field = $yukon_ws_params[$j]['part_id_field'];
    $part_id = $row[$part_id_field];
    
    //Query name using id
    $name_field = $yukon_ws_params[$j]['name'];
    $table = $yukon_ws_params[$j]['table'];
    $ws_level_data[$result_index]['level'] = $yukon_ws_params[$j]['level'];
    if ($part_id == "") {  //If no id then no data available at that level
      $ws_level_data[$result_index]['name'] = null;
      $ws_level_data[$result_index]['id'] = null;
      $ws_level_data[$result_index]['id_field'] = null;
    } else {
      $sql = "select $name_field from $table where $part_id_field = '$part_id'";
      $result = pg_query($sql);
      $name_row = pg_fetch_array($result);
      if (!$name_row || !$name_row[$name_field])
	continue;
      else {
	$ws_level_data[$result_index]['name'] = $name_row[$name_field];
	$ws_level_data[$result_index]['id'] = $part_id;
	$ws_level_data[$result_index]['id_field'] = $part_id_field;
      }
    }
  }  
  $ws_level_data[$result_index] = $ws_level_data[$result_index]+$row;
  return $ws_level_data;
}

function get_all_yukon_ws_id_fields_by_level($level) {
  global $yukon_ws_params;
  $ws_field_str = "";
  for ($i=0; $i<=$level; $i++) {
    $field_id = $yukon_ws_params[$i]['part_id_field'];
    if ($i==0) {
      $ws_field_str .= $field_id;
    } else {
      $ws_field_str .= ", $field_id";
    }
  }
  return $ws_field_str;
}

function get_yukon_ws_lyr_data_by_location($lng, $lat, $lyr_num) {
  global $us_ws_params;
  global $bc_ws_params;
  global $yukon_ws_params;
  $num_us_levels = count($us_ws_params);
  $num_bc_levels = count($bc_ws_params);
  $lyr_num = $lyr_num-$num_us_levels-$num_bc_levels;

  $table = $yukon_ws_params[$lyr_num]['table'];
  $name = $yukon_ws_params[$lyr_num]['name'];
  $level = $yukon_ws_params[$lyr_num]['level'];

  $lng = pg_escape_string($lng);
  $lat = pg_escape_string($lat);

  $sql = "select gid, $name as name,
          shape_leng, shape_area, stream_mil, road_mi,
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          leed_sqft, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table
          where WITHIN(transform(GeomFromText('POINT($lng $lat)',4326), 96), the_geom) LIMIT 1";
  $result = pg_query($sql);

  $row = pg_fetch_array($result);
  $row['level'] = $level;
  return $row;
}

//Match on unique part id
function get_yukon_ws_lyr_data_by_id($id, $lyr_num) {
  global $us_ws_params;
  global $bc_ws_params;
  global $yukon_ws_params;
  $num_us_levels = count($us_ws_params);
  $num_bc_levels = count($bc_ws_params);
  $lyr_num = $lyr_num - $num_us_levels - $num_bc_levels;

  if ($lyr_num < 0) {
    $ws_data->error = "Invalid layer number for region";
    return $ws_data;
  }  

  $name = $yukon_ws_params[$lyr_num]['name'];
  $table = $yukon_ws_params[$lyr_num]['table'];
  $part_id_field = $yukon_ws_params[$lyr_num]['part_id_field'];

  $id = pg_escape_string($id);

  $sql = "select gid, $name as name, shape_leng, shape_area,
          stream_mil, leed_sqft, 
          population, households, min_dams, maj_dams, 
          dev_sqmi, farm_sqmi, forest_sqm, native_sqm, 
          public_sqm, elev_min, elev_max, leed_bldg, 
          ymin(box3d(the_geom)) as bottom,
          xmax(box3d(the_geom)) as right,
          ymax(box3d(the_geom)) as top,
          xmin(box3d(the_geom)) as left
          from $table
          where $part_id_field = '$id' LIMIT 1";
  $result = pg_query($sql);

  if (!$row = pg_fetch_array($result)) {
    $ws_data->error = "Search failed, check id";
    return $ws_data;
  }

  $row['level'] = $yukon_ws_params[$lyr_num]['level'];
  $row['id'] = $id;
  $row['id_field'] = $part_id_field;
  return $row;
}
?>