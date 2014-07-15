/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 */

function Database_Manager( )
{
	
	this.responses = new Array( );
	
	this.get_xml_http = function ( ) 
	{

		var xml_http = null;

		if ( window.XMLHttpRequest ) 
		{	

			xml_http = new XMLHttpRequest( );
			
		}
		else if ( window.ActiveXObject ) 
		{	
			
			xml_http = new ActiveXObject( "Microsoft.XMLHTTP" );
			
		}

		return xml_http;
	}
	
	this.ajax_request = function ( php_file, data, debug_manager_object, response_key, async  )
	{
		
		var request = this.get_xml_http( );

		request.open( "POST", php_file, async ); 

		request.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		request.send( data );
		
		if ( async )
		{

			request.onreadystatechange = function( ) 
			{
				
				if ( request.readyState == 4 )
				{
					
					if ( request.status === 200 )
					{
						
						debug_manager_object.responses[ response_key ] = request.responseText;
						
					} 
					else 
					{
						
						console.warn( "[Database_Manager:send_and_receive] Send request failed." );
						
					}

				}
				else
				{
					
				}
				
			}
			
		}
		else
		{
			
			debug_manager_object.responses[ response_key ] = request.responseText;
			
		}
	}
	
	this.send_and_receive = function ( php_file, data, debug_manager_object, response_key, async )
	{
		
		if ( async == undefined ) async = true;
		
		this.ajax_request( php_file, data, debug_manager_object, response_key, async );
		
	}	
	
}