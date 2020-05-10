<?php

$link = mysqli_connect('remotemysql.com', '2HJgsf76j3', '5IpUFNcTlu', '2HJgsf76j3');

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}

echo "Success: A proper connection to MySQL was made! The my_db database is great." . PHP_EOL;
echo "Host information: " . mysqli_get_host_info($link) . PHP_EOL;

$matchID = 'h31agy';
$mapName = 'de_vertigo';

echo 'Simulacija matcha. <br>';

$result = mysqli_query($link, "SELECT * FROM `matches` WHERE `match_id` = '" .$matchID. "'");
// provjeriti da li ima row u db
if($result ? mysqli_num_rows($result) : 0 > 0){

    echo 'Pronadjen record, promijeniti record matchid u nesto drugo <br>';
    $matchID = 'noviId';
  
}

echo "Prvo kreiramo mec u db pod nazivom $matchID <br>";

echo 'Prije toga pozeljno je provjeriti da slucajno ne postoji vec record u db <br>';


    

if(!mysqli_query($link , "INSERT INTO matches (`match_id`, `map_name`,`status`, `created_at`) VALUES ( '" .$matchID. "', '" .$mapName . "', 'started', CURRENT_TIME()) "))
{
    die("Error description: " . mysqli_error($link));
}

echo 'Insert dobar, nastavimo sa kreiranjem pocetnih timova <br>';

if(!mysqli_query($link , "INSERT INTO teams (`created_at`) VALUES (CURRENT_TIME())"))
{
    die("Error description: " . mysqli_error($link));
}

echo 'Treba nam id teama koji smo upravo kreirali <br> ';

$ttTeamId = mysqli_insert_id($link);

if(!mysqli_query($link , "INSERT INTO teams (`created_at`) VALUES (CURRENT_TIME())"))
{
    die("Error description: " . mysqli_error($link));
}

echo 'Treba nam id teama koji smo upravo kreirali <br> ';

$ctTeamId = mysqli_insert_id($link);

echo "ID teama koji smo kreirali za tt je: " . $ttTeamId ."<br>";
echo "ID teama koji smo kreirali za ct je: " . $ctTeamId ."<br>";
echo 'Nastavljamo sa kreiranjem igraca u pocetnim timovima <br>';

$dummyPlayers = [
    'tt' => [
        [
            'name' => 'kalle',
            'steam_id' => 'STEAM_0:0:93671414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'kauk',
            'steam_id' => 'STEAM_0:0:93671413',
            'player_frags' =>21,
            'player_deaths' => 2,
            'bomb_plants' => 5,
            'bomb_defs' => 1,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'NapsteR',
            'steam_id' => 'STEAM_0:0:93675414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'lak 1 luk',
            'steam_id' => 'STEAM_0:0:93671414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'kalle2',
            'steam_id' => 'STEAM_0:0:93671414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
    ],

    'ct' => [
        [
            'name' => 'kalle',
            'steam_id' => 'STEAM_0:0:93671414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'kauk',
            'steam_id' => 'STEAM_0:0:93671413',
            'player_frags' =>21,
            'player_deaths' => 2,
            'bomb_plants' => 5,
            'bomb_defs' => 1,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'NapsteR',
            'steam_id' => 'STEAM_0:0:93675414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'lak 1 luk',
            'steam_id' => 'STEAM_0:0:93671414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
        [
            'name' => 'kalle2',
            'steam_id' => 'STEAM_0:0:93671414',
            'player_frags' => 11,
            'player_deaths' => 2,
            'bomb_plants' => 1,
            'bomb_defs' => 0,
            'leaver' => 0,
            'leave_time' => 0
        ],
    ],
];


echo 'Upisujemo igrace u timove <br>';

foreach($dummyPlayers as $key => $teamPlayers){

    foreach($teamPlayers as $player){

        if(!mysqli_query($link , "INSERT INTO player_statistic (`match_id`, `half_id`, `player_name`, `steam_id`, `player_frags`, `player_deaths`, `bomb_plants`, `bomb_defs`, `suicide_count`, `leaver`, `leave_time`, `created_at`) VALUES ( '" .$matchID. "', 1, '" . $player['name']. "', '" . $player['steam_id'] . "', '" . $player['player_frags'] . "', '" . $player['player_deaths'] . "', '" . $player['bomb_plants'] . "', '" . $player['bomb_defs'] . "', 0 , '" . $player['leaver'] . "' , '" . $player['leave_time'] . "',  CURRENT_TIME()) "))
        {
            die("Error description: " . mysqli_error($link));
        }

        $playerID = mysqli_insert_id($link);
        $teamID = $key === 'tt' ? $ttTeamId : $ctTeamId;
       
        if(!mysqli_query($link , "INSERT INTO `team_membership` (`team_id`, `player_id`, `created_at`) VALUES  ($teamID, $playerID, CURRENT_TIME())"))
        {
            die("Error description: " . mysqli_error($link));
        }

    }

}








?>