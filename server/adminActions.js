let admin = {};

admin.load = function(app, redisClient, users) {
    
    app.get('/private/adminInfo', async (req, res)=> {
        try {
            let cookieSid = req.cookies.sid;
            if(users[cookieSid].userType !== 'admin') return res.redirect('/error.html');
            let usersInfo = await redisClient.hgetall('users');
            let usersInfoArr =  Object.values(usersInfo);
            let usersInfoJson = usersInfoArr.map((user) => JSON.parse(user));
            res.json(usersInfoJson);
        } catch (e) {
            console.log(e);
            return res.sendStatus(500);
        }
    });

    app.get('/checkIfAdmin', async (req, res) => {
        try {
            let cookieSid = req.cookies.sid;
            if(users[cookieSid].userType !== 'admin') return res.send('false');
            return res.send('true');
        } catch (e) {
            return res.sendStatus(500);
        }
    });
}

module.exports = admin;