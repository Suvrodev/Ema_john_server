const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');
const cors = require('cors');
const we=require('./Data/We.json')


const app=express();
const port=process.env.PROT || 7000


require('dotenv').config()

//MiddleWare
app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send(`Ema-John server is running on port: ${port} `)
})

app.get('/we',(req,res)=>{
    console.log('Wee All');
    res.send(we)
})

app.get('/we/:id',(req,res)=>{
    const id=req.params.id;
    console.log(id);
    const targetId=we.find(w=>w.id==id)
    res.send(targetId)
})




/////MongoDB work start




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jokwhaf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    ///Project work start
    const productCollection=client.db('emaJohnDB').collection('products')

    // app.get('/products', async(req,res)=>{
    //     console.log('All Products');
    //     const result=await productCollection.find().toArray()
    //     res.send(result)
    // })

    app.get('/products', async(req,res)=>{
        console.log(req.query);
        const page=parseInt(req.query.page) || 2
        const limit=parseInt(req.query.limit) || 10
        const skip=page*limit
        console.log(page);
        console.log(limit);
        console.log('All Products');
        const result= await productCollection.find().skip(skip).limit(limit).toArray()
        res.send(result)
    })

    app.get('/totalproducts',async(req,res)=>{
        const result=await productCollection.estimatedDocumentCount();
        res.send({totalProducts: result})
    })

    app.post('/productsbyid', async(req,res)=>{
        const ids=req.body;
        const objectIds=ids.map(id=>new ObjectId(id))

        const query ={ _id: {$in: objectIds }}
        const result= await productCollection.find(query).toArray()
       // console.log('products by ID: ',ids);
        res.send(result)
    })


    ///Project work end



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


/////MongoDB work end



app.listen(port,()=>{
    console.log(`Ema-John server is running on port: ${port}`);
})