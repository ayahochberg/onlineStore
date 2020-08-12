const fetch = require('node-fetch');
const { json } = require('body-parser');
const URL = "http://localhost:5000";
const success = "OK";
const fail = "FAILURE";

  async function test() {
    try {
        // register
        let userEmail = "user1@gmail.com";
        let fullName = "user1";
        let password = "1234";
        console.log("Try to register user1");
        let data = new URLSearchParams();
        data.append("email", userEmail)
        data.append("fullname", fullName)
        data.append("password", password)
        let res = await fetch(URL + '/register', {
          method: 'POST', 
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
          body: data
        })
        if(res.status == 200) console.log(success);
        else console.log(fail);

        // login
        console.log("Try to login user1");
        data = new URLSearchParams();
        data.append("email", userEmail)
        data.append("fullname", fullName)
        data.append("password", password)
        res = await fetch(URL + '/login', {
          method: 'POST', 
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
          body: data
        })
        if(res.status == 200) console.log(success);
        else console.log(fail);

         // login right user, wrong password
         let badPass = "12";
         data.set("password", badPass);
         data.delete("fullname");
         console.log("Try to login user with wrong password");
         res = await fetch(URL + '/login', {
             method: 'POST', 
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
             body: data
           })
         let body = await res.text();
         console.log("res body:", body);
         if(body == "user name or password incorrect") console.log(success);
         else console.log(fail);
        
        // login wrong user
        let badUserEmail = "wrongUser@gmail.com";
        data.set("email", badUserEmail);

        console.log("Try to login wrong user");
        res = await fetch(URL + '/login', {
            method: 'POST', 
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
            body: data
          })
        body = await res.text();
        console.log("res body:", body);
        if(body == "user doesn't exist") console.log(success);
        else console.log(fail);


    } catch (err) {
        console.log(fail + " " + err);
    }
  }

  test();