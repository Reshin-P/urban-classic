const mongoClient=require("mongodb").MongoClient
const state={

db:null
}
module.exports.connect=function(done){
    // const url='mongodb://localhost:27017'
    // const url='mongodb+srv://cluster0.7cjmongodb+srv://reshin:Reshi1@unnihc@cluster0.7cjt8.mongodb.net/Shopping-cart?retryWrites=true&w=majorityt8.mongodb.net/Shopping-cart'
  const url='mongodb+srv://reshin:qwertyuiop@cluster0.7cjt8.mongodb.net/Shopping-cart?retryWrites=true&w=majority'
    const dbname="Shopping-cart"


mongoClient.connect(url,(err,data)=>{
    if(err)
        return done(err)
        state.db=data.db(dbname)
        done()
    })

   
}

module.exports.get=function(){
    return state.db
}