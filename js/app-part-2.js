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
