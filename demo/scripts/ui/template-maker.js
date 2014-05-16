(function(w){

	function _define(Base, Type, TMaker, Template){

		function callError(fn, context){
			var args = Base.SLICE(arguments, 2);
			if(Type.isFunction(fn)){
				fn.apply(context, args);
			} else {
				console.log(args)
				throw args;
			}
		}
		function TemplateMaker(target, data, invoker, errCall){
			var context = this;
			target = Type.isString(target) ? document.getElementById(target) : target;
			if(!target){
				callError(errCall, context, 'Arguments Error: no target [TemplateMaker]')
				return document.createDocumentFragment();
			}

			if(Type.isNumber(target.nodeType)){
				try {
					var t = new Template(target);
					t.replace(data, invoker);
				} catch(ex){
					callError(errCall, context, ex);
				}
			} else {
				var m = new TMaker();
				var r = m.parse(target, function(err){
					console.log(err)
					callError(errCall, context, err);
				});
				var t = new Template(r);
				t.replace(data, invoker);
				t = m = null;
				target = r;
			}
			if(this === window){
				return target;
			} else {
				this.frag = target;
			}
		}
		TemplateMaker.prototype = {
			_check_ : function(el, method){
				el = Type.isString(el) ? document.getElementById(el) : el;
				if(!el || !Type.isNumber(el.nodeType)){
					callError(null, this, 'Arguments Error: Not a element. [TemplateMaker.' + method + ']');
					return false;
				}
				return el;
			},
			appendTo : function(el){
				this._check_(el, 'appendTo').appendChild(this.frag);
			},
			insertBefore : function(el, before){
				this._check_(el, 'insertBefore').insertBefore(this.frag, this._check_(before, 'insertBefore'));
			},
			append : function(el){
				this._check_(this.frag, 'append').appendChild(this._check_(el, 'append'));
			}
		};

		return TemplateMaker;
	}

	if(typeof(w.define) == 'function'){
		w.define('TemplateMaker', ['util/base', 'util/type', 'ui/tmaker', 'ui/template'], _define);
	} else {
		w.TemplateMaker = _define(Base, Type, TMaker, Template);
	}

})(window)