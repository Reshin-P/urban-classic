
const { response } = require('express');
var express = require('express');
const async = require('hbs/lib/async');
const adminHelpers = require('../../helpers/admin-helpers');
const productHealpers = require('../../helpers/product-healpers');
const productHelpers=require('../../helpers/product-healpers')
const cartHelpers = require('../../helpers/cart-helpers');
const { route } = require('./admin');
var router = express.Router();
const UserHelpers = require('../../helpers/User-Helpers')


const veryfyAdminLogin=(req,res,next)=>{
    if(req.session.AdminLoggedIn){
        next()
    }
    else{
        res.redirect('/admin/admin-login')
    }
}

//------------------------------------------add product---------------------------------------------------------

router.get('/',((req,res)=>{
    if(req.session.AdminLoggedIn){
        adminHelpers.viewCategory().then((response)=>{
       
            var category=response.category
            adminHelpers.viewSubCategory().then((response)=>{
              
                var subcategory=response.subcategory
                res.render('admin/add-product',{adminHeader:true,category,subcategory})
            })
        })
    }
    else{
        res.redirect('/admin/admin-login')
    }

    

   
}))


//------------------------------------------add product post------------------------------------------------------

router.post('/add-product',((req,res)=>{
  
  productHelpers.addProduct(req.body).then((response)=>{
      if(response.status){
        id=response.id
          let image1=req.files.image1
          let image3=req.files.image3
          let image2=req.files.image2
          if(image1){
            image1.mv('./public/images/productImages/'+id+'image1.jpg')
        }
        if(image2){
            image2.mv('./public/images/productImages/'+id+'image2.jpg')
        }
        if(image3){
            image3.mv('./public/images/productImages/'+id+'image3.jpg')

        }
        res.redirect('/product/')

          
      }
  })
  
}))
//----------------------------------------------------------view products------------------------------------------------------

router.get('/view-products',function(req,res){
    if(req.session.AdminLoggedIn){


        productHelpers.getAllProducts().then((response)=>{
            var getproducts=response.getproducts
            
            res.render('admin/view-products',{adminHeader:true,getproducts})
          
        })
    }
    else{
        res.redirect('/admin/admin-login')

    }

  
       
})


//-----------------------------------------------------------Delete Product---------------------------------------------------------
router.get('/deleteproduct/:id',((req,res)=>{
    var id=req.params.id
    productHelpers.deleteProduct(id).then((response)=>{
        if(response.status){
            
            res.redirect('/product/view-products')
        }

    })
   
}))


//------------------------------------------------------------Edit Product get---------------------------------------------------------
router.get('/editproduct/:id',((req,res)=>{
    if(req.session.AdminLoggedIn){
        var id =req.params.id

        adminHelpers.viewCategory().then((response)=>{
            
            var category=response.category
            adminHelpers.viewSubCategory().then((response)=>{
            
                var subcategory=response.subcategory
                productHelpers.geteditproduct(id).then((response)=>{
                    var product=response.product
                 
                    res.render('admin/edit-product',{adminHeader:true,product,category,subcategory})
                })
          
            })
        })
    }
    else{
        res.redirect('/admin/admin-login')

    }

}))

//------------------------------------------------------------Edit Product Post---------------------------------------------------------
router.post('/edit-product/:id',(req,res)=>{
    var id =req.params.id
 
    productHelpers.updateProduct(id,req.body).then((response)=>{
        if(response.status){
            let image1=req.files.image1
            let image3=req.files.image3
            let image2=req.files.image2

            if(image1){
                image1.mv('./public/images/productImages/'+id+'image1.jpg')
            }
            if(image2){
                image2.mv('./public/images/productImages/'+id+'image2.jpg')
            }
            if(image3){
                image3.mv('./public/images/productImages/'+id+'image3.jpg')

            }
            res.redirect('/product/view-products')
                       
         
            

        }
    })
   
})

//---------------------------------------------------------Product Details---------------------------------------------

router.get('/product-detail/:id',async function(req,res){
  var id=req.params.id
  user=req.session.UserLoggedin
  if(user){
    WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
  }

  
  productHealpers.getproductDetails(id).then(async(response)=>{
    if(response.status){
        var productDetails=response.productDetails
    }
    var CartCount=0
  
    if(req.session.UserLoggedin){

        CartCount= await  cartHelpers.cartCount(req.session.UserLoggedin._id)
        
  res.render("user/product-details",{productDetails,userheader:true,user,CartCount,WishCount})
    }  else{
        
      res.render("user/product-details",{productDetails,userheader:true})
  
    }
})
})

//------------------------------------------------------------------MORE PRODUCT DETAILS OF PRODUCT IN ADMIN SIDE-----------------------------------------------------

router.get('/ProductDetails/:id',veryfyAdminLogin,async(req,res)=>{
    
    var id=req.params.id
    await productHealpers.getproductDetails(id).then((response)=>{
      var  productDetails=response.productDetails
      res.render('admin/admin-ProductDetails',{adminHeader:true,productDetails})
    })
  

    
      
  
})





















module.exports=router