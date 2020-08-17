
window.addEventListener('load', genrateProductGrid)

async function genrateProductGrid() {
    let ans;

    await fetch("http://localhost:5000/products", {method: 'get'})
    .then((response) => response.json())
    .then((responseData) => { ans = responseData;})
    .catch(error => console.warn(error));

    const grid = document.getElementsByClassName('container wrap')[0];
    let indexItem = 0;
    while(indexItem < ans.length) {
        let row = document.createElement('div');
        row.className = "row"
        for(let j = 0; j < 4; j++) {
            console.log(indexItem)
            col = generateItem(ans[indexItem]);
            row.appendChild(col)
            indexItem++;
        }
        grid.appendChild(row)
    }

function generateItem(item){
    let product = document.createElement('div');
    product.className = "product-grid";

    let productImg = document.createElement('div');
    productImg.className = "product-img";
    productImg.innerHTML = `<img src="/client/public/clothes images/${item.image}">
        <ul class="icon">
            <li><a href="#"><i class="fas fa-cart-plus"></i></a></li>
            <li><a href="#"><i class="fas fa-heart"></i></a></li>							
        </ul>`

    let productDeatils = document.createElement('div');
    productDeatils.className = "product-detail";
    productDeatils.innerHTML = `<h3>${item.title}</h3><h5>${item.price}</h5>`

    product.appendChild(productImg);
    product.appendChild(productDeatils);

    let col = document.createElement('div');
    col.className = "column";
    col.appendChild(product)
    return col;
}
}