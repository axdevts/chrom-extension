/*jslint browser: true */
/*global Promise, chrome, console */
// @see https://developer.chrome.com/extensions/getstarted
// @see https://developer.chrome.com/extensions/examples/tutorials/getstarted/popup.js
(function () {
    'use strict';

    var config = {
        linkSharePublisherId: '34dcwewJqi0',
        walmartApiKey: 'jxpvqyy8p79drzv7335c9337',
        walmartQueryBaseUrl: 'http://api.walmartlabs.com/v1/search',
        walmartLinkField: 'productUrl' //'productTrackingUrl'
    };

    // places a message in the popup html
    function renderStatus(statusText) {
        document.getElementById('status').textContent = statusText;
    }

    // returns promise, resolves with an empty array if no keywords found
    function getKeywords() {
        return new Promise(function (resolve, reject) {
            chrome.tabs.executeScript(null, {file: 'content.js'}, resolve);
            chrome.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
                if (payload && payload.keywords) {
                    resolve(payload.keywords);
                }
            });
        });
    }

    function genWalmartSearchUrl(query) {
        return query && config.walmartQueryBaseUrl +
            '?apiKey=' + config.walmartApiKey +
            '&lsPublisherId=' + config.linkSharePublisherId +
            '&query=' + encodeURIComponent(query);
    }

    function showNoResults() {
        document.querySelector('#showNoResults').className += " show";
    }

    // returns promise
    function searchWalmart(keywords) {
        return new Promise(function (resolve, reject) {
            var xhr,
                searchUrl = genWalmartSearchUrl(keywords.join(','));
            xhr = new XMLHttpRequest();
            xhr.open('GET', searchUrl);
            xhr.responseType = 'json';
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function () {
                reject({success: false, message: 'Network error.'});
                showNoResults();
            };
            xhr.send();
        });
    }

    function renderWalmartResults(response) {
        var t, item, clone, results;
        console.log('renderResults', response);
        renderStatus('');
        t = document.querySelector('#resultTemplateWalmart');
        results = document.querySelector('#results');
        if (!response.items.length) {
            showNoResults();
        }
        // render all results
        response.items.forEach(function (item) {
            // put the item data in the template
            t.content.querySelector('img.thumbnailImage').src = item.thumbnailImage;
            t.content.querySelector('a.productLink').href = item[config.walmartLinkField];
            t.content.querySelector('div.name').textContent = item.name;
            t.content.querySelector('div.salePrice span').textContent = item.salePrice;
            t.content.querySelector('div.standardShipRate span').textContent = item.standardShipRate || 0;
            clone = document.importNode(t.content, true);
            results.appendChild(clone);
        });
    }


    // Do something when the popup loads (user clicks on extension button)
    document.addEventListener('DOMContentLoaded', function () {
        renderStatus('Loading....');
        getKeywords()
            .then(function (keywords) {
                if (keywords.length) {
                    renderStatus('Searching for: ' + keywords.join(','));
                    searchWalmart(keywords)
                        .then(renderWalmartResults,
                            function () {
                                renderStatus('Search failed');
                                showNoResults();
                            });
                } else {
                    renderStatus('');
                    showNoResults();
                }
            }, showNoResults);

    });

}());
