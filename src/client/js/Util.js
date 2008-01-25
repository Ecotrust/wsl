/****************************************************************************
 * @copyright	2007 Ecotrust
 * @author		Tim Welch
 * @contact		twelch at ecotrust dot org
 * @license		GNU GPL 2 (See LICENSE.TXT for the full license)
 *  
 * @summary: 	utility functions
 ***************************************************************************/

function isArray(obj) {
   if (obj.constructor.toString().indexOf("Array") == -1)
      return false;
   else
      return true;
}

function numDecPlaces(num) {
	decIndex = String(num).indexOf(".");
	if (decIndex >= 0)
		return String(num).length - decIndex;
	else
		return 0;	
}

function rnd_dec(num, places) {
	if (isNaN(parseFloat(num)))
		return num;
	if (numDecPlaces(num) == 0)
		return num;
	else
		return parseFloat(num).toFixed(places);
}

function milesToKm(num) {
	if (isNaN(parseFloat(num)))
		return num;
	return num*1.609;
}

function feetToMeters(num) {
	if (isNaN(parseFloat(num)))
		return num;
	return num*0.3048
}

function addCommas(nStr) {
	if (isNaN(parseFloat(nStr)))
		return nStr;
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

/* Copyright (c) 2006-2007 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * Namespace: Util
 */
Util = {};

/**
 * APIFunction: updateParams
 * Copy all properties of a source object to a destination object.  Modifies
 *     the passed in destination object.
 *
 * Parameters:
 * destination - {Object} The object that will be modified
 * source - {Object} The object with properties to be set on the destination
 *
 * Returns:
 * {Object} The destination object.
 */
Util.updateParams = function(destination, source) {
    if(destination && source) {
        for(var property in source) {
            destination[property] = source[property];
        }
        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */
        if(source.hasOwnProperty && source.hasOwnProperty('toString')) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

function isInteger (s) {
	var i;
	if (isEmpty(s))
	if (isInteger.arguments.length == 1) 
		return 0;
	else 
		return (isInteger.arguments[1] == true);
	for (i = 0; i < s.length; i++) {
	var c = s.charAt(i);
	if (!isDigit(c)) 
		return false;
	}
	return true;
}

function isEmpty(s) {
	return ((s == null) || (s.length == 0))
}

function isDigit (c) {
	return ((c >= "0") && (c <= "9"))
}