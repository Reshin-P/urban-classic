const db=require('../config/connection')
const collection=require('../config/colections')
const {ObjectId}=require('mongodb')
const { rejects } = require('assert')
const async = require('hbs/lib/async')
const { resolve } = require('path/posix')
const { router, response } = require('../app')
const { DayContext } = require('twilio/lib/rest/bulkexports/v1/export/day')
const res = require('express/lib/response')


module.exports={

//===================================TO ADD CATEGORY OFFER================================================

AddCategoryOffer:(Offer)=>{
   
    
 
    return new Promise((resolve,rejects)=>{


     
        db.get().collection(collection.CATEGORY_OFFER_COLLECTION).insertOne(Offer).then((response)=>{
            resolve()
            
        })
    })
},

//====================================TO VIEW CATEGORY OFFER================================================

ViewSubCategotyOffer:()=>{
    return new Promise(async(resolve,reject)=>{
     var subcategory=await db.get().collection(collection.SUB_CATEGORY_OFFER_COLLECTION).find().toArray()
     resolve(subcategory)
    })
},

//============================================  TO REMOVE CATEGORY OFFER=====================================

RemoveCategoryOffer:(offerID)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_OFFER_COLLECTION).deleteOne({_id:ObjectId(offerID)}).then((d)=>{
            console.log("deleted");
            resolve()
        })
    })
},

//============================================= TO CREATE SUBCATEGORY OFFER===================================
AddSubCategoryOffer:(Offer)=>{

    console.log("///////////////////////////gfgfgfgfgfr----------------------------------------------------")

   
 return new Promise(async(resolve,reject)=>{

 var OfferExixt=await db.get().collection(collection.SUB_CATEGORY_OFFER_COLLECTION).findOne({offercategory:Offer.offercategory})
 console.log(OfferExixt);

 if(OfferExixt)
 {
     console.log("category ofer already exixt");
     resolve({exist:true})
 }else{

    db.get().collection(collection.SUB_CATEGORY_OFFER_COLLECTION).insertOne(Offer).then(async (data) => {
        let activeOffer=await db.get().collection(collection.SUB_CATEGORY_OFFER_COLLECTION).findOne({_id:data.insertedId})
        console.log("activeOfferactiveOfferactiveOfferactiveOfferactiveOfferactiveOffer",activeOffer);


        let Id = activeOffer._id
        let discount = activeOffer.discount
        let category =activeOffer.offertype
        let validity = activeOffer.validity
        console.log("--------------------------------------------------------------------------");

        console.log(Id,discount,category,validity);
        console.log("--------------------------------vk;lk------------------------------------------");

        console.log("offer not available");


 


        console.log(Offer);
          let discout=Offer.discount
          let Subcategory=Offer.offercategory

          console.log("discout",discout,"Subcategory",Subcategory);
          console.log();
         
          
       
           var Data=await db.get().collection(collection.product).find({$and:[{subcategory:Subcategory},{productoffer:false}]}).toArray()
          console.log("data start");
           console.log(Data);
           console.log("data stop");
       
          await Data.map(async(product)=>{
             let productprice=product.price
             let OfferPrice=productprice-((productprice * discout) / 100)
             OfferPrice = parseInt(OfferPrice.toFixed(2))
             let proId = product._id + ""
             await db.get().collection(collection.product).updateOne(
                 {
                     _id:ObjectId(proId)
                 },
                 {
                   $set: {
                       price: OfferPrice,
                       categoryoffer: true,
                       OldPrice: productprice,
                       bestoffer:parseInt(discout),
                       categotyofferPercentage: parseInt(discout)
                   }
                 })
       
       
                 console.log("no offer updation finished");
       
       
           })
          
           
        var Data2=await db.get().collection(collection.product).find({$and:[{subcategory:Subcategory},{productoffer:true}]}).toArray()
       console.log("data 2 start");
        console.log(Data2);
        console.log("data 2 finish");
       
        if(Data2[0]){
        
       
           await Data2.map(async(product)=>{
       
               
               let Prodid=product._id
               console.log(("tggggggggggggggggggggggggggggggggg"));
               console.log('********', Prodid, '^^^^^^^^^^^^^^^^^^^^^^^^');

              
               proOFF= await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).find({ProdId:ObjectId(Prodid)}).toArray()
               console.log('proOFF',proOFF);
               var ProdOfferPercentage=proOFF[0].discount

               console.log("ProdOfferPercentage",ProdOfferPercentage,"ProdOfferPercentage");

               console.log("discount",discount,"discount");

                 let BSToFF = ProdOfferPercentage < discount ? discount : ProdOfferPercentage
                            let prize = product.OldPrice
                            let offerrate = prize - ((prize * BSToFF) / 100)
                            console.log(`thisis bst off${BSToFF}`);

                            console.log(offerrate);
                            console.log(prize);
               console.log("offer updation finished");
               console.log(BSToFF);
               // let idfPro = product._id + ""
               // console.log(idfPro);
               offerrate= parseInt(offerrate.toFixed(2))
               console.log(offerrate);
               console.log(prize);
               db.get().collection(collection.product).updateOne(
                   {
                       _id: ObjectId(product._id)

                   },
                   {
                       $set: {
                           price: offerrate,
                           categoryoffer: true,
                           OldPrice: prize,
                           bestoffer:parseInt(BSToFF),
                           offerPercentage: parseInt(BSToFF)
                       }
                   }
               )


           
       
             
       
       
           })
         
        }else{

        }
resolve({ Exist: false })





    })
    


}


    
    
    })
   

},


//==========================================TO ADD PRODUCT OFFER=================================================

AddProductOffers:(offer)=>{
console.log(offer);
offer.ProdId=ObjectId(offer.ProdId)
offer.discount=parseInt(offer.discount)
    var bodyProdId=offer.ProdId
    console.log("idddddddddddddddddddd",bodyProdId);
    return new Promise (async(resolve,reject)=>{
        console.log("enterd to promis");
        let ProdOffExixt= await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).findOne({ProdId:bodyProdId})
    console.log("hrjhjhhj");
console.log(ProdOffExixt);
    if(ProdOffExixt){
        console.log("ProdOffExixt true");

        resolve({Exist:true})
    }
    else{
        console.log("ProdOffExixt failed");

         await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).insertOne(offer).then(async(data)=>{
        insertproOffer=await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).findOne({_id:data.insertedId})
        console.log("data insert start");
        console.log(data);
        console.log("data insert start");
        console.log(insertproOffer);
        console.log("data insert insertproOffer");
        prodDis=insertproOffer.discount
        console.log('prodDis',prodDis);


         })
         let ProdId=offer.ProdId
         console.log('ProdId'+ProdId);
         OfferProduct=await db.get().collection(collection.product).findOne({_id:ObjectId(ProdId)})

        console.log("offrred product");
         console.log(OfferProduct);
        console.log("offrred product");

        let comingPercentage=parseInt(prodDis)
        console.log("comingPercentage",comingPercentage);
        let activerpercentage=OfferProduct.categotyofferPercentage
        let bestOff = comingPercentage < activerpercentage ? activerpercentage : comingPercentage
        if(OfferProduct.categoryoffer){
            let price=OfferProduct.OldPrice
            let offerprice= price - ((price * bestOff) / 100)
            db.get().collection(collection.product).updateOne({
                _id:ObjectId(ProdId)
            },
            {
                $set: {
                    OldPrice: price,
                    price: offerprice,
                    offerPercentage: bestOff,
                    bestoffer:bestOff,
                    ProductOffer: true
                }
            }
            )

        }else{
            let price=OfferProduct.price
            let offerPrice = price - ((price * comingPercentage) / 100)
            db.get().collection(collection.product).updateOne(
                {
                    _id:ObjectId(ProdId)
                },
                {
                    $set: {
                        OldPrice: price,
                        price: offerPrice,
                        offerPercentage: bestOff,
                        bestoffer:bestOff,
                        ProductOffer: true
                    }
                })
        }
        resolve({ Exist: false })
    }
    })
},


//=======================================================TO GET ALL PRODUCT OFFERS========================================
GetAllProductOffers:()=>{
    return new Promise(async(resolve,reject)=>{
       var ProductOffer= await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).aggregate([
           {
               $project:{
                   _id:'$_id',
                   ProdId:'$ProdId',
                   discount:'$discount',
                   offertype:'$offertype',
                   validity:'$validity'
               }
           },
           {
               $lookup:{
                   from:collection.product,
                   localField:"ProdId",
                   foreignField:"_id",
                   as:"product"
               }
           },
           {
               $unwind:'$product'
           },
           {
               $project:{
                _id:1,
                ProdId:1,
                discount:1,
                offertype:1,
                validity:1,
                productname:'$product.productname'
             }
           }
       ]).toArray()
   resolve(ProductOffer)
console.log(ProductOffer);

    })
},


//============================================================== TO REMOVE SUB CATEGORY OFFER================================================

RemoveSubCategoryOffer:(OfferID,SubCategory)=>{
    console.log(SubCategory);
    return new Promise(async(resolve,reject)=>{

        item= await db.get().collection(collection.product).find({$and:[{subcategory:SubCategory},{productoffer:false}]}).toArray()
       console.log(item);
     
      await item.map(async(product)=>{
        let productPrice = product.OldPrice
        let ProdId=product._id+""
        console.log(productPrice);
        console.log(ProdId);
        await db.get().collection(collection.product).updateOne(
            {
                _id: ObjectId(ProdId)

            },
            {
                $set: {
                    price: productPrice,
                    categoryoffer: false,
                    bestoffer:null

                }
            })
 
      })


      item2=await db.get().collection(collection.product).find({$and:[{subcategory:SubCategory},{ProductOffer:true}]}).toArray()
      console.log("item2>>>>>",item2);
      if(item2[0]){
console.log("product offer true case           >>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      
      await item2.map(async (product) => {

        let ProdID = product._id
        console.log(ProdID);
        let Off = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).findOne({ProdId:ProdID})
        console.log("*5236*OffOffOffOffOff/",Off);
        let dis = parseInt(Off.discount)
        let prze = product.OldPrice
        let offerPrice = prze - ((prze * dis) / 100)
        console.log(dis," <<  llllllllllllllllllllllllllllllll >> ",dis);

        db.get().collection(collection.product).updateOne(
            {
                _id: ObjectId(product._id)

            },
            {
                $set: {
                    price: offerPrice,
                    categoryoffer: false,
                    OldPrice: prze,
                 
                    ProductOffer: true,
                    bestoffer:dis
                }
                
            }
        )


    })
}
db.get().collection(collection.SUB_CATEGORY_OFFER_COLLECTION).deleteOne({ _id: ObjectId(OfferID) }).then(async () => {

    resolve({status:true})
})



    })
},




//================================================TO REMOVE PRODUCT OFFERS=============================================================

RemoveProductOffer:(OfferID,ProdID)=>{
    console.log("Helper ethiii ethiiiiiiii");

    return new Promise(async (resolve, reject) => {

        let items = await db.get().collection(collection.product).aggregate([{
            $match: { _id: ObjectId(ProdID) }
        }]).toArray()
console.log('items',items);

        let productPrice = items[0].OldPrice

        let category = items[0].subcategory
        let proName = items[0].productname
        console.log('category',category);
        console.log('proName',proName);

        let CateofferExist = await db.get().collection(collection.SUB_CATEGORY_OFFER_COLLECTION).findOne(
            { offercategory: category }
        )

       console.log(CateofferExist,"CateofferExist");
        if (CateofferExist) {

            let percentage = parseInt(CateofferExist.discount)
            console.log(percentage);

            let price = items[0].OldPrice
            console.log(price);
            let offerPrice = price - ((price * percentage) / 100)
            console.log(offerPrice);
console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;kvgyftyfutyf");
            db.get().collection(collection.product).updateOne(
                {
                    _id: ObjectId(ProdID)
                },
                {
                    $set: {
                        OldPrice: price,
                        price: offerPrice,
                        offerPercentage: percentage,
                        offer: true,
                        bestoffer:percentage,
                        ProductOffer: false
                    }
                })

            db.get().collection(collection.PRODUCT_OFFER_COLLECTION).deleteOne({ _id: ObjectId(OfferID) }).then(() => {
                resolve()
            })
        } else {
       
            console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;kvgyftyfutyf");

            await db.get().collection(collection.product).updateOne(
                {
                    _id: ObjectId(ProdID)

                },
                {
                    $set: {
                        price: productPrice,
                        categoryoffer: false,
                        ProductOffer: false,
                        bestoffer:null

                    }
                })


            db.get().collection(collection.PRODUCT_OFFER_COLLECTION).deleteOne({ _id: ObjectId(OfferID) }).then(() => {
                resolve()
            })
        }

    })
},


//================================================ TO ADD COUPON====================================

AddCupon:(detail)=>{
    console.log(detail);
    detail.coupondicount=parseInt(detail.coupondicount)
    var CoupenCode=detail.couponcode
    var validity=detail.validity
    console.log(detail);
    console.log(CoupenCode,validity);
    return new Promise(async(resolve,reject)=>{
        console.log("fdddddddddddddddddddddddddddddddddddddddddddddddddddd");
        couponExist=await db.get().collection(collection.COUPON_COLLECTION).findOne({coupencode:CoupenCode})
        if(couponExist){
            resolve({exist:true})
        }
        else{
            db.get().collection(collection.COUPON_COLLECTION).insertOne(detail).then(()=>{
                resolve({status:true})
            })
        }

    })
},





//======================================================TO GET ALL COUPONS===================================================================


ViewCoupon:()=>{
    return new Promise(async(resolve,reject)=>{
        coupon=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        resolve(coupon)
    })
},



//================================================= TO REMOVE THE COUPON=====================================================================

RemoveCoupon:(CouponID)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(CouponID)})
        resolve({status:true})
    })
},


//=================================================== TO CHECK COUPON FROM THE VIEW CART PAGE ==============================================

CheckCoupon:(Coupon,UserID)=>{
    console.log("reached check coupon router");
    console.log(Coupon);
    var UseriD={
        userID:UserID
    }
    console.log(UseriD);
    return new Promise(async(resolve,reject)=>{
        console.log("reached prmise");


        Couponapplied=await db.get().collection("users").findOne({_id:ObjectId(UserID)})
        console.log(Couponapplied.couponamount);
        if(Couponapplied.couponamount){

            resolve({OneCouponUsed:true})
        }else{
            
       

       CouponOffer=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponcode:Coupon})
       console.log(CouponOffer);
       if(CouponOffer){
        console.log("  f                            CouponOffer.users   true"  );
        console.log("ffffffffffffffffffffffffffffffffffffffffffff",CouponOffer.users);
        if(CouponOffer.users){
            var CoupenExist = CouponOffer.users.findIndex(users => users.userID == UserID)
            console.log("find index checked");
            console.log(CoupenExist);
            console.log('CouponOffer',CouponOffer);
        if(CoupenExist!=-1){
            console.log("  f                            CouponOffer.users   user undeeeeeeeee reject aaaayyeeeee"  );

            resolve({CoupenUsed:true})
        }
        }
       else{
            console.log("  f                            CouponOffer.users   user illleeeeee  aaaayyeeeee"  );

            console.log(Coupon);
            console.log("UserID",UserID);
            console.log('Coupon.coupondicount',CouponOffer.coupondicount);
            await db.get().collection('users').updateOne({_id:ObjectId(UserID)},{$set:{couponamount:CouponOffer.coupondicount}})
           await db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:CouponOffer._id},{$push:{users:UseriD}}).then((response)=>{
                console.log("fgfgfgfgfgfgfgfggfgffgfgfg");
                CoupDis=CouponOffer.coupondicount
                resolve({Coupon:true,CoupDis})
            })
        }


          

       }else{
           resolve({NoCoupon:true})
       }
    }
    })
},


//=====================================================================TO GET USER DETAILS FOR TO SUBSTACT COUPON AMOUNT

couponDiscount:(UserID)=>{
    console.log("---------------------------------------------------------------------------------------------------------------------",UserID);
    return new Promise(async(resolve,reject)=>{
      user= await db.get().collection('users').findOne({_id:ObjectId(UserID)})
      console.log('userrrrrrrrrrrrrrrrrrrrrrrrrrrr----------------',user);
      resolve(user)
    })
},

//=================================================================TO UPDATE COUPON AMOUNT ZERO========================================

CouponDisZero:(UserID)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection('users').updateOne({_id:ObjectId(UserID)},{$unset:{couponamount:""}}).then((response)=>{
            console.log("couponamount removed from the usser"    );
            resolve()
        })
    })
}

























    
}



//=============================================
