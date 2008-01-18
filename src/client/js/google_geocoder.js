 /***********************************************************************
 * @file          google_geocoder.js
 *
 * $Id: google_geocoder.js 93 2006-12-21 22:16:29Z tim_j_welch $
 * $URL: https://map-fu.svn.sourceforge.net/svnroot/map-fu/trunk/includes/Javascript/google_geocoder.js $
 *
 * @project       Map-Fu
 *
 * This project was developed as part of the Oregon Sustainable
 * Community Digital Library (OSCDL) by Academic & Research Computing
 * at Portland State University with support by Oregon State
 * Library grants 245020, 245021.  Special thanks to Rose Jackson and 
 * the OSCDL project.
 *
 * @contributors  Tim Welch
 *
 * Copyright (c) 2006, Academic & Research Computing,
 * Portland State University, Portland Oregon.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 * 
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *
 *    * Neither the names of Academic and Research Computing or Portland
 *      State University nor the names of their contributors may be used
 *      to endorse or promote products derived from this software
 *      without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 ***********************************************************************/ 

/****************************************************************************
 * This file contains the class google_geocoder.  It provides an API
 * for using the google maps geocoder service.  This class should be
 * used indirectly via the GeocoderClient class which provides a
 * common interface for the client and service to use.  This class
 * stores its results into a GeocoderResult object and returns it to
 * the caller.
 *
 * Requirements:
 *
 * A google maps javascript file is expected to already have been
 * loaded, providing the geocoder API
 *
 * Configuration variables expected:
 * - google_geo_res_type: the type of result the geocoder should return
 * 
 ***************************************************************************/

//Google geocoder accuracy constants
var ACC_UNKNOWN = 0;
var ACC_COUNTRY = 1;
var ACC_REGION = 2;
var ACC_SUBREGION = 3;
var ACC_TOWN = 4;
var ACC_ZIP = 5;
var ACC_STREET = 6;
var ACC_INTERSECTION = 7;
var ACC_ADDRESS = 8;

//Google geocoder status constants
var STATUS_SUCCESS = 200;
var STATUS_SERVER_ERROR = 500;
var STATUS_MISSING_ADDRESS = 601;
var STATUS_UNKNOWN_ADDRESS = 602;
var STATUS_ADDRESS_UNAVAILABLE = 603;
var STATUS_INVALID_KEY = 610;

function google_geocoder() {
  //"me" points to "this" and allows a method called via a callback to
  //have access to its attributes.  "this" points to the document
  //object in this scenario
  var me = this;

  //process_start() is a dummy callback function which uses "me" to
  //invoke the real process function and bring all of the object
  //attribute back into scope
  this.process_start = function (result) {
    me.process(result);
  }

  this.geocoder = null;  //geocoder object
  this.callback = null;  //callback function passed by geocoder client
  this.address = null;   //address to geocode

  //get the name of the geocoder function to use. also specifies in
  //what format the results are returned
  this.geocode_func_name = google_geo_res_type;

  //Create new geocoder using google API
  if (GClientGeocoder) {
    this.geocoder = new GClientGeocoder();
  } else {
    return false;   
  }
  return true;
}

/****************************************************************************
 * geocode(function, string) 
 *
 * Makes a geocoding request given an address ("123 45th St. Boston, MA
 * 12345") and a callback function which is saved for the
 * processor to invoke at a later time and pass back the results.
 ***************************************************************************/
google_geocoder.prototype.geocode = function(callback, address) {
  if (!callback || !address) 
    error.print("callback or address not provided to google_geocoder.geocode()");

  this.callback = callback;
  this.address = address;

  //Use the configured method to make the geocode request
  var eval_string = "this.geocoder." + this.geocode_func_name + "(address, this.process_start);";
  eval(eval_string);
  return true;
}

/****************************************************************************
 * process(GLatLng or JSON object) 
 *
 * Further processes the result of a geocode request, which comes as
 * either a GLatLng or a JSON object.  The data is extracted and
 * stuffed into a GeocoderResult and returned to the GeocoderClient
 * via the saved callback function
 ***************************************************************************/
google_geocoder.prototype.process = function (result) {
  switch (google_geo_res_type) {
  case "getLocations":
    this.processLocations(result);
    break;
  case "getLatLng":
    this.processLatLng(result);
    break;
  }
}

/****************************************************************************
 * processLocations(JSON object) 
 *
 * Extracts geocoder results and loads them into a GeocoderResult
 * object. Invokes the callback function passing back the result.
 ***************************************************************************/
google_geocoder.prototype.processLocations = function(result) {

  var num_result = 0;
  var address, status, statusStr, accuracy, accuracyStr, scale, map_units = null;
  var geoResult = new GeocoderResult();

  //If no result
  if (!result) {
    geoResult.setSuccess(false);
    this.callback(geoResult);
  } else {
    //If result
    geoResult.setAddress(result.name);
    geoResult.setSuccess(this.getSuccess(result.Status.code));
    geoResult.setStatus(result.Status.code);
    geoResult.setStatusStr(this.getStatusStr(result.Status.code));
    
    map_units = currentMapState.getUnits();
    
    if (result.Placemark) {
      //Extract 1 or more locations returned in geocode response
      for (var i=0; i<result.Placemark.length; i++) {
        cur_p = result.Placemark[i];
        accuracy = cur_p.AddressDetails.Accuracy;
        accuracyStr = this.getAccuracyStr(accuracy);
        scale = this.calcScale(accuracy);
        geoResult.addLocation(cur_p.address, 
                              cur_p.Accuracy,
                              accuracyStr,
                              scale,
                              cur_p.Point.coordinates[1], 
                              cur_p.Point.coordinates[0],
                              i+1);
      }
//Locations for testing features
/*
      geoResult.addLocation("Somewhere within the map area", 
                            cur_p.Accuracy,
                            accuracyStr,
                            scale,
                            45.50, 
                            -122.69,
                            4);
*/
/*
      geoResult.addLocation("Somewhere outside the map area", 
                            cur_p.Accuracy,
                            accuracyStr,
                            scale,
                            49, 
                            -128,
                            4);
*/
    }
  }
  this.callback(geoResult);
}

/****************************************************************************
 * processLatLng(GLatLng) 
 *
 * Extracts the data from the single GLatLng result returned by the
 * geocoder and loads it into a GeocoderResult object. Invokes the
 * callback function passing back the result.
 ***************************************************************************/
google_geocoder.prototype.processLatLng = function(result) {

  var lat, lng, scale, map_units, accuracy = null;
  var geoResult = new GeocoderResult();

  //Result only contains a latitude and longitude value, null if
  //geocoding failed
  if (!result) {
    geoResult.setSuccess(false);
  } else {
    map_units = currentMapState.getUnits();
    accuracy = 4;  //Assumption
    scale = this.calcScale(accuracy);
    geoResult.setSuccess(true);
    geoResult.addLocation(this.address, 
                          "Not available", 
                          "Not available", 
                          scale,
                          result.lat(),
                          result.lng(),
                          1);
  }
  this.callback(geoResult);
}

/****************************************************************************
 * getStatusStr(google status_code) 
 *
 * Returns a human understandeable string based on the status code given
 ***************************************************************************/
google_geocoder.prototype.getStatusStr = function(status_code) {
  switch (status_code) {
  case STATUS_SUCCESS: return "Success";
  case STATUS_SERVER_ERROR: return "Unknown server error";
  case STATUS_MISSING_ADDRESS: return "Missing address, no q parameter";
  case STATUS_UNKNOWN_ADDRESS: return "Unknown address";
  case STATUS_ADDRESS_UNAVAILABLE: return "Address unavailable, but not unknown";
  case STATUS_INVALID_KEY: return "Invalid key";
    default: return "Failed";
  }
}

/****************************************************************************
 * getAccuracyStr(google status_code) 
 *
 * Returns a human understandeable string based on the accuracy code given
 ***************************************************************************/
google_geocoder.prototype.getAccuracyStr = function (accuracy_code) {
  switch (accuracy_code) {
    case ACC_UNKNOWN: return "Unknown";
    case ACC_COUNTRY: return "Country";
    case ACC_REGION: return "Region";
    case ACC_SUBREGION: return "Sub-region";
    case ACC_TOWN: return "Town";
    case ACC_ZIP: return "Zip Code";
    case ACC_STREET: return "Street";
    case ACC_INTERSECTION: return "Intersection";
    case ACC_ADDRESS: return "Address";
  default: return "Unknown";
  }
}

/****************************************************************************
 * getSuccess(google status_code) 
 *
 * Returns geocoding success or not based on the status code given
 ***************************************************************************/
google_geocoder.prototype.getSuccess = function (status_code) {
  switch (status_code) {
  case STATUS_SUCCESS: return true;
  case STATUS_SERVER_ERROR:
  case STATUS_MISSING_ADDRESS:
  case STATUS_UNKNOWN_ADDRESS:
  case STATUS_ADDRESS_UNAVAILABLE:
  case STATUS_INVALID_KEY:
    return false;
  }
}

/****************************************************************************
 * calcRadius(string map_units, int accuracy)
 *
 * Calculate a map extent radius given the map units used and the
 * accuracy of the geocoding result. An alternative method might be to
 * find an intersecting polygon and set the extent such that the
 * entire polygon is in view.
 ***************************************************************************/
google_geocoder.prototype.calcRadius = function (map_units, accuracy){
  var acc_const = 0;
  switch (accuracy) {
    case ACC_UNKNOWN: acc_const = 3; break;
    case ACC_COUNTRY: acc_const = 5000; break;
    case ACC_REGION: acc_const = 1000; break;
    case ACC_SUBREGION: acc_const = 500; break;
    case ACC_TOWN: acc_const = 200; break;
    case ACC_ZIP: acc_const = 60; break;
    case ACC_STREET: acc_const = 2; break;
    case ACC_INTERSECTION: acc_const = 2; break;
    case ACC_ADDRESS: acc_const = 1; break;
  }

  //These are multipliers, assuming rate of change is constant on the map
  switch (map_units) {
  case 'Meters': 
    units_constant = 152; 
    break;
  case 'Feet':
    units_constant = 500; 
    break;
  case 'Decimal Degrees':
    units_constant = .01;
    break;
  }

  //The higher the accuracy, the lower the accuracy value and the
  //lower the radius should be.
  return (acc_const * units_constant);
}

/****************************************************************************
 * calcScale(int accuracy)
 *
 * Calculate a map scale given the accuracy of the geocoding result.
 ***************************************************************************/
google_geocoder.prototype.calcScale = function (accuracy){
  switch (accuracy) {
  case ACC_UNKNOWN: return 500000;
  case ACC_COUNTRY: return 30000000;
  case ACC_REGION: return 10000000;
  case ACC_SUBREGION: return 100000;
  case ACC_TOWN: return 500000;
  case ACC_ZIP: return 150000;
  case ACC_STREET: return 20000;
  case ACC_INTERSECTION: return 5000;
  case ACC_ADDRESS: return 5000;
  }
}