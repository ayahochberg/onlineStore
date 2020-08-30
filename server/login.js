const shortid = require('shortid');
let login = {};

login.load = function(app, redisClient, users, generateUser) {
    
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
            console.log(e);
            return res.sendStatus(500);
        }
    });

}

module.exports = login;