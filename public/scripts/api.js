"use strict";

/**
 * common object for interact with API
 * all methods return callback with vue-resource response object
 */
const spieldoseAPI = {
    poll: function (callback) {
        Vue.http.get(siteUrl + "/api/user/poll").then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    signIn: function (email, password, callback) {
        var params = {
            email: email,
            password: password
        }
        Vue.http.post(siteUrl + "/api/user/signin", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    signOut: function (callback) {
        Vue.http.get(siteUrl + "/api/user/signout").then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    globalSearch: function (text, actualPage, resultsPage, callback) {
        var params = {
            actualPage: 1,
            resultsPage: DEFAULT_SECTION_RESULTS_PAGE
        };
        if (actualPage) {
            params.actualPage = parseInt(actualPage);
        }
        if (resultsPage) {
            params.resultsPage = parseInt(resultsPage);
        }
        if (text) {
            params.text = text;
        }
        Vue.http.post(siteUrl + "/api/search/global", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getArtist: function (name, callback) {
        Vue.http.get(siteUrl + "/api/artist/" + encodeURIComponent(name)).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getAlbumTracks: function (album, artist, year, callback) {
        var params = {};
        if (album) {
            params.album = album;
        }
        if (artist) {
            params.artist = artist;
        }
        if (year) {
            params.year = year;
        }
        Vue.http.post(siteUrl + "/api/track/search", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    searchTracks: function (actualPage, resultsPage, order, callback) {
        var params = {
            actualPage: 1,
            resultsPage: DEFAULT_SECTION_RESULTS_PAGE,
        };
        if (actualPage) {
            params.actualPage = actualPage;
        }
        if (resultsPage) {
            params.resultsPage = resultsPage;
        }
        if (order) {
            params.orderBy = order;
        }
        Vue.http.post(siteUrl + "/api/track/search", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    searchArtists: function (name, actualPage, resultsPage, callback) {
        var params = {
            actualPage: 1,
            resultsPage: DEFAULT_SECTION_RESULTS_PAGE
        };
        if (name) {
            params.text = name;
        }
        if (actualPage) {
            params.actualPage = parseInt(actualPage);
        }
        if (resultsPage) {
            params.resultsPage = parseInt(resultsPage);
        }
        Vue.http.post(siteUrl + "/api/artist/search", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    searchPlaylists: function (name, actualPage, resultsPage, callback) {
        var params = {
            actualPage: 1,
            resultsPage: DEFAULT_SECTION_RESULTS_PAGE
        };
        if (name) {
            params.text = name;
        }
        if (actualPage) {
            params.actualPage = parseInt(actualPage);
        }
        if (resultsPage) {
            params.resultsPage = parseInt(resultsPage);
        }
        Vue.http.post(siteUrl + "/api/playlist/search", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getPlayList: function(playlist, callback) {
        Vue.http.get(siteUrl + "/api/playlist/" + playlist.id).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    loveTrack: function (trackId, callback) {
        var params = {};
        Vue.http.post(siteUrl + "/api/track/" + trackId + "/love", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    unLoveTrack: function (trackId, callback) {
        var params = {};
        Vue.http.post(siteUrl + "/api/track/" + trackId + "/unlove", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getTopPlayedTracks: function (interval, artist, callback) {
        var params = {};
        if (artist) {
            params.artist = artist;
        }
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/top_played_tracks", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getTopPlayedArtists: function (interval, callback) {
        var params = {};
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/top_artists", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getTopPlayedGenres: function (interval, callback) {
        var params = {};
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/top_genres", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getRecentAddedTracks: function (interval, callback) {
        var params = {
            entity: "tracks"
        };
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/recently_added", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getRecentAddedArtists: function (interval, callback) {
        var params = {
            entity: "artists"
        };
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/recently_added", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getRecentAddedAlbums: function (interval, callback) {
        var params = {
            entity: "albums"
        };
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/recently_added", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getRecentPlayedTracks: function (interval, callback) {
        var params = {
            entity: "tracks"
        };
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/recently_played", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getRecentPlayedArtists: function (interval, callback) {
        var params = {
            entity: "albums"
        };
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/recently_played", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getRecentPlayedAlbums: function (interval, callback) {
        var params = {
            entity: "albums"
        };
        switch (interval) {
            case 0:
                break;
            case 1:
                params.fromDate = moment().subtract(7, 'days').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 2:
                params.fromDate = moment().subtract(1, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 3:
                params.fromDate = moment().subtract(6, 'months').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
            case 4:
                params.fromDate = moment().subtract(1, 'year').format('YYYYMMDD');
                params.toDate = moment().format('YYYYMMDD');
                break;
        }
        Vue.http.post(siteUrl + "/api/metrics/recently_played", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getPlayStatMetricsByHour: function (callback) {
        var params = {};
        Vue.http.post(siteUrl + "/api/metrics/play_stats_by_hour", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getPlayStatMetricsByWeekDay: function (callback) {
        var params = {};
        Vue.http.post(siteUrl + "/api/metrics/play_stats_by_weekday", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getPlayStatMetricsByMonth: function (callback) {
        var params = {};
        Vue.http.post(siteUrl + "/api/metrics/play_stats_by_month", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    },
    getPlayStatMetricsByYear: function (callback) {
        var params = {};
        Vue.http.post(siteUrl + "/api/metrics/play_stats_by_year", params).then(
            response => {
                callback(response);
            },
            response => {
                callback(response);
            }
        );
    }
};