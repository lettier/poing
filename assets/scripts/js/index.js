/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 * JS file for POiNG.
 * 
 */


// The following stub was taken from https://gist.github.com/paulirish/1579671.
			
( function ( ) 
{
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) 
	{
		window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[ vendors[ x ]+'CancelRequestAnimationFrame' ];
	}

	if ( !window.requestAnimationFrame )
	{
		window.requestAnimationFrame = function ( callback, element ) 
		{
			var currTime = new Date( ).getTime( );
			var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function ( ) { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
		
	}

	if ( !window.cancelAnimationFrame )
	{
		window.cancelAnimationFrame = function ( id ) 
		{
			clearTimeout( id );
		};
	
	}
} ( ) );

// End stub.

var use_css_transform = true;

var wwidth  = window.innerWidth;
var wheight = window.innerHeight;

var debug = document.getElementById( "debug" );
var lettier = document.getElementById( "lettier" );
var computer_cursor = document.getElementById( "computer_cursor_container" );
var logo = document.getElementById( "logo" );
var click_begin_text = document.getElementById( "click_begin" );
var logo_box = document.getElementById( "logo_box" );
var score1 = document.getElementById( "score1" );
var score2 = document.getElementById( "score2" );
var net = document.getElementById(  "net" );

var ball_bounce_sound = "assets/soundfx/clong.wav";
var player_lost_sound = "assets/soundfx/lose.wav";
var player_won_sound  = "assets/soundfx/win.wav";
var power_up_sound    = "assets/soundfx/power_up.wav";
var speed_up_sound    = "assets/soundfx/speed_up.wav";

var random_dist_per_frame_range = { min: 450, max: 500 };

var velocity_increase = 1.5;

var angle_buffer_in_rad = .17;
var south_upper_bound = ( Math.PI / 2 ) + angle_buffer_in_rad;
var south_lower_bound = ( Math.PI / 2 ) - angle_buffer_in_rad;
var north_upper_bound = ( Math.PI + ( Math.PI / 2 ) ) + angle_buffer_in_rad;
var north_lower_bound = ( Math.PI + ( Math.PI / 2 ) ) - angle_buffer_in_rad;

var random_angle = Math.random( ) * ( Math.PI * 2 );			
while( ( random_angle >= south_lower_bound && random_angle <= south_upper_bound ) || ( random_angle >= north_lower_bound && random_angle <= north_upper_bound ) )
{
	
	random_angle = Math.random( ) * ( Math.PI * 2 );
	
}
//random_angle = Math.PI;
var random_dist_per_frame = Math.floor( ( Math.random( ) * ( random_dist_per_frame_range.max - random_dist_per_frame_range.min ) ) ) + random_dist_per_frame_range.min;			
var velocity = { x: Math.cos( random_angle ) * random_dist_per_frame, y: Math.sin( random_angle ) * random_dist_per_frame };

var random_stupidity_range = { min: 10, max: 50 };
var random_stupidity = Math.floor( ( Math.random( ) * ( random_stupidity_range.max - random_stupidity_range.min ) ) ) + random_stupidity_range.min;

var resetting = 0;
var begin_match = 0;

var foo = 0;

var match = 1;
var passLeft   = 0;
var passRight  = 0;

var player_lost = 0;
var computer_lost = 0;

var timer = 0;			
var fps = 60;			
var start_time = 0;
var request_animation_id = null;

var frames_per_second = 0;
var frames_drawn = 0;
var count_begin_time = new Date( ).getTime( );
var elapsed_time = null;

var pad1  = document.getElementById( "pad1" );
var pad11 = document.getElementById( "pad11" );
var pad12 = document.getElementById( "pad12" );
var pad2  = document.getElementById( "pad2" );
var pad21 = document.getElementById( "pad21" );
var pad22 = document.getElementById( "pad22" );			
var ball  = document.getElementById( "ball" );

lettier.style.left = ( ( wwidth  / 2 ) - ( lettier.clientWidth  / 2 ) ) + "px";
lettier.style.top  = ( ( wheight / 2 ) - ( lettier.clientHeight / 2 ) ) + "px";			

logo_box.style.left = ( ( wwidth  / 2 ) - ( logo_box.clientWidth  / 2 ) ) + "px";
logo_box.style.top  = ( ( wheight / 2 ) - ( logo_box.clientHeight / 2 ) ) + "px";

score1.style.left = ( parseInt( logo_box.style.left, 10 ) + ( score1.clientWidth / 2 ) + 14 ) + "px";
score1.style.top  = ( ( window.innerHeight / 2 ) - ( score1.clientHeight / 2 ) + 4 ) + "px";

score2.style.left = ( ( parseInt( logo_box.style.left, 10 ) + logo_box.clientWidth ) - ( score2.clientWidth ) - 32 ) + "px";
score2.style.top  = ( ( window.innerHeight / 2 ) - ( score2.clientHeight / 2 ) + 4 ) + "px";

logo.style.left = ( ( ( wwidth  / 2 ) - ( logo.clientWidth  / 2 ) ) + 5 ) + "px";
logo.style.top  = ( wheight * 0.456827309 ) + "px";

click_begin.style.left = ( ( ( wwidth  / 2 ) - ( logo.clientWidth  / 2 ) ) + ( wwidth * 0.0046875 ) ) + "px";
click_begin.style.top  = ( ( parseInt( logo_box.style.top, 10 ) + logo_box.clientHeight ) + ( wheight * 0.0015625 ) ) + "px";

pad1.style.top = ( wheight / 2 - 50 ) + "px";
pad1.style.left = 25 + "px";
pad1.style.height = 100 + "px";

pad11.style.top = ( wheight - 50 ) + "px";
pad11.style.left = ( ( wwidth / 2 ) / 2 - 50 ) + "px";
pad11.style.height = 25 + "px";
pad11.style.width = 100 + "px";

pad12.style.top = ( 25 ) + "px";
pad12.style.left = ( (wwidth/2)/2 - 50 ) + "px";
pad12.style.height = 25 + "px";
pad12.style.width = 100 + "px";

pad2.style.top =  ( wheight / 2 - 50 ) + "px";
pad2.style.left = ( wwidth - 50 ) + "px";
pad2.style.height = 100 + "px";

pad21.style.top = ( wheight - 50 ) + "px";
pad21.style.left = ( ( ( wwidth / 2 ) + ( ( wwidth / 2 ) / 2 ) ) - 50 ) + "px";
pad21.style.height = 25 + "px";
pad21.style.width = 100 + "px";

pad22.style.top = ( 25 ) + "px";
pad22.style.left = ( ( ( wwidth / 2 ) + ( ( wwidth / 2 ) / 2 ) ) - 50 ) + "px";
pad22.style.height = 25 + "px";
pad22.style.width = 100 + "px";

computer_cursor.style.top  = ( parseInt( pad2.style.top, 10 )   + ( pad2.clientHeight / 2 ) ) + "px";
computer_cursor.style.left = ( parseInt( pad21.style.left, 10 ) + ( pad21.clientWidth / 2 ) ) + "px";

net.style.left = ( wwidth / 2 ) + "px";
net.style.height = wheight + "px";

var ball_home = { x: wwidth * 0.49296875, y: wheight * 0.462981744 };

ball.className = "ball_in_play";
ball.style.left = ( ball_home.x ) + "px";
ball.style.top  = ( ball_home.y ) + "px";

var ball_position = { x: parseInt( ball.style.left, 10 ) + ( ball.clientWidth / 2 ), y: parseInt( ball.style.top, 10 ) + ( ball.clientHeight / 2 ) };

// EVENT CALL BACKS

document.onmousemove = handle_mouse_move;

window.onclick = handle_mouse_click;

document.onkeyup = handlekey;

window.onresize = size_window_elements;

function handlekey( kevent )
{
	var key = ( window.event ) ? event.keyCode : kevent.keyCode;
	
	//debug.innerHTML = key +"";
	
	// ENABLE CHEAT CODES AND RESET BUTTON.
	
	switch ( key )
	{
		
		case 82: // [r] key.
			
			resetting = 1;						
			
			break;
			
		case 66: // [b] key.
		
			play_sound( power_up_sound );
		
			pad1.style.height = 200 + "px";
			pad11.style.width = 200 + "px";
			pad12.style.width = 200 + "px";
		
			break;
			
		case 86: // [v] key.
		
			play_sound( speed_up_sound );
			
			velocity.x = velocity.x * 3;
			velocity.y = velocity.y * 3;
			
			break;
			
	}
}

function handle_mouse_click( mevent )
{
	mevent = ( window.event ) ? window.event : mevent;
	
	if ( mevent.button == 0 ) 
	{
		
		begin_match = 1;
		
		click_begin_text.style.visibility = "hidden";
	
	}
}

function handle_mouse_move( mevent )
{
	mevent = ( window.event ) ? window.event : mevent;
	pad1.style.top = ( mevent.clientY - 50 ) + "px";
	pad11.style.left = ( mevent.clientX - 50 ) + "px";
	pad12.style.left = ( mevent.clientX - 50 ) + "px";
	
	if ( ( parseInt( pad1.style.top, 10 ) + parseInt( pad1.style.height, 10 ) )  > ( wheight - 50 ) )
	{
			pad1.style.top = ( ( wheight - 50 ) - parseInt( pad1.style.height, 10 ) ) + "px";
	}
	else if ( ( parseInt( pad1.style.top, 10 ) )  < 50 )
	{
		pad1.style.top = ( 50 ) + "px";
	}
		
	if ( ( parseInt( pad11.style.left, 10 ) + parseInt( pad11.style.width, 10 ) )  > ( wwidth / 2 ) )
	{
			pad11.style.left = ( ( wwidth / 2 ) - parseInt( pad11.style.width, 10 ) ) + "px";
			pad12.style.left = ( ( wwidth / 2 ) - parseInt( pad12.style.width, 10 ) ) + "px";
	}
	else if ( ( parseInt( pad11.style.left, 10 ) )  < 50 )
	{
		pad11.style.left = ( 50 ) + "px";
		pad12.style.left = ( 50 ) + "px";
	}				
	
}

function play_sound( src )
{
	
	var audio = document.createElement( "audio" );
	audio.src = src;

	audio.addEventListener( "ended", function ( ) 
	{ 
	
		try
		{
		
			document.removeChild( this ); 
			
		}
		catch ( error )
		{
		
		}
		
	}, false );

	audio.play(); 
	
}

function move_computer_paddles( stupidity )
{

	/*
	var ballTop   = parseInt(  ball.style.top, 10 );
	var ballLeft  = parseInt(  ball.style.left, 10 );				
	var pad2Top   = parseInt(  pad2.style.top, 10 );
	var pad21Left = parseInt( pad21.style.left, 10 );
	*/
	
	var ballLeft = null;
	var ball_location = null;
	
	if ( !use_css_transform )
	{
	
		ballLeft = parseInt(  ball.style.left, 10 );				
		ball_location = { x: parseInt(  ball.style.left, 10 ) + ( ball.clientWidth / 2 ), y: parseInt(  ball.style.top, 10 ) + ( ball.clientHeight / 2 ) };
	
	}
	else
	{
	
		ballLeft = ball_position.x - ( ball.clientWidth / 2 );				
		ball_location = ball_position;				
	
	}				
	
	wwidth  = window.innerWidth;
	wheight = window.innerHeight;
	
	if ( ( ballLeft + ball.clientWidth ) < ( wwidth / 2 ) ) return;				
	
	if ( stupidity == 0 ) { stupidity = 0; }
	if ( stupidity < 0 )  { stupidity = 1; }
	
		pad2.style.top = ( ball_location.y - ( ( pad2.clientHeight  / 2 ) - stupidity ) ) + "px";				
	pad21.style.left = ( ball_location.x - ( ( pad21.clientHeight / 2 ) - stupidity ) ) + "px";
	pad22.style.left = ( ball_location.x - ( ( pad22.clientHeight / 2 ) - stupidity ) ) + "px";
	
	if ( ( parseInt( pad2.style.top, 10 ) + pad2.clientHeight ) > ( wheight - 50 ) )
	{
			pad2.style.top = ( wheight - pad2.clientHeight - 50 ) + "px";
	}
	else if ( ( parseInt( pad2.style.top, 10 ) ) < 50 )
	{
		pad2.style.top = ( 50 ) + "px";
	}
	
	if ( parseInt( pad21.style.left, 10 ) < ( wwidth / 2 ) )
	{
			pad21.style.left = ( wwidth / 2 ) + "px";
			pad22.style.left = ( wwidth / 2 ) + "px";
	}
	else if ( ( parseInt( pad21.style.left, 10 ) + parseInt( pad21.style.width, 10 ) ) >= ( wwidth - 50 ) )
	{
		pad21.style.left = ( ( wwidth - 50 ) - parseInt( pad21.style.width, 10 ) ) + "px";
		pad22.style.left = ( ( wwidth - 50 ) - parseInt( pad22.style.width, 10 ) ) + "px";
	}
	
	computer_cursor.style.top  = ( parseInt( pad2.style.top, 10 )   + ( pad2.clientHeight / 2 ) ) + "px";
	computer_cursor.style.left = ( parseInt( pad21.style.left, 10 ) + ( pad21.clientWidth / 2 ) ) + "px";
	
}

function updateScore( )
{
	score1.innerHTML =  passLeft + "";
	score2.innerHTML =  passRight + "";
	
	// Have the computer's score text grow from the right.
	
	score2.style.left = ( ( parseInt( logo_box.style.left, 10 ) + logo_box.clientWidth ) - ( score2.clientWidth ) - 32 ) + "px";
}

function return_ball_back_to_home( timestamp )
{
	var target = { x: ball_home.x, y: ball_home.y };
	
	var ball_current_pos = null;
	
	if ( !use_css_transform ) ball_current_pos = { x: parseInt( ball.style.left, 10 ), y: parseInt( ball.style.top, 10 ) };
	else ball_current_pos = ball_position;
	
	var dist_to_target = Math.sqrt( Math.pow( ( target.x - ball_current_pos.x ), 2 ) + Math.pow( ( target.y - ball_current_pos.y ), 2 ) );
	
	var angle_to_target = Math.atan2( target.y - ball_current_pos.y, target.x - ball_current_pos.x );				

	if ( dist_to_target > 5.0 )
	{
		
		ball.className = "ball_not_in_play";
		
		if ( dist_to_target <= 200 ) dist_to_target = 200;

		velocity.x = Math.cos( angle_to_target ) * dist_to_target;
		velocity.y = Math.sin( angle_to_target ) * dist_to_target;
	
	}
	else
	{
		reset( );
	}

}			

function reset( )
{

	click_begin_text.style.visibility = "visible";
	
	ball.className = "ball_in_play";
	
	if ( !use_css_transform )
	{

		ball.style.left = ( ball_home.x ) + "px";
		ball.style.top  = ( ball_home.y ) + "px";
		
	}
	else
	{
		
		ball.style.left = ( ball_home.x ) + "px";
		ball.style.top  = ( ball_home.y ) + "px";
		
		ball_position = { x: ball_home.x + ( ball.clientWidth / 2 ), y: ball_home.y + ( ball.clientHeight / 2 ) };					
		ball.style.MozTransform = "translateX(" + ( 0 ) + "px ) translateY(" + ( 0 ) + "px )";
		
	}				
	
	pad1.style.height = 100 + "px";
	pad11.style.width = 100 + "px";
	pad12.style.width = 100 + "px";
	
	pad2.style.height = 100 + "px";
	pad21.style.width = 100 + "px";
	pad22.style.width = 100 + "px";
	
	if ( player_lost == 1 ) // Shoot the ball back at the player using angles 95deg to 265deg.
	{
	
		random_angle = ( ( Math.PI / 2 ) + .09 ) + ( Math.random( ) * ( ( Math.PI + ( ( Math.PI / 2 ) - .09 ) ) - ( ( Math.PI / 2 ) + .09 ) ) );			
		random_dist_per_frame = Math.floor( ( Math.random( ) * ( random_dist_per_frame_range.max - random_dist_per_frame_range.min ) ) ) + random_dist_per_frame_range.min;			
		velocity = { x: Math.cos( random_angle ) * random_dist_per_frame, y: Math.sin( random_angle ) * random_dist_per_frame };
	
	}
	else if ( computer_lost == 1 ) // Shoot the ball back at the computer using angles 5deg to 85 deg.
	{
		
		random_angle = ( 0.09 ) + ( Math.random( ) * ( ( ( Math.PI / 2 ) - .09 ) - ( 0.09 ) ) ); // 5deg - ( rand[0,1) * ( 85deg - 5deg ) )			
		random_dist_per_frame = Math.floor( ( Math.random( ) * ( random_dist_per_frame_range.max - random_dist_per_frame_range.min ) ) ) + random_dist_per_frame_range.min;			
		velocity = { x: Math.cos( random_angle ) * random_dist_per_frame, y: Math.sin( random_angle ) * random_dist_per_frame };
		
	}
	else
	{
		random_angle = Math.random( ) * ( Math.PI * 2 );			
		while( ( random_angle >= south_lower_bound && random_angle <= south_upper_bound ) || ( random_angle >= north_lower_bound && random_angle <= north_upper_bound ) )
		{
			
			random_angle = Math.random( ) * ( Math.PI * 2 );
			
		}			
		random_dist_per_frame = Math.floor( ( Math.random( ) * ( random_dist_per_frame_range.max - random_dist_per_frame_range.min ) ) ) + random_dist_per_frame_range.min;			
		velocity = { x: Math.cos( random_angle ) * random_dist_per_frame, y: Math.sin( random_angle ) * random_dist_per_frame };
	}
	
	player_lost = 0;
	computer_lost = 0;
	
	resetting = 0;
	
	begin_match = 0;
	
	random_stupidity = Math.floor( ( Math.random( ) * ( random_stupidity_range.max - random_stupidity_range.min ) ) ) + random_stupidity_range.min;
	
}

function checkCollisions( time_delta )
{
	
	var buffer = 2.0
	
	var wwidth = window.innerWidth;
	var wheight = window.innerHeight;
	
	var ballLeft = null;
	var ballRight = null;
	var ballTop = null;
	var ballBottom = null;				
	
	if ( !use_css_transform )
	{
	
		ballLeft = parseInt( ball.style.left, 10 );
		ballRight = parseInt( ball.style.left, 10 ) + ball.clientWidth;
		ballTop = parseInt( ball.style.top, 10 );
		ballBottom = parseInt( ball.style.top, 10 ) + ball.clientHeight;
	}
	else
	{
		ballLeft = ball_position.x - ( ball.clientWidth / 2 );
		ballRight = ball_position.x + ( ball.clientWidth / 2 );
		ballTop = ball_position.y - ( ball.clientHeight / 2 );
		ballBottom = ball_position.y + ( ball.clientHeight / 2 );
	}
	
	if ( ballLeft <= ( wwidth / 2 ) ) // COLLISION WITH PLAYER'S PADDLES
	{
	
		var pad1Left = parseInt( pad1.style.left, 10 );
		var pad1Right = parseInt( pad1.style.left, 10 ) + pad1.clientWidth;
		var pad1Top = parseInt( pad1.style.top, 10 );
		var pad1Bottom = parseInt( pad1.style.top, 10 ) + pad1.clientHeight;
		
		var pad11Left = parseInt( pad11.style.left, 10 );
		var pad11Right = parseInt( pad11.style.left, 10 ) + pad11.clientWidth;
		var pad11Top = parseInt( pad11.style.top, 10 );
		var pad11Bottom = parseInt( pad11.style.top, 10 ) + pad11.clientHeight;
		
		var pad12Left = parseInt( pad12.style.left, 10 );
		var pad12Right = parseInt( pad12.style.left, 10 ) + pad12.clientWidth;
		var pad12Top = parseInt( pad12.style.top, 10 );
		var pad12Bottom = parseInt( pad12.style.top, 10 ) + pad12.clientHeight;
	
		if ( !( ballRight < pad1Left || ballLeft > pad1Right || ballBottom < pad1Top || ballTop > pad1Bottom ) ) // PLAYER'S LEFT PADDLE
		{
		
			if ( pad1.clientHeight > 0 )
			{
			
				if ( !use_css_transform ) ball.style.left = ( pad1Right + buffer ) + "px";
				else ball_position.x = pad1Right + ( ball.clientWidth / 2 ) + buffer;
				
				var magnitude = Math.sqrt( Math.pow( ( velocity.y ), 2 ) + Math.pow( ( velocity.x  ), 2 ) );
				var ball_orientation = Math.atan2( velocity.y / magnitude, velocity.x / magnitude );
				reflection_angle = -1 * ( ball_orientation - Math.PI );
				velocity.x = ( Math.cos( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				velocity.y = ( Math.sin( reflection_angle ) * random_dist_per_frame ) * velocity_increase;							
				pad1.style.height = ( parseInt( pad1.style.height, 10 ) - 10 ) + "px";
				
				play_sound( ball_bounce_sound );
				
				return;
				
			}
			
		}
		
		// COLLISION WITH THE UPPER AND LOWER PADDLES
		
		if ( !( ballRight < pad11Left || ballLeft > pad11Right || ballBottom < pad11Top || ballTop > pad11Bottom ) ) // PLAYER'S BOTTOM PADDLE
		{
		
			if ( pad11.clientWidth > 0 )
			{
			
				if ( !use_css_transform ) ball.style.top = ( pad11Top - ball.clientHeight - buffer ) + "px";
				else ball_position.y = pad11Top - ( ball.clientHeight / 2 ) - buffer;
				
				var magnitude = Math.sqrt( Math.pow( ( velocity.y ), 2 ) + Math.pow( ( velocity.x  ), 2 ) );
				var ball_orientation = Math.atan2( velocity.y / magnitude, velocity.x / magnitude );
				reflection_angle = ball_orientation - Math.PI;
				reflection_angle = ( Math.PI * 2 ) + reflection_angle;
				reflect_by = ( ( Math.PI + ( Math.PI / 2 ) ) - reflection_angle ) * 2; 
				reflection_angle = reflection_angle + reflect_by;
				velocity.x = ( Math.cos( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				velocity.y = ( Math.sin( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				
				pad11.style.width = ( parseInt( pad11.style.width, 10 ) - 10 ) + "px";
				
				play_sound( ball_bounce_sound );
				
				return;
			
			}
		
		}
		
		if ( !( ballRight < pad12Left || ballLeft > pad12Right || ballBottom < pad12Top || ballTop > pad12Bottom ) ) // PLAYER'S TOP PADDLE
		{
		
			if ( pad12.clientWidth > 0 )
			{
			
				if ( !use_css_transform ) ball.style.top = ( pad12Bottom + buffer ) + "px";
				else ball_position.y = pad12Bottom + ( ball.clientHeight / 2 ) + buffer;
				
				var magnitude = Math.sqrt( Math.pow( ( velocity.y ), 2 ) + Math.pow( ( velocity.x  ), 2 ) );
				var ball_orientation = Math.atan2( velocity.y / magnitude, velocity.x / magnitude ); // -100deg or 260deg
				reflection_angle = ( Math.PI * 2 ) + ball_orientation; // 360 + (-100) = 260
				reflection_angle = reflection_angle - Math.PI; // 260 - 180 = 80
				reflect_by = ( ( Math.PI / 2 ) - reflection_angle ) * 2; // ( 90 - 80 ) * 2 = 20
				reflection_angle = reflection_angle + reflect_by; // 80 + 20 = 100
				velocity.x = ( Math.cos( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				velocity.y = ( Math.sin( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				
				pad12.style.width = ( parseInt( pad12.style.width, 10 ) - 10 ) + "px";
				
				play_sound( ball_bounce_sound );
				
				return;
			
			}
		
		}
	
	}
	else if ( ballLeft > ( wwidth / 2 ) ) // COLLISION WITH COMPUTER'S PADDLES
	{
	
		var pad2Left = parseInt( pad2.style.left, 10 );
		var pad2Right = parseInt( pad2.style.left, 10 ) + pad2.clientWidth;
		var pad2Top = parseInt( pad2.style.top, 10 );
		var pad2Bottom = parseInt( pad2.style.top, 10 ) + pad2.clientHeight;
		
		var pad21Left = parseInt( pad21.style.left, 10 );
		var pad21Right = parseInt( pad21.style.left, 10 ) + pad21.clientWidth;
		var pad21Top = parseInt( pad21.style.top, 10 );
		var pad21Bottom = parseInt( pad21.style.top, 10 ) + pad21.clientHeight;
		
		var pad22Left = parseInt( pad22.style.left, 10 );
		var pad22Right = parseInt( pad22.style.left, 10 ) + pad22.clientWidth;
		var pad22Top = parseInt( pad22.style.top, 10 );
		var pad22Bottom = parseInt( pad22.style.top, 10 ) + pad22.clientHeight;
		
	
		if ( !( ballRight < pad2Left || ballLeft > pad2Right || ballBottom < pad2Top || ballTop > pad2Bottom ) ) // COMPUTER'S RIGHT PADDLE
		{
		
			if ( pad2.clientHeight > 0 ) // Ball shouldn't collide with a zero dimension paddle.
			{
			
				if ( !use_css_transform ) ball.style.left = ( pad2Left - ball.clientWidth - buffer ) + "px";
				else ball_position.x = pad2Left - ( ball.clientWidth / 2 ) - buffer;
				
				var magnitude = Math.sqrt( Math.pow( ( velocity.y ), 2 ) + Math.pow( ( velocity.x  ), 2 ) );
				var ball_orientation = Math.atan2( velocity.y / magnitude, velocity.x / magnitude );
				reflection_angle = -1 * ( ball_orientation - Math.PI );
				velocity.x = ( Math.cos( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				velocity.y = ( Math.sin( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				
				pad2.style.height = ( parseInt( pad2.style.height, 10 ) - 10 ) + "px";
				
				play_sound( ball_bounce_sound );
				
				return;
				
			}
			
		}				
		
		if ( !( ballRight < pad21Left || ballLeft > pad21Right || ballBottom < pad21Top || ballTop > pad21Bottom ) ) // COMPUTER'S BOTTOM PADDLE
		{
		
			if ( pad21.clientWidth > 0 )
			{
			
				if ( !use_css_transform ) ball.style.top = ( pad21Top - ball.clientHeight - buffer ) + "px";
				else ball_position.y = pad21Top - ( ball.clientHeight / 2 ) - buffer;
				
				var magnitude = Math.sqrt( Math.pow( ( velocity.y ), 2 ) + Math.pow( ( velocity.x  ), 2 ) );
				var ball_orientation = Math.atan2( velocity.y / magnitude, velocity.x / magnitude );
				reflection_angle = ball_orientation - Math.PI;
				reflection_angle = ( Math.PI * 2 ) + reflection_angle;
				reflect_by = ( ( Math.PI + ( Math.PI / 2 ) ) - reflection_angle ) * 2; 
				reflection_angle = reflection_angle + reflect_by;
				velocity.x = ( Math.cos( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				velocity.y = ( Math.sin( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				
				pad21.style.width = ( parseInt( pad21.style.width, 10 ) - 10 ) + "px";
				
				play_sound( ball_bounce_sound );
				
				return;
			
			}
		
		}
		
		if ( !( ballRight < pad22Left || ballLeft > pad22Right || ballBottom < pad22Top || ballTop > pad22Bottom ) ) // COMPUTER'S TOP PADDLE
		{
		
			if ( pad22.clientWidth > 0 )
			{
			
				if ( !use_css_transform ) ball.style.top = ( pad22Bottom + buffer ) + "px";
				else ball_position.y = pad22Bottom + ( ball.clientHeight / 2 ) + buffer;
				
				var magnitude = Math.sqrt( Math.pow( ( velocity.y ), 2 ) + Math.pow( ( velocity.x  ), 2 ) );
				var ball_orientation = Math.atan2( velocity.y / magnitude, velocity.x / magnitude ); // -100deg or 260deg
				reflection_angle = ( Math.PI * 2 ) + ball_orientation; // 360 + (-100) = 260
				reflection_angle = reflection_angle - Math.PI; // 260 - 180 = 80
				reflect_by = ( ( Math.PI / 2 ) - reflection_angle ) * 2; // ( 90 - 80 ) * 2 = 20
				reflection_angle = reflection_angle + reflect_by; // 80 + 20 = 100
				velocity.x = ( Math.cos( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				velocity.y = ( Math.sin( reflection_angle ) * random_dist_per_frame ) * velocity_increase;
				
				pad22.style.width = ( parseInt( pad22.style.width, 10 ) - 10 ) + "px";
				
				play_sound( ball_bounce_sound );
				
				return;
				
			}
		
		}
	
	}
	
	// CHECK FOR BALL OUT OF BOUNDS
	
	if ( ( ballRight >= wwidth ) || ( ( ballTop <= 0 ) && ( ballLeft > ( wwidth / 2 ) ) ) || ( ( ballBottom >= wheight ) && ( ballLeft > ( wwidth / 2 ) ) ) )
	{
		
		play_sound( player_won_sound );
		
		passLeft += 1;
		
		computer_lost = 1;
		player_lost = 0;
		
		updateScore( );
		
		resetting = 1;
		
		return;
	}
	
	if ( ( ballLeft <= 0 ) || ( ( ballTop <= 0 ) && ( ballLeft <= ( wwidth / 2 ) ) ) || ( ( ballBottom >= wheight ) && ( ballLeft <= ( wwidth / 2 ) ) ) )
	{
		
		play_sound( player_lost_sound );
		
		passRight += 1;
		
		computer_lost = 0;
		player_lost = 1;
		
		updateScore( );
		
		resetting = 1;
		
		return;
	}
	
}

function move_ball( time_delta )
{

	if ( !use_css_transform )
	{
	
		ball.style.top  = ( ( velocity.y * time_delta ) + ( parseInt( ball.style.top,  10 ) ) ) + "px";
		ball.style.left = ( ( velocity.x * time_delta ) + ( parseInt( ball.style.left, 10 ) ) ) + "px";
		
	}
	else
	{
	
		ball_position = { x: ball_position.x + ( velocity.x * time_delta ), y: ball_position.y + ( velocity.y * time_delta ) };					
		offset = { x: ball_position.x - ( parseInt( ball.style.left, 10 ) + ( ball.clientWidth / 2 ) ), y: ball_position.y - ( parseInt( ball.style.top, 10 ) + ( ball.clientHeight / 2 ) ) };
		ball.style.MozTransform = "translateX(" + ( offset.x ) + "px ) translateY(" + ( offset.y ) + "px )";
		ball.style.webkitTransform = "translateX(" + ( offset.x ) + "px ) translateY(" + ( offset.y ) + "px )";
		//debug.innerHTML = "ball_position: " + ball_position.x + " " + ball_position.y + "<br>Offset: " + offset.x + " " + offset.y;
		
	}	
	
}			

function size_window_elements( )
{
	
	resetting = 1;
	
	begin_match = 0;
	
	wwidth  = window.innerWidth;
	wheight = window.innerHeight;
	
	lettier.style.left = ( ( wwidth  / 2 ) - ( lettier.clientWidth  / 2 ) ) + "px";
	lettier.style.top  = ( ( wheight / 2 ) - ( lettier.clientHeight / 2 ) ) + "px";
	
	logo_box.style.left = ( ( wwidth  / 2 ) - ( logo_box.clientWidth  / 2 ) ) + "px";
	logo_box.style.top  = ( ( wheight / 2 ) - ( logo_box.clientHeight / 2 ) ) + "px";
	
	score1.style.left = ( parseInt( logo_box.style.left, 10 ) + ( score1.clientWidth / 2 ) + 14 ) + "px";
	score1.style.top  = ( ( window.innerHeight / 2 ) - ( score1.clientHeight / 2 ) + 4 ) + "px";
	
	score2.style.left = ( ( parseInt( logo_box.style.left, 10 ) + logo_box.clientWidth ) - ( score2.clientWidth ) - 32 ) + "px";
	score2.style.top  = ( ( window.innerHeight / 2 ) - ( score2.clientHeight / 2 ) + 4 ) + "px";
	
	logo.style.left = ( ( ( wwidth  / 2 ) - ( logo.clientWidth  / 2 ) ) + 5 ) + "px";
	logo.style.top  = ( wheight * 0.456827309 ) + "px";
	
	click_begin.style.left = ( ( ( wwidth  / 2 ) - ( logo.clientWidth  / 2 ) ) + ( wwidth * 0.0046875 ) ) + "px";
	click_begin.style.top  = ( ( parseInt( logo_box.style.top, 10 ) + logo_box.clientHeight ) + ( wheight * 0.0015625 ) ) + "px";
	
	pad1.style.top = ( wheight / 2 - 50 ) + "px";
	pad1.style.left = 25 + "px";
	pad1.style.height = 100 + "px";
	
	pad11.style.top = ( wheight - 50 ) + "px";
	pad11.style.left = ( ( wwidth / 2 ) / 2 - 50 ) + "px";
	pad11.style.height = 25 + "px";
	pad11.style.width = 100 + "px";
	
	pad12.style.top = ( 25 ) + "px";
	pad12.style.left = ( ( wwidth / 2 ) / 2 - 50 ) + "px";
	pad12.style.height = 25 + "px";
	pad12.style.width = 100 + "px";
	
	pad2.style.top =  ( wheight / 2 - 50 ) + "px";
	pad2.style.left = ( wwidth - 50 ) + "px";
	pad2.style.height = 100 + "px";
	
	pad21.style.top = ( wheight - 50 ) + "px";
	pad21.style.left = ( ( ( wwidth / 2 ) + ( ( wwidth / 2 ) / 2 ) ) - 50 ) + "px";
	pad21.style.height = 25 + "px";
	pad21.style.width = 100 + "px";
	
	pad22.style.top = ( 25 ) + "px";
	pad22.style.left = ( ( ( wwidth / 2 ) + ( ( wwidth / 2 ) / 2 ) ) - 50 ) + "px";
	pad22.style.height = 25 + "px";
	pad22.style.width = 100 + "px";
	
	net.style.left = ( wwidth / 2 ) + "px";
	net.style.height = wheight + "px";
	
	ball_home = { x: wwidth * 0.49296875, y: wheight * 0.462981744 };
	
}

function draw( timestamp ) 
{

	// Calculate difference since last repaint.
	
	var time_delta = ( timestamp - start_time ) / 1000; // In seconds.				

	// Reset start time to this repaint.
	
	start_time = timestamp;
	
	// Calculate frames per second being drawn.
	
	elapsed_time = ( now = new Date( ).getTime( ) ) - count_begin_time;
	
	if ( elapsed_time >= 1000 )
	{
	
		count_begin_time = now;
		elapsed_time = 0;
		debug.innerHTML = "FPS: " + frames_per_second;
		frames_per_second = 0;
		
	}
	else
	{
		
		frames_per_second += 1;
	
	}
	
	// RUN GAME
	
	if ( !resetting && begin_match )
	{
	
		move_ball( time_delta ); // Move the ball.					
		
		move_computer_paddles( random_stupidity ); // Move the computer player's paddles.
		
		checkCollisions( time_delta );
		
	}
	else if ( resetting )
	{
		
		move_ball( time_delta );
		
		return_ball_back_to_home( );
		
	}
	
	request_animation_id = window.requestAnimationFrame( draw ); // Request a redraw.

}

request_animation_id = window.requestAnimationFrame( draw );