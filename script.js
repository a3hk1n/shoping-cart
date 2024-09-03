// Elements
const cartButton = document.getElementById("header-cart-btn");
const productContainer = document.getElementById("product-list-container");
const cartContainer = document.querySelector(".cart-container");
const headerLink = document.querySelector(".header-link");
const conditionText = document.querySelector(".condition-text");
const productList = document.getElementById("product-list");
const cartTable = document.getElementById("cart-table");
const checkoutBox = document.querySelector(".checkout-box");
const quantityText = document.querySelector(".quantity-text");
const cartTotal = document.getElementById("cart-total");
const clearAllButton = document.getElementById("clear-all-btn");
const checkoutButton = document.getElementById("checkout-btn");
const categoryButtonsParent = document.getElementById("category-buttons");
const categoryuButtonsContainer = document.querySelector(
  ".category-buttons-wrapper"
);
const searchInput = document.getElementById("search-input");

let cartData = JSON.parse(localStorage.getItem("cart")) || [];

// Show basket cart
cartButton.addEventListener("click", () => {
  productContainer.classList.remove("show-section");
  cartContainer.classList.add("show-section");
});

// Show products list
headerLink.addEventListener("click", (e) => {
  e.preventDefault();
  cartContainer.classList.remove("show-section");
  productContainer.classList.add("show-section");
});

// Fetch & get products from API
const getProducts = async () => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();

    conditionText.style.display = "none"; // Hide Loading When Data Arrived
    productList.classList.add("full-list");
    renderPorducts(data); // Show Products
    categoryuButtonsContainer.style.display = "block";

    // Get all products category to create its category buttons
    const categories = data.reduce(
      (acc, item) => {
        if (!acc.includes(item.category)) {
          acc.push(item.category);
        }
        return acc;
      },
      ["all"]
    );

    // render products category buttons
    renderCategoryButtons(categories);
  } catch (error) {
    conditionText.textContent = error.message;
    productList.classList.remove("full-list");
  }
};

// Function to render product in DOM
const renderPorducts = (products) => {
  productList.innerHTML = "";

  products.map((product) => {
    // create product item
    const productElement = document.createElement("div");
    productElement.className = "product";

    // destructure product info
    const { id, image, title, price, description } = product;

    productElement.innerHTML = `
    <div class="product-img-wrapper">
      <img
        src="${image}"
        alt="${shortenTitle(title)}"
        class="product-img"
      />
      <div class="product-description">
        <p>
         ${description}
        </p>
      </div>
    </div>
    <h3 class="product-name">${shortenTitle(title)}</h3>
    <div class="product-info-box">
      <p class="product-price">$${price}</p>
      <div>
        <button class="add-to-cart-btn" data-id='${id}'>Add to Cart</button>
      </div>
    </div>
    `;

    // click event into "Add To Cart Button"
    const addToCartButton = productElement.querySelector(".add-to-cart-btn");
    addToCartButton.addEventListener("click", (e) => {
      const productId = parseInt(e.target.getAttribute("data-id"));

      // add selected product into basket cart
      const selectedProduct = products.find(
        (product) => product.id === productId
      );

      addToCart(selectedProduct);
    });

    productList.appendChild(productElement);
  });

  if (products.length === 0) {
    conditionText.style.display = "block";
    conditionText.innerHTML = "Product Doesn't Exist!";
    productList.classList.remove("full-list");
  } else {
    conditionText.style.display = "none";
    conditionText.innerHTML = "";
    productList.classList.add("full-list");
  }
};

const renderCategoryButtons = (categories) => {
  categoryButtonsParent.innerHTML = "";

  categories.map((category) => {
    const categoryButton = `
      <button class="category-btn ${category === "all" ? "active" : ""}"
        onclick="searchProductByCategory(this)"
        data-category="${category}"
      >
        ${capitalizeFirstLetter(category)}
       </button>
    `;

    categoryButtonsParent.innerHTML += categoryButton;
  });
};

// get filtered products by its caegory from api
const searchProductByCategory = async (btn) => {
  const allButtons = document.querySelectorAll(".category-btn");
  allButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  btn.classList.add("active");

  const category = btn.dataset.category;

  // fetch to api to filter its products
  const response = await fetch("https://fakestoreapi.com/products");
  const data = await response.json();

  // get all filtered products
  const filteredProducts = data.filter((item) => {
    return item.category === category;
  });

  if (category === "all") {
    getProducts();
  } else {
    renderPorducts(filteredProducts);
  }

  // empty search input
  searchInput.value = "";
};

// function to upper case first letter of product name
const capitalizeFirstLetter = (productName) => {
  const firstLetter = productName.charAt(0).toUpperCase();
  const newProductName = `${firstLetter}${productName.slice(1)}`;

  return newProductName;
};

// Function to add product into basket cart
const addToCart = (product) => {
  // See if product exist in cart or it's new product
  const cartItem = cartData.find((item) => item.id === product.id);

  if (!cartItem) {
    cartData.push({ ...product, quantity: 1 });
  } else {
    cartItem.quantity++;
  }

  // save cart items in local storage
  saveProductIntoLocalStorage();
  // Render basket cart
  renderCart();
};

const renderCart = () => {
  cartTable.innerHTML = "";
  if (cartData.length !== 0) {
    cartData.map((item) => {
      const { image, title, price, quantity, id } = item;

      const cartElement = document.createElement("div");
      cartElement.className = "cart-item";

      cartElement.innerHTML = `
            <td>
                  <div class='cart-img-box'>
                    <img src="${image}"
                     alt="${shortenTitle(title)}" class='cart-img' />
                  </div>
            </td>
            <td>
              <h3 class='cart-name'>${shortenTitle(title)}</h3>
            </td>

            <td>
              <p class='cart-price'>$${price.toFixed(2)}</p>
            </td>

            <td>
              <div class='cart-buttons'>
                <button class="btn increase-btn">
                  <i class='fa fa-plus'></i>
                </button>
                
                <p class='cart-quantity'>${quantity}</p>
                
                <button class="btn decrease-btn">
                  <i class='fa fa-minus'></i>
                </button>
              </div>
            </td>

            <td>
                <button class="remove-btn">
                  <i class='fa fa-times'></i>
                </button>
            </td>
    `;

      // event listeners to increase && decrease && remove items
      const increaseButton = cartElement.querySelector(".increase-btn");
      const decreaseButton = cartElement.querySelector(".decrease-btn");
      const removeButton = cartElement.querySelector(".remove-btn");

      increaseButton.addEventListener("click", () => {
        increaseQuantity(item);
      });

      decreaseButton.addEventListener("click", () => {
        decreaseQuantity(item);
      });

      removeButton.addEventListener("click", () => {
        removeFromCart(item);
      });

      cartTable.appendChild(cartElement);
    });

    checkoutBox.classList.add("show-checkout-box");
  } else {
    cartTable.innerHTML = `
    <div>
      <h3 class='empty-cart-text'>Shopping Cart is empty!</h3>
      <a href='#' class='back-to-shop-link'>Back To Shop</a>
    </div>
  `;

    // back to shop
    const backToShopLink = cartTable.querySelector(".back-to-shop-link");
    backToShopLink.addEventListener("click", (e) => {
      e.preventDefault();
      headerLink.click();
    });

    // hide checkout box when cart data is empty
    checkoutBox.classList.remove("show-checkout-box");
  }

  const totalPrice = cartData.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);

  cartTotal.textContent = totalPrice.toLocaleString();

  quantityText.textContent = cartData.length;
};

// function to increase item qunatity
const increaseQuantity = (item) => {
  const cartItem = cartData.find((product) => product.id === item.id);

  if (cartItem) {
    cartItem.quantity++;
    renderCart();
    saveProductIntoLocalStorage();
  }
};

// function to decrease item qunatity
const decreaseQuantity = (item) => {
  const cartItem = cartData.find((product) => product.id === item.id);

  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity--;
    renderCart();
    saveProductIntoLocalStorage();
  }
};

// function to remove item from basket cart
const removeFromCart = (item) => {
  const index = cartData.findIndex((product) => product.id === item.id);

  if (index !== -1) {
    cartData.splice(index, 1);
    renderCart();
    saveProductIntoLocalStorage();
  }
};

// clear basket cart when click to clear button
clearAllButton.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure to clear basket cart?",
    showDenyButton: true,
    confirmButtonText: "Clear",
    denyButtonText: `Cancle`,
  }).then((result) => {
    if (result.isConfirmed) {
      cartData = [];
      renderCart();
      saveCartToLocalStorage();
    }
  });
});

// checkout basket cart
checkoutButton.addEventListener("click", () => {
  Swal.fire({
    title: "Checkout Successfuly Done!",
    position: "center",
    icon: "success",
    showConfirmButton: false,
    timer: 3000,
  });

  cartData = [];
  renderCart();
  saveCartToLocalStorage();
});

// filter products by searching
searchInput.addEventListener("input", async (e) => {
  const value = e.target.value;

  const selectedProducts = await filterProductsBySearch(value);

  renderPorducts(selectedProducts);

  // back to shop if basket cart was open
  if (cartContainer.classList.contains("show-section")) {
    cartContainer.classList.remove("show-section");
    productContainer.classList.add("show-section");
  }
});

// Get searched products from api
const filterProductsBySearch = async (value) => {
  const response = await fetch("https://fakestoreapi.com/products");
  const data = await response.json();

  // filtering
  const searchedProducts = data.filter((product) => {
    return shortenTitle(product.title)
      .toLowerCase()
      .includes(value.toLowerCase().trim());
  });

  return searchedProducts;
};

// function to save cart products in local storage
const saveProductIntoLocalStorage = () => {
  localStorage.setItem("cart", JSON.stringify(cartData));
};

// short products title
const shortenTitle = (text) => {
  const splitedTitle = text.split(" ");

  let newTitle = null;

  if (splitedTitle[1] === "-") {
    newTitle = `${splitedTitle[0]} ${splitedTitle[1]} ${splitedTitle[2]}`;
  } else {
    newTitle = `${splitedTitle[0]} ${splitedTitle[1]}`;
  }

  return newTitle;
};

// Start Initialy Project
getProducts();
renderCart();
