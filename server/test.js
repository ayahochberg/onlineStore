const fetch = require('node-fetch');
const URL = "http://localhost:5000";
const success = "OK";
const fail = "FAILURE";

  async function test() {
    try {
        // register
        let userEmail = "user1@gmail.com";
        let fullName = "user1";
        let password = "123456";
        console.log("Try to register user1");
        let res = await fetch(URL + `/register?email=${userEmail}&fullname=${fullName}&password=${password}`, {method: 'POST'});
        let ans = await res.text();
        if(ans == "OK") console.log(success);
        else console.log(fail);

        // login
        console.log("Try to login user1");
        res = await fetch(URL + `/login?email=${userEmail}&password=${password}`, {method: 'POST'});
        ans = await res.text();
        let cookie = res.headers.get('set-cookie').split(';')[0];
        console.log("res cookie:", cookie);
        if(ans == "OK") console.log(success);
        else console.log(fail);

        // login right user, wrong password
        console.log("Try to login user with wrong password");
        let badPass = "12";
        res = await fetch(URL + `/login?email=${userEmail}&password=${badPass}`, {method: 'POST'});
        ans = await res.text();
        console.log("res body:", ans);
        if(ans == "INCORRECT") console.log(success);
        else console.log(fail);
        
        // login wrong user
        let badUserEmail = "wrongUser@gmail.com";
        console.log("Try to login wrong user");
        res = await fetch(URL + `/login?email=${badUserEmail}&password=${password}`, {method: 'POST'});
        let body = await res.text();
        console.log("res body:", body);
        if(body == "NOT_EXISTS") console.log(success);
        else console.log(fail);

        // add to cart 
        let clothId = 3;
        console.log("Try to add to cart an item");
        res = await testAddToCart(clothId, cookie);
        if(res === success) console.log(success);
        else console.log(fail);

        clothId = 4;
        console.log("Try to add to cart another item");
        res = await testAddToCart(clothId, cookie);
        if(res === success) console.log(success);
        else console.log(fail);

        console.log("Try to add to cart an item, with wrong input");
        res = await testAddToCart('wrong input', cookie);
        if(res === false) console.log(success);
        else console.log(fail);

        // remove from cart
        console.log("Try to remove item from cart");
        data = new URLSearchParams();
        data.append("clothId", clothId)
        res = await fetch(URL + '/private/removeFromCart', {
          method: 'POST', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }, 
          body: data
        });

        body = await res.text();
        console.log("res body:", body);
        if(body == "OK") {
          let itemInCart = await checkIfItemExist(cookie, clothId, 'cart');
          if(itemInCart === false) console.log(success);
          else console.log(fail);
        }
        else console.log(fail);

        // add to wish list
        clothId = 4;
        console.log("Try to add to wish list an item");
        data = new URLSearchParams();
        data.append("clothId", clothId)
        res = await fetch(URL + '/private/addToWishList', {
          method: 'POST', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }, 
          body: data
        });

        body = await res.text();
        console.log("res body:", body);
        if(body === "OK") {
          let itemInCart = await checkIfItemExist(cookie, clothId, 'wishList');
          if(itemInCart === true) console.log(success);
          else console.log(fail);
        }
        else console.log(fail + " didn't add to wish list : " + body);

        // remove from wish list
        console.log("Try to remove item from wish list");
        data = new URLSearchParams();
        data.append("clothId", clothId)
        res = await fetch(URL + '/private/removeFromWishList', {
          method: 'POST', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }, 
          body: data
        });

        body = await res.text();
        console.log("res body:", body);
        if(body == "OK") {
          let itemInCart = await checkIfItemExist(cookie, clothId, 'wishList');
          if(itemInCart === false) console.log(success);
          else console.log(fail);
        }
        else console.log(fail);

        // admin
        console.log("try checkIfAdmin route");
        res = await fetch(URL + '/checkIfAdmin', {
          method: 'GET', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }
        });
        body = await res.text();
        if(body === 'false') console.log(success);
        else console.log(fail); 

        // checkout
        console.log("Try to checkout user1 cart");
        res = await fetch(URL + '/logout', {
          method: 'GET', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }
        });
        if(res.status == 500) console.log(fail + "didn't scceed to checkout - internal server error");
        let itemInCart = await checkIfItemExist(cookie, clothId, 'wishList');
        if(itemInCart === false) console.log(success);
        else console.log(fail)


        // logout
        console.log("Try to logout user1");
        res = await fetch(URL + '/logout', {
          method: 'POST', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }
        });
        if(res.status == 500) console.log(fail + "didn't scceed to logout - internal server error");
        cookie = res.headers.get('set-cookie').split(';')[0];
        if(cookie.split('=')[1] == '') console.log(success);
        else console.log(fail);

        
    } catch (err) {
        console.log(fail + " " + err);
    }
  }


  async function testAddToCart(clothId, cookie){
        let data = new URLSearchParams();
        data.append("clothId", clothId)
        res = await fetch(URL + '/private/addToCart', {
          method: 'POST', 
          headers: {
            "Content-Type" :"application/x-www-form-urlencoded",
            "Cookie" : cookie
          }, 
          body: data
        });

        body = await res.text();
        console.log("res body:", body);
        if(body === "OK") {
          let itemInCart = await checkIfItemExist(cookie, clothId, 'cart');
          if(itemInCart === true) return success;
          else return fail;
        }
        else return false;
  }

  async function checkIfItemExist(cookie, clothId, list){
    let res = await fetch(URL + `/private/${list}`, {
      method: 'GET', 
      headers: {"Cookie" : cookie}
    });
    body = await res.text();
    let bodyJson = JSON.parse(body);
    for (const item of bodyJson){
      if(item.id === clothId){
        return true;
      }
    }
    return false;
  }

  test();