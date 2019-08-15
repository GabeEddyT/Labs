"use strict";

// Sniff out any masochists using Internet Explorer 11.
try { 
    new URLSearchParams();
} catch (error) {
    console.log("You're using IE. Why are you like this?");
    
    let corejs = document.body.appendChild(document.createElement("script"));
    corejs.src = "https://unpkg.com/core-js-bundle@3.2.1/index.js";

    // Mozilla's polyfill for `Element.closest`
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                    Element.prototype.webkitMatchesSelector;
    }                
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
        var el = this;
    
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el != null && el.nodeType == 1);
        return null;
        };
    }
    
    // After the core-js polyfills are loaded, 
    // attach babel-converted script
    window.onload = function(){
        let labScript = document.createElement("script");
        labScript.src = "labs-polyfill.js";                    
        document.body.appendChild(labScript);
    };
}