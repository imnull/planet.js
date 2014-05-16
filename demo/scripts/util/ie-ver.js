(function(w, d){

	var V = w.ActiveXObject ? w.XMLHttpRequest ? d.documentMode ? 8 : 7 : 6 : 0;
	if(typeof(w.define) == 'function'){
		w.define('IeVersion', [], V);
	} else {
		w.IeVersion = V;
	}

})(window, document);