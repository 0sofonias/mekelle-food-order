/* =====================================================================
   app-part-1.js — CORE: Supabase connection, app state, restaurants,
   menu, cart, checkout / delivery form.
   Must load FIRST (after the Supabase library, before part 2 and 3).
   ===================================================================== */

// SUPABASE CONNECTION — KEEP THESE VALUES UNCHANGED
const SUPABASE_URL = "https://vkrnonhmyeblmpkgkllo.supabase.co";
const SUPABASE_KEY = "sb_publishable_KaJTzLho3184lRCIPDQc8A_JcCZ3JBb";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
window.supabaseClient = 
supabaseClient;
// APP VARIABLES
let restaurants = [];
let selectedCategory = "All";
let cart = [];
let selectedRestaurant = null;
let menuItems = [];
let menuCategories = [];


// LOAD APPROVED RESTAURANTS
async function loadRestaurants() {
  const container = document.getElementById("restaurants");
  container.textContent = "Loading restaurants...";

  const { data, error } = await supabaseClient
    .from("restaurants")
    .select("id, name, description, address, image_url, is_open, latitude, longitude")
    .eq("is_approved", true)
    .order("name");

  if (error) {
    console.error("Restaurant loading error:", error);
    container.textContent = "Could not load restaurants.";
    return;
  }

  restaurants = data || [];
  renderRestaurants();
}


// DISPLAY RESTAURANTS AND SEARCH RESULTS
function renderRestaurants() {
  const container = document.getElementById("restaurants");
  container.replaceChildren();

  if (selectedRestaurant) {
    renderMenu();
    return;
  }

  const search = document
    .getElementById("search")
    .value.trim().toLowerCase();

  const list = restaurants.filter(r =>
    [r.name, r.description, r.address]
      .some(value =>
        (value || "").toLowerCase().includes(search)
      )
  );

  if (list.length === 0) {
    container.textContent = "No approved restaurants found.";
    return;
  }

  list.forEach(r => {
    const card = document.createElement("article");
    card.className = "restaurant";

 const image = document.createElement("div");
image.className = "restaurant-image";

if (r.image_url) {
  const photo = document.createElement("img");
  photo.src = r.image_url;
  photo.alt = (r.name || "Mekelle restaurant") + " food and restaurant";
  photo.loading = "lazy";

  photo.onerror = () => {
    image.replaceChildren();
    image.classList.add("restaurant-image-fallback");
    image.textContent = "🍽️";
  };

  image.appendChild(photo);
} else {
  image.classList.add("restaurant-image-fallback");
  image.textContent = "🍽️";
}

card.appendChild(image);
    
    const info = document.createElement("div");
    info.className = "restaurant-info";

    const name = document.createElement("h3");
    name.textContent = r.name;

    const description = document.createElement("p");
    description.textContent =
      r.description || "Restaurant in Mekelle";

    const address = document.createElement("p");
    address.textContent =
      r.address || "Location to be confirmed";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = r.is_open ? "Open" : "Currently closed";

    const button = document.createElement("button");
    button.textContent = "View Menu";
    button.disabled = !r.is_open;

    button.addEventListener("click", () => openMenu(r));

    info.append(name, description, address, badge, button);
    card.appendChild(info);
    container.appendChild(card);
  });
}


// OPEN A RESTAURANT MENU
async function openMenu(restaurant) {
  selectedRestaurant = restaurant;
  selectedCategory = "All";

  const container = document.getElementById("restaurants");
  container.textContent = "Loading menu...";

  const [categoriesResult, itemsResult] = await Promise.all([
    supabaseClient
      .from("menu_categories")
      .select("id, name")
      .eq("restaurant_id", restaurant.id)
      .order("name"),

    supabaseClient
      .from("menu_items")
      .select("id, category_id, name, description, price, image_url")
      .eq("restaurant_id", restaurant.id)
      .eq("is_available", true)
      .order("name")
  ]);

  if (categoriesResult.error || itemsResult.error) {
    console.error(
      categoriesResult.error || itemsResult.error
    );

    container.textContent =
      "Could not load the menu. Please try again.";

    return;
  }

  menuCategories = categoriesResult.data || [];
  menuItems = itemsResult.data || [];

  renderMenu();
}


// DISPLAY MENU ITEMS AND MENU CATEGORIES
function renderMenu() {
  const container = document.getElementById("restaurants");
  container.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = selectedRestaurant.name + " — Menu";
  container.appendChild(heading);

  const backButton = document.createElement("button");
  backButton.textContent = "← Back to Restaurants";

  backButton.addEventListener("click", () => {
    selectedRestaurant = null;
    selectedCategory = "All";
    renderRestaurants();
  });

  container.appendChild(backButton);

  const categories = document.createElement("div");
  categories.className = "categories";

  ["All", ...menuCategories.map(c => c.name)].forEach(name => {
    const button = document.createElement("button");
    button.className = "category";
    button.textContent = name;

    if (name === selectedCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedCategory = name;
      renderMenu();
    });

    categories.appendChild(button);
  });

  container.appendChild(categories);

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === "All") {
      return true;
    }

    const category = menuCategories.find(
      c => c.id === item.category_id
    );

    return category && category.name === selectedCategory;
  });

  if (filteredItems.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No food items in this category yet.";
    container.appendChild(message);
    return;
  }

  filteredItems.forEach(item => {
    const card = document.createElement("article");
    card.className = "restaurant";

        const image = document.createElement("div");
    image.className = "restaurant-image";

    if (item.image_url) {
      const photo = document.createElement("img");
      photo.src = item.image_url;
      photo.alt = item.name || "Food item";
      photo.loading = "lazy";

      photo.onerror = () => {
        image.replaceChildren();
        image.classList.add("restaurant-image-fallback");
        image.textContent = "🍽️";
      };

      image.appendChild(photo);
    } else {
      image.classList.add("restaurant-image-fallback");
      image.textContent = "🍽️";
    }

    card.appendChild(image);
    
    const info = document.createElement("div");
    info.className = "restaurant-info";

    const name = document.createElement("h3");
    name.textContent = item.name;

    const description = document.createElement("p");
    description.textContent =
      item.description || "Delicious food";

    const price = document.createElement("p");
    price.className = "menu-price";
    price.textContent =
      Number(item.price).toLocaleString() + " ETB";

    const addButton = document.createElement("button");
    addButton.textContent = "Add to Cart";

    addButton.addEventListener("click", () => {
    addToCart(item, addButton);
    });

    info.append(name, description, price, addButton);
    card.appendChild(info);
    container.appendChild(card);
    });
    }


// ADD FOOD TO CART WITH ANIMATION
function addToCart(item, sourceButton) {
  if (!selectedRestaurant) {
    alert("Please open a restaurant first.");
    return;
  }

  // Keep orders from different restaurants separate.
  if (
    cart.length > 0 &&
    cart.some(entry => entry.restaurantId !== selectedRestaurant.id)
  ) {
    const continueOrder = confirm(
      "Your cart contains food from another restaurant. " +
      "Clear the existing cart and order from this restaurant instead?"
    );

    if (!continueOrder) {
      return;
    }

    cart = [];
  }

  // Animate the food toward the cart.
  animateFoodToCart(sourceButton);

  const existing = cart.find(
    entry =>
      entry.id === item.id &&
      entry.restaurantId === selectedRestaurant.id
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name
    });
  }

  updateCartDisplay();
}

// FOOD FLYING ANIMATION
function animateFoodToCart(sourceButton) {
  if (!sourceButton) return;

  const cartButton = document.getElementById("view-cart");

  if (!cartButton) return;

  const start = sourceButton.getBoundingClientRect();
  const end = cartButton.getBoundingClientRect();

  const flyer = document.createElement("div");

  flyer.textContent = "🍔";
  flyer.setAttribute("aria-hidden", "true");

  Object.assign(flyer.style, {
    position: "fixed",
    left: (start.left + start.width / 2 - 15) + "px",
    top: (start.top + start.height / 2 - 15) + "px",
    width: "30px",
    height: "30px",
    fontSize: "26px",
    lineHeight: "30px",
    textAlign: "center",
    pointerEvents: "none",
    zIndex: "99999",
    transition: "transform 650ms cubic-bezier(.2,.8,.3,1), opacity 650ms ease"
  });

  document.body.appendChild(flyer);

  // Allow the browser to display the starting position.
  flyer.getBoundingClientRect();

  const moveX =
    end.left + end.width / 2 - (start.left + start.width / 2);

  const moveY =
    end.top + end.height / 2 - (start.top + start.height / 2);

  flyer.style.transform =
    `translate(${moveX}px, ${moveY}px) scale(0.25)`;

  flyer.style.opacity = "0";

  cartButton.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.18)" },
      { transform: "scale(1)" }
    ],
    {
      duration: 350,
      easing: "ease-out"
    }
  );

  setTimeout(() => {
    flyer.remove();
  }, 700);
}

// CART DISPLAY FIX
function updateCartDisplay() {
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartCount = document.getElementById("cart-count");

  if (cartCount) {
    cartCount.textContent =
      totalItems + (totalItems === 1 ? " item" : " items");
  }

  const cartButton = document.getElementById("view-cart");

  if (cartButton) {
    cartButton.textContent = `View Cart (${totalItems})`;
  }
}


// VIEW CART PAGE
function showCart() {
  const panel = document.getElementById("cart-panel");

  if (!panel) {
    alert("Cart page not found. Please check the cart HTML.");
    return;
  }

  panel.hidden = false;
  renderCart();
}


// CLOSE CART PAGE
function closeCart() {
  document.getElementById("cart-panel").hidden = true;
}


// DISPLAY CART ITEMS AND TOTAL
function renderCart() {
  const itemsContainer = document.getElementById("cart-items");
  const summaryContainer = document.getElementById("cart-summary");

  if (!itemsContainer || !summaryContainer) {
    alert("Cart display elements are missing.");
    return;
  }

  itemsContainer.replaceChildren();
  summaryContainer.replaceChildren();

  if (cart.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Your cart is empty.";
    itemsContainer.appendChild(message);

    const backButton = document.createElement("button");
    backButton.className = "cart-checkout";
    backButton.textContent = "Continue Shopping";
    backButton.addEventListener("click", closeCart);

    summaryContainer.appendChild(backButton);
    return;
  }

  cart.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "cart-item";

    const name = document.createElement("h3");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent =
      "Price: " + Number(item.price).toLocaleString() + " ETB";

    const subtotal = document.createElement("p");
    subtotal.textContent =
      "Subtotal: " +
      (Number(item.price) * item.quantity).toLocaleString() +
      " ETB";

    const actions = document.createElement("div");
    actions.className = "cart-actions";

    const decrease = document.createElement("button");
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", "Decrease quantity");
    decrease.addEventListener("click", () => {
      changeCartQuantity(index, -1);
    });

    const quantity = document.createElement("span");

quantity.textContent = String(item.quantity);

quantity.style.display = "inline-flex";
quantity.style.alignItems = "center";
quantity.style.justifyContent = "center";
quantity.style.width = "32px";
quantity.style.minHeight = "40px";
quantity.style.color = "#222";
quantity.style.backgroundColor = "#ffffff";
quantity.style.border = "1px solid #cccccc";
quantity.style.borderRadius = "6px";
quantity.style.fontSize = "18px";
quantity.style.fontWeight = "bold";

    const increase = document.createElement("button");
    increase.textContent = "+";
    increase.setAttribute("aria-label", "Increase quantity");
    increase.addEventListener("click", () => {
      changeCartQuantity(index, 1);
    });

    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      removeCartItem(index);
    });

    actions.append(decrease, quantity, increase, remove);
    card.append(name, price, subtotal, actions);
    itemsContainer.appendChild(card);
  });

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const restaurant = document.createElement("p");
  restaurant.textContent = "Restaurant: " + cart[0].restaurantName;

  const totalHeading = document.createElement("h3");
  totalHeading.textContent =
    "Food Total: " + total.toLocaleString() + " ETB";

  const checkoutButton = document.createElement("button");
  checkoutButton.className = "cart-checkout";
  checkoutButton.textContent = "Continue to Checkout";

  checkoutButton.addEventListener("click", async () => {
  try {
    await showDeliveryForm();
  } catch (error) {
    console.error("Checkout screen failed:", error);
    alert("Unable to open checkout: " + error.message);
  }
});
  
  summaryContainer.className = "cart-total";
  summaryContainer.append(restaurant, totalHeading, checkoutButton);
}

// SHOW DELIVERY ADDRESS FORM
async function showDeliveryForm() {
  const summary = document.getElementById("cart-summary");

  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  summary.replaceChildren();

  const heading = document.createElement("h2");
heading.textContent = "Checkout";
heading.style.cssText =
  "font-size:24px;font-weight:800;color:#222;margin:4px 0 16px;";

// CHECKOUT ORDER SUMMARY
const orderSummary = document.createElement("div");

orderSummary.style.cssText =
  "padding:16px;background:#fff;border:1px solid #eee;border-radius:14px;margin-bottom:12px;";

const orderSummaryTitle = document.createElement("h3");
orderSummaryTitle.textContent = "Your Order";
orderSummaryTitle.style.cssText =
  "font-size:18px;font-weight:800;color:#222;margin:0 0 14px;";

orderSummary.appendChild(orderSummaryTitle);

cart.forEach(item => {
  const itemRow = document.createElement("div");

  itemRow.style.cssText =
    "display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #eee;font-size:14px;";

  const itemName = document.createElement("span");
  itemName.textContent =
    item.name + " × " + item.quantity;

  const itemPrice = document.createElement("strong");
  itemPrice.textContent =
    (Number(item.price) * item.quantity).toLocaleString() + " ETB";

  itemRow.append(itemName, itemPrice);
  orderSummary.appendChild(itemRow);
});

const foodSubtotal = cart.reduce(
  (sum, item) => sum + Number(item.price) * item.quantity,
  0
);

const foodSubtotalRow = document.createElement("div");
foodSubtotalRow.style.cssText =
  "display:flex;justify-content:space-between;padding-top:14px;font-size:16px;font-weight:800;color:#222;";

const foodSubtotalLabel = document.createElement("span");
foodSubtotalLabel.textContent = "Food subtotal";
foodSubtotalLabel.style.color = "#333333";

const foodSubtotalValue = document.createElement("span");
foodSubtotalValue.textContent =
  foodSubtotal.toLocaleString() + " ETB";

foodSubtotalRow.append(foodSubtotalLabel, foodSubtotalValue);
orderSummary.appendChild(foodSubtotalRow);
   
// DELIVERY FEE ROW
const deliveryFeeRow = document.createElement("div");
deliveryFeeRow.style.cssText =
  "display:flex;justify-content:space-between;padding:10px 0;font-size:14px;";

const deliveryFeeLabel = document.createElement("span");
deliveryFeeLabel.textContent = "Delivery fee";

const deliveryFeeValue = document.createElement("strong");
deliveryFeeValue.textContent = "Calculating...";

deliveryFeeRow.append(deliveryFeeLabel, deliveryFeeValue);
orderSummary.appendChild(deliveryFeeRow);

// SERVICE FEE ROW
const serviceFee = Number((foodSubtotal * 0.03).toFixed(2));

const serviceFeeRow = document.createElement("div");
serviceFeeRow.style.cssText =
  "display:flex;justify-content:space-between;padding:10px 0;font-size:14px;";

const serviceFeeLabel = document.createElement("span");
serviceFeeLabel.textContent = "Service fee (3%)";

const serviceFeeValue = document.createElement("strong");
serviceFeeValue.textContent =
  serviceFee.toLocaleString() + " ETB";

serviceFeeRow.append(serviceFeeLabel, serviceFeeValue);
orderSummary.appendChild(serviceFeeRow);

// GRAND TOTAL ROW
const grandTotalRow = document.createElement("div");
grandTotalRow.style.cssText =
  "display:flex;justify-content:space-between;padding-top:14px;margin-top:8px;border-top:1px solid #eee;font-size:18px;font-weight:800;color:#e85d04;";

const grandTotalLabel = document.createElement("span");
grandTotalLabel.textContent = "Total";

const grandTotalValue = document.createElement("span");
grandTotalValue.textContent = "Calculating...";

grandTotalRow.append(grandTotalLabel, grandTotalValue);
orderSummary.appendChild(grandTotalRow);
   
  const form = document.createElement("form");

   form.style.cssText =
  "display:flex;flex-direction:column;gap:12px;width:100%;box-sizing:border-box;padding:16px;background:#ffffff;border-radius:16px;";

// RESTAURANT INFORMATION
const restaurantCard = document.createElement("div");

restaurantCard.style.cssText =
  "padding:14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:8px;";

const restaurantName = document.createElement("h3");
restaurantName.textContent = cart[0].restaurantName;
restaurantName.style.cssText =
  "font-size:18px;font-weight:700;margin:0;color:#222;";

const restaurantSubtitle = document.createElement("p");
restaurantSubtitle.textContent = "Your selected restaurant";
restaurantSubtitle.style.cssText =
  "font-size:13px;color:#777;margin:5px 0 0;";

restaurantCard.append(restaurantName, restaurantSubtitle);
form.appendChild(restaurantCard);
   
  // LOAD LOGGED-IN CUSTOMER PROFILE
const { data: currentUserData, error: currentUserError } =
  await supabaseClient.auth.getUser();

if (currentUserError || !currentUserData.user) {
  alert("Please sign in again before ordering.");
  return;
}

const { data: customerProfile, error: profileError } =
  await supabaseClient
    .from("profiles")
    .select("full_name, phone, address")
    .eq("id", currentUserData.user.id)
    .maybeSingle();

if (profileError) {
  console.error("Profile loading failed:", profileError);
  alert("Could not load your account details. Please try again.");
  return;
}
  
  const label = document.createElement("label");
label.textContent = "Delivery Address";
label.style.cssText =
  "display:block;font-size:15px;font-weight:700;color:#333;margin:12px 0 4px;";

  const address = document.createElement("textarea");
  address.required = false;
  address.rows = 3;
  address.maxLength = 500;
  address.placeholder =
 "Optional: Add a nearby landmark, building, or delivery instructions";
  
  address.style.display = "block";
  address.style.width = "100%";
  address.style.boxSizing = "border-box";
  address.style.padding = "12px";
  address.style.marginTop = "8px";
  address.style.marginBottom = "16px";
  address.style.borderRadius = "8px";
  address.style.border = "1px solid #ccc";
  address.style.fontSize = "16px";

  label.appendChild(address);

  // SENDER DETAILS
const senderTitle = document.createElement("h3");
senderTitle.textContent = "Your Details";
senderTitle.style.cssText =
  "font-size:18px;font-weight:700;color:#222;margin:16px 0 4px;padding-bottom:10px;border-bottom:1px solid #eee;";

function createCheckoutInput(labelText, value, placeholder) {
  const wrapper = document.createElement("label");
  wrapper.style.display = "block";
  wrapper.style.marginBottom = "12px";
  wrapper.textContent = labelText;

  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.placeholder = placeholder;
  input.required = true;
  input.style.cssText =
    "display:block;width:100%;box-sizing:border-box;padding:12px;margin-top:6px;border:1px solid #ccc;border-radius:8px;font-size:16px;";

  wrapper.appendChild(input);
  return { wrapper, input };
}

const senderNameField = createCheckoutInput(
  "Your Name",
  customerProfile?.full_name === "New Customer"
    ? ""
    : customerProfile?.full_name,
  "Enter your full name"
);

const senderPhoneField = createCheckoutInput(
  "Your Phone Number",
  customerProfile?.phone,
  "e.g. 0912345678"
);

const senderAddressField = createCheckoutInput(
  "Your City / Address",
  customerProfile?.address,
  "Enter your city or address"
);

senderPhoneField.input.type = "tel";
senderPhoneField.input.autocomplete = "tel";
  

  // DELIVERY LOCATION MAP
const mapLabel = document.createElement("h3");
mapLabel.textContent = "📍 Delivery Location";
mapLabel.style.cssText =
  "font-size:18px;font-weight:700;color:#222;margin:20px 0 6px;";
   
const mapHelp = document.createElement("p");
mapHelp.textContent =
  "Choose your exact delivery location by moving the map pin or using your current GPS location.";
mapHelp.style.cssText =
  "font-size: 14px; color: #666; margin-bottom: 10px;";

const mapContainer = document.createElement("div");
mapContainer.id = "delivery-location-map";
mapContainer.style.cssText =
  "width:100%;height:300px;border-radius:14px;border:1px solid #e5e7eb;margin-bottom:10px;background:#eee;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);";
   // EXPANDABLE DELIVERY MAP
mapContainer.style.position = "relative";

const expandMapButton = document.createElement("button");
expandMapButton.type = "button";
expandMapButton.textContent = "⛶ Expand Map";
expandMapButton.style.cssText =
  "position:absolute;top:12px;right:12px;z-index:1000;padding:10px 14px;background:white;color:#222;border:1px solid #ccc;border-radius:8px;font-weight:bold;cursor:pointer;";

mapContainer.appendChild(expandMapButton);

   // EDIT PIN ICON ON EXPANDED MAP
const expandedEditPinButton = document.createElement("button");
expandedEditPinButton.type = "button";
expandedEditPinButton.textContent = "📍";
expandedEditPinButton.title = "Edit delivery pin";
expandedEditPinButton.setAttribute("aria-label", "Edit delivery pin");
expandedEditPinButton.style.cssText =
"position:absolute;top:75px;left:12px;z-index:1000;width:44px;height:44px;background:white;border:1px solid #ccc;border-radius:10px;font-size:22px;cursor:pointer;display:none;";
mapContainer.appendChild(expandedEditPinButton);

// SAVE LOCATION BUTTON ON EXPANDED MAP
const expandedSaveLocationButton = document.createElement("button");
expandedSaveLocationButton.type = "button";
expandedSaveLocationButton.textContent = "✓ Save Location";
expandedSaveLocationButton.style.cssText =
  "position:absolute;bottom:25px;left:50%;transform:translateX(-50%);z-index:1000;padding:14px 24px;background:#16a34a;color:white;border:0;border-radius:12px;font-size:16px;font-weight:bold;display:none;cursor:pointer;";

mapContainer.appendChild(expandedSaveLocationButton);

expandedSaveLocationButton.addEventListener("click", () => {
  confirmMapButton.click();
  expandedSaveLocationButton.style.display = "none";
});

expandedEditPinButton.addEventListener("click", () => {
  if (editMapButton.disabled) return;
  editMapButton.click();
});

let mapIsExpanded = false;
let originalMapStyle = mapContainer.style.cssText;

expandMapButton.addEventListener("click", () => {
  if (!mapIsExpanded) {
    mapContainer.style.cssText +=
      ";position:fixed;top:0;left:0;width:100vw;height:100dvh;z-index:99999;margin:0;border-radius:0;background:white;";

    expandMapButton.textContent = "✕ Close Map";
    expandedEditPinButton.style.display = "block";
    mapIsExpanded = true;
  } else {
    mapContainer.style.cssText = originalMapStyle;
    expandMapButton.textContent = "⛶ Expand Map";
    expandedEditPinButton.style.display = "none";
    mapIsExpanded = false;
  }

setTimeout(() => {
  if (deliveryMap) {
    deliveryMap.invalidateSize({
      pan: false,
      animate: false
    });
  }
}, 350);
});
   
const selectedLocation = document.createElement("p");
selectedLocation.style.cssText =
  "font-size:14px;color:#444;padding:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;margin:8px 0 12px;";

// AUTOMATIC DELIVERY DISTANCE AND FEE

const routeInfo = document.createElement("div");

routeInfo.style.cssText =
  "padding:16px;margin:12px 0;background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);";
   
const routeStatus = document.createElement("p");
routeStatus.textContent =
  "Select your delivery location to calculate the estimated distance.";

const routeDistance = document.createElement("p");
routeDistance.textContent =
  "Delivery distance: Waiting for location";

const routeFee = document.createElement("p");
routeFee.textContent =
  "Delivery fee: Waiting for location";

routeDistance.style.cssText =
  "font-size:14px;color:#555;margin:8px 0;";

routeFee.style.cssText =
  "font-size:18px;font-weight:800;color:#e85d04;margin:10px 0 0;";
   
async function updateDeliveryEstimate() {

  routeStatus.textContent = "Calculating delivery estimate...";

  routeDistance.textContent =
    "Delivery distance: Calculating...";

  routeFee.textContent =
    "Delivery fee: Calculating...";

  if (
    !Number.isFinite(confirmedLatitude) ||
    !Number.isFinite(confirmedLongitude) ||
    !cart.length
  ) {
    routeStatus.textContent =
      "Select your delivery location to calculate the estimate.";

    routeDistance.textContent =
      "Delivery distance: Not available";

    routeFee.textContent =
      "Delivery fee: Not calculated";

     deliveryFeeValue.textContent = "Not available";
grandTotalValue.textContent = "Not available";

    return;
  }

  try {

    const restaurantId = cart[0].restaurantId;

    const { data: restaurant, error } = await supabaseClient
      .from("restaurants")
      .select("latitude, longitude")
      .eq("id", restaurantId)
      .single();

    if (error) throw error;

    if (
      !restaurant ||
      !Number.isFinite(Number(restaurant.latitude)) ||
      !Number.isFinite(Number(restaurant.longitude))
    ) {
      throw new Error("Restaurant location is unavailable.");
    }

    const toRadians = degrees =>
      degrees * Math.PI / 180;

    const lat1 = toRadians(Number(restaurant.latitude));
    const lon1 = toRadians(Number(restaurant.longitude));

    const lat2 = toRadians(confirmedLatitude);
    const lon2 = toRadians(confirmedLongitude);

    const latDifference = lat2 - lat1;
    const lonDifference = lon2 - lon1;

    const a =
      Math.sin(latDifference / 2) ** 2 +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(lonDifference / 2) ** 2;

    const straightDistance =
      2 * 6371 * Math.asin(Math.sqrt(Math.min(1, a)));

    const estimatedDistance = Number(
      (straightDistance * 1.4).toFixed(2)
    );

    if (
      !Number.isFinite(estimatedDistance) ||
      estimatedDistance <= 0 ||
      estimatedDistance > 50
    ) {
      throw new Error(
        "Your location is outside the current delivery range."
      );
    }

     const { data: pricing, error: pricingError } = await supabaseClient
  .from("platform_settings")
  .select(
    "service_fee_rate, base_delivery_fee, base_delivery_distance_km, extra_delivery_fee"
  )
  .eq("id", true)
  .single();

if (pricingError || !pricing) {
  console.error("Pricing settings query failed:", pricingError);
  throw new Error(
    pricingError?.message || "Pricing settings were not found."
  );
}

const baseFee = Number(pricing.base_delivery_fee);
const baseDistance = Number(pricing.base_delivery_distance_km);
const extraFeePerKm = Number(pricing.extra_delivery_fee);
const serviceFeeRate = Number(pricing.service_fee_rate) / 100;
     
    const deliveryFee =
      estimatedDistance <= baseDistance
        ? baseFee
        : Number(
            (
              baseFee +
              (estimatedDistance - baseDistance) *
              extraFeePerKm
            ).toFixed(2)
          );

     // UPDATE CHECKOUT PRICE BREAKDOWN
const currentFoodSubtotal = cart.reduce(
  (sum, item) => sum + Number(item.price) * item.quantity,
  0
);

const currentServiceFee = Number(
  (currentFoodSubtotal * serviceFeeRate).toFixed(2)
);

serviceFeeValue.textContent =
  currentServiceFee.toLocaleString() + " ETB";     

const currentGrandTotal = Number(
  (currentFoodSubtotal + currentServiceFee + deliveryFee).toFixed(2)
);

deliveryFeeValue.textContent =
  deliveryFee.toLocaleString() + " ETB";

grandTotalValue.textContent =
  currentGrandTotal.toLocaleString() + " ETB";

    routeStatus.textContent =
      "Estimated delivery cost calculated.";

    routeDistance.textContent =
      "Estimated delivery distance: " +
      estimatedDistance.toFixed(2) + " km";

    routeFee.textContent =
      "Estimated delivery fee: " +
      deliveryFee.toFixed(2) + " ETB";

  } catch (error) {

    console.error("Delivery estimate failed:", error);

    routeStatus.textContent =
      error.message || "Unable to calculate delivery estimate.";

    routeDistance.textContent =
      "Delivery distance: Unavailable";

    routeFee.textContent =
      "Delivery fee: Unavailable";
  }
}

routeInfo.append(
  routeStatus,
  routeDistance,
  routeFee
);
   
// WHO IS RECEIVING THE ORDER?
const recipientTitle = document.createElement("p");
recipientTitle.textContent = "Who is receiving this order?";
recipientTitle.style.cssText =
  "font-weight: bold; margin: 16px 0 8px;";

const recipientChoice = document.createElement("select");
recipientChoice.style.cssText =
  "width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px;";

recipientChoice.innerHTML = `
  <option value="myself">📍 Order for Myself</option>
  <option value="someone_else">🎁 Order for Someone Else</option>
`;

const recipientNameLabel = document.createElement("label");
recipientNameLabel.textContent = "Recipient's Name";
recipientNameLabel.style.cssText =
  "display: none; margin-bottom: 6px;";

const recipientNameInput = document.createElement("input");
recipientNameInput.type = "text";
recipientNameInput.placeholder = "Enter recipient's name";
recipientNameInput.style.cssText =
  "display: none; width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px;";
  
  // SHOW RECIPIENT NAME WHEN ORDERING FOR SOMEONE ELSE
recipientChoice.addEventListener("change", () => {
  const orderingForSomeoneElse =
    recipientChoice.value === "someone_else";

  recipientNameLabel.style.display =
    orderingForSomeoneElse ? "block" : "none";

  recipientNameInput.style.display =
    orderingForSomeoneElse ? "block" : "none";

  recipientNameInput.required = orderingForSomeoneElse;
});

// RECIPIENT PHONE NUMBER
const recipientPhoneLabel = document.createElement("label");
recipientPhoneLabel.textContent = "Recipient's Phone Number";
recipientPhoneLabel.style.cssText =
  "display:none;margin-bottom:6px;";

const recipientPhoneInput = document.createElement("input");
recipientPhoneInput.type = "tel";
recipientPhoneInput.placeholder = "Enter recipient's phone number";
recipientPhoneInput.autocomplete = "tel";
recipientPhoneInput.style.cssText =
  "display:none;width:100%;box-sizing:border-box;padding:12px;margin-bottom:12px;border:1px solid #ccc;border-radius:8px;font-size:16px;";

recipientChoice.addEventListener("change", () => {
  const someoneElse =
    recipientChoice.value === "someone_else";

  recipientPhoneLabel.style.display =
    someoneElse ? "block" : "none";

  recipientPhoneInput.style.display =
    someoneElse ? "block" : "none";

  recipientPhoneInput.required = someoneElse;
});
  
  // USE GPS TO GET THE CUSTOMER'S DELIVERY LOCATION
const locationButton = document.createElement("button");
locationButton.type = "button";
locationButton.textContent = "📍 Use My Location";
locationButton.className = "cart-checkout";
locationButton.style.marginBottom = "12px";

const locationMessage = document.createElement("p");
locationMessage.setAttribute("role", "status");

// MANUAL MAP PIN CONTROLS
const editMapButton = document.createElement("button");
editMapButton.type = "button";
editMapButton.textContent = "📍 Edit Map Pin";
editMapButton.className = "cart-checkout";

const confirmMapButton = document.createElement("button");
confirmMapButton.type = "button";
confirmMapButton.textContent = "Confirm Location";
confirmMapButton.className = "cart-checkout";
confirmMapButton.disabled = true;
confirmMapButton.style.display = "none";

const cancelMapButton = document.createElement("button");
cancelMapButton.style.display = "none";
cancelMapButton.type = "button";
cancelMapButton.textContent = "Cancel Editing";
cancelMapButton.className = "cart-checkout";
cancelMapButton.disabled = true;
  
// SHARE MAP VARIABLES WITH THE GPS BUTTON
let deliveryMap = null;
let locationMarker = null;
let mapPinEditing = false;
  
// SAVE THE CUSTOMER'S SELECTED COORDINATES
let customerLatitude = null;
let customerLongitude = null;
  
// LOAD THE INTERACTIVE DELIVERY MAP
const mapLibrary = document.createElement("link");
mapLibrary.rel = "stylesheet";
mapLibrary.href =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(mapLibrary);

const mapScript = document.createElement("script");
mapScript.src =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

mapScript.onload = () => {
  const waitForMapContainer = () => {
    const mapElement = document.getElementById("delivery-location-map");

    if (deliveryMap) return;
    if (!mapElement || !mapElement.isConnected) {
      setTimeout(waitForMapContainer, 100);
      return;
    }

    deliveryMap = L.map(mapElement).setView(
      [13.4967, 39.4753],
      13
    );

    // MODERN GAME-INSPIRED MAP STYLE
// SATELLITE MAP VIEW
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri",
    maxZoom: 19
  }
).addTo(deliveryMap);

    deliveryMap.on("click", (event) => {
      if (!mapPinEditing) return;

      const latitude = event.latlng.lat;
      const longitude = event.latlng.lng;

      customerLatitude = latitude;
      customerLongitude = longitude;

      if (locationMarker) {
        locationMarker.setLatLng(event.latlng);
      } else {
        const customerIcon = L.divIcon({
  className: "customer-neon-marker",
  html: `
    <div style="
      width:24px;
      height:24px;
      background:#00b7ff;
      border:4px solid white;
      border-radius:50%;
      box-shadow:0 0 12px #00b7ff, 0 0 25px #00b7ff;
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

locationMarker = L.marker(event.latlng, {
  icon: customerIcon
}).addTo(deliveryMap);
      }

      selectedLocation.textContent =
        "New location selected: " +
        latitude.toFixed(5) + ", " +
        longitude.toFixed(5);

      locationMessage.textContent =
        "Location adjusted. Tap Confirm Location to save it.";
    });

    setTimeout(() => deliveryMap.invalidateSize(), 300);
  };

  waitForMapContainer();
};

mapScript.onerror = () => {
  locationMessage.textContent =
    "The map could not load. Please check your internet connection and try again.";
};

document.body.appendChild(mapScript);

// STORE THE LAST CONFIRMED LOCATION
let confirmedLatitude = null;
let confirmedLongitude = null;
let confirmedAddress = "";

// ENABLE MANUAL MAP PIN EDITING
editMapButton.addEventListener("click", () => {
  if (!deliveryMap) return;

  mapPinEditing = true;
  confirmMapButton.style.display = "block";
  cancelMapButton.style.display = "block";
  expandedSaveLocationButton.style.display =
  mapIsExpanded ? "block" : "none";
  
  confirmMapButton.disabled = false;
  cancelMapButton.disabled = false;
  editMapButton.disabled = true;

  locationMessage.textContent =
    "Editing enabled. Tap the map to choose a new delivery location.";
});

// CONFIRM THE NEW MAP LOCATION
confirmMapButton.addEventListener("click", async () => {
  if (
    !mapPinEditing ||
    !Number.isFinite(customerLatitude) ||
    !Number.isFinite(customerLongitude)
  ) {
    locationMessage.textContent =
      "Please select a location on the map first.";
    return;
  }

  confirmedLatitude = customerLatitude;
  confirmedLongitude = customerLongitude;
  confirmedAddress = address.value;
  updateDeliveryEstimate();
  
  mapPinEditing = false;
  confirmMapButton.style.display = "none";
  cancelMapButton.style.display = "none";
  expandedSaveLocationButton.style.display = "none";
  
  confirmMapButton.disabled = true;
  cancelMapButton.disabled = true;
  editMapButton.disabled = false;

  locationMessage.textContent =
    "Delivery location confirmed. Add your neighbourhood or landmark to the address.";
});

// CANCEL MAP PIN EDITING
cancelMapButton.addEventListener("click", () => {
  mapPinEditing = false;

  customerLatitude = confirmedLatitude;
  customerLongitude = confirmedLongitude;
  address.value = confirmedAddress;

  if (
    confirmedLatitude !== null &&
    confirmedLongitude !== null
  ) {
    const previousPosition = [
      confirmedLatitude,
      confirmedLongitude
    ];

    if (locationMarker) {
      locationMarker.setLatLng(previousPosition);
    }

    deliveryMap.setView(previousPosition, 17);

    selectedLocation.textContent =
      "Confirmed location: " +
      confirmedLatitude.toFixed(5) + ", " +
      confirmedLongitude.toFixed(5);
  } else {
    customerLatitude = null;
    customerLongitude = null;

    if (locationMarker) {
      deliveryMap.removeLayer(locationMarker);
      locationMarker = null;
    }

    selectedLocation.textContent =
      "No delivery location selected.";
  }

  confirmMapButton.disabled = true;
  cancelMapButton.disabled = true;
  editMapButton.disabled = false;

  locationMessage.textContent =
    "Map editing cancelled. Your previous confirmed location is restored.";
   updateDeliveryEstimate();
});
  
locationButton.addEventListener("click", () => {
if (!navigator.geolocation) {
locationMessage.textContent =
"Your browser does not support GPS location.";
return;
}

locationButton.disabled = true;
locationButton.textContent = "📍 Finding your location...";
locationMessage.textContent =
  "Requesting location access. Please allow permission if your phone asks, and keep location services turned on.";  

navigator.geolocation.getCurrentPosition(
  (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log("GPS coordinates received:", latitude, longitude);
  console.log("GPS accuracy in metres:", position.coords.accuracy);
  customerLatitude = latitude;
  customerLongitude = longitude;
  confirmedLatitude = latitude;
  confirmedLongitude = longitude;
  updateDeliveryEstimate();
    
  const customerPosition = [latitude, longitude];
  if (!deliveryMap) {
  locationButton.disabled = false;
  locationButton.textContent = "📍 Use My Location";
  locationMessage.textContent =
    "The map is not ready yet. Please wait a moment and try again.";
  return;
}

  deliveryMap.setView(customerPosition, 17);

  if (locationMarker) {
    locationMarker.setLatLng(customerPosition);
  } else {
    locationMarker = L.marker(customerPosition).addTo(deliveryMap);
  }

  address.value =
    "GPS location: " +
    latitude.toFixed(6) + ", " +
    longitude.toFixed(6);

  selectedLocation.textContent =
    "Your selected location: " +
    latitude.toFixed(5) + ", " +
    longitude.toFixed(5);

  locationMessage.textContent =
    "Your location is shown on the map. Please add your neighbourhood or a nearby landmark to the address field.";

  setTimeout(() => deliveryMap.invalidateSize(), 200);

  locationButton.disabled = false;
  locationButton.textContent = "📍 Update My Location";
},
  
  (error) => {
    if (error.code === 1) {
  locationMessage.textContent =
    "📍 Location access is blocked. To use your location, tap the site settings icon beside the website address, open Permissions, and allow Location. Then tap Try Again.";

  locationButton.textContent = "📍 Try Again";
} else if (error.code === 2) {
  locationMessage.textContent =
    "📍 We couldn't find your location. Please turn on Location on your phone and try again.";

  locationButton.textContent = "📍 Try Again";
} else if (error.code === 3) {
  locationMessage.textContent =
    "📍 Finding your location took too long. Please try again.";

  locationButton.textContent = "📍 Try Again";
} else {
  locationMessage.textContent =
    "📍 We couldn't access your location. Please check your browser permissions and try again.";

  locationButton.textContent = "📍 Try Again";
}

    locationButton.disabled = false;
    locationButton.textContent = "📍 Try Again";
  },
  {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 30000
  }
);

});
  
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "cart-checkout";
  submit.textContent = "Place Order";

  const back = document.createElement("button");
  back.type = "button";
  back.className = "cart-checkout";
  back.style.background = "#555";
  back.textContent = "Back to Cart";

  back.addEventListener("click", () => {
    renderCart();
  });

  form.append(
  senderTitle,
  senderNameField.wrapper,
  senderPhoneField.wrapper,
  senderAddressField.wrapper,

  label,
  mapLabel,
  mapHelp,
  mapContainer,
  selectedLocation, 
  routeInfo,

  recipientTitle,
  recipientChoice,
  recipientNameLabel,
  recipientNameInput,
  recipientPhoneLabel,
  recipientPhoneInput,

  locationButton,
  editMapButton,
  confirmMapButton,
  cancelMapButton,
  locationMessage,
  submit,
  back
); 
  
summary.append(heading);
summary.append(orderSummary);
summary.append(form);

updateDeliveryEstimate();

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const deliveryAddress =
  address.value.trim() ||
  (
    Number.isFinite(confirmedLatitude) &&
    Number.isFinite(confirmedLongitude)
      ? "GPS location: " +
        confirmedLatitude.toFixed(6) + ", " +
        confirmedLongitude.toFixed(6)
      : ""
  );
    if (mapPinEditing) {
  alert("Please confirm or cancel your map location before placing your order.");
  return;
}
    const senderName = senderNameField.input.value.trim();
const senderPhone = senderPhoneField.input.value.trim();
const senderAddress = senderAddressField.input.value.trim();

const recipientType = recipientChoice.value;

const recipientName =
  recipientType === "someone_else"
    ? recipientNameInput.value.trim()
    : senderName;

const recipientPhone =
  recipientType === "someone_else"
    ? recipientPhoneInput.value.trim()
    : senderPhone;

if (recipientType === "someone_else" && !recipientName) {
  alert("Please enter the recipient's name.");
  recipientNameInput.focus();
  return;
}
    
if (!senderName || senderName.length < 2) {
  alert("Please enter your name.");
  senderNameField.input.focus();
  return;
}

if (!/^[0-9+\-\s()]{7,20}$/.test(recipientPhone)) {
  alert("Please enter a valid recipient phone number.");

  if (recipientType === "someone_else") {
    recipientPhoneInput.focus();
  } else {
    senderPhoneField.input.focus();
  }

  return;
}

if (!senderAddress || senderAddress.length < 2) {
  alert("Please enter your city or address.");
  senderAddressField.input.focus();
  return;
}

if (!/^[0-9+\-\s()]{7,20}$/.test(recipientPhone)) {
  alert("Please enter a valid recipient phone number.");
  recipientPhoneInput.focus();
  return;
}
 if (
  deliveryAddress.length < 5 &&
  (
    confirmedLatitude === null ||
    confirmedLongitude === null
  )
) {
  alert("Please select your delivery location on the map or enter a valid delivery address.");
  return;
}

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const restaurantId = cart[0].restaurantId;

    const multipleRestaurants = cart.some(
      item => item.restaurantId !== restaurantId
    );

    if (multipleRestaurants) {
      alert("Please order from one restaurant at a time.");
      return;
    }

    if (
  !Number.isFinite(confirmedLatitude) ||
  !Number.isFinite(confirmedLongitude)
) {
  alert("Please select and confirm your delivery location on the map.");
  return;
}
     
    submit.disabled = true;
    submit.textContent = "Placing Order...";

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));

      const { data: sessionCheck, error: sessionError } =
  await supabaseClient.auth.getSession();

if (sessionError) {
  throw sessionError;
}

if (!sessionCheck.session) {
  throw new Error(
    "Your login session has expired. Please sign in again before placing your order."
  );
}

  console.log("ORDER TEST DEBUG:", {
  userId: sessionCheck.session.user.id,
  parameterCount: 9,
  parameters: {
    p_restaurant_id: restaurantId,
    p_sender_name: senderName,
    p_recipient_type: recipientType
  }
});     

const { data, error } = await supabaseClient.rpc(
  "create_food_order_with_gps",
  {
    p_restaurant_id: restaurantId,
    p_delivery_address: deliveryAddress,
    p_items: orderItems,
    p_sender_name: senderName,
    p_sender_phone: senderPhone,
    p_sender_address: senderAddress,
    p_recipient_type: recipientType,
    p_recipient_name: recipientName,
    p_recipient_phone: recipientPhone,
    p_customer_latitude: confirmedLatitude,
    p_customer_longitude: confirmedLongitude
  }
);

      if (error) {
        throw error;
      }

      const orderId = Array.isArray(data) ? data[0] : data;

      window.latestTestOrderId = orderId; 

      const summary = document.getElementById("cart-summary");
      const itemsContainer = document.getElementById("cart-items");

      itemsContainer.replaceChildren();
      summary.replaceChildren();

      const success = document.createElement("h3");
success.textContent = "Order Placed Successfully!";
success.style.cssText = "color: #166534; background: #dcfce7; padding: 16px; border-radius: 8px; margin: 16px 0; display: block; visibility: visible; opacity: 1;";

const message = document.createElement("p");
message.textContent =
"Your order has been saved. Payment is still pending.";
message.style.cssText = "color: #1f2937; background: #f9fafb; padding: 12px; border-radius: 6px; display: block; visibility: visible; opacity: 1;";

const reference = document.createElement("p");
reference.textContent = "Order reference: " + orderId;
reference.style.cssText = "color: #1f2937; background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-wrap: anywhere; display: block; visibility: visible; opacity: 1;";

const closeButton = document.createElement("button");
closeButton.className = "cart-checkout";
closeButton.textContent = "Continue Browsing";
closeButton.style.cssText = "display: block; visibility: visible; opacity: 1; margin-top: 16px;";
closeButton.addEventListener("click", closeCart);

summary.append(
success,
message,
reference,
closeButton
);

    } catch (error) {
      console.error("Order creation failed:", error);

      alert(
        "We could not place your order.\n\n" +
        (error.message || "Please try again.")
      );

      submit.disabled = false;
      submit.textContent = "Place Order";
    }
  });
}
  
// INCREASE OR DECREASE QUANTITY
function changeCartQuantity(index, amount) {
  if (!cart[index]) return;

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  updateCartDisplay();
  renderCart();
}


// REMOVE ITEM FROM CART
function removeCartItem(index) {
  if (!cart[index]) return;

  cart.splice(index, 1);

  updateCartDisplay();
  renderCart();
}


// HOMEPAGE CATEGORY BUTTONS
document.querySelectorAll(".categories > .category").forEach(button => {
  button.addEventListener("click", () => {
    if (selectedRestaurant) {
      return;
    }

    selectedCategory = button.dataset.category;

    document.querySelectorAll(".categories > .category").forEach(b => {
      b.classList.toggle("active", b === button);
    });

    if (selectedCategory !== "All") {
      alert(
        "Open a restaurant first to browse its menu categories."
      );
      return;
    }

    renderRestaurants();
  });
});
