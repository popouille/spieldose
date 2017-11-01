<?php

    declare(strict_types=1);

    namespace Spieldose;

    class Metrics {

        public static function GetTopPlayedTracks(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $params = array();
            $queryConditions = "";
            if (isset($filter["fromDate"]) && ! empty($filter["fromDate"]) && isset($filter["toDate"]) && ! empty($filter["toDate"])) {
                $queryConditions = " WHERE strftime('%Y%m%d', S.played) BETWEEN :fromDate  AND :toDate ";
                $params[] = (new \Spieldose\Database\DBParam())->str(":fromDate", $filter["fromDate"]);
                $params[] = (new \Spieldose\Database\DBParam())->str(":toDate", $filter["toDate"]);
            }
            $query = '
                SELECT S.file_id AS id, F.track_name AS title, COALESCE(MB.artist, F.track_artist) AS artist, COUNT(S.played) AS total
                FROM STATS S
                LEFT JOIN FILE F ON F.id = S.file_id
                LEFT JOIN MB_CACHE_ARTIST MB ON MB.mbid = F.artist_mbid
            ' . $queryConditions . '
                GROUP BY S.file_id
                HAVING title NOT NULL
                ORDER BY total DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, $params);
            return($metrics);
        }

        public static function GetTopArtists(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $params = array();
            $queryConditions = "";
            if (isset($filter["fromDate"]) && ! empty($filter["fromDate"]) && isset($filter["toDate"]) && ! empty($filter["toDate"])) {
                $queryConditions = " WHERE strftime('%Y%m%d', S.played) BETWEEN :fromDate  AND :toDate ";
                $params[] = (new \Spieldose\Database\DBParam())->str(":fromDate", $filter["fromDate"]);
                $params[] = (new \Spieldose\Database\DBParam())->str(":toDate", $filter["toDate"]);
            }
            $query = '
                SELECT COALESCE(MB.artist, F.track_artist) AS artist, COUNT(S.played) AS total
                FROM STATS S
                LEFT JOIN FILE F ON F.id = S.file_id
                LEFT JOIN MB_CACHE_ARTIST MB ON MB.mbid = F.artist_mbid
                ' . $queryConditions . '
                GROUP BY F.track_artist
                HAVING artist NOT NULL
                ORDER BY total DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, $params);
            return($metrics);
        }

        public static function GetTopGenres(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $params = array();
            $queryConditions = "";
            if (isset($filter["fromDate"]) && ! empty($filter["fromDate"]) && isset($filter["toDate"]) && ! empty($filter["toDate"])) {
                $queryConditions = " WHERE strftime('%Y%m%d', S.played) BETWEEN :fromDate  AND :toDate ";
                $params[] = (new \Spieldose\Database\DBParam())->str(":fromDate", $filter["fromDate"]);
                $params[] = (new \Spieldose\Database\DBParam())->str(":toDate", $filter["toDate"]);
            }
            $query = '
                SELECT F.genre AS genre, COUNT(S.played) AS total
                FROM STATS S
                LEFT JOIN FILE F ON F.id = S.file_id
                ' . $queryConditions . '
                GROUP BY F.genre
                HAVING genre NOT NULL
                ORDER BY total DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, $params);
            return($metrics);
        }

        public static function GetRecentlyAddedTracks(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT F.id AS id, F.track_name AS title, COALESCE(MB.artist, F.track_artist) AS artist
                FROM FILE F
                LEFT JOIN MB_CACHE_ARTIST MB ON MB.mbid = F.artist_mbid
                WHERE title IS NOT NULL
                ORDER BY created DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

        public static function GetRecentlyAddedArtists(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT DISTINCT COALESCE(MB.artist, F.track_artist) AS artist
                FROM FILE F
                LEFT JOIN MB_CACHE_ARTIST MB ON MB.mbid = F.artist_mbid
                WHERE artist IS NOT NULL
                ORDER BY created DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

        public static function GetRecentlyAddedAlbums(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT DISTINCT COALESCE(MB2.album, F.album_name) AS album, COALESCE(MB2.artist, MB1.artist, F.track_artist) AS artist
                FROM FILE F
                LEFT JOIN MB_CACHE_ARTIST MB1 ON MB1.mbid = F.artist_mbid
                LEFT JOIN MB_CACHE_ALBUM MB2 ON MB2.mbid = F.album_mbid
                WHERE album IS NOT NULL
                ORDER BY created DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

        public static function GetRecentlyPlayedTracks(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT DISTINCT F.id AS id, F.track_name AS title, COALESCE(MB.artist, F.track_artist) AS artist
                FROM STATS S
                LEFT JOIN FILE F ON F.id = S.file_id
                LEFT JOIN MB_CACHE_ARTIST MB ON MB.mbid = F.artist_mbid
                WHERE title IS NOT NULL
                ORDER BY S.played DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

        public static function GetRecentlyPlayedArtists(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT DISTINCT COALESCE(MB.artist, F.track_artist) AS artist
                FROM STATS S
                LEFT JOIN FILE F ON F.id = S.file_id
                LEFT JOIN MB_CACHE_ARTIST MB ON MB.mbid = F.artist_mbid
                WHERE artist IS NOT NULL
                ORDER BY S.played DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

        public static function GetRecentlyPlayedAlbums(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT DISTINCT COALESCE(MB2.album, F.album_name) AS album, COALESCE(MB2.artist, MB1.artist, F.track_artist) AS artist
                FROM STATS S
                LEFT JOIN FILE F ON F.id = S.file_id
                LEFT JOIN MB_CACHE_ARTIST MB1 ON MB1.mbid = F.artist_mbid
                LEFT JOIN MB_CACHE_ALBUM MB2 ON MB2.mbid = F.album_mbid
                WHERE album IS NOT NULL
                ORDER BY S.played DESC
                LIMIT 5;
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

        public static function GetPlayStats(\Spieldose\Database\DB $dbh, $filter): array {
            $metrics = array();
            $query = '
                SELECT strftime("%H", S.played) AS hour, COUNT(*) AS total
                FROM STATS S
                GROUP BY hour
                ORDER BY hour
            ';
            $metrics = $dbh->query($query, array());
            return($metrics);
        }

    }

?>