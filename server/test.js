const fetch = require('node-fetch');
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
        let res = await fetch(URL + `/register?email=${userEmail}&fullname=${fullName}&password=${password}`, {method: 'POST'});
        if(res.status == 200) console.log(success);
        else console.log(fail);

        // login
        console.log("Try to login user1");
        res = await fetch(URL + `/login?email=${userEmail}&password=${password}`, {method: 'POST'});
        if(res.status == 200) console.log(success);
        else console.log(fail);

        // login wrong user
        let badUserEmail = "wrongUser@gmail.com";
        console.log("Try to login wrong user");
        res = await fetch(URL + `/login?email=${badUserEmail}&password=${password}`, {method: 'POST'});
        let body = await res.text();
        console.log("body ", body);
        if(body == "user doesn't exist") console.log(success);
        else console.log(fail);

        // login bad password
        let badPass = "12";

    } catch (err) {
        console.log(fail + " " + err);
    }
  }

  test();