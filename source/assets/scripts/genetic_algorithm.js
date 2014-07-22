/*
 * 
 * David Lettier (C) 2013.
 * 
 * http://www.lettier.com/
 * 
 * Code ported to JS and heavily modified from the original C++ source 
 * ( http://www.ai-junkie.com/ann/evolved/nnt1.html ) 
 * as written by Mat Buckland.
 * 
 * Implements a genetic algorithm for learning.
 * 
 */

function Genome( genes, fitness )
{

	this.genes = null;
	this.fitness = null;
	
	if ( genes == undefined ) this.genes = new Array( );
	else this.genes = genes;

	if ( fitness == undefined ) this.fitness = 0.0;
	else this.fitness = fitness;
	
	// Used to calculate either the crossover progress or mutation progress.
	// If this genome is created via crossover, use the weighted average
	// based on the cross over point.
	// So if the crossover point is say 9 and the genome length is 10,
	// then the weighted average pf = (p1.f*.9) + (p2.f*.1).
	// In other words the offspring received 90% of its genes from parent one
	// and it received 10% of its genes from parent two so its parent fitness is
	// 90% of parent one's fitness and 10% of parent two's fitness.
	
	this.parent_fitness = 0.0;
	
	// Created by means if this genome was generated either by randomness, crossover, 
	// mutation, both crossover and mutation, or elitism.
	// Initially it is created from nothing so set it to -1.
	// 0 = randomness, 1 = crossover, 2 = mutation, 3 = crossover & mutation, 4 = elitism

	// This encoding is to facilitate crossover's and mutation's progress at producing fitter offspring than the offspring's parents.
	
	this.created_by = 0;	

}

function Genetic_Algorithm( params )
{

	// Size of population.
	
	this.population_size = params.popSize;

	// Amount of genes per genome.
	
	this.number_of_genes_per_genome = params.nGenesPerGenome;	

	// Use rank in selection?
	
	this.use_rank_fitness = params.useRankFitness;
	
	// Perform crossover and mutation sequentially or separately?
	
	this.perform_crossover_and_mutation_sequentially = params.pCrMuSeq;
	
	// Probability of genome's crossing over bits.
	// 0.7 is pretty good.
	
	this.crossover_probability               = params.iCProb;
	this.crossover_probability_minimum       = 0.001;
	this.crossover_probability_adjustment    = 0.01;
	this.crossover_operator_progress_average = 0.0;
	this.observed_crossover_rate             = 0.0;	
	this.total_number_of_crossovers          = 0;
	this.total_number_of_crossover_attempts  = 0;
	
	// Probability that a genomes bits will mutate.
	// Try figures around 0.05 to 0.3-ish.

	this.mutation_probability               = params.iMProb;
	this.mutation_probability_minimum       = 0.001;
	this.mutation_probability_adjustment    = 0.01;
	this.mutation_operator_progress_average = 0.0;
	this.observed_mutation_rate             = 0.0;
	this.total_number_of_mutations          = 0;
	this.total_number_of_mutation_attempts  = 0;
	
	// Set the number of elite that go on to the next generation.
	
	this.number_of_elite = params.nElite;	
	
	// This holds the entire population of genomes.
	
	this.population = new Array( );

	// Total fitness of population.
	
	this.total_fitness = 0;	

	// Average fitness.
	
	this.average_fitness = 0;
	
	// Best fitness this population.
	
	this.best_fitness = 0;

	// Worst fitness.
	
	this.worst_fitness = 0;

	// Keeps track of the best genome.
	
	this.fittest_genome_index = -1;

	// Keep track of the worst genome.
	
	this.weakest_genome_index = -1;

	// Generation number.
	
	this.generation_number = 0;

	// Current population makeup of randoms, crossovers, mutants, crossover mutants, elites.

	this.population_makeup = "";
	
	// Initialize population with genomes consisting of random
	// genes and all fitness's set to zero.
	
	for ( var i = 0; i < this.population_size; ++i )
	{
		
		this.population.push( new Genome( ) );

		for ( var j = 0; j < this.number_of_genes_per_genome; ++j )
		{
			
			this.population[ i ].genes.push( get_random_float( -1.0, 1.0 ) );
			
		}
		
	}
	
	this.replace_population_genes = function ( replacement_population_genes )
	{
		
		if ( replacement_population_genes === undefined || 
			replacement_population_genes.length === 0  || 
			replacement_population_genes.length != ( this.population_size * this.number_of_genes_per_genome ) )
		{
			
			console.error( "[Genetic_Algorithm:replace_population_genes] Replacement population genes invalid."   );
			
			return null;
			
		}
		
		// Assumes replace_population_genes is one big array. 
		// Splices the big array based on the number of genes
		// per genome.
		
		
		// Big array: [ 1,1,1,1,1,1,1,1,1,1 ] >>
		// Population: [ [ 1, 1 ] G0
		//               [ 1, 1 ] G1
		//               [ 1, 1 ] ...
		//               [ 1, 1 ] ...
		//               [ 1, 1 ] GN-1
		//             ]
		
		var k = 0;
		
		for ( var i = 0; i < this.population_size; ++i )
		{

			this.population[ i ].genes = [ ];
			
			for ( var j = 0; j < this.number_of_genes_per_genome; ++j )
			{
				
				this.population[ i ].genes.push( replacement_population_genes[ k ] );
				
				k += 1;

			}
			
		}
		
	}	

	this.selection_operator = function ( number_of_indexes )
	{
		
		// Assumes population has been evaluated.
		
		// Assumes population is sorted in ascending order according to fitness.
		
		// Roulette selection of n genome indexes in the population.
		
		if ( !this.use_rank_fitness )
		{
		
			// Say we have a population of 4 with these fitness values:
			// G-1: 1
			// G-2: 2
			// G-3: 3
			// G-4: 4
			// Total fitness: 10
			// Probabilities:
			// G-1: .1
			// G-2: .2
			// G-3: .3
			// G-4: .4
			//
			// Now shift them over by the running sum.
			// This give them a portion on the number line [0.0,1.0] proportional to their
			// fitness.
			//
			// G-1: .1
			// G-2: G-1 + .2 = .3
			// G-3: G-2 + .3 = .6
			// G-4: G-3 + .4 = 1.0
			//
			// 0.0----.10----.20----.30----.40----.50----.60----.70----.80----.90----1.0
			//        G-1           G-2                  G-3                         G-4
			//
			// Now selected a random float in [0.0,1.0]:
			// RF: .51
			//
			// 0.0----.10----.20----.30----.40----.50----.60----.70----.80----.90----1.0
			//        G-1           G-2              RF  G-3                         G-4
			//
			// G-3 gets selected for mating.

			var probabilities = new Array( );
			
			var genome_indexes_selected = new Array( );
			
			if ( this.total_fitness == 0 )
			{
				
				// So that we don't divide by zero.
				// This means genomes all have zero fitness 
				// so just select random genome indexes.
				
				for ( var i = 0; i < number_of_indexes; ++i )
				{
				
					genome_indexes_selected.push( get_random_integer( 0, this.population_size - 1 ) );
					
				}
				
				return genome_indexes_selected;
				
			}

			probabilities.push( this.population[ 0 ].fitness / this.total_fitness );		
			
			for ( var i = 1; i < this.population_size; ++i )
			{
				
				probabilities.push( probabilities[ i - 1 ] + ( this.population[ i ].fitness / this.total_fitness ) );
				
			}
			
			while ( genome_indexes_selected.length < number_of_indexes )
			{
				
				var random_number = get_random_float( 0.0, 1.0 );
				
				for ( var i = 0; i < this.population_size; ++i )
				{
					
					if ( random_number <= probabilities[ i ] )
					{
						
						genome_indexes_selected.push( i );
						
					}
					
				}
				
			}
			
			return genome_indexes_selected;
			
		}
		else
		{
			
			// Give the worst genome a rank fitness of 1.
			// Give the second worst genome a rank fitness of 2.
			// ...
			// Give the best genome a rank fitness of the population size.
			
			// Now, based on rank fitness, do a roulette selection where the
			// probabilities are based on the rank fitness.
			
			var probabilities = new Array( );
			
			var genome_indexes_selected = new Array( );
			
			// Rank fitness of the first is 1.
			// Probability is 1/(n(n+1)/2).
			// Where n is population size.
			// (n(n+1)/2) = the total rank fitness.
			// Summing the numbers from 1 to population size.
			// Say population size is 10.
			// Rank fitness: G-1 = 1, G-2 = 2, ..., G-10 = 10.
			// Total rank fitness is 1+2+3+...+10 = n(n+1)/2 = (10*11)/2 = 55
			// Probabilities:
			// G-1: 1/55
			// G-2: G-1 + 2/55
			// ...
			// G-10: G-9 + 10/55
			
			var total_rank_fitness = ( this.population_size * ( this.population_size + 1 ) ) / 2;

			probabilities.push( 1 / total_rank_fitness ); // First rank fitness probability.
			
			// Rest of the rank fitness probabilities.
			
			for ( var i = 1; i < this.population_size; ++i )
			{
				
				probabilities.push( probabilities[ i - 1 ] + ( ( i + 1 ) / total_rank_fitness ) );
				
			}
			
			while ( genome_indexes_selected.length < number_of_indexes )
			{
				
				var random_number = get_random_float( 0.0, 1.0 );
				
				for ( var i = 0; i < this.population_size; ++i )
				{
					
					if ( random_number <= probabilities[ i ] )
					{
						
						genome_indexes_selected.push( i );
						
					}
					
				}
				
			}
			
			return genome_indexes_selected;
			
		}
		
	}

	this.elitism_operator = function ( new_population ) 
	{

		if ( this.number_of_elite > this.population_size ) this.number_of_elite = this.population_size;
		
		// Assumes the population is sorted in ascending order of fitness.		
		
		// A = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
		// |A| = 10
		// i = 2 check.
		// i = 1 decrement.
		// A[ ( ( 10 - 1 = 9 ) - i ) = 8 ]
		// i = 1 check.
		// i = 0 decrement.
		// A[ ( ( 10 - 1 = 9 ) - i ) = 9 ]
		// i = 0 check.
		// Stop.
		
		var i = this.number_of_elite;
		
		while( i-- )
		{

			var genome_temp = deep_copy( this.population[ ( this.population_size - 1 ) - i ] );
			
			genome_temp.fitness        = 0;
			genome_temp.parent_fitness = 0;
			genome_temp.created_by     = 4;
			
			new_population.push( genome_temp );
			
			if ( new_population.length == this.population_size ) return;
			
		}
		
	}
	
	this.crossover_operator = function ( parent_one_index, parent_two_index )
	{
		
		// One point crossover operator.
		
		// Do we crossover?
		
		if ( get_random_float( 0.0, 1.0 ) <= this.crossover_probability )
		{
		
			// If the parents are the same genome then this is not a true crossover.
			
			if ( parent_one_index === parent_two_index ) return 0;
			
			// Only returns one crossed offspring.
			
			var offspring = new Genome( );

			// Determine a crossover point.
			
			// Let the uniform sample be in the range of [1,n-1].
			// If the crossover point was zero than no true crossover takes place
			// as all of one parent's genes get copied into the offspring.
			// If the cp = n-1 then at least you get n-1 from one parent and 1
			// from another parent.
			
			var crossover_point = get_random_integer( 1, ( this.number_of_genes_per_genome - 1 ) );

			// Cross the parent's genes in the offspring.
			
			offspring.genes = [ ];
			
			offspring.fitness = 0;
			
			offspring.parent_fitness = 0;
			
			for ( var i = 0; i < crossover_point; ++i )
			{
				
				offspring.genes.push( deep_copy( this.population[ parent_one_index ].genes[ i ] ) );
				
			}

			for ( var i = crossover_point; i < this.number_of_genes_per_genome; ++i )
			{
				
				offspring.genes.push( deep_copy( this.population[ parent_two_index ].genes[ i ] ) );
				
			}
			
			// Determine if a crossover actually took place.
			// The offspring should not match the parent one's genes and
			// it should not match parent two's genes as the offspring
			// should be a combination of the two.
			
			if ( ( offspring.genes.toString( ) != this.population[ parent_one_index ].genes.toString( ) ) &&
				( offspring.genes.toString( ) != this.population[ parent_two_index ].genes.toString( ) ) )
				
			{
				
				// Weighted average fitness of the parents based on crossover point
				// determining percentage of genes received from parent one and parent two.
				// Let the number of genes per genome be 41 and let the crossover point be 1. 
				// Offspring gets [0,1) = 1 gene from parent one and [1,41) = 40 genes from parent two. 
				// PF = PF1 * (1/41) + PF2 * ((41-1)/41).
				
				var parent_one_contribution = ( this.population[ parent_one_index ].fitness * ( (                                   crossover_point ) / ( this.number_of_genes_per_genome ) ) );
				var parent_two_contribution = ( this.population[ parent_two_index ].fitness * ( ( this.number_of_genes_per_genome - crossover_point ) / ( this.number_of_genes_per_genome ) ) );
				
				offspring.parent_fitness = parent_one_contribution + parent_two_contribution;
				
				offspring.created_by = 1;
				
				return offspring;
				
			}
			else
			{
				
				return 0;
				
			}

		}
		else
		{
			
			return 0;
			
		}
		
	}

	this.mutation_operator = function ( parent_index )
	{

		// Mutates parent genome's genes on a whole genome basis based on the mutation probability.
		
		// Gaussian distribution mutation. 
		
		// Do we mutate?
		
		if ( get_random_float( 0.0, 1.0 ) <= this.mutation_probability )
		{
		
			// Reference: http://www.nashcoding.com/2010/07/07/evolutionary-algorithms-the-little-things-youd-never-guess-part-1/
			
			function gaussian_distribution( mean, standard_deviation )
			{
				
				// Two uniformally distributed random variable samples.
				
				var x1 = Math.random( );
				var x2 = Math.random( );

				// The method requires sampling from a uniform random of (0,1]
				// but Math.random( ) returns a sample of [0,1).
				
				if ( x1 == 0.0 ) x1 = 1.0;
				if ( x2 == 0.0 ) x2 = 1.0;
				
				// Box-Muller transformation for Z_0.

				var y1 = Math.sqrt( -2.0 * Math.log( x1 ) ) * Math.cos( 2.0 * Math.PI * x2 );
				
				return ( y1 * standard_deviation ) + mean;
				
			}
			
			// Create an offspring blank.
			
			var offspring = new Genome( );
			
			offspring.genes = [ ];
			
			offspring.genes = deep_copy( this.population[ parent_index ].genes );
			
			offspring.fitness = 0;
			
			offspring.parent_fitness = 0;
			
			// Begin to mutate.
			
			var mutated = false;
			
			for ( var i = 0; i < this.number_of_genes_per_genome; ++i )
			{

				// Mutate this gene by sampling a value from a normal distribution
				// where the mean is the current gene value and the standard deviation
				// the is mutation step = mutation probability in the range [0,1].
				// A low mutation probability will give a mutated gene value close to the original gene 
				// value (the mean) (most of the time) as the standard deviation is small and therefore the mutation step is small. 
				// A high mutation probability will give (or it can easily) a mutated gene value farther from the original gene 
				// value (the mean) as the standard deviation is large and therefore the mutation step is large. 
				
				// Note that gv = gv + σ*N(0,1) is the same as gv = N(gv,σ).

				// Clamp the gene to range [-1,1].
				
				var temp_gene_value = deep_copy( offspring.genes[ i ] );
				
				offspring.genes[ i ] = gaussian_distribution( offspring.genes[ i ], this.mutation_probability );			
				offspring.genes[ i ] = get_clamped_value( offspring.genes[ i ], -1.0, 1.0 );
				
				// Test if it was truly mutated.
				
				if ( temp_gene_value != offspring.genes[ i ] )
				{
				
					mutated = true;
					
				}
				
			}
			
			if ( mutated ) // If truly mutated.
			{
				
				offspring.parent_fitness = deep_copy( this.population[ parent_index ].fitness );
			
				offspring.created_by = 2;		
				
				return offspring;
				
			}
			else
			{
				
				return 0;
				
			}
			
		}
		else
		{
			
			return 0;
			
		}
		
	}
	
	this.crossover_then_mutate_operator = function ( parent_one_index, parent_two_index )
	{
		
		// Crossover and mutation done sequentially as in more traditional genetic algorithms.
		
		// First attempts crossover and then attempts mutation.
		
		var offspring_one = deep_copy( this.population[ parent_one_index ] );
		var offspring_two = deep_copy( this.population[ parent_one_index ] );
		
		offspring_one.fitness = 0.0;
		offspring_two.fitness = 0.0;
		
		offspring_one.parent_fitness = null;
		offspring_two.parent_fitness = null;
		
		offspring_one.created_by = 0;
		offspring_two.created_by = 0;
		
		// Attempt crossover.

		var crossover_point = get_random_integer( 0, ( this.number_of_genes_per_genome - 1 ) );
		
		if ( ( get_random_float( 0.0, 1.0 ) <= this.crossover_probability ) && ( parent_one_index != parent_two_index ) && ( crossover_point != 0 ) )
		{

			// Cross the parent's genes in the offspring.

			offspring_one.genes = [ ];
			offspring_two.genes = [ ];
			
			for ( var i = 0; i < crossover_point; ++i )
			{
				
				offspring_one.genes.push( deep_copy( this.population[ parent_one_index ].genes[ i ] ) );
				offspring_two.genes.push( deep_copy( this.population[ parent_two_index ].genes[ i ] ) );
				
			}

			for ( var i = crossover_point; i < this.number_of_genes_per_genome; ++i )
			{
				
				offspring_one.genes.push( deep_copy( this.population[ parent_two_index ].genes[ i ] ) );
				offspring_two.genes.push( deep_copy( this.population[ parent_one_index ].genes[ i ] ) );
				
			}

			var parent_one_contribution = ( this.population[ parent_one_index ].fitness * ( (                                   crossover_point ) / ( this.number_of_genes_per_genome ) ) );
			var parent_two_contribution = ( this.population[ parent_two_index ].fitness * ( ( this.number_of_genes_per_genome - crossover_point ) / ( this.number_of_genes_per_genome ) ) );	
			
			offspring_one.parent_fitness = parent_one_contribution + parent_two_contribution;
			offspring_one.created_by = offspring_one.created_by + 1;

			parent_two_contribution = ( this.population[ parent_two_index ].fitness * ( (                                   crossover_point ) / ( this.number_of_genes_per_genome ) ) );
			parent_one_contribution = ( this.population[ parent_one_index ].fitness * ( ( this.number_of_genes_per_genome - crossover_point ) / ( this.number_of_genes_per_genome ) ) );	
			
			offspring_two.parent_fitness = parent_two_contribution + parent_one_contribution;
			offspring_two.created_by = offspring_two.created_by + 1;
		
		}
			
		// Crossover may or may not have happened but now try to mutation.
		
		// Normal distribution sample function.
		
		function gaussian_distribution( mean, standard_deviation )
		{
			
			// Two uniformally distributed random variable samples.
			
			var x1 = Math.random( );
			var x2 = Math.random( );

			// The method requires sampling from a uniform random of (0,1]
			// but Math.random( ) returns a sample of [0,1).
			
			if ( x1 == 0.0 ) x1 = 1.0;
			if ( x2 == 0.0 ) x2 = 1.0;
			
			// Box-Muller transformation for Z_0.

			var y1 = Math.sqrt( -2.0 * Math.log( x1 ) ) * Math.cos( 2.0 * Math.PI * x2 );
			
			return ( y1 * standard_deviation ) + mean;
			
		}
		
		// Attempt to mutate offspring one.
		
		var mutated_one = false;		
		
		for ( var i = 0; i < this.number_of_genes_per_genome; ++i )
		{

			// Mutate this gene by sampling a value from a normal distribution
			// where the mean is the current gene value and the standard deviation
			// the is mutation step = mutation probability in the range [0,1].
			// A low mutation probability will give a mutated gene value close to the original gene 
			// value (the mean) (most of the time) as the standard deviation is small and therefore the mutation step is small. 
			// A high mutation probability will give (or it can easily) a mutated gene value farther from the original gene 
			// value (the mean) as the standard deviation is large and therefore the mutation step is large. 
			
			// Note that gv = gv + σ * N( 0, 1 ) is the same as gv = N( gv, σ ).

			// Clamp the gene to range [-1,1].
			
			if ( get_random_float( 0.0, 1.0 ) <= this.mutation_probability ) // Mutate this gene?
			{
			
				var temp_gene_value_one = deep_copy( offspring_one.genes[ i ] );
				
				offspring_one.genes[ i ] = gaussian_distribution( offspring_one.genes[ i ], this.mutation_probability );
				// offspring_one.genes[ i ] = gaussian_distribution( offspring_one.genes[ i ], 0.5 );
				// offspring_one.genes[ i ] = offspring_one.genes[ i ] + ( get_random_float( -1.0, 1.0 ) * .3 );
				offspring_one.genes[ i ] = get_clamped_value( offspring_one.genes[ i ], -1.0, 1.0 );
				
				// Test if it was truly mutated.
				
				if ( temp_gene_value_one != offspring_one.genes[ i ] )
				{
				
					mutated_one = true;
				
				}
			
			}
			
		}
		
		// Attempt to mutate offspring two.
		
		var mutated_two = false;
		
		for ( var i = 0; i < this.number_of_genes_per_genome; ++i )
		{

			// Mutate this gene by sampling a value from a normal distribution
			// where the mean is the current gene value and the standard deviation
			// the is mutation step = mutation probability in the range [0,1].
			// A low mutation probability will give a mutated gene value close to the original gene 
			// value (the mean) (most of the time) as the standard deviation is small and therefore the mutation step is small. 
			// A high mutation probability will give (or it can easily) a mutated gene value farther from the original gene 
			// value (the mean) as the standard deviation is large and therefore the mutation step is large. 
			
			// Note that gv = gv + σ * N( 0, 1 ) is the same as gv = N( gv, σ ).

			// Clamp the gene to range [-1,1].
			
			if ( get_random_float( 0.0, 1.0 ) <= this.mutation_probability ) // Mutate this gene?
			{
			
				var temp_gene_value_two = deep_copy( offspring_two.genes[ i ] );
				
				offspring_two.genes[ i ] = gaussian_distribution( offspring_two.genes[ i ], this.mutation_probability );
				// offspring_two.genes[ i ] = gaussian_distribution( offspring_two.genes[ i ], 0.5 );
				// offspring_two.genes[ i ] = offspring_two.genes[ i ] + ( get_random_float( -1.0, 1.0 ) * .3 );
				offspring_two.genes[ i ] = get_clamped_value( offspring_two.genes[ i ], -1.0, 1.0 );
				
				// Test if it was truly mutated.
				
				if ( temp_gene_value_two != offspring_two.genes[ i ] )
				{
				
					mutated_two = true;
					
				}
				
			}
			
		}
		
		if ( mutated_one ) // If truly mutated.
		{
		
			// Mutation = 2, crossover = 1, crossover + mutation = 3.
			
			offspring_one.created_by = offspring_one.created_by + 2;
			
			// If this offspring was only mutated, that is, it was not crossed then get its parent fitness.
			// It it was crossed before being mutated then offspring_one.created would equal 3.
			
			if ( offspring_one.created_by === 2 )
			{
			
				offspring_one.parent_fitness = deep_copy( this.population[ parent_one_index ].fitness );
				
			}
			
		}
		
		if ( mutated_two ) // If truly mutated.
		{
		
			offspring_two.created_by = offspring_two.created_by + 2;

			// If this offspring was only mutated, that is, it was not crossed then get its parent fitness.
			// It it was crossed before being mutated then offspring_two.created would equal 3.
			
			if ( offspring_two.created_by === 2 )
			{
			
				offspring_two.parent_fitness = deep_copy( this.population[ parent_two_index ].fitness );
				
			}
			
		}
		
		// No parents->offspring not crossed and/or not mutated enter into the new population.
		// Each offspring going into the new population must either crossed, mutated, or both.
		
		if ( ( offspring_one.created_by === 0 ) || ( offspring_two.created_by === 0 ) )
		{
			
			return 0;
			
		}
		else if ( ( offspring_one.genes.toString( ) === this.population[ parent_one_index ].genes.toString( ) ) || ( offspring_two.genes.toString( ) === this.population[ parent_two_index ].genes.toString( ) ) )
		{
			
			return 0;
			
		}
		else
		{
			
			return { one: offspring_one, two: offspring_two };
			
		}

	}

	this.evaluate_population = function ( )
	{

		this.reset_population_evaluation( );

		var highest_so_far = this.population[ 0 ].fitness;
		var lowest_so_far  = this.population[ 0 ].fitness;
		
		this.fittest_genome_index = 0;
		this.weakest_genome_index = 0;
		
		this.total_fitness  = this.population[ 0 ].fitness;		
		this.best_fitness   = this.population[ 0 ].fitness;
		this.worst_fitness  = this.population[ 0 ].fitness;

		for ( var i = 1; i < this.population_size; ++i )
		{
			
			// Update fittest if necessary.
			
			if ( highest_so_far < this.population[ i ].fitness )
			{
				
				highest_so_far = this.population[ i ].fitness;

				this.fittest_genome_index = i;

				this.best_fitness = highest_so_far;
				
			}

			// Update worst if necessary.
			
			if ( lowest_so_far > this.population[ i ].fitness  )
			{
				
				lowest_so_far = this.population[ i ].fitness;
				
				this.weakest_genome_index = i;

				this.worst_fitness = lowest_so_far;
				
			}

			this.total_fitness += this.population[ i ].fitness;


		} // Next genome.

		this.average_fitness = this.total_fitness / this.population_size;
		
	}

	this.reset_population_evaluation = function ( )
	{
		
		this.total_fitness         = 0;
		this.best_fitness          = 0;
		this.worst_fitness         = 0;
		this.average_fitness       = 0;
		this.fittest_genome_index  = -1;
		this.weakest_genome_index  = -1;
		
	}

	this.compute_population_makeup = function ( )
	{

		var randoms           = 0;
		var crossovers        = 0;
		var mutants           = 0;
		var crossover_mutants = 0;
		var elites            = 0;

		for ( var i = 0; i < this.population_size; ++i )
		{
			
			if ( this.population[ i ].created_by === 0 )
			{

				randoms = randoms + 1;

			}
			else if ( this.population[ i ].created_by === 1 )
			{
			
				crossovers = crossovers + 1;

			}
			else if ( this.population[ i ].created_by === 2 )
			{
			
				mutants = mutants + 1;

			}
			else if ( this.population[ i ].created_by === 3 )
			{
			
				crossover_mutants = crossover_mutants + 1;

			}
			else if ( this.population[ i ].created_by === 4 )
			{
			
				elites = elites + 1;

			}
		
		}

		this.population_makeup = randoms + " " + crossovers + " " + mutants + " " + crossover_mutants + " " + elites;

	}
	
	this.adjust_crossover_and_mutation_probabilities = function ( )
	{
		
		// Calculate the crossover and mutation operators' progress where 
		// their progress is based on how well they produced offspring that
		// had a better fitness than their parent.
		
		var crossover_operator_progress_sum = 0;
		var number_of_crossovers            = 0;
		
		var mutation_operator_progress_sum  = 0;
		var number_of_mutations             = 0;
		
		// Sum all of the progresses.
		
		for ( var i = 0; i < this.population_size; ++i )
		{
			
			if ( this.population[ i ].created_by === 1 ) // Created by crossover.
			{
				
				crossover_operator_progress_sum += ( this.population[ i ].fitness - this.population[ i ].parent_fitness );
				
				number_of_crossovers += 1;
				
			}
			else if ( this.population[ i ].created_by === 2 ) // Created by mutation.
			{
				
				mutation_operator_progress_sum  += ( this.population[ i ].fitness - this.population[ i ].parent_fitness );
				
				number_of_mutations += 1;
				
			}
			
		}
		
		// Now calculate the average crossover and mutation progress for the population.
		
		this.crossover_operator_progress_average = 0.0;
		this.mutation_operator_progress_average  = 0.0;
		
		if ( number_of_crossovers != 0 )
		{
			
			this.crossover_operator_progress_average = ( crossover_operator_progress_sum ) / ( number_of_crossovers );			
			
		}
		
		if ( number_of_mutations != 0 )
		{
			
			this.mutation_operator_progress_average  = ( mutation_operator_progress_sum ) / ( number_of_mutations );			
			
		}
		
		// Adjust crossover and mutation rate adjustments.
		
		if ( this.best_fitness > this.worst_fitness )
		{
			
			this.crossover_probability_adjustment = 0.01 * ( ( this.best_fitness - this.average_fitness ) / ( this.best_fitness - this.worst_fitness ) );
			
			this.mutation_probability_adjustment  = 0.01 * ( ( this.best_fitness - this.average_fitness ) / ( this.best_fitness - this.worst_fitness ) );
			
		}
		else if ( this.best_fitness = this.average_fitness )
		{
			
			this.crossover_probability_adjustment = 0.01;
			
			this.mutation_probability_adjustment  = 0.01;
			
		}
		
		// Adjust crossover and mutation rates.
		
		if ( this.crossover_operator_progress_average > this.mutation_operator_progress_average )
		{
		
			this.crossover_probability = this.crossover_probability + this.crossover_probability_adjustment;
			
			this.mutation_probability  = this.mutation_probability  - this.mutation_probability_adjustment;
			
		}
		else if ( this.crossover_operator_progress_average < this.mutation_operator_progress_average )
		{
		
			this.crossover_probability = this.crossover_probability - this.crossover_probability_adjustment;
			
			this.mutation_probability  = this.mutation_probability  + this.mutation_probability_adjustment;
			
		}
		else if ( this.crossover_operator_progress_average == this.mutation_operator_progress_average )
		{
			
			// Do not adjust.
			
		}
		
		this.crossover_probability = get_clamped_value( this.crossover_probability, this.crossover_probability_minimum, 1.0 );
		
		this.mutation_probability  = get_clamped_value( this.mutation_probability,  this.mutation_probability_minimum,  1.0 );
		
	}
	
	this.sort_population = function ( descending )
	{
		
		if ( descending == undefined || descending == false )
		{
			
			this.population.sort( function ( a, b ) { return a.fitness - b.fitness; } );
			
		}
		else
		{
			
			this.population.sort( function ( a, b ) { return b.fitness - a.fitness; } );
			
		}
		
	}
	
	this.generate_new_generation = function ( )
	{

		// Assumes population is sorted in ascending order.
		
		// Assumes population is completely evaluated.
		
		// Assumes crossover probability and mutation probability have been adjusted if using self-adaptation.
		
		// Create a temporary population to store newly created generation.
		
		var new_population = new Array( );
		
		// Allow the top N elite to pass into the next generation.

		this.elitism_operator( new_population );
		
		// Perform crossover and mutation separately?
		
		if ( !this.perform_crossover_and_mutation_sequentially )
		{

			// Now we enter the GA loop.

			// Repeat until a new population is generated.
			
			while ( new_population.length < this.population_size )
			{
				
				// Perform crossover and mutation separately.
				
				// Try to generate an offspring via crossover first.
				
				this.total_number_of_crossover_attempts += 1;
				
				// Select two genome indexes.
				
				var parents = this.selection_operator( 2 );
				
				var crossover_offspring = this.crossover_operator( parents[ 0 ], parents[ 1 ] );
				
				if ( crossover_offspring != 0 )
				{

					new_population.push( crossover_offspring );
					
					this.total_number_of_crossovers += 1;
					
				}
				
				// There is the possibility of adding up to two 
				// offspring per while loop.
				// Don't create more than the population size.
				
				if ( new_population.length === this.population_size ) break;
				
				// Try to generate an offspring via mutation second.
				
				this.total_number_of_mutation_attempts += 1;
				
				// Select one genome index.
				
				var parent = this.selection_operator( 1 );
				
				var mutation_offspring = this.mutation_operator( parent[ 0 ] );
				
				if ( mutation_offspring != 0 )
				{
					
					new_population.push( mutation_offspring );
					
					this.total_number_of_mutations += 1;
					
				}
				
			}
			
			if ( new_population.length > this.population_size )
			{
				
				console.warn( "[Genetic_Algorithm:generate_new_generation] New population larger than population size." );
				
			}

			// Finished so assign new pop to the current population.
			
			this.population = [ ];
			this.population = deep_copy( new_population );
			new_population = [ ];
			
		}
		else // Perform crossover and mutation in sequence.
		{
			
			// Now we enter the GA loop.

			// Repeat until a new population is generated.
			
			while ( new_population.length < this.population_size )
			{
			
				// Attempt crossover and then mutation in sequence.
				
				var parents = this.selection_operator( 2 );
				
				var offspring = this.crossover_then_mutate_operator( parents[ 0 ], parents[ 1 ] );
				
				if ( offspring != 0 )
				{
					
					// First offspring.
					
					if ( offspring.one.created_by === 1 )
					{
						
						this.total_number_of_crossovers += 1;
						this.total_number_of_crossover_attempts += 1;
						this.total_number_of_mutation_attempts  += 1;
						
						new_population.push( offspring.one );
						
					}
					else if ( offspring.one.created_by === 2 )
					{
						
						this.total_number_of_mutations += 1;
						this.total_number_of_crossover_attempts += 1;
						this.total_number_of_mutation_attempts  += 1;
						
						new_population.push( offspring.one );
						
					}
					else if ( offspring.one.created_by === 3 )
					{
						
						this.total_number_of_crossovers += 1;
						this.total_number_of_mutations  += 1;
						this.total_number_of_crossover_attempts += 1;
						this.total_number_of_mutation_attempts  += 1;
						
						new_population.push( offspring.one );
						
					}
					
					// Old population size should match this new population size.
					
					if ( new_population.length === this.population_size ) break;
					
					// Second offspring.
					
					if ( offspring.two.created_by === 1 )
					{
						
						this.total_number_of_crossovers += 1;
						this.total_number_of_crossover_attempts += 1;
						this.total_number_of_mutation_attempts  += 1;
						
						new_population.push( offspring.two );
						
					}
					else if ( offspring.two.created_by === 2 )
					{
						
						this.total_number_of_mutations += 1;
						this.total_number_of_crossover_attempts += 1;
						this.total_number_of_mutation_attempts  += 1;
						
						new_population.push( offspring.two );
						
					}
					else if ( offspring.two.created_by === 3 )
					{
						
						this.total_number_of_crossovers += 1;
						this.total_number_of_mutations  += 1;
						this.total_number_of_crossover_attempts += 1;
						this.total_number_of_mutation_attempts  += 1;
						
						new_population.push( offspring.two );
						
					}
					
				}
				
			}
			
			if ( new_population.length > this.population_size )
			{
				
				console.warn( "[Genetic_Algorithm:generate_new_generation] New population larger than population size." );
				
			}

			// Finished so assign new pop to the current population.
			
			this.population = [ ];
			this.population = deep_copy( new_population );
			new_population = [ ];
			
		}
		
		// Calculate the observed rates.
		
		this.observed_crossover_rate = this.total_number_of_crossovers / this.total_number_of_crossover_attempts;
		this.observed_mutation_rate  = this.total_number_of_mutations  / this.total_number_of_mutation_attempts;
		
		// Advance generation counter.
		
		this.generation_number += 1;
		
	}	

	// Getter methods.

	this.get_population = function ( )
	{
		
		return deep_copy( this.population );
		
	}
	
	this.get_population_size = function ( )
	{
		
		return deep_copy( this.population_size );
		
	}
	
	this.get_number_of_genes_per_genome = function ( )
	{
		
		return deep_copy( this.number_of_genes_per_genome );
		
	}
	
	this.get_genome_fitness = function ( index )
	{
		
		index = parseInt( index );
		
		if ( ( index > ( this.population_size - 1 ) ) || ( index < 0 ) )
		{
			
			console.error( "[Genetic_Algorithm:get_genome_fitness] Index out of bounds of population size." );
			
			return;
			
		}
		
		return deep_copy( this.population[ index ].fitness );
		
	}
	
	this.get_genome_genes = function ( index )
	{
		
		index = parseInt( index );
		
		if ( ( index > ( this.population_size - 1 ) ) || ( index < 0 ) )
		{
			
			console.error( "[Genetic_Algorithm:get_genome_genes] Index out of bounds of population size." );
			
			return;
			
		}
		
		return deep_copy( this.population[ index ].genes );
		
	}
	
	this.get_genome_genes_flattened = function ( index )
	{
		
		index = parseInt( index );
		
		if ( ( index > ( this.population_size - 1 ) ) || ( index < 0 ) )
		{
			
			console.error( "[Genetic_Algorithm:get_genome_genes_flattened] Index out of bounds of population size." );
			
			return;
			
		}
		
		return deep_copy( this.population[ index ].genes.join( "," ) );
		
	}
	
	this.get_population_genes_flattened = function ( )
	{
		
		var population_genes = "";
		
		for ( var i = 0; i < this.population_size - 1; ++i )
		{
			
			population_genes += deep_copy( this.population[ i ].genes.join( "," ) + "," );
			
		}
		
		population_genes += deep_copy( this.population[ this.population_size - 1 ].genes.join( "," ) );
		
		return population_genes;
		
	}
	
	this.get_best_fitness = function ( )
	{
		
		this.evaluate_population( );
		
		return deep_copy( this.best_fitness );
		
	}

	this.get_average_fitness = function ( ) 
	{
		
		this.evaluate_population( );
		
		return deep_copy( this.average_fitness );
		
	}
	
	this.get_worst_fitness = function ( )
	{
		
		this.evaluate_population( );
		
		return deep_copy( this.worst_fitness );
		
	}
	
	this.get_fittest_genome_index = function ( )
	{
		
		this.evaluate_population( );
		
		return deep_copy( this.fittest_genome_index );
		
	}
	
	this.get_weakest_genome_index = function ( )
	{
		
		this.evaluate_population( );
		
		return deep_copy( this.weakest_genome_index );
		
	}
	
	this.get_crossover_probability = function ( )
	{
		
		return deep_copy( this.crossover_probability );
		
	}
	
	this.get_mutation_probability = function ( )
	{
		
		return deep_copy( this.mutation_probability );
		
	}
	
	this.get_generation_number = function ( )
	{
		
		return deep_copy( this.generation_number );
		
	}
	
	// Setter methods.
	
	this.set_crossover_probability = function ( rate )
	{
		
		this.crossover_probability = parseFloat( rate );
		
	}
	
	this.set_mutation_probability = function ( rate )
	{
		
		this.mutation_probability = parseFloat( rate );
		
	}
	
	this.set_generation_number = function ( number )
	{
		
		number = parseInt( number );
		
		this.generation_number = number;
		
	}
	
	this.set_genome_fitness = function ( index, fitness )
	{
		
		index   = parseInt( index );
		fitness = parseFloat( fitness );
		
		if ( ( index > ( this.population_size - 1 ) ) || ( index < 0 ) )
		{
			
			console.error( "[Genetic_Algorithm:set_genome_fitness] Index out of bounds of population size." );
			
			return;
			
		}
		
		this.population[ index ].fitness = fitness;	
	}

}
