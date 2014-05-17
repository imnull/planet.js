/*
 * [Apache License Version 2.0]
 *
 * Name: pluto.js
 * Desciption: Web page based AMD module loader. (jQuery supported)
 * Version : 5.1
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function (w, D, S, C) {

var
	//cache
	CACHE = {}
	//names
	, NAMES = {}
	//args
	, ARGS = {}
	//tasks
	, TASKS = []
	//running
	, RUN = false
	//load script function
	, LOAD
	//undefined
	, UNDEF
	;

function ist(v, t){ return typeof(v) == t; }
function isT(v, t){ return S.call(v) == '[object ' + t + ']'; }
function isString(v){ return ist(v, 'string'); }
function isFunction(v){ return ist(v, 'function'); }
function isObject(v){ return v && isT(v, 'Object'); }
// function isArray(v){ return isT(v, 'Array'); }
function EACH(a, m){
	for(var i = 0, l = a.length; i < l; i++)
		if(m(a[i], i, a))
			return;
}
function mix(a, b){
	if(!isObject(b)) b = {};
	for(var p in a)
		b[p] = isObject(a[p])
			? mix(a[p], b[p])
			: a[p];
	return b
}

function slice(a, idx){
	return C.call(a, idx || 0);
}

/* require 上下文 */
function SPY(n){
	if(!isString(n) || !(n in NAMES)) return;
	return CACHE[NAMES[n]];
}
SPY.NS = NAMES;

/* 创建script节点 */
function create_script(){
	var n = D.createElement('script');
	n.type = 'text/javascript';
	return n
}

/* 确认LOAD函数 */
(function(n){
	var head = D.getElementsByTagName('head')[0], evt;
	if((evt = 'onload') in n){
		LOAD = function(url, callback){
			var s = create_script();
			s[evt] = function(){
				callback(ARGS);
				if(!config.debug) this.parentNode.removeChild(this);
			};
			s.src = url;
			head.appendChild(s);
		};
	} else if((evt = 'onreadystatechange') in n){
		LOAD = function(url, callback){
			var s = create_script();
			s[evt] = function(){
				if (/complete|loaded/i.test(this.readyState)) {
					callback(ARGS);
					if(!config.debug) this.parentNode.removeChild(this);
				}
			};
			s.src = url;
			head.appendChild(s);
		};
	} else {
		throw 'not implement'
	}
	n = null;
})(create_script());

/* define */
function define(){
	ARGS = slice(arguments);
}

/* support T.M.D jQuery */
define.amd = {
	jQuery: true
};
/* 1次require请求，及内部define等异步处理。 */
function task_run(t, endCall){
    if(isString(t[0])){
        t[0] = [t[0]];
    }
    EACH(t[0], function(v, i){
        t[0][i] = fix_url(v);
    });

    var _args = [];

    function load(){
        if(t[0].length < 1){
            t[1].apply(SPY, _args);
            if(isFunction(endCall)){
                endCall();
            }
            _args.splice(0, _args.length);
        } else {
            loop(t[0].shift())
        }
    }
    function loop(mod){
        //检查模块是否已经缓存
        if(mod in CACHE){
            _args.push(CACHE[mod]);
            load();
            return;
        }
        //检查当前模块是否是别名，及别名是否已被缓存
        else if(mod.indexOf('/') < 0){
            var _mod = mod.replace(/\.[a-z]+$/i, '');
            if(_mod in NAMES){
                _args.push(CACHE[NAMES[_mod]]);
                load();
                _mod = null;
                return;
            }
            _mod = null;
        }

        LOAD(configs_url(mod, config.cache), function(args){
            /*
             * args是通过define传入的参数数组，下面通过对args数量和类型的判断，对args和回调做处理。
             */

            //define只有一个参数时，为直接量定义。
            if(args.length == 1){
                CACHE[mod] = args[0];
                _args.push(args[0]);
                load();
            }
            else if(args.length > 1){
                if(args.length > 3){
                    throw 'Too many arguments when define'
                }
                //define有三个参数，第一参数应为模块的别名。
                //require.js对jQuery的调用即为3个参数。
                if(args.length == 3){
                    NAMES[args.shift()] = mod;
                }
                //此时参数应为2个
                //如果第2个参数为函数，说明为有依赖的返回对象。那么第1个参数应该是依赖的模块
                //此时第一参数应该是数组或字符串，即依赖模块。
                if(isFunction(args[1])){
                    //如果当前第一个为空，说明无依赖。
                    if(!args[0] || args[0].length < 1){
                        _args.push(CACHE[mod] = args[1]());
                        load();
                    }
                    //如果有依赖，新建一个task
                    else {
                        CACHE[mod] = UNDEF;
                        task_run([args[0], function(){
                            CACHE[mod] = args[1].apply(SPY, arguments);
                            _args.push(CACHE[mod]);
                        }], load);
                    }
                }
                //第2个参数不为函数，说明当前应该是有别名的直接量
                else {
                    if(isString(args[0])){
                        NAMES[args[0]] = mod;
                    }
                    CACHE[mod] = args[1];
                    _args.push(args[1]);
                    load();
                }
            }
            //一个参数都没有，这特么就是容错啊！
            else {
                load();
            }
        })
    }

    load();
}

/* 并行require请求的队列化 */
function require_run(){
	if(TASKS.length < 1){
		RUN = false;
		return;
	}
	RUN = true;
	task_run(TASKS.shift(), require_run);
}

function require(modules, callback){
    TASKS.push([modules, callback]);
	!RUN && require_run();
}

function is_full_url(url){
	return /^http:\/\/[^\/]+/i.test(url);
}

/* 规范的url。返回值为module的实际值 */
function fix_url(url){
	if(is_full_url(url)){
		return url;
	}
	if(url.indexOf('?') < 0 && !/\.[a-z]+$/i.test(url)){
		url += '.js';
	}
	return url.replace(/[\\\/]+/g, '/').replace(/^[\/]+/g, '');
}

/* 根据配置文件返回的请求地址 */
function configs_url(url, rnd){
	if(!is_full_url(url)){
		var arr = [];
		var index = url.indexOf('/');
		if(index > 0){
			var mod = url.substr(0, index);
			if(mod in config.paths){
				arr.push(config.paths[mod]);
				url = url.substr(index + 1);
			} else {
				config.baseUrl && arr.push(config.baseUrl);
			}
		} else {
			config.baseUrl && arr.push(config.baseUrl);
		}
		arr.push(url);
		url = arr.join('/');
	}
	if(rnd){
		url += (url.indexOf('?') > -1 ? '&' : '?') + 'RND=' + Math.floor((Math.random()*0xFFFFFFFFFFFF)).toString(36);
	}

	return url;
}

var config = {
	baseUrl: '',
	paths : {
		test : '.'
	},
	debug : false,
	cache : false
};

w.require = require;
w.define = define;
w.requirejs = {
	config : function(conf){
		if(!isObject(conf)) return;
		mix(conf, config);
	}
};

function write_script(url){
	D.write('<script type="text/javascript" src="' + url + '"><\/script>\n');
}

/* 查找自身节点的 data-main */
EACH(D.getElementsByTagName('script'), function(node){
	var main = node.getAttribute('data-main');
	if(main){
		if(!is_full_url(main)){
			main = node.getAttribute('src').replace(/[^\\\/]+$/, '') + main;
		}
		write_script(fix_url(main));
		return true;
	}
});

})(window, document, Object.prototype.toString, Array.prototype.slice);