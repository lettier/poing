/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 */

function Debug_Manager( id )
{
	
	if ( id == undefined ) { console.error( "[Debug_Manager] Id not set." ); return null; }	
	
	this.id = id;
	
	this.object = document.getElementById( this.id );
	
	this.slots = new Array( );
	
	this.show_debug = function ( )
	{
		
		this.object.style.visibility = "visible";
		
	}
	
	this.hide_debug = function ( )
	{
		
		this.object.style.visibility = "hidden";
		
	}
		
	
	this.add_or_update = function ( key, value )
	{
		
		if ( key == undefined ) { console.error( "[Debug_Manager:add] Key not set." ); return null; }
		
		if ( value == undefined ) { console.error( "[Debug_Manager:add] Value not set." ); return null; }
		
		this.slots[ key ] = value;
		
	}
	
	this.print = function ( )
	{
		
		if ( this.object.style.visibility == "hidden" ) return null;
		
		this.object.innerHTML = "";
		
		for ( var key in this.slots )
		{
			
			if ( typeof this.slots[ key ] === "object" )
			{
			
				this.object.innerHTML += key + ": " + this.object_to_string( this.slots[ key ] ) + "<br>";
				
			}
			else
			{
				
				this.object.innerHTML += key + ": " + this.slots[ key ] + "<br><br>";
				
			}
			
		}
		
	}
	
	this.object_to_string = function ( object )
	{
		
		if ( object == undefined ) { console.error( "[Debug_Manager:object_to_string] Object not set." ); return ''; }
		
		var str = '<br>';
		
		for ( var member in object ) 
		{
			
			if ( object.hasOwnProperty( member ) ) 
			{
				
				if ( this.is_function( object[ member ] ) ) continue;
				else if ( typeof object[ member ] === "object" ) continue;
				
				str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + member + ": " + object[ member ] + "<br>";
				
			}
			
		}
		
		return str;
	}
	
	this.is_function = function ( f ) 
	{
		
		var getType = { };
		
		return f && getType.toString.call( f ) === '[object Function]';
		
	}
	
}