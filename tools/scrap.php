<?php

    namespace Spieldose;

    require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . "include" . DIRECTORY_SEPARATOR. "configuration.php";

    \Spieldose\Utils::setAppDefaults();

    echo "Spieldose scrap utility " . PHP_EOL;

    $cmdLine = new \Spieldose\CmdLine("", array("artists"));
    if ($cmdLine->hasParam("artists")) {
        $dbh = new \Spieldose\Database();
        $scrapper = new \Spieldose\Scrapper();
        $artists = $scrapper->getPendingArtists($dbh);
        $totalArtists = count($artists);
        $failed = array();
        echo sprintf("Processing %d artists%s", $totalArtists, PHP_EOL);
        for ($i = 0; $i < $totalArtists; $i++) {
            try {
                $scrapper->mbArtistScrap($dbh, $artists[$i]);
            } catch (\Throwable $e) {
                $failed[] = $artists[$i];
            }
            \Spieldose\Utils::showProgressBar($i + 1, $totalArtists, 20);
        }
        $totalFailed = count($failed);
        if ($totalFailed > 0) {
            echo sprintf("Failed to scrap %d artists:%s", $totalFailed, PHP_EOL);
            print_r($failed);
        }
    }

?>