var express = require('express');
const { rmSync } = require('fs');
const { resolve } = require('path/posix');
const { response } = require('../../app');
const { product } = require('../../config/colections');
var router = express.Router();
const productHelpers=require('../../helpers/product-healpers')
const UserHelpers=require('../../helpers/User-Helpers')
const CartHelpers=require('../../helpers/cart-helpers');
const cartHelpers = require('../../helpers/cart-helpers');
const async = require('hbs/lib/async');
const { stringify } = require('querystring');
const paypal = require('paypal-rest-sdk');
const offersHelpers = require('../../helpers/offers-helpers');
const { couponDiscount } = require('../../helpers/offers-helpers');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AfsHhqErm2aIG-adajLQWh1SPi23mi-nTI0aWAO54u2kY5ZOqOBD4QelnDbabr-Hwpb0dSIefoboS_MO',
  'client_secret': 'EOo1YjApf5MwBq16B3NeW6AokugJUXKvc-C6bcop8cGeaW__JWNLkGoJLoCrZghXByFMiPJOi34DTKgH'
});

const veryfyUserLogin=(req,res,next)=>{
    if(req.session.UserLoggedin){
        next()
    }
    else{
        res.redirect('/login')
    }
}

//_______________________________________________________________add to cart_______________________________________________________________________________________________________________
router.get('/add-Cart/:id',(req,res)=>{
 

    if (req.session.UserLoggedin){
        var prodID=req.params.id
    
        cartHelpers.addToCart(prodID,req.session.UserLoggedin._id).then((response)=>{
          
             res.json({status:true})
          
        })
        
    }else{

        res.json({NoUser:true})

    }
  
   
})

//==============================================================  ADD CART FROM WISHLIST==========================================================================================



router.get('/add-CartFromWishlist/:id',(req,res)=>{

    var prodID=req.params.id
    cartHelpers.addToCartFromWishlist(prodID,req.session.UserLoggedin._id).then((response)=>{

        
        res.json({status:true})
    })
})

//_______________________________________________________________view cart_______________________________________________________________________________________________________________




router.get('/viewcart',veryfyUserLogin,async(req,res)=>{

    CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
    WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
    
user=req.session.UserLoggedin
    let products=await cartHelpers.getCartProducts(req.session.UserLoggedin._id)
   
    let total=await cartHelpers.getTotalAmount(req.session.UserLoggedin._id)
    let userCoup=await   offersHelpers.couponDiscount(req.session.UserLoggedin._id)
    if(userCoup.couponamount){
        userCoupDis=userCoup.couponamount
    }
    else{
        userCoupDis=0
    }
    lastprice=total-userCoupDis
    console.log('userCoup>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',userCoupDis);

if(products.length===0){
    var NoProductsINCart=true
}
    
    
        
        
        res.render('user/view-cart',{userheader:true,user,products,total,NoProductsINCart,CartCount,WishCount,userCoupDis,lastprice})
     

         
    
      
})

//_______________________________________________________________Change Quantity_______________________________________________________________________________________________________________



router.post('/ChangeQuantity',(req,res)=>{

    
   
    cartHelpers.ChangeProductQuantity(req.body).then(async(response)=>{
        response.total=await  cartHelpers.getTotalAmount(req.body.user)
        // response.subtotal=await cartHelpers.getSubTotal(req.body.user)
       res.json(response)
        
    })
})
//_______________________________________________________________Remove From Cart______________________________________________________________________________________________________________


router.post('/removeFromCart',function(req,res){
   
    cartHelpers.removeFromCart(req.body).then((response)=>{
      res.json(response)
    })
    
})

//_______________________________________________________________For Check Outpage_______________________________________________________________________________________________________________


router.get('/checkout',veryfyUserLogin,async(req,res)=>{
   var user=req.session.UserLoggedin
    CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
    WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
    let total=await cartHelpers.getTotalAmount(req.session.UserLoggedin._id)
    let CheckoutProd= await cartHelpers.getProductsForCheckout(req.session.UserLoggedin._id)
    let userCoup=await   offersHelpers.couponDiscount(req.session.UserLoggedin._id)
     let  address=  await UserHelpers.getallAddress(req.session.UserLoggedin._id)

   

     
var placeorderdisable=null
     if(user.wallet){

     }else{
         user.wallet=0
     }

     if(userCoup.couponamount){
         couponD=userCoup.couponamount
         console.log("if casse coupon amount",couponDiscount);
         
     }else{
        couponD=0
     }

     console.log("length",CheckoutProd.length);
     if(CheckoutProd.length==0){
     res.redirect('/')
    }
  console.log(couponD);
  total=total-couponD
  console.log(total);
  console.log(address.length);
  if(address.length==0){
    var NoAddress=true
    
  }
  console.log(NoAddress);
  
  

        res.render('user/checkout',{userheader:true,total,CheckoutProd,user,address,CartCount,WishCount,NoAddress})

    })
    
 
   


//--------------------------------------------------------------------for place the order---------------------------------------------------------------------------------------------------

router.post('/placeorder',async(req,res)=>{


     
    console.log("------------------------------------------------------------------------------body");
     let AddressId=req.body.addressid
     console.log(req.body);
     console.log("------------------------------------------------------------------------------body");

    let products=await cartHelpers.getCartProductlist(req.body.user)
    let totalprice=await cartHelpers.getTotalAmount(req.body.user)
    let SelectAddress=await cartHelpers.GetSelectAddress(AddressId)
    let userCoup=await   offersHelpers.couponDiscount(req.session.UserLoggedin._id)
    console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
if(products.length==0){
    res.redirect('/')
}
    if(req.body.wallet=="on")
  {
      console.log('total',totalprice);
      console.log(userCoup.wallet);

      totalprice=totalprice-userCoup.wallet
console.log('total',totalprice);
    console.log("wallet undeeeeeeeeeeeeeeee");
  }

    if(userCoup.couponamount){
        couponD=userCoup.couponamount
        console.log("if casse coupon amount",couponDiscount);
        totalprice=totalprice-couponD
        await offersHelpers.CouponDisZero(req.session.UserLoggedin._id)
    }
 console.log(couponD);
 
 console.log(totalprice);
 console.log(SelectAddress);
    

    SelectAddress.payementmethod=req.body.payementmethod
     await cartHelpers.placeOrder(SelectAddress,products,totalprice).then((response)=>{
        var orderId=response
        
       
         req.session.orderplaced=req.body
         if(req.body.payementmethod=="COD"){
            res.json({CODpayment:true})
          
         }
         else if(req.body.payementmethod=="razorpay"){


            
          UserHelpers.GenerateRazorpay(orderId,totalprice).then((response)=>{

              
res.json(response)
          })
         }
         else if(req.body.payementmethod=="paypal"){


            res.json({paypal:true})

         
            

         }
         else{
         res.json({status:false}) 
         }
         req.session.orderplaced.total=totalprice
         req.session.orderplaced.orderdate=new Date()
         
  

    })
 

})




router.get('/order-placed',(req,res)=>{

user=req.session.UserLoggedin
  
    res.render('user/order-sucess',{userheader:true,user})
})











module.exports=router