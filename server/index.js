const express = require('express');
const bodyParser = require('body-parser')
const redisClient = require('./redisConnector');
const PORT = process.env.PORT || 5000;
const app = express();
const shortid = require('shortid');
var cookieParser = require('cookie-parser');

app.use(cookieParser());

createAdminUser();

app.use(bodyParser.urlencoded({extended: false}));

app.listen(PORT, () => {
    console.log('App listening')
});

app.post('/register', (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let name = req.body.fullname;
        let user = generateUser(email, name, password);
        redisClient.hmset('users', email, (JSON.stringify(user)));

        return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(500);
    }
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let rememberMe = req.body['rememberMe'];
    redisClient.hget('users', email, function (err, user) {
        if(!user) return res.send("user doesn't exist");
        let userJson = JSON.parse(user);
        if (userJson.userDetails.password != password) return res.send("user name or password incorrect");
        // in case user logged in correctly
        let sid = shortid.generate();
        if (rememberMe) {
            res.cookie('sid', sid);
        } else {
            // set timeout 30 min
            res.cookie('sid', sid, { maxAge: 1800000 });
        }

        if(userJson.email == "admin"){
            res.cookie('admin', 'admin');
        }
        //users[sid] = {id:sid};
        return res.sendStatus(200);
    });
});

app.get('/private/*', (req, res, next)=>{
    if(req.cookies.sid){
        next();
    } else {
        res.redirect('/error.html');
    }
})

app.use(express.static('./client/src'));

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
        userDetails,
        cart: [],
        purchases: [],
        loginActivity: []
    }
    let date = new Date(Date.now());
    user.loginActivity.push(date.toString());
    return user;
}