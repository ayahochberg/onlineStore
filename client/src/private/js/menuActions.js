window.addEventListener("load", initMenuActions);
function initMenuActions() {
    const searchButton = document.getElementsByClassName('fas fa-search')[0];
    searchButton.addEventListener('click', handleSearch)
    const logoutButton = document.getElementById('logOutBtn');
    logoutButton.addEventListener('click', handleLogOut)
}

async function handleLogOut(){
    await fetch(`http://localhost:5000/logout`, {method: 'post'})
    .catch(error => console.warn(error));
    location.href="../index.html";
}

function handleSearch() {
    let val = document.getElementById("searchInput").value;
    location.href = `search.html?search=${val}`;
}