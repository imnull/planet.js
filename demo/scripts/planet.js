/*
 * [Apache License Version 2.0]
 *
 * Name: planet.js
 * Desciption: Core
 * Version : 5.3
 * Author : mk31415926535@gmail.com [MrNULL]
 * Blog : mkjs.net
 */

(function (W, D, S, C) {

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
	, CONF = {
		debug : true,
		cache : true
	}
	;
function isString(v){ return typeof(v) == 'string'; }
function isFunction(v){ return typeof(v) == 'function'; }

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
				callback(ARGS, s);
				if(!CONF.debug){
					s.parentNode.removeChild(s);
				}
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
					if(!CONF.debug){
						s.parentNode.removeChild(s);
					}
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
	ARGS = C.call(arguments, 0);
}

/* 规范的url。返回值为module的实际值 */
function fix_url(url){
	if(/^http:\/\/[^\/]+/i.test(url)){
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

W.PLANET_REQUIRE = W.require = require;
W.PLANET_DEFINE = W.define = define;

if(isFunction(W.PLANET_INIT)){
	W.PLANET_INIT(CONF, W.PLANET_REQUIRE, W.PLANET_DEFINE);
}

})(window, document, Object.prototype.toString, Array.prototype.slice);