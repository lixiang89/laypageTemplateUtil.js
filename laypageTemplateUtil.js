define([
    "jquery",
    "layPage",
    "common",
    "layer"
], function ($, layPage,common,layer) {
    var loadAjax=common.loadAjax,
        pagenation='' +
            '<div>' +
                '<div style="clear: both;"></div>'+
                '<div id="pageContext" class="tr mr20 mb10">'+
                    '<span id="pagenation"></span>'+
                    '<span class="ml10 fr pt5 dn">共<span id="total" class="fb ml5 mr5" >-</span>条记录</span>'+
                '</div>' +
            '</div>';

    var laypageTemplateUtil=function(){
        this.defaultData={
            container:$('#table'),
            ajaxData:{
                "nopage": "0",
                "pageSize": "20",
                "pageNo": "1",
                "sortType": "desc",
                "sortAttribute":""
            },
            tplCompile:'',
            url:''
        },
            /*
             options
             --container:容器
             --ajaxData:接口入参
             --tplCompile:art模板的compile
             --url:请求路径

             栗子:
             resources/m-templates/tmp1/html/template/pagenation.html
             var tempStr= require('text!/javascript/modules/lobby/product/ABSEcosystem/template/listTemp.js');
             var render = template.compile(tempStr);
             var options={
             ajaxData:{
                 "nopage": "0",
                 "pageSize": "2",
                 "pageNo": "1",
                 "sortType": "desc",
                 "productType": "15",
                 "productStatus": ["16"],
                 "assignedMembers": "",
                 "productPhase": ["3"],
                 "sortAttribute":"updateDate"
             },
             tplCompile:render
             }
             laypageTable.init(options)
             */
            this.init=function (options) {
                if(!options.url||!options.tplCompile) throw 'are u kidding';
                $.extend(true,this.defaultData,options);
                this.getData();
            },
            this.getData=function (ajaxData) {
                var self=this;
                var requestData= $.extend(self.defaultData.ajaxData,ajaxData);
                var ajaxOptions={
                    url:self.defaultData.url,
                    needCache:false,
                    isLoading:true,
                    data:JSON.stringify(requestData),
                    success:function (res) {
                        if(res&&res.rtnCode==="000"){
                            self.loadPage(res);
                        }else{
                            layer.alert(res.rtnMsg)
                        }
                    }
                }
                loadAjax(ajaxOptions);
            },
            this.loadPage=function (res) {
                var self=this,
                    defaultData=self.defaultData,
                    resData=res.data,
                    $container=defaultData.container,
                    total=resData.total||0,
                    func=defaultData.func,
                    noDataHtml='<div class="tc">{0}</div>'.format(defaultData.noDataHtml||'没有找到匹配的记录'),
                    $pageContext=$('#pageContext');

                if(total>0){

                    $pageContext.remove();

                    var pageNo=+resData.pageNo||1;
                    var pageSize=+(resData.pageSize||defaultData.ajaxData.pageSize);
                    var totalPage=(total + pageSize -1) / pageSize;

                    var tplCompile=defaultData.tplCompile;
                    var tplHtml=tplCompile({items:resData.rows});
                    $container.html(tplHtml).after(pagenation);

                    $('#total').text(total).parent().show();
                    var $pagenation= $('#pagenation');
                    if(totalPage<2){
                        $pagenation.hide();
                    }else{
                        $pagenation.show();
                    }

                    layPage({
                        cont: 'pagenation', //容器。值支持id名、原生dom对象，jquery对象。
                        pages: totalPage, //通过后台拿到的总页数
                        curr:  pageNo, //当前页
                        prev:'上一页',
                        next:'下一页',
                        jump: function(obj, first){ //触发分页后的回调
                            if(!first){ //点击跳页触发函数自身，并传递当前页：obj.curr
                                pageNo++;
                                var data={
                                    pageNo:obj.curr+''
                                }
                                self.getData(data);
                            }
                        }
                    });

                }else {
                    $pageContext.hide();
                    $container.html(noDataHtml);
                }

                func&&func(defaultData);
            }

    }

    return new laypageTemplateUtil();
});