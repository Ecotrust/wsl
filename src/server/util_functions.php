<?php
/****************************************************************************
 * @copyright   2007 Ecotrust
 * @author      Tim Welch
 * @contact     twelch at ecotrust dot org
 * @license     GNU GPL 2 (See LICENSE.TXT for the full license)
 *  
 * @summary: 	Utility functions
 ******************************************************************************/

//Any integer or float
function isNumeric($n) {
  return ereg("^[+-]?[0-9]*\.?[0-9]+$", $n);
}

//Any integer
function isInt($n) {
  return ereg("^-?[0-9]*$", $n);
}

//Valid wsl region
function isRegion($s) {
  return ($s=='us' || $s=='yukon' || $s=='bc') ? true : false;
}

//Only letters, numbers, spaces or underscores
function isAlphNumSp($str) {
  return preg_match('/^[\w\d\s]*$/',($str));
}

/********************************************************************* 
 * quote_smart - Quote variable (unless numeric) to make safe from sql 
 * injection attacks 
 *********************************************************************/
function mysql_quote_smart($value) {
	if (get_magic_quotes_gpc()) {
		$value = stripslashes($value);
	}   // Quote if not integer
	if (!isNumeric($value) || $value[0] == '0') {
		$value = "'" . mysql_real_escape_string($value) . "'";
	}   
	return $value;
}

/********************************************************************* 
 * quote_smart - Quote variable (unless numeric) to make safe from sql 
 * injection attacks 
 *********************************************************************/
function pg_quote_smart($value) {
	if (get_magic_quotes_gpc()) {
		$value = stripslashes($value);
	}   // Quote if not integer
	if (!isNumeric($value) || $value[0] == '0') {
		$value = "'" . pg_escape_string($value) . "'";
	}   
	return $value;
}
?>
