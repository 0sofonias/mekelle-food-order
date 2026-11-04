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
