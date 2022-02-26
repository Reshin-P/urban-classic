const { ObjectId } = require('mongodb')
const { resolve } = require('path/posix')
const db = require('..//config/connection')
const collection = require('..//config/colections')
const { post } = require('../routes/admin/admin')
const { rejects } = require('assert')
const { response } = require('express')
const async = require('hbs/lib/async')
const { product } = require('..//config/colections')


module.exports = {



    addToCart: (prodID, UserId) => {
        let prodObject = {

            item: ObjectId(prodID),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART).findOne({ user: ObjectId(UserId) })

            if (userCart) {
                let ProdExist = userCart.products.findIndex(products => products.item == prodID)
                if (ProdExist != -1) {
                    db.get().collection(collection.CART).updateOne({ user: ObjectId(UserId), 'products.item': ObjectId(prodID) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }



                    ).then(() => {
                        resolve()
                    })
                }
                else {



                    db.get().collection(collection.CART).updateOne({ user: ObjectId(UserId) }, {

                        $push: {
                            products: prodObject

                        }

                    }).then(() => {
                        resolve({ status: true })
                    })
                }
            }
            else {

                let cartObj = {
                    user: ObjectId(UserId),
                    products: [prodObject]
                }
                db.get().collection(collection.CART).insertOne(cartObj).then((response) => {
                    resolve({ status: true })
                })
            }
        })

    },

    //========================================ADD TO CART FROM WISHLIST===========================================================


    addToCartFromWishlist: async (prodID, UserId) => {
      

        let prodObject = {

            item: ObjectId(prodID),
            quantity: 1
        }
        const response_1 = await new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART).findOne({ user: ObjectId(UserId) })

            if (userCart) {
                let ProdExist = userCart.products.findIndex(products => products.item == prodID)
                if (ProdExist != -1) {
                    db.get().collection(collection.CART).updateOne({ user: ObjectId(UserId), 'products.item': ObjectId(prodID) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }



                    ).then(() => {
                        db.get().collection(collection.WISHLIST_COLLECTION).
                            updateOne({ user: ObjectId(UserId) },
                                {
                                    $pull: { products: { item: ObjectId(prodID) } }
                                })
                   
                        resolve()
                    })
                }
                else {



                    db.get().collection(collection.CART).updateOne({ user: ObjectId(UserId) }, {
                        $push: {
                            products: prodObject
                        }
                    }).then(() => {
                        db.get().collection(collection.WISHLIST_COLLECTION).
                updateOne({ user: ObjectId(UserId) },
                    {
                        $pull: { products: { item: ObjectId(prodID) } }
                    })

                       
                        resolve({ status: true })
                    })
                }
            }
            else {

                let cartObj = {
                    user: ObjectId(UserId),
                    products: [prodObject]
                }
                db.get().collection(collection.CART).insertOne(cartObj).then((response) => {
                   
                    db.get().collection(collection.WISHLIST_COLLECTION).
                updateOne({ user: ObjectId(UserId) },
                    {
                        $pull: { products: { item: ObjectId(prodID) } }
                    })


                    resolve({ status: true })
                })
            }
        })


    },

    //=============================================== REMOVE FROM WISHLIST===========================================================================


    removeFromwishlist: (prodID, userId) => {
      
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).
                updateOne({ user: ObjectId(userId) },
                    {
                        $pull: { products: { item: ObjectId(prodID) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })


                    })
        })

    },



    //----------------------------------------------User cart products--------------------------------------------------------

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            // let CartItems=0
            CartItems = await db.get().collection(collection.CART).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.product,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        total: { $multiply: [ { $arrayElemAt: ['$product.price', 0] },'$quantity' ]  },


                    }
                }
            ]).toArray()
        



            resolve(CartItems)





        })

    },

    //---------------------------------------------------------------GET USER CART COUNT-----------------------------------------------------------------------------------------------------


    cartCount: (userid) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            var cart = await db.get().collection(collection.CART).findOne({ user: ObjectId(userid) })

            if (cart) {

                count = cart.products.length


            }
            resolve(count)
        })
    },



    ChangeProductQuantity: (detail) => {



        detail.count = parseInt(detail.count)
        detail.quantity = parseInt(detail.quantity)

        return new Promise((resolve, reject) => {
            if (detail.count == -1 && detail.quantity == 1) {
                db.get().collection(collection.CART).
                    updateOne({ _id: ObjectId(detail.cart) },
                        {
                            $pull: { products: { item: ObjectId(detail.product) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })

                        })
            } else {
                db.get().collection(collection.CART).
                    updateOne({ _id: ObjectId(detail.cart), 'products.item': ObjectId(detail.product) },
                        {
                            $inc: { 'products.$.quantity': detail.count }
                        }).then((response) => {

                            resolve({ status: true })

                        })
            }
        })
    },




    //--------------------------------------------------------Remove From The Cart________________________________________________________

    removeFromCart: (detail) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART).
                updateOne({ _id: ObjectId(detail.cart) },
                    {
                        $pull: { products: { item: ObjectId(detail.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })

                    })
        })

    },
    //----------------------------------------------------------------TO GET TOTAL AMOUNT FOR THE CHECKOUT PAGE--------------------------------------------

    getTotalAmount: (userId) => {


        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.product,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                }
                ,
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }

                    }
                }

            ]).toArray()
            if (total.length == 0) {
                resolve("0")

            } else {
                resolve(total[0].total)

            }









        })

    },

    //=========================================================TO GET SUB TOTAL===================================================================================
    // getSubTotal:(userId)=>{


    //     return new Promise(async(resolve,reject)=>{

    //       let  total=await db.get().collection(collection.CART).aggregate([
    //              {
    //                  $match:{user:ObjectId(userId)}
    //              },
    //              {
    //                  $unwind:'$products'
    //              },
    //              {
    //                  $project:{
    //                      item:'$products.item',
    //                      quantity:'$products.quantity'
    //                  }
    //              },
    //              {
    //                    $lookup:{
    //                        from:collection.product,
    //                        localField:'item',
    //                        foreignField:'_id',
    //                        as:'product'
    //                    }
    //              },{
    //                  $project:{
    //                      item:1,
    //                      quantity:1,
    //                      product:{$arrayElemAt:['$product',0]}

    //                  }
    //             }
    //             ,
    //              {
    //                  $group:{
    //                      _id:null,
    //                      total:{$sum:{$multiply:['$quantity','$product.price']}}

    //                  }
    //              }

    //         ]).toArray()
    //         if(total.length==0){
    //             resolve("0")

    //         }else{
    //             resolve(total[0].total)

    //         }









    //     })

    // },





    //----------------------------------------------------------------TO GET TOTAL PRODUCT NAME & PRODUCT PRICE THE CHECKOUT PAGE--------------------------------------------


    getProductsForCheckout: (userId) => {
        return new Promise(async (resolve, reject) => {
            let checkProduct = await db.get().collection(collection.CART).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.product,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                }


            ]).toArray()
         

            resolve(checkProduct)


        })
    },

    placeOrder: (order, products, total) => {




        return new Promise((resolve, reject) => {
            let status
            for (i = 0; i < products.length; i++) {
                products[i].status = order.payementmethod === 'COD' ? 'placed' : 'pending'
                products[i].cancel = false

            }





            let orderObj = {
                DeliveryAddress: {
                    name: order.name,
                    mobno: order.ALTmobno,
                    address: order.address,
                    state: order.state,
                    pincode: order.pincode,
                    date: new Date()
                },
                userId: ObjectId(order.user),
                payementmethod: order.payementmethod,
                totalamount: total,
                products: products,


            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                if (order.payementmethod == 'COD') {
                    db.get().collection(collection.CART).deleteOne({ user: ObjectId(order.user) })

                }




                resolve(response.insertedId)
            })

        })


    },




    getCartProductlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART).findOne({ user: ObjectId(userId) })
console.log(cart.products.length);
         if(cart.products.length==0){
resolve(0)
         }
         else{
            resolve(cart.products)
         }
            
        })
    },

    GetSelectAddress: (Address) => {


        return new Promise(async (resolve, reject) => {
            let SelectAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: ObjectId(Address) })



            resolve(SelectAddress)


        })


    }






















}

