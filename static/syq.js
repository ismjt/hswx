var contextPath = window.location.origin + "/srfxb";
var syinfoUrl = contextPath + "/alarm/rainAlarm.json?_dt="+(new Date()).getTime()+"&_dc="+(new Date()).getTime()+"&page=1&start=0&limit=25";
var skinfoUrl = contextPath + "/alarm/rsvrAlarm.json?_dt="+(new Date()).getTime()+"&_dc="+(new Date()).getTime()+"&page=1&start=0&limit=25";//最新水库水情信息
var hdinfoUrl = contextPath + "/alarm/riverAlarm.json?_dt="+(new Date()).getTime()+"&_dc="+(new Date()).getTime()+"&page=1&start=0&limit=25";//最新的河道水情信息
var nt = (new Date());
$("#datetime-picker-start").datetimePicker({
    value: [nt.getFullYear(), nt.getMonth(), nt.getDate()-1, nt.getHours(), nt.getMinutes()]
});
$("#datetime-picker-end").datetimePicker({
    value: [nt.getFullYear(), nt.getMonth(), nt.getDate(), nt.getHours(), nt.getMinutes()]
});
var syvue = new Vue({
    el: '#syinfo',
    data: {
        rows: [

        ]
    }
});
var skvue = new Vue({
    el: '#skinfo',
    data: {
        rows: [

        ]
    }
});
new Vue({
    el: '#yuqing',
    data: {
        rows: [
            { name: '110' , place: '南昌' , rain:'20' , isdy: '√'},
            { name: '002' , place: '九江' , rain:'40' , isdy: '×'},
            { name: '767' , place: '上海' , rain:'23' , isdy: '√'},
            { name: '234' , place: '上海' , rain:'2.3' , isdy: '√'},
            { name: '355' , place: '上海' , rain:'16' , isdy: '×'}
        ]
    }
});
new Vue({
    el: '#shuiku',
    data: {
        rows: [
            { name: '七一水库' , line: '2' , main:'20' ,after:'10' , isdy: '√'},
            { name: '唐山水库' , line: '3' , main:'40' ,after:'20' , isdy: '×'},
            { name: '大河湾' , line: '1.2' , main:'23' , after:'3' ,isdy: '√'},
            { name: '柘林水库' , line: '1.5' , main:'33' ,after:'12' , isdy: '√'},
            { name: '啦啦啦水库' , line: '2.4' , main:'16' ,after:'3' , isdy: '×'}
        ]
    }
});

/*window.onload=function () {
 var mapwidth = document.getElementsByClassName('buttons-tab')[0].offsetHeight;
 document.getElementById('syqcont').style.top = mapwidth+10+'px';
 }*/

/*
 * 分页功能，请求数据，重新绘制Vue对象视图
 * ajaxData 异步请求的分页数据
 * pageLocId 分页组件位置
 * vueData 需要改变的Vue对象的数据
 * */
var syqPage = function (ajaxData,pageLocId,vueDataObj) {
    var nums = 5; //每页出现的数量
    var pages = Math.ceil(ajaxData.length/nums);

    var thisDate = function(curr){
        var str = '' ,last = curr*nums - 1;
        last = last >= ajaxData.length ? (ajaxData.length-1) : last;
        var arrayStr = [];
        for(var i = (curr*nums - nums); i <= last; i++){
            arrayStr.push(ajaxData[i]);
        }
        return arrayStr;
    };
    //调用laypage.js分页功能
    laypage({
        cont: pageLocId,
        pages: pages,
        skin: 'molv',
        first: 1,
        last: false,
        prev: '<',
        next: '>',
        jump: function(obj){
            //传入当前页码，根据thisDate（）返回json数组对象，利用索引更改vue对象的data值
            for(var k=thisDate(obj.curr).length-1;k>=0;k--){
                vueDataObj.$set(k, thisDate(obj.curr)[k]);
            }
        }
    });
}

/* 初始化页面时分页 */
/**
 * AjaxData 异步获取雨情告警数据并完成分页
 * 通过 Ajax GET请求获取JSON数据。这是一个 $.ajax 的简写方式。
 * @Param url 数据请求地址
 * @Param tmType 雨量统计时段，所有参数值为'1','3','24'
 * @Param pageFn 处理数据，完成分页动作
 */

syqPage(test2,'skPage',skvue.rows);
/* 分页结束 */

/* 订阅数据刷新 */
var showDyList = function(keyword,pageLocid,vueDataObj){
    /* 传入keyword，构造数据请求链接，异步获取服务器数据 */
    if(keyword=="雨情信息"){
        document.getElementById("rainbarnav").style.borderBottom = "1px solid #f96";
        //雨情信息测试数据
        var dyData =[
            { place: keyword+'1' , rain:'9'},
            { place: keyword+'2' , rain:'23'},
            { place: keyword+'3' , rain:'14'},
            { place: keyword+'4' , rain:'5'},
            { place: keyword+'5' , rain:'6'},
            { place: keyword+'6' , rain:'19'},
            { place: keyword+'7' , rain:'213'},
            { place: keyword+'8' , rain:'114'},
            { place: keyword+'9' , rain:'51'},
            { place: keyword+'10' , rain:'61'},
            { place: keyword+'11' , rain:'92'},
            { place: keyword+'12' , rain:'233'},
            { place: keyword+'13' , rain:'144'},
            { place: keyword+'14' , rain:'55'},
            { place: keyword+'15' , rain:'65 '},
            { place: keyword+'16' , rain:'1111 '}
        ];
    }else if(keyword=="水库水情"){
        document.getElementById("skbarnav").style.borderBottom = "1px solid #f96";
        //水库水情测试数据
        var dyData =[
            { skname: keyword+'1' , line:'9'},
            { skname: keyword+'2' , line:'23'},
            { skname: keyword+'3' , line:'14'},
            { skname: keyword+'4' , line:'5'},
            { skname: keyword+'5' , line:'6'},
            { skname: keyword+'6' , line:'19'},
            { skname: keyword+'7' , line:'213'},
            { skname: keyword+'8' , line:'114'},
            { skname: keyword+'9' , line:'51'},
            { skname: keyword+'10' , line:'61'},
            { skname: keyword+'11' , line:'92'},
            { skname: keyword+'12' , line:'233'},
            { skname: keyword+'13' , line:'144'},
            { skname: keyword+'14' , line:'55'},
            { skname: keyword+'15' , line:'65 '},
            { skname: keyword+'16' , line:'1111 '}
        ];
    }

    syqPage(dyData,pageLocid,vueDataObj);
};

/*
 * 触摸滑动功能
 * id    需要监听滑动的DOM
 */
var touchSlide = function (id){
    var ax,ay,bx,by;
    document.getElementById(id).addEventListener('touchstart',touch, false);
    document.getElementById(id).addEventListener('touchend',touch, false);
    function touch (event){
        var event = event || window.event;
        switch(event.type){
            case "touchstart":
                ax = event.touches[0].clientX;
                ay = event.touches[0].clientY;
                break;
            case "touchend":
                bx = event.changedTouches[0].clientX;
                by = event.changedTouches[0].clientY;
                if((ax-bx)>80){
                    document.getElementById(id).getElementsByClassName("laypage_prev")[0].click();
                }
                if((ax-bx)<-80){
                    document.getElementById(id).getElementsByClassName("laypage_next")[0].click();
                }
                break;
        }

    }
};
touchSlide("syinfo");
touchSlide("skinfo");