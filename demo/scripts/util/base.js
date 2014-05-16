/*
 * [Apache License Version 2.0]
 *
 * Name: base.js
 * Desciption: 基础方法
 * Version : 0
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function(w){

	/*
	 * Object遍历对象
	 * @o<Object>: 目标对象
	 * @m<function>: 回调函数。当该函数返回true时，遍历循环终止。
	 */
	function each(o, m){
		for(var p in o)
			if(m(o[p], p, o))
				return;
	}
	/*
	 * Object每一个元素均通过函数验证
	 * @o<Object>: 目标对象
	 * @m<function>: 验证函数
	 */
	function every(o, m){
		for(var p in o)
			if(!m(o[p], p, o))
				return false;
		return true;
	}
	/*
	 * Object某一个元素通过函数验证
	 * @o<Object>: 目标对象
	 * @m<function>: 验证函数
	 */
	function some(o, m){
		for(var p in o)
			if(m(o[p], p, o))
				return true;
		return false;
	}

	/*
	 * 遍历数组
	 * @a<Array> 目标数组
	 * @m<function> 回调函数。当该函数返回true时，遍历循环终止。
	 */
	function EACH(a, m){
		for(var i = 0, len = a.length; i < len; i++)
			if(m(a[i], i, a))
				return;
	}

	/*
	 * Array每一个元素均通过函数验证
	 * @o<Array>: 目标数组
	 * @m<function>: 验证函数
	 */
	function EVERY(a, m){
		for(var i = 0, len = a.length; i < len; i++)
			if(!m(a[i], i, a))
				return false;
		return true;
	}
	/*
	 * Array某一个元素通过函数验证
	 * @o<Array>: 目标数组
	 * @m<function>: 验证函数
	 */
	function SOME(a, m){
		for(var i = 0, len = a.length; i < len; i++)
			if(m(a[i], i, a))
				return true;
		return false;
	}

	var ASL = Array.prototype.slice;
	/*
	 * 切割数组。主要用于切分Arguments对象
	 * @a<Array>: 原始数组
	 * @idx<int>: 起始索引
	 */
	function SLICE(a, idx){
		return ASL.call(a, idx || 0);
	}

	/*
	 * 在ctx中查找ns域值
	 * @ns<string> namespace字符串
	 * @ctx<Object> 上下文对象
	 */
	function domain(ns, ctx){
		if(!ctx) return;
		var i = ns.indexOf('.');
		return i < 0
			? ctx[ns]
			: domain(ns.substr(i + 1), ctx[ns.substr(0, i)]);
	}

	var Base = {
		each: each,
		every: every,
		some: some,
		EACH: EACH,
		EVERY: EVERY,
		SOME: SOME,
		SLICE: SLICE,
		domain: domain
	};

	if(typeof(w.define) == 'function'){
		w.define('Base', ['util/__base__.js'], Base);
	} else {
		w.Base = Base;
	}

})(window)