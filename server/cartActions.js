let cart = {};

cart.load = function(app, redisClient, users) {

    app.get('/private/cart', (req, res)=>{
        try {
            let cookieSid = req.cookies.sid;
            let cart = users[cookieSid].cart;
            let clothes = require('./clothes.json');
            let filtered = clothes.filter((c) => (cart.includes(''+c.id)));
            res.send(filtered);
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/private/addToCart', async (req, res)=>{
        try {
            let clothId = req.body.clothId;
            let cloth = checkIfClothExist(clothId);
            if(!cloth) return res.send("Not a valid item id");
            
            let cookieSid = req.cookies.sid;
            users[cookieSid].cart.push(clothId);
            let update = await updateCart(users[cookieSid].cart, cookieSid);
            if(update === 'false') res.sendStatus(500);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/private/removeFromCart', async (req, res)=>{
        try {
            let clothId = req.body.clothId;
            let cookieSid = req.cookies.sid;
            let itemIndex = users[cookieSid].cart.indexOf(clothId);
            if(itemIndex == -1) return res.send("item not found");
            users[cookieSid].cart.splice(itemIndex, 1);
            let update = await updateCart(users[cookieSid].cart, cookieSid);
            if(update === 'false') res.sendStatus(500);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    
    async function updateCart(cart, cookieSid){
        try {
            let user = await redisClient.hget('users', users[cookieSid].email);
            if(!user) return false;
            let userJson = JSON.parse(user);
            userJson.cart = cart;
            await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
            return true;
        } catch (e){
            console.log(e);
            return false;
        }
    }

    function checkIfClothExist(clothId){
        let clothes = require('./clothes.json');
        let clothItem = clothes.find((cloth) => ''+cloth.id === clothId);
        return clothItem;
    }

}

module.exports = cart;