/*
 * [Apache License Version 2.0]
 *
 * Name: class.js
 * Desciption: 创建继承类
 * Version : 0
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function(w){

function _define(Type){

	return function Class(_name, _base, _contructor, _prototype){
		var fn;
		eval('fn = function ' + _name + '(){'
			+ (Type.isFunction(_base) ? '_base.apply(this, arguments);' : '')
			+ (Type.isFunction(_contructor) ? '_contructor.apply(this, arguments);' : '')
			+ '};');
		fn.prototype = Type.Mix(_base.prototype, _prototype);
		return fn;
	}
}

if(typeof(w.define) == 'function'){
	w.define('Class', ['util/type'], _define);
} else {
	w.Class = _define(Base);
}

})(window)