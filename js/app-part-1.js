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

  checkoutButton.addEventListener("click", () => {
  showDeliveryForm();
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

  const heading = document.createElement("h3");
  heading.textContent = "Delivery Details";

  const form = document.createElement("form");

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
  label.textContent = "Delivery address in Mekelle";

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
const senderTitle = document.createElement("h4");
senderTitle.textContent = "Sender Details";

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
const mapLabel = document.createElement("p");
mapLabel.textContent = "📍 Select Your Delivery Location";
mapLabel.style.cssText =
  "font-weight: bold; margin: 12px 0 8px;";

const mapHelp = document.createElement("p");
mapHelp.textContent =
  "Use the map to find your location. You can also enter your address above.";
mapHelp.style.cssText =
  "font-size: 14px; color: #666; margin-bottom: 10px;";

const mapContainer = document.createElement("div");
mapContainer.id = "delivery-location-map";
mapContainer.style.cssText =
  "width: 100%; height: 300px; border-radius: 10px; border: 1px solid #ccc; margin-bottom: 10px; background: #eee;";
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
    if (deliveryMap) deliveryMap.invalidateSize();
  }, 350);
});
   
const selectedLocation = document.createElement("p");
selectedLocation.textContent =
  "No map location selected yet.";
selectedLocation.style.cssText =
  "font-size: 14px; margin-bottom: 16px;";

// ROUTE INFORMATION
const routeInfo = document.createElement("div");
routeInfo.style.cssText =
  "padding:12px;margin-bottom:14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;";

const routeStatus = document.createElement("p");
routeStatus.textContent =
  "Select and confirm your delivery location to calculate the bicycle route.";
routeStatus.style.cssText =
  "font-size:14px;margin:0 0 8px;";

const routeDistance = document.createElement("p");
routeDistance.textContent = "Route distance: Not calculated";

const routeFee = document.createElement("p");
routeFee.textContent = "Delivery fee: Not calculated";

routeInfo.append(routeStatus, routeDistance, routeFee);
   
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

   // BICYCLE ROUTE CALCULATION
let routeLayer = null;

async function calculateAndDisplayRoute(latitude, longitude) {
  routeStatus.textContent = "Calculating bicycle route...";
  routeDistance.textContent = "Route distance: Calculating...";
  routeFee.textContent = "Delivery fee: Calculating...";

  try {
    const { data: restaurant, error } = await supabaseClient
      .from("restaurants")
      .select("latitude, longitude")
      .eq("id", cart[0].restaurantId)
      .single();

    if (
      error ||
      !restaurant ||
      !Number.isFinite(Number(restaurant.latitude)) ||
      !Number.isFinite(Number(restaurant.longitude))
    ) {
      throw new Error("Restaurant location is unavailable.");
    }

    const response = await fetch(
      "https://mekelle-food-order.sophniasebuy.workers.dev/api/route",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          start: [
            Number(restaurant.longitude),
            Number(restaurant.latitude)
          ],
          end: [longitude, latitude],
          vehicle_type: "bicycle"
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Route calculation failed.");
    }

    routeDistance.textContent =
      "Route distance: " + data.distance_km + " km";

    routeFee.textContent =
      "Delivery fee: " + data.delivery_fee + " ETB";

    routeStatus.textContent =
      "Bicycle route calculated successfully.";

    if (routeLayer) {
      deliveryMap.removeLayer(routeLayer);
    }

    routeLayer = L.geoJSON(data.route_geometry, {
      style: {
        color: "#e85d04",
        weight: 6,
        opacity: 0.85
      }
    }).addTo(deliveryMap);

    deliveryMap.fitBounds(routeLayer.getBounds(), {
      padding: [30, 30]
    });

  } catch (error) {
    console.error("Bicycle route error:", error);

    routeStatus.textContent =
      error.message || "Unable to calculate bicycle route.";

    routeDistance.textContent = "Route distance: Not available";
    routeFee.textContent = "Delivery fee: Not available";
  }
}
  
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(deliveryMap);

    deliveryMap.on("click", (event) => {
      if (!mapPinEditing) return;

      const latitude = event.latlng.lat;
      const longitude = event.latlng.lng;

      customerLatitude = latitude;
      customerLongitude = longitude;

      if (locationMarker) {
        locationMarker.setLatLng(event.latlng);
      } else {
        locationMarker = L.marker(event.latlng).addTo(deliveryMap);
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
  
  mapPinEditing = false;
  confirmMapButton.style.display = "none";
  cancelMapButton.style.display = "none";
  
  confirmMapButton.disabled = true;
  cancelMapButton.disabled = true;
  editMapButton.disabled = false;

  locationMessage.textContent =
    "Delivery location confirmed. Add your neighbourhood or landmark to the address.";
   await calculateAndDisplayRoute(
  confirmedLatitude,
  confirmedLongitude
);
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
 // CALCULATE BICYCLE ROUTE FROM GPS LOCATION
calculateAndDisplayRoute(
  confirmedLatitude,
  confirmedLongitude
); 

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
  
summary.append(heading, form);

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
  "create_food_order",
  {
    p_restaurant_id: restaurantId,
    p_delivery_address: deliveryAddress,
    p_items: orderItems,
    p_sender_name: senderName,
    p_sender_phone: senderPhone,
    p_sender_address: senderAddress,
    p_recipient_type: recipientType,
    p_recipient_name: recipientName,
    p_recipient_phone: recipientPhone
  }
);

      if (error) {
        throw error;
      }

      const orderId = Array.isArray(data) ? data[0] : data;

      window.latestTestOrderId = orderId; 
      
      // SAVE THE CUSTOMER'S MAP LOCATION WITH THE ORDER
if (
  Number.isFinite(customerLatitude) &&
  Number.isFinite(customerLongitude)
) {
  const { error: locationSaveError } = await supabaseClient.rpc(
    "save_order_location",
    {
      p_order_id: orderId,
      p_latitude: customerLatitude,
      p_longitude: customerLongitude
    }
  );

  if (locationSaveError) {
    console.error(
      "Order created, but location saving failed:",
      locationSaveError
    );
  }
}
      
      cart = [];
      updateCartDisplay();

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
