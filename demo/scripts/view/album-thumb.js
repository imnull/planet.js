define('AlbumThumb', ['util/type', 'util/class', 'util/css', 'view/view']
	, function(Type, Class, CSS, View){

	return Class('AlbumThumb', View, function(config){
		this.config = Type.Mix(this.base_config, config);
	}, {
		base_config : {
			separate : 0.84,
			spliter : 5,
			width : 650,
			height : 470,
			image : {
				padding : 4,
				borderWidth : 1,
				borderColor : '#888',
				borderStyle : 'solid'
			}
		},
		set : function(len){
			var css = this.config
				, view_width = Math.floor(css.width * css.separate)
				, thumb_width = css.width - view_width
				, thumb_height = Math.round((css.height + css.spliter) / len)
				;

			delete this.detail;
			this.detail = {
				view : {
					width : view_width,
					height : css.height,
					overflow : 'hidden'
				},
				thumb : {
					width : thumb_width,
					height : thumb_height,
					overflow : 'hidden'
				},
				thumb_cont : {
					width : thumb_width,
					height : css.height,
					left : view_width,
					top : -css.height,
					position : 'relative',
					overflow : 'hidden'
				},
				view_img : Type.Mix({
					width : view_width
						- css.image.borderWidth * 2
						- css.image.padding * 2
						- css.spliter,
					height : css.height
						- css.image.borderWidth * 2
						- css.image.padding * 2
				}, css.image),
				thumb_img : Type.Mix({
					width : thumb_width
						- css.image.borderWidth * 2
						- css.image.padding * 2,
					height : thumb_height
						- css.image.borderWidth * 2
						- css.image.padding * 2
						- css.spliter
				}, css.image),
			};
		},
		get_tpl : function(css, invoker){
			return {
				div : {
					'>' : {
						a : {
							href : '{url}',
							title : '{text}',
							target : '_blank',
							'~' : invoker
						}
					},
					css : css
				}
			}
		},
		__thumb : function(data, node, index){

			var c = this.detail;
			var t = this.config;

			var img = new Image();
			img.alt = data.text;
			img.src = data.url;
			img.style.cssText = CSS.obj2css(c.thumb_img);
			node.appendChild(img);

			var idx = index[0];
			var fix = (idx + 1) * c.thumb.height - t.height;
			if(fix > 0){
				img.style.height = (c.thumb_img.height + (t.spliter - fix)) + 'px';
			}

			node.onmouseover = function(){
				var view = this.parentNode.parentNode.previousSibling;
				view.scrollTop = idx * t.height;
			}
		},
		__view : function(data, node, index){
			var img = new Image();
			img.alt = data.text;
			img.src = data.url;
			img.style.cssText = CSS.obj2css(this.detail.view_img);
			node.appendChild(img);
		},
		output : function(el, data){
			this.set(data.length);

			var css = this.detail;

			var container = document.createElement('div');
			container.style.cssText = CSS.obj2css({
				width : css.width,
				height : this.config.height,
				overflow : 'hidden'
			});

			var view_ul = container.appendChild(document.createElement('div'));
			view_ul.style.cssText = CSS.obj2css(css.view);

			var thumb_ul = container.appendChild(document.createElement('div'));
			thumb_ul.style.cssText = CSS.obj2css(css.thumb_cont);

			this.add(this.get_tpl(css.view, '__view'), this, view_ul);
			this.add(this.get_tpl(css.thumb, '__thumb'), this, thumb_ul);
			View.prototype.output.apply(this, [container, data]);
			el.appendChild(container);
		}
	})

});
