(function() {
    var CACHE_VERSION = '::v2.6.9',
        ASSET_CACHE_NAME = 'assets' + CACHE_VERSION,
        DATA_CACHE_NAME = 'data' + CACHE_VERSION,
        RECORDING_CACHE_NAME = 'recordings',
        GENERIC_APP_SHELL = '/generic_appshell/',
        GENERIC_APP_SHELL_CACHE_TIME = 3600000, // 1 hour
        scoreDetailRe = /\/(scores|slices)\/[-_\w]{1,35}\/((in-course|in-collection|syncpoints)-\d+\/)?$/g,
        CACHE_ASSETS = 1,
        cachedRecordings = {},
        lastGenericShellCache = null,

        assetsRe = /\bd2c3nvafyekx5z\.cloudfront\.net\/(?:css|fonts|images(?=\/sheetmusic)|json|scripts|soundfonts)\/.*?-[a-f0-9]{32}\.(?:css|eot|js|json|mp3|oga|png|jpg|svg|ttf|woff2?)$/,
        avatarsRe = /\bd24al86650eku7\.cloudfront\.net\/.*small.*png$/,
        jsonDataRe = /\bd1vuq0zzaa789\.cloudfront\.net\/.*\.json/,
        recordingsRe = /\bd3l4lslmo9uf22\.cloudfront\.net\/.*?\?/;


    function isScoredataUrl(url) {
        return /\/scoredata\//.test(url);
    }

    function refreshCachedRecordings() {
        caches.open(RECORDING_CACHE_NAME)
            .then(function(cache) { return cache.keys(); })
            .then(function(keys) {
                keys.forEach(function(key) {
                    cachedRecordings[key.url] = 1;
                });
            });
    }

    function getCachedScoredata() {
        return new Promise(function(resolve, reject) {
            caches.open(DATA_CACHE_NAME)
                .then(function(cache) { return cache.keys(); })
                .then(function(keys) {
                    var jsonPromises = [],
                        urls = [];
                    keys.forEach(function(key) {
                        if (isScoredataUrl(key.url)) {
                            jsonPromises.push(caches.match(key).then(function(response) { return response.json(); }));
                            urls.push(key.url.replace(/scoredata\//, ''));
                        }
                    });
                    if (jsonPromises.length) {
                        Promise.all(jsonPromises).then(function(jsons) {
                            var result = [];
                            for (var i = 0, len = jsons.length; i !== len; i++) {
                                result.push([urls[i], jsons[i]]);
                            }
                            return resolve(result);
                        });
                    }
                    else {
                        return resolve([]);
                    }
                });
        });
    }

    // At startup time, populate cachedRecordings with any recordings that have already been cached.
    refreshCachedRecordings();

    function isValidResponse(response) {
        return response.status >= 200 && response.status < 400;
    }

    function removeQueryString(url) {
        var match = /(.*?)\?/.exec(url);
        return match ? match[1] : url;
    }

    function putInCache(cacheName, request, response) {
        return new Promise(function(resolve, reject) {
            caches.open(cacheName).then(function(cache) {
                cache.put(request, response).then(function() {
                    resolve();
                });
            });
        });
    }

    function updateGenericAppShell() {
        return new Promise(function(resolve, reject) {
            var request = new Request(GENERIC_APP_SHELL);
            fetch(request, {credentials: 'include'})
                .then(function(response) { return putInCache(ASSET_CACHE_NAME, request, response.clone()) })
                .then(function() {
                    lastGenericShellCache = new Date();
                    resolve();
                });
        });
    }

    function getGenericAppShellPromise() {
        return caches.match(new Request(GENERIC_APP_SHELL))
            .then(function(response) { return response.text(); })
            .then(function(text) {
                return getCachedScoredata()
                    .then(function(cachedScores) {
                        var offlineMsg = '';
                        cachedScores.forEach(function(score) {
                            offlineMsg += '<li><a href="' + score[0] + '">' + score[1]['name'] + '</a></li>';
                        });
                        if (offlineMsg) {
                            offlineMsg = '<p>Looks like you\u2019re currently offline, but that\u2019s no excuse to stop practicing! These pages are available to you offline:</p><ul>' + offlineMsg + '</ul>';
                        }
                        else {
                            offlineMsg = '<p>You haven\u2019t saved any music for offline study. When you\u2019re back online, click Save Offline at the bottom of any lesson page to save it for offline use.</p>';
                        }
                        offlineMsg = '<h1>You\u2019re offline</h1>' + offlineMsg;
                        text = text.replace(/<div id="shellcontent"><\/div>/, offlineMsg);
                        text = text.replace(/<title><\/title>/, '<title>Offline mode</title>');
                        return new Response(text, {status: 200, headers: [['Content-Type', 'text/html; charset=utf-8']]});
                    });
            });
    }

    function fetchAndCache(cacheName, actualUrl, cacheUrl) {
        return new Promise(function(resolve, reject) {
            var request = new Request(actualUrl),
                cacheRequest = new Request(cacheUrl);
            fetch(request).then(function(networkResponse) {
                if (isValidResponse(networkResponse)) {
                    putInCache(cacheName, cacheRequest, networkResponse.clone()).then(function() {
                        resolve(true);
                    });
                }
                else {
                    resolve(false);
                }
            }).catch(function() {
                resolve(false);
            });
        });
    }

    function displayProgress(port, message) {
        if (port) { // undefined in Firefox.
            port.postMessage({'type': 1, 'msg': message});
        }
    }
    function onFileProgress(port, numFilesTotal, numFilesLeft) {
        if (!numFilesLeft) {
            port.postMessage({'type': 2});
        }
        else {
            displayProgress(port, 'Downloading file ' + (numFilesTotal - numFilesLeft + 1) + ' of ' + numFilesTotal);
        }
    }

    function tamperScoreData(originalHeaders, jsonData) {
        // Changes scorejson to add offline=1.
        return new Promise(function(resolve, reject) {
            jsonData['offline'] = 1;
            // http://miguelcamba.com/blog/2015/02/15/how-to-tamper-requests-with-service-workers/
            var blob = new Blob([JSON.stringify(jsonData)], {type: 'application/json'}),
                tamperedResponse = new Response(blob, {headers: originalHeaders});
            resolve(tamperedResponse);
        });
    }

    function makeOffline(scoredataUrl, extraUrls, clientPort) {
        displayProgress(clientPort, 'Downloading music data');
        extraUrls = extraUrls || [];

        var request = new Request(scoredataUrl),
            cacheRequest = new Request(removeQueryString(scoredataUrl)),
            numFilesTotal = 0,
            numFilesLeft = 0;

        // Save scorejson.
        fetch(request, {credentials: 'include'}).then(function(networkResponse) {
            if (isValidResponse(networkResponse)) {
                networkResponse.json().then(function(jsonData) {
                    // Determine how many files there are to download (for UI display).
                    var recordings = jsonData['r'];
                    numFilesTotal = recordings.length + extraUrls.length + 2;
                    recordings.forEach(function(recording) {
                        if (recording['mediaurl']) {
                            numFilesTotal++;
                        }
                    });
                    numFilesLeft = numFilesTotal;
                    onFileProgress(clientPort, numFilesTotal, numFilesLeft);

                    fetchAndCache(DATA_CACHE_NAME, jsonData['d'], removeQueryString(jsonData['d'])).then(function(success) {
                        onFileProgress(clientPort, numFilesTotal, --numFilesLeft);
                    })
                    extraUrls.forEach(function(url) {
                        fetchAndCache(ASSET_CACHE_NAME, url, removeQueryString(url)).then(function(success) {
                            onFileProgress(clientPort, numFilesTotal, --numFilesLeft);
                        })
                    });

                    recordings.forEach(function(recording) {
                        fetchAndCache(DATA_CACHE_NAME, recording['sync'], removeQueryString(recording['sync'])).then(function(success) {
                            onFileProgress(clientPort, numFilesTotal, --numFilesLeft);
                        })
                        if (recording['mediaurl']) {
                            var shortUrl = removeQueryString(recording['mediaurl']);
                            fetchAndCache(RECORDING_CACHE_NAME, recording['mediaurl'], shortUrl).then(function(success) {
                                if (success) {
                                    cachedRecordings[shortUrl] = 1;
                                }
                                onFileProgress(clientPort, numFilesTotal, --numFilesLeft);
                            })
                        }
                    });

                    tamperScoreData(networkResponse.headers, jsonData).then(function(tamperedResponse) {
                        putInCache(DATA_CACHE_NAME, cacheRequest, tamperedResponse).then(function() {
                            onFileProgress(clientPort, numFilesTotal, --numFilesLeft);
                        });
                    });
                });
            }
        });
    }

    self.addEventListener('install', function(event) {
        event.waitUntil(updateGenericAppShell());
    });

    self.addEventListener('activate', function(event) {
        cachedRecordings = {};
        event.waitUntil(
            caches.keys().then(function(keys) {
                return Promise.all(
                    keys.filter(function(cacheName) {
                        return cacheName.indexOf(CACHE_VERSION) === -1;
                    }).map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                ).then(function() {
                    refreshCachedRecordings();
                })
            })
        );
    });

    self.addEventListener('fetch', function(event) {
        var request = event.request,
            url = request.url,
            cacheRequest;

        if (request.method === 'GET') {
            // ASSETS (CSS, JS, FONTS, IMAGES) + USER AVATARS
            // Check cache first. Else hit network and fill cache.
            if (CACHE_ASSETS && (assetsRe.exec(url) || avatarsRe.exec(url))) {
                event.respondWith(
                    caches.match(request).then(function(cachedResponse) {
                        return cachedResponse || fetch(request).then(function(networkResponse) {
                                if (isValidResponse(networkResponse)) {
                                    putInCache(ASSET_CACHE_NAME, request, networkResponse.clone());
                                }
                                return networkResponse;
                            }).catch(function() { }); // TODO: Return empty response.
                    })
                );
            }

            // SCORE APP SHELL
            // Check cache first. Else hit network. Refresh cache either way.
            else if (CACHE_ASSETS && scoreDetailRe.exec(url)) {
                cacheRequest = new Request('/score_appshell/');
                event.respondWith(
                    caches.match(cacheRequest).then(function(cachedResponse) {
                        var fetchPromise = fetch(cacheRequest, {credentials: 'include'}).then(function(networkResponse) {
                            if (isValidResponse(networkResponse)) {
                                putInCache(ASSET_CACHE_NAME, cacheRequest, networkResponse.clone());
                            }
                            return networkResponse;
                        }).catch(function() {
                            return fetch(cacheRequest, {credentials: 'include'});
                        });
                        return cachedResponse || fetchPromise;
                    })
                );
            }

            // SCOREDATA JSON
            // Check cache first. Else hit network and only fill cache if it's already
            // in cache (in case of updates).
            else if (CACHE_ASSETS && isScoredataUrl(url)) {
                cacheRequest = new Request(removeQueryString(url));
                event.respondWith(
                    caches.match(cacheRequest).then(function(cachedResponse) {
                        var fetchPromise = fetch(request).then(function(networkResponse) {
                            if (cachedResponse && isValidResponse(networkResponse)) {
                                networkResponse.json().then(function(jsonData) {
                                    tamperScoreData(networkResponse.headers, jsonData).then(function(tamperedResponse) {
                                        putInCache(DATA_CACHE_NAME, cacheRequest, tamperedResponse.clone()).then(function() {
                                            return tamperedResponse;
                                        });
                                    });
                                })
                            }
                            else {
                                return networkResponse;
                            }
                        });
                        return cachedResponse || fetchPromise;
                    })
                );
            }

            // SCORE JSON, SYNCPOINT JSON
            // Check cache first. Else hit network and fill cache.
            else if (CACHE_ASSETS && jsonDataRe.exec(url)) {
                cacheRequest = new Request(removeQueryString(url));
                event.respondWith(
                    caches.match(cacheRequest).then(function(cachedResponse) {
                        return cachedResponse || fetch(request).then(function(networkResponse) {
                                if (isValidResponse(networkResponse)) {
                                    putInCache(DATA_CACHE_NAME, cacheRequest, networkResponse.clone());
                                }
                                return networkResponse;
                            }).catch(function() {
                                return fetch(request);
                            });
                    })
                );
            }

            // RECORDINGS (AUDIO/VIDEO THAT'S BEEN SAVED OFFLINE)
            // Check cache first. Else hit network and don't fill cache.
            else if (CACHE_ASSETS && recordingsRe.exec(url)) {
                var shortUrl = removeQueryString(url);
                if (cachedRecordings[shortUrl]) {
                    cacheRequest = new Request(shortUrl);
                    event.respondWith(
                        caches.open(RECORDING_CACHE_NAME)
                            .then(function(cache) { return cache.match(cacheRequest); })
                            .then(function(cachedResponse) {
                                if (!cachedResponse) {
                                    // Shouldn't get here; only if cachedRecordings is somehow out of sync.
                                    cachedRecordings[shortUrl] = 0;
                                    return fetch(request);
                                }

                                var range = request.headers.get('Range');
                                if (!range) {
                                    return cachedResponse;
                                }

                                var pos = Number(/^bytes\=(\d+)\-$/g.exec(range)[1]);
                                return cachedResponse.arrayBuffer()
                                    .then(function(buf) {
                                        var contentLength = buf.byteLength;
                                        return new Response(buf.slice(pos), {
                                            status: 206,
                                            statusText: 'Partial Content',
                                            headers: [
                                                ['Content-Type', cachedResponse.headers.get('Content-Type')],
                                                ['Content-Range', 'bytes ' + pos + '-' + (contentLength - 1) + '/' + contentLength]
                                            ]
                                        })
                                    })
                            })
                    );
                }
                // Else, fall back to default browser behavior.
                // We can't use fetch(request) because of a CORS bug in Chrome.
                // https://code.google.com/p/chromium/issues/detail?id=546076
            }

            // GENERIC APP SHELL (HTML PAGES)
            // Check network first. If offline, fall back to offline page.
            else if (request.headers.get('accept').includes('text/html') && !/\/embed\//.exec(url) && !/api\/v1\//.exec(url)) {
                // Recreate the request to remove its "body" (just in case it has a body).
                // It'll only have a body if this is a buggy version of Chrome that
                // mistakenly puts a body in GET requests directly after a post-POST redirect.
                // If we didn't do this, we'd get an exception in fetch() saying GET requests
                // aren't allowed to have a body.
                // https://code.google.com/p/chromium/issues/detail?id=573937
                request = new Request(url, {
                    method: 'GET',
                    headers: request.headers,
                    credentials: request.credentials,
                    redirect: request.redirect,
                    referrer: request.referrer
                });
                event.respondWith(
                    fetch(request)
                        .then(function(response) {
                            // Update generic shell if it's been more than GENERIC_APP_SHELL_CACHE_TIME since last update.
                            if (!lastGenericShellCache || (new Date()) - lastGenericShellCache > GENERIC_APP_SHELL_CACHE_TIME) {
                                updateGenericAppShell();
                            }
                            return response;
                        }).catch(function(e) { return getGenericAppShellPromise(); })
                );
            }
        }

        // Fall back to default browser handling, except in Firefox 44.
        // https://twitter.com/wanderview/status/696819243262873600
        if (navigator.userAgent.indexOf('Firefox/44') !== -1) {
            event.respondWith(fetch(event.request));
        }
    });

    self.addEventListener('message', function(e) {
        var data = e.data;
        switch (data['type']) {
            case 1:
                makeOffline(data['url'], data['extra'], e.ports[0]);
                break;
        }
    });
}());