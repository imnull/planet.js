/*
 * [Apache License Version 2.0]
 *
 * Name: schema.js
 * Desciption: 架构转换和检查模块
 * Version : 3
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function(w){
	
	function _define(Base, Type){

		/*
		 * 架构对象
		 * 应包含 key 和 schema 两个键
		 * */
		function isDataSchema(v){ return Type.isObject(v)
			&& (Type.isString(v.key) || Type.isObject(v.key) || Type.isStringArray(v.key))
			&& (Type.isObject(v.schema) || Type.isFunction(v.schema)); }
		

		/*
		 * 转换JSON数据
		 * @data 原始数据
		 * @schema 转换架构
		 * @index 所在数组的索引或所在对象的键
		 * */
		function convert(data, schema, index){

			if(index === '*'){
				if(Type.isObject(data)){
					var tar = [];
					Base.each(data, function(v, p){
						tar.push(convert(v, schema, p));
					})
					return tar;
				}
				else if(Type.isArray(data)){
					var tar = [];
					Base.EACH(data, function(v, i){
						tar.push(convert(v, schema, i));
					});
					return tar;
				}
			}


			if(Type.isFunction(schema)){
				return schema(data, index);
			} else if(Type.isString(schema)){
				return Base.domain(schema, data);
			} else if(isDataSchema(schema)){
				var d;
				if(Type.isArray(schema.key)){
					d = [];
					Base.EACH(schema.key, function(k){
						d.push(domain(k, data));
					});
				} else if(Type.isObject(schema.key)) {
					d = convert(data, schema.key);
				} else {
					if(schema.key == '*'){
						d = convert(data, schema.schema, '*');
					} else {
						d = Base.domain(schema.key, data);
					}
				}
				return convert(d, schema.schema, index);
			} else if(Type.isObject(schema)){
				if('*' in schema){
					return convert(data, schema['*'], '*');
				}

				if(Type.isObject(data)){
					var target = {};
					Base.each(schema, function(v, p){
						target[p] = convert(data, v, p);
					});
					return target;
				} else if(Type.isArray(data)){
					var target = [];
					Base.EACH(data, function(v, i){
						target.push(convert(v, schema, i));
					});
					return target;
				}
			}
			return null;
		}

		function check(obj, sche, debug, prop){

			if(Type.isObject(sche)){
				if(!obj){
					if(Type.isObject(debug)){
						debug.schema = sche;
						debug.target = obj;
						if(!Type.isEmpty(prop)){
							debug.prop = prop;
						} else {
							debug.prop = 'empty object';
						}
					}
					return false;
				} else if(Type.isObject(obj)){
					return Base.every(sche, function(o, p){
						if(p == '*'){
							return check(obj, o, debug, p);
						} else {
							return check(obj[p], o, debug, p);
						}
					});
				} else if(Type.isArray(obj)){
					return Base.EVERY(obj, function(o, i){
						return check(o, sche, debug, prop);
					});
				} else {
					if(Type.isObject(debug)){
						debug.schema = sche;
						debug.target = obj;
						if(!Type.isEmpty(prop)){
							debug.prop = prop;
						} else {
							debug.prop = 'type error';
						}
					}
					return false;
				}
			}
			else if(prop === '*' && (Type.isObject(obj) || Type.isArray(obj))){
				if(Type.isObject(obj)){
					return Base.every(obj, function(o, p){
						return check(o, sche, debug, p);
					});
				} else {
					return Base.EVERY(obj, function(o, i){
						return check(o, sche, debug, prop);
					});
				}
			}
			else {

				if(Type.isFunction(sche)){
					return Type.isType(obj, function(v){
						return sche(v, prop, debug);
					});
				} else {
					var b = Type.isType(obj, sche);
					_sche = null;
					if(!b && Type.isObject(debug)){
						debug.schema = sche;
						debug.target = obj;
						if(!Type.isEmpty(prop)){
							debug.prop = prop;
						}
					}
					return b;
				}
			}
		}

		function deeplyCheck(obj, sche, props, debug, prop){

			if(!props){

				return check(obj, sche, debug, prop);

			}
			else if(Type.isString(props)){

				if(Type.isObject(obj)){

					return check(obj, sche, debug, prop) && deeplyCheck(obj[props], sche, props, debug, prop);

				}
				else if(Type.isArray(obj)){

					return Base.EVERY(obj, function(o, i){

						return deeplyCheck(o, sche, props, debug, [prop, i]);

					});

				} else {

					if(Type.isObject(sche) && props in sche){

						return check(obj, sche[props], debug, props);

					} else {

						return check(obj, sche, debug, prop);

					}
				}
			}
			else if(Type.isArray(props)){

				return props.length > 0 ? Base.EVERY(props, function(v, i){

					return deeplyCheck(obj, sche, v, debug, [prop, i]);

				}) : check(obj, sche, debug, prop);
			}
		}
		
		function Schema(){
			this.reset();
			this.read.apply(this, arguments);
		}
		Schema.prototype = {
			reset : function(){
				this.schema = {};
				this.deeply = [];
				this.error = {};
			},
			read : function(sche){
				Type.mix(sche, this.schema);
				this.deep.apply(this, Base.SLICE(arguments, 1));
			},
			hasError : function(){
				return !Type.isEmptyObject(this.error);
			},
			deep : function(){
				var _ = this;
				Base.EACH(arguments, function(v){
					if(Type.isString(v)) {
						_.deeply.push(v)
					} else if(Type.isArray(v)){
						_.deep.apply(_, v);
					}
				});
				_ = null;
			},
			check : function(obj){
				delete this.error;
				this.error = {};
				return deeplyCheck(obj, this.schema, this.deeply, this.error);
			}
		};

		Schema.create = function create(sche, deeply){
			var args = Base.SLICE(arguments, 0);
			return new Schema(args.shift(), args);
		};
		Schema.convert = convert;

		return Schema;
	}

	if(typeof(w.define) == 'function'){
		w.define('Schema', ['util/base', 'util/type-ext'], _define);
	} else {
		w.Schema = _define(Base, TypeExt);
	}

})(window);

			
