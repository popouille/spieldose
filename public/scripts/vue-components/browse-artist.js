var browseArtist = (function () {
    "use strict";

    var template = function () {
        return `
    <div class="container is-fluid box is-marginless">
        <p v-if="loading" class="title is-1 has-text-centered">Loading <i v-if="loading" class="fas fa-cog fa-spin fa-fw"></i></p>
        <p v-else="! loading" class="title is-1 has-text-centered">Artist details</p>
        <div class="media" v-if="! errors && ! loading">
            <figure class="image media-left">
                <img v-bind:src="'api/thumbnail?url='+artist.image" alt="Image" class="artist_avatar" v-if="artist.image" v-on:error="artist.image=null;">
                <img alt="Image" class="artist_avatar" src="https://cdn2.iconfinder.com/data/icons/app-types-in-grey/128/app_type_festival_512px_GREY.png" v-else />
            </figure>
            <div class="media-content is-light">
                <p class="title is-1">{{ artist.name }}</p>
                <p class="subtitle is-6" v-if="artist.playCount > 0">{{ artist.playCount }} plays</p>
                <p class="subtitle is-6" v-else>not played yet</p>
                <div class="tabs is-medium">
                    <ul>
                        <li v-bind:class="{ 'is-active' : activeTab == 'overview' }"><a v-on:click.prevent="$router.push({ name: 'artist', params: { 'artist': $route.params.artist } })">Overview</a></li>
                        <li v-bind:class="{ 'is-active' : activeTab == 'bio' }"><a v-on:click.prevent="$router.push({ name: 'artistBio' })">Bio</a></li>
                        <li v-bind:class="{ 'is-active' : activeTab == 'tracks' }"><a v-on:click.prevent="$router.push({ name: 'artistTracks' })">Tracks</a></li>
                        <li v-bind:class="{ 'is-active' : activeTab == 'albums' }"><a v-on:click.prevent="$router.push({ name: 'artistAlbums' })">Albums</a></li>
                        <li v-bind:class="{ 'is-active' : activeTab == 'update' }"><a v-on:click.prevent="$router.push({ name: 'artistUpdate' })">Update artist</a></li>
                    </ul>
                </div>
                <div class="panel" v-if="activeTab == 'overview'">
                    <div class="content is-clearfix" id="bio" v-if="artist.bio" v-html="truncatedBio"></div>
                    <div class="columns">
                        <div class="column is-half is-full-mobile">
                            <spieldose-dashboard-toplist v-if="activeTab == 'overview' && artist.name" v-bind:type="'topTracks'" v-bind:title="'Top played tracks'" v-bind:listItemCount="10" v-bind:showPlayCount="true" :key="$route.params.artist" v-bind:artist="$route.params.artist"></spieldose-dashboard-toplist>
                        </div>
                    </div>
                </div>
                <div class="panel" v-if="activeTab == 'bio'">
                    <div class="content is-clearfix" id="bio" v-html="artist.bio"></div>
                </div>
                <div class="panel" v-if="activeTab == 'tracks'">
                    <div class="field">
                        <div class="control has-icons-left" v-bind:class="loadingTracks ? 'is-loading': ''">
                            <input class="input" :disabled="loadingTracks" v-model.trim="nameFilter" type="text" placeholder="search by text..." v-on:keyup.esc="abortInstantSearch();" v-on:keyup="instantSearch();">
                            <span class="icon is-small is-left">
                                <i class="fas fa-search"></i>
                            </span>
                        </div>
                    </div>
                    <spieldose-pagination v-bind:loading="loadingTracks" v-bind:data="pager"></spieldose-pagination>
                    <table class="table is-bordered is-striped is-narrow is-fullwidth">
                        <thead>
                                <tr class="is-unselectable">
                                    <th>Album</th>
                                    <th>Year</th>
                                    <th>Number</th>
                                    <th>Track</th>
                                    <th>Actions</th>
                                </tr>
                        </thead>
                        <tbody>
                            <tr v-for="track, i in tracks">
                                <td><span>{{ track.album }}</span></td>
                                <td><span>{{ track.year }}</span></td>
                                <td>{{ track.number }}</td>
                                <td>
                                    <span> {{ track.title}}</span>
                                </td>
                                <td>
                                    <i v-on:click.prevent="playerData.replace([track]);" class="cursor-pointer fa fa-play" title="play this track"></i>
                                    <i v-on:click.prevent="playerData.enqueue([track]);" class="cursor-pointer fa fa-plus-square" title="enqueue this track"></i>
                                    <i v-on:click.prevent="playerData.download(track.id);" class="cursor-pointer fa fa-save" title="download this track"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="panel" v-if="activeTab == 'albums'">
                    <div class="browse-album-item" v-for="album in artist.albums" v-show="! loading">
                        <a class="play-album" v-on:click="enqueueAlbumTracks(album.name, album.artist, album.year)" v-bind:title="'click to play album'">
                            <img class="album-thumbnail" v-if="album.image" v-bind:src="album.image | parseAlbumImage" v-on:error="replaceAlbumThumbnailWithLoadError(album);" />
                            <img class="album-thumbnail" v-else="" src="images/image-album-not-set.png"/>
                            <i class="fas fa-play fa-4x"></i>
                            <img class="vinyl no-cover" src="images/vinyl.png" />
                        </a>
                        <div class="album-info">
                            <p class="album-name">{{ album.name }}</p>
                            <p class="album-year" v-show="album.year">({{ album.year }})</p>
                        </div>
                    </div>
                    <div class="is-clearfix"></div>
                </div>
                <div class="panel" v-if="activeTab == 'update'">
                    <div class="content is-clearfix">
                        <div class="field is-horizontal has-addons">
                            <div class="field-label is-normal">
                                <label class="label">Artist name:</label>
                            </div>
                            <div class="field-body">
                                <div class="field is-expanded has-addons">
                                    <div class="control has-icons-left is-expanded" v-bind:class="loading ? 'is-loading': ''">
                                        <input class="input" :disabled="loading" v-model.trim="artist.name" type="text" placeholder="search artist name...">
                                        <span class="icon is-small is-left">
                                            <i class="fas fa-search"></i>
                                        </span>
                                    </div>
                                    <div class="control">
                                        <a class="button is-info" v-on:click.prevent="searchMusicBrainz();">Search on Music Brainz</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="field is-horizontal has-addons">
                            <div class="field-label is-normal">
                                <label class="label">Music Brainz id:</label>
                            </div>
                            <div class="field-body">
                                <div class="field is-expanded has-addons">
                                    <div class="control has-icons-left is-expanded" v-bind:class="loading ? 'is-loading': ''">
                                        <input class="input" :disabled="loading" v-model.trim="artist.mbid" type="text" placeholder="set artist music brainz id">
                                        <span class="icon is-small is-left">
                                            <i class="fas fa-search"></i>
                                        </span>
                                    </div>
                                    <div class="control">
                                        <a class="button is-info" :disabled="! (artist.name && artist.mbid)" v-on:click.prevent="overwriteMusicBrainzArtist(artist.name, artist.mbid);">Save</a>
                                    </div>
                                    <div class="control">
                                        <a class="button is-danger" v-on:click.prevent="clearMusicBrainzArtist(artist.name, artist.mbid);">Clear</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <spieldose-api-error-component v-if="errors" v-bind:apiError="apiError"></spieldose-api-error-component>
    </div>
    `;
    };

    var module = Vue.component('spieldose-browse-artist', {
        template: template(),
        data: function () {
            return ({
                loading: false,
                loadingTracks: false,
                errors: false,
                apiError: null,
                artist: {},
                activeTab: 'overview',
                truncatedBio: null,
                detailedView: false,
                playerData: sharedPlayerData,
                pager: getPager(),
                tracks: [],
                nameFilter: null,
                timeout: null,
                updateArtistName: null,
                updateArtistMBId: null
            });
        },
        watch: {
            '$route'(to, from) {
                switch(to.name) {
                    case "artistBio":
                        this.getArtist(to.params.artist);
                        this.activeTab = "bio";
                    break;
                    case "artistTracks":
                    case "artistTracksPaged":
                        this.pager.actualPage = parseInt(to.params.page);
                        this.searchArtistTracks(to.params.artist);
                        this.activeTab = "tracks";
                    break;
                    case "artistAlbums":
                        this.getArtist(to.params.artist);
                        this.activeTab = "albums";
                    break;
                    case "artist":
                        this.getArtist(to.params.artist);
                        this.activeTab = "overview";
                    break;
                    case "artistUpdate":
                        this.getArtist(to.params.artist);
                        this.activeTab = "update";
                    break;
                }
            }
        }, created: function () {
            this.getArtist(this.$route.params.artist);
            var self = this;
            this.pager.refresh = function () {
                self.$router.push({ name: 'artistTracksPaged', params: { page: self.pager.actualPage } });
            }
            if (this.$route.name == "artistTracks" || this.$route.name == "artistTracksPaged") {
                if (this.$route.params.page) {
                    this.pager.actualPage = parseInt(this.$route.params.page);
                }
                this.searchArtistTracks(this.$route.params.artist);
                this.activeTab = "tracks";
            } else {
                switch(this.$route.name) {
                    case "artistBio":
                        this.activeTab = "bio";
                    break;
                    case "artistAlbums":
                        this.activeTab = "albums";
                    break;
                    case "artistUpdate":
                        this.activeTab = "update";
                    break;
                    default:
                        this.activeTab = "overview";
                    break;
                }
            }
        }, methods: {
            replaceAlbumThumbnailWithLoadError: function(album) {
                album.image = null;
            },
            getArtist: function (artist) {
                var self = this;
                self.loading = true;
                self.errors = false;
                var d = {};
                spieldoseAPI.getArtist(artist, function (response) {
                    if (response.ok) {
                        self.artist = response.body.artist;
                        if (self.artist.bio) {
                            self.artist.bio = self.artist.bio.replace(/(?:\r\n|\r|\n)/g, '<br />');
                            self.truncatedBio = self.truncate(self.artist.bio);
                            //self.activeTab = "overview";
                        }
                        self.loading = false;
                    } else {
                        self.errors = true;
                        self.apiError = response.getApiErrorData();
                        self.loading = false;
                    }
                });
            },
            abortInstantSearch: function () {
                this.nameFilter = null;
                clearTimeout(this.timeout);
            },
            instantSearch: function () {
                var self = this;
                if (self.timeout) {
                    clearTimeout(self.timeout);
                }
                self.timeout = setTimeout(function () {
                    self.pager.actualPage = 1;
                    self.searchArtistTracks(self.$route.params.artist);
                }, 256);
            },
            searchArtistTracks: function (artist) {
                var self = this;
                self.loadingTracks = true;
                self.errors = false;
                var text = this.nameFilter ? this.nameFilter : "";
                spieldoseAPI.searchTracks(text, artist, "", self.pager.actualPage, self.pager.resultsPage, "", function (response) {
                    if (response.ok) {
                        self.pager.actualPage = response.body.actualPage;
                        self.pager.totalPages = response.body.totalPages;
                        self.pager.totalResults = response.body.totalResults;
                        if (response.body.tracks && response.body.tracks.length > 0) {
                            self.tracks = response.body.tracks;
                        } else {
                            self.tracks = [];
                        }
                        self.loadingTracks = false;
                    } else {
                        self.errors = true;
                        self.apiError = response.getApiErrorData();
                        self.loadingTracks = false;
                    }
                });
            },
            changeTab: function (tab) {
                this.activeTab = tab;
            }, truncate: function (text) {
                return (text.substring(0, 500));
            },
            enqueueAlbumTracks: function (album, artist, year) {
                var self = this;
                spieldoseAPI.getAlbumTracks(album || null, artist || null, year || null, function (response) {
                    self.playerData.emptyPlayList();
                    if (response.ok) {
                        if (response.body.tracks && response.body.tracks.length > 0) {
                            self.playerData.tracks = response.body.tracks;
                            self.playerData.play();
                        }
                    } else {
                        self.errors = true;
                        self.apiError = response.getApiErrorData();
                    }
                });
            },
            searchMusicBrainz(artistName) {
                window.open('https://musicbrainz.org/search?query=' + encodeURI(this.artist.name) + '&type=artist&limit=16&method=indexed');
            },
            overwriteMusicBrainzArtist(name, mbid) {
                var self = this;
                self.loading = true;
                self.errors = false;
                spieldoseAPI.overwriteMusicBrainzArtist(name, mbid, function (response) {
                    if (response.ok) {
                        self.loading = false;
                    } else {
                        self.errors = true;
                        self.apiError = response.getApiErrorData();
                        self.loading = false;
                    }
                });
            },
            clearMusicBrainzArtist: function(name, mbid) {
                var self = this;
                self.loading = true;
                self.errors = false;
                spieldoseAPI.clearMusicBrainzArtist(name, mbid, function (response) {
                    if (response.ok) {
                        self.loading = false;
                    } else {
                        self.errors = true;
                        self.apiError = response.getApiErrorData();
                        self.loading = false;
                    }
                });
            }
        }, filters: {
            parseAlbumImage: function(value) {
                if (value.indexOf("http") == 0) {
                    return ("api/thumbnail?url=" + value);
                } else {
                    return ("api/thumbnail?hash=" + value);
                }
            }
        }
    });

    return (module);
})();