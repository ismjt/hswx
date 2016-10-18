/*var getFileName = function(path){
    var pos1 = path.lastIndexOf('/');
    var pos2 = path.lastIndexOf('\\');
    var pos  = Math.max(pos1, pos2)
    if( pos<0 )
        return path;
    else
        return path.substring(pos+1);
}*/
var Host = window.location.host;
//--Cookie
function setCookie(name,value)
{
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + '='+ escape (value) + ';expires=' + exp.toGMTString();
}
function getCookie(name)
{
    var arr,reg=new RegExp('(^| )'+name+'=([^;]*)(;|$)');
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
//--Dom & String
var get = {
    //-- 获得Dom Id
    Id:function(obj)
    {
        return is.object(obj) ? obj : (document.getElementById(obj));
    },
    //-- 获得Dom ClassName
    Class:function(obj)
    {
        return is.object(obj) ? obj : (document.getElementsByClassName());
    },
    //--获得Body
    body:function()
    {
        return document.body;
    },
    //-- 通过Html 标签取对象
    Tag:function(obj, Tagname)
    {
        return obj.getElementsByTagName(Tagname);
    },
    //-- 通过Name 来取对象
    Name:function (Name)
    {
        return document.getElementsByName(Name);
    },
    //-- Url编码转换
    encode:function (str)
    {
        return encodeURIComponent(str);
    },
    filepath:function (obj,callback)
    {
        window.URL = window.URL || window.webkitURL;
        img = new Image();
        var reader = new FileReader();
        reader.readAsDataURL(get.Id(obj).files[0]);
        reader.onload = function(e){
            callback(this.result);
            source = this.result;
        }
        // return window.URL.createObjectURL(get.Id(obj).files[0]);
    },
    //-- 根据Id获取元素的CSS
    css:function (id){

        document.getElementById(id).style;
    }
}
var set = {
    //-- url 跳转
    url:function(URL)
    {
        window.location.href = URL;
    },
    //-- 页面刷新
    reload:function()
    {
        window.location.reload();
    },
    //-- 动态设置 标签内容 @ obj 为标签对象，text 为内容
    html:function (obj, text)
    {
        obj.innerHTML = text;
    }
}
var string = {
    //-- 将字符转换成Json
    toJson:function(str)
    {
        return eval('('+str+')');
    },
    //-- 不区分大小写判断 相等true ,
    eqlower:function(str1, str2)
    {
        if(str1.toLowerCase() == str2.toLowerCase()){
            return true;
        }
        return false;
    }
}
var is = {
    //-- 是否是IE浏览器,用此来判断是否支持HTML5，低于IE10的返回false，由于 IE采用 V8 JavaScript引擎
    html5:function ()
    {
        return (!/*@cc_on!@*/~0x1111111111111111) ? false : true;
    },
    //--验证数据并返回制定信息
    Card:function () {

        return card_info;

    },
    //--获取变量的类型， object，string，int.....等
    type:function(type)
    {
        if(is.object(type)) {
            return 'object';
        }else if (is.string(type)) {
            return 'string';
        }else if (is.int(type)) {
            return 'int';
        }else if (is.double(type)) {
            return 'double';
        }else {
            return 'null';
        }
    },
    //-- 变量是否是对象，返回 true|false
    object:function(type)
    {
        return 'object' == typeof(type) ? true:false;
    },
    //-- 变量是否是字符串 ， 返回 true|false
    string:function(type)
    {
        return 'string' == typeof(type) ? true:false;
    },
    //-- 变量是否是整型，返回 true|false
    int:function(type)
    {
        if ('number' == typeof(type)) {
            if(0 > type.toString().indexOf('.')) {
                return true;
            }
        }
        return false;
    },
    //-- 变量是否是小数，返回 true|false
    double:function(type)
    {
        if('number' == typeof(type)) {
            if (0<=type.toString().indexOf('.')) {
                return true;
            }
        }
        return false;
    },
    telphone:function (tel) {
        var reg = /^0?1[3|4|5|8][0-9]\d{8}$/;
        return reg.test(tel);
    }
}
var file = {
    //--异步文件上传
    upload:function (json)
    {
        var post = new XMLHttpRequest();
        var FLIE = new Object();
        var json = is.object(json) ? json : string.toJson(json);
        var dataType = string.eqlower(json.dataType,'json') ? true : false;
        var fileSize = 0;
        if(!json.url&&json.error) {
            json.error(404);
            return;
        }
        if(!is.object(json.file)) {
            FLIE.id = get.Id(json.file);
            //-- 大文件处理
            if(json.maxfile) {

                //--文件总大小
                fileSize = file.getSize(FLIE.id);
                //--以2M为单位进行文件切割
                shardSize = 1024 * 1024 << 1;
                //--总片数
                shardCount = Math.ceil(fileSize / shardSize);
                for(var i = 0; i < shardCount; ++i)
                {
                    //--计算每一片的起始与结束位置
                    var start = i * shardSize;
                    var end = Math.min(fileSize, start + shardSize);
                    var formData = new FormData();
                    //--slice方法用于切出文件的一部分
                    formData.append(json.file, FLIE.id.files[0].slice(start,end));
                    formData.append("total", shardCount); //总片数
                    formData.append("index", i + 1);    //当前是第几片
                    post.upload.addEventListener('progress', callback, false);
                    post.open('post', json.url, true); // 异步传输
                    post.send(formData);
                    post.upload.onprogress = function (ev) {
                        if(file.getProgress(ev) == 100) {
                            json.success(ev);
                        }
                    }
                }
            }else {
                var formData = new FormData();
                formData.append(json.file, FLIE.id.files[0]);
                if (json.progress) {
                    post.upload.addEventListener('progress', json.progress, false);
                }
                post.open('post', json.url, true); // 异步传输
                post.send(formData);
                /*post.upload.onprogress = function (ev) {
                 if(file.getProgress(ev) == 100) {
                 json.success(ev);
                 }
                 }*/
                post.onreadystatechange = function () {
                    switch (post.readyState) {
                        case 1:{break;}
                        case 2:{break;}
                        case 3:{break;}
                        case 4:{
                            if (post.status == 200 || post.status == 0) {
                                json.success(string.toJson(post.responseText));
                            }
                            break;
                        }
                    }
                }
            }
        }

    },
    //-- 获得上传文件的进度值
    getProgress:function (evt) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        return percentComplete.toString();
    },
    //-- 获得文件的大小
    getSize:function (file) {
        var FILE = get.Id(file).files[0];
        var fileSize = 0;

        if (file.size > 1024 * 1024) {
            fileSize = (Math.round(FILE.size * 100 / (1024 * 1024)) / 100).toString();
        } else {
            fileSize = (Math.round(FILE.size * 100 / 1024) / 100).toString();
        }
        return fileSize;
    },
    //-- 获得文件的类型
    getType:function (file) {
        var FILE = get.Id(file).files[0];
        return FILE.type;
    },
    //-- 获得文件的名字
    getName:function (file) {
        var FILE = get.Id(file).files[0];
        return FILE.name;
    },
    //--包含文件
    include:function (path) {

    }
}
//--Ajax数据提交类
var Call = {
    /**
     * 参数为json对象|Json字符串，
     * @type post|get 默认为get ，请求方式
     * @url String 字符串型 ,请求地址
     * @loading bool true|false 是否开启动画
     * @time int 动画时间 如果 loading 为false 则不用设置这个参数
     * @data Json | String 提交的数据
     * @sucess 回调函数 这个必须有
     */
    Ajax:function(json){
        var json = is.object(json)?json:string.toJson(json);
        var type = (json.type == undefined) || (json.type == '') ? 'get' : json.type; ;
        var url = (json.url == undefined) || (json.url == '') ? alert('请求url不能为空') : json.url;
        var loading = (json.Loading == undefined) || (json.Loading == '') ? false : json.Loading;
        var time = (json.time == undefined) || (json.time == '') ? 2000 : json.time;
        var dataType = string.eqlower(json.dataType,'json') ? 'json' : 'string';
        if(loading) { var L = Loading.start(); }
        var data = '';
        if(is.object(json.data)) {
            if(json.data) {
                for(d in json.data) {
                    data = data + d + '=' + json.data[d] + '&';
                }
            }
            if(string.eqlower(json.type,'get')) {
                data ='?' + data.substring(0, data.length-1);
            }
        }else{
            if(json.data.length>=1) {
                data = json.data.indexOf('?') < 0 ? '?'+json.data:json.data+'';
            }
        }
        try {
            //--IE高版本创建XMLHTTP
            XMLHttpReq = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch(E) {
            try {
                XMLHttpReq = new ActiveXObject('Microsoft.XMLHTTP');//IE低版本创建XMLHTTP
            }
            catch(E) {
                XMLHttpReq = new XMLHttpRequest();//兼容非IE浏览器，直接创建XMLHTTP对象
            }
        }
        if(XMLHttpReq) {
            if (string.eqlower(json.type, 'post')) {
                XMLHttpReq.open('post', url, true);
                XMLHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                XMLHttpReq.send(data);
            }else if (string.eqlower(json.type, 'get')) {
                XMLHttpReq.open('get', url+data, true);
                XMLHttpReq.send(null);
            }
            XMLHttpReq.onreadystatechange = function () {

                switch (XMLHttpReq.readyState) {
                    case 1:{break;}
                    case 2:{break;}
                    case 3:{break;}
                    case 4:{
                        if (XMLHttpReq.status == 200 || XMLHttpReq.status == 0) {
                            if (loading) {
                                setTimeout(function(){
                                    Loading.stop(L);

                                    if(json.dataType == 'json')
                                        json.success(string.toJson(XMLHttpReq.responseText));
                                    else
                                        json.success(XMLHttpReq.responseText)
                                }, time*1000);
                            }else {

                                if(json.dataType == 'json')
                                    json.success(string.toJson(XMLHttpReq.responseText));
                                else
                                    json.success(XMLHttpReq.responseText)
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
}
var Loading = {
    //-- Ajax动画
    start:function(){
        var d = add.Dom(document.body,'style');
        d.innerHTML = '@keyframes d{from {left:0px;}to {left:98%;}}';
        var back = add.Dom(document.body, 'div');
        var d0 = add.Dom(back, 'div');
        var d1 = add.Dom(d0, 'div');
        var d2 = add.Dom(d0, 'div');
        var d3 = add.Dom(d0, 'div');
        var d4 = add.Dom(d0, 'div');
        add.Attr(back, 'style', 'width:100%;height:100%;filter:alpha(opacity=50); -moz-opacity:0.5; opacity:0.5; background:#000; position:fixed; left:0px; top:0px; z-index;1000;');
        add.Attr(d0, 'style', 'position:relative; top:50%; width:100%; height:30px;');
        add.Attr(d1, 'style', 'height:15px; width:15px; position:absolute; background:#ABCDEF; animation:d 2s infinite; -moz-border-radius:15px; -webkit-border-radius: 15px; border-radius: 15px 15px 15px 15px; ');
        add.Attr(d2, 'style', 'height:15px; width:15px; position:absolute; background:#ABCDEF; animation:d 3s infinite; -moz-border-radius:15px; -webkit-border-radius: 15px; border-radius: 15px 15px 15px 15px; ');
        add.Attr(d3, 'style', 'height:15px; width:15px; position:absolute; background:#ABCDEF; animation:d 4s infinite; -moz-border-radius:15px; -webkit-border-radius: 15px; border-radius: 15px 15px 15px 15px; ');
        add.Attr(d4, 'style', 'height:15px; width:15px; position:absolute; background:#ABCDEF; animation:d 5s infinite; -moz-border-radius:15px; -webkit-border-radius: 15px; border-radius: 15px 15px 15px 15px; ');
        var div = { domback:back, dom0:d0, dom1:d1, dom2:d2, dom3:d3, dom4:d4 }
        return div;
    },
    //-- Ajax停止动画
    stop:function(d) {
        d.dom0.parentNode.removeChild(d.dom0);
        d.dom1.parentNode.removeChild(d.dom1);
        d.dom2.parentNode.removeChild(d.dom2);
        d.dom3.parentNode.removeChild(d.dom3);
        d.dom4.parentNode.removeChild(d.dom4);
        d.domback.parentNode.removeChild(d.domback);
    }

}
var del = {
    Dom:function(obj) {
        obj.parentNode.removeChild(obj);
    }
}
var add = {
    //--动态添加Dom节点
    Dom:function (obj,dom) {
        var dom = document.createElement(dom);
        get.Id(obj).appendChild(dom);
        return dom;
    },
    //-- 动态添加属性
    Attr:function(obj,key,value){
        obj.setAttribute(key, value);
        return obj;
    }
}
//--URL编码
function url(Str){
    return decodeURI(Str);
}
/**
 * 模板字符串，语法标签采用<js></js>
 * 完全遵循javascript原生语法
 * @param template
 * @param vars
 * @returns {Function}
 */
function js_template(template, vars) {

    //唯一分隔标志字符串
    var split = '_{' + Math.random() + '}_';

    //消除换行符
    var estr = template.replace(/\n|\r|\t/g, '');

    var js = [];
    /****
     * 匹配标签<js> ...</js>--并且替换为特定的分隔串，
     * 并将匹配的js代码放入js数组中备用
     * */
    estr = estr.replace(/<js>(.*?)<\/js>/g, function ($0, $1) {
        js.push($1);
        return split;
    });

    /*根据特定的分隔串分隔得到普通text文本串的数组*/
    var text = estr.split(split);
    estr = " var output='';";
    /****
     * 0101010---0为text[]元素,1为js[]元素
     * 重新串起来连接为可执行eval的estr
     * **/
    for (var i = 0; i < js.length; ++i) {
        estr += 'output+=text[' + i + '];';
        estr += js[i];

    }
    estr += 'output+=text[' + js.length + '];';

    estr += 'return output;';

    var fun =new Function('vars','text',estr);
    return function(data){
        return fun.apply(null,[data,text]);
    }
}