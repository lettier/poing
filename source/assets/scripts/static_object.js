/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 */

function Static_Object( id )
{

	this.is_static_object = true;
	
	this.id = id;
	
	this.object = document.getElementById( this.id );
	
	this.top = this.object.offsetTop;	
	
	this.left = this.object.offsetLeft;
	
	this.height = this.object.offsetHeight || this.object.clientHeight;
	
	this.width = this.object.offsetWidth || this.object.clientWidth;
	
	this.right = this.left + this.width;
	
	this.bottom = this.top + this.height;	
	
	this.center = { x: this.left + ( this.width / 2 ), y: this.top + ( this.height / 2 ) };	
	
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
		
		this.center.x = this.get_left( ) + ( this.get_width( ) / 2 );
		
		this.center.y = this.get_top( ) + ( this.get_height( ) / 2 );
		
		return this.center;
		
	}
	
	this.get_bounding_line_segments = function ( )
	{
	
		// Left bounding line segment.
		
		var left_xy = { x1: this.get_left( ), y1: this.get_top( ),
		                x2: this.get_left( ), y2: this.get_bottom( )
		              };
		
		// Right bounding line segment.
		
		var right_xy = { x1: this.get_right( ), y1: this.get_top( ),
		                 x2: this.get_right( ), y2: this.get_bottom( )
		               };
		            
		// Top bounding line segment.
		
		var top_xy = { x1: this.get_left( ),  y1: this.get_top( ),
		               x2: this.get_right( ), y2: this.get_top( )
		             };
		
		// Bottom bounding line segment.
		
		var bottom_xy = { x1: this.get_left( ),  y1: this.get_bottom( ),
		                  x2: this.get_right( ), y2: this.get_bottom( )
		                };
		            
		// A = y2-y1
		// B = x1-x2
		// C = A*x1+B*y1
		            
		var left_abc_xy = { 	a: left_xy.y2 - left_xy.y1,
		                    	b: left_xy.x1 - left_xy.x2,
		                    	c: ( ( left_xy.y2 - left_xy.y1 ) * left_xy.x1 ) + ( ( left_xy.x1 - left_xy.x2 ) * left_xy.y1 ),
		                    	x1: left_xy.x1,
		                    	y1: left_xy.y1,
		                    	x2: left_xy.x2,
		                    	y2: left_xy.y2
		                  };
		
		var right_abc_xy = { 	a: right_xy.y2 - right_xy.y1,
		                     	b: right_xy.x1 - right_xy.x2,
		                     	c: ( ( right_xy.y2 - right_xy.y1 ) * right_xy.x1 ) + ( ( right_xy.x1 - right_xy.x2 ) * right_xy.y1 ),
		                     	x1: right_xy.x1,
		                     	y1: right_xy.y1,
		                     	x2: right_xy.x2,
		                     	y2: right_xy.y2
		                   };
		
		var top_abc_xy = { 		a: top_xy.y2 - top_xy.y1,
		                   		b: top_xy.x1 - top_xy.x2,
		                   		c: ( ( top_xy.y2 - top_xy.y1 ) * top_xy.x1 ) + ( ( top_xy.x1 - top_xy.x2 ) * top_xy.y1 ),
		                   		x1: top_xy.x1,
		                   		y1: top_xy.y1,
		                   		x2: top_xy.x2,
		                   		y2: top_xy.y2
		              };
		
		var bottom_abc_xy = { 	a: bottom_xy.y2 - bottom_xy.y1,
		                     	b: bottom_xy.x1 - bottom_xy.x2,
		                      	c: ( ( bottom_xy.y2 - bottom_xy.y1 ) * bottom_xy.x1 ) + ( ( bottom_xy.x1 - bottom_xy.x2 ) * bottom_xy.y1 ),
		                      	x1: bottom_xy.x1,
		                      	y1: bottom_xy.y1,
		                      	x2: bottom_xy.x2,
		                      	y2: bottom_xy.y2
		                    };
		
		var segments = { left_abc_xy: left_abc_xy, right_abc_xy: right_abc_xy, top_abc_xy: top_abc_xy, bottom_abc_xy: bottom_abc_xy };
		
		return segments;
	
	}
	
	this.get_distance_to = function ( object )
	{
		
		if ( object == undefined ) { console.log( "[Dynamic_Object:distance_to] Object not set." ); return { x: 0, y: 0, h: 0 }; }
		
		if ( !object.hasOwnProperty( "get_center" ) ) { console.log( "[Dynamic_Object:distance_to] Object does not have get_center." ); return { x: 0, y: 0, h: 0 }; } 
		
		var math_abs = Math.abs;
		
		var x = math_abs( this.get_center( ).x - object.get_center( ).x );
		
		var y = math_abs( this.get_center( ).y - object.get_center( ).y );
		
		var h = Math.sqrt( ( x * x ) + ( y * y ) );
		
		return { x: x, y: y, h: h };
		
	}
	
}
