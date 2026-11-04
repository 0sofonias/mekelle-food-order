/* =====================================================================
   app-part-3.js — GRAPHICS, RIDERS, ADMIN & START: premium graphics,
   rider dashboard, rider assignment, test payment, role visibility,
   admin dashboard/orders, dashboard separation, app start.
   Must load THIRD (last).
   ===================================================================== */

 // ===== MEKELLE FOOD ORDER: PREMIUM GRAPHICS =====
(function premiumGraphicsUpgrade() {
if (document.getElementById("mfo-premium-graphics")) return;

const style = document.createElement("style");
style.id = "mfo-premium-graphics";

style.textContent = `
:root {
--mfo-orange: #e85d04;
--mfo-orange-light: #fff0e5;
--mfo-ink: #241b16;
--mfo-muted: #756b64;
--mfo-line: #f0e6df;
--mfo-surface: #ffffff;
}

body {
  background: #fffaf6;
  color: var(--mfo-ink);
}

header {
  position: relative;
  padding: 28px 20px 30px;
  background: linear-gradient(135deg, #c74700, #e85d04 58%, #ff9848);
  border-radius: 0 0 28px 28px;
  box-shadow: 0 8px 28px #b744001b;
}

header h1 {
  max-width: 650px;
  font-size: clamp(25px, 5vw, 34px);
  line-height: 1.2;
  letter-spacing: -0.8px;
}

header p {
  margin-top: 8px;
  line-height: 1.6;
  color: #fff8f2;
}

.container {
  max-width: 1000px;
  padding: 22px 16px;
}

.mfo-hero {
  padding: 28px 22px;
  border: 1px solid #ffe1ca;
  background: linear-gradient(120deg, #fff0e3, #fff9f2);
}

.mfo-hero h2 {
  max-width: 440px;
  color: #42210e;
}

.mfo-hero-icon {
  filter: drop-shadow(0 7px 7px #9d4b2020);
}

.mfo-section-title,
main.container > h2 {
  color: #302119;
  letter-spacing: -0.35px;
}

#search {
  min-height: 52px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}

#search:focus {
  border-color: var(--mfo-orange);
  box-shadow: 0 0 0 4px #e85d041c;
}

.mfo-services {
  gap: 12px;
}

.mfo-service {
  min-height: 125px;
  border-color: var(--mfo-line);
  box-shadow: 0 3px 12px #41200c06;
}

.restaurant {
  border: 1px solid var(--mfo-line);
  border-radius: 20px;
  box-shadow: 0 5px 20px #45210d0a;
  transition: transform .18s ease, box-shadow .18s ease;
}

.restaurant-info {
  padding: 19px;
}

.restaurant-info h3 {
  font-size: 20px;
  line-height: 1.35;
  letter-spacing: -.3px;
}

.restaurant-info p {
  color: var(--mfo-muted);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.restaurant-info button {
  width: 100%;
  margin-top: 12px;
  min-height: 46px;
}

.restaurant-info button:focus-visible,
button:focus-visible {
  outline: 3px solid #ffb77f;
  outline-offset: 3px;
}

.badge {
  padding: 7px 11px;
  font-weight: 700;
}

.categories {
  padding-top: 5px;
  padding-bottom: 14px;
  scrollbar-width: thin;
}

.category {
  min-height: 42px;
  border-color: var(--mfo-line);
}

.cart-bar {
  position: sticky;
  bottom: 10px;
  border: 1px solid #ffffff20;
  background: #251b16;
  box-shadow: 0 10px 30px #00000024;
}

.cart-bar button {
  min-height: 44px;
  white-space: nowrap;
}

.cart-panel {
  background: #fffaf6;
}

.cart-item,
.cart-total {
  border: 1px solid var(--mfo-line);
  box-shadow: 0 4px 16px #40200b07;
}

.cart-checkout {
  min-height: 46px;
}

#my-orders-panel,
#restaurant-dashboard-panel,
#mfo-rider-dashboard,
#mfo-rider-assignment {
  border-radius: 20px;
}

footer {
  margin-top: 36px;
  padding: 30px 18px;
  border-top: 1px solid var(--mfo-line);
  background: #fff5ed;
  line-height: 1.8;
}

@media (hover: hover) and (pointer: fine) {
  .restaurant:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px #45210d12;
  }

  .mfo-service:hover {
    box-shadow: 0 8px 20px #45210d10;
  }
}

@media (min-width: 700px) {
  main.container {
    padding-top: 30px;
  }

  #restaurants {
    align-items: start;
  }
}

@media (max-width: 380px) {
  header {
    padding: 22px 15px 25px;
  }

  .mfo-hero {
    padding: 22px 16px;
  }

  .mfo-service {
    padding: 14px 11px;
  }

  .cart-bar {
    padding: 12px;
    gap: 8px;
  }

  .cart-bar button {
    padding: 10px;
  }
}

`;

document.head.appendChild(style);
})(); 

// =====================================================
// MEKELLE FOOD ORDER — RIDER DASHBOARD
// =====================================================

(function setupMekelleRiderDashboard() {
  if (document.getElementById("mfo-rider-dashboard")) return;

  const style = document.createElement("style");

  style.textContent = `
    #mfo-rider-dashboard {
      margin: 20px auto;
      max-width: 850px;
      padding: 18px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 16px;
      color: #222;
    }

    #mfo-rider-dashboard button {
      background: #e85d04;
      color: white;
      border: none;
      padding: 11px 15px;
      margin: 5px 5px 5px 0;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    #mfo-rider-dashboard button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    #mfo-rider-dashboard .mfo-rider-order {
      border: 1px solid #eee;
      padding: 14px;
      margin: 12px 0;
      border-radius: 12px;
      overflow-wrap: anywhere;
    }

    #mfo-rider-dashboard .mfo-muted {
      color: #666;
      font-size: 14px;
    }

    #mfo-rider-dashboard [aria-live] {
      overflow-wrap: anywhere;
    }
  `;

  document.head.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "mfo-rider-dashboard";

  panel.innerHTML = `
    <h2>🚴 Delivery Worker Dashboard</h2>
    <p class="mfo-muted">
      Manage assigned deliveries and update their progress.
    </p>

    <button type="button" id="mfo-rider-refresh">
      Refresh Deliveries
    </button>

    <button type="button" id="mfo-rider-location">
      Share My GPS Location
    </button>

    <p id="mfo-rider-message" aria-live="polite">
      Sign in to view your deliveries.
    </p>

    <div id="mfo-rider-orders"></div>
  `;

  document.body.appendChild(panel);

  const message = document.getElementById("mfo-rider-message");
  const ordersContainer = document.getElementById("mfo-rider-orders");
  const refreshButton = document.getElementById("mfo-rider-refresh");
  const locationButton = document.getElementById("mfo-rider-location");

  function say(text) {
    message.textContent = text;
  }

  function addText(parent, tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) element.className = className;

    parent.appendChild(element);
    return element;
  }

  async function getUser() {
    if (!window.supabaseClient) {
      throw new Error("The Supabase connection is not available.");
    }

    const { data, error } =
      await window.supabaseClient.auth.getUser();

    if (error) throw error;

    if (!data.user) {
      throw new Error("Please sign in before opening the rider dashboard.");
    }

    return data.user;
  }

  async function loadDeliveries() {
    ordersContainer.replaceChildren();

    try {
      const user = await getUser();

      say("Loading your assigned deliveries...");

      const { data, error } = await window.supabaseClient
        .from("delivery_assignments")
        .select(`
          id,
          order_id,
          worker_id,
          status,
          created_at,
          orders (
            id,
            delivery_address,
            food_total,
            delivery_fee,
            total_amount,
            payment_status,
            order_status,
            restaurants (
              name,
              address,
              phone
            )
          )
        `)
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const assignments = data || [];

      if (!assignments.length) {
        say("No deliveries are assigned to your account yet.");
        return;
      }

      say("Your assigned deliveries: " + assignments.length);

      assignments.forEach(function (assignment) {
        const order = assignment.orders;

        if (!order) return;

        const card = document.createElement("article");
        card.className = "mfo-rider-order";

        addText(card, "h3", "Order #" + order.id.slice(0, 8));

        addText(
          card,
          "p",
          "Delivery status: " + assignment.status
        );

        addText(
          card,
          "p",
          "Payment: " + order.payment_status
        );

        addText(
          card,
          "p",
          "Order status: " + order.order_status
        );

        addText(
          card,
          "p",
          "Restaurant: " +
            (order.restaurants?.name || "Restaurant")
        );

        addText(
          card,
          "p",
          "Pickup address: " +
            (order.restaurants?.address || "Not provided")
        );

        addText(
          card,
          "p",
          "Delivery address: " +
            (order.delivery_address || "Not provided")
        );

        addText(
          card,
          "p",
          "Order total: " +
            Number(order.total_amount || 0).toLocaleString() +
            " ETB"
        );

        const action = document.createElement("button");
        action.type = "button";

        if (order.payment_status !== "paid") {
          action.textContent = "Waiting for payment";
          action.disabled = true;
        } else if (
          assignment.status === "assigned" &&
          order.order_status === "ready"
        ) {
          action.textContent = "Accept Delivery";
          action.dataset.nextStatus = "accepted";
        } else if (
          assignment.status === "accepted" &&
          order.order_status === "ready"
        ) {
          action.textContent = "Confirm Pickup";
          action.dataset.nextStatus = "picked_up";
        } else if (
          assignment.status === "picked_up" &&
          order.order_status === "picked_up"
        ) {
          action.textContent = "Mark Delivered";
          action.dataset.nextStatus = "delivered";
        } else if (assignment.status === "delivered") {
          action.textContent = "Delivery Completed";
          action.disabled = true;
        } else {
          action.textContent = "Waiting for Restaurant";
          action.disabled = true;
        }

        if (action.dataset.nextStatus) {
          action.addEventListener("click", async function () {
            action.disabled = true;
            say("Updating delivery status...");

            try {
              const { error } = await window.supabaseClient.rpc(
                "update_delivery_status",
                {
                  p_order_id: assignment.order_id,
                  p_new_status: action.dataset.nextStatus
                }
              );

              if (error) throw error;

              say("Delivery status updated successfully.");
              await loadDeliveries();
            } catch (error) {
              say("Could not update delivery: " + error.message);
              action.disabled = false;
            }
          });
        }

        card.appendChild(action);
        ordersContainer.appendChild(card);
      });
    } catch (error) {
      say(error.message || "Could not load deliveries.");
    }
  }

  async function shareLocation() {
    if (!navigator.geolocation) {
      say("GPS location is not supported by this browser.");
      return;
    }

    locationButton.disabled = true;
    say("Requesting your current location...");

    navigator.geolocation.getCurrentPosition(
      async function (position) {
        try {
          const user = await getUser();

          const { error } = await window.supabaseClient
            .from("rider_locations")
            .upsert(
              {
                worker_id: user.id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                updated_at: new Date().toISOString()
              },
              { onConflict: "worker_id" }
            );

          if (error) throw error;

          say("Your current GPS location was saved successfully.");
        } catch (error) {
          say("Could not save GPS location: " + error.message);
        } finally {
          locationButton.disabled = false;
        }
      },
      function (error) {
        say(
          error.code === 1
            ? "Location permission was denied. Allow location access to share GPS."
            : "Could not get your location. Check GPS and try again."
        );

        locationButton.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  }

  refreshButton.addEventListener("click", loadDeliveries);
  locationButton.addEventListener("click", shareLocation);

  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange(function () {
      window.setTimeout(loadDeliveries, 0);
    });
  }

  loadDeliveries();
})();  

// =====================================================
// MEKELLE FOOD ORDER — RESTAURANT RIDER ASSIGNMENT
// =====================================================

(function setupRestaurantRiderAssignment() {
  if (document.getElementById("mfo-rider-assignment")) return;

  const style = document.createElement("style");
  style.textContent = `
    #mfo-rider-assignment {
      max-width: 850px;
      margin: 20px auto;
      padding: 18px;
      background: #fff;
      color: #222;
      border: 1px solid #eee;
      border-radius: 16px;
    }

    #mfo-rider-assignment .mfo-assignment-card {
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 14px;
      margin: 12px 0;
      overflow-wrap: anywhere;
    }

    #mfo-rider-assignment select,
    #mfo-rider-assignment button {
      min-height: 44px;
      padding: 10px;
      margin: 5px 5px 5px 0;
      border-radius: 8px;
    }

    #mfo-rider-assignment select {
      max-width: 100%;
      border: 1px solid #ccc;
      background: #fff;
    }

    #mfo-rider-assignment button {
      border: none;
      background: #e85d04;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    #mfo-rider-assignment button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    #mfo-rider-assignment .mfo-assignment-muted {
      color: #666;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "mfo-rider-assignment";

  panel.innerHTML = `
    <h2>🚴 Restaurant Delivery Dispatch</h2>
    <p class="mfo-assignment-muted">
      Assign delivery workers to paid orders that are ready for pickup.
    </p>
    <button type="button" id="mfo-dispatch-refresh">
      Refresh Orders
    </button>
    <p id="mfo-dispatch-message" aria-live="polite">
      Sign in to load restaurant orders.
    </p>
    <div id="mfo-dispatch-orders"></div>
  `;

  document.body.appendChild(panel);

  const client = () => window.supabaseClient;
  const message = panel.querySelector("#mfo-dispatch-message");
  const ordersBox = panel.querySelector("#mfo-dispatch-orders");
  const refreshButton = panel.querySelector("#mfo-dispatch-refresh");

  function setMessage(text) {
    message.textContent = text;
  }

  function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  async function loadDispatchOrders() {
    ordersBox.replaceChildren();

    try {
      if (!client()) {
        throw new Error("The Supabase connection is unavailable.");
      }

      const { data: authData, error: authError } =
        await client().auth.getUser();

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error("Please sign in first.");
      }

      setMessage("Loading your restaurant orders...");

      const { data: profile, error: profileError } =
  await client()
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

if (profileError) throw profileError;

if (profile?.role !== "admin") {
  throw new Error("Only administrators can access delivery dispatch.");
}

const { data: restaurants, error: restaurantError } =
  await client()
    .from("restaurants")
    .select("id, name")
    .eq("is_approved", true);

      if (restaurantError) throw restaurantError;

      if (!restaurants || restaurants.length === 0) {
        setMessage(
          "No restaurant is linked to this account. Sign in with the account that owns your restaurant."
        );
        return;
      }

      const restaurantIds = restaurants.map(r => r.id);

      const { data: orders, error: ordersError } =
        await client()
          .from("orders")
          .select(`
            id,
            restaurant_id,
            delivery_address,
            sender_name,
            sender_phone,
            sender_address,
            recipient_name,
            recipient_phone,
            total_amount,
            payment_status,
            order_status,
            created_at,
            delivery_worker_id
          `)
          .in("restaurant_id", restaurantIds)
          .in("order_status", ["ready"])
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const { data: workers, error: workersError } =
        await client().rpc("get_delivery_workers");

      if (workersError) throw workersError;

      const workerList = workers || [];
      const orderList = orders || [];

      if (!orderList.length) {
        setMessage(
          "No paid orders are currently ready for rider assignment."
        );
        return;
      }

      setMessage(
        "Ready orders: " + orderList.length +
        " · Delivery workers found: " + workerList.length
      );

      for (const order of orderList) {
        const card = document.createElement("article");
        card.className = "mfo-assignment-card";

        const restaurant = restaurants.find(
          r => r.id === order.restaurant_id
        );

        addText(card, "h3", "Order #" + order.id.slice(0, 8));
        addText(card, "p", "Restaurant: " + (restaurant?.name || "Restaurant"));
        addText(card, "p", "Payment: Paid");
        addText(card, "p", "Order status: Ready");
        addText(
          card,
          "p",
          "Delivery address: " + (order.delivery_address || "Not provided")
        );
                // SENDER DETAILS
        addText(card, "h4", "📤 Sender Details");
        addText(card, "p", "Name: " + (order.sender_name || "Not provided"));
        addText(card, "p", "Phone: " + (order.sender_phone || "Not provided"));
        addText(card, "p", "Address: " + (order.sender_address || "Not provided"));

        // RECIPIENT DETAILS
        addText(card, "h4", "📥 Recipient Details");
        addText(card, "p", "Name: " + (order.recipient_name || "Not provided"));
        addText(card, "p", "Phone: " + (order.recipient_phone || "Not provided"));
        addText(
          card,
          "p",
          "Order total: " +
            Number(order.total_amount || 0).toLocaleString() + " ETB"
        );

        if (order.delivery_worker_id) {
          const assignedWorker = workerList.find(
            w => w.worker_id === order.delivery_worker_id
          );

          addText(
            card,
            "p",
            "Assigned rider: " +
              (assignedWorker?.worker_name || "Already assigned")
          );

          ordersBox.appendChild(card);
          continue;
        }

        if (workerList.length === 0) {
          addText(
            card,
            "p",
            "No delivery workers are registered with an eligible role."
          );
          ordersBox.appendChild(card);
          continue;
        }

        const select = document.createElement("select");
        select.setAttribute("aria-label", "Select delivery worker");

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose a delivery worker";
        select.appendChild(placeholder);

        workerList.forEach(worker => {
          const option = document.createElement("option");
          option.value = worker.worker_id;

          option.textContent =
            worker.worker_name +
            (worker.worker_phone ? " · " + worker.worker_phone : "");

          select.appendChild(option);
        });

        card.appendChild(select);

        const assignButton = document.createElement("button");
        assignButton.type = "button";
        assignButton.textContent = "Assign Rider";

        assignButton.addEventListener("click", async () => {
          if (!select.value) {
            setMessage("Choose a delivery worker first.");
            return;
          }

          assignButton.disabled = true;
          setMessage("Assigning delivery worker...");

          try {
            const { error } = await client().rpc(
              "assign_delivery_worker",
              {
                p_order_id: order.id,
                p_worker_id: select.value
              }
            );

            if (error) throw error;

            setMessage("Rider assigned successfully.");
            await loadDispatchOrders();
          } catch (error) {
            setMessage("Assignment failed: " + error.message);
            assignButton.disabled = false;
          }
        });

        card.appendChild(assignButton);
        ordersBox.appendChild(card);
      }
    } catch (error) {
      setMessage(
        "Could not load dispatch orders: " +
        (error.message || "Unknown error")
      );
    }
  }

  refreshButton.addEventListener("click", loadDispatchOrders);

  if (client()) {
    client().auth.onAuthStateChange(() => {
      window.setTimeout(loadDispatchOrders, 0);
    });
  }

  loadDispatchOrders();
})();  

// TEMPORARY DEVELOPMENT TEST PAYMENT BUTTON
(function setupTestPaymentButton() {
  const testOrderId =
  "8cbaa0f6-637f-4481-a833-70594b850b4a";

  const authorizedTesterId =
  "c71641dd-9de8-457a-861b-0571e655b4aa";
  
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = "Simulate Successful Payment";
  button.style.cssText = `
    display: block;
    margin: 20px auto;
    padding: 14px 20px;
    background: #e85d04;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  `;

  button.addEventListener("click", async function () {
    button.disabled = true;
    button.textContent = "Processing test payment...";

    try {
      const {
        data: { user },
        error: authError
      } = await supabaseClient.auth.getUser();

      if (authError || !user || user.id !== authorizedTesterId) {
        throw new Error(
          "Sign in with your authorized testing account."
        );
      }

      const { data, error } =
        await supabaseClient.rpc("simulate_test_payment", {
          p_order_id: testOrderId
        });

      if (error) throw error;

      alert(
        "TEST PAYMENT SUCCESSFUL\n\n" +
        "No real money was transferred.\n" +
        "Order ID: " + data.order_id
      );

      button.textContent = "Test Payment Completed";
    } catch (error) {
      alert("Test payment failed: " + error.message);
      button.disabled = false;
      button.textContent = "Simulate Successful Payment";
    }
  });

  document.body.appendChild(button);
})();  

// START ROLE-BASED DASHBOARD CONTROL
async function applyRoleVisibility(user) {
  const authPanel =
    document.getElementById("auth-panel");

  const main =
    document.querySelector("main.container");

  const restaurantPanel =
    document.getElementById("restaurant-dashboard-panel");

  const adminPanel =
    document.getElementById("admin-dashboard-panel");

  const riderPanel =
    document.getElementById("mfo-rider-dashboard");

  const riderAssignmentPanel =
    document.getElementById("mfo-rider-assignment");

  const ordersPanel =
    document.getElementById("my-orders-panel");

  const myOrdersButton =
    document.getElementById("my-orders-button");

  const restaurantButton =
    document.getElementById("restaurant-dashboard-button");

  function hideAllProtectedPanels() {
    if (main) main.hidden = true;
    if (restaurantPanel) restaurantPanel.hidden = true;
    if (adminPanel) adminPanel.hidden = true;
    if (riderPanel) riderPanel.hidden = true;
    if (riderAssignmentPanel) riderAssignmentPanel.hidden = true;
    if (ordersPanel) ordersPanel.hidden = true;
    if (myOrdersButton) myOrdersButton.hidden = true;
    if (restaurantButton) restaurantButton.hidden = true;
  }

  // Signed-out users see authentication only.
  if (!user) {
    hideAllProtectedPanels();

    if (authPanel) authPanel.hidden = false;

    return;
  }

  // Read the user's role from Supabase.
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile?.role) {
    console.error("Could not verify account role:", error);

    if (authPanel) authPanel.hidden = true;

    hideAllProtectedPanels();

    alert(
      "Your account role could not be verified. Please contact support."
    );

    return;
  }

  const role =
    String(profile.role).toLowerCase().trim();

  const isAdmin =
    role === "admin";

  const isCustomer =
    ["customer", "buyer"].includes(role);

    const isRestaurant =
    role === "restaurant_owner";

  const isRider = [
    "rider",
    "delivery",
    "delivery_worker",
    "delivery-worker"
  ].includes(role);

  // Reject unsupported roles.
  if (!isAdmin && !isCustomer && !isRestaurant && !isRider) {
    if (authPanel) authPanel.hidden = true;

    hideAllProtectedPanels();

    console.error("Unsupported account role:", role);

    alert("This account has no supported dashboard role.");

    return;
  }

  if (authPanel) authPanel.hidden = true;

  // Customer interface.
  if (main) main.hidden = !isCustomer;

  if (ordersPanel) {
    ordersPanel.hidden = !isCustomer;
  }

  if (myOrdersButton) {
    myOrdersButton.hidden = !isCustomer;
  }

  // Restaurant interface.
  if (restaurantPanel) {
    restaurantPanel.hidden = !isRestaurant;
  }

  if (restaurantButton) {
    restaurantButton.hidden = !isRestaurant;
  }

 if (riderAssignmentPanel) {
  riderAssignmentPanel.hidden = !isAdmin;
}

  // Rider interface.
  if (riderPanel) {
    riderPanel.hidden = !isRider;
  }

  // Admin interface.
  if (adminPanel) {
    adminPanel.hidden = !isAdmin;
  }
}
  
// END ROLE-BASED DASHBOARD CONTROL

// START ADMIN DASHBOARD STATISTICS

async function loadAdminDashboardStats() {
  const ordersElement =
    document.getElementById("admin-total-orders");

  const salesElement =
    document.getElementById("admin-total-sales");

  const restaurantsElement =
    document.getElementById("admin-total-restaurants");

  const ridersElement =
    document.getElementById("admin-total-riders");

  const customersElement =
    document.getElementById("admin-total-customers");

  try {
    // Load real orders, excluding test orders.
    const { data: orders, error: ordersError } =
      await supabaseClient
        .from("orders")
        .select("id, total_amount, is_test_order");

    if (ordersError) throw ordersError;

    const realOrders = (orders || []).filter(
      order => order.is_test_order !== true
    );

    const totalOrders = realOrders.length;

    const totalSales = realOrders.reduce(
      (sum, order) => sum + (Number(order.total_amount) || 0),
      0
    );

    if (ordersElement) {
      ordersElement.textContent = totalOrders.toLocaleString();
    }

    if (salesElement) {
      salesElement.textContent =
        totalSales.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + " ETB";
    }

    // Load restaurant count.
    const { count: restaurantCount, error: restaurantError } =
      await supabaseClient
        .from("restaurants")
        .select("id", {
          count: "exact",
          head: true
        });

    if (restaurantError) throw restaurantError;

    if (restaurantsElement) {
      restaurantsElement.textContent =
        (restaurantCount ?? 0).toLocaleString();
    }

    // Load rider and customer counts using the existing secure RPC.
    const { data: profileCounts, error: profileError } =
      await supabaseClient.rpc("get_admin_profile_counts");

    if (profileError) throw profileError;

    const counts = Array.isArray(profileCounts)
      ? profileCounts[0]
      : profileCounts;

    if (!counts) {
      throw new Error("Admin profile counts were not returned.");
    }

    if (ridersElement) {
      ridersElement.textContent =
        Number(counts.total_riders ?? 0).toLocaleString();
    }

    if (customersElement) {
      customersElement.textContent =
        Number(counts.total_customers ?? 0).toLocaleString();
    }

    console.log("Admin dashboard statistics loaded successfully.");

  } catch (error) {
    console.error("Admin statistics failed to load:", error);
  }
}

// END ADMIN DASHBOARD STATISTICS

// START ADMIN ORDERS MANAGEMENT

async function loadAdminOrders() {
  const tableBody = document.getElementById("admin-orders-table-body");
  const message = document.getElementById("admin-orders-message");
  const searchInput = document.getElementById("admin-order-search");

  if (!tableBody) return;

  if (message) {
    message.textContent = "Loading orders...";
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="padding:18px;text-align:center;">
        Loading orders...
      </td>
    </tr>
  `;

  try {
    const { data: orders, error } = await supabaseClient
      .from("orders")
      .select(`
        id,
        customer_id,
        restaurant_id,
        total_amount,
        order_status,
        created_at,
        is_test_order
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const realOrders = (orders || []).filter(
      order => order.is_test_order !== true
    );

    const customerIds = [
      ...new Set(
        realOrders
          .map(order => order.customer_id)
          .filter(Boolean)
      )
    ];

    const restaurantIds = [
      ...new Set(
        realOrders
          .map(order => order.restaurant_id)
          .filter(Boolean)
      )
    ];

    let customerNames = {};
    let restaurantNames = {};

    if (customerIds.length > 0) {
      const { data: customers, error: customerError } =
        await supabaseClient
          .from("profiles")
          .select("id, full_name")
          .in("id", customerIds);

      if (customerError) {
        console.error("Customer names could not be loaded:", customerError);
      } else {
        (customers || []).forEach(customer => {
          customerNames[customer.id] =
            customer.full_name || "Customer";
        });
      }
    }

    if (restaurantIds.length > 0) {
      const { data: restaurants, error: restaurantError } =
        await supabaseClient
          .from("restaurants")
          .select("id, name")
          .in("id", restaurantIds);

      if (restaurantError) {
        console.error("Restaurant names could not be loaded:", restaurantError);
      } else {
        (restaurants || []).forEach(restaurant => {
          restaurantNames[restaurant.id] =
            restaurant.name || "Restaurant";
        });
      }
    }

    function escapeOrderText(value) {
      return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]);
    }

    function shortOrderId(id) {
      return String(id || "").slice(0, 8).toUpperCase();
    }

    function formatOrderDate(date) {
      if (!date) return "—";

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) return "—";

      return parsedDate.toLocaleString();
    }

    function renderOrders() {
      const searchTerm =
        (searchInput?.value || "").trim().toLowerCase();

      const filteredOrders = realOrders.filter(order => {
        const id = shortOrderId(order.id).toLowerCase();
        const status = String(order.order_status || "pending").toLowerCase();
        const customer = String(
          customerNames[order.customer_id] || "Customer"
        ).toLowerCase();
        const restaurant = String(
          restaurantNames[order.restaurant_id] || "Restaurant"
        ).toLowerCase();

        return (
          id.includes(searchTerm) ||
          status.includes(searchTerm) ||
          customer.includes(searchTerm) ||
          restaurant.includes(searchTerm)
        );
      });

      if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="padding:18px;text-align:center;">
              No matching orders found.
            </td>
          </tr>
        `;

        if (message) {
          message.textContent =
            `Showing 0 of ${realOrders.length} orders.`;
        }

        return;
      }

      tableBody.innerHTML = filteredOrders.map(order => {
        const status = String(order.order_status || "pending");
        const safeStatus = escapeOrderText(status);
        const statusColor =
          status.toLowerCase() === "delivered" ? "#15803d" :
          status.toLowerCase() === "cancelled" ? "#b91c1c" :
          "#9a5700";

        return `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">
              #${escapeOrderText(shortOrderId(order.id))}
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;">
              ${escapeOrderText(customerNames[order.customer_id] || "Customer")}
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;">
              ${escapeOrderText(restaurantNames[order.restaurant_id] || "Restaurant")}
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;white-space:nowrap;">
              ${(Number(order.total_amount) || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ETB
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;">
              <span style="
                display:inline-block;
                padding:5px 9px;
                border-radius:20px;
                background:#fff3e8;
                color:${statusColor};
                font-size:12px;
                font-weight:600;
              ">${safeStatus}</span>
            </td>
            <td style="padding:12px;border-bottom:1px solid #eee;white-space:nowrap;">
              ${escapeOrderText(formatOrderDate(order.created_at))}
            </td>
          </tr>
        `;
      }).join("");

      if (message) {
        message.textContent =
          `Showing ${filteredOrders.length} of ${realOrders.length} orders.`;
      }
    }

    if (searchInput && !searchInput.dataset.ordersSearchAttached) {
      searchInput.addEventListener("input", renderOrders);
      searchInput.dataset.ordersSearchAttached = "true";
    }

    renderOrders();

  } catch (error) {
    console.error("Admin orders failed to load:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="padding:18px;text-align:center;color:#b91c1c;">
          Unable to load orders. Please try refreshing.
        </td>
      </tr>
    `;

    if (message) {
      message.textContent =
        "Order loading error: " + (error?.message || "Unknown error");
    }
  }
}

// END ADMIN ORDERS MANAGEMENT

// KEEP DASHBOARDS SEPARATED
(function enforceDashboardSeparation() {
  let lastUserId = null;
  let lastRole = null;
  let refreshInProgress = false;

  async function refreshRoleScreens() {
    if (refreshInProgress) return;
    refreshInProgress = true;

    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) throw error;

      const user = data?.session?.user;

      if (!user) {
        lastUserId = null;
        lastRole = null;
        await applyRoleVisibility(null);
        return;
      }

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.role) {
        await applyRoleVisibility(user);
        return;
      }

      const role = String(profile.role).toLowerCase().trim();

      if (user.id === lastUserId && role === lastRole) {
        return;
      }

    lastUserId = user.id;
      lastRole = role;

      await applyRoleVisibility(user);

      // Load statistics only for the admin account.
      if (role === "admin") {
      await loadAdminDashboardStats();
      await loadAdminOrders();
     }
      
    } catch (error) {
      console.error("Dashboard refresh failed:", error);
    } finally {
      refreshInProgress = false;
    }
  }

  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange(() => {
      window.setTimeout(refreshRoleScreens, 0);
    });
  }

  refreshRoleScreens();
})();
  
// START APP
loadRestaurants();
