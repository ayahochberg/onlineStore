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



    } catch (err) {
        console.log(fail + " " + err);
    }
  }

  test();