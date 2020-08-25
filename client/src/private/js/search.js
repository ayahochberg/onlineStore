window.addEventListener("load", generateGrid);

async function generateGrid(){
    let ans;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const searchInput = urlParams.get('search')

    await fetch(`http://localhost:5000/search?search=${searchInput}`, {method: 'get'})
    .then((response) => response.json())
    .then((responseData) => { ans = responseData;})
    .catch(error => console.warn(error));

    const grid = document.getElementsByClassName('container wrap')[0];
    let indexItem = 0;
    let colIndex=0;
    while(indexItem < ans.length) {
        let row = document.createElement('div');
        row.className = "row";

        colIndex = 0;
        while(colIndex < 4 && ans[indexItem]!= undefined) {
            col = generateItem(ans[indexItem]);
            row.appendChild(col)
            indexItem++;
            colIndex++;
        }
        grid.appendChild(row)
    }
}

function generateItem(item){
    let product = document.createElement('div');
    product.className = "product-grid";

    let productImg = document.createElement('div');
    productImg.className = "product-img";
    productImg.innerHTML = `<img src="/img/${item.image}">
        <ul class="icon">
            <li><button class="cartBtn" onClick="addToCart(${item.id})"><i class="fas fa-cart-plus"></i></button></li>
            <li><button class="wishListBtn" onClick="addToWishList(${item.id})"><i class="fas fa-heart"></i></button></li>
        </ul>`

    let productDeatils = document.createElement('div');
    productDeatils.className = "product-detail";
    productDeatils.innerHTML = `<h3>${item.title}</h3><h5>${item.price}$</h5>`

    product.appendChild(productImg);
    product.appendChild(productDeatils);

    let col = document.createElement('div');
    col.className = "column";
    col.appendChild(product)
    return col;
}

async function addToCart(clothId) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        
        var urlencoded = new URLSearchParams();
        urlencoded.append("clothId", clothId);
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded,
        };
        
        await fetch("http://localhost:5000/private/addToCart", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
}

async function addToWishList(clothId) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        
    var urlencoded = new URLSearchParams();
    urlencoded.append("clothId", clothId);
        
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
    };
        
    await fetch("http://localhost:5000/private/addToWishList", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}