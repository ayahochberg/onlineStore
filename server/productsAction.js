
let productsAction = {};

productsAction.load = function(app) {
    
    app.get('/products', async (req, res)=> {
        try {
            let category = req.query.category;
            let clothes = require('./clothes.json');
            if(category.toLowerCase() == "products") {
               return res.send(clothes);
            }

            let filtered = clothes.filter((c) => (c.category == category.toLowerCase()))
            return res.send(filtered);
        } catch (e) {
            return res.sendStatus(500);
        }
    });
}

module.exports = productsAction;