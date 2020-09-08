const fs = require('fs');
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
            deleteItemsFromClothesFile(cart);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    function deleteItemsFromClothesFile(cart){
        console.log('got here');
        let clothes = require('./clothes.json');
        let filtered = clothes.filter((c) => (!cart.includes(''+c.id)));
        console.log('###: ', filtered);
        console.log('len: ', filtered.length);
        fs.writeFile('./clothes.json', JSON.stringify(filtered), 'utf8', (err) => {
            if (err) console.log(err);
            console.log('Data written to file');
        });
        return;
    }

}

module.exports = checkout;