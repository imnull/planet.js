/*
 * [Apache License Version 2.0]
 *
 * Name: base.js
 * Desciption: 基础方法
 * Version : 0
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function(w, C){

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

	/*
	 * 切割数组。主要用于切分Arguments对象
	 * @a<Array>: 原始数组
	 * @idx<int>: 起始索引
	 */
	function SLICE(a, idx){
		return C.call(a, idx || 0);
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

	/*
	 * 填充指定长度字符串
	 * @s<string> 原始字符串
	 * @len<int> 指定长度
	 * @ch<string> 填充字符
	 * @left<bool> 填充至左侧
	 */
	function padding(s, len, ch, left){
		return len > s.length
			? (s = [Array(len - s.length + 1).join(ch), s]).length && !left
				? s.join('')
				: s.reverse().join('')
			: s;
	}

	/*
	 * 格式化字符串
	 * 如：thumb###。
	 * 当数字不足3位，则使用ch填充到左侧
	 * @fmt<string> 格式字符串
	 * @s<any> 原始字符串
	 * @ch<string> 填充字符串，默认为 '-'
	 */
	function format(fmt, s, ch){
		ch = ch || '-';
		s += '';
		return fmt.replace(/#+/g, function(m){
			return padding(s, m.length, ch);
		});
	}

	/*
	 * 使用格式化字符串形成一个数字数组
	 * @fmt<string> 格式化字符串
	 * @s<int> 开始值(start)
	 * @e<int> 结束值(end)
	 */
	function numberList(fmt, s, e){
		var arr = [];
		for(; s <= e; s++){
			arr.push(format(fmt, s, '0'));
		}
		return arr;
	}

	var Base = {
		each: each,
		every: every,
		some: some,
		EACH: EACH,
		EVERY: EVERY,
		SOME: SOME,
		SLICE: SLICE,
		domain: domain,
		padding: padding,
		format: format,
		numberList : numberList
	};

	if(typeof(w.define) == 'function'){
		w.define('Base', [], Base);
	} else {
		w.Base = Base;
	}

})(window, Array.prototype.slice)