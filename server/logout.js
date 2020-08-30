
const path = require('path');
let logout = {};

logout.load = function(app) {
    app.post('/logout', async (req, res)=>{
        try {
            res.clearCookie("sid");
            return res.sendFile(path.join(__dirname, '../client/src', 'index.html'));
        } catch (e) {
            console.log(e);
            return res.sendStatus(500);
        }
    });
}

module.exports = logout;