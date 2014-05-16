/*
 * [Apache License Version 2.0]
 *
 * Name: type-ext.js
 * Desciption: JavaScript类型判断函数库扩展
 * Version : 1
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 *
 */

(function(w){

	/*
	 * 类型短名对照表
	 */
	var short_type = {
		'num' : 'number',
		'str' : 'string',
		'fun' : 'function',
		'boo' : 'boolean',
		'nil' : 'null',
		'obj' : 'Object',
		'arr' : 'Array',
		'reg' : 'RegExp',
		'und' : 'undefined'
	};

	function _define(Base, Type){
		/*
		 * 元素全为字符串的数组
		 */
		function isStringArray(v){ return Type.isArray(v) && Base.EVERY(v, Type.isString); }
		/*
		 * 元素全为字符串的对象
		 */
		function isStringObject(v){ return Type.isObject(v) && Base.every(v, Type.isString); }

		/*
		 * 类型检查
		 * @v: 值
		 * @t: 指定类型。<string|Array|function>
		 * * @t为字符串时，可以是完整的typeof类型值或者类名称，或者类型短名。
		 * * @t为数组时，v的类型只要命中其中一个元素即返回true。(some)
		 * * @t为函数时，返回函数回调v的结果。
		 * * @t为其他类型，返回false。
		 */
		function isType(v, t){
			if(!t){
				return false;
			} else if(Type.isString(t)){
				switch(t){
					//Any type
					case '*': return true;
					//Not undefined
					case '?': return !Type.isUndefined(v);
					//Not undefine|null
					case '+': return !Type.isEmpty(v)
					case 'bool': return Type.isBoolean(v);
					case 'null': return Type.isNull(v);
					case 'undefined': return Type.isUndefined(v);
					case 'strarr': return isStringArray(v);
					case 'strobj': return isStringObject(v);
					default:
						if(t.length == 3){
							return isType(v, short_type[t]);
						} else if(t.indexOf('|') > -1){
							return isType(v, t.split('|'))
						} else if(Type.isUpper(t.charCodeAt(0))){
							return Type.isT(v, t);
						}
						return Type.ist(v, t);
				}
			} else if(Type.isArray(t)){
				return Base.SOME(t, function(e){
					return isType(v, e);
				});
			} else if(Type.isFunction(t)){
				return t(v);
			} else if(Type.isRegExp(t)){
				return Type.isString(v) && t.test(v);
			}
			return false;
		}

		/*
		 * 将JS对象格式化为字符串
		 * @o 目标变量
		 * @indent 缩进层级
		 * @ind 缩进字符串，默认为1个指标符
		 * @noformat 不格式化。当该参数为true时，将不插入任何换行或制表符。
		 * */
		function obj2str(o, indent, ind, noformat){
			indent = (indent || 0);
			noformat = !!noformat;

			var line;
			if(!!noformat){
				line = ind = '';
			} else {
				line = '\n';
				ind = ind || '\t';
			}
			var inds = Array(indent + 2).join(ind);
			if(Type.isNull(o)){
				return 'null';
			} else if(Type.isUndefined(o)){
				return 'undefined';
			} else if(Type.isObject(o)){
				var s = '{' + line;
				Base.each(o, function(v, p){
					s += inds + p + ':' + obj2str(v, indent + 1, ind, noformat) + ',' + line;
				});
				s = s.replace(/,+\s?$/, line);
				s += Array(indent + 1).join(ind) + '}';
				return s;

			} else if(Type.isArray(o)){
				var s = '[' + line;
				Base.EACH(o, function(v){
					s += inds + obj2str(v, indent + 1, ind, noformat) + ',' + line;
				});
				s = s.replace(/,+\s?$/, line);
				s += Array(indent + 1).join(ind) + ']';
				return s;
			} else {
				if(Type.isString(o)){
					return "'" + o.replace(/'/g, '\\\'').replace('\r', '\\r').replace('\n', '\\n') + "'";
				} else {
					return o + '';
				}
			}
		}

		return Type.mix(Type, {
			isStringArray : isStringArray,
			isStringObject : isStringObject,
			isType : isType,
			obj2str : obj2str,
			each : function(tar, callback){
				if(Type.isObject(tar)){
					return Base.each(tar, callback);
				} else if(Type.isArray(tar)){
					return Base.EACH(tar, callback);
				}
			}
		});
	}

	if(typeof(w.define) == 'function'){
		w.define('TypeExt', ['util/base', 'util/type'], _define);
	} else {
		w.TypeExt = _define(Base, Type);
	}

})(window)