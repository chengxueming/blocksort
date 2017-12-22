(function(global){
    'use strict';

    global.elem = function elem(name, attrs, children){
        attrs = attrs || {};
        children = children || [];
        var e = document.createElement(name);
        Object.keys(attrs).forEach(function(key){
            e.setAttribute(key, attrs[key]);
        });
        children.forEach(function(child){
            if (typeof child === 'string'){
                child = document.createTextNode(child);
            }
            e.appendChild(child);
        });
        return e;
    };

    if (document.body.matches){
        global.matches = function matches(elem, selector){ return elem.matches(selector); };
    }else if(document.body.mozMatchesSelector){
        global.matches = function matches(elem, selector){ return elem.mozMatchesSelector(selector); };
    }else if (document.body.webkitMatchesSelector){
        global.matches = function matches(elem, selector){ return elem.webkitMatchesSelector(selector); };
    }else if (document.body.msMatchesSelector){
        global.matches = function matches(elem, selector){ return elem.msMatchesSelector(selector); };
    }else if(document.body.oMatchesSelector){
        global.matches = function matches(elem, selector){ return elem.oMatchesSelector(selector); };
    }

    global.closest = function closest(elem, selector){
        while(elem){
            if (matches(elem, selector)){ return elem };
            elem = elem.parentElement;
        }
        return null;
    };


    global.requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.msRequestAnimationFrame || global.webkitRequestAnimationFrame || function(fn){
        setTimeout(fn, 20);
    };

    global.trigger = function trigger(name, target){
        target.dispatchEvent(new CustomEvent(name, {bubbles: true, cancelable: false}));
    };
    global.stringTrim = function(me) {
        return me.replace(/^\s+|\s+$/g,''); 
    }
    global.sleep = function(ms) {
        var start = new Date().getTime();
        while(true)  if(new Date().getTime()-start > ms) break;
        //return new Promise(resolve => setTimeout(resolve, ms));
        //return setTimeout(function(){}, ms);
    }


})(window);
