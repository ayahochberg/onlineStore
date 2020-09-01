window.addEventListener("load", initCheckoutAction);
function initCheckoutAction() {
    const logoutButton = document.getElementById('checkoutBtn');
    logoutButton.addEventListener('click', handleCheckout)
}

async function handleCheckout(){
    await fetch(`http://localhost:5000/private/checkout`, {method: 'GET'})
    .catch(error => console.warn(error));
    location.href="./homePage.html";
    window.alert("Items on the way!");
}