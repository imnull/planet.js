/*
 * [Apache License Version 2.0]
 *
 * Name: tmaker.js
 * Desciption: 用于template.js的模板专用UI-DOM转换器。
 *  为方便书写，该架构标准做了简化。
 *  通过UI.createClass创建。
 * Version : 1.2
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 *
 */

(function(w){

function _define(Base, Type, Schema, UI){

	var nodeChecker = /^[a-z]+[\w]*$/i;

	//简化写法的检查器
	var checker = Schema.create({
		'*' : function _check(obj, _p, debug){

			if(!_p || !Type.isString(_p) || !nodeChecker.test(_p)){
				debug.schema = nodeChecker;
				debug.target = obj;
				debug.nodeName = _p;
				debug.msg = 'nodeName is invalid'
				return false;
			}

			if(Type.isObject(obj)){
				var P, b = Base.every(obj, function(v, p){
					P = p;
					switch(p){
						case '+':
						case 'repeat':
							return Type.isNumber(v);
						case '~':
						case 'template-invoker':
						case '.':
						case 'className':
							return Type.isString(v);
						case '#':
						case 'id':
							return Type.isString(v) && /^[_$a-z]+[_$a-z\d]*/i.test(v);
						case 'css':
						case 'style':
							return Type.isType(v, 'str|obj');
						case '>':
						case 'children':
							if(Type.isObject(v)){
								return checker.check(v);
							} else if(Type.isArray(v)){
								return Base.EVERY(v, function(V){
									return Type.isString(V) || checker.check(V);
								});
							}
						default : return Type.isString(v);
					}
				});
				if(!b){
					debug.schema = _check;
					debug.target = obj;
					debug.prop = P;
				}
				return b;
			} else if(Type.isArray(obj)){
				return Base.EVERY(obj, function(o){
					return _check(o, _p, debug);
				});
			} else {
				return Type.isString(obj) || Type.isNumber(obj);
			}
		}
	});

	//简化写法到标准UI写法的转换器
	var parser = {
		'*' : function conv(v, p){
			
			if(Type.isObject(v)){
				var o = { node : p };
				Base.each(v, function(V, P){
					switch(P){
						case '+':
						case 'repeat':
							o.repeat = V;
							break;
						case 'css':
						case 'style':
							o.style = V;
							break;
						case '.':
						case 'className':
							o.className = V;
							break;
						case '#':
						case 'id':
							o.id = V;
							break;
						case '>':
						case 'children':
							if(Type.isObject(V)){
								o.children = [];
								Base.each(V, function(v, p){
									o.children.push(conv(v, p))
								})
							} else if(Type.isArray(V)) {
								o.children = [];
								Base.EACH(V, function(_v){
									if(Type.isObject(_v)){
										Base.each(_v, function(__v, __p){
											o.children.push(conv(__v, __p))
										});
									} else {
										o.children.push(_v);
									}
								})
							} else {
								o.children = V;
							}
							break;
						case 'html':
							if(!('properties' in o)){
								o.properties = {};
							}
							o.properties.innerHTML = V;
							break;
						default:
							if(!('attributes' in o)){
								o.attributes = {};
							}
							if(P == '~'){
								P = 'template-invoker';
							}
							o.attributes[P] = V;
							break;
					}
				});
				return o;
			} else if(Type.isArray(v)){
				var r = [];
				Base.EACH(v, function(V){
					r.push(conv(V, p));
				})
				return r;
			} else if(Type.isString(v)){
				return { node : p, properties : { innerHTML : v } };
			} else if(Type.isNumber(v)){
				return { node : p, repeat : v };
			} else {
				return { node : p };
			}
		}
	};

	var TMaker = UI.createClass('TMaker', {
		parse : function(schema, checkFailCall){
			var frag = document.createDocumentFragment();
			if(Type.isObject(schema) && checker.check(schema)){
				var _sche = Schema.convert(schema, parser);
				this._parse(_sche, frag);
			} else if(Type.isFunction(checkFailCall)){
				checkFailCall(checker.error);
			}
			return frag;
		}
	});
	// TMaker.prototype.propCall = function(v, p){
	// 	if(p == 'innerHTML'){
	// 		v = '{' + v + '}';
	// 	}
	// 	return v;
	// }
	// TMaker.prototype.attrCall = function(v, p){
	// 	if(p != 'template-invoker'){
	// 		v = '{' + v + '}';
	// 	}
	// 	return v;
	// }
	return TMaker;
}

if(typeof(w.define) == 'function'){
	w.define('TMaker', ['util/base', 'util/type-ext', 'util/schema', 'ui/ui'], _define);
} else {
	w.TMaker = _define(Base, Type, Schema, UI);
}

})(window)