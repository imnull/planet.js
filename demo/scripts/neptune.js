(function(W, D){
	W.PLANET_INIT = function(config, require, define){
		W.require = function(modules, callback){
			// not implememnt
		}
	};

	var URL = 'scripts/planet.js';
	D.write('<script type="text/javascript" src="' + URL + '"><\/script>\n');
})(window, document)