/*
 * 
 * David Lettier (C) 2014.
 * 
 * http://www.lettier.com/
 * 
 */

function Dynamic_Object( id )
{
	
	this.is_dynamic_object = true;
	
	this.id = id;
	
	this.object = document.getElementById( this.id );
	
	this.top = this.object.offsetTop;	
	
	this.left = this.object.offsetLeft;
	
	this.height = this.object.offsetHeight || this.object.clientHeight;
	
	this.width = this.object.offsetWidth || this.object.clientWidth;
	
	this.right = this.left + this.width;
	
	this.bottom = this.top + this.height;	
	
	this.center = { x: this.left + ( this.width / 2 ), y: this.top + ( this.height / 2 ) };
	
	// Get any attached objects that should move as this dynamic object moves.
	// This looks for additional arguments given beyond just the id argument.
	
	this.args = Array.prototype.slice.call( arguments );

	this.attached_objects = new Array( );
	
	for ( var i = 1; i < this.args.length; ++i )
	{
		
		this.attached_objects.push( this.args[ i ] ); 
		
	}
	
	this.number_of_attached_objects = this.attached_objects.length;
	
	this.get_object = function ( )
	{
		
		return document.getElementById( this.id );
		
	}
	
	this.get_top = function ( )
	{
		
		this.top = this.object.offsetTop;
		
		return this.top;
		
	}
	
	this.get_left = function ( )
	{
		
		this.left = this.object.offsetLeft;
		
		return this.left;
		
	}
	
	this.get_height = function ( )
	{

		this.height = this.object.offsetHeight || this.object.clientHeight;
		
		return this.height;		
		
	}
	
	this.get_width = function ( )
	{

		this.width = this.object.offsetWidth || this.object.clientWidth;
		
		return this.width;		
		
	}	
	
	this.get_right = function ( )
	{

		this.right = this.get_left( ) + this.get_width( );
		
		return this.right;
		
	}
	
	this.get_bottom = function ( )
	{
		
		this.bottom = this.get_top( ) + this.get_height( );
		
		return this.bottom;
		
	}	
	
	this.get_center = function ( )
	{
		
		this.center.x = this.get_left( ) + ( this.get_width( )  / 2 );
		
		this.center.y = this.get_top( )  + ( this.get_height( ) / 2 );
		
		return this.center;
		
	}
		
	this.get_distance_to = function ( object )
	{
		
		if ( object == undefined ) { console.log( "[Dynamic_Object:distance_to] Object not set." ); return { x: 0, y: 0, h: 1 }; }
		
		if ( object.hasOwnProperty( "get_center" ) ) 
		{ 
			var math_abs = Math.abs;
			
			var x = math_abs( this.get_center( ).x - object.get_center( ).x );
			
			var y = math_abs( this.get_center( ).y - object.get_center( ).y );
			
			var h = Math.sqrt( ( x * x ) + ( y * y ) );
			
			return { x: x, y: y, h: h };
			
		}
		else
		{
			
			var math_abs = Math.abs;
			
			var x = math_abs( this.get_center( ).x - object.x );
			
			var y = math_abs( this.get_center( ).y - object.y );
			
			var h = Math.sqrt( ( x * x ) + ( y * y ) );
			
			return { x: x, y: y, h: h };
			
		}
		
	}
	
	this.set_left_top = function ( left, top )
	{
		
		if ( left == undefined || top == undefined ) { console.log( "[Dynamic_Object:set_left_top] left and/or top is not set." ); return null; }
		
		this.object.style.left = left + "px";
		
		this.object.style.top  = top + "px";
		
		this.get_top( );
		
		this.get_left( );
		
		this.get_right( );
		
		this.get_bottom( );
		
		this.get_center( );
		
		if ( this.number_of_attached_objects > 0 )
		{
			
			for ( var i = 0; i < this.number_of_attached_objects; ++i )
			{
				
				if ( this.attached_objects[ i ][ 1 ] == "l" )
				{
					
					this.attached_objects[ i ][ 0 ].style.left = this.object.offsetLeft + "px";
					
				}
				else if ( this.attached_objects[ i ][ 1 ] == "t" )
				{
					
					this.attached_objects[ i ][ 0 ].style.top  = this.object.offsetTop  + "px";
					
				}
				else if ( this.attached_objects[ i ][ 1 ] == "" )
				{

					this.attached_objects[ i ][ 0 ].style.left = this.object.offsetLeft + "px";
				
					this.attached_objects[ i ][ 0 ].style.top  = this.object.offsetTop  + "px";
					
				}
				
			}
			
		}
		
	}
	
	this.set_center = function ( x, y )
	{
		
		if ( x == undefined || y == undefined ) { console.log( "[Dynamic_Object:set_center] x and/or y is not set." ); return null; }
		
		this.object.style.left = ( x - ( this.get_width( ) / 2 ) ) + "px";
		
		this.object.style.top  = ( y - ( this.get_height( ) / 2 ) ) + "px";	
		
		this.get_top( );
		
		this.get_left( );
		
		this.get_right( );
		
		this.get_bottom( );
		
		this.get_center( );
		
		if ( this.number_of_attached_objects > 0 )
		{
			
			for ( var i = 0; i < this.number_of_attached_objects; ++i )
			{
				
				if ( this.attached_objects[ i ][ 1 ] == "l" )
				{
					
					this.attached_objects[ i ][ 0 ].style.left = this.object.offsetLeft + "px";
					
				}
				else if ( this.attached_objects[ i ][ 1 ] == "t" )
				{
					
					this.attached_objects[ i ][ 0 ].style.top  = this.object.offsetTop  + "px";
					
				}
				else if ( this.attached_objects[ i ][ 1 ] == "" )
				{

					this.attached_objects[ i ][ 0 ].style.left = this.object.offsetLeft + "px";
				
					this.attached_objects[ i ][ 0 ].style.top  = this.object.offsetTop  + "px";
					
				}
				
			}
			
		}
		
	}
	
	this.move_left_top = function ( dx, dy )
	{
		
		this.object.style.left = this.object.offsetLeft + dx + "px";
		
		this.object.style.top  = this.object.offsetTop  + dy + "px";
		
		this.get_top( );
		
		this.get_left( );
		
		this.get_right( );
		
		this.get_bottom( );
		
		this.get_center( );
		
		if ( this.number_of_attached_objects > 0 )
		{
			
			for ( var i = 0; i < this.number_of_attached_objects; ++i )
			{
				
				if ( this.attached_objects[ i ][ 1 ] == "l" )
				{
					
					this.attached_objects[ i ][ 0 ].style.left = this.object.offsetLeft + "px";
					
				}
				else if ( this.attached_objects[ i ][ 1 ] == "t" )
				{
					
					this.attached_objects[ i ][ 0 ].style.top  = this.object.offsetTop  + "px";
					
				}
				else if ( this.attached_objects[ i ][ 1 ] == "" )
				{

					this.attached_objects[ i ][ 0 ].style.left = this.object.offsetLeft + "px";
				
					this.attached_objects[ i ][ 0 ].style.top  = this.object.offsetTop  + "px";
					
				}
				
			}
			
		}
		
	}	
	
}
