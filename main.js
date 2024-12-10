// State
let categories = [];
let products = [];
let categorySelected = 1;
let selectedProduct = null;
let cart = {};

// Fetch Data
async function fetchData() {
  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch("http://localhost:3000/Category/getList"),
      fetch("http://localhost:3000/Product/getList"),
    ]);
    categories = await categoriesResponse.json();
    products = await productsResponse.json();
    renderCategories();
    renderSelectedCategory();
    renderProducts();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Render Categories
function renderCategories() {
  const categoriesSection = document.getElementById("categoriesSection");
  categoriesSection.innerHTML = categories
    .map(
      (category) => `
        <div onclick="selectCategory(${category.CategoryId})" 
             class="${
               category.CategoryId === categorySelected
                 ? "bg-green-700"
                 : "bg-gray-100"
             } 
                    cursor-pointer w-24 h-32 flex flex-col justify-center items-center space-y-2 p-2 rounded-full">
          <div class="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <img src="/public/vector/burger-vector.svg" alt="Burger" class="w-12 h-12">
          </div>
          <button class="${
            category.CategoryId === categorySelected
              ? "text-white"
              : "bg-gray-100 text-gray-700"
          }">
            <strong class="text-center text-xs line-clamp-2">${
              category.Title
            }</strong>
          </button>
        </div>
      `
    )
    .join("");
}

// Render Selected Category
function renderSelectedCategory() {
  const selectedCategory = categories.find(
    (cat) => cat.CategoryId === categorySelected
  );
  document.getElementById("titleSectionCategory").innerHTML = `
    <div class="w-full flex items-center gap-2 justify-evenly">
      <span class="border-[0.6px] flex w-1/4"></span>
      <span>${selectedCategory?.Title || ""}</span>
      <span class="border-[0.6px] flex w-1/4"></span>
    </div>
  `;
}

// Render Products
function renderProducts() {
  const productCards = document.getElementById("productCards");
  const filteredProducts = products.filter(
    (product) => product.CategoryId === categorySelected
  );
  productCards.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="product-card w-full md:w-1/2 p-2 cursor-pointer">
          <div class="border rounded-2xl flex flex-col md:flex-row h-60 p-4">
            <div class="w-full md:w-2/5 flex flex-col items-center justify-between">
              <img src="${product.Image || "/public/vector/burger-vector.svg"}" 
                   alt="${product.Title}" class="w-20 h-20">
              <div class="w-full flex item-center justify-center px-3">
                <button onclick="openProductDetails(${product.ProductId})" 
                        class="btn bg-green-700 text-sm p-2 w-full text-white rounded-xl">انتخاب</button>
              </div>
            </div>
            <div onclick="showProductDetails('${product?.Title}', '${
        product?.Description
      }', '${product?.Price}', '${product?.Image}')"  
                 class="w-full md:w-3/5 flex text-black flex-col justify-between p-3">
              <h2 class="font-bold text-lg">${product.Title}</h2>
              <p class="text-black text-sm line-clamp-3">${
                product.Description
              }</p>
              <div class="font-medium">${product.Price} تومان</div>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

// Select Category
function selectCategory(categoryId) {
  categorySelected = categoryId;
  renderCategories();
  renderSelectedCategory();
  renderProducts();
}

function showProductDetails(name, description, price, image) {
  document.getElementById("modalProductName").innerText = name;
  document.getElementById("modalProductDescription").innerText = description;
  document.getElementById("modalProductPrice").innerText = price;
  document.getElementById("modalProductImage").src =
    image || "/public/vector/burger-vector.svg";
  document.getElementById("productModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("productModal").classList.add("hidden");
}

// Open Product Details
async function openProductDetails(productId) {
  try {
    const response = await fetch(
      "http://localhost:3000/ProductDetail/getById/" + productId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    const detailsProduct = await response.json();
    selectedProduct = products.find((p) => p.ProductId === productId);

    if (selectedProduct) {
      document.getElementById("drawerProductName").textContent =
        selectedProduct.Title;
      document.getElementById("drawerProductImage").src =
        selectedProduct.Image || "/public/vector/burger-vector.svg";
      document.getElementById("drawerProductDescription").textContent =
        selectedProduct.Description;
      document.getElementById(
        "drawerProductPrice"
      ).textContent = `${selectedProduct.Price} تومان`;

      // Render extra items
      document.getElementById("extraItems").innerHTML =
        detailsProduct.extraItems
          .map(
            (item) => `
          <div class="flex items-center gap-2 mb-2">
            <input type="checkbox" id="extra-${item.name}" data-name="${item.name}" data-price="${item.price}" class="mr-2">
            <label for="extra-${item.name}" class="flex-grow">${item.name}</label>
            <span class="text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-800">${item.price} تومان</span>
          </div>
        `
          )
          .join("");

      // Render bread types
      document.getElementById("breadTypes").innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <input type="radio" id="bread-لواش" name="breadType" value="لواش" class="mr-2">
          <label for="bread-لواش">لواش</label>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input type="radio" id="bread-فانتزی" name="breadType" value="فانتزی" class="mr-2">
          <label for="bread-فانتزی">فانتزی</label>
        </div>
      `;

      document
        .getElementById("productDetailsDrawer")
        .classList.remove("translate-x-full");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

// Close Product Details
document.getElementById("closeDrawer").addEventListener("click", () => {
  document
    .getElementById("productDetailsDrawer")
    .classList.add("translate-x-full");
});

// Add to Cart
document.getElementById("addToCartBtn").addEventListener("click", () => {
  if (selectedProduct) {
    const extraItems = Array.from(
      document.querySelectorAll('#extraItems input[type="checkbox"]:checked')
    ).map((checkbox) => ({
      name: checkbox.dataset.name,
      price: parseInt(checkbox.dataset.price),
    }));
    const breadType =
      document.querySelector('input[name="breadType"]:checked')?.value || "";

    const cartItem = {
      ...selectedProduct,
      extraItems,
      breadType,
      quantity: 1,
      image: selectedProduct.Image,
    };

    addToCart(selectedProduct.ProductId, cartItem);

    document
      .getElementById("productDetailsDrawer")
      .classList.add("translate-x-full");
  }
});

function addToCart(productId, newItem) {
  if (cart[productId]) {
    // If the item already exists in the cart
    const existingItem = cart[productId];
    const isSameConfiguration =
      existingItem.breadType === newItem.breadType &&
      JSON.stringify(existingItem.extraItems) ===
        JSON.stringify(newItem.extraItems);

    if (isSameConfiguration) {
      // If it's the same configuration, just increase the quantity
      existingItem.quantity += 1;
    } else {
      // If it's a different configuration, ask the user what to do
      const editOptions = confirm(
        `این محصول با تنظیمات متفاوت در سبد خرید شما وجود دارد. می‌خواهید آن را ویرایش کنید؟\n\n` +
          `محصول فعلی:\n` +
          `تعداد: ${existingItem.quantity}\n` +
          `نان: ${existingItem.breadType}\n` +
          `اضافه‌ها: ${existingItem.extraItems
            .map((item) => item.name)
            .join(", ")}\n\n` +
          `محصول جدید:\n` +
          `نان: ${newItem.breadType}\n` +
          `اضافه‌ها: ${newItem.extraItems.map((item) => item.name).join(", ")}`
      );

      if (editOptions) {
        // Replace the existing item with the new one
        cart[productId] = { ...newItem, quantity: existingItem.quantity + 1 };
      } else {
        // Add as a new item
        cart[productId + "_" + Date.now()] = newItem;
      }
    }
  } else {
    // If the item doesn't exist in the cart, add it
    cart[productId] = newItem;
  }

  updateCartDisplay();
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = "";
  let totalItems = 0;
  let totalPrice = 0;

  if (Object.keys(cart).length === 0) {
    cartItemsContainer.innerHTML = "<p>سبد خرید شما خالی است.</p>";
  } else {
    for (const [productId, item] of Object.entries(cart)) {
      const itemTotalPrice =
        (parseInt(item.Price) +
          item.extraItems.reduce((sum, extra) => sum + extra.price, 0)) *
        item.quantity;
      totalItems += item.quantity;
      totalPrice += itemTotalPrice;

      cartItemsContainer.innerHTML += `
        <div class="border-b pb-2 mb-2">
          <h3 class="font-bold">${item.Title}</h3>
          <p>تعداد: ${item.quantity}</p>
          <p>قیمت: ${itemTotalPrice} تومان</p>
          ${
            item.extraItems.length
              ? `<p>اضافه‌ها: ${item.extraItems
                  .map((extra) => extra.name)
                  .join(", ")}</p>`
              : ""
          }
          ${item.breadType ? `<p>نان: ${item.breadType}</p>` : ""}
          <div class="mt-2">
            <button onclick="editCartItem('${productId}')" class="bg-blue-500 text-white px-2 py-1 rounded mr-2">ویرایش</button>
            <button onclick="deleteCartItem('${productId}')" class="bg-red-500 text-white px-2 py-1 rounded">حذف</button>
          </div>
        </div>
      `;
    }
  }

  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("totalPrice").textContent = totalPrice;
  document.getElementById("cart-item-length").innerText = `${totalItems} مورد`;
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to edit a cart item
function editCartItem(productId) {
  const item = cart[productId];
  if (item) {
    selectedProduct = item;
    openProductDetails(productId.split("_")[0]); // Remove the timestamp if it exists

    // Use a MutationObserver to wait for the drawer to be added to the DOM
    const observer = new MutationObserver((mutations, obs) => {
      const drawer = document.getElementById("productDetailsDrawer");
      if (drawer) {
        obs.disconnect(); // Stop observing
        drawer.classList.remove("translate-x-full");

        // Pre-select the current options
        setTimeout(() => {
          const breadTypeInput = document.querySelector(
            `input[name="breadType"][value="${item.breadType}"]`
          );
          if (breadTypeInput) {
            breadTypeInput.checked = true;
          }

          item.extraItems.forEach((extra) => {
            const extraCheckbox = document.querySelector(
              `input[type="checkbox"][data-name="${extra.name}"]`
            );
            if (extraCheckbox) {
              extraCheckbox.checked = true;
            }
          });
        }, 100); // Small delay to ensure the drawer content is updated
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Function to delete a cart item
function deleteCartItem(productId) {
  if (
    confirm("آیا مطمئن هستید که می‌خواهید این محصول را از سبد خرید حذف کنید؟")
  ) {
    delete cart[productId];
    updateCartDisplay();
  }
}

document
  .getElementById("cart-item-length")
  .parentElement.addEventListener("click", openCartDetails);

// Open Cart Details
function openCartDetails() {
  document
    .getElementById("cartDetailsDrawer")
    .classList.remove("translate-x-full");
}

// Close Cart Details
document.getElementById("closeDrawerCart").addEventListener("click", () => {
  document
    .getElementById("cartDetailsDrawer")
    .classList.add("translate-x-full");
});

// Event listener for the confirm purchase button
document.getElementById("confirmPurchaseBtn").addEventListener("click", () => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    openLoginModal();
  } else {
    validateToken(userToken);
  }
});

function validateToken(token) {
  fetch("https://your-api-endpoint.com/validate-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.valid) {
        window.location.href = "/user-panel";
      } else {
        openLoginModal();
      }
    })
    .catch((error) => {
      console.error("Error validating token:", error);
      openLoginModal();
    });
}

// Show the login modal
function openLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
}

// Close the login modal
document.getElementById("closeLoginModal").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden");
});

// Handle the form submission
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const emailOrPhone = document.getElementById("emailOrPhone").value;
    const password = document.getElementById("password").value;

    fetch("https://your-api-endpoint.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailOrPhone: emailOrPhone,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("userToken", data.token);
          openCartDetails();
          document.getElementById("loginModal").classList.add("hidden");
        } else {
          alert("ورود ناموفق بود. لطفاً اطلاعات خود را بررسی کنید.");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        alert("خطا در ورود. لطفاً دوباره تلاش کنید.");
      });
  });

// Initialize cart from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
  cartItemHandler();
});

function cartItemHandler() {
  const savedCart = JSON.parse(localStorage.getItem("cart"));
  if (savedCart && Object.entries(savedCart).length > 0) {
    document.getElementById("cart-item-section").classList.remove("hidden");
    document.getElementById("cart-item-length").innerText = `${
      Object.entries(savedCart).length
    } مورد`;
  }
}

// Initialize
fetchData();
