<?php

    declare(strict_types=1);

    namespace Spieldose;

    class Track {

        public $id;
        public $path;

	    public function __construct (string $id = "") {
            $this->id = $id;
        }

        public function __destruct() { }

        private function exists(\Spieldose\Database\DB $dbh): bool {
            return(true);
        }

        public function get(\Spieldose\Database\DB $dbh) {
            if (isset($this->id) && ! empty($this->id)) {
                if ($dbh == null) {
                    $dbh = new \Spieldose\Database\DB();
                }
                $results = $dbh->query("SELECT local_path AS path FROM FILE WHERE id = :id", array(
                    (new \Spieldose\Database\DBParam())->str(":id", $this->id)
                ));
                if (count($results) == 1) {
                    $this->path = $results[0]->path;
                } else {
                    throw new \Spieldose\Exception\NotFoundException("id: " . $this->name);
                }
            } else {
                throw new \Spieldose\Exception\InvalidParamsException("id");
            }
        }

        public static function search(\Spieldose\Database\DB $dbh, int $page = 1, int $resultsPage = 16, array $filter = array(), string $order = "") {
            if ($dbh == null) {
                $dbh = new \Spieldose\Database\DB();
            }
            $params = array();
            $whereCondition = "";
            if (isset($filter)) {
                $conditions = array();
                if (isset($filter["text"])) {
                    $conditions[] = " (COALESCE(MBT.track, F.track_name) LIKE :text OR COALESCE(MBA2.artist, F.track_artist) LIKE :text OR COALESCE(MBA1.album, F.album_name) LIKE :text) ";
                    $params[] = (new \Spieldose\Database\DBParam())->str(":text", "%" . $filter["text"] . "%");
                }
                if (isset($filter["artist"])) {
                    $conditions[] = " COALESCE(MBA2.artist, F.track_artist) = :artist ";
                    $params[] = (new \Spieldose\Database\DBParam())->str(":artist", $filter["artist"]);
                }
                if (isset($filter["album"])) {
                    $conditions[] = " COALESCE(MBA1.album, F.album_name) = :album ";
                    $params[] = (new \Spieldose\Database\DBParam())->str(":album", $filter["album"]);
                }
                $whereCondition = count($conditions) > 0 ? " AND " .  implode(" AND ", $conditions) : "";
            }
            $queryCount = '
                SELECT
                    COUNT (DISTINCT(COALESCE(MBT.track, F.track_name))) AS total
                FROM FILE F
                LEFT JOIN MB_CACHE_TRACK MBT ON MBT.mbid = F.track_mbid
                LEFT JOIN MB_CACHE_ALBUM MBA1 ON MBA1.mbid = F.album_mbid
                LEFT JOIN MB_CACHE_ARTIST MBA2 ON MBA2.mbid = F.artist_mbid
                WHERE COALESCE(MBT.track, F.track_name) IS NOT NULL
                ' . $whereCondition . '
            ';
            $result = $dbh->query($queryCount, $params);
            $data = new \stdClass();
            $data->actualPage = $page;
            $data->resultsPage = $resultsPage;
            $data->totalResults = $result[0]->total;
            if ($resultsPage > 0) {
                $data->totalPages = ceil($data->totalResults / $resultsPage);
            } else {
                $data->totalPages = $data->totalResults > 0 ? 1: 0;
                $resultsPage = $data->totalResults;
            }
            $sqlOrder = "";
            if (! empty($order) && $order == "random") {
                $sqlOrder = " ORDER BY RANDOM() ";
            } else {
                $sqlOrder = " ORDER BY F.track_number, COALESCE(MBT.track, F.track_name) COLLATE NOCASE ASC ";
            }
            $query = sprintf('
                SELECT DISTINCT
                    id,
                    COALESCE(MBT.track, F.track_name) AS title,
                    COALESCE(MBA2.artist, F.track_artist) AS artist,
                    COALESCE(MBA1.album, F.album_name) AS album,
                    album_artist AS albumartist,
                    COALESCE(MBA1.year, F.year) AS year,
                    playtime_seconds AS playtimeSeconds,
                    playtime_string AS playtimeString,
                    COALESCE(MBA1.image, MBA2.image) AS image
                FROM FILE F
                LEFT JOIN MB_CACHE_TRACK MBT ON MBT.mbid = F.track_mbid
                LEFT JOIN MB_CACHE_ALBUM MBA1 ON MBA1.mbid = F.album_mbid
                LEFT JOIN MB_CACHE_ARTIST MBA2 ON MBA2.mbid = F.artist_mbid
                WHERE F.track_name IS NOT NULL
                %s
                %s
                LIMIT %d OFFSET %d
                ',
                $whereCondition,
                $sqlOrder,
                $resultsPage,
                $resultsPage * ($page - 1)
            );
            $data->results = $dbh->query($query, $params);
            return($data);
        }

    }

?>