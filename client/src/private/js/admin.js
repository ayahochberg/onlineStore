window.addEventListener('load', genrateUsersInfoGrid);

let usersList;
async function genrateUsersInfoGrid() {
    try {
        let res = await fetch(`http://localhost:5000/private/adminInfo`, {method: 'get'});
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
}
