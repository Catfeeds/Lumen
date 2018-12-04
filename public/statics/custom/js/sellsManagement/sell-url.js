/**
 * Created by admin on 2018/3/31.
 */
var URLS = {
    customer: {
        store:'/Customer/store',
        list:'/Customer/pageIndex?',
        show:'/Customer/show?',
        update:'/Customer/update',
        unique:'/Customer/unique?',
        del:'/Customer/destory?',
    },
    sellsOrder:{
        unique:'/SellOrder/unique?',
        list:'/SellOrder/pageIndex?',
        category: '/MaterialCategory/treeIndex',
        bomItem: '/Material/bomItem',
        materialTempAttr: '/Material/getTemplateAttributeList',
        del:'/SellOrder/destory?',
        bomMother: '/Material/bomMother',
        store:'/SellOrder/store',
        show:'/SellOrder/show?',
        update:'/SellOrder/update',
        create:'/SellOrder/createPO?',
        getCode:'/encoding/get',
    }
}