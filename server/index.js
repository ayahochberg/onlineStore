const express = require('express');
const bodyParser = require('body-parser')
const redisClient = require('./redisConnector');
const PORT = process.env.PORT || 5000;
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const cart = require('./cartActions');
const wishList = require('./wishListActions');
const adminActions = require('./adminActions');
const search = require('./search');
const login = require('./login');
const register = require('./register');
const products = require('./productsAction');
const logout = require('./logout');
const checkout = require('./checkout');

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

    register.load(app, redisClient, users, generateUser);

    login.load(app, redisClient, users);

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

    cart.load(app, redisClient, users);

    wishList.load(app, redisClient, users);

    adminActions.load(app, redisClient, users);
    
    checkout.load(app, redisClient, users);

    logout.load(app);

    products.load(app);

    search.load(app);

    app.use(express.static('./client/src')); // AYA CHANGED!!!!! works for Adi
    //   app.use(express.static('../client/src')); // works for Aya

    async function createAdminUser() {
        try {
            let email = "admin";
            let user = generateUser(email, "admin", "admin");
            await redisClient.hmset('users', email, (JSON.stringify(user)));
        } catch (e){
            console.log(e);
        }
    }
});

redisClient.on('error', function(err){
    console.log(err);
})

const generateUser = function (email, name, password){
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