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