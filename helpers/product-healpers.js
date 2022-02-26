const db=require('..//config/connection')
const { ObjectId } = require('mongodb')
const { resolve } = require('path/posix')
const { rejects } = require('assert')
const collection=require('..//config/colections')
const async = require('hbs/lib/async')
const { response } = require('express')



module.exports={


addProduct:(productDetails)=>{
    return new Promise(async(resolve,reject)=>{
      productDetails.categoryoffer=false
      productDetails.bestoffer=false
      productDetails.productoffer=false
      productDetails.price=parseInt(productDetails.price)
      productDetails.quantity=parseInt(productDetails.quantity)
     await db.get().collection(collection.product).insertOne(productDetails).then((data)=>{
          
            var id=data.insertedId
            resolve({status:true,id})
        })
    })
},
//--------------------------------------------------------  view product-------------------------------------------------------------------------------------------


getAllProducts:()=>{
    return new Promise(async(resolve,reject)=>{
       var getproducts=await db.get().collection(collection.product).find().toArray()
      if(getproducts){
          resolve({getproducts})
      }
    })
},




deleteProduct:(id)=>{
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.product).deleteOne({ _id: ObjectId(id)}).then(()=>{
        resolve({status:true})
      })
    })
  },

  geteditproduct:(id)=>{
      return new Promise(async(resolve,reject)=>{
     var product=await db.get().collection(collection.product).findOne({ _id: ObjectId(id)})
     if(product){
         resolve({status:true,product})
     }
      })
  },

  updateProduct:(id,product)=>{
    
    return new Promise (async(resolve,reject)=>{
     
      

      await db.get().collection(collection.product).updateOne({_id: ObjectId(id)},{$set:{productname:product.productname,brand:product.brand,category:product.category,description:product.description,price:product.price,subcategory:product.subcategory,size:product.size,color:product.color}}).then(()=>{
        resolve({status:true})

      })

      
    })
  },


  //---------------------------------------------product details---------------------------------------------------------------------------------
  getproductDetails:(id)=>{
    return new Promise(async(resolve,reject)=>{
   var productDetails=await db.get().collection(collection.product).findOne({ _id: ObjectId(id)})
   if(productDetails){
       resolve({status:true,productDetails})
   }
    })
},




























    
}