
const async = require('hbs/lib/async')
const db = require('..//config/connection')
const { ObjectId } = require('mongodb')
const { resolve } = require('path/posix')
const { rejects } = require('assert')
const { devNull } = require('os')
const res = require('express/lib/response')
const collection = require('..//config/colections')
const { ORDER_COLLECTION } = require('..//config/colections')
const { response } = require('express')
const Razorpay = require('razorpay')
const { stringify } = require('querystring')
const { route } = require('../routes/admin/admin')
const { router } = require('../app')
const { promises } = require('stream')



var instance = new Razorpay({
  key_id: 'rzp_test_kFVZIwEvYnvDN0',
  key_secret: 'BOsN3sDQ7hbCZ0wqqIDFICmm',
});


module.exports = {

  doSignup: (userdetails) => {

    return new Promise(async (resolve, reject) => {

      var userexists = await db.get().collection("users").findOne({ email: userdetails.email })
      var userMOBexists = await db.get().collection("users").findOne({ mobno: userdetails.mobno })
      console.log(userdetails.mobno);
      if (!userexists) {

        resolve({ status: true })

      }
      else if(userMOBexists.mobno){
        resolve({MOBExits:true})
      }
      else {

        resolve({ status: false })


      }


    })
  },

  OtpVeryfiedSignup: (userdetails) => {
    return new Promise(async (resolve, reject) => {

      var userInsert = await db.get().collection("users").insertOne(userdetails).then((data) => {
        console.log(data);
        userID=data.insertedId
        resolve({ status: true,userID })
      })
    })






  },


  doLoginCheck: (userdetails) => {

    var EnterEmail = userdetails.email
    var EnterPassword = userdetails.password
    return new Promise(async (resolve, reject) => {
      var user = await db.get().collection("users").findOne({ email: EnterEmail, password: EnterPassword })
      if (user) {

        resolve({ status: true, user })
      } else {
        resolve({ status: false })
      }
    })




  },

  otpmobcheck: (mob) => {






    return new Promise(async (resolve, reject) => {
      var user = await db.get().collection('users').findOne({ mobno: mob })

      if (user) {
        resolve({ status: true, user })
      } else {
        resolve({ status: false })
      }
    })

  },


  userOtpLogin: (id) => {

    return new Promise(async (resolve, reject) => {
      var user = await db.get().collection("users").findOne({ _id: ObjectId(id) }).then((user) => {


        resolve({ status: true, user })
      })

    })

  },
  //---------------------------------------------banner details getting------------------------------------------------

  getbanner: () => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.BANNERS).findOne().then((data) => {

        resolve({ status: true, data })
      })


    })
  },

  //----------------------------------------------ADD ADDRESS-----------------------------------------------
  addAddress: (userId, newAddress) => {
    newAddress.user = userId


    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).insertOne(newAddress).then(() => {
        resolve()

      })
    })

    //  newAddress.addressID=ObjectId()
    //   return new Promise(async(resolve,reject)=>{

    //    var user= await db.get().collection(collection.ADDRESS_COLLECTION).findOne({user:ObjectId(userId)})

    //    if(user){
    //      db.get().collection(collection.ADDRESS_COLLECTION).updateOne({user:ObjectId(userId)},{

    //       $push:{address:newAddress

    //       }

    //   })
    //   resolve()
    //    }
    //    else
    //    {
    //      db.get().collection(collection.ADDRESS_COLLECTION).insertOne({user:ObjectId(userId),address:[newAddress]})
    //      resolve()

    //    }

    // })
  },

  getallAddress: (userId) => {

    return new Promise(async (resolve, reject) => {
      var getaddress = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: userId }).toArray()

      resolve(getaddress)


    })
  },



  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { userId: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            DeliveryAddress: 1,
            products: 1,
            date: 1

          }
        },

        {
          $lookup: {
            from: collection.product,
            localField: "products.item",
            foreignField: "_id",
            as: "orderedproducts"


          }
        },
        // {
        //   $unwind: '$orderedproducts'
        // }
      ]).toArray()



      resolve(orderDetails)

    })
  },



  GetUserForEditProfile: (id) => {
    return new Promise(async (resolve, reject) => {
      var user = await db.get().collection("users").findOne({ _id: ObjectId(id) })

      resolve(user)
    })
  },

  //--------------------------------------------------------------------------USER EDIT PAGE-------------------------------------------------------------------------------

  UpdateUserProfile: (id, userdetails) => {
    let FirstName = userdetails.firstname
    let LastName = userdetails.lastname
    let MobNo = userdetails.mobno
    var NewEmail = userdetails.email




    return new Promise(async (resolve, reject) => {


      await db.get().collection("users").updateOne({ _id: ObjectId(id) }, { $set: { firstname: FirstName, lastname: LastName, mobno: MobNo } }).then(() => {
        resolve({ status: true })
      })




    })


  },



  //-------------------------------------------------------------RAZOR PAY----------------------------------------------------
  GenerateRazorpay: (orderId, total) => {
    return new Promise((resolve, rejects) => {


      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId

      };
      instance.orders.create(options, function (err, order) {

        resolve(order)
      });


    })

  },



  veryfyPayment: (details, userID) => {



    

    return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'BOsN3sDQ7hbCZ0wqqIDFICmm')
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {

        db.get().collection(collection.CART).deleteOne({ user: ObjectId(userID) }).then(() => {
        })
        resolve()
      }


      else {
        reject()
      }
    })
  }
  ,


  channgePaymentStatus: (orderId) => {
    return new Promise((resolve, rejects) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
        {
          $set: {
            status: 'placed'
          }
        }
      ).then(() => {
        resolve()
      })

    })
  },



  DeleteAfterPaypal: (UserID) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART).deleteOne({ user: ObjectId(UserID) }).then(() => {
        resolve()
      })
    })

  },




  changePassword: (details, id) => {

    let oldPassword = details.currentpassword
    let newPassword = details.newpassword
    let confirmPassword = details.confirmpassword
   

    return new Promise(async (resolve, reject) => {

      let passwordcurrect = await db.get().collection(collection.USER).findOne({ $and: [{ _id: ObjectId(id) }, { password: oldPassword }] })
      if (passwordcurrect) {
        db.get().collection(collection.USER).updateOne({ _id: ObjectId(id) }, { $set: { password: newPassword, confirmpassword: confirmPassword } })
        resolve({ status: true })
      } else {
        resolve({ status: false })
      }
    })
  },







  DeleteAddress: (addressID) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: ObjectId(addressID) }).then(() => {
        resolve()
      })
    })
  },


  UpdateAddress: (address, AddressID) => {

    var NAME = address.name
    var MOBNO = address.ALTmobno
    var ADDRESS = address.address
    var STATE = address.state
    var PINCODE = address.pincode



    return new Promise((resolve, rejects) => {
      db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: ObjectId(AddressID) }, { $set: { name: NAME, ALTmobno: MOBNO, address: ADDRESS, pincode: PINCODE } }).then(() => {
        resolve()
      })
    })
  },



  //======================================================ADD TO WISHLIST=============================================================================

  AddToWishlist:(UserID,ProdId)=>{

    let prodObject={
            
      item:ObjectId(ProdId),
    
  }


    return new Promise(async(resolve,reject)=>{

      var UserWish= await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(UserID)})
      
      if(UserWish){


        let ProdExist=UserWish.products.findIndex(products=> products.item==ProdId)

        if(ProdExist!=-1){
          resolve({ProductExist:true})
          
        
        }else{


db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(UserID)},{$push:{products:prodObject}}).then((response)=>{

  resolve({status:true})
})

        }
        

      }else{
        let WishObj={
          user:ObjectId(UserID),
          products:[prodObject]
      }
         db.get().collection(collection.WISHLIST_COLLECTION).insertOne(WishObj).then((response)=>{
          resolve({status:true})
         })

      }
    


    })
  },


  //===================================================FOR WISHLISTCOUNT IN INDEX PAGE======================================================

  WishlistCount:(UserID)=>{
    return new Promise(async(resolve,reject)=>{
      var whiscount=0
      Wishlist= await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(UserID)})
      if(Wishlist){

        whiscount=Wishlist.products.length
        if(whiscount==0){
          resolve(0)
        }else{

          resolve(whiscount)
        }
       }
       else{
        resolve(0)
       }
    })
  },

  //==========================================FOR WISHLIST PRODUCTS FOR WISHLIST PAGE=====================================================================

  GetWishlist:(UserId)=>{
    
    return new Promise(async(resolve,reject)=>{
      var WishProd=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([{
        $match:{user:ObjectId(UserId)}
      },
      {
        $unwind:"$products"
      },
      {
        $project:{
          
          item:"$products.item"

        }
      },
      {
        $lookup:{
          from:collection.product,
          localField:"item",
          foreignField:"_id",
          as:'Wishlist'
        }
      },
      {
        $project:{
            item:1,
            
            Wishlist:{$arrayElemAt:['$Wishlist',0]}

        }
    }
    ]).toArray()

     resolve(WishProd)

    })


  },


  //===============================================================================SUB CATERGORY FILTERS=====================================================

  subcategoryFilter:(sub)=>{
    
   
    return new Promise (async(resolve,rejects)=>{
    var FilterProducts=await db.get().collection(collection.product).find({subcategory:sub}).toArray()
  
    resolve(FilterProducts)

    })
  },

  //============================================================================BRAND WISE FILTER========================================================

 
  BrandFilter:(sub)=>{
    
   
    return new Promise (async(resolve,rejects)=>{
    var FilterProducts=await db.get().collection(collection.product).find({brand:sub}).toArray()

  
    resolve(FilterProducts)

    })
  },
//======================================================================== PRICE FILTER==================================================

PriceFilter:(n)=>{
  return new Promise(async(resolve,reject)=>{
    var FilterProducts=await db.get().collection(collection.product).find().sort({price:n}).toArray()
    resolve(FilterProducts)
  })
},


//=========================================================== COLOR FILTER==============================================================


ColorFilter:(Color)=>{
  return new Promise(async(resolve,reject)=>{
    var FilterProducts= await db.get().collection(collection.product).find({color:Color}).toArray()
    resolve(FilterProducts)
  })
},





SearchProducts:(searchedItem)=>{
  console.log(searchedItem);
      return new Promise(async(resolve,reject)=>{
          let products =await db.get().collection(collection.product).aggregate([
              {
                  $match:{
                      $or:[
                          {'productname':{$regex:searchedItem, $options:'i'}},
                          {'brand':{$regex:searchedItem, $options:'i'}},
                          {'id':{$regex:searchedItem, $options:'i'}},
                      ]
                  }
              }
          ]).toArray()
         
          resolve(products)
        
      })
  },

  //========================================  TO ADD RERFERD BALANCE TO THE USER====================================================================

  AddReferdBalance:(ReferdUserID,InsertedUserID)=>{
   return new Promise(async(resolve,reject)=>{
   await  db.get().collection("users").updateOne({_id:ObjectId(ReferdUserID)},{$inc: {"wallet": 500}})
   await  db.get().collection("users").updateOne({_id:ObjectId(InsertedUserID)},{$inc: {"wallet": 500}})
   resolve()
   })
  },


  ProPic:(id)=>{
    return new Promise(async(resolve,rejects)=>{
      await db.get().collection('users').update({_id:ObjectId(id)},{$set:{ProfilePic:true}})
      resolve()
    })

  }
















}

