window.addEventListener('load', generateWishListTable);

async function generateWishListTable(){
    let ans;
    await fetch(`http://localhost:5000/private/wishList`, {method: 'get'})
    .then((response) => response.json())
    .then((responseData) => { ans = responseData;})
    .catch(error => console.warn(error));

    let isEmpty = ans.length == 0;
    let table = document.getElementsByClassName('wishlistItems')[0];

    if(isEmpty) {
        let itemContainer = document.createElement('div');
        itemContainer.className="emptyCard";
        itemContainer.innerHTML = `<p>Your Wishlist is empty</p>`;
        table.appendChild(itemContainer);
        return;
    }

    let headers = document.createElement('div');
    headers.className = "layout-inline headers row th";
    headers.innerHTML = `<div class="col col-pro">Product</div>
                        <div class="col col-price align-center ">Price</div>
                        <div class="col col-remove align-center"></div>`;
    table.appendChild(headers);

    for(let item=0; item<ans.length; item++) {
        let product = ans[item];

        let itemContainer = document.createElement('div');
        itemContainer.className="withListItem";

        let layoutInline = document.createElement('div');
        layoutInline.className = "layout-inline row";

        let deatils = document.createElement('div');
        deatils.className = "col col-pro layout-inline";
        deatils.innerHTML = `<img src=/img/${product.image}><p>${product.title}</p>`
            
        let price = document.createElement('div');
        price.className = "col col-price col-numeric align-center";
        price.innerHTML = `<p>${product.price}$</p>`

        let remove = document.createElement('div');
        remove.className = "col col-remove align-center";
        remove.innerHTML = `<button class="removeBtn" onclick="remove(${item}, ${product.id})"><i class="fas fa-minus-circle"></i></button>`;

        layoutInline.appendChild(deatils);
        layoutInline.appendChild(price);
        layoutInline.appendChild(remove)
        itemContainer.appendChild(layoutInline);
        table.appendChild(itemContainer)
    }
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
        
    await fetch("http://localhost:5000/private/removeFromWishList", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    location.reload();
}