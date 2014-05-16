/*
 * [Apache License Version 2.0]
 *
 * Name: ui.js
 * Desciption: UI-DOM转换器，将UI的Object配置文件转换为DOM。
 *  在转换之前，一个Schema对象会作为架构检查器，检查配置文件是否合法。
 *  当遇到不合法的架构时，会终止转换，并在parse的checkFailCall函数中输出这个错误。
 * Version : 0.2
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 *
 */

(function(w){

function _define(Base, Type, Css, Schema){

	function UI(checker){
		this.checker = checker || UI.checker;
	}

	/*
	 * UI schema checker，基础的UI检查器。
	 * 建议不要改动此项。
	 * 如果要实现新的检查器，建议在外部调用和检查；
	 * 在使用UI转换前，将新的架构转换为符合该架构标准的结构。
	 */
	UI.checker = Schema.create({
		//节点名称
		node : /[a-z]+/i,
		//样式
		style : 'str|obj|und',
		//id
		id : 'str|und',
		//class
		className : 'str|und',
		//HTML属性
		attributes : 'strobj|und',
		//JS属性
		//可在此定义节点事件
		properties : 'obj|und',
		//重复数量
		repeat : 'num|und',
		//子节点定义，同样要符合架构标准。
		children : [
			'obj|arr|und',
			/[a-z]+/i
		]
	}
	//深度检查的属性，实现子节点的标准检查
	, ['children']);

	/*
	 * 基于UI对象，创建一个新的UI-DOM转换器。可以通过props对UI.prototype进行重写，实现不同的parse方法。
	 * 推荐的做法是:
	 * 实现一个新的相对简单的架构检查器(schema-checker)和转换器(schema-parser)，对输入的DOM架构进行检查；
	 * 在检查合格后，使用转换器将该架构转换为UI.checker架构，然后回到UI对象进行转换。
	 */
	UI.createClass = function(name, props, constru, checker){
		var fn;
		eval('fn = function ' + name + '(){'
			+ 'UI.call(this,checker);'
			+ (Type.isFunction(constru) ? 'constru.apply(this,arguments);' : '')
			+' }');
		fn.prototype = Type.Mix(UI.prototype, props);
		return fn
	}

	UI.prototype = {
		parse : function(schema, checkFailCall){

			var frag = document.createDocumentFragment();
			if(Type.isString(schema)){
				frag.appendChild(document.createElement(schema));
				return frag;
			}
			else if(Type.isObject(schema) || Type.isArray(schema)){
				var b = this.checker.check(schema);
				if(b){
					if(Type.isArray(schema)){
						var _ = this;
						Base.EACH(schema, function(s){
							_._parse(s, frag);
						});
						_ = null;
					} else {
						this._parse(schema, frag);
					}
				} else if(Type.isFunction(checkFailCall)){
					checkFailCall(this.checker.error);
				}
				return frag;
			}
			else {
				if(Type.isFunction(checkFailCall)){
					checkFailCall('schema type error');
				}
				return frag;
			}

		},
		_parse : function(obj, frag){

			frag.appendChild(this.__parse(obj, 0));

			if(Type.isNumber(obj.repeat) && obj.repeat > 1){
				for(var i = 1; i < obj.repeat; i++){
					frag.appendChild(this.__parse(obj, i));
				}
			}
		},
		__parse : function(obj, index){
			if(Type.isString(obj)){
				return document.createElement(obj);
			} else if(Type.isArray(obj)){
				var _ = this, frag = document.createDocumentFragment();
				Base.EACH(obj, function(o){
					_._parse(o, frag);
				});
				_ = null;
				return frag;
			}

			var el = document.createElement(obj.node);
			if(Type.isString(obj.style) && obj.style.length > 0){
				el.style.cssText = obj.style;
			} else if(Type.isObject(obj.style)){
				if(!Type.isEmptyObject(obj.style)){
					el.style.cssText = Css.obj2css(obj.style);
				}
			}

			if(obj.id){
				el.id = obj.id;
			}
			if(obj.className){
				el.className = obj.className;
			}

			var M;
			if(obj.attributes){
				M = this.attrCall || function(v){ return v; };
				Base.each(obj.attributes, function(v, p){
					v = M(v, p);
					if(!Type.isUndefined(v)){
						el.setAttribute(p, M(v, p));
					}
				});
			}
			if(obj.properties){
				M = this.propCall || function(v, p){
					if(Type.isFunction(v)){
						//可能是事件函数
						if(p.length > 2 && p.substr(0, 2).toLowerCase() == 'on'){
							return function(e){
								v.apply(el, [e || window.event, index]);
							};
						} else {
							return v.apply(el, [index, p]);
						}
					} else {
						return v;
					}
				};
				Base.each(obj.properties, function(v, p){
					v = M(v, p);
					if(!Type.isUndefined(v)){
						el[p] = v;
					}
				})
			}
			M = null;

			if('children' in obj){
				this._parse(obj.children, el);
			}

			return el;

		}
	}

	return UI;
}

if(typeof(w.define) == 'function'){
	w.define('UI', ['util/base', 'util/type-ext', 'util/css', 'util/schema'], _define);
} else {
	w.UI = _define(Base, TypeExt, Css, Schema);
}

})(window)