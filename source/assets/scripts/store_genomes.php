<?php

	/*
	* 
	* David Lettier (C) 2013.
	* 
	* http://www.lettier.com/
	* 
	*/
	
	require( '/virtual/users/e14157-14235/storage/vars.php' );
	
	$link = mysql_connect( "localhost", $a, $b ) or die( mysql_error( ) );
	
	$generation_number = intval( mysql_real_escape_string( $_POST[ 'generation_number' ] ) );
	
	$best_fitness      = floatval( mysql_real_escape_string( $_POST[ 'best_fitness' ] ) );
	
	$average_fitness   = floatval( mysql_real_escape_string( $_POST[ 'average_fitness' ] ) );
	
	$worst_fitness     = floatval( mysql_real_escape_string( $_POST[ 'worst_fitness' ] ) );
	
	$population_size   = intval( mysql_real_escape_string( $_POST[ 'population_size' ] ) );
	
	$number_of_genes_per_genome = intval( mysql_real_escape_string( $_POST[ 'number_of_genes_per_genome' ] ) );
	
	$crossover_probability = floatval( mysql_real_escape_string( $_POST[ 'crossover_probability' ] ) );
	
	$mutation_probability  = floatval( mysql_real_escape_string( $_POST[ 'mutation_probability' ] ) );
	
	$population_genes = mysql_real_escape_string( $_POST[ 'population_genes' ] ); 	
	
	mysql_select_db( "lettier0" ) or die( mysql_error( ) );
	
	$row_sql = mysql_query( "SELECT MAX( `generation_number` ) AS max FROM `SIMPL_GENOMES` WHERE `population_size` = $population_size AND `number_of_genes_per_genome` = $number_of_genes_per_genome;" );
	$row = mysql_fetch_array( $row_sql );
	$highest_generation_number = intval( $row[ 'max' ] );
	
	$result = null;
	
	if ( !is_null( $highest_generation_number ) AND !empty( $highest_generation_number ) AND $highest_generation_number != 0  )
	{
	
		if ( $generation_number > $highest_generation_number )
		{
			
			$result = mysql_query( "INSERT INTO `lettier0`.`SIMPL_GENOMES` ( `id`, `entry_date`, `generation_number`, `best_fitness`, `average_fitness`, `worst_fitness`, `population_size`, `number_of_genes_per_genome`, `crossover_probability`, `mutation_probability`, `population_genes` ) VALUES ( NULL, CURRENT_TIMESTAMP, $generation_number, $best_fitness, $average_fitness, $worst_fitness, $population_size, $number_of_genes_per_genome, $crossover_probability, $mutation_probability, '$population_genes' );" ); 
			
			if ( $result )
			{
				
				echo "[Store_Genomes] Added generation successfully.";
				
			}
			else
			{
				
				echo mysql_error( $link );
				
			}
		}
		else
		{
		
			echo "[Store_Genomes] Need generation number higher than $highest_generation_number.";
			
		}
	}
	else
	{
	
		$result = mysql_query( "INSERT INTO `lettier0`.`SIMPL_GENOMES` ( `id`, `entry_date`, `generation_number`, `best_fitness`, `average_fitness`, `worst_fitness`, `population_size`, `number_of_genes_per_genome`, `crossover_probability`, `mutation_probability`, `population_genes` ) VALUES ( NULL, CURRENT_TIMESTAMP, $generation_number, $best_fitness, $average_fitness, $worst_fitness, $population_size, $number_of_genes_per_genome, $crossover_probability, $mutation_probability, '$population_genes' );" ); 
		
		if ( $result )
		{
			
			echo "[Store_Genomes] Added generation successfully.";
			
		}
		else
		{
			
			echo mysql_error( $link );
			
		}
	
	}

?>