/*
 * 
 * David Lettier (C) 2014.
 * 
 * http://www.lettier.com/
 * 
 */

function Physics_Object( dynamic_object, angle, magnitude )
{
	
	if ( dynamic_object == undefined ) { console.error( "[Physics_Object] Object not set." ); return null; }
	
	if ( !dynamic_object.hasOwnProperty( "is_dynamic_object" ) ) { console.error( "[Physics_Object] Object is not dynamic." ); return null; }
	
	this.is_physics_object = true;
	
	this.dynamic_object = dynamic_object;
	
	this.id = this.dynamic_object.id;
	
	if ( angle == undefined )     { console.warn( "[Physics_Object] Angle not set." ); angle = 0; }
	
	if ( magnitude == undefined ) { console.warn( "[Physics_Object] Magnitude not set." ); magnitude = 0; }

	if ( magnitude < 0 ) console.warn( "[Physics_Object] Magnitude is negative." );
	
	this.magnitude = ( magnitude < 0 ) ? magnitude * -1.0 : magnitude;
	
	this.PI = Math.PI;	
	
	this.get_angle = function ( )
	{
		
		// Mirror the angle along the x-axis due to the screen going x positive 
		// down the right of the screen and y positive going down the screen.
		// So 90 degress in screen space becomes 270 degrees in standard space.
		
		return 360.0 - this.mod_degrees( this.radians_to_degress( Math.atan2( this.velocity.y, this.velocity.x ) ) );
		
	}
	
	this.get_magnitude = function ( )
	{
		
		var x = this.velocity.x;
		var y = this.velocity.y;		
		
		return Math.sqrt( ( x * x ) + ( y * y ) );
		
	}
	
	this.get_velocity = function ( )
	{
		
		var magnitude = this.get_magnitude( )
		
		this.velocity.x = magnitude * Math.cos( this.angle );
		this.velocity.y = magnitude * Math.sin( this.angle );
		
		return this.velocity;
		
	}
	
	this.get_predicted_bounding_box = function ( time_delta )
	{
	
		if ( time_delta == undefined ) { console.warn( "[Physics_Object:get_predicted_bounding_box] Time delta not set." ); time_delta = 0; }
		
		function Predicted_Bounding_Box( new_center_x, new_center_y, width, height )
		{
			
			this.center = { x: new_center_x, y: new_center_y };
			
			this.dimensions = { width: width, height: height };
			
			this.get_top = function ( )
			{
			
				return this.center.y - ( this.dimensions.height / 2 );
			
			}
			
			this.get_bottom = function ( )
			{
			
				return this.center.y + ( this.dimensions.height / 2 );
			
			}
			
			this.get_left = function ( )
			{
			
				return this.center.x - ( this.dimensions.width / 2 );
			
			}
			
			this.get_right = function ( )
			{
			
				return this.center.x + ( this.dimensions.width / 2 );
			
			}
			
		}
		
		// Get the bounding box coordinates of the object as if it was advanced by its velocity * time_delta step. 
		
		var center_copy = deep_copy( this.dynamic_object.get_center( ) );
		
		var velocity_copy = deep_copy( this.get_velocity( ) );
		
		var new_center_x = center_copy.x + ( velocity_copy.x * time_delta );
		var new_center_y = center_copy.y + ( velocity_copy.y * time_delta );
		
		var predicted_bound_box = new Predicted_Bounding_Box( new_center_x, new_center_y, deep_copy( this.dynamic_object.get_width( ) ), deep_copy( this.dynamic_object.get_height( ) ) );
		
		return predicted_bound_box;
		
	}
	
	this.set_magnitude = function ( magnitude )
	{
		
		if ( magnitude < 0 ) console.warn( "[Physics_Object:set_magnitude] Magnitude is negative." );
	
		this.magnitude = ( magnitude < 0 ) ? magnitude * -1.0 : magnitude;		
		
		this.velocity.x = this.magnitude * Math.cos( this.angle );
		this.velocity.y = this.magnitude * Math.sin( this.angle );
		
	}
	
	this.set_angle = function ( angle )
	{
		
		this.angle = this.degrees_to_radians( this.mod_degrees( angle ) );		
		this.angle = ( this.PI * 2.0 ) - this.angle; // Mirror.
		
		this.velocity.x = this.magnitude * Math.cos( this.angle )
		this.velocity.y = this.magnitude * Math.sin( this.angle );
	
	}
	
	this.degrees_to_radians = function ( degs )
	{
		
		return degs * ( this.PI / 180.0 );
		
	}
	
	this.radians_to_degress = function ( rads )
	{
		
		return rads * ( 180.0 / this.PI );
		
	}
	
	this.mod_degrees = function ( dividend )
	{
		
		return this.mod( dividend, 360.0 );
		
	}
	
	this.mod = function ( dividend, divisor ) 
	{

		return Math.floor( ( dividend % divisor ) >= 0 ? ( dividend % divisor ) : ( dividend % divisor ) + divisor );
		
	}
	
	this.angle = this.degrees_to_radians( this.mod_degrees( angle ) );
	
	// Mirror the angle along the x-axis due to the screen going x positive 
	// down the right of the screen and y positive going down the screen.
	
	this.angle = ( this.PI * 2.0 ) - this.angle;

	this.velocity = { x: this.magnitude * Math.cos( this.angle ), y: this.magnitude * Math.sin( this.angle ) };
	
	this.update_left_top = function ( time_delta )
	{
		
		if ( time_delta == undefined ) { console.warn( "[Physics_Object:update_left_top] Time delta not set." ); time_delta = 0; }

		this.dynamic_object.move_left_top( this.velocity.x * time_delta, this.velocity.y * time_delta );
		
	}
	
}
