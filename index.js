const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
var cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const ObjectId=require("mongodb").ObjectId;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lp6z6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db("automantia");
        const products = database.collection("products");
        const users = database.collection("users");
        const orders = database.collection("orders");
        const reviews = database.collection("reviews");
       
        app.post("/addproduct",async(req,res)=>{
          const productname=req.body.name;
          const query={name:productname}
          const findproduct=await products.findOne(query);
          
          if(findproduct==null){
            const result=await products.insertOne(req.body);
            res.send(result);
             
          }else{
            res.send(false)
          }
         });

        app.get("/products",async(req,res)=>{
            const result=await products.find({}).toArray();
            res.send(result)
        });

        app.get("/product/:id",async(req,res)=>{
          const id=req.params.id;
          const query={_id:ObjectId(id)}
          const result=await products.findOne(query);
          res.send(result)
        });

        app.post("/saveuser",async(req,res)=>{

           const result=await users.insertOne(req.body);
           console.log(result);
        });

        app.post("/ordersave",async(req,res)=>{
           const result=await orders.insertOne(req.body);
           res.send(result);

        });

        app.get("/myorders",async(req,res)=>{
          const myemail=req.query.email;
          
          const query={email:myemail}
          const result=await orders.find(query).toArray();
          res.send(result)
        });

        app.delete("/deleteorder/:id",async(req,res)=>{

            const id=req.params.id

            const query = { _id:ObjectId(id) };
            const result = await orders.deleteOne(query);
            if (result.deletedCount === 1) {
              res.send("Successfully deleted one item.");
            } else {
              res.send("No documents matched the query. Deleted 0 item.");
            }
        })

        app.post("/savereview",async(req,res)=>{
          const result=await reviews.insertOne(req.body);
          res.send(result);
        })

        app.get("/reviews",async(req,res)=>{
          const result=await reviews.find({}).toArray();
          res.send(result)
        })

        app.get("/allorders",async(req,res)=>{
          const result=await orders.find({}).toArray();
          res.send(result)
        })

        app.put("/changestatus/:id",async(req,res)=>{

          const id=req.params.id;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              status:"Shipped"
            },
           };
          const result = await orders.updateOne(filter, updateDoc, options);
          if (result.matchedCount === 1) {
            res.send("Successfully change order status.");
          } else {
            res.send("Order status change not success");
          }
      });


      app.delete("/deleteproduct/:id",async(req,res)=>{

        const id=req.params.id
        const query = { _id:ObjectId(id) };
        const result = await products.deleteOne(query);
        if (result.deletedCount === 1) {
          res.send("product deleted successfully");
        } else {
          res.send("product not deleted");
        }
    });



    app.put("/makeadmin/:email",async(req,res)=>{

      const email=req.params.email;
      const filter = { email: email };
      const result=await users.findOne(filter);
     if(result==null){
        res.send(false);
      }else{
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            role:"admin"
          },
         };
        const result = await users.updateOne(filter, updateDoc, options);
        if (result.matchedCount === 1) {
          res.send("Admin created successfully");
        }
      }
     
     });

     app.get("/userfind/:email",async(req,res)=>{
            
           const email=req.params.email;
           const filter = { email: email };
           const result=await users.findOne(filter);
           res.send(result)


     })




        
    }finally{

    }

}



run().catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`server running listening at http://localhost:${port}`)
})