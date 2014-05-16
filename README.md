planet.js
=========

Web-based Module Loader

基于网页的JavaScript模块加载器。

当前版本为[pluto.js] ，这是一个最小化的实现，IE6兼容测试通过，可用模块类型仅仅为JS代码。在未来体积更大的版本中会实现Image/CSS等加载，以及AJAX加载方式的。

不支持nodejs。

## 由来
planet.js最初是受到require.js的启发，但是require.js过于庞大，对于专注前端并且无nodejs需求的我来讲，附加的太多东西都没有用处。所以在之后大概半年的时间里，我断续写了4版我自己的require.js。在第四版时，更名为require-v4。由于v5谐音的特殊含义，所以在planet.js完成以后，我决定更改项目名称，但延续了大版本号。

在选择项目名称时，planet这个词并没有过于羞涩，而且我也是个天文爱好者，一个《银河系漫游指南》的铁杆粉丝。Planet第一个正式推出的版本命名为pluto。冥王星不算行星，表示该版本还处在雏形阶段，仍需要时间去测试和优化。

## 为什么使用Planet.js？
1、很小，带注释未压缩只有300多行，不到8kb。
2、简单，接口只有一个。
3、足够灵活的路径配置，可以配置基础路径和命名空间路径。
4、模块开发简单。

其实这是我个人的私房菜，更新的这5个版本，每一次都是一次重写。所以，一方面这次的版本我认为还比较不错，以后的版本都会基于这个版本来升级，二方面再开项目写说明什么的太累了，起名字什么的最烦了。

## Planet.js缺点
最大的缺点是工作在“单线程”下。在Chrome之类的浏览器中，同时加载几个脚本文件时，每个脚本文件的define就像各自执行在一个沙箱中，互相不会污染。但是IE8以下浏览器同时加载多个脚本节点时，获取到的总是最后那个define所定义的东西。所以考虑到兼容的问题，人为的将模块加载做成一个单线程队列(task)，顺序添加。当有并行的多个加载器时，则会形成一个task的队列，一个一个加载。

不过每次加载的模块会缓存到内部，在第二次加载时会直接读取内部缓存的内容。

## 总之
这是一个不错的小玩意儿。

=================
#pluto.js
---------------
## 使用方法：

### 页面引用

    <script type="text/javascript"
        src="scripts/pluto.js"
        <!--
            配置文件应与pluto.js放在相同路径下
            -->
        data-main="config-local.js"
        ></script>

### require方法

[demo.html]

当只有一个模块时，使用字符串即可

    require('mod01', function(mod01){
        console.log(mod01, 1);
    });

等效的模块数组

    require(['mod01'], function(mod01){
        console.log(mod01, 2);
    });

mod02是依赖mod01的模块

    require(['mod02'], function(mod02){
        console.log(mod02, 3);

        //上下文是一个名为SPY的函数。这个函数可以通过短名获取到缓存的对象。
        console.log(this);
        console.log(this.NS);
        console.log(this('Module02'));

        //模块调用过一次以后，可以直接通过短名调用模块
        require(['Module02'], function(xx){
            console.log(xx, 3.1);
        });
    });

jQuery支持

    require(['http://code.jquery.com/jquery-2.1.1.js'], function(jq){
        console.log('----------JQ-----------')
        console.log(jq)
    });

### 配置

[config-local.js]

    requirejs.config({
        //默认路径
        baseUrl: 'scripts',
        //模块路径配置
        paths : {
            test : '.'
        },
        //是否为调试模式。当true时，页面会保留所有加载过的节点
        debug : true,
        //是否防缓存。当true时，地址会添加随机字符串后缀。
        cache : true
    })

配置文件应与loader处于相同路径。

nanana....



