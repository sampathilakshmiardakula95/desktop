const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/Note')
const User = require('./models/User')
const app = express()
app.use(express.json({extended: true}))
//app.use(express.urlencoded())

const port = 4001

mongoose.connect('mongodb://linroot:2FkgO2dxRnEvolF3@lin-6870-13586.servers.linodedb.net:27017/?authMechanism=DEFAULT&tls=true&tlsInsecure=true&tlsAllowInvalidHostnames=true&tlsAllowInvalidCertificates=true',
  function(error) {
    // Check error in initial connection. There is no 2nd param to the callback.
    if(!error){
    console.log('Successfully Connected')
    }
  });


//mongoose.connect('mongodb://127.0.0.1:27017/NOTE-APP');
//End points for HTML
app.get('/', (req, res) => {
    res.sendFile("pages/index.html",{root: __dirname})
})

app.get('/login', (req, res) => {
    res.sendFile("pages/login.html",{root: __dirname})
  })

  app.get('/signup', (req, res) => {
    res.sendFile("pages/signup.html",{root: __dirname})
  })
//End points for APIs
  app.post('/getnotes', async(req, res) => {
    let notes = await Note.find({email:req.body.email})
    const {userToken} = req.body
    res.status(200).json({success:true}, notes)
  })

  app.post('/login', (req, res) => {
    const {userToken} = req.body
    let user = User.find(req.body)
    if(!user){
      res.status(200).json({success:false,message:"No user found"})
    }
    else{
      res.status(200).json({success:true, user:{email: user.email},message:"User found"})
    }
    res.sendFile("pages/signup.html",{root: __dirname})
  })

  app.post('/signup', async (req, res) => {
    const {userToken} = req.body
    console.log(req.body)
    let user = await User.create(req.body)
    res.status(200).json({success:true,user:user})
    res.sendFile("pages/signup.html",{root: __dirname})
  })

  app.post('/addnote', async (req, res) => {
    const {userToken} = req.body
    let note = await Note.create(req.body)
    res.status(200).json({success:true,note})
   // res.sendFile("pages/signup.html",{root: __dirname})
  })

  app.post('/deletenote', (req, res) => {
    const {userToken} = req.body
    res.sendFile("pages/signup.html",{root: __dirname})
  })

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})