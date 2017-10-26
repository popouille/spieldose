"use strict";

const DEFAULT_SECTION_RESULTS_PAGE = 32;

/* global object for events between vuejs components */
const bus = new Vue();

/* change section event */
window.onhashchange = function (e) {
    bus.$emit("hashChanged", location.hash);
};

/* modal component (warning & errors) */
var modal = Vue.component('spieldose-modal-component', {
    template: '#modal-template',
    data: function () {
        return ({
            visible: false,
            title: "Default modal title",
            body: "Default modal body"
        });
    },
    created: function () {
        var self = this;
        bus.$on("showModal", function (title, body) {
            self.show(title, body);
        });
    },
    methods: {
        show: function (title, body) {
            this.title = title;
            this.body = body;
            this.visible = true;
        },
        hide: function () {
            this.visible = false;
            this.$emit("closeModal");
        }
    }
});

/* app (logged) menu component */
var menu = Vue.component('spieldose-menu-component', {
    template: '#menu-template',
    data: function () {
        return ({
            xhr: false,
            section: window.location.hash
        });
    },
    created: function () {
        var self = this;
        bus.$on("hashChanged", function (hash) {
            self.section = hash;
            self.changeSection(self.section);
        });
        bus.$on("activateSection", function (s) {
            self.section = s;
        });
        self.changeSection(self.section);
    },
    methods: {
        signout: function (e) {
            bus.$emit("signOut");
        }, changeSection(s) {
            bus.$emit("loadSection", s);
        }
    }
});

var search = Vue.component('spieldose-search', {
    template: '#search-template',
    data: function () {
        return ({
            filterByTextOn: "",
            filterByTextCondition: ""
        });
    }, props: ['section'
    ], methods: {
        search() {
            switch (this.filterByTextOn) {
                case "artists":
                    if (this.section != "#/artists") {
                        bus.$emit("activateSection", "#/artists");
                    }
                    bus.$emit("browseArtists", this.filterByTextCondition, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    break;
                case "albums":
                    bus.$emit("activateSection", "#/albums");
                    bus.$emit("browseAlbums", this.filterByTextCondition, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    break;
                default:
                    bus.$emit("activateSection", "#/search-results");
                    bus.$emit("globalSearch", this.filterByTextCondition, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    break;
            }
        }
    }
});

var search_results = Vue.component('spieldose-search-results', {
    template: '#search-results-template',
    data: function () {
        return ({
            text: null,
            results: []
        });
    }, props: ['section'
    ], created: function () {
        var self = this;
        bus.$on("globalSearch", function (text, page, resultsPage) {
            self.text = text;
            self.globalSearch(text, page, resultsPage);
        });
    }, filters: {
    }, methods: {
        play: function (track) {
            bus.$emit("replacePlayList", new Array(track));
        },
        enqueue: function (track) {
            bus.$emit("appendToPlayList", track);
        },
        highlight: function (words) {
            if (words) {
                return words.replace(new RegExp("(" + this.text + ")", 'gi'), '<span class="highlight">$1</span>');
            } else {
                return (null);
            }
        },
        globalSearch(text, page, resultsPage) {
            var self = this;
            var fData = new FormData();
            fData.append("actualPage", page);
            fData.append("resultsPage", resultsPage * 2);
            if (text) {
                fData.append("text", text);
            }
            jsonHttpRequest("POST", "/api/track/search", fData, function (httpStatusCode, response) {
                self.results = response.tracks;
            });
        }
    }
});

/* app chart (test) component */
var chart = Vue.component('spieldose-chart', {
    template: '#chart-template',
    data: function () {
        return ({
            xhr: false,
            iconClass: 'fa-pie-chart',
            items: []
        });
    },
    created: function () {
        //this.loadChartData();
    }, methods: {
        loadChartData: function () {
            var self = this;
            var url = null;
            switch (this.type) {
                default:
                    url = "/api/track/search";
                    break;
            }
            var fData = new FormData();
            fData.append("actualPage", 1);
            fData.append("resultsPage", 8);
            fData.append("orderBy", "random");
            self.xhr = true;
            jsonHttpRequest("POST", url, fData, function (httpStatusCode, response) {
                self.xhr = false;
                switch (self.type) {
                    default:
                        self.items = response.tracks;
                        break;
                }
            });
        }
    },
    props: ['type', 'title']
});

var dashboard = Vue.component('spieldose-dashboard', {
    template: '#dashboard-template',
    data: function () {
        return ({});
    },
    props: ['section'
    ], created: function () {
    }, methods: {
    }
});

var pagination = Vue.component('spieldose-pagination', {
    template: '#pagination-template',
    data: function () {
        return ({
            actualPage: 1,
            totalResults: 0,
            resultsPage: DEFAULT_SECTION_RESULTS_PAGE,
            totalPages: 0
        });
    }, props: ['searchEvent'
    ], computed: {
        visible: function () {
            return (this.totalResults > 0 && this.totalPages > 0);
        }
    }, created: function () {
        var self = this;
        bus.$on("updatePager", function (actualPage, totalPages, totalResults) {
            self.actualPage = actualPage;
            self.totalPages = totalPages;
            self.totalResults = totalResults;
        });
    }, methods: {
        previous: function () {
            if (this.actualPage > 1) {
                bus.$emit(this.searchEvent, null, this.actualPage - 1, this.resultsPage);
            }
        },
        next: function () {
            if (this.actualPage < this.totalPages) {
                bus.$emit(this.searchEvent, null, this.actualPage + 1, this.resultsPage);
            }
        },
        navigateTo: function (pageIdx) {
            if (pageIdx > 0 && pageIdx <= this.totalPages) {
                bus.$emit(this.searchEvent, null, pageIdx, this.resultsPage);
            }
        }
    }
});

var browseArtists = Vue.component('spieldose-browse-artists', {
    template: '#browse-artists-template',
    data: function () {
        return ({
            artists: [],
            pager: {
                actualPage: 1,
                previousPage: 1,
                nextPage: 1,
                totalPages: 0,
                resultsPage: DEFAULT_SECTION_RESULTS_PAGE
            }
        });
    }, props: ['section'
    ], computed: {
    }, created: function () {
        var self = this;
        bus.$on("browseArtists", function (text, page, resultsPage) {
            self.search(text, page, resultsPage);
        });
    }, methods: {
        search: function (text, page, resultsPage) {
            var self = this;
            self.pager.actualPage = page;
            if (page > 1) {
                self.pager.previousPage = page - 1;
            } else {
                self.pager.previousPage = 1;
            }
            var fData = new FormData();
            fData.append("actualPage", self.pager.actualPage);
            fData.append("resultsPage", self.pager.resultsPage);
            if (text) {
                fData.append("text", text);
            }
            jsonHttpRequest("POST", "/api/artist/search.php", fData, function (httpStatusCode, response) {
                if (response.artists.length > 0) {
                    self.pager.totalPages = response.totalPages;
                } else {
                    self.pager.totalPages = 0;
                }
                if (page < self.pager.totalPages) {
                    self.pager.nextPage = page + 1;
                } else {
                    self.pager.nextPage = self.pager.totalPages;
                }
                self.artists = response.artists;
                bus.$emit("updatePager", self.pager.actualPage, self.pager.totalPages, self.pager.totalResults);
            });
        }
    }
});

var browseArtist = Vue.component('spieldose-browse-artist', {
    template: '#browse-artist-template',
    data: function () {
        return ({
            artist: {},
            detailedView: false,
        });
    }, props: ['section'
    ], created: function () {
        var self = this;
        bus.$on("loadArtist", function (artist) {
            self.getArtist(artist);
        });
    }, methods: {
        getArtist: function (artist) {
            var self = this;
            var fData = new FormData();
            fData.append("name", artist);
            jsonHttpRequest("POST", "/api/artist/get.php", fData, function (httpStatusCode, response) {
                self.artist = response.artist;
                if (self.artist.bio) {
                    self.artist.bio = self.artist.bio.replace(/(?:\r\n|\r|\n)/g, '<br />')
                }
            });
        },
        playAlbum: function (album, artist) {
            bus.$emit("searchIntoPlayList", 1, DEFAULT_SECTION_RESULTS_PAGE, null, artist, album, null);
        },
        hideAlbumDetails: function () {
            this.detailedView = false;
        }, showAlbumDetails: function () {
            this.detailedView = true;
        }
    }
});

var browseAlbums = Vue.component('spieldose-browse-albums', {
    template: '#browse-albums-template',
    data: function () {
        return ({
            albums: [],
            pager: {
                actualPage: 1,
                previousPage: 1,
                nextPage: 1,
                totalPages: 0,
                resultsPage: DEFAULT_SECTION_RESULTS_PAGE
            }
        });
    }, props: ['section'
    ], computed: {
    }, created: function () {
        var self = this;
        bus.$on("browseAlbums", function (text, page, resultsPage) {
            self.search(text, page, resultsPage);
        });
    }, methods: {
        search: function (text, page, resultsPage) {
            var self = this;
            self.pager.actualPage = page;
            if (page > 1) {
                self.pager.previousPage = page - 1;
            } else {
                self.pager.previousPage = 1;
            }
            var fData = new FormData();
            fData.append("actualPage", self.pager.actualPage);
            fData.append("resultsPage", self.pager.resultsPage);
            if (text) {
                fData.append("text", text);
            }
            jsonHttpRequest("POST", "/api/album/search.php", fData, function (httpStatusCode, response) {
                for (var i = 0; i < response.albums.length; i++) {
                    if (response.albums[i].image) {
                        response.albums[i].albumCoverUrl = response.albums[i].image;
                    } else {
                        response.albums[i].albumCoverUrl = "#";
                    }
                }
                if (response.albums.length > 0) {
                    self.pager.totalPages = response.totalPages;
                } else {
                    self.pager.totalPages = 0;
                }
                if (page < self.pager.totalPages) {
                    self.pager.nextPage = page + 1;
                } else {
                    self.pager.nextPage = self.pager.totalPages;
                }
                self.albums = response.albums;
                bus.$emit("updatePager", self.pager.actualPage, self.pager.totalPages, self.pager.totalResults);
            });
        },
        enqueueAlbumTracks: function (album, artist) {
            bus.$emit("searchIntoPlayList", 1, DEFAULT_SECTION_RESULTS_PAGE, null, artist, album, null);
        }
    }
});

var browseGenres = Vue.component('spieldose-browse-genres', {
    template: '#browse-genres-template'
    , props: ['section'
    ]
});

var preferences = Vue.component('spieldose-preferences', {
    template: '#preferences-template'
    , props: ['section'
    ]
});

var player = Vue.component('spieldose-player-component', {
    template: '#player-template',
    data: function () {
        return ({
            playing: false,
            url: "",
            nowPlayingTrack: null,
            playList: [],
            repeat: false,
            shuffle: false,
            autoPlay: true,
        });
    },
    created: function () {
        var self = this;
        bus.$on("replacePlayList", function (tracks) {
            self.playList = tracks;
            if (self.playing) {
                self.pause();
            }
            if (self.autoPlay) {
                if (self.playList && self.playList.length > 0) {
                    self.play(self.playList[0]);
                }
            }
        });
        bus.$on("appendToPlayList", function (track) {
            var notFound = true;
            for (var i = 0; i < self.playList.length && notFound; i++) {
                if (self.playList[i].id == track.id) {
                    notFound = false;
                }
            }
            if (notFound) {
                self.playList.push(track);
            }
        });
        bus.$on("searchIntoPlayList", function (page, resultsPage, text, artist, album) {
            self.fillFromSearch(page, resultsPage, text, artist, album, null);
        });
        this.fillFromSearch(1, DEFAULT_SECTION_RESULTS_PAGE, null, null, null, "random");
    },
    methods: {
        play: function (track) {
            this.nowPlayingTrack = track;
            this.url = "/api/track/get/" + track.id;
            console.log(this.url);
            this.playing = true;
            initializeVisualizer($("canvas")[0], $("audio")[0]);
        },
        pause: function () {
            if (this.playing) {
                this.$refs.player.pause();
                this.playing = false;
            }
        },
        playPrevious: function () {
            var actualPlayingIdx = -1;
            for (var i = 0; i < this.playList.length && actualPlayingIdx == - 1; i++) {
                if (this.nowPlayingTrack.id == this.playList[i].id) {
                    actualPlayingIdx = i - 1;
                }
            }
            if (actualPlayingIdx > -1) {
                this.play(this.playList[actualPlayingIdx]);
            }
        },
        playNext: function () {
            var actualPlayingIdx = -1;
            for (var i = 0; i < this.playList.length && actualPlayingIdx == - 1; i++) {
                if (this.nowPlayingTrack.id == this.playList[i].id) {
                    actualPlayingIdx = i + 1;
                }
            }
            if (actualPlayingIdx > 0 && actualPlayingIdx < this.playList.length) {
                this.play(this.playList[actualPlayingIdx]);
            }
        },
        isPlayingTrack(track) {
            return (this.nowPlayingTrack != null && this.nowPlayingTrack.id == track.id);
        },
        fillFromSearch: function (page, resultsPage, text, artist, album, order) {
            var self = this;
            var fData = new FormData();
            fData.append("actualPage", page);
            fData.append("resultsPage", resultsPage);
            if (text) {
                fData.append("text", page);
            }
            if (artist) {
                fData.append("artist", artist);
            }
            if (album) {
                fData.append("album", album);
            }
            if (order) {
                fData.append("orderBy", order);
            }
            jsonHttpRequest("POST", "/api/track/search", fData, function (httpStatusCode, response) {
                bus.$emit("replacePlayList", response && response.tracks ? response.tracks : []);
            });
        },
        toggleShuffle: function () {
            this.shuffle = !this.shuffle;
        }
    }, computed: {
        nowPlayingTitle: function () {
            if (this.nowPlayingTrack) {
                return (this.nowPlayingTrack.title);
            } else {
                return ("");
            }
        },
        nowPlayingLength: function () {
            if (this.nowPlayingTrack) {
                return (this.nowPlayingTrack.playtimeString);
            } else {
                return ("");
            }
        },
        nowPlayingArtist: function () {
            if (this.nowPlayingTrack) {
                return (this.nowPlayingTrack.artist);
            } else {
                return ("");
            }
        },
        nowPlayingArtistAlbum: function () {
            if (this.nowPlayingTrack) {
                return (this.nowPlayingTrack.album);
            } else {
                return ("");
            }
        },
        nowPlayingYear: function () {
            if (this.nowPlayingTrack) {
                return (this.nowPlayingTrack.year);
            } else {
                return ("");
            }
        },
        nowPlayingImage: function () {
            if (this.nowPlayingTrack) {
                return (this.nowPlayingTrack.image);
            } else {
                return ("");
            }
        }
    }, mounted: function () {
        this.$watch('url', function () {
            if (this.url) {
                this.$refs.player.pause();
                this.$refs.player.load();
                this.$refs.player.play();
            } else {
                this.$refs.player.pause();
            }
        });
    }
});

var container = Vue.component('spieldose-app-component', {
    template: '#spieldose-template',
    data: function () {
        return ({
            xhr: false,
            section: window.location.hash,
            artistList: [],
            albumList: [],
            trackList: [],
            pager: {
                actualPage: 1,
                previousPage: 1,
                nextPage: 1,
                totalPages: 0,
                resultsPage: DEFAULT_SECTION_RESULTS_PAGE
            }
        });
    },
    computed: {
    }, created: function () {
        var self = this;
        bus.$on("loadSection", function (s) {
            self.changeSection(s);
        });
        bus.$on("activateSection", function (s) {
            self.section = s;
        });
    },
    methods: {
        changeSection: function (s) {
            var self = this;
            self.section = s;
            self.filterByTextOn = "";
            switch (s) {
                case "#/artists":
                    bus.$emit("browseArtists", null, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    self.filterByTextOn = "artists";
                    break;
                case "#/albums":
                    bus.$emit("browseAlbums", null, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    self.filterByTextOn = "albums";
                    break;
                default:
                    if (s.indexOf("#/artist") >= 0) {
                        var m = s.match(/#\/artist\/(.+)/);
                        if (m && m.length == 2) {
                            self.section = "#/artist";
                            bus.$emit("loadArtist", m[1]);
                        } else {
                            // TODO
                        }
                    }
                    break;
            }
        },
        globalSearch2: function () {
            switch (this.filterByTextOn) {
                case "artists":
                    if (this.section != "#/artists") {
                        this.section = "#/artists";
                    }
                    bus.$emit("browseArtists", this.filterByTextCondition, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    break;
                case "albums":
                    if (this.section != "#/albums") {
                        this.section = "#/albums";
                    }
                    bus.$emit("browseAlbums", this.filterByTextCondition, 1, DEFAULT_SECTION_RESULTS_PAGE);
                    break;
            }
        },
        searchArtists2: function (page) {
            var self = this;
            self.pager.actualPage = page;
            if (page > 1) {
                self.pager.previousPage = page - 1;
            } else {
                self.pager.previousPage = 1;
            }
            var fData = new FormData();
            fData.append("actualPage", self.pager.actualPage);
            fData.append("resultsPage", self.pager.resultsPage);
            fData.append("text", self.filterByTextCondition);
            jsonHttpRequest("POST", "/api/artist/search.php", fData, function (httpStatusCode, response) {
                if (response.artists.length > 0) {
                    self.pager.totalPages = response.totalPages;
                } else {
                    self.pager.totalPages = 0;
                }
                if (page < self.pager.totalPages) {
                    self.pager.nextPage = page + 1;
                } else {
                    self.pager.nextPage = self.pager.totalPages;
                }
                self.artistList = response.artists;
                bus.$emit("updatePager", self.pager.actualPage, self.pager.totalPages, self.pager.totalResults);
            });
        },
        searchAlbums: function (page) {
            var self = this;
            self.pager.actualPage = page;
            if (page > 1) {
                self.pager.previousPage = page - 1;
            } else {
                self.pager.previousPage = 1;
            }
            var fData = new FormData();
            fData.append("actualPage", self.pager.actualPage);
            fData.append("resultsPage", self.pager.resultsPage);
            fData.append("text", self.filterByTextCondition);
            jsonHttpRequest("POST", "/api/album/search.php", fData, function (httpStatusCode, response) {
                for (var i = 0; i < response.albums.length; i++) {
                    if (response.albums[i].image) {
                        response.albums[i].albumCoverUrl = response.albums[i].image;
                    } else {
                        response.albums[i].albumCoverUrl = "#";
                    }
                }
                if (response.albums.length > 0) {
                    self.pager.totalPages = response.totalPages;
                } else {
                    self.pager.totalPages = 0;
                }
                if (page < self.pager.totalPages) {
                    self.pager.nextPage = page + 1;
                } else {
                    self.pager.nextPage = self.pager.totalPages;
                }
                self.albumList = response.albums;
                bus.$emit("updatePager", self.pager.actualPage, self.pager.totalPages, self.pager.totalResults);
            });
        },
        searchTracks: function (page, order, text, artist, album) {
            var self = this;
            self.pager.actualPage = page;
            var fData = new FormData();
            fData.append("actualPage", self.pager.actualPage);
            fData.append("resultsPage", self.pager.resultsPage);
            if (order) {
                fData.append("orderBy", order);
            }
            if (text) {
                fData.append("text", text);
            }
            if (artist) {
                fData.append("artist", artist);
            }
            if (album) {
                fData.append("album", album);
            }
            jsonHttpRequest("POST", "/api/track/search", fData, function (httpStatusCode, response) {
                for (var i = 0; i < response.tracks.length; i++) {
                    if (response.tracks[i].image) {
                        response.tracks[i].albumCoverUrl = response.tracks[i].image;
                    } else {
                        response.tracks[i].albumCoverUrl = "";
                    }
                }
                if (response.tracks.length > 0) {
                    self.pager.totalPages = response.totalPages;
                } else {
                    self.pager.totalPages = 0;
                }
                bus.$emit("replacePlayList", response.tracks);
            });
        }
    }, filters: {
        encodeURI: function (str) {
            return (encodeURI(str));
        }
    }, mounted: function () { }
    , components: {}
});

var app = new Vue({
    el: "#app",
    data: function () {
        return ({
            logged: true,
            xhr: false
        });
    },
    created: function () {
        var self = this;
        bus.$on("signOut", function (hash) {
            self.signout();
        });
    },
    methods: {
        signout: function () {
            var self = this;
            self.xhr = true;
            jsonHttpRequest("GET", "/api/user/signout", {}, function (httpStatusCode, response, originalResponse) {
                self.xhr = false;
                self.logged = false;
                switch (httpStatusCode) {
                    case 200:
                        window.location.href = "/login";
                        break;
                    default:
                        bus.$emit("showModal", "Error", "Invalid server response: " + httpStatusCode + "\n" + originalResponse);
                        break;
                }
            });
        }
    }
});