const shortid = require('shortid');
let register = {};

register.load = function(app, redisClient, users, generateUser) {
    
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
            console.log(e);
            return res.sendStatus(500);
        }
    });
}

module.exports = register;