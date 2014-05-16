/*
 * [Apache License Version 2.0]
 *
 * Name: type.js
 * Desciption: JavaScript类型判断函数库
 * Version : 1.5
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 *
 */

(function(w, S, C){
	/*
	 * 比较值的typeof类型字符串和指定类型值
	 * @v: 值
	 * @t<string>: 指定类型值
	 */
	function ist(v, t){ return typeof(v) == t; }

	function isString(v){ return ist(v, 'string'); }
	function isNumber(v){ return ist(v, 'number'); }
	function isBoolean(v){ return ist(v, 'boolean'); }
	function isFunction(v){ return ist(v, 'function'); }
	function isUndefined(v){ return ist(v, 'undefined'); }
	function isNull(v){ return v === null; }
	function isEmpty(v){ return isUndefined(v) || isNull(v); }

	/*
	 * 是否为大写字符
	 * @n<int> 字符串的charCode
	 */
	function isUpper(n){ return n >= 65 && n <= 90; }

	/*
	 * 比较Object.prototype.toString回调的类型字符串和指定类型值
	 * @v: 值
	 * @t<string>: 指定类型值
	 */
	function isT(v, t){ return !isEmpty(v) && S.call(v) == '[object ' + t + ']'; }
	function isObject(v){ return isT(v, 'Object'); }
	function isRegExp(v){ return isT(v, 'RegExp'); }
	function isArray(v){ return isT(v, 'Array'); }

	/*
	 * 空对象
	 */
	function isEmptyObject(v){
		if(!isObject(v)) throw 'type error';
		for(var p in v)
			return false;
		return true;
	}

	/*
	 * 混合两个对象，a优先
	 */
	function mix(a, b){
		if(!isObject(b)) b = {};
		for(var p in a){
			b[p] = isObject(a[p]) ? mix(a[p], b[p]) : a[p];
		}
		return b;
	}
	/*
	 * 创建一个新的对象，混合参数中所有对象。
	 */
	function Mix(){
		var o = {}, a = arguments, i = 0, l = a.length;
		for(; i < l; i++){
			if(isObject(a[i])){
				mix(a[i], o);
			}
		}
		return o;
	}


	/*
	 * 深度复制一个对象
	 */
	function clone(o){
		if(!isObject(o)) return {};
		return mix(o);
	}

	var Type = {
		ist : ist,
		isT : isT,
		isString : isString,
		isNumber : isNumber,
		isBoolean : isBoolean,
		isFunction : isFunction,
		isUndefined : isUndefined,
		isNull : isNull,
		isEmpty : isEmpty,
		isObject : isObject,
		isRegExp : isRegExp,
		isArray : isArray,
		isUpper : isUpper,
		isEmptyObject : isEmptyObject,
		mix : mix,
		Mix : Mix,
		clone : clone
	};

	if(isFunction(w.define)){
		w.define('Type', [], Type);
	} else {
		w.Type = Type;
	}

})(window, Object.prototype.toString)