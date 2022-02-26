const { rejects } = require('assert')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const { resolve } = require('path/posix')
const db = require('..//config/connection')
const collection = require('..//config/colections')


module.exports = {


  viewuser: () => {
    return new Promise(async (resolve, rejects) => {
      var viewuser = await db.get().collection('users').find().toArray()
      if (viewuser) {
        resolve({ viewuser, status: true })
      }
      else {
        reject({ status: false })
      }
    })
  }, block: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection("users").updateOne({ _id: ObjectId(id) }, { $set: { block: true } }).then((data) => {
        resolve({ status: true })
      })
    })
  },




  unblock: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection("users").updateOne({ _id: ObjectId(id) }, { $set: { block: false } }).then((data) => {
        resolve({ status: true })
      })
    })
  },


  addCategory: (category) => {

    return new Promise(async (resolve, reject) => {
      await db.get().collection('category').insertOne(category).then(() => {
        resolve({ status: true })

      })
    })
  },

  viewCategory: () => {

    return new Promise(async (resolve, reject) => {
      var category = await db.get().collection('category').find().toArray()

      if (category) {

        resolve({ status: true, category })
      }
      else {
        resolve({ status: false })
      }
    })

  },


  getCategoryEdit: (id) => {

    return new Promise(async (resolve, reject) => {
      var getcategory = await db.get().collection('category').findOne({ _id: ObjectId(id) })

      if (getcategory) {
        resolve({ status: true, getcategory })
      }
      else {
        resolve({ status: false })
      }

    })
  },

  updateCategory: (id, categoryDetails) => {

    return new Promise(async (resolve, reject) => {

      categoryname = categoryDetails.category


      await db.get().collection('category').updateOne({ _id: ObjectId(id) }, { $set: { category: categoryname } }).then(() => {
        resolve({ status: true })

      })


    })
  },



  deleteCategoty: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection('category').deleteOne({ _id: ObjectId(id) }).then(() => {
        resolve({ status: true })
      })
    })
  },


  addSubCategory: (SubCategory) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection('subcategory').insertOne(SubCategory).then(() => {
        resolve({ status: true })
      })
    })

  },

  viewSubCategory: () => {
    return new Promise(async (resolve, reject) => {
      var subcategory = await db.get().collection('subcategory').find().toArray()

      if (subcategory) {

        resolve({ status: true, subcategory })
      }
    })
  },

  updateSubCategory: (subcategoryName, newsubcategory) => {

    return new Promise(async (resolve, reject) => {
      await db.get().collection('subcategory').updateOne({ subcategory: subcategoryName }, { $set: { subcategory: newsubcategory.subcategory } }).then(() => {
        resolve({ status: true })
      })
    })
  },



  deleteSubCategory: (subcategoryName) => {


    return new Promise(async (resolve, reject) => {
      db.get().collection('subcategory').deleteOne({ subcategory: subcategoryName }).then(() => {
        resolve({ status: true })
      })
    })
  },

  //-------------------------------------------------------------update banners  post----------------------------------------------------------------------------------------------------

  UpdateBanners: (id, banner) => {
    var bannerheading = banner.heading
    var mainheading = banner.mainheading
    var description = banner.description

    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.BANNERS).updateOne({ _id: ObjectId(id) }, { $set: { heading: bannerheading, mainheading: mainheading, description: description } }).then((data) => {

        resolve({ status: true, id })
      }).catch((err) => {
      })
    })
  },


  //     GetAllOrdersForAdmin:()=>{
  //       return new Promise(async(resolve,reject)=>{
  //       var AllOrders= await  db.get().collection(collection.ORDER_COLLECTION).find().toArray()
  //      resolve(AllOrders)
  //       })
  //     },

  //     GetAllorders:()=>{
  //       return new Promise(async(resolve,reject)=>{
  //         var orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
  //           $unwind:'$products'
  //         },
  //       {
  //         $project:{
  //           product:'$products.item',
  //           quantity:'$products.quantity',
  //           status:'$products.status',
  //           cancel:'$products.cancel'

  //         }
  //       }]).toArray()
  //       resolve(orders)
  // // console.log("///////////////////////////////////////////////////////////////////////////////////////////");
  // //       console.log(orders);
  // //       console.log("///////////////////////////////////////////////////////////////////////////////////////////");

  //       })
  // },
  getOrders: () => {

    return new Promise(async (resolve, reject) => {
      let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

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
        {
          $unwind: '$orderedproducts'
        }
      ]).toArray()



      resolve(orderDetails)


    })

  },

  changeStaus: (order, proId, newstatus) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).updateOne(
        {
          _id: ObjectId(order), "products.item": ObjectId(proId)
        },
        {
          $set: {
            "products.$.status": newstatus


          }
        }
      )

      resolve()
    })

  },
  userProductcancel: (order, proId, newstatus) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).updateOne(
        {
          _id: ObjectId(order), "products.item": ObjectId(proId)
        },
        {
          $set: {
            "products.$.status": newstatus,
            "products.$.cancel": true


          }
        }
      ).then(() => {
        resolve({ status: true })

      })


    })

  },



  UserCount: () => {
    return new Promise(async (resolve, rejects) => {
      var count = await db.get().collection("users").find().count()

      resolve(count)
    })
  },

  TotalSale: () => {

    return new Promise(async (resolve, rejects) => {
      var total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group:
          {
            _id: null,

            totalAmount: { $sum: "$totalamount" },

          }
        }
      ]).toArray()
if(total[0].totalAmount){
  resolve(total[0].totalAmount)
}
else{
  resolve(0)
}
      
    })

  },



  DelveardShipment: () => {
    return new Promise(async (resolve, reject) => {
      Deliverd = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $unwind: "$products"
        },
        {
          $match: { "products.status": "delivered" }
        }
      ]).toArray()

      deliverdCount = Deliverd.length
      resolve(deliverdCount)


    })
  },


  //=================================================================MONTHLY REPORT =============================================================
  MonthlyReport: (month) => {

   
    var today = new Date()
    
    var start=today.getFullYear()+"-"+((month ) < 10 ? "0" + (month ) : (month ))+"-"+"01"
    var end=today.getFullYear()+"-"+((month ) < 10 ? "0" + (month) : (month))+"-"+"31"


 
    return new Promise(async (resolve, reject) => {
      let test = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            $and: [
              {  'DeliveryAddress.date': { $gte: new Date(start) } },
              {  'DeliveryAddress.date': { $lte:new Date( end ) } }
            ]
          },
        },
        {
                  $unwind:"$products"
        },
        {
          $group: { _id: null, totalQuantity: { $sum: "$products.quantity" } }
        }
      ]).toArray();
     

      resolve(test.length > 0 ? test[0].totalQuantity : 0);
    })
  },



  MonthlyReporss: (start, end) => {
  

    return new Promise(async (resolve, reject) => {
      sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $match: {
            'DeliveryAddress.date': {
              $lte: new Date(end),
              $gte: new Date(start)
            }
          }
        },
        {
          $unwind: "$products",
        },

        {
          $lookup: {
            from: collection.product,
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: "$product"
        },

        {
          $group: {
            _id: "$product",
            salesQuantity: { $sum: "$products.quantity" },
          }
        },
        {
          $project: {
            _id: 1,
           
            salesQuantity:1,
            totalSale: {
              $multiply: ["$_id.price", "$salesQuantity"]
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$$ROOT", "$_id"]
            }
          }
        },

      ]).toArray()
      resolve(sales)



    })

  },

  //=================================================TO GET PRODUCT REPORT==============================
  ProductStockReport:()=>{
    return new Promise(async(resolve,rejects)=>{
    var STOCK=await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
       
    
      {
        $unwind: "$products",
      },

      {
        $lookup: {
          from: collection.product,
          localField: 'products.item',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: "$product"
      },

      {
        $group: {
          _id: "$product",
          salesQuantity: { $sum: "$products.quantity" },
        }
      },
      {
        $project: {
          _id: 1,
         
          salesQuantity:1,
          totalSale: {
            $multiply: ["$_id.price", "$salesQuantity"]
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$_id"]
          }
        }
      },
      ]).toArray()
      resolve(STOCK)


    })
  },


  //================================= FOR THE PAYMENT METHODE GRAPH=============================================
  PaymentGraph:()=>{
    return new Promise(async(resolve,rejects)=>{
     var chart= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group:{
            
            _id:'$payementmethod',
            count:{$sum:1}

          }
        }
      ]).toArray()

     


      resolve(chart)
      


    })
  },

  //================================================= subCategoryChart==============================

  subCategoryChart:()=>{
    return new Promise(async(resolve,rejects)=>{
      var val=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item'
          }
        },
        {
           $lookup:{
            from: collection.product,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
           }
        },
        {
          $unwind:'$product'
        },
        {
          $group:{
            
            _id:'$product.subcategory',
            count:{$sum:1}

          }
        }
      ]).toArray()
      resolve(val)

    })
  },

  //==================================== USERS LIST FOR ADMIN==============================
  UsersForAdmin:()=>{
    return new Promise(async(resolve,reject)=>{
      var usersList=await db.get().collection("users").find().limit(5).toArray( )
      resolve(usersList)
    })
  } 





}

