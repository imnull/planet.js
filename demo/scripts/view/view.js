/*
 * [Apache License Version 2.0]
 *
 * Name: view.js
 * Desciption: View
 * Version : 0
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function(w){

	function _define(Schema, TemplateMaker){

		function ViewItem(template_schema, template_invoker, parent, data_schema){
			this.t = template_schema;
			this.i = template_invoker;
			this.d = data_schema;
			this.p = parent;
		}
		ViewItem.prototype = {
			generate : function(data){
				var d;
				if(!!this.d){
					d = Schema.convert(data, this.d);
				} else {
					d = data;
				}
				var t = new TemplateMaker(this.t, d, this.i);
				if(!this.p){
					return t.frag;
				} else {
					t.appendTo(this.p);
					return this.p;
				}
			}
		}

		function View(){
			this.items = [];
		}
		View.prototype = {
			add : function(tpl, ivk, p, sche){
				this.items.push(new ViewItem(tpl, ivk, p, sche));
			},
			output : function(el, data){
				var i = 0, len = this.items.length;
				for(; i < len; i++){
					el.appendChild(this.items[i].generate(data));
				}
				this.items.splice(0, this.items.length);
			}
		}

		return View;
	}

	if(typeof(w.define) == 'function'){
		w.define('View', ['util/schema', 'ui/template-maker'], _define);
	} else {
		w.View = _define(Schema, TemplateMaker);
	}

})(window)

