/**
* This file is part of the PHP_Unserialize package (http://www.phpguru.org/)
*
* PHP_Unserialize is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* PHP_Unserialize is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with PHP_Unserialize; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*
* © Copyright 2005 Richard Heyes
*   http://www.phpguru.org/
*/

    /**
    * Unserializes a PHP serialized data type. Currently handles:
    *  o Strings
    *  o Integers
    *  o Doubles
    *  o Arrays
    *  o Booleans
    *  o NULL
    *  o Objects
    * 
    * alert()s will be thrown if the function is passed something it
    * can't handle or incorrect data.
    *
    * @param  string input The serialized PHP data
    * @return mixed        The resulting datatype
    */
    function PHP_Unserialize(input)
    {
        var result = PHP_Unserialize_(input);
        return result[0];
    }


    /**
    * Function which performs the actual unserializing
    *
    * @param string input Input to parse
    */
    function PHP_Unserialize_(input)
    {
        var length = 0;
        
        switch (input.charAt(0)) {
            /**
            * Array
            */
            case 'a':
                length = PHP_Unserialize_GetLength(input);
                input  = input.substr(String(length).length + 4);

                var arr   = new Array();
                var key   = null;
                var value = null;

                for (var i=0; i<length; ++i) {
                    key   = PHP_Unserialize_(input);
                    input = key[1];

                    value = PHP_Unserialize_(input);
                    input = value[1];

                    arr[key[0]] = value[0];
                }

                input = input.substr(1);
                return [arr, input];
                break;
            
            /**
            * Objects
            */
            case 'O':
                length = PHP_Unserialize_GetLength(input);
                var classname = String(input.substr(String(length).length + 4, length));
                
                input  = input.substr(String(length).length + 6 + length);
                var numProperties = Number(input.substring(0, input.indexOf(':')))
                input = input.substr(String(numProperties).length + 2);

                var obj      = new Object();
                var property = null;
                var value    = null;

                for (var i=0; i<numProperties; ++i) {
                    key   = PHP_Unserialize_(input);
                    input = key[1];
                    
                    // Handle private/protected
                    key[0] = key[0].replace(new RegExp('^\x00' + classname + '\x00'), '');
                    key[0] = key[0].replace(new RegExp('^\x00\\*\x00'), '');

                    value = PHP_Unserialize_(input);
                    input = value[1];

                    obj[key[0]] = value[0];
                }

                input = input.substr(1);
                return [obj, input];
                break;

            /**
            * Strings
            */
            case 's':
                length = PHP_Unserialize_GetLength(input);
                return [String(input.substr(String(length).length + 4, length)), input.substr(String(length).length + 6 + length)];
                break;

            /**
            * Integers and doubles
            */
            case 'i':
            case 'd':
                var num = Number(input.substring(2, input.indexOf(';')));
                return [num, input.substr(String(num).length + 3)];
                break;
            
            /**
            * Booleans
            */
            case 'b':
                var bool = (input.substr(2, 1) == 1);
                return [bool, input.substr(4)];
                break;
            
            /**
            * Null
            */
            case 'N':
                return [null, input.substr(2)];
                break;

            /**
            * Unsupported
            */
            case 'o':
            case 'r':
            case 'C':
            case 'R':
            case 'U':
                alert('Error: Unsupported PHP data type found!');

            /**
            * Error
            */
            default:
                return [null, null];
                break;
        }
    }