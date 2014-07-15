/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 * Uses a canvas to graphically render the directed graph containing nodes and edges of a neural network. 
 * 
 */

function Input_Node( params )
{
	
	this.id = params.id;
	
	this.dimensions = { width: params.width, height: params.height };
	
	this.position = { x: params.x, y: params.y };
	
	this.background_color = params.background_color;
	
	this.border_color = params.border_color;

	this.border_thickness = params.border_thickness;
	
	this.rectangle = new fabric.Rect( { left:        this.position.x, 
							      top:         this.position.y, 
							      width:       this.dimensions.width, 
							      height:      this.dimensions.height,
								 stroke:      this.border_color,
								 strokeWidth: this.border_thickness, 
							      fill:        this.background_color } );
	
	this.rectangle.hasControls = this.rectangle.hasBorders = false;
	
	this.input_edge = param.input_edge;
	
	this.output_edges = param.output_edges;	
	
	this.update =  function( object_moving ) {
		
		this.position.x = this.rectangle.get( 'left' );
		this.position.y = this.rectangle.get( 'top' );
		
		this.input_edge.update( {			
							 from: { x: this.position.x - 100, y: this.position.y },
							 to:   { x: this.position.x,       y: this.position.y }
							 label: this.input_edge.label
		} );
		
		for ( var i = 0; i < this.output_edges.length; ++i )
		{
			
			this.output_edges[ i ].update( {			
									   from: { x: this.position.x, y: this.position.y },
									   to:   { x: this.output_edges[ i ].line.get( 'x2' ), y: this.output_edges[ i ].line.get( 'y2' ) },
									   label: this.output_edges[ i ].label
			} ); 
			
		}
		
	}

	var rectangle = this.rectangle;
	
	rectangle.__Graph_Input_Node = this;

	rectangle.on( 'moving', function ( obj ) { rectangle.__Graph_Input_Node.update( object_moving ) } );

	params.canvas.add( rectangle );
	
}

function Hidden_Node( params )
{
	
	this.id = params.id;
	
	this.radius = params.radius;
	
	this.position = { x: params.x, y: params.y };
	
	this.background_color = params.background_color;
	
	this.border_color = params.border_color;

	this.border_thickness = params.border_thickness;
	
	this.rectangle = new fabric.Circle( { left:        this.position.x, 
							        top:         this.position.y, 
							        radius:      this.radius,
								   stroke:      this.border_color,
								   strokeWidth: this.border_thickness, 
							        fill:        this.background_color } );
	
	this.circle.hasControls = this.circle.hasBorders = false;
	
	this.input_edges = param.input_edges;
	
	this.output_edges = param.output_edges;	
	
	this.update =  function( object_moving ) {
		
		this.position.x = this.circle.get( 'left' );
		this.position.y = this.circle.get( 'top' );
		
		for ( var i = 0; i < this.output_edges.length; ++i )
		{		
			this.input_edges[ i ].update( {			
								       from: { x: this.input_edges[ i ].line.get( 'x1' ), y: this.input_edges[ i ].line.get( 'y1' ) },
								       to:   { x: this.position.x,                        y: this.position.y }
								       label: this.input_edges[ i ].label
			} );
			
		}
		
		for ( var i = 0; i < this.output_edges.length; ++i )
		{
			
			this.output_edges[ i ].update( {			
									   from: { x: this.position.x, y: this.position.y },
									   to:   { x: this.output_edges[ i ].line.get( 'x2' ), y: this.output_edges[ i ].line.get( 'y2' ) },
									   label: this.output_edges[ i ].label
			} ); 
			
		}
		
	}

	var circle = this.circle;
	
	circle.__Graph_Hidden_Node = this;

	circle.on( 'moving', function ( obj ) { circle.__Graph_Hidden_Node.update( object_moving ) } );

	params.canvas.add( circle );
	
}

function Output_Node( params )
{
	
	this.id = params.id;
	
	this.radius = params.radius;
	
	this.position = { x: params.x, y: params.y };
	
	this.background_color = params.background_color;
	
	this.border_color = params.border_color;

	this.border_thickness = params.border_thickness;
	
	this.rectangle = new fabric.Circle( { left:        this.position.x, 
							        top:         this.position.y, 
							        radius:      this.radius,
								   stroke:      this.border_color,
								   strokeWidth: this.border_thickness, 
							        fill:        this.background_color } );
	
	this.circle.hasControls = this.circle.hasBorders = false;
	
	this.input_edges = param.input_edges;
	
	this.output_edge = param.output_edge;	
	
	this.update =  function( object_moving ) {
		
		this.position.x = this.circle.get( 'left' );
		this.position.y = this.circle.get( 'top' );
		
		for ( var i = 0; i < this.output_edges.length; ++i )
		{		
			this.input_edges[ i ].update( {			
								       from: { x: this.input_edges[ i ].line.get( 'x1' ), y: this.input_edges[ i ].line.get( 'y1' ) },
								       to:   { x: this.position.x,                        y: this.position.y }
								       label: this.input_edges[ i ].label
			} );
			
		}
		
		this.output_edge.update( {			
							  from: { x: this.position.x,       y: this.position.y },
							  to:   { x: this.position.x + 100, y: this.position.y },
							  label: this.output_edge.label
		} ); 
		
	}

	var circle = this.circle;
	
	circle.__Graph_Output_Node = this;

	circle.on( 'moving', function ( obj ) { circle.__Graph_Output_Node.update( object_moving ) } );

	params.canvas.add( circle );
	
}

function Edge( params )
{
	
	this.id = params.id;
	
	this.from_to = { from: { x: params.from.x, y: params.from.y }, to: { x: params.to.x, y: params.to.y } };
	
	this.thickness = params.thickness;
	
	this.label = params.label;
	
	this.label_bottom_padding = params.label_bottom_padding;
	
	this.background_color = params.background_color;
	
	this.border_color = params.border_color;
	
	this.font_face = params.font_face;
	
	this.font_size = params.font_size;	
	
	// From: x1, y1.
	//   To: x2, y2.
	
	var angle = Math.atan2( this.from_to.to.y - this.from_to.from.y, this.from_to.to.x - this.from_to.from.x );
	
	var left = null;
	var top  = null;
	
	this.text = null;
	
	if ( ( angle > ( Math.PI / 2 ) ) && ( angle < ( Math.PI + ( Math.PI / 2 ) ) ) )
	{
		
		// Between 90 degrees and 270 degrees so make text right side up.
		
		left = ( this.from_to.from.x + ( ( this.from_to.to.x - this.from_to.from.x ) / 2 ) ) - ( this.label_bottom_padding * Math.sin( angle ) );

		top  = ( this.from_to.from.y + ( ( this.from_to.to.y - this.from_to.from.y ) / 2 ) ) + ( this.label_bottom_padding * Math.cos( angle ) );
		
		this.text = new fabric.Text( this.label, { selectable: false, left: left, top: top, fontFamily: this.font_face, fontSize: this.font_size, angle: ( angle * ( 180 / Math.PI ) ) - 180 } );
		
	}
	else
	{
	
		left = ( this.from_to.from.x + ( ( this.from_to.to.x - this.from_to.from.x ) / 2 ) ) + ( this.label_bottom_padding * Math.sin( angle ) );

		top  = ( this.from_to.from.y + ( ( this.from_to.to.y - this.from_to.from.y ) / 2 ) ) - ( this.label_bottom_padding * Math.cos( angle ) );
		
		this.text = new fabric.Text( this.label, { selectable: false, left: left, top: top, fontFamily: this.font_face, fontSize: this.font_size, angle: angle * ( 180 / Math.PI ) } );
		
	}	
	
	this.line = new fabric.Line( [ this.from_to.from.x, this.from_to.from.y, this.from_to.to.x, this.from_to.to.y ] {
		
		fill: this.background_color,
		
		stroke: this.border_color,
		
		strokeWidth: this.thickness,
		
		selectable: false
		
	} );
	
	this.get_angle_in_radians = function ( )
	{
		
		return Math.atan2( this.line.get( 'y2' ) - this.line.get( 'y1' ), this.line.get( 'x2' ) - this.line.get( 'x1' ) );
		
	}
	
	this.get_angle_in_degrees = function ( )
	{
		
		return Math.atan2( this.line.get( 'y2' ) - this.line.get( 'y1' ), this.line.get( 'x2' ) - this.line.get( 'x1' ) ) * ( 180 / Math.PI ) );
		
	}
	
	this.update = function ( params )
	{

		this.from_to.from.x = params.from.x;
		this.from_to.from.y = params.from.y;
		this.from_to.to.x   = params.to.x;
		this.from_to.to.y   = params.to.y;
		
		this.label = params.label;		
		
		var angle = Math.atan2( this.from_to.to.y - this.from_to.from.y, this.from_to.to.x - this.from_to.from.x );
		
		var left = null;
		var top  = null;
		
		if ( ( angle > ( Math.PI / 2 ) ) && ( angle < ( Math.PI + ( Math.PI / 2 ) ) ) )
		{
			
			left = ( this.from_to.from.x + ( ( this.from_to.to.x - this.from_to.from.x ) / 2 ) ) - ( this.label_bottom_padding * Math.sin( angle ) );
	
			top  = ( this.from_to.from.y + ( ( this.from_to.to.y - this.from_to.from.y ) / 2 ) ) + ( this.label_bottom_padding * Math.cos( angle ) );
			
			this.text.set( { text: this.label, left: left, top: top, angle: ( angle * ( 180 / Math.PI ) ) - 180 } );
			
		}
		else
		{
		
			left = ( this.from_to.from.x + ( ( this.from_to.to.x - this.from_to.from.x ) / 2 ) ) + ( this.label_bottom_padding * Math.sin( angle ) );
	
			top  = ( this.from_to.from.y + ( ( this.from_to.to.y - this.from_to.from.y ) / 2 ) ) - ( this.label_bottom_padding * Math.cos( angle ) );
			
			this.text.set( { text: this.label, left: left, top: top, angle: angle * ( 180 / Math.PI ) } );
			
		}
		
		this.line.set( { 'x1': this.from_to.from.x, 'y1': this.from_to.from.y, 'x2': this.from_to.to.x , 'y2': this.from_to.to.y  } );		
		
	}
	
	var line = this.line;
	
	var line.__Graph_Edge = this;
	
	params.canvas.add( line.__Graph_Edge.text );
	
	params.canvas.add( line );
	
}

function Visualize_Neural_Network( neural_network, params )
{
	
	this.number_of_input_nodes = neural_network.input_layer.length;
	
	this.number_of_hidden_layers = 0;
	
	this.number_of_hidden_nodes_per_hidden_layer = 0;
	
	for ( var i = 0; i < neural_network.hidden_layers.length; ++i )
	{
		
		this.number_of_hidden_layers += 1;
		
		this.number_of_hidden_nodes_per_hidden_layer = neural_network.hidden_layers[ i ].length;
		
	}
	
	this.number_of_output_nodes = neural_network.output_layer.length;
	
	this.biggest_number_of_nodes_in_any_layer = 0;
	
	this.biggest_layer = "none";
	
	if ( this.biggest_number_of_nodes_in_any_layer < this.number_of_input_nodes )
	{
		
		this.biggest_number_of_nodes_in_any_layer = this.number_of_input_nodes;
		
		this.biggest_layer = "input";
		
	}
	
	if ( this.biggest_number_of_nodes_in_any_layer < this.number_of_hidden_nodes_per_hidden_layer )
	{
		
		this.biggest_number_of_nodes_in_any_layer = this.number_of_hidden_nodes_per_hidden_layer;
		
		this.biggest_layer = "hidden";
		
	}
	
	if ( this.biggest_number_of_nodes_in_any_layer < this.number_of_output_nodes )
	{
		
		this.biggest_number_of_nodes_in_any_layer = this.number_of_output_nodes;
		
		this.biggest_layer = "output";
		
	}
	
	this.number_of_layers = 1 + this.number_of_hidden_layers + 1;	
	
	// Parameters.
	
	var edge_parameters = {
		
		canvas: params.canvas,
		id: null,
		from: { x: null, y: null },
		to: { x: null, y: null },
		thickness: params.edge_thickness,
		label: null,
		label_bottom_padding: params.label_bottom_padding,
		background_color: params.edge_background_color,
		border_color: params.edge_border_color,
		font_face: params.edge_label_font_face,
		font_size: params.edge_label_font_size
		
	};
	
	var input_node_parameters = {
		
		canvas: params.canvas,
		id: null,
		width: params.input_node_width,
		height: params.input_node_height,
		x: null,
		y: null,
		background_color: params.input_node_background_color,
		border_color: params.input_node_border_color,
		border_thickness: params.input_node_border_thickness,		
		input_edge: null,
		ouput_edges: null
		
	};
	
	var hidden_node_parameters = {
		
		canvas: params.canvas,
		id: null,
		radius: params.hidden_node_radius,
		x: null,
		y: null,
		background_color: params.hidden_node_background_color,
		border_color: params.hidden_node_border_color,
		border_thickness: params.hidden_node_border_thickness,		
		input_edges: null,
		ouput_edges: null
		
	};
	
	var ouput_node_parameters = {
		
		canvas: params.canvas,
		id: null,
		radius: params.ouput_node_radius,
		x: null,
		y: null,
		background_color: params.ouput_node_background_color,
		border_color: params.ouput_node_border_color,
		border_thickness: params.ouput_node_border_thickness,		
		input_edges: null,
		ouput_edges: null
		
	};
	
	// Create a grid to calculate the placement of all the nodes.
	
	this.vertical_spacing = params.vertical_spacing;
	
	this.horizontal_spacing = params.horizontal_spacing;
	
	this.rows    = this.biggest_number_of_nodes_in_any_layer + ( this.biggest_number_of_nodes_in_any_layer - 1 );
	
	this.columns = this.number_of_layers + ( this.number_of_layers - 1 );
	
	this.grid = [][];
	
	var half_width  = params.input_node_width / 2;
	var half_height = params.input_node_height / 2;
	
	for ( var i = 0; i < this.columns; ++i )
	{
		
		for ( var j = 0; j < this.rows; ++j )
		{
			
			var left = null;
			var top  = null;
			
			
			if ( j == 0 )
			{
			
				left = params.neural_network_left_padding + half_width;
				
			}
			else
			{
				
				left = params.neural_network_left_padding + params.input_node_width + ( j * this.horizontal_spacing ) + half_width;
				
			}
			
			if ( i == 0 )
			{
			
				top = params.neural_network_left_padding + ( params.input_node_width / 2 );
				
			}
			else
			{
				
				top = params.neural_network_top_padding + params.input_node_height + ( i * this.vertical_spacing ) + half_height;
				
			}
			
			this.grid[ i ][ j ].push( { left: left , top: top } );
			
		}
		
	}	
	
	// Create all the edges.
	// First, input edges to input nodes.
	// If hidden layers:
	// 	Then, input edges from the input layer nodes to the first layer of hidden nodes.
	//	Then, input edges from the [hl-2] --- > [hl-3] ---> ... ---> [hl-n].
	//	Then, input edges from [hl-n] to the output layer nodes.
	// Else:
	//	Then, input edges from the input nodes to the output nodes.	
	
	this.input_edges_to_input_nodes     = new Array( );
	
	this.input_edges_to_hidden_nodes    = new Array( );
	
	this.input_edges_to_output_nodes    = new Array( );
	
	this.output_edges_from_output_nodes = new Array( );
	
	for ( var i = 0; i < this.number_of_input_nodes; ++i )
	{
		
		// Push a new edge.
		
		this.input_edges_to_input_nodes.push( null );
		
	}
	
	if ( this.number_of_hidden_layers > 0 )
	{
	
		var temp = [ ];
		
		for ( var j = 0; j < ( this.number_of_input_nodes * this.number_of_hidden_nodes_per_hidden_layer ); ++j )
		{
		
			// Push a new edge.
			
			temp.push( null );
			
		}
		
		this.input_edges_to_hidden_nodes.push( temp );
		
		for ( var i = 0; i < this.number_of_hidden_layers - 1; ++i )
		{
			
			temp = [ ];
			
			for ( var j = 0; j < ( this.number_of_hidden_nodes_per_hidden_layer * this.number_of_hidden_nodes_per_hidden_layer ); ++j )
			{
			
				// Push a new edge.
				
				temp.push( null );
				
			}
			
			this.input_edges_to_hidden_nodes.push( temp );
			
		}
		
		for ( var i = 0; i < ( this.number_of_hidden_nodes_per_hidden_layer * this.number_of_output_nodes ); ++i )
		{
		
			// Push a new edge.
			
			this.input_edges_to_output_nodes.push( null );
			
		}
		
	}
	else
	{
		
		for ( var i = 0; i < ( this.number_of_input_nodes * this.number_of_output_nodes ); ++i )
		{
			
			// Push a new edge.
			
			this.input_edges_to_output_nodes.push( null );
			
		}
		
	}
	
	for ( var i = 0; i < this.number_of_output_nodes; ++i )
	{
		
		// Push a new edge.
			
		this.output_edges_from_output_nodes.push( null );		
		
	}	
	
}
	
	
	
	