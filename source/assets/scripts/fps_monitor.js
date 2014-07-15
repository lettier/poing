/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 */

function FPS_Monitor( time_stamp )
{
	
	this.time_delta = 0;
	
	this.start_time = time_stamp;

	this.fps = 0;
	
	this.frames_drawn = 0;

	this.count_begin_time = time_stamp;
	
	this.elapsed_time = null;
	
	this.get_fps = function( )
	{

		// Calculate frames per second being drawn.
		
		this.elapsed_time = ( now = performance.now( ) ) - this.count_begin_time;
		
		if ( this.elapsed_time >= 1000 )
		{
		
			this.count_begin_time = now;
			this.elapsed_time = 0;
			this.fps = this.frames_drawn;
			this.frames_drawn = 0;
			
		}
		else
		{
			
			this.frames_drawn += 1;
		
		}
		
		return this.fps;
		
	}
	
	this.get_time_delta = function( time_stamp )
	{
		// Calculate time difference since last repaint.
		// This allows for time based animations instead of
		// frame based animation.
	
		this.time_delta = ( time_stamp - this.start_time ) / 1000; // In seconds.				

		// Reset start time to this repaint.
		
		this.start_time = time_stamp;
		
		return this.time_delta;
		
	}
	
}