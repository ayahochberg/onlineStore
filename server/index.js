const express = require('express');
const bodyParser = require('body-parser')
const redisClient = require('./redisConnector');
const PORT = process.env.PORT || 5000;
const app = express();
const shortid = require('shortid');
const URL = "http://localhost:5000";
const cookieParser = require('cookie-parser');
const path = require('path');
const cart = require('./cart');

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

    app.get('/', async (req, res) => {
        try {
            let cookieSid = req.cookies.sid;
            if(cookieSid) res.redirect('/private/homePage.html');
            return res.sendFile(path.join(__dirname, '../client/src', 'index.html'));
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/register', async (req, res) => {
        try {
            let email = req.query.email;
            let password = req.query.password;
            let name = req.query.fullname;
            let user = generateUser(email, name, password);
            await redisClient.hmset('users', email, (JSON.stringify(user)));
            let sid = shortid.generate();
            res.cookie('sid', sid, { maxAge: 1800000 });
            users[sid] = {email, id: sid, cart: [], wishList: [], userType: 'user'};
            return res.sendStatus(200);
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/login', async (req, res) => {
        try {
            let email = req.query.email;
            let password = req.query.password;
            let rememberMe = req.query.rememberMe;
            let user = await redisClient.hget('users', email);
            if(!user) return res.send("NOT_EXISTS");
            let userJson = JSON.parse(user);
            if (userJson.userDetails.password != password) return res.send("INCORRECT");
            // in case user logged in correctly
            let sid = shortid.generate();
            if (rememberMe === 'true') {
                // set timeout for a week
                res.cookie('sid', sid,  { maxAge: 604800000 });
            } else {
                // set timeout 30 min
                res.cookie('sid', sid, { maxAge: 1800000 });
            }
    
            let date = new Date(Date.now());
            userJson.loginActivity.push(date.toString());
            await redisClient.hmset('users', email, (JSON.stringify(userJson)));
    
            let userType;
            if(userJson.userDetails.email == "admin"){
                userType = 'admin';
            } else {
                userType = 'user';
            }
            users[sid] = {email, id: sid, cart: userJson.cart, wishList: userJson.wishList, userType};
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.get('/checkIfAdmin', async (req, res) => {
        try {
            let cookieSid = req.cookies.sid;
            if(users[cookieSid].userType !== 'admin') return res.send('false');
            return res.send('true');
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.use('/private/*', (req, res, next)=>{
        try {
            if(req.cookies.sid){
                next();
            } else {
                res.redirect('/index.html');
            }
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    // cart
    cart.load(app, redisClient, users);

    // app.get('/private/cart', (req, res)=>{
    //     try {
    //         let cookieSid = req.cookies.sid;
    //         let cart = users[cookieSid].cart;
    //         let clothes = require('./clothes.json');
    //         let filtered = clothes.filter((c) => (cart.includes(''+c.id)));
    //         res.send(filtered);
    //     } catch (e) {
    //         return res.sendStatus(500);
    //     }
    // });

    // app.post('/private/addToCart', async (req, res)=>{
    //     try {
    //         let clothId = req.body.clothId;
    //         let cookieSid = req.cookies.sid;
    //         users[cookieSid].cart.push(clothId);
    //         let update = await updateCart(users[cookieSid].cart, cookieSid);
    //         if(update === 'false') res.sendStatus(500);
    //         return res.send("OK");
    //     } catch (e) {
    //         return res.sendStatus(500);
    //     }
    // });

    // app.post('/private/removeFromCart', async (req, res)=>{
    //     try {
    //         let clothId = req.body.clothId;
    //         let cookieSid = req.cookies.sid;
    //         let itemIndex = users[cookieSid].cart.indexOf(clothId);
    //         if(itemIndex == -1) return res.send("item not found");
    //         users[cookieSid].cart.splice(itemIndex, 1);
    //         let update = await updateCart(users[cookieSid].cart, cookieSid);
    //         if(update === 'false') res.sendStatus(500);
    //         return res.send("OK");
    //     } catch (e) {
    //         return res.sendStatus(500);
    //     }
    // });

    // wish list
    app.get('/private/wishList', (req, res)=>{
        let cookieSid = req.cookies.sid;
        let wishList = users[cookieSid].wishList;
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (wishList.includes(''+c.id)));
        res.send(filtered);;
    });

    app.post('/private/addToWishList', async (req, res)=>{
        try {
            let clothId = req.body.clothId;
            let cookieSid = req.cookies.sid;
            users[cookieSid].wishList.push(clothId);
            let update = await updateWishList(users[cookieSid].wishList, cookieSid);
            if(update === 'false') res.sendStatus(500);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/private/removeFromWishList', async (req, res)=>{
        try {
            let clothId = req.body.clothId;
            let cookieSid = req.cookies.sid;
            let itemIndex = users[cookieSid].wishList.indexOf(clothId);
            if(itemIndex == -1) return res.send("item not found");
            users[cookieSid].wishList.splice(itemIndex);
            let update = await updateWishList(users[cookieSid].wishList, cookieSid);
            if(update === 'false') res.sendStatus(500);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.get('/private/adminInfo', async (req, res)=> {
        try {
            let cookieSid = req.cookies.sid;
            if(users[cookieSid].userType !== 'admin') return res.redirect('/error.html');
            let usersInfo = await redisClient.hgetall('users');
            let usersInfoArr =  Object.values(usersInfo);
            let usersInfoJson = usersInfoArr.map((user) => JSON.parse(user));
            res.json(usersInfoJson);
        } catch (e) {
            console.log(e);
            return res.sendStatus(500);
        }
    });

    app.post('/logout', async (req, res)=>{
        try {
            res.clearCookie("sid");
            return res.sendFile(path.join(__dirname, '../client/src', 'index.html'));
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.get('/products', async (req, res)=> {
        try {
            let category = req.query.category;
            let clothes = require('./clothes.json');
            if(category.toLowerCase() == "products") {
                res.send(clothes);
            }

            let filtered = clothes.filter((c) => (c.category == category.toLowerCase()))
            res.send(filtered);
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.get('/search', async(req, res)=> {
        let search = req.query.search;
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (c.labels.includes(search.toLowerCase())))
        res.send(filtered);
    })


    //app.use(express.static('./client/src')); // AYA CHANGED!!!!! works for Adi
    // app.use(express.static('/../client/src'));
     app.use(express.static('../client/src')); // works for Aya

    // app.get('/', function (req, res) {
    //     return res.sendFile(path.join(__dirname, '../client/src', 'index.html'));
    // })

    async function createAdminUser() {
        try {
            let email = "admin";
            let user = generateUser(email, "admin", "admin");
            await redisClient.hmset('users', email, (JSON.stringify(user)));
        } catch (e){
            console.log(e);
        }
    }

    // async function updateCart(cart, cookieSid){
    //     try {
    //         let user = await redisClient.hget('users', users[cookieSid].email);
    //         if(!user) return false;
    //         let userJson = JSON.parse(user);
    //         userJson.cart = cart;
    //         await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
    //         return true;
    //     } catch (e){
    //         console.log(e);
    //         return false;
    //     }
    // }

    async function updateWishList(wishList, cookieSid){
        try {
            let user = await redisClient.hget('users', users[cookieSid].email);
            if(!user) return false;
            let userJson = JSON.parse(user);
            userJson.wishList = wishList;
            await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
            return true;
        } catch (e){
            console.log(e);
            return false;
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