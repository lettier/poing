/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 */

function deep_copy( obj )
{

	// If the passed object is an array, recursively call on each element in the array.
	
	if ( Object.prototype.toString.call( obj ) === '[object Array]' ) 
	{
		
		var out = [], i = 0, len = obj.length;
		
		for ( ; i < len; i++ ) 
		{
			
			out[ i ] = arguments.callee( obj[ i ] ); // Recursive call.
			
		}
		
		return out;
		
	}
	
	// If the passed object is a full-blown object, recursively call on each property of the object.
	
	if ( typeof obj === 'object' )
	{
		
		var out = {}, i;
		
		for ( i in obj )
		{
			
			out[ i ] = arguments.callee( obj[ i ] ); // Recursive call.
			
		}
		
		return out;
	}
	
	// If the object is just a primitive, just pass back the primitive.
	
	return obj;
	
}

function get_average( numbers )
{
	
	if ( numbers == undefined ) { console.error( "[calculate_average] Numbers undefined." ); return 0; }
	
	if ( numbers.length == 0 ) { return numbers[ 0 ]; }
	
	var total = 0;
	
	var i = numbers.length;
	
	while( i-- )
	{
		
		total += numbers[ i ];
		
	}
	
	return total / numbers.length;
	
}

function get_random_float( min, max ) 
{

	return ( Math.random( ) * ( max - min ) ) + min;
	
}

function get_random_integer( min, max ) 
{
	
	return Math.floor( Math.random( ) * ( max - min + 1 ) ) + min;
	
}

function get_clamped_value( value, min, max )
{
	
	if      ( value > max ) return max;
	else if ( value < min ) return min;
	else                    return value;
	
}