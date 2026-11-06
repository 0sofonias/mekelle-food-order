/* =====================================================================
   app-part-2.js — ACCOUNTS & ORDERS: login/signup/OTP, password
   recovery, my orders, restaurant dashboard, restaurant order
   management, Mekelle experience upgrade.
   Must load SECOND (after part 1).
   ===================================================================== */

  // CUSTOMER AUTHENTICATION
let authMode = "signin";

const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authName = document.getElementById("auth-name");
const authPhone = document.getElementById("auth-phone");
const authNameGroup = document.getElementById("auth-name-group");
const authPhoneGroup = document.getElementById("auth-phone-group");
const authMethod = document.getElementById("auth-method");
const authOtp = document.getElementById("auth-otp");
const authOtpGroup = document.getElementById("auth-otp-group");
const passwordToggle = document.getElementById("toggle-password");
const authEmailGroup = document.getElementById("auth-email-group");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authToggle = document.getElementById("auth-toggle");
const authMessage = document.getElementById("auth-message");
const authPanel = document.getElementById("auth-panel");

// FIX ACCOUNT MODE TOGGLE

function updateAuthFields() {
  const isSignup = authMode === "signup";
  const isPhone = authMethod.value === "phone";

  authNameGroup.style.display =
    isSignup ? "block" : "none";

  authPhoneGroup.style.display =
    isSignup ? "block" : "none";

  authEmailGroup.style.display =
    isPhone ? "none" : "block";

  authOtpGroup.style.display = "none";

  authName.required = isSignup;
  authPhone.required = isSignup;
  authEmail.required = !isPhone;
  authPassword.required = !isPhone;

  authPassword.autocomplete =
    isSignup ? "new-password" : "current-password";

  passwordToggle.style.display =
    isPhone ? "none" : "inline-block";

  authSubmit.textContent =
    isSignup
      ? (isPhone ? "Send SMS Code" : "Create Account")
      : "Sign In";
}

authToggle.onclick = function (event) {
  event.preventDefault();

  authMode = authMode === "signin" ? "signup" : "signin";

  authToggle.textContent =
    authMode === "signin"
      ? "Need an account? Create one"
      : "Already have an account? Sign in";

  authMessage.textContent = "";

  updateAuthFields();
};

authMethod.addEventListener("change", () => {
  authMessage.textContent = "";
  updateAuthFields();
});

updateAuthFields();
  
// Sign in or create an account
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = authEmail.value.trim();
  const password = authPassword.value;
  const fullName = authName.value.trim();
  const phone = authPhone.value.trim();
  const method = authMethod.value;

  authSubmit.disabled = true;
  authSubmit.textContent = "Please wait...";
  authMessage.textContent = "";

  try {
    // SIGN IN
    if (authMode === "signin") {
      if (method === "phone") {
        throw new Error(
          "Phone sign-in will be enabled after SMS verification is configured."
        );
      }

      if (!email || !password) {
        throw new Error("Enter your email and password.");
      }

      const { error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      authMessage.textContent = "Signed in successfully.";
    }

    // EMAIL REGISTRATION
    else if (method === "email") {
      if (!fullName || !phone || !email || !password) {
        throw new Error(
          "Please enter your full name, phone number, email and password."
        );
      }

      const { data, error } =
        await supabaseClient.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
      phone: phone
    },
    emailRedirectTo:
      "https://mekelle-food-order.sophniasebuy.workers.dev"
  }
});
      if (error) throw error;

      authMessage.textContent = data.session
        ? "Account created successfully."
        : "Account created. Check your email to confirm your account.";
    }

    // PHONE REGISTRATION
    else {
      if (!fullName || !phone) {
        throw new Error(
          "Please enter your full name and phone number."
        );
      }

      const { error } =
        await supabaseClient.auth.signInWithOtp({
          phone,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            },
            shouldCreateUser: true
          }
        });

      if (error) throw error;

      authOtpGroup.style.display = "block";
      authOtp.required = true;

      authMessage.textContent =
        "SMS code requested. Enter the code sent to your phone.";
    }

  } catch (error) {
    authMessage.textContent = error.message;
  } finally {
    authSubmit.disabled = false;

    authSubmit.textContent =
      authMode === "signin"
        ? "Sign In"
        : method === "phone"
          ? "Send SMS Code"
          : "Create Account";
  }
});

// FIX SHOW OR HIDE PASSWORD
passwordToggle.onclick = function (event) {
  event.preventDefault();

  const showing = authPassword.type === "password";

  authPassword.type = showing ? "text" : "password";
  passwordToggle.textContent = showing ? "Hide password" : "Show password";

  passwordToggle.setAttribute("aria-pressed", String(showing));
};
  
// Restore the session when the page reloads
async function updateAuthPanel() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  authPanel.style.display =
    data.session ? "none" : "block";
}

updateAuthPanel();

// Keep the interface synchronized with login/logout
supabaseClient.auth.onAuthStateChange((event, session) => {
  setTimeout(() => {
    applyRoleVisibility(session?.user ?? null);
  }, 0);
});

// SEARCH RESTAURANTS
document.getElementById("search").addEventListener(
  "input",
  () => {
    if (!selectedRestaurant) {
      renderRestaurants();
    }
  }
);

const myOrdersButton = document.getElementById("my-orders-button");
const myOrdersPanel = document.getElementById("my-orders-panel");
const myOrdersList = document.getElementById("my-orders-list");
const myOrdersMessage = document.getElementById("my-orders-message");
const myOrdersBack = document.getElementById("my-orders-back");

myOrdersButton.addEventListener("click", loadMyOrders);

myOrdersBack.addEventListener("click", () => {
myOrdersPanel.hidden = true;
});

async function loadMyOrders() {
myOrdersPanel.hidden = false;
myOrdersList.replaceChildren();
myOrdersMessage.textContent = "Loading your orders...";

const { data: sessionData, error: sessionError } =
await supabaseClient.auth.getSession();

if (sessionError || !sessionData.session) {
myOrdersMessage.textContent = "Please sign in to view your orders.";
return;
}

const { data: orders, error } = await supabaseClient
.from("orders")
.select(
"id, delivery_address, food_total, delivery_fee, service_fee, total_amount, payment_status, order_status, created_at"
)
.eq("customer_id", sessionData.session.user.id)
.order("created_at", { ascending: false });

if (error) {
myOrdersMessage.textContent =
"Could not load your orders: " + error.message;
return;
}

myOrdersMessage.textContent = "";

if (!orders || orders.length === 0) {
myOrdersMessage.textContent = "You have not placed any orders yet.";
return;
}

orders.forEach((order) => {
const card = document.createElement("article");
card.style.cssText =
"background:#fff;padding:16px;margin:12px 0;border-radius:8px;border:1px solid #ddd;color:#222;overflow-wrap:anywhere;";

const title = document.createElement("h3");
title.textContent = "Order " + order.id.slice(0, 8).toUpperCase();

const total = document.createElement("p");
total.textContent =
  "Total: " + Number(order.total_amount).toLocaleString() + " ETB";

const payment = document.createElement("p");
payment.textContent = "Payment: " + order.payment_status;

const status = document.createElement("p");
status.textContent = "Order status: " + order.order_status;

const address = document.createElement("p");
address.textContent = "Delivery address: " + order.delivery_address;

const date = document.createElement("p");
date.textContent =
  "Placed: " + new Date(order.created_at).toLocaleString();

card.append(title, total, payment, status, address, date);
myOrdersList.appendChild(card);

});
}

// RESTAURANT DASHBOARD
const restaurantDashboardButton =
  document.getElementById("restaurant-dashboard-button");

const restaurantDashboardPanel =
  document.getElementById("restaurant-dashboard-panel");

const restaurantDashboardMessage =
  document.getElementById("restaurant-dashboard-message");

const restaurantOrdersList =
  document.getElementById("restaurant-orders-list");

const restaurantDashboardBack =
  document.getElementById("restaurant-dashboard-back");

restaurantDashboardButton.addEventListener(
  "click",
  loadRestaurantDashboard
);

restaurantDashboardBack.addEventListener("click", () => {
  restaurantDashboardPanel.hidden = true;
});

async function loadRestaurantDashboard() {
  restaurantDashboardPanel.hidden = false;
  restaurantOrdersList.replaceChildren();
  restaurantDashboardMessage.textContent = "Loading restaurant orders...";

  try {
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      restaurantDashboardMessage.textContent =
        "Please sign in with your restaurant owner account.";
      return;
    }

    const ownerId = sessionData.session.user.id;

    const { data: restaurants, error: restaurantError } =
      await supabaseClient
        .from("restaurants")
        .select("id, name, is_approved, is_open")
        .eq("owner_id", ownerId);

    if (restaurantError) throw restaurantError;

    if (!restaurants || restaurants.length === 0) {
      restaurantDashboardMessage.textContent =
        "No restaurant is linked to this account. Please sign in with the restaurant owner's account.";
      return;
    }

    const approvedRestaurants = restaurants.filter(
      restaurant => restaurant.is_approved === true
    );

    if (approvedRestaurants.length === 0) {
      restaurantDashboardMessage.textContent =
        "Your restaurant is awaiting approval.";
      return;
    }

    restaurantDashboardMessage.textContent =
      "Your restaurant orders";

    for (const restaurant of approvedRestaurants) {
      const heading = document.createElement("h3");
      heading.textContent =
        restaurant.name +
        (restaurant.is_open ? " — Open" : " — Closed");

      restaurantOrdersList.appendChild(heading);

      const { data: orders, error: ordersError } =
        await supabaseClient
          .from("orders")
          .select(
            "id, delivery_address, food_total, delivery_fee, service_fee, total_amount, payment_status, order_status, created_at"
          )
          .eq("restaurant_id", restaurant.id)
          .eq("is_test_order", false)
          .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No orders yet.";
        restaurantOrdersList.appendChild(empty);
        continue;
      }

      for (const order of orders) {
        const card = document.createElement("article");
        card.style.cssText =
          "background:#fff;color:#222;padding:16px;margin:12px 0;border:1px solid #ddd;border-radius:8px;overflow-wrap:anywhere;";

        const title = document.createElement("h4");
        title.textContent =
          "Order " + order.id.slice(0, 8).toUpperCase();

        const total = document.createElement("p");
        total.textContent =
          "Total: " +
          Number(order.total_amount).toLocaleString() +
          " ETB";

        const address = document.createElement("p");
        address.textContent =
          "Delivery address: " + order.delivery_address;

        const payment = document.createElement("p");
        payment.textContent =
          "Payment: " + order.payment_status;

        const status = document.createElement("p");
        status.textContent =
          "Order status: " + order.order_status;

        const date = document.createElement("p");
        date.textContent =
          "Placed: " +
          new Date(order.created_at).toLocaleString();

        const actions = document.createElement("div");
actions.style.cssText =
  "display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;";

const nextStatus = {
  awaiting_payment: "confirmed",
  confirmed: "preparing",
  preparing: "ready_for_pickup"
};

const nextLabel = {
  awaiting_payment: "Accept Order",
  confirmed: "Start Preparing",
  preparing: "Ready for Pickup"
};

const next = nextStatus[order.order_status];

if (next) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = nextLabel[order.order_status];

  button.disabled = order.payment_status !== "paid";

  button.title = button.disabled
    ? "Payment must be verified before accepting this order."
    : "";

  button.addEventListener("click", async () => {
    button.disabled = true;
    restaurantDashboardMessage.textContent =
      "Updating order status...";

    try {
      const { error } = await supabaseClient.rpc(
        "restaurant_update_order_status",
        {
          p_order_id: order.id,
          p_new_status: next
        }
      );

      if (error) throw error;

      restaurantDashboardMessage.textContent =
        "Order status updated successfully.";

      await loadRestaurantDashboard();

    } catch (error) {
      restaurantDashboardMessage.textContent =
        "Could not update order: " + error.message;

      button.disabled = false;
    }
  });

  actions.appendChild(button);
}

card.append(title, total, address, payment, status, date, actions);
        restaurantOrdersList.appendChild(card);
      }
    }
  } catch (error) {
    restaurantDashboardMessage.textContent =
      "Could not load restaurant orders: " + error.message;
  }
}

// ===== PASSWORD RECOVERY AND NEW PASSWORD =====
(function setupPasswordRecovery() {
  const authPanel = document.getElementById("auth-panel");
  if (!authPanel) return;

  let message = document.getElementById("password-reset-message");

  if (!message) {
    message = document.createElement("p");
    message.id = "password-reset-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    authPanel.appendChild(message);
  }

  // Forgot password button
  let forgotButton = document.getElementById("forgot-password-button");

  if (!forgotButton) {
    forgotButton = document.createElement("button");
    forgotButton.id = "forgot-password-button";
    forgotButton.type = "button";
    forgotButton.textContent = "Forgot password?";
    forgotButton.style.cssText =
      "display:block;margin-top:12px;padding:12px;border:1px solid #ddd;border-radius:9px;background:white;cursor:pointer;";
    authPanel.appendChild(forgotButton);
  }

  // Screen for setting a new password
  let resetPanel = document.getElementById("new-password-panel");

  if (!resetPanel) {
    resetPanel = document.createElement("section");
    resetPanel.id = "new-password-panel";
    resetPanel.className = "container";
    resetPanel.hidden = true;

    resetPanel.innerHTML = `
      <h2>Set a New Password</h2>
      <form id="new-password-form">
        <label for="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          minlength="6"
          required
          autocomplete="new-password"
          placeholder="At least 6 characters"
          style="display:block;width:100%;padding:12px;margin:8px 0 16px;border:1px solid #ccc;border-radius:8px;font-size:16px"
        >

        <label for="confirm-new-password">Confirm new password</label>
        <input
          id="confirm-new-password"
          type="password"
          minlength="6"
          required
          autocomplete="new-password"
          placeholder="Enter the password again"
          style="display:block;width:100%;padding:12px;margin:8px 0 16px;border:1px solid #ccc;border-radius:8px;font-size:16px"
        >

        <button
          type="button"
          id="toggle-new-password"
          style="padding:10px;margin-bottom:14px"
        >Show passwords</button>

        <button
          type="submit"
          id="save-new-password"
          style="display:block;width:100%;padding:13px;background:#e85d04;color:white;border:0;border-radius:9px;font-weight:bold;font-size:16px"
        >Save New Password</button>
      </form>

      <p id="new-password-message" role="status" aria-live="polite"></p>
    `;

    authPanel.parentNode.insertBefore(resetPanel, authPanel.nextSibling);
  }

  const resetForm = resetPanel.querySelector("#new-password-form");
  const newPassword = resetPanel.querySelector("#new-password");
  const confirmPassword =
    resetPanel.querySelector("#confirm-new-password");
  const saveButton = resetPanel.querySelector("#save-new-password");
  const resetMessage =
    resetPanel.querySelector("#new-password-message");

  resetPanel.querySelector("#toggle-new-password")
    .addEventListener("click", function () {
      const show = newPassword.type === "password";
      newPassword.type = show ? "text" : "password";
      confirmPassword.type = show ? "text" : "password";
      this.textContent = show ? "Hide passwords" : "Show passwords";
    });

  // Request the recovery email
  forgotButton.addEventListener("click", async function () {
    const email = document.getElementById("auth-email").value.trim();

    if (!email) {
      message.textContent = "Enter your email address first.";
      document.getElementById("auth-email").focus();
      return;
    }

    forgotButton.disabled = true;
    message.textContent = "Requesting password-reset email...";

    try {
      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });

      if (error) throw error;

      message.textContent =
        "If the account exists, a reset email has been requested. Check your inbox and spam folder.";
    } catch (error) {
      message.textContent =
        "Password reset failed: " + error.message;
    } finally {
      forgotButton.disabled = false;
    }
  });

  // Save the new password after opening the recovery link
  resetForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (newPassword.value.length < 6) {
      resetMessage.textContent =
        "Your password must contain at least 6 characters.";
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      resetMessage.textContent = "The passwords do not match.";
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error(
          "Your recovery session is missing or expired. Request a new reset email and open its link again."
        );
      }

      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword.value
      });

      if (error) throw error;

      resetMessage.textContent =
        "Your password has been changed successfully. You can now sign in with your new password.";

      resetForm.reset();
      resetPanel.hidden = true;
      authPanel.hidden = false;
    } catch (error) {
      resetMessage.textContent =
        "Could not change password: " + error.message;
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Save New Password";
    }
  });

  // Display the new-password form when Supabase opens a recovery session
  supabaseClient.auth.onAuthStateChange(function (event, session) {
    if (event === "PASSWORD_RECOVERY") {
      authPanel.hidden = true;
      resetPanel.hidden = false;
      resetMessage.textContent =
        "Choose and confirm your new password.";
    }
  });
})();

  // ===== RESTAURANT ORDER MANAGEMENT =====
(function setupRestaurantOrderManagement() {
  const dashboard = document.getElementById("restaurant-dashboard-panel");
  const dashboardButton = document.getElementById("restaurant-dashboard-button");

  if (!dashboard || !dashboardButton) return;

  let panel = document.getElementById("restaurant-order-management");

  if (!panel) {
    panel = document.createElement("section");
    panel.id = "restaurant-order-management";
    panel.style.cssText = "margin:20px 0;padding:16px;border:1px solid #ddd;border-radius:12px;";

    const heading = document.createElement("h3");
    heading.textContent = "📋 Order Management";

    const refresh = document.createElement("button");
    refresh.type = "button";
    refresh.textContent = "Refresh Orders";
    refresh.style.cssText = "padding:10px 14px;margin-bottom:12px;cursor:pointer;";

    const message = document.createElement("p");
    message.id = "restaurant-order-management-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");

    const list = document.createElement("div");
    list.id = "restaurant-order-management-list";

    panel.append(heading, refresh, message, list);
    dashboard.appendChild(panel);

    refresh.addEventListener("click", loadOrders);
  }

  const message = panel.querySelector("#restaurant-order-management-message");
  const list = panel.querySelector("#restaurant-order-management-list");

  async function loadOrders() {
    message.textContent = "Loading orders...";
    list.replaceChildren();

    try {
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError) throw sessionError;

      const user = sessionData.session?.user;

      if (!user) {
        message.textContent = "Please sign in to manage restaurant orders.";
        return;
      }

      const { data: restaurants, error: restaurantError } =
        await supabaseClient
          .from("restaurants")
          .select("id, name")
          .eq("owner_id", user.id);

      if (restaurantError) throw restaurantError;

      if (!restaurants?.length) {
        message.textContent = "No restaurant is linked to this account.";
        return;
      }

      const restaurantIds = restaurants.map(r => r.id);
      const restaurantNames = Object.fromEntries(
        restaurants.map(r => [r.id, r.name])
      );

      const { data: orders, error: ordersError } = await supabaseClient
        .from("orders")
        .select("id, restaurant_id, delivery_address, food_total, delivery_fee, service_fee, total_amount, payment_status, order_status, created_at")
        .in("restaurant_id", restaurantIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (ordersError) throw ordersError;

      if (!orders?.length) {
        message.textContent = "No orders yet.";
        return;
      }

      message.textContent = `${orders.length} order(s) found.`;

      for (const order of orders) {
        const card = document.createElement("article");
        card.style.cssText = "padding:14px;margin:12px 0;border:1px solid #ddd;border-radius:10px;overflow-wrap:anywhere;";

        const title = document.createElement("h4");
        title.textContent = restaurantNames[order.restaurant_id] || "Restaurant";

        const details = document.createElement("p");
        details.textContent =
          `Order: ${order.id}\n` +
          `Address: ${order.delivery_address}\n` +
          `Total: ${Number(order.total_amount).toFixed(2)} ETB\n` +
          `Payment: ${order.payment_status}\n` +
          `Status: ${order.order_status}\n` +
          `Created: ${new Date(order.created_at).toLocaleString()}`;
        details.style.whiteSpace = "pre-line";

        card.append(title, details);

        const nextStatus = {
          paid: "accepted",
          accepted: "preparing",
          preparing: "ready"
        }[order.order_status];

        if (order.payment_status === "paid" && nextStatus) {
          const updateButton = document.createElement("button");
          updateButton.type = "button";
          updateButton.textContent = `Mark ${nextStatus}`;
          updateButton.style.cssText = "padding:10px 14px;cursor:pointer;";

          updateButton.addEventListener("click", async () => {
            updateButton.disabled = true;
            updateButton.textContent = "Updating...";

            try {
              const { error } = await supabaseClient.rpc(
                "update_restaurant_order_status",
                {
                  p_order_id: order.id,
                  p_new_status: nextStatus
                }
              );

              if (error) throw error;

              message.textContent = `Order updated to ${nextStatus}.`;
              await loadOrders();
            } catch (error) {
              message.textContent = error.message || "Could not update the order.";
              updateButton.disabled = false;
              updateButton.textContent = `Mark ${nextStatus}`;
            }
          });

          card.appendChild(updateButton);
        } else if (order.payment_status !== "paid") {
          const note = document.createElement("p");
          note.textContent = "Payment must be verified before this order can be processed.";
          card.appendChild(note);
        }

        list.appendChild(card);
      }
    } catch (error) {
      message.textContent = error.message || "Could not load restaurant orders.";
    }
  }

  dashboardButton.addEventListener("click", () => {
loadOrders();
});

// Load orders when this dashboard panel is first set up.
loadOrders();
})();

// ===== MEKELLE FOOD ORDER: EXPERIENCE UPGRADE =====
(function mekelleExperienceUpgrade() {
  if (document.getElementById("mekelle-experience-upgrade")) return;

  const style = document.createElement("style");
  style.id = "mekelle-experience-upgrade";
  style.textContent = `
    :root {
      --mfo-orange: #e85d04;
      --mfo-dark: #211b17;
      --mfo-bg: #fffaf6;
      --mfo-card: #ffffff;
      --mfo-muted: #786f68;
      --mfo-border: #eee4dc;
    }

    body {
      background: var(--mfo-bg);
      color: var(--mfo-dark);
      font-family: system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", sans-serif;
    }

    header {
      padding: 24px 18px;
      border-radius: 0 0 24px 24px;
      background: linear-gradient(135deg, #e85d04, #ff8b32);
      box-shadow: 0 8px 25px #e85d0420;
    }

    header h1 {
      font-size: clamp(23px, 5vw, 32px);
      font-weight: 800;
      letter-spacing: -.7px;
    }

    header button {
      margin: 14px 6px 0 0;
      padding: 11px 14px;
      border: 1px solid #ffffff55;
      border-radius: 12px;
      background: #ffffff20;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .container {
      width: 100%;
      max-width: 900px;
      padding: 20px 16px;
    }

    #auth-panel {
      max-width: 460px;
      margin: 35px auto;
      padding: 26px;
      border: 1px solid var(--mfo-border);
      border-radius: 22px;
      background: white;
      box-shadow: 0 12px 40px #40200b0c;
    }

    #auth-panel h2 {
      font-size: 25px;
      font-weight: 800;
    }

    #search {
      width: 100%;
      padding: 16px;
      border: 1px solid var(--mfo-border);
      border-radius: 16px;
      background: white;
      box-shadow: 0 5px 20px #40200b08;
      font-size: 16px;
    }

    .mfo-hero {
      position: relative;
      overflow: hidden;
      margin: 4px 0 24px;
      padding: 24px 20px;
      border-radius: 22px;
      background: #fff0e3;
    }

    .mfo-hero h2 {
      margin: 0 0 10px;
      font-size: clamp(25px, 6vw, 36px);
      line-height: 1.12;
      font-weight: 850;
      letter-spacing: -1px;
    }

    .mfo-hero p {
      max-width: 450px;
      color: #655044;
      line-height: 1.6;
    }

    .mfo-hero-icon {
      float: right;
      margin: 0 0 8px 10px;
      font-size: clamp(45px, 12vw, 78px);
    }

    .mfo-section-title {
      margin: 26px 0 14px;
      font-size: 21px;
      font-weight: 800;
    }

    .mfo-services {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 14px 0 24px;
    }

    .mfo-service {
      min-width: 0;
      padding: 17px 14px;
      border: 1px solid var(--mfo-border);
      border-radius: 18px;
      background: white;
      text-align: left;
      cursor: pointer;
      transition: transform .15s, box-shadow .15s;
    }

    .mfo-service:active {
      transform: scale(.98);
    }

    .mfo-service .icon {
      display: block;
      margin-bottom: 9px;
      font-size: 30px;
    }

    .mfo-service strong {
      display: block;
      font-size: 16px;
    }

    .mfo-service small {
      display: block;
      margin-top: 5px;
      color: var(--mfo-muted);
      line-height: 1.4;
    }

    .mfo-service.active {
      border-color: var(--mfo-orange);
      background: #fff4e9;
    }

    .mfo-service:disabled {
      cursor: default;
      opacity: .72;
    }

    .mfo-notice {
      margin: 12px 0;
      padding: 14px;
      border: 1px solid #f3d6bd;
      border-radius: 14px;
      background: #fff5eb;
      color: #75401e;
      line-height: 1.5;
    }

    .restaurant {
      margin-bottom: 16px;
      overflow: hidden;
      border: 1px solid var(--mfo-border);
      border-radius: 18px;
      background: var(--mfo-card);
      box-shadow: 0 5px 18px #40200b08;
    }

    .restaurant-info {
      padding: 18px;
    }

    .restaurant-info h3 {
      font-size: 19px;
      font-weight: 800;
    }

    .restaurant-info p {
      line-height: 1.5;
    }

    .badge {
      margin: 8px 8px 8px 0;
      border-radius: 30px;
      background: #e6f7e9;
      color: #176a35;
    }

    .restaurant-info button,
    #auth-submit,
    #view-cart,
    .cart-checkout {
      min-height: 44px;
      padding: 12px 16px;
      border: 0;
      border-radius: 12px;
      background: var(--mfo-orange);
      color: white;
      font-weight: 750;
      cursor: pointer;
    }

    .categories {
      gap: 9px;
      padding: 4px 0 12px;
    }

    .category {
      border-color: var(--mfo-border);
      border-radius: 30px;
      background: white;
      font-weight: 650;
    }

    .category.active {
      border-color: var(--mfo-orange);
      background: var(--mfo-orange);
    }

    .cart-bar {
      z-index: 20;
      border: 1px solid #ffffff18;
      border-radius: 18px;
      box-shadow: 0 8px 30px #0002;
    }

    #cart-panel {
      z-index: 1000;
      background: var(--mfo-bg);
    }

    #my-orders-panel,
    #restaurant-dashboard-panel {
      min-height: 55vh;
    }

    footer {
      line-height: 1.8;
    }

    @media (min-width: 700px) {
      .mfo-services {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      #restaurants {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      #restaurants > h2,
      #restaurants > .categories,
      #restaurants > .mfo-notice {
        grid-column: 1 / -1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }
  `;
  document.head.appendChild(style);

  const main = document.querySelector("main.container");
  const search = document.getElementById("search");

  if (!main || !search) return;

  // Add a polished homepage without replacing the existing menu.
  const hero = document.createElement("section");
  hero.className = "mfo-hero";
  hero.innerHTML = `
    <span class="mfo-hero-icon" aria-hidden="true">🍲</span>
    <h2>Good food.<br>Delivered in Mekelle.</h2>
    <p>Discover local restaurants, choose your favorites,
    and order from your phone.</p>
  `;

  const searchHeading = document.createElement("h2");
  searchHeading.className = "mfo-section-title";
  searchHeading.textContent = "What do you need today?";

  const services = document.createElement("div");
  services.className = "mfo-services";
  services.innerHTML = `
    <button type="button" class="mfo-service active" data-service="food">
      <span class="icon">🍽️</span>
      <strong>Food</strong>
      <small>Explore restaurants</small>
    </button>
    <button type="button" class="mfo-service" data-service="groceries">
      <span class="icon">🛒</span>
      <strong>Groceries</strong>
      <small>Coming soon</small>
    </button>
    <button type="button" class="mfo-service" data-service="parcels">
      <span class="icon">📦</span>
      <strong>Parcels</strong>
      <small>Coming soon</small>
    </button>
    <button type="button" class="mfo-service" data-service="business">
      <span class="icon">🏢</span>
      <strong>Business</strong>
      <small>Delivery services planned</small>
    </button>
  `;

  const notice = document.createElement("p");
  notice.className = "mfo-notice";
  notice.id = "mfo-service-notice";
  notice.hidden = true;
  notice.setAttribute("role", "status");

  main.insertBefore(hero, search);
  main.insertBefore(searchHeading, search);
  main.insertBefore(services, search);
  main.insertBefore(notice, search);

  // Keep upcoming services honest until their backend exists.
  services.querySelectorAll("[data-service]").forEach(button => {
    button.addEventListener("click", () => {
      const service = button.dataset.service;

      if (service !== "food") {
        notice.textContent =
          service === "groceries"
            ? "Grocery ordering is planned for a future release. Food ordering remains available."
            : service === "parcels"
              ? "Parcel delivery is planned. We still need to build rider assignment, pickup confirmation, and delivery tracking."
              : "Business delivery accounts and scheduled deliveries are planned for a future release.";

        notice.hidden = false;
        services.querySelectorAll("[data-service]").forEach(item => {
          item.classList.toggle("active", item === button);
        });
        return;
      }

      notice.hidden = true;
      services.querySelectorAll("[data-service]").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      if (selectedRestaurant) {
        selectedRestaurant = null;
        selectedCategory = "All";
      }

      search.value = "";
      loadRestaurants();
    });
  });

  // Replace the old homepage category click handlers so they don't
  // show the previous "open a restaurant first" alert.
  document.querySelectorAll(".categories > .category").forEach(oldButton => {
    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);

    button.addEventListener("click", async () => {
      if (selectedRestaurant) {
        selectedRestaurant = null;
      }

      selectedCategory = button.dataset.category || "All";
      search.value = "";

      document.querySelectorAll(".categories > .category").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      if (selectedCategory === "All") {
        await loadRestaurants();
        return;
      }

      if (selectedCategory === "Groceries") {
        notice.textContent =
          "Grocery shopping is planned for a future release. Browse restaurants for now.";
        notice.hidden = false;
        await loadRestaurants();
        return;
      }

      notice.hidden = true;

      const container = document.getElementById("restaurants");
      container.textContent = "Finding matching menus...";

      try {
        const { data: categories, error } = await supabaseClient
          .from("menu_categories")
          .select("restaurant_id, name")
          .ilike("name", "%" + selectedCategory + "%");

        if (error) throw error;

        const restaurantIds = [
          ...new Set((categories || []).map(item => item.restaurant_id))
        ];

        const matches = restaurants.filter(item =>
          restaurantIds.includes(item.id)
        );

        container.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = selectedCategory + " restaurants";
        container.appendChild(heading);

        if (!matches.length) {
          const empty = document.createElement("p");
          empty.className = "mfo-notice";
          empty.textContent =
            "No matching category has been added by restaurants yet. Try All.";
          container.appendChild(empty);
          return;
        }

        matches.forEach(restaurant => {
          const card = document.createElement("article");
          card.className = "restaurant";

          const info = document.createElement("div");
          info.className = "restaurant-info";

          const title = document.createElement("h3");
          title.textContent = restaurant.name;

          const description = document.createElement("p");
          description.textContent =
            restaurant.description || "Restaurant in Mekelle";

          const open = document.createElement("span");
          open.className = "badge";
          open.textContent = restaurant.is_open ? "Open" : "Closed";

          const view = document.createElement("button");
          view.type = "button";
          view.textContent = "View Menu";
          view.disabled = !restaurant.is_open;
          view.addEventListener("click", () => openMenu(restaurant));

          info.append(title, description, open, view);
          card.appendChild(info);
          container.appendChild(card);
        });
      } catch (error) {
        container.textContent =
          "Could not filter categories. Please try All. " + error.message;
      }
    });
  });

  // Replace the previous search listener to avoid duplicate rendering.
  const newSearch = search.cloneNode(true);
  search.replaceWith(newSearch);

  let searchTimer;
  let searchRequest = 0;

  newSearch.addEventListener("input", () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(async () => {
      const request = ++searchRequest;
      const query = newSearch.value.trim();

      if (selectedRestaurant) {
        const allItems = menuItems;
        const filtered = query
          ? allItems.filter(item =>
              [item.name, item.description]
                .some(value =>
                  (value || "").toLowerCase().includes(query.toLowerCase())
                )
            )
          : allItems;

        menuItems = filtered;
        renderMenu();
        menuItems = allItems;
        return;
      }

      if (!query) {
        renderRestaurants();
        return;
      }

      const container = document.getElementById("restaurants");
      container.textContent = "Searching restaurants and food...";

      try {
        const [nameResult, foodResult] = await Promise.all([
          supabaseClient
            .from("restaurants")
            .select("id, name, description, address, image_url, is_open")
            .eq("is_approved", true)
            .or(
              "name.ilike.%" + query + "%,description.ilike.%" +
              query + "%,address.ilike.%" + query + "%"
            ),
          supabaseClient
            .from("menu_items")
            .select("restaurant_id")
            .eq("is_available", true)
            .or(
              "name.ilike.%" + query + "%,description.ilike.%" + query + "%"
            )
        ]);

        if (request !== searchRequest) return;
        if (nameResult.error) throw nameResult.error;
        if (foodResult.error) throw foodResult.error;

        const ids = new Set([
          ...(nameResult.data || []).map(item => item.id),
          ...(foodResult.data || []).map(item => item.restaurant_id)
        ]);

        const matches = restaurants.filter(item => ids.has(item.id));

        container.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = "Search results";
        container.appendChild(heading);

        if (!matches.length) {
          const empty = document.createElement("p");
          empty.className = "mfo-notice";
          empty.textContent =
            "No matching restaurants or food found. Try another search.";
          container.appendChild(empty);
          return;
        }

        matches.forEach(restaurant => {
          const card = document.createElement("article");
          card.className = "restaurant";

          const info = document.createElement("div");
          info.className = "restaurant-info";

          const title = document.createElement("h3");
          title.textContent = restaurant.name;

          const description = document.createElement("p");
          description.textContent =
            restaurant.description || "Restaurant in Mekelle";

          const address = document.createElement("p");
          address.textContent = restaurant.address || "Mekelle";

          const view = document.createElement("button");
          view.type = "button";
          view.textContent = "View Menu";
          view.disabled = !restaurant.is_open;
          view.addEventListener("click", () => openMenu(restaurant));

          info.append(title, description, address, view);
          card.appendChild(info);
          container.appendChild(card);
        });
      } catch (error) {
        if (request !== searchRequest) return;
        container.textContent =
          "Search could not be completed: " + error.message;
      }
    }, 250);
  });

  // Sign-out action, if the existing button is present.
  const signOutButton = document.getElementById("sign-out-button");

  if (signOutButton) {
    signOutButton.addEventListener("click", async () => {
      signOutButton.disabled = true;

      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        window.location.reload();
      } catch (error) {
        alert("Could not sign out: " + error.message);
      } finally {
        signOutButton.disabled = false;
      }
    });
  }
})();
