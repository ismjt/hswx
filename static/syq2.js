/**
 *脚本说明
 * 1、数据绑定通过new vue({})实现，视图绘制需要调用syqPage()函数
 * 2、先定义各功能函数，在写功能函数的应用，最后补上其他必要js脚本
 */

/*  各功能函数 */
var contextPath = window.location.origin + "/srfxb";
/**
 * 绑定所有checkbox，为选中与未选中添加相应事件：
 * 添加订阅、取消订阅
 * checkbox 传入<input type='checkbox' />元素
 */
var dealSyDy = function(checkbox){
    var id = checkbox.getAttribute('id');
    if(checkbox.checked){
        //添加订阅
        //console.info("checked"+checkbox.getAttribute('id'))
        $.post(contextPath+'/wx/subscribe/sy.save', { code: id.substring(0,8)}, function(response){
            console.info(id.substring(0,8));
            if(response=="1"){
                $.toast("订阅成功");
            }else if(response=="2"){
                $.toast("已添加过此条订阅");
            }else
                $.toast("发生错误");
        })
    }else{
        //取消订阅
        console.info("unchecked-"+checkbox.getAttribute('id'))
    }
}

/**
 * 分页功能  根据请求数据绘制Vue对象视图
 * ajaxData 传入异步请求的分页数据
 * pageLocId 分页组件位置
 * vueData 需要改变的Vue对象的数据
 * */
var syqPage = function (ajaxData,pageLocId,vueDataObj) {
    var nums = 8; //每页出现的数量
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
            };
        }
    })
};
/**
 * rainAsync 同步获取雨情告警数据
 */
var rainAsync={
    "total":0,
    "tm1":[],//雨情 1小时内告警雨量值
    "tm3":[],//雨情 3小时内告警雨量值
    "tm24":[],//雨情 24小时内告警雨量值
    "ajaxAction":function (url) {
        $.ajax({
            type: 'GET',
            url: url,
            async: false,
            dataType: 'json',
            timeout: 300,
            success: function(data){
                rainAsync.total = data.total;
                for (i=0;i<data.total;i++){
                    //cnvt-行政区划；maxpp-时段雨量；
                    rainAsync.tm1[i] = {cnvt:  data.list[i].cnvt, maxpp: data.list[i].maxpp1, inputId: data.list[i].code+'1'}
                }
                for (i=0;i<data.list.length;i++){
                    rainAsync.tm3[i] = {cnvt:  data.list[i].cnvt, maxpp: data.list[i].maxpp3, inputId: data.list[i].code+'3' }
                }
                for (i=0;i<data.list.length;i++){
                    rainAsync.tm24[i] = {cnvt:  data.list[i].cnvt, maxpp: data.list[i].maxpp24, inputId: data.list[i].code+'24' }
                }
            },
            error: function(){
                $.toast("雨情数据请求超时");
            }
        })
    }
};

/**
 * rsvrAsync 同步获取水库告警数据
 */
var rsvrAsync={
    "total":0,
    "rsvrdata":[],//水库 告警信息
    "ajaxAction":function (url) {
        $.ajax({
            type: 'GET',
            url: url,
            async: false,
            dataType: 'json',
            timeout: 300,
            success: function(data){
                rsvrAsync.total = data.total;
                for (i=0;i<data.total;i++){
                    //name-水库名称；cmpfsltdz-超汛线；
                    rsvrAsync.rsvrdata[i] = {name:  data.list[i].name, cmpfsltdz: data.list[i].cmpfsltdz }
                }
            },
            error: function(){
                $.toast("水库数据请求超时");
            }
        })
    }
};
/**
 * riverAsync 同步获取河道告警数据
 */
var riverAsync={
    "total":0,
    "riverdata":[],//河道 告警信息
    "ajaxAction":function (url) {
        $.ajax({
            type: 'GET',
            url: url,
            async: false,
            dataType: 'json',
            timeout: 300,
            success: function(data){
                riverAsync.total = data.total;
                for (i=0;i<data.total;i++){
                    //name-站名；bsnm-河名；z-水位；
                    riverAsync.riverdata[i] = {name:  data.list[i].name, bsnm:  data.list[i].bsnm,z: data.list[i].z }
                }
            },
            error: function(){
                $.toast("河道数据请求超时");
            }
        })
    }
};


/**
 * 初始化页面数据
 */
var syinfoUrl = contextPath + "/alarm/rainAlarm.json?_dt="+(new Date()).getTime()+"&_dc="+(new Date()).getTime()+"&page=1&start=0&limit=25";
var skinfoUrl = contextPath + "/alarm/rsvrAlarm.json?_dt="+(new Date()).getTime()+"&_dc="+(new Date()).getTime()+"&page=1&start=0&limit=25";//最新水库水情信息
var hdinfoUrl = contextPath + "/alarm/riverAlarm.json?_dt="+(new Date()).getTime()+"&_dc="+(new Date()).getTime()+"&page=1&start=0&limit=25";//最新的河道水情信息
var nt = (new Date());
/* 获取并重新组装数据 */
rainAsync.ajaxAction(syinfoUrl);
rsvrAsync.ajaxAction(skinfoUrl);
riverAsync.ajaxAction(hdinfoUrl);
/*//雨情信息 时间框组件
$("#datetime-picker-start").datetimePicker({
    value: [nt.getFullYear(), nt.getMonth(), nt.getDate()-1, nt.getHours(), nt.getMinutes()]
});
$("#datetime-picker-end").datetimePicker({
    value: [nt.getFullYear(), nt.getMonth(), nt.getDate(), nt.getHours(), nt.getMinutes()]
});*/
//创建雨情信息 数据绑定对象
var syvue = new Vue({
    el: '#syinfo',
    data: {
        rows: []
    }
});
//创建水库信息 数据绑定对象
var skvue = new Vue({
    el: '#skinfo',
    data: {
        rows: []
    }
});
//创建河道信息 数据绑定对象
var hdvue = new Vue({
    el: '#hdinfo',
    data: {
        rows: []
    }
});
//渲染vue视图
syqPage(rainAsync.tm1,'syPage',syvue.rows);
syqPage(rsvrAsync.rsvrdata,'skPage',skvue.rows);
if(riverAsync.total>0){
    document.getElementById("hdinfo").style.display = "block";
    syqPage(riverAsync.riverdata,'hdPage',hdvue.rows);
}



/**
 * 页面动态操作
 */
/* 查询订阅数据，刷新syvue对象的视图 */
var showDyList = function(keyword,pageLocid,vueDataObj){
    var dyData = [];
    document.getElementById("rainbarnav").style.borderBottom = "1px solid #f96";
    var DyUrl = contextPath+"/wx/subscribe/fetch/"+keyword+".json";
    $.ajax({
        type: 'GET',
        url: DyUrl,
        dataType: 'json',
        timeout: 300,
        success: function(data){
            for (i=0;i<data.total;i++){
                //雨情信息测试数据
                dyData =[
                    { cnvt: keyword+'1' , maxpp:'9'}
                ];
                dyData.push({cnvt:  data.list[i].cnvt, maxpp:  data.list[i].bsnm,z: data.list[i].z});
            }
        },
        error: function(){
            $.toast("河道数据请求超时");
        }
    })

    syqPage(dyData,pageLocid,vueDataObj);
};

/**
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
                if((ax-bx)>60){
                    document.getElementById(id).getElementsByClassName("laypage_next")[0].click();
                }
                if((ax-bx)<-60){
                    document.getElementById(id).getElementsByClassName("laypage_prev")[0].click();
                }
                break;
        }

    }
};
touchSlide("syinfo");
touchSlide("skinfo");
touchSlide("yuqing");
touchSlide("shuiku");


//没有数据的部分执行的提示
var noDataTip = function (total, insertId) {
    if(total==0){
        document.getElementById(insertId).innerHTML = "<span style='color:red;font-size:.5rem;'>没有告警数据</span>";
    }
};
noDataTip(rainAsync.total,"syPage");
noDataTip(rsvrAsync.total,"skPage");

/**
 * 雨情信息 选择时间段后重新渲染分页视图
 */
var syTmChange = function () {
    console.info(document.getElementById("syTm").value);
    syqPage(eval("rainAsync."+(document.getElementById("syTm").value)),'syPage',syvue.rows);
}
/**
 *读取上饶所有行政区今日 雨情 实时数据
 */
var fetchAddvRain = function () {
    var res = [];
    var timeStamp = new Date().getTime();
    var DateUrl = contextPath + "/data/rthyinfo/commons/date/getDefaultDate.json?_time=" + timeStamp;
    var todayBegin = "";
    var todayEnd = "";
    $.ajax({
        type: 'GET',
        url: DateUrl,
        async: false,
        dataType: 'json',
        timeout: 500,
        success: function(data){
            todayBegin = data.todayBegin;
            todayEnd = data.todayEnd;
        },
        error: function(){
            $.toast("时间数据请求超时");
        }
    });
    var _dt = new Date().getTime();
    var codelist = new Array("361102","361121","361122","361123","361124","361125","361126","361127","361128","361129","361130","361181","361191","361192");
    for (x in codelist)
    {
        $.ajax({
            type: 'GET',
            url: contextPath + "/data/rthyinfo/rain/accp/station/all.json?addvcd="+codelist[x]+"&dateBegin="+todayBegin+"&dateEnd="+todayEnd+"&_dt="+ _dt,
            async: false,
            dataType: 'json',
            timeout: 500,
            success: function(data){
                for( var i = 0 ; i < data.total; i++){
                    //if(data.list[i].accp!=""&&data.list[i].accp!=null)

                    if(data.list[i].accp!=""&&data.list[i].accp!=null){
                        res.push({'name':data.list[i].name, 'nm':data.list[i].cnnm, 'tdavg':data.list[i].accp});
                    }
                }
            },
            error: function(){
                $.toast("河道数据请求超时");
            }
        })
        //if(x==codelist.length){return result;}
    }
    return res;
}
/**
 *读取 调度水库 实时数据
 */
var fetchlastRsvr = function () {
    var res = [];
    $.ajax({
        type: 'GET',
        url: contextPath + "/wx/lastRsvr.json",
        async: false,
        dataType: 'json',
        timeout: 500,
        success: function(data){
            for( var i = 0 ; i < data.total; i++){
                res.push({'name':data.list[i].name, 'line':(data.list[i].hhrz-data.list[i].fsltdz).toFixed(2), 'hhrz':data.list[i].hhrz, 'fsltdz':data.list[i].fsltdz});
            }
        },
        error: function(){
            $.toast("水库数据请求超时");
        }
    })
    return res;
}
/**
 * SyqTab 水雨情页面 雨情、水库
 */
var clickSyqTab = function () {
    /*var content = "<tr class='item-inner row'><th class='col-25'>测站名称</th><th class='col-25'>行政区划</th><th class='col-25'>累计雨量(mm)</th> <th class='col-25'>添加订阅</th> </tr>"+
        "<tr v-for='row in rows' class='item-inner row'><td class='col-25'>{{ row.name }}</td><td class='col-25'>{{ row.nm }}</td> <td class='col-25'>{{ row.tdavg }}</td> <td class='col-25'><input type='checkbox' /></td></tr>";
*/
    if(fetchAddvRain().length==0){
        document.getElementById("yuqing").innerHTML = "<span style='text-align:center; font-size: .5rem;color: red;'>今日无雨情</span>";
    }else{
        //document.getElementById("yuqing").innerHTML = content;
        //创建水雨情中 雨情 信息数据绑定对象，这里不使用分页
        var yuqingvue = new Vue({
            el: '#yuqing',
            data: {
                rows: []
            }
        });
        //渲染yuqing视图
        syqPage(fetchAddvRain(),'yuqingPage',yuqingvue.rows);
    }
    if(fetchlastRsvr().length==0){
        document.getElementById("shuiku").innerHTML = "<span style='text-align:center; font-size: .5rem;color: red;'>今日无水情</span>";
    }else{
        //创建水雨情中 水库 信息数据绑定对象，这里不使用分页
        var shuikuvue = new Vue({
            el: '#shuiku',
            data: {
                rows: []
            }
        });
        //渲染shuiku视图
        syqPage(fetchlastRsvr(),'shuikuPage',shuikuvue.rows);
    }

}

/**
 * 河道告警信息 文字描述
 */
var RiverDescription = {
    "info":"",
    "list":[],
    "warnList":[],
    "total":0,
    "rise":{},
    "fall":{},
    "endData":"",
    "_dt":function(){return (new Date().getTime())},
    "parseDate":function (str) {//将yyyy-MM-dd HH:mm:ss日期字符串格式化为Date
        if(typeof str == 'string'){
            var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);
            if(results && results.length>3)
                return new Date(parseInt(results[1],10),parseInt(results[2],10) -1,parseInt(results[3],10));
            results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}) *$/);
            if(results && results.length>4)
                return new Date(parseInt(results[1],10),parseInt(results[2],10) -1,parseInt(results[3],10),parseInt(results[4],10));
        }
        return null;
    },
    "warnRiverInfo":function (stat) {
        var str=stat.cnnm;
        //str += CfinfoDescriptionLink.linkRiverStation(stat.code ,stat.name);
        str += "（超警戒"+stat.cmpwrz+"米）";
        return str;
    },
    //传入开始结束时间，查询河道告警信息
    "fetchInfo":function (dateBegin,dateEnd) {
        this.endData = this.parseDate(dateEnd);
        $.getJSON(contextPath+"/data/rthyinfo/river/last/list.json?orderMode=cmpwrzdesc&dateBegin="+dateBegin+"&dateEnd="+dateEnd+"&_dt="+RiverDescription._dt(), function(data){
            RiverDescription.list =data.list;
            for( var i = 0 ; i < RiverDescription.list.length; i ++){
                if(RiverDescription.list[i].cmpwrz !=null && RiverDescription.list[i].cmpwrz > 0){
                    RiverDescription.warnList.push(RiverDescription.list[i]);
                    RiverDescription.total ++ ;
                }else{
                    break;
                }
            }

        });
        $.getJSON(contextPath+"/data/rthyinfo/river/last/riseMax.json?dateBegin="+dateBegin+"&dateEnd="+dateEnd+"&_dt="+RiverDescription._dt(), function(data){
            if(data.total!=0){RiverDescription.rise=data.list[0]}
        });
        $.getJSON(contextPath+"/data/rthyinfo/river/last/fallMax.json?dateBegin="+dateBegin+"&dateEnd="+dateEnd+"&_dt="+RiverDescription._dt(), function(data){
            if(data.total!=0){RiverDescription.fall = data.list[0]}
        });
        //console.info(this.parseDate(dateEnd).getMonth());
        this.info = ((this.parseDate(dateEnd)).getMonth()+1)+"月"+(this.parseDate(dateEnd)).getDate()+"日";
        this.info += "，全市河道水情：";
        if(this.total>0){
            this.info +="超警戒站数"+this.total+"个，";
            if(this.total>3){
                this.info+="前三个为："+this.warnRiverInfo(this.warnList[0])+"，"+this.warnRiverInfo(this.warnList[1])+"，"+this.warnRiverInfo(this.warnList[2])+"。";
            }else{
                this.info+= "分别为：";
                for(var i = 0; i<this.total;i++){
                    if(i == (this.total-1)) {
                        this.info+=this.warnRiverInfo(this.warnList[i])+'。';
                    } else {
                        this.info+=this.warnRiverInfo(this.warnList[i])+'，';
                    }
                }
            }
        }else{
            if(this.list != null && this.list.length> 0){
                var lastInfo= this.list[0];
                this.info+="各河道站均在警戒水位以下，其中离警戒水位最近的是"+lastInfo.ctnm+lastInfo.cnnm
                    /*+ CfinfoDescriptionLink.linkRiverStation(lastInfo.code , lastInfo.name)*/
                    +"<span style='color: #1F5989;font-size: .6rem;'>"+lastInfo.name+"</span>"
                    +"，"+lastInfo.tm.substr(0,13)+"离警戒水位"+Math.abs(lastInfo.cmpwrz)+"米。 ";
            }else{
                this.info = "<span style='text-align:center; font-size: .5rem;color: red;'>没有告警数据</span>";
            }
        }
        if( this.rise.cnnm != null) {
            this.info +="涨幅最大的是："+this.rise.cnnm +"<span style='color: #1F5989;font-size: .6rem;'>"+this.rise.name+"</span>" + "（涨"+this.rise.zcv+"米），";
        }
        if( this.fall.cnnm != null) {
            this.info +="跌幅最大的是："+this.fall.cnnm +"<span style='color: #1F5989;font-size: .6rem;'>"+this.fall.name+"</span>" + "（跌"+this.fall.zcv+"米）。";
        }
        document.getElementById("hdDescr").innerHTML = "<td class='col-100' style='font-size: .6rem;'>"+this.info+"</td>";
    }
}
//产生河道描述信息
window.onload = function() {
    $.getJSON(contextPath + "/data/rthyinfo/commons/date/getDefaultDate.json?_dt=" + RiverDescription._dt(), function (data) {
        var beginTime = data.todayBegin.substr(0, 13);
        var endTime = data.todayEnd.substr(0, 13);
        RiverDescription.fetchInfo(beginTime, endTime);
    });
    setTimeout(function () {
        clickSyqTab();
    }, 1000);

}


