const { Router } = require('express');
var express = require('express');
const { rmSync } = require('fs');
const async = require('hbs/lib/async');
const { resolve } = require('path/posix');
const { response } = require('../../app');
const { product } = require('../../config/colections');
const cartHelpers = require('../../helpers/cart-helpers');
var router = express.Router();
const dotenv=require('dotenv')
dotenv.config()

const productHelpers = require('../../helpers/product-healpers')
const UserHelpers = require('../../helpers/User-Helpers')
// const serviceSID = "VA0f27b9dc9ed42471fd2be571601c9d90"
// const accountSID = "AC80c9864f45dea4f2e871c90c8c778d85"
// const authToken = "087b36503492c5272ccb0a2558089754"
const client = require("twilio")(process.env.TWILLIO_ACCOUNT_SID, process.env.TWILLIO_AUTH_TOKEN)

const paypal = require('paypal-rest-sdk');
const { route } = require('./cart');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AfsHhqErm2aIG-adajLQWh1SPi23mi-nTI0aWAO54u2kY5ZOqOBD4QelnDbabr-Hwpb0dSIefoboS_MO',
    'client_secret': 'EOo1YjApf5MwBq16B3NeW6AokugJUXKvc-C6bcop8cGeaW__JWNLkGoJLoCrZghXByFMiPJOi34DTKgH'
});








//  user home page router
const veryfyUserLogin = (req, res, next) => {
    if (req.session.UserLoggedin) {
        next()
    }
    else {
        res.redirect('/login')
    }
}

//------------------------------------------------------------INDEX PAGE-------------------------------------------------------------------

router.get('/', async function (req, res) {


    var banner = await UserHelpers.getbanner()

    var products = await productHelpers.getAllProducts()


    // var newproduct = [_id, productname, brand, category, description, price, subcategory, size, color] = products.getproducts
    // products = newproduct


    var products = products.getproducts



    var CartCount = 0
    var WishCount = 0
    if (req.session.UserLoggedin) {
        CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
        WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
        req.session.UserLoggedin.CartCount = CartCount
        req.session.UserLoggedin.WishCount = WishCount

    }

    var user = req.session.UserLoggedin
    if (user) {

        res.render('user/index', { userheader: true, products, user, banner, WishCount, CartCount })

    }
    else {

        res.render('user/index', { userheader: true, products, banner })
    }






})


//user home page to signup form

router.get('/signup', function (req, res) {
    res.render('user/user-signup')
})



//to sign up submit

router.post('/signup', function (req, res) {


    mob = req.body.mobno
    req.session.userdata = req.body


    req.session.mobno = mob
    UserHelpers.doSignup(req.session.userdata).then((response) => {


        if (response.status) {



            client.verify
                .services(process.env.TWILLIO_SERVICEID)
                .verifications.create({
                    to: `+91${mob}`,
                    channel: "sms"
                }).then((response) => {
                    response.status = true




                }).catch(() => {

                })

            res.render('user/signup-otp', { mob })
        }
        else if (response.MOBExits) {
            var moberr = "Mob No Aleady Exits"
            res.render('user/user-signup', { moberr })
        }
        else {
            var err = "Email Id Aleady Exits"
            res.render('user/user-signup', { err })
        }
    })


})
//---------------------------otp page--------------------------------------------------




router.get('/otp', function (req, res) {

    if (req.session.usernotavailable) {
        req.session.usernotavailable = false
        var NoUser = "Mobile Number Not Registerd"
        res.render('user/otp-mobile', { NoUser })
    }
    else {
        res.render('user/otp-mobile')
    }

})

// otp verifications router



router.post('/otp-veryfy', function (req, res) {

    var otp = req.body.otp




    client.verify
        .services(process.env.TWILLIO_SERVICEID)
        .verificationChecks.create({
            to: `+91${req.session.mobno}`,
            code: otp
        }).then((data) => {



            if (data.status == "approved") {

                UserHelpers.OtpVeryfiedSignup(req.session.userdata).then((data) => {
                    userID=data.userID

                    if(req.session.ReferdUserID){
                        UserHelpers.AddReferdBalance(req.session.ReferdUserID,userID)
                    }

                    res.redirect('/')
                })


            }

        }).catch((errr) => {
            var otperr = "OTP failed Try again"
            mob = req.session.mobno
            res.render('user/signup-otp', { otperr, mob })
        })

})




// login page router
router.get("/login", (req, res) => {
    if (req.session.blocked) {


        req.session.blocked = false

        var loginError = "Your Account is Blocked  Contact Admin"
        res.render('user/user-login', { loginError })
    } else if (req.session.UserLoginCheckError) {
        req.session.UserLoginCheckError=null
        var loginError = "Invalid Username And Password"
        res.render('user/user-login', { loginError })

    } else {

        res.render('user/user-login')
    }


})

//login check router

router.post('/login', ((req, res) => {


    UserHelpers.doLoginCheck(req.body).then((response) => {
        var user = response.user
        if (user) {
            if (user.block) {
                req.session.blocked = true
                res.redirect('/login')
            }

            else {
                req.session.UserLoggedin = user

                res.redirect('/')
            }
        } else {
            req.session.UserLoginCheckError = true
            res.redirect('/login')
        }


    })

}))

// user logut



router.get('/logout', ((req, res) => {

    req.session.UserLoggedin = null
    res.redirect('/')
}))











router.post('/sendLogin_otp', ((req, res) => {
    var mob = req.body.mobno





    UserHelpers.otpmobcheck(mob).then((response) => {
        if (response.status) {
            var user = response.user

            var mobno = user.mobno
            req.session.loginOtpUser = user
            req.session.loginMobNo = mobno
            client.verify
                .services(process.env.TWILLIO_SERVICEID)
                .verifications.create({
                    to: `+91${mobno}`,
                    channel: "sms"
                }).then((response) => {
                    response.status = true
                })

            res.render('user/otp-EnterPage', { user })
        }
        else {
            req.session.usernotavailable = true
            res.redirect('/otp')

        }
    })

}))


///__________________________________________________________login otp resend____________________________________________________________________________________________________________



router.get("/resend-otp", (req, res) => {
    var mobno = req.session.loginMobNo
    var user = req.session.loginOtpUser

    client.verify
        .services(process.env.TWILLIO_SERVICEID)
        .verifications.create({
            to: `+91${mobno}`,
            channel: "sms"
        }).then((response) => {
            response.status = true
        })
    res.render('user/otp-EnterPage', { user })
})

//------------------------------------------------------------login  otp  veryfications-----------------------------------------------------------------------------------------------


router.post('/login-otpcheck/:id', ((req, res) => {
    var id = req.params.id

    var otp = req.body.otp


    UserHelpers.userOtpLogin(id).then((response) => {
        if (response.status) {
            var mobno = response.user.mobno
            var mobno = response.user.mobno
            client.verify
                .services(process.env.TWILLIO_SERVICEID)
                .verificationChecks.create({
                    to: `+91${mobno}`,
                    code: otp
                }).then((data) => {

                    var user = response.user




                    if (data.status == "approved") {

                        req.session.UserLoggedin = user
                        res.redirect('/')

                    }
                    else {
                        var otp = "OTP Failed Try Again"


                        res.render('user/otp-EnterPage', { otp })
                    }

                }).catch((errr) => {
                    var otp = "OTP failed Try again"


                    res.render('user/otp-EnterPage', { otp })
                })




        }

    })

    UserHelpers.doLoginCheck(id).then((response) => {

        if (response.user) {

            var mobno = response.user.mobno
            client.verify
                .services(process.env.TWILLIO_SERVICEID)
                .verificationChecks.create({
                    to: `+91${mobno}`,
                    code: otp
                }).then((data) => {

                    var user = response.user




                    if (data.status == "approved") {

                        req.session.UserLoggedin = user
                        res.redirect('/')

                    }


                }).catch((errr) => {
                    var otp = "OTP failed Try again"

                    res.render('user/loginVeryfy', { otp })
                })
        }
    })
}))

//------------------------------------------------------------------------------------ADD USER ADDRESS----------------------------------------------------------------


router.post('/add-address', (req, res) => {

    UserHelpers.addAddress(req.session.UserLoggedin._id, req.body).then(() => {
        res.redirect('/cart/checkout')
    })
})


//-------------------------------------------------------------------------------ADD ADDRESS FROM USER PROFILE--------------------------------------



router.post('/add-addressFromProfile', (req, res) => {


    UserHelpers.addAddress(req.session.UserLoggedin._id, req.body).then(() => {
        res.redirect('/User-Profile')
    })
})

//----------------------------------------------------------------------------MY ORDERS PAGE----------------------------------------------------

router.get('/myorders', veryfyUserLogin, async (req, res) => {
    var user = req.session.UserLoggedin


    CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
    WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)

    let orders = await UserHelpers.getUserOrders(req.session.UserLoggedin._id)

    if (orders.length == 0) {
        var NoOrders = true
    }



    res.render('user/my-orders', { userheader: true, orders, user, NoOrders, CartCount, WishCount })
})

//---------------------------------------------------------------------------------user profile---------------------------------------------------
router.get('/User-Profile', veryfyUserLogin, async (req, res) => {


    var update = true
    CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
    WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
    var id = req.session.UserLoggedin._id
    var user = await UserHelpers.GetUserForEditProfile(id)
    var address = await UserHelpers.getallAddress(id)

    if (req.session.changePasswordSuccessMSG) {
        req.session.changePasswordSuccessMSG = false
        var changePasswordSuccessMSG = "Password Changed"
        res.render('user/user-profile', { userheader: true, user, address, update, changePasswordSuccessMSG, CartCount, WishCount })
    } else if (req.session.changePasswordERR) {
        req.session.changePasswordERR = false
        var changePasswordERror = "Current Password Is Error"
        res.render('user/user-profile', { userheader: true, user, address, update, changePasswordERror, CartCount, WishCount })
    }

    else {
        res.render('user/user-profile', { userheader: true, user, address, update })
    }

})



//-----------------------------------------------------------UPDATE USER PROFILE-----------------------------------------------------------------------

router.post('/updateUserProfile/:id', (req, res) => {

    console.log("---------------------------------------------------------------------------------------------------------------");
    var id = req.params.id
    var userdetail = req.body

    

    UserHelpers.UpdateUserProfile(id, userdetail).then((response) => {
        if (response.status) {
            res.redirect('/User-Profile')
            
        }
        else {
            res.send("user exist")
        }
    })



})
// ========================================== UPDATE PROFILE PICTURE=============================================
router.post('/UpdateProfilePic/:id',(req,res)=>{

    id=req.params.id
    console.log(id);
    console.log("--------------------------------------------------------------------kjbuhuguvvgyvuvg>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    if(req.files.image){
        let profileImage=req.files.image
        console.log(profileImage);
        profileImage.mv('./public/images/user/' + id + 'image.jpg')

        UserHelpers.ProPic(id).then(()=>{

            res.redirect('/User-Profile')
        })
    }

})























//---------------------------------------------------------------------MANAGE ADDRESS--------------------------------------------------


router.get('/ManageAddress/:id', (req, res) => {
    var id = req.params.id
    UserHelpers.getallAddress(id).then((response) => {
        var UserAddress = response



        res.render('user/Manage-Address', { userheader: true, UserAddress, user })

    })


})



router.post('/veryfy-payment', (req, res) => {
    userID = req.session.UserLoggedin._id
    UserHelpers.veryfyPayment(req.body, userID).then(() => {
        UserHelpers.channgePaymentStatus(req.body['order[receipt]'])
        res.json({ status: true })

    }).catch((err) => {
        res.json({ status: false, err: "" })
    })

})



//---------------------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/paypal', async (req, res) => {
    userid = req.session.UserLoggedin._id

    let totalprice = await cartHelpers.getTotalAmount(userid)

    totalprice = totalprice * 75



    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "juta proucts",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;

        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});




router.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    var userID = req.session.UserLoggedin._id

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };


    UserHelpers.DeleteAfterPaypal(userID).then(() => {
        res.redirect('/cart/order-placed')
    })
})



router.get('/cancel', (req, res) =>   res.render('user/payment-err'));

//---------------------------------------------------------------------------------------------------------------------------------------------------------------


router.post('/changepassword/:id', (req, res) => {
    let id = req.params.id

    UserHelpers.changePassword(req.body, id).then((response) => {
        if (response.status) {

            req.session.changePasswordSuccessMSG = true
            res.redirect('/User-Profile')
        }
        else {

            req.session.changePasswordERR = true

            res.redirect('/User-Profile')
        }
    })

})
//=============================================DELETE ADDRESS=======================================

router.get('/deleteAddress/:id', (req, res) => {
    AddressID = req.params.id
    UserHelpers.DeleteAddress(AddressID).then(() => {
        res.redirect('/User-Profile')
    })
})

//=============================================eDIT USER ADDRESS====================================
router.get('/editAddress/:id', async (req, res) => {
    var user = req.session.UserLoggedin
    var AddressId = req.params.id

    let SelectAddress = await cartHelpers.GetSelectAddress(AddressId)



    res.render('user/Edit-Address', { userheader: true, SelectAddress, user })
})


//==========================================EDIT USER POST===============================================

router.post('/update-address/:id', (req, res) => {
    var AddressID = req.params.id
    UserHelpers.UpdateAddress(req.body, AddressID).then(() => {
        res.redirect('/User-Profile')
    })
})

//========================================ADD ADDRESS FROM USER PROFIE==================================================

router.get('/Add-Address/:id', veryfyUserLogin, (req, res) => {


    var user = req.session.UserLoggedin
    res.render('user/Add-Address', { userheader: true, user })
})


//=============================================================================  WISHLIST==========================================================

router.get('/wishlist', veryfyUserLogin, async (req, res) => {
    var user = req.session.UserLoggedin
    CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
    WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
    var WishProd = await UserHelpers.GetWishlist(req.session.UserLoggedin._id)
    if (WishProd.length == 0) {
        var NoProduct = true
    }

    res.render('user/wishlist', { userheader: true, user, WishProd, CartCount, WishCount, NoProduct })
})




//========================================================= ADD WISHLIST AJAX==========================================================================




router.get('/AddToWishlist/:Proid', (req, res) => {



    if (req.session.UserLoggedin) {
        var ProdID = req.params.Proid
        var UserID = req.session.UserLoggedin._id

        UserHelpers.AddToWishlist(UserID, ProdID).then((response) => {


            res.json(response)
        })
    } else {


        res.json({ NoUser: true })
    }



})


//========================================================REMOVE FROM WISHLIST=========================================================================

router.get('/removeFromWishlist/:prodId', (req, res) => {
    var ProdID = req.params.prodId


    cartHelpers.removeFromwishlist(ProdID, req.session.UserLoggedin._id).then((response) => {

        res.json(response)
    })
})

//====================================================================== SHOP ===================================================================

router.get('/shop', async (req, res) => {
    var user = req.session.UserLoggedin
   var  CartCount=null
   var WishCount=null

    if(req.session.UserLoggedin){
        CartCount = await cartHelpers.cartCount(req.session.UserLoggedin._id)
        WishCount = await UserHelpers.WishlistCount(req.session.UserLoggedin._id)
    }
  
    var user = req.session.UserLoggedin
    var products = await productHelpers.getAllProducts()
    var newproduct = [_id, productname, brand, category, description, price, subcategory, size, color] = products.getproducts
    products = newproduct





    res.render('user/shop', { userheader: true, products, user, CartCount, WishCount })
})



//=================================================SUB CATEGORY FILTER=============================================

router.get("/SubFilter/:subcategory", (req, res) => {
    var user = req.session.UserLoggedin
    var Filter = req.params.subcategory
    var user = req.session.UserLoggedin

    UserHelpers.subcategoryFilter(Filter).then((response) => {
        var products = response;



        res.render('user/shop', { userheader: true, products, user })

    })



})
//================================================ BRAND CATEGORY FILTER=========================================================

router.get('/BrandFilter/:brand', (req, res) => {
    var user = req.session.UserLoggedin
    var BrandName = req.params.brand

    UserHelpers.BrandFilter(BrandName).then((response) => {
        var products = response;



        res.render('user/shop', { userheader: true, products, user })

    })


})


//====================================================== PRICE FILTER========================================================


router.get('/PriceFilter/:id', (req, res) => {
    var user = req.session.UserLoggedin
    var n = req.params.id
    UserHelpers.PriceFilter(n).then((response) => {
        var products = response;

        res.render('user/shop', { userheader: true, products, user })

    })


})

//====================================================== COLOR FILTER================================

router.get('/ColorFilter/:color', (req, res) => {
    var user = req.session.UserLoggedin
    var color = req.params.color
    UserHelpers.ColorFilter(color).then((response) => {
        var products = response;



        res.render('user/shop', { userheader: true, products, user })

    })
})



//===================================================== REFER AND EARN======================================

router.get('/signup/:id',(req,res)=>{
    var ReferdUserID=req.params.id
    req.session.ReferdUserID=ReferdUserID
    res.render('user/user-signup')
})



module.exports = router