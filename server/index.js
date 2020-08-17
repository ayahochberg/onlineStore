const express = require('express');
const bodyParser = require('body-parser')
const redisClient = require('./redisConnector');
const PORT = process.env.PORT || 5000;
const app = express();
const shortid = require('shortid');
const URL = "http://localhost:5000";
const cookieParser = require('cookie-parser');

app.use(cookieParser());

createAdminUser();

app.use(bodyParser.urlencoded({extended: false}));
app.use('/src', express.static('./client/src'));

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

app.post('/register', (req, res) => {
    try {
        let email = req.query.email;
        let password = req.query.password;
        let name = req.query.fullname;
        let user = generateUser(email, name, password);
        redisClient.hmset('users', email, (JSON.stringify(user)));
        return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(500);
    }
});

app.post('/login', (req, res) => {
    let email = req.query.email;
    let password = req.query.password;
    let rememberMe = req.query.rememberMe;

    redisClient.hget('users', email, function (err, user) {
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
        redisClient.hmset('users', email, (JSON.stringify(userJson)));

        if(userJson.email == "admin"){
            res.cookie('admin', 'admin');
        }
        users[sid] = {id: sid, cart: userJson.cart};
        return res.send("OK");
    });
});

app.get('/private/*', (req, res, next)=>{
    if(req.cookies.sid){
        next();
    } else {
        res.redirect('/error.html');
    }
})

function createAdminUser(){
    let email = "admin";
    let user = generateUser(email, "admin", "admin");
    redisClient.hmset('users', email, (JSON.stringify(user)));
}

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
        loginActivity: []
    }
    let date = new Date(Date.now());
    user.loginActivity.push(date.toString());
    return user;
}

let users = {};