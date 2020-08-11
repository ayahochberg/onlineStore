const express = require('express');
const redisClient = require('./redisConnector.js');
const PORT = process.env.PORT || 5000;
const app = express();
const shortid = require('shortid');

app.listen(PORT, () => {
    console.log('App listening')
});

app.post('/register', (req, res) => {
    let email = req.query.email;
    let userDetails = {
        name: req.query.fullname,
        email,
        password: req.query.password
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
});

app.post('/login', (req, res) => {
    let email = req.query.email;
    let password = req.query.password;
    console.log('email: ', email);
    console.log('password: ', password);
    let flag = checkUserPassword(email, password);
    console.log("flag ", flag);
    if(flag){
        let sid = shortid.generate();
        res.cookie('sid', sid);
        //users[sid] = {id:sid};
        return res.sendStatus(200);
    } 
    // handle user not in , not permit
    return res.send("user name or password incorrect");
});

function checkUserPassword(email, password){
    let userCheck = redisClient.hget('users', email, function (err, user) {
        console.log("user1 ", user);
        if(!user) return false;
        let userCheckJson = JSON.parse(userCheck);
        console.log("userCheckJson.password ", userCheckJson.userDetails.password);
        if (userCheckJson.userDetails.password != password) return false;
        return true;
    });
}

// todo needed?
// users = {};


// redisClient.on('connect', () => {
//     check();
// });

// check
// async function check(){
//     let id = uuid.v4();
//     let user = {
//         id: id,
//         username: "adi",
//         name: "adi",
//         password: "222"
//     }
//     redisClient.hset('users', id, JSON.stringify(user));
//     let user1 = redisClient.hget('users', id);
//     console.log("id: ", id);
//     console.log("user1: ", user1);
// }


// check();
