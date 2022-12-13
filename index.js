const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
var cors = require('cors')
require('dotenv').config()
var cloudinary = require('cloudinary').v2
const port = process.env.PORT || 5000
const ObjectId=require("mongodb").ObjectId;
const stripe = require("stripe")(process.env.PAYMENT_STRIPE_SECRETE_KEY);
const fileupload = require('express-fileupload')
const multer = require('multer')
app.use(cors())

app.use(express.json())
app.use(fileupload())

//////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lp6z6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });












async function run(){
    try{
        await client.connect();
        const database = client.db("automantia");
      const products = database.collection("products");
      const blogs = database.collection("blogs");
        const users = database.collection("users");
        const orders = database.collection("orders");
      const reviews = database.collection("reviews");
      
      
      
      app.post("/addproduct",async (req, res) => {
       
        
           const name=req.body.name;
           const price=req.body.price;
           const description=req.body.description;
           const image=req.body.image
         
           const myproduct={
             name,
             price,
             img:image,
             description
            }
            

          const query={name:name}
          const findproduct=await products.findOne(query);
          
          if(findproduct==null){
            const result=await products.insertOne(myproduct);
            res.send(result);
             
          }else{
            res.send(false)
          }
           
           });
  
      app.get("/p", (req,res) => {
          res.json({"name":"tushar"})
        })

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


     });

     app.get("/myorderByid/:id",async(req,res)=>{
      const id=req.params.id;
      
      const query={_id:ObjectId(id)}
      const result=await orders.findOne(query);
      res.send(result)
    });

    //payment method post
    app.post("/create-payment-intent", async (req, res) => {
      const paymentinfo = req.body;
     
      const amount=paymentinfo.price*100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount:amount,
        currency: "usd",
        payment_method_types: [
         "card"
          
        ]
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    });


     app.put("/orders/:id",async(req,res)=>{
        const id=req.params.id;
        console.log(id)
        const payment=req.body;
        const filter={_id:ObjectId(id)}
        console.log(payment);
        const updateDoc = {
          $set: {
            paymentdetails:payment
          },
        };
        const result = await orders.updateOne(filter,updateDoc);
        res.send(result)
        console.log(result);
     })

      //////blog section route
      
      app.post("/addblog", async (req, res) => {


        const name = req.body.name;
        const subtitle = req.body.subtitle;
        const description = req.body.description;
        const image = req.body.image

        const myblog = {
          name,
          subtitle,
          img: image,
          description
        }


        const query = { name: name }
        const findblog = await blogs.findOne(query);

        if (findblog == null) {
          const result = await blogs.insertOne(myblog);
          res.send(result);

        } else {
          res.send(false)
        }

      });

      app.get("/blogs", async (req, res) => {
        const result = await blogs.find({}).toArray();
        res.send(result)
      });


      app.get("/reviewbyid/:id", async (req, res) => {
        const myid = req.params.id;
       
        const query = { _id: ObjectId(myid) }
        const result = await reviews.findOne(query)
        res.send(result)
      });


      app.get("/blogbyid/:id", async (req, res) => {
        const myid = req.params.id;

        const query = { _id: ObjectId(myid) }
        const result = await blogs.findOne(query)
        res.send(result)
      });

        
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