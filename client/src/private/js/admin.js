window.addEventListener('load', genrateUsersInfoGrid);

let usersList;
async function genrateUsersInfoGrid() {
    try {
        let res = await fetch(`http://localhost:5000/private/adminInfo`, {method: 'get'});
        console.log(res);
        usersList = await res.json();
        generateTable(usersList);
    } catch (e) {
        console.warn(e);
    }
}

async function generateFilteredTable() {
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchVal");
    filter = input.value.toUpperCase();
    table = document.getElementById("usersTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function generateTable(usersList) {
    const tableBody = document.getElementById('tableData');
    let dataHtml = '';

    for(let user of usersList){
        let name = user.userDetails.name;
        let email = user.userDetails.email;
        let cart = user.cart;
        let loginActivity = user.loginActivity;
        let purchases = user.purchases;
        dataHtml += `<tr><td>${name}</td><td>${email}</td><td>${cart}</td><td>${purchases}</td><td>${loginActivity}</td></tr>`;
    }

    tableBody.innerHTML = dataHtml;

    console.log(dataHtml);
}


// function generateTable(usersList){
//     while(indexUser < resJsonArr.length) {
//         console.log('3');
//         let row = document.createElement('div');
//         row.className = "row";

//         let user = resJsonArr[indexUser];
//         console.log('user: ', user);
//         userInfo = generateUserRow(user);
//         row.appendChild(userInfo)
//         indexUser++;

//         grid.appendChild(row)
//     }
// }


// function generateItem(user){
//     let product = document.createElement('div');
//     product.className = "users-grid";
//     let name = user.userDetails.name;
//     let email = user.userDetails.email;
//     let cart = user.cart;
//     let wishlist = user.wishlist;
//     let loginActivity = user.loginActivity;
//     let purchases = user.purchases;

//     let userInfo = document.createElement('div');
//     userInfo.className = "user-detail";
//     userInfo.innerHTML = `<h3>${name}</h3><h5>${email}$</h5>`

//     product.appendChild(userInfo);

//     let col = document.createElement('div');
//     col.className = "column";
//     col.appendChild(product)
//     return col;
// }

