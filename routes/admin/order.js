
const { response } = require('express');
var express = require('express');
const { redirect } = require('express/lib/response');
const { read } = require('fs');
const async = require('hbs/lib/async');
const { resolve } = require('path/posix');

const adminHelpers = require('../../helpers/admin-helpers');
var router = express.Router();
const UserHelpers=require('../../helpers/User-Helpers')



router.get('/View-Orders',async(req,res)=>{

    // var AllOrders= await adminHelpers.GetAllOrdersForAdmin()
    // var order=await adminHelpers.GetAllorders()
    var AllOrders=await adminHelpers.getOrders()

  

   
    res.render('admin/manage-orders',{adminHeader:true,AllOrders})
   

    })
   



    router.post('/changeStatus/:OrderId/:ProdId',(req,res)=>{
        var OrderId=req.params.OrderId
        var ProdId=req.params.ProdId
        var newstatus=req.body.status
       
      
       
        adminHelpers.changeStaus(OrderId,ProdId,newstatus).then((response)=>{
            res.redirect('/order/View-Orders')
        })
    })

   router.post('/CancelOrder',(req,res)=>{
       var OrderId=req.body.UserId
       var ProdId=req.body.ProdId
       
       var newstatus="cancel"
       adminHelpers.userProductcancel(OrderId,ProdId,newstatus).then((response)=>{
           res.json(response)
       })
       
       
   })








































module.exports=router