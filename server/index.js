const express = require('express');
const bodyParser = require('body-parser')
const redisClient = require('./redisConnector');
const PORT = process.env.PORT || 5000;
const app = express();
const shortid = require('shortid');
const URL = "http://localhost:5000";
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(PORT, () => {
    console.log('App listening')
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin',  req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
    next();
  });

redisClient.on('connect', async function() {
    console.log('Connected to Redis');

    await createAdminUser();

    app.post('/register', async (req, res) => {
        try {
            let email = req.query.email;
            let password = req.query.password;
            let name = req.query.fullname;
            let user = generateUser(email, name, password);
            await redisClient.hmset('users', email, (JSON.stringify(user)));
            let sid = shortid.generate();
            res.cookie('sid', sid, { maxAge: 1800000 });
            users[sid] = {email, id: sid, cart: [], wishList: []};
            return res.sendStatus(200);
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/login', async (req, res) => {
        let email = req.query.email;
        let password = req.query.password;
        let rememberMe = req.query.rememberMe;

        let user = await redisClient.hget('users', email);
        if(!user) return res.send("NOT_EXISTS");
        
        let userJson = JSON.parse(user);
        if (userJson.userDetails.password != password) return res.send("INCORRECT");
        // in case user logged in correctly
        let sid = shortid.generate();
        if (rememberMe) {
            res.cookie('sid', sid);
        } else {
            // set timeout 30 min
            res.cookie('sid', sid, { maxAge: 1800000 });
        }

        let date = new Date(Date.now());
        userJson.loginActivity.push(date.toString());
        await redisClient.hmset('users', email, (JSON.stringify(userJson)));

        if(userJson.email == "admin"){
            res.cookie('admin', 'admin');
        }
        users[sid] = {email, id: sid, cart: userJson.cart, wishList: userJson.wishList};
        return res.send("OK");
    });

    app.get('/private/*', (req, res, next)=>{
        if(req.cookies.sid){
            next();
        } else {
            res.redirect('/error.html');
        }
    });

    // cart
    app.get('/private/cart', (req, res)=>{
        let cookieSid = req.cookies.sid;
        let cart = users[cookieSid].cart;
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (cart.includes(''+c.id)));
        res.send(filtered);
    });

    app.post('/private/addToCart', async (req, res)=>{
        let clothId = req.body.clothId;
        let cookieSid = req.cookies.sid;
        users[cookieSid].cart.push(clothId);
        let update = await updateCart(users[cookieSid].cart, cookieSid);
        return res.send("OK");
    });

    app.post('/private/removeFromCart', async (req, res)=>{
        let clothId = req.body.clothId;
        let cookieSid = req.cookies.sid;
        let itemIndex = users[cookieSid].cart.indexOf(clothId);
        if(itemIndex == -1) return res.send("item not found");
        users[cookieSid].cart.splice(itemIndex);
        let update = await updateCart(users[cookieSid].cart, cookieSid);
        // if(!update) res.redirect() //to login
        return res.send("OK");
    });

    // wish list
    app.get('/private/wishList', (req, res)=>{
        let cookieSid = req.cookies.sid;
        let wishList = users[cookieSid].wishList;
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (wishList.includes(''+c.id)));
        res.send(filtered);;
    });

    app.post('/private/addToWishList', async (req, res)=>{
        let clothId = req.body.clothId;
        let cookieSid = req.cookies.sid;
        users[cookieSid].wishList.push(clothId);
        let update = await updateWishList(users[cookieSid].wishList, cookieSid);
        return res.send("OK");
    });

    app.post('/private/removeFromWishList', async (req, res)=>{
        let clothId = req.body.clothId;
        let cookieSid = req.cookies.sid;
        let itemIndex = users[cookieSid].wishList.indexOf(clothId);
        if(itemIndex == -1) return res.send("item not found");
        users[cookieSid].wishList.splice(itemIndex);
        let update = await updateWishList(users[cookieSid].wishList, cookieSid);
        // if(!update) res.redirect() //to login
        return res.send("OK");
    });

    app.post('/logout', async (req, res)=>{
        res.clearCookie("sid");
        return res.sendFile(path.join(__dirname, '../client/src', 'index.html'));
    });

    app.get('/products', async (req, res)=> {
        let category = req.query.category;
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (c.category == category.toLowerCase()))
        res.send(filtered);
    })

    app.get('/search', async(req, res)=> {
        let search = req.query.search;
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (c.labels.includes(search.toLowerCase())))
        res.send(filtered);
    })


    //Aya NEW
    app.use(express.static('../client/src'));

    async function createAdminUser() {
        let email = "admin";
        let user = generateUser(email, "admin", "admin");
        await redisClient.hmset('users', email, (JSON.stringify(user)));
    }


    async function updateCart(cart, cookieSid){
        try {
            let user = await redisClient.hget('users', users[cookieSid].email);
            if(!user) return false;
            let userJson = JSON.parse(user);
            userJson.cart = cart;
            await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
        } catch (e){
            console.log(e);
        }
    }

    async function updateWishList(wishList, cookieSid){
        try {
            let user = await redisClient.hget('users', users[cookieSid].email);
            if(!user) return false;
            let userJson = JSON.parse(user);
            userJson.wishList = wishList;
            await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
        } catch (e){
            console.log(e);
        }
    }
});



redisClient.on('error', function(err){
    console.log(err);
})



function generateUser(email, name, password){
    let userDetails = {
        name,
        email,
        password
    }
    let user = {
        cart: [],
        userDetails,
        purchases: [],
        loginActivity: [],
        wishList: []
    }
    let date = new Date(Date.now());
    user.loginActivity.push(date.toString());
    return user;
}

let users = {};