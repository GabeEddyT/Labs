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

    // "polyfill" for replacing `var()` in css using data-* attributes
    /** @type {HTMLStyleElement} */
    const offsetStyle = document.createElement("style");
    offsetStyle.id = "offsetStyle";
    document.head.appendChild(offsetStyle);
    
    // Trigger on changes to `data-offset`
    const observer = new MutationObserver(function(mutationsList, observer) {
		for (let i = 0; i < mutationsList.length; i++) {	
			let mutation = mutationsList[i];
			/** @type {HTMLElement} */		
            const element = mutation.target;    
            // Insert value of `data-offset` where `var(--offset)` would be.
            offsetStyle.innerHTML = ".wrapper.hidden{ transform: scale(0.5) translate(0, " + element.getAttribute("data-offset") + ");}";
		}
	}).observe(document.getElementsByClassName("wrapper")[0], { attributes: true, attributeFilter: ["data-offset"] });
    
    // After the core-js polyfills are loaded, 
    // attach babel-converted script
    window.onload = function(){
        let labScript = document.createElement("script");
        labScript.src = "https://gabeeddyt.gitlab.io/labs-2.0/labs-polyfill.min.js";                    
        document.body.appendChild(labScript);
    };
}