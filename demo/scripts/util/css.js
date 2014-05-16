/*
 * [Apache License Version 2.0]
 *
 * Name: css.js
 * Desciption: Object转换为cssText
 * Version : 6
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function(w){
	function js2css(jsKey){
		return jsKey.replace(/[A-Z]/g, function(m){ return '-' + m.toLowerCase(); })
	}
	function css2js(cssKey){
		return cssKey.replace(/\-[a-z]/g, function(m){ return m.substr(1).toUpperCase(); })
	}
	function obj2css(o){
		var arr = [], key, v, p;
		for(p in o){
			v = o[p];
			key = js2css(p);
			if(typeof(v) == 'string'){
				arr.push(key + ':' + v);
			} else if(typeof(v) == 'number'){
				if(key != 'opacity'){
					v += 'px';
				}
				arr.push(key + ':' + v);
			}
		}
		var r = arr.join(';')
		arr = key = v = p = null;
		return r;
	};

	var Css = {
		js2css : js2css,
		css2js : css2js,
		obj2css : obj2css
	}

	if(typeof(w.define) == 'function'){
		w.define('Css', [], Css);
	} else {
		w.Css = Css;
	}
	
})(window)