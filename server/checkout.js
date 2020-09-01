let checkout = {};

checkout.load = function(app, redisClient, users) {

    app.get('/private/checkout', async (req, res)=>{
        try {
            let cookieSid = req.cookies.sid;
            let cart = users[cookieSid].cart;
            let user = await redisClient.hget('users', users[cookieSid].email);
            if(!user) return res.sendStatus(404);
            let userJson = JSON.parse(user);
            userJson.purchases = userJson.purchases.concat(cart); 
            users[cookieSid].cart = [];
            userJson.cart = [];
            await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

}

module.exports = checkout;