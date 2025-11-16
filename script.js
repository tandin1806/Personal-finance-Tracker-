// User data storage and authentication functions
const UserAuth = {
  // Initialize user data in localStorage
  init: function() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify({}));
    }
    if (!localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(null));
    }
  },

  // Validate password strength
  validatePassword: function(password) {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements: requirements
    };
  },

  // Update password requirement indicators
  updatePasswordRequirements: function(password) {
    const validation = this.validatePassword(password);
    const requirements = validation.requirements;
    
    document.getElementById('req-length').className = requirements.length ? 'valid' : 'invalid';
    document.getElementById('req-uppercase').className = requirements.uppercase ? 'valid' : 'invalid';
    document.getElementById('req-lowercase').className = requirements.lowercase ? 'valid' : 'invalid';
    document.getElementById('req-number').className = requirements.number ? 'valid' : 'invalid';
    document.getElementById('req-special').className = requirements.special ? 'valid' : 'invalid';
    
    return validation.isValid;
  },

  // Register new user
  register: function(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if user already exists
    if (users[email]) {
      return { success: false, message: 'User with this email already exists' };
    }
    
    // Validate password
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, message: 'Password does not meet requirements' };
    }
    
    // Create new user
    users[email] = {
      name: name,
      email: email,
      password: password, // In a real app, this should be hashed
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('currentUser', JSON.stringify({
      name: name,
      email: email
    }));
    
    return { success: true, message: 'Account created successfully' };
  },

  // Login user
  login: function(email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if user exists
    if (!users[email]) {
      return { success: false, message: 'No account found with this email' };
    }
    
    // Check password
    if (users[email].password !== password) {
      return { success: false, message: 'Incorrect password' };
    }
    
    // Set as current user
    localStorage.setItem('currentUser', JSON.stringify({
      name: users[email].name,
      email: email
    }));
    
    return { success: true, message: 'Login successful' };
  },

  // Get current user
  getCurrentUser: function() {
    return JSON.parse(localStorage.getItem('currentUser'));
  },

  // Logout user
  logout: function() {
    localStorage.setItem('currentUser', JSON.stringify(null));
  },

  // Check if user is logged in
  isLoggedIn: function() {
    return this.getCurrentUser() !== null;
  }
};

// Initialize authentication when page loads
document.addEventListener('DOMContentLoaded', function() {
  UserAuth.init();
  
  // Set up password validation on input
  const signupPassword = document.getElementById('signup-password');
  if (signupPassword) {
    signupPassword.addEventListener('input', function() {
      UserAuth.updatePasswordRequirements(this.value);
    });
  }
});

// Open modal
function openModal(id) {
  document.getElementById(id).style.display = "block";
  
  // Clear previous messages when opening modal
  const errorMessages = document.querySelectorAll('.error-message, .success-message');
  errorMessages.forEach(msg => {
    msg.style.display = 'none';
    msg.textContent = '';
  });
  
  // Clear form fields when opening modal
  if (id === 'loginModal') {
    document.getElementById('loginForm').reset();
  } else if (id === 'signupModal') {
    document.getElementById('signupForm').reset();
    // Reset password requirements display
    const reqItems = document.querySelectorAll('.password-requirements li');
    reqItems.forEach(item => {
      item.className = '';
    });
  } else if (id === 'forgotModal') {
    document.getElementById('forgotForm').reset();
  }
}

// Close modal
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

// Scroll to features
function scrollToFeatures() {
  document.querySelector("#features").scrollIntoView({ behavior: "smooth" });
}

// Login form handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorElement = document.getElementById("login-error");
    
    // Validate inputs
    if (!email || !password) {
      errorElement.textContent = "Please fill in all fields";
      errorElement.style.display = "block";
      return;
    }
    
    // Attempt login
    const result = UserAuth.login(email, password);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      errorElement.textContent = result.message;
      errorElement.style.display = "block";
    }
  });
}

// Signup form handler
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const errorElement = document.getElementById("signup-error");
    
    // Validate inputs
    if (!name || !email || !password) {
      errorElement.textContent = "Please fill in all fields";
      errorElement.style.display = "block";
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorElement.textContent = "Please enter a valid email address";
      errorElement.style.display = "block";
      return;
    }
    
    // Validate password
    const passwordValidation = UserAuth.validatePassword(password);
    if (!passwordValidation.isValid) {
      errorElement.textContent = "Password does not meet all requirements";
      errorElement.style.display = "block";
      return;
    }
    
    // Attempt registration
    const result = UserAuth.register(name, email, password);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      errorElement.textContent = result.message;
      errorElement.style.display = "block";
    }
  });
}

// Forgot password handler
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("forgot-email").value;
    const errorElement = document.getElementById("forgot-error");
    const successElement = document.getElementById("forgot-success");
    
    // Validate email
    if (!email) {
      errorElement.textContent = "Please enter your email address";
      errorElement.style.display = "block";
      successElement.style.display = "none";
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if user exists
    if (users[email]) {
      // In a real app, you would send an email here
      successElement.textContent = `If an account exists for ${email}, a reset link has been sent.`;
      successElement.style.display = "block";
      errorElement.style.display = "none";
      
      // Clear form after successful submission
      setTimeout(() => {
        closeModal('forgotModal');
      }, 3000);
    } else {
      errorElement.textContent = "No account found with this email";
      errorElement.style.display = "block";
      successElement.style.display = "none";
    }
  });
}