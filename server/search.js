let search = {};

search.load = function(app) {
    
    app.get('/search', async(req, res)=> {
        try {
            let search = req.query.search;
            let clothes = require('./clothes.json');
            let filtered = clothes.filter((c) => (c.labels.includes(search.toLowerCase())))
            res.send(filtered);
        } catch (e) {
            return res.sendStatus(500);
        }
        
    });
}

module.exports = search;