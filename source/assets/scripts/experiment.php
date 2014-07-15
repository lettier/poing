<?php

	/*
	* 
	* David Lettier (C) 2013.
	* 
	* http://www.lettier.com/
	* 
	*/
	
	require( '/virtual/users/e14157-14235/storage/vars.php' );
	
	$link   = mysql_connect( "localhost", $a, $b ) or die( mysql_error( ) );
	
	$action = mysql_real_escape_string( $_POST[ 'action' ] );
	
	$generation_number = intval( mysql_real_escape_string( $_POST[ 'generation_number' ] ) );	
	
	$crossover_probability = floatval( mysql_real_escape_string( $_POST[ 'crossover_probability' ] ) );
	
	$mutation_probability  = floatval( mysql_real_escape_string( $_POST[ 'mutation_probability' ] ) );
	
	$best_fitness    = 0;
	
	$average_fitness = 0;
	
	$worst_fitness   = 0;
	
	$fitness         = 0;
	
	$genes           = 0;	
	
	$result          = 0;
	
	if ( $action === "record" )
	{
	
		$best_fitness    = floatval( mysql_real_escape_string( $_POST[ 'best_fitness' ] ) );
		
		$average_fitness = floatval( mysql_real_escape_string( $_POST[ 'average_fitness' ] ) );
		
		$worst_fitness   = floatval( mysql_real_escape_string( $_POST[ 'worst_fitness' ] ) );
		
		$result = mysql_query( "INSERT INTO `lettier0`.`SIMPL_EXP_AVGS` ( `id`, `generation_number`, `best_fitness`, `average_fitness`, `worst_fitness`, `crossover_probability`, `mutation_probability` ) VALUES ( NULL, $generation_number, $best_fitness, $average_fitness, $worst_fitness, $crossover_probability, $mutation_probability );" ); 
			
		if ( $result )
		{
			
			echo "[Experiment] Recorded successfully.";
			
		}
		else
		{
			
			echo mysql_error( $link );
			
		}	
	
	}
	else if ( $action === "store" )
	{

		$fitness = floatval( mysql_real_escape_string( $_POST[ 'fitness' ] ) );
		
		$genes = mysql_real_escape_string( $_POST[ 'genes' ] );
		
		$result = mysql_query( "INSERT INTO `lettier0`.`SIMPL_EXP_10TH_TOPS` ( `id`, `generation_number`, `fitness`, `crossover_probability`, `mutation_probability`, `genes` ) VALUES ( NULL, $generation_number, $fitness, $crossover_probability, $mutation_probability, '$genes' );" ); 
			
		if ( $result )
		{
			
			echo "[Experiment] Stored successfully.";
			
		}
		else
		{
			
			echo mysql_error( $link );
			
		}
	
	}
	else if ( $action === "tournament_start" )
	{
	
		$result = mysql_query( "SELECT `generation_number`, `fitness`, `crossover_probability`, `mutation_probability`, `genes` FROM `lettier0`.`SIMPL_EXP_10TH_TOPS` ORDER BY `generation_number` ASC;" );
		
		if ( $result )
		{
			
			$row = 0;
		
			$echo_string = "";
			
			while ( $row = mysql_fetch_array( $result, MYSQL_ASSOC ) )
			{
			
				$echo_string .= $row[ 'generation_number' ] . ";" . $row[ 'fitness' ] . ";" . $row[ 'crossover_probability' ] . ";" . $row[ 'mutation_probability' ] . ";" . $row[ 'genes' ] . "^";
				
			}
			
			$echo_string = substr( $echo_string, 0, -1 );
			
			echo $echo_string;
			
		}
		else
		{
			
			echo mysql_error( $link );
			
		}
	
	}
	else if ( $action === "tournament_results" )
	{
	
		$fitness = floatval( mysql_real_escape_string( $_POST[ 'fitness' ] ) );
		
		$average_ball_in_play_time = floatval( mysql_real_escape_string( $_POST[ 'average_ball_in_play_time' ] ) );
		
		$result = mysql_query( "INSERT INTO `lettier0`.`SIMPL_EXP_TOUR_RSLTS` ( `id`, `generation_number`, `fitness`, `crossover_probability`, `mutation_probability`, `average_ball_in_play_time` ) VALUES ( NULL, $generation_number, $fitness, $crossover_probability, $mutation_probability, $average_ball_in_play_time );" ); 
		
		if ( $result )
		{
			
			echo "[Experiment] Added tournament results successfully.";
			
		}
		else
		{
			
			echo mysql_error( $link );
			
		}
	
	}
	else
	{
	
		echo "[Experiment] Action not recognized.";
		
	}

?>