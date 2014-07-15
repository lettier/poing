/*
 * 
 * David Lettier (C) 2014.
 * 
 * http://www.lettier.com/
 * 
 */

function Physics_Engine( collision_callback )
{
	
	if ( collision_callback == undefined ) { console.error( "[Physics_Engine] No collision callback set." ); return null; }
	
	this.collision_callback = collision_callback;
	
	this.args = Array.prototype.slice.call( arguments );
	
	if ( this.args.length == 1 ) { console.error( "[Physics_Engine] No physics, dynamic, and/or static objects passed." ); return null; }

	this.static_objects = new Array( );
	
	this.dynamic_objects = new Array( );
	
	this.physics_objects = new Array( );
	
	this.colliding_objects = new Array( );
	
	for ( var i = 1; i < this.args.length; ++i )
	{
		
		if ( this.args[ i ].hasOwnProperty( "is_physics_object" ) )
		{
			
			this.physics_objects.push( this.args[ i ] );
			
		}
		else if ( this.args[ i ].hasOwnProperty( "is_dynamic_object" ) ) 
		{
			
			this.dynamic_objects.push( this.args[ i ] );
			
		}
		else if ( this.args[ i ].hasOwnProperty( "is_static_object" ) ) 
		{
			
			this.static_objects.push( this.args[ i ] );
			
		}
		
	}
	
	this.rectangle_intersection = function ( r1, r2 )
	{

		if ( r1 == undefined || r2 == undefined ) { console.error( "[Physics_Engine] Rectangles are not set." ); return null; }

		if ( r1.hasOwnProperty( "get_left" ) && r2.hasOwnProperty( "get_left" ) )
		{
		
			return !( r2.get_left( ) > r1.get_right( ) || r2.get_right( ) < r1.get_left( ) || r2.get_top( ) > r1.get_bottom( ) || r2.get_bottom( ) < r1.get_top( ) );
			
		}
		else
		{
		
			console.error( "[Physics_Engine] Rectangle objects have no property get_left." );
			
		}
		
	}

	this.update = function ( time_delta )
	{
		
		this.colliding_objects = [ ];
		
		var colliding = false;
		
		var call_collision_callback = false;
		
		// Check for collisions of type physics object to physics object.
		
		for ( var i = 0; i < this.physics_objects.length; ++i )
		{
			
			for ( var j = i + 1; j < this.physics_objects.length; ++j )
			{
				
				var pb_i = this.physics_objects[ i ].get_predicted_bounding_box( time_delta );
				var pb_j = this.physics_objects[ j ].get_predicted_bounding_box( time_delta );
				
				// Predictive collision detection.
				
				if ( this.rectangle_intersection( pb_i, pb_j ) )
				{

					// Next frame update will have a collision so shorten the advancement this frame so that no interpenetration takes place.
				
					if ( !isNaN( time_delta ) )
					{
						
						var last_non_intersection_i = null;
						var last_non_intersection_j = null;
					
						// Bisection method of obtaining the exact point or slice of the time step (time_delta) where the objects are just touching.
						
						//   __________
						//  |          |
						//  |          |
						//  |        __|___
						//  |       |      |
						//  |    O  |  O   |
						//  |       |      |
						//  |        ------
						//  |          |
						//  |          |
						//   ----------
						//             1t---------------0t 
						//
						//   __________
						//  |          |
						//  |          |
						//  |          | ______
						//  |          ||      |
						//  |    O     ||  O   |
						//  |          ||      |
						//  |          | ------
						//  |          |
						//  |          |
						//   ----------
						//             1t--st-----------0t 
						
						var time_slice_start = 0;
						var time_slice_end   = 1;
						var time_slice       = ( time_slice_start + time_slice_end ) / 2 ;
						
						var iterations     = 0;
						var max_iterations = 100;
					
						while ( iterations <= max_iterations )
						{
							
							pb_i = this.physics_objects[ i ].get_predicted_bounding_box( time_slice * time_delta );
							pb_j = this.physics_objects[ j ].get_predicted_bounding_box( time_slice * time_delta );
							
							// Say time_delta is from 0 to to t.
							
							// First we tried a location half way between 0 and t.
							// Now if there was no collision at this location,
							// Try half way between .5t and 1t or .75t.
							// Otherwise, try halfway between 0t and .5t .25t.
						
							if ( this.rectangle_intersection( pb_i, pb_j ) )
							{

								time_slice_end = time_slice;
								time_slice     = ( time_slice_start + time_slice_end ) / 2 ;
							
							}
							else
							{
							
								time_slice_start = time_slice;
								time_slice       = ( time_slice_start + time_slice_end ) / 2 ;
								
								last_non_intersection_i = deep_copy( pb_i );
								last_non_intersection_j = deep_copy( pb_j );
							
							}
							
							// Limit the number of iterations.
							
							iterations += 1;
						
						}
						
						// Obtain the left and top coordinate of the bounding box that is just touching but
						// not interpenetrating.
						
						var left_i = null;
						var top_i  = null;
						
						var left_j = null;
						var top_j  = null;
						
						if ( last_non_intersection_i != null && last_non_intersection_j != null )
						{
							
							left_i = last_non_intersection_i.get_left( );
							top_i  = last_non_intersection_i.get_top( );
							
							left_j = last_non_intersection_j.get_left( );
							top_j  = last_non_intersection_j.get_top( );
						
						}
						else
						{

							left_i = pb_i.get_left( );
							top_i  = pb_i.get_top( );
							
							left_j = pb_j.get_left( );
							top_j  = pb_j.get_top( );
							
						}
						
						// Update the actual objects' left and top coordinate to 
						// last known non-intersecting prediction locations.
					
						this.physics_objects[ i ].dynamic_object.set_left_top( left_i, top_i );
						this.physics_objects[ j ].dynamic_object.set_left_top( left_j, top_j );
	
					}
					
					// Register this collision.
					
					this.physics_objects[ i ].colliding = true;
					this.physics_objects[ j ].colliding = true;
					
					this.colliding_objects.push( [ this.physics_objects[ i ], this.physics_objects[ j ] ] );
				
					call_collision_callback = true;

				}
				
			}
			
		}
		
		// Test for collisions of type physics object to dynamic object.
		
		for ( var i = 0; i < this.physics_objects.length; ++i )
		{
			
			for ( var j = 0; j < this.dynamic_objects.length; ++j )
			{
				
				var pb_i = this.physics_objects[ i ].get_predicted_bounding_box( time_delta );
				
				if ( this.rectangle_intersection( pb_i, this.dynamic_objects[ j ] ) )
				{

					if ( !isNaN( time_delta ) )
					{
					
						var last_non_intersection_i = null;
						
						var time_slice_start = 0;
						var time_slice_end   = 1;
						var time_slice       = ( time_slice_start + time_slice_end ) / 2 ;
						
						var iterations     = 0;
						var max_iterations = 100;
					
						while ( iterations <= max_iterations )
						{
							
							pb_i = this.physics_objects[ i ].get_predicted_bounding_box( time_slice * time_delta );
														
							if ( this.rectangle_intersection( pb_i, this.dynamic_objects[ j ] ) )
							{

								time_slice_end = time_slice;
								time_slice     = ( time_slice_start + time_slice_end ) / 2 ;
							
							}
							else
							{
							
								time_slice_start = time_slice;
								time_slice       = ( time_slice_start + time_slice_end ) / 2 ;
								
								last_non_intersection_i = deep_copy( pb_i );
							
							}
							
							iterations += 1;
						
						}
						
						var left_i = null;
						var top_i  = null;
						
						if ( last_non_intersection_i != null )
						{
							
							left_i = last_non_intersection_i.get_left( );
							top_i  = last_non_intersection_i.get_top( );
							
						}
						else
						{

							left_i = pb_i.get_left( );
							top_i  = pb_i.get_top( );
							
						}
					
						this.physics_objects[ i ].dynamic_object.set_left_top( left_i, top_i );
	
					}
					
					this.physics_objects[ i ].colliding = true;
					
					this.colliding_objects.push( [ this.physics_objects[ i ], this.dynamic_objects[ j ] ] );
				
					call_collision_callback = true;
				}
			}
			
		}
		
		// Test for collisions of type physics object to static object.
		
		for ( var i = 0; i < this.physics_objects.length; ++i )
		{
			
			for ( var j = 0; j < this.static_objects.length; ++j )
			{
				
				var pb_i = this.physics_objects[ i ].get_predicted_bounding_box( time_delta );
				
				if ( this.rectangle_intersection( pb_i, this.static_objects[ j ] ) )
				{
			
					if ( !isNaN( time_delta ) )
					{
					
						var last_non_intersection_i = null;
						
						var time_slice_start = 0;
						var time_slice_end   = 1;
						var time_slice       = ( time_slice_start + time_slice_end ) / 2 ;
						
						var iterations     = 0;
						var max_iterations = 100;
					
						while ( iterations <= max_iterations )
						{
							
							pb_i = this.physics_objects[ i ].get_predicted_bounding_box( time_slice * time_delta );
						
							if ( this.rectangle_intersection( pb_i, this.static_objects[ j ]  ) )
							{

								time_slice_end = time_slice;
								time_slice     = ( time_slice_start + time_slice_end ) / 2 ;
							
							}
							else
							{
							
								time_slice_start = time_slice;
								time_slice       = ( time_slice_start + time_slice_end ) / 2 ;
								
								last_non_intersection_i = deep_copy( pb_i );
							
							}
							
							iterations += 1;
						
						}
						
						var left_i = null;
						var top_i  = null;
						
						if ( last_non_intersection_i != null )
						{
							
							left_i = last_non_intersection_i.get_left( );
							top_i  = last_non_intersection_i.get_top( );
							
						}
						else
						{

							left_i = pb_i.get_left( );
							top_i  = pb_i.get_top( );
							
						}
					
						this.physics_objects[ i ].dynamic_object.set_left_top( left_i, top_i );
	
					} 
					
					this.physics_objects[ i ].colliding = true;
					
					this.colliding_objects.push( [ this.physics_objects[ i ], this.static_objects[ j ] ] );
				
					call_collision_callback = true;
				}
			}
			
		}
		
		// If a collision occurred or rather would have occurred if the object 
		// was allowed to advance at the velocity * time_delta it was traveling,
		// call the collision callback function as if it did happen and don't allow
		// it to advance at all.
		
		// Otherwise, no predicted collisions were found so just update 
		// the object's position.
		
		if ( call_collision_callback )
		{
		
			this.collision_callback( this.colliding_objects );
			 
			for ( var i = 0; i < this.physics_objects.length; ++i )
			{
			
				if ( this.physics_objects[ i ].colliding === true )
				{
				
					this.physics_objects[ i ].update_left_top( 0 );
					
					this.physics_objects[ i ].colliding = false;
					
				}
				else
				{
					
					this.physics_objects[ i ].update_left_top( time_delta );
					
				}
				
			}
			 
		}
		else
		{
		
			for ( var i = 0; i < this.physics_objects.length; ++i )
			{
			
				this.physics_objects[ i ].update_left_top( time_delta );
				
			}
			
		}
		
	}
	
}
