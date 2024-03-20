/*jslint browser: true */
/*global Promise, chrome, console */
// this script is inserted into the active tab
(function () {
    'use strict';
    var keywordEl, keywordsStr, keywordsAry,
        responseHandler = function () {};
    // parse ketword meta tag on page (if it exists)
    keywordEl = document.querySelector("meta[name='keywords']") || {};
    keywordsStr = keywordEl.getAttribute && keywordEl.getAttribute('content'); // undefined if no keyword meta tag
    keywordsAry = (keywordsStr && keywordsStr.split(',')) || [];
    //console.log('Keywords: ', keywordsAry);

    chrome.runtime.sendMessage({
        keywords: keywordsAry
    }, responseHandler);
}());
