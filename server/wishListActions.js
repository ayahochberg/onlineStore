let wishList = {};

wishList.load = function(app, redisClient, users) {
    
    app.get('/private/wishList', (req, res)=>{
        try {
            let cookieSid = req.cookies.sid;
            let wishList = users[cookieSid].wishList;
            let clothes = require('./clothes.json');
            let filtered = clothes.filter((c) => (wishList.includes(''+c.id)));
            res.send(filtered);
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/private/addToWishList', async (req, res)=>{
        try {
            let clothId = req.body.clothId;
            let cookieSid = req.cookies.sid;
            users[cookieSid].wishList.push(clothId);
            let update = await updateWishList(users[cookieSid].wishList, cookieSid);
            if(update === 'false') res.sendStatus(500);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });

    app.post('/private/removeFromWishList', async (req, res)=>{
        try {
            let clothId = req.body.clothId;
            let cookieSid = req.cookies.sid;
            let itemIndex = users[cookieSid].wishList.indexOf(clothId);
            if(itemIndex == -1) return res.send("item not found");
            users[cookieSid].wishList.splice(itemIndex);
            let update = await updateWishList(users[cookieSid].wishList, cookieSid);
            if(update === 'false') res.sendStatus(500);
            return res.send("OK");
        } catch (e) {
            return res.sendStatus(500);
        }
    });


    async function updateWishList(wishList, cookieSid){
        try {
            let user = await redisClient.hget('users', users[cookieSid].email);
            if(!user) return false;
            let userJson = JSON.parse(user);
            userJson.wishList = wishList;
            await redisClient.hmset('users', users[cookieSid].email, (JSON.stringify(userJson)));
            return true;
        } catch (e){
            console.log(e);
            return false;
        }
    }

}

module.exports = wishList;