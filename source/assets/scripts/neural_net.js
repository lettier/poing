/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 * Code ported and modified to JS from original C++ source ( http://www.ai-junkie.com/ann/evolved/nnt1.html ) as written by Mat Buckland.
 * 
 * Implements a neural network for learning.
 * 
 */


function Neuron( nInputs )
{
	
	// Plus one for the bias/threshold.
	// x_1*w_1+x_2*w_2+...+x_n*w_n >= t
	// x_1*w_1+x_2*w_2+...+x_n*w_n+(-1)*t >= 0
	// Where t=w_(n+1).
	
	this.number_of_inputs = nInputs + 1;
	
	if ( this.number_of_inputs < 0 ) this.number_of_inputs = 1;
	
	this.weights = new Array( );
	
	for ( var i = 0; i < this.number_of_inputs; ++i )
	{
		
		this.weights.push( get_random_float( -1.0, 1.0 ) );

	}
	
}

function Neuron_Layer( nNumberNeurons, nNumberInputsPerNeuron )
{
				
	this.number_of_neurons = nNumberNeurons;

	this.neurons = new Array( );
		
	for ( var i = 0; i < nNumberNeurons; ++i )
	{
		
		this.neurons.push( new Neuron( nNumberInputsPerNeuron ) );
		
	}

}

function Neural_Net( params )
{

	this.number_of_inputs = params.nInputs;
	
	this.number_of_outputs = params.nOutputs;

	this.number_of_hidden_layers = params.nHiddenLayers;

	this.neurons_per_hidden_layer = params.nNeuronsPerHiddenLayer;
	
	this.bias = params.bias;

	this.layers = new Array( );

	this.create_network = function ( ) 
	{
		
		// Create the layers of the network.
		if ( this.number_of_hidden_layers > 0 )
		{
			
			// Create first hidden layer.
			this.layers.push( new Neuron_Layer( this.neurons_per_hidden_layer, this.number_of_inputs ) );
			
			// Create the subsequent hidden layers.
			for ( var i = 0; i < this.number_of_hidden_layers - 1; ++i )
			{

				this.layers.push( new Neuron_Layer( this.neurons_per_hidden_layer, this.neurons_per_hidden_layer ) );
				
			}

			// Create output layer.
			this.layers.push( new Neuron_Layer( this.number_of_outputs, this.neurons_per_hidden_layer ) );
			
		}
		else
		{
			
			// Create output layer.
			this.layers.push( new Neuron_Layer( this.number_of_outputs, this.number_of_inputs ) );
					
		}
		
	}	
	
	this.create_network( );

	this.get_weights = function ( ) 
	{
		
		var weights = new Array( );
		
		// For each layer.
		
		for ( var i = 0; i < this.number_of_hidden_layers + 1; ++i ) // Plus one for the output layer.
		{
			
			// For each neuron.
			
			for ( var j = 0; j < this.layers[ i ].number_of_neurons; ++j )
			{
				
				// For each weight.
				
				for ( var k = 0; k < this.layers[ i ].neurons[ j ].number_of_inputs; ++k )
				{
				
					weights.push( this.layers[ i ].neurons[ j ].weights[ k ] );
					
				}
				
			}
			
		}

		return weights;
		
	}

	this.get_number_of_weights = function ( ) 
	{
		
		var weights = 0;
	
		// For each layer.
		
		for ( var i = 0; i < this.number_of_hidden_layers + 1; ++i ) // Plus one for the output layer.
		{

			// For each neuron.
			
			for ( var j = 0; j < this.layers[ i ].number_of_neurons; ++j )
			{
				
				// For each weight.
				
				for ( var k = 0; k < this.layers[ i ].neurons[ j ].number_of_inputs; ++k )
				{

					weights += 1;				
					
				}

			}
			
		}

		return weights;
		
	}

	this.put_weights = function ( weights ) 
	{
		
		var weight = 0;

		// For each layer.
		for ( var i = 0; i < this.number_of_hidden_layers + 1; ++i ) // Plus one for the output layer.
		{

			// For each neuron.
			for ( var j = 0; j < this.layers[ i ].number_of_neurons; ++j )
			{
				
				// For each weight.
				for ( var k = 0; k < this.layers[ i ].neurons[ j ].number_of_inputs; ++k )
				{
					
					this.layers[ i ].neurons[ j ].weights[ k ] = weights[ weight++ ];
					
				}
				
			}
			
		}

		return null;
		
	}

	this.update = function ( inputs ) 
	{
		
		// Stores the resultant outputs from each layer.
		
		var outputs = new Array( );

		var weight = 0;

		// First check that we have the correct amount of inputs.
		
		if ( inputs.length != this.number_of_inputs )
		{
			
			console.error( "[Neural_Net:update] Passed inputs length does not equal neural network number of inputs setting." );
			
			// Just return an empty vector if incorrect.
			return outputs;
		}

		// For each layer.
		for ( var i = 0; i < this.number_of_hidden_layers + 1; ++i )
		{		
			
			if ( i > 0 )
			{
				
				inputs = deep_copy( outputs ); // Deep copy outputs.
				
			}

			outputs.length = 0;

			weight = 0;

			// For each neuron sum the ( inputs * corresponding weights ).
			// Throw the total at our sigmoid function to get the output.
			
			for ( var j = 0; j < this.layers[ i ].number_of_neurons; ++j )
			{
				var net_input = 0.0;

				var number_of_inputs = this.layers[ i ].neurons[ j ].number_of_inputs;

				// For each weight.
				
				for ( var k = 0; k < number_of_inputs - 1; ++k )
				{
					// Sum the weights x inputs.
					
					net_input += this.layers[ i ].neurons[ j ].weights[ k ] * inputs[ weight++ ];
					
				}

				// Add in the bias/threshold.
				// x_1*w_1+x_2*w_2+...+x_n*w_n >= t
				// x_1*w_1+x_2*w_2+...+x_n*w_n+(-1)*t >= 0
				// Where t=w_(n+1).
				
				net_input += this.bias * this.layers[ i ].neurons[ j ].weights[ number_of_inputs - 1 ];

				// We can store the outputs from each layer as we generate them. 
				// The combined activation is first filtered through the Sigmoid function.
				
				outputs.push( this.sigmoid( net_input ) );

				weight = 0;
			}
		}

		return outputs;
		
	}

	this.sigmoid = function ( input ) 
	{
		
		// Use the hyperbolic tangent function to get a range of outputs [-1,1].
		
		var math_exp    = Math.exp;
		
		var numerator   = math_exp( 2 * input ) - 1;
		var denominator = math_exp( 2 * input ) + 1;
		
		return numerator / denominator;		
		
		/*
		
		Old way.
		
		
		// Returns [ -1, 1 ].
		
		var numerator   = 1.0;
		var denominator = 1.0 + Math.pow( Math.E, ( -input / response ) );
		
		return ( ( numerator / denominator ) - 0.5 ) * 2.0;
		
		*/
		
	}

}
