window.addEventListener('load', generateCartTable);

async function generateCartTable(){
    let ans;
    let total = 0;
    await fetch(`http://localhost:5000/private/cart`, {method: 'get'})
    .then((response) => response.json())
    .then((responseData) => { ans = responseData;})
    .catch(error => console.warn(error));

    let isEmpty = ans.length == 0;
    let table = document.getElementsByClassName('cartItems')[0];

    if(isEmpty) {
        let itemContainer = document.createElement('div');
        itemContainer.className="emptyCard";
        itemContainer.innerHTML = `<p>Your Cart is empty</p>`;
        table.appendChild(itemContainer);
        return;
    }

    let headers = document.createElement('div');
    headers.className = "layout-inline row th";
    headers.innerHTML = `<div class="col col-pro">Product</div>
                        <div class="col col-price align-center "> Price</div>
                        <div class="col col-remove align-center"></div>`;
    table.appendChild(headers);

    for(let item=0; item<ans.length; item++) {
        let product = ans[item];
        total+=product.price;

        let itemContainer = document.createElement('div');
        itemContainer.className = "layout-inline row";

        let deatils = document.createElement('div');
        deatils.className = "col col-pro layout-inline";
        deatils.innerHTML = `<img src=/img/${product.image}><p>${product.title}</p>`
        
        let price = document.createElement('div');
        price.className = "col col-price col-numeric align-center";
        price.innerHTML = `<p>${product.price}$</p>`

        let remove = document.createElement('div');
        remove.className = "col col-remove align-center";
        remove.innerHTML = `<button class="removeBtn" onclick="remove(${item}, ${product.id})"><i class="fas fa-minus-circle"></i></button>`;

        itemContainer.appendChild(deatils);
        itemContainer.appendChild(price);
        itemContainer.appendChild(remove)
        table.appendChild(itemContainer)
    }

    let footer = document.createElement('div');
    footer.className = "tf";
    footer.innerHTML = `<div class="row layout-inline">
                            <div class="col"><p>Shipping</p></div>
                            <div class="col"><p class="shippingPrice"></p></div>
                        </div>

                        <div class="row layout-inline">
                            <div class="col"><p>Total</p></div>
                            <div class="col"><p class="totalPrice"></p></div>
                        </div>
                    <button class="checkout" onclick="onClickCheckout()"><span>Checkout</span></button>`;
    table.appendChild(footer);

    let shippingPrice = 20;
    let shippingElement = document.getElementsByClassName('shippingPrice')[0];
    shippingElement.innerHTML = `${shippingPrice}$`;

    let totalPrice = shippingPrice + total;
    let totalElement = document.getElementsByClassName('totalPrice')[0];
    totalElement.innerHTML = `${totalPrice}$`;
}

async function remove(indexItem, clothId){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        
    var urlencoded = new URLSearchParams();
    urlencoded.append("clothId", clothId);
        
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
    };
        
    await fetch("http://localhost:5000/private/removeFromCart", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    location.reload();
}

function onClickCheckout(){
    location.href = "./checkout.html"
}
