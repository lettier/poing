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
	
	$population_size = intval( mysql_real_escape_string( $_POST[ 'population_size' ] ) );
	
	$number_of_genes_per_genome = intval( mysql_real_escape_string( $_POST[ 'number_of_genes_per_genome' ] ) ); 
	
	mysql_select_db( "lettier0" ) or die( mysql_error( ) );
	
	$row_sql = mysql_query( "SELECT `generation_number`, `crossover_probability`, `mutation_probability`, `population_genes` FROM `SIMPL_GENOMES` WHERE `population_size` = $population_size AND `number_of_genes_per_genome` = $number_of_genes_per_genome ORDER BY `generation_number` DESC LIMIT 1" );
	$row = mysql_fetch_array( $row_sql );
	echo $row[ 'generation_number' ] . ";" . $row[ 'crossover_probability' ] . ";" . $row[ 'mutation_probability' ] . ";" . $row[ 'population_genes' ];

?>