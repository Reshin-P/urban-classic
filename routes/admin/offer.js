const { Router } = require('express');
var express = require('express');
const adminHelpers = require('../../helpers/admin-helpers');
var router = express.Router();
const UserHelpers=require('../../helpers/User-Helpers')
const OfferHelper=require('../../helpers/offers-helpers');
const { response } = require('../../app');
const OffersHelpers = require('../../helpers/offers-helpers');
const async = require('hbs/lib/async');
const offersHelpers = require('../../helpers/offers-helpers');


const veryfyAdminLogin=(req,res,next)=>{
    if(req.session.AdminLoggedIn){
        next()
    }
    else{
        res.redirect('/admin/admin-login')
    }
}


//  user home page router
const veryfyUserLogin = (req, res, next) => {
    if (req.session.UserLoggedin) {
        next()
    }
    else {
        res.redirect('/login')
    }
}






//======================================TO GET THE PRODUCT OFFER PAGE GET METHODE==============================

router.get('/SubCategoryOffer',(req,res)=>{
     
              
    adminHelpers.viewSubCategory().then(async(response)=>{
        var SubCategotyOffer=await OffersHelpers.ViewSubCategotyOffer()
        var subcategory=response.subcategory

        if(req.session.SubCategotyOfferExist){
            req.session.SubCategotyOfferExist=false
            var SubCategotyOfferExist="Alredy this subcategory have an offer please remove the offer"
            res.render('admin/OfferSubCategory',{adminHeader:true,subcategory,SubCategotyOffer,SubCategotyOfferExist})
        }else{
            res.render('admin/OfferSubCategory',{adminHeader:true,subcategory,SubCategotyOffer})

        }
        res.render('admin/OfferSubCategory',{adminHeader:true,subcategory,SubCategotyOffer})
    })
   
})

//====================================TO ADD SUB CATEGORY OFFERS===================================
router.post('/Add-SubCategoryOffer',(req,res)=>{



    OffersHelpers.AddSubCategoryOffer(req.body).then((response)=>{
        if(response.Exist){
      
       req.session.SubCategotyOfferExist=true
       res.redirect('/offer/SubCategoryOffer')
        }else{


            res.redirect('/offer/SubCategoryOffer')
        }
    
      
    })
   
})


//===================================== TO GET  PRODUCT OFFERS PAGE==========================================

router.get('/ProductOffer/:id',veryfyAdminLogin,(req,res)=>{
let ProdId=req.params.id
    res.render('admin/OfferProduct',{adminHeader:true,ProdId})


    
})


//==================================== TO GET ADD PRODUCT OFFER PAGE ======================================

router.post('/Add-ProductOffer',(req,res)=>{
   
    OfferHelper.AddProductOffers(req.body).then((response)=>{
        res.redirect('/admin/')
    })
       
    
    
   
})

//================================== TO VIEW ALL PRODUCT OFFERS===========================================
router.get('/ViewProductOffer',veryfyAdminLogin,async(req,res)=>{

  var ProductOffer=await  offersHelpers.GetAllProductOffers()
    res.render('admin/OfferProductView',{adminHeader:true,ProductOffer})

})


//============================== AJAX CALL TO REMOVE  SUB CATEGORY OFFERR==============================

router.post('/removeSubCategoryOffer',(req,res)=>{
    var OfferID=req.body.OfferID
    var SubCategory=req.body.SubCategory
    OfferHelper.RemoveSubCategoryOffer(OfferID,SubCategory).then((response)=>{
        res.json(response)
    })
})
//======================================TO DELETE PRODUCT OFFER==========================================
router.post('/RemoveProductOffer',(req,res)=>{
    OfferID=req.body.OfferID
    ProdID=req.body.ProdID
  offersHelpers.RemoveProductOffer(OfferID,ProdID).then((response)=>{
      res.json({status:true})
  })
})


//================================================== TO GET ADD COUPON PAGE========================================================================

router.get('/Coupon',veryfyAdminLogin,async(req,res)=>{

    var coupon=await offersHelpers.ViewCoupon()
    


res.render('admin/AddCoupon',{adminHeader:true,coupon})
    
})


//=========================================TO ADD COUPON==============================================

router.post('/AddCoupen',(req,res)=>{
    
    offersHelpers.AddCupon(req.body).then((response)=>{
        res.json(response)
    })
  
})
//==========================================  TO REMOVE THE COUPON==========================================

router.get('/RemoveCoupon/:id',(req,res)=>{
    var CouponID=req.params.id
    offersHelpers.RemoveCoupon(CouponID).then((response)=>{
        res.json(response)
    })


})


//===================================== TO CHECK COUPON FROM VIEW CART  PAGE================================

router.post('/ApplyCoupon',veryfyUserLogin,(req,res)=>{
   
    var Coupon=req.body.coupon
   

    offersHelpers.CheckCoupon(Coupon,req.session.UserLoggedin._id).then((response)=>{
        res.json(response)

        
    })
   
})




















module.exports=router