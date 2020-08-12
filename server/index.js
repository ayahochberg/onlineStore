const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const redisClient = require('./redisConnector');
const PORT = process.env.PORT || 5000;
const app = express();
const shortid = require('shortid');

createAdminUser();

app.use(bodyParser.urlencoded({extended: false}));

app.listen(PORT, () => {
    console.log('App listening')
});

app.post('/register', (req, res) => {
    try {
        let email = req.body.email;
        let userDetails = {
            name: req.body.fullname,
            email,
            password: req.body.password
        }
        let user = {
            userDetails,
            cart: [],
            purchases: [],
            loginActivity: []
        }
        let date = new Date(Date.now());
        user.loginActivity.push(date.toString());
        redisClient.hmset('users', email, (JSON.stringify(user)));
        return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(500);
    }
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let userCheck = redisClient.hget('users', email, function (err, user) {
        if(!user) return res.send("user doesn't exist");
        let userJson = JSON.parse(user);
        if (userJson.userDetails.password != password) return res.send("user name or password incorrect");
        // in case user logged in correctly
        let sid = shortid.generate();
        res.cookie('sid', sid);
        //users[sid] = {id:sid};
        return res.sendStatus(200);
    });
});

app.use(express.static('./client/src'));

function createAdminUser(){
    let email = "admin";
        let userDetails = {
            name: "admin",
            email,
            password: "admin"
        }
        let user = {
            userDetails,
            cart: [],
            purchases: [],
            loginActivity: []
        }
        let date = new Date(Date.now());
        user.loginActivity.push(date.toString());
        redisClient.hmset('users', email, (JSON.stringify(user)));
}