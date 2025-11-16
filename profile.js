// profile.js — FULL updated file with fixed achievement system

// -----------------------------
// Initialization
// -----------------------------
document.addEventListener('DOMContentLoaded', function () {
  console.log('Profile page loaded');

  // Ensure default storage keys exist
  initializeData();

  // Load profile (including image)
  loadProfileData();

  // Wire up listeners for buttons/features
  setupEventListeners();

  // Check and update achievements display
  checkAchievements();
  updateAchievementDisplay();
});


  // Add this to your existing profile.js file, in the setupEventListeners function:

function setupEventListeners() {
  console.log('Setting up event listeners');

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (menuToggle && sidebar && mobileOverlay) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
      mobileOverlay.classList.toggle('show');
    });

    mobileOverlay.addEventListener('click', function() {
      sidebar.classList.remove('show');
      mobileOverlay.classList.remove('show');
    });

    // Close sidebar when clicking on nav items on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        if (window.innerWidth <= 992) {
          sidebar.classList.remove('show');
          mobileOverlay.classList.remove('show');
        }
      });
    });
  }

  // Edit Profile Button (main nav)
  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) editProfileBtn.addEventListener('click', showEditProfile);

  const editProfileLink = document.getElementById('edit-profile-link');
  if (editProfileLink) editProfileLink.addEventListener('click', function (e) {
    e.preventDefault();
    showEditProfile();
  });

  // Cancel edit
  const cancelEdit = document.getElementById('cancel-edit-btn');
  if (cancelEdit) cancelEdit.addEventListener('click', showProfileView);

  // Update (save) profile
  const updateBtn = document.getElementById('update-btn');
  if (updateBtn) updateBtn.addEventListener('click', updateProfile);

  // Achievement link
  const achievementLink = document.getElementById('achievement-link');
  if (achievementLink) achievementLink.addEventListener('click', function (e) {
    e.preventDefault();
    showAchievements();
  });

  // Security link -> show modal
  const securityLink = document.getElementById('security-link');
  if (securityLink) securityLink.addEventListener('click', function (e) {
    e.preventDefault();
    const securityModalEl = document.getElementById('securityModal');
    if (securityModalEl) {
      const securityModal = new bootstrap.Modal(securityModalEl);
      securityModal.show();
    }
  });

  // Back to profile from achievements
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', showProfileView);

  // Logout flow
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const logoutModalEl = document.getElementById('logoutConfirmModal');
    if (logoutModalEl) new bootstrap.Modal(logoutModalEl).show();
  });

  const confirmLogout = document.getElementById('confirm-logout-btn');
  if (confirmLogout) confirmLogout.addEventListener('click', function () {
    // Redirect to index (demo)
    window.location.href = 'index.html';
  });

  // Wire up existing file inputs if present (support both old and new id names)
  const viewInput = document.getElementById('profileInputView') || document.getElementById('profile-pic-input');
  const editInput = document.getElementById('profileInputEdit') || document.getElementById('profile-pic-input-edit');

  if (viewInput) viewInput.addEventListener('change', handleProfilePicUpload);
  if (editInput) editInput.addEventListener('change', handleProfilePicUpload);

  // Security modal sub-events
  setupSecurityModalEvents();

  // Camera popups (view + edit)
  setupCameraPopup();
}

// -----------------------------
// Load profile data from localStorage
// -----------------------------
function loadProfileData() {
  const defaultData = {
    name: 'User',
    phone: '+1234567890',
    email: 'user@example.com',
    address: '123 Main Street',
    occupation: 'Student',
    bio: 'Short bio about me.',
    profilePic: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
  };

  const profileData = Object.assign({}, defaultData, JSON.parse(localStorage.getItem('profileData') || '{}'));

  // View fields
  const elViewName = document.getElementById('view-name');
  if (elViewName) elViewName.textContent = profileData.name;

  const elViewFull = document.getElementById('view-fullname');
  if (elViewFull) elViewFull.textContent = profileData.name;

  const elPhone = document.getElementById('view-phone');
  if (elPhone) elPhone.textContent = profileData.phone;

  const elEmail = document.getElementById('view-email');
  if (elEmail) elEmail.textContent = profileData.email;

  const elAddress = document.getElementById('view-address');
  if (elAddress) elAddress.textContent = profileData.address;

  const elOccupation = document.getElementById('view-occupation');
  if (elOccupation) elOccupation.textContent = profileData.occupation;

  const elBio = document.getElementById('view-bio');
  if (elBio) elBio.textContent = profileData.bio;

  // Profile images (view & edit)
  const mainPic = document.getElementById('main-profile-pic');
  const editPic = document.getElementById('edit-profile-pic');

  if (mainPic) {
    mainPic.src = profileData.profilePic;
    applyNoProfileVisual(mainPic, profileData.profilePic);
  }
  if (editPic) {
    editPic.src = profileData.profilePic;
    applyNoProfileVisual(editPic, profileData.profilePic);
  }

  // Edit form values
  const nameInput = document.getElementById('name');
  if (nameInput) nameInput.value = profileData.name;

  const phoneInput = document.getElementById('phone');
  if (phoneInput) phoneInput.value = profileData.phone;

  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.value = profileData.email;

  const addressInput = document.getElementById('address');
  if (addressInput) addressInput.value = profileData.address;

  const occupationInput = document.getElementById('occupation');
  if (occupationInput) occupationInput.value = profileData.occupation;

  const bioInput = document.getElementById('bio');
  if (bioInput) bioInput.value = profileData.bio;
}

// -----------------------------
// Show / Hide sections
// -----------------------------
function showProfileView() {
  const view = document.getElementById('profile-view-section');
  const edit = document.getElementById('profile-section');
  const ach = document.getElementById('achievement-section');
  if (view) view.style.display = 'block';
  if (edit) edit.style.display = 'none';
  if (ach) ach.style.display = 'none';
}

function showEditProfile() {
  const view = document.getElementById('profile-view-section');
  const edit = document.getElementById('profile-section');
  const ach = document.getElementById('achievement-section');
  if (view) view.style.display = 'none';
  if (edit) edit.style.display = 'block';
  if (ach) ach.style.display = 'none';
}

function showAchievements() {
  const view = document.getElementById('profile-view-section');
  const edit = document.getElementById('profile-section');
  const ach = document.getElementById('achievement-section');
  if (view) view.style.display = 'none';
  if (edit) edit.style.display = 'none';
  if (ach) ach.style.display = 'block';
  updateAchievementDisplay();
}

// -----------------------------
// Update / Save profile
// -----------------------------
function updateProfile() {
  const name = document.getElementById('name') ? document.getElementById('name').value : '';
  const phone = document.getElementById('phone') ? document.getElementById('phone').value : '';
  const email = document.getElementById('email') ? document.getElementById('email').value : '';
  const address = document.getElementById('address') ? document.getElementById('address').value : '';
  const occupation = document.getElementById('occupation') ? document.getElementById('occupation').value : '';
  const bio = document.getElementById('bio') ? document.getElementById('bio').value : '';

  const existing = JSON.parse(localStorage.getItem('profileData') || '{}');
  existing.name = name;
  existing.phone = phone;
  existing.email = email;
  existing.address = address;
  existing.occupation = occupation;
  existing.bio = bio;

  // Keep profilePic (don't overwrite)
  if (!existing.profilePic) existing.profilePic = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  localStorage.setItem('profileData', JSON.stringify(existing));

  // Refresh UI
  loadProfileData();
  showProfileView();
  alert('Profile updated successfully!');
}

// -----------------------------
// Handle profile picture upload
// (works for both view & edit inputs)
// -----------------------------
function handleProfilePicUpload(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;

    // Update both images
    const mainPic = document.getElementById('main-profile-pic');
    const editPic = document.getElementById('edit-profile-pic');
    if (mainPic) {
      mainPic.src = dataUrl;
      applyNoProfileVisual(mainPic, dataUrl);
    }
    if (editPic) {
      editPic.src = dataUrl;
      applyNoProfileVisual(editPic, dataUrl);
    }

    // Persist
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    profileData.profilePic = dataUrl;
    localStorage.setItem('profileData', JSON.stringify(profileData));
  };
  reader.readAsDataURL(file);
}

// -----------------------------
// Camera popup logic for view + edit
// IDs in your HTML are:
// view: cameraIconView, profileOptionsView, changePicView, removePicView, profileInputView
// edit: cameraIconEdit, profileOptionsEdit, changePicEdit, removePicEdit, profileInputEdit
// -----------------------------
function setupCameraPopup() {
  // Helper to wire a set
  function wireSet({iconId, menuId, changeId, removeId, inputId, imageIds}) {
    const icon = document.getElementById(iconId);
    const menu = document.getElementById(menuId);
    const changeBtn = document.getElementById(changeId);
    const removeBtn = document.getElementById(removeId);
    const fileInput = document.getElementById(inputId);

    if (!icon || !menu) return;

    // Toggle menu on camera icon click
    icon.addEventListener('click', function (e) {
      e.stopPropagation();
      // position: ensure visible (menu positioned by CSS relative to container)
      menu.style.display = menu.style.display === 'flex' || menu.style.display === 'block' ? 'none' : 'flex';
      menu.style.flexDirection = 'column';
    });

    // Change photo -> trigger associated file input
    if (changeBtn) {
      changeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (fileInput) fileInput.click();
        menu.style.display = 'none';
      });
    }

    // Remove photo -> set to default and persist
    if (removeBtn) {
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const defaultPic = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
        (imageIds || []).forEach(id => {
          const imgEl = document.getElementById(id);
          if (imgEl) {
            imgEl.src = defaultPic;
            applyNoProfileVisual(imgEl, defaultPic);
          }
        });

        // Persist default
        const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
        profileData.profilePic = defaultPic;
        localStorage.setItem('profileData', JSON.stringify(profileData));

        menu.style.display = 'none';
      });
    }

    // Close menu clicking outside
    window.addEventListener('click', function () {
      if (menu) menu.style.display = 'none';
    });

    // Clicking inside menu shouldn't close it (stop propagation)
    menu.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // Wire view set
  wireSet({
    iconId: 'cameraIconView',
    menuId: 'profileOptionsView',
    changeId: 'changePicView',
    removeId: 'removePicView',
    inputId: 'profileInputView',
    imageIds: ['main-profile-pic', 'edit-profile-pic']
  });

  // Wire edit set
  wireSet({
    iconId: 'cameraIconEdit',
    menuId: 'profileOptionsEdit',
    changeId: 'changePicEdit',
    removeId: 'removePicEdit',
    inputId: 'profileInputEdit',
    imageIds: ['edit-profile-pic', 'main-profile-pic']
  });
}

// -----------------------------
// Visual for "no profile" (silhouette / shadow)
// Adds a gentle grayscale + lowered opacity when picture is default.
// Also adds inline fallback if CSS class not present.
// -----------------------------
function applyNoProfileVisual(imgEl, src) {
  if (!imgEl) return;
  const defaultUrl = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
  if (!src || src === defaultUrl) {
    // mark as no-profile
    imgEl.classList.add('no-profile');
    // Inline fallback for visual if CSS for .no-profile isn't present:
    imgEl.style.filter = 'grayscale(1) brightness(0.9)';
    imgEl.style.opacity = '0.9';
    // subtle silhouette-like inset border
    imgEl.style.boxShadow = 'inset 0 0 0 3px rgba(0,0,0,0.03), 0 6px 18px rgba(0,0,0,0.08)';
  } else {
    imgEl.classList.remove('no-profile');
    imgEl.style.filter = '';
    imgEl.style.opacity = '';
    imgEl.style.boxShadow = '';
  }
}

// -----------------------------
// Security modal event wiring & functions (unchanged logic, preserved)
// -----------------------------
function setupSecurityModalEvents() {
  // When modal opens, initialize settings
  const securityModal = document.getElementById('securityModal');
  if (securityModal) {
    securityModal.addEventListener('show.bs.modal', function () {
      console.log('Security modal opening');
      initializeSecuritySettings();
    });
  }

  // Change password form
  const changePasswordForm = document.getElementById('change-password-form');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function (e) {
      e.preventDefault();
      changePassword();
    });
  }

  // 2FA toggle
  const twoFAToggle = document.getElementById('2fa-toggle');
  if (twoFAToggle) {
    twoFAToggle.addEventListener('change', function () {
      const setupDiv = document.getElementById('2fa-setup');
      if (this.checked) {
        if (setupDiv) {
          setupDiv.style.display = 'block';
          setupDiv.innerHTML = `
            <div class="alert alert-info">
              <p>Two-factor authentication would be set up here.</p>
              <p class="mb-0">For this demo, the feature is simulated.</p>
            </div>
            <div class="mb-3">
              <label class="form-label">Enter verification code (demo: 123456)</label>
              <input type="text" class="form-control" id="verification-code" placeholder="Enter 123456" maxlength="6">
            </div>
            <button class="btn btn-success" id="verify-2fa">Verify & Enable</button>
          `;
          // attach listener to new verify button
          const verifyBtn = document.getElementById('verify-2fa');
          if (verifyBtn) verifyBtn.addEventListener('click', verify2FA);
        }
      } else {
        if (setupDiv) setupDiv.style.display = 'none';
        disable2FA();
      }
    });
  }

  // Privacy save
  const savePrivacyBtn = document.getElementById('save-privacy');
  if (savePrivacyBtn) savePrivacyBtn.addEventListener('click', savePrivacySettings);
}

function initializeSecuritySettings() {
  console.log('Initializing security settings');
  const securitySettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');

  const twoFAToggle = document.getElementById('2fa-toggle');
  if (twoFAToggle) twoFAToggle.checked = securitySettings.twoFactorEnabled || false;

  const profileVisible = document.getElementById('profile-visible');
  const emailVisible = document.getElementById('email-visible');
  const activityVisible = document.getElementById('activity-visible');

  if (profileVisible) profileVisible.checked = securitySettings.profileVisible || false;
  if (emailVisible) emailVisible.checked = securitySettings.emailVisible || false;
  if (activityVisible) activityVisible.checked = securitySettings.activityVisible || false;
}

function changePassword() {
  const currentPassword = document.getElementById('current-password') ? document.getElementById('current-password').value : '';
  const newPassword = document.getElementById('new-password') ? document.getElementById('new-password').value : '';
  const confirmPassword = document.getElementById('confirm-password') ? document.getElementById('confirm-password').value : '';

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match!');
    return;
  }

  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }

  const securitySettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
  securitySettings.passwordLastChanged = new Date().toISOString();
  localStorage.setItem('securitySettings', JSON.stringify(securitySettings));

  alert('Password changed successfully!');
  const changeForm = document.getElementById('change-password-form');
  if (changeForm) changeForm.reset();
}

function verify2FA() {
  const codeInput = document.getElementById('verification-code');
  const code = codeInput ? codeInput.value : '';

  if (code === '123456') {
    const securitySettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
    securitySettings.twoFactorEnabled = true;
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    alert('Two-factor authentication enabled successfully!');
    const setupDiv = document.getElementById('2fa-setup');
    if (setupDiv) setupDiv.style.display = 'none';
  } else {
    alert('Invalid verification code! Please enter 123456 for this demo.');
  }
}

function disable2FA() {
  const securitySettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
  securitySettings.twoFactorEnabled = false;
  localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
  alert('Two-factor authentication disabled.');
}

function savePrivacySettings() {
  const securitySettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');

  const profileVisible = document.getElementById('profile-visible');
  const emailVisible = document.getElementById('email-visible');
  const activityVisible = document.getElementById('activity-visible');

  if (profileVisible) securitySettings.profileVisible = profileVisible.checked;
  if (emailVisible) securitySettings.emailVisible = emailVisible.checked;
  if (activityVisible) securitySettings.activityVisible = activityVisible.checked;

  localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
  alert('Privacy settings saved successfully!');
}

// -----------------------------
// FIXED Achievement system - Only unlocks when criteria are met
// -----------------------------
function checkAchievements() {
  const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
  
  // Reset achievements first to ensure they're not pre-unlocked
  const resetAchievements = {
    budgetMaster: false,
    savingsHero: false,
    goalSetter: false
  };
  
  // Get user data from localStorage - CHECK THE CORRECT KEYS
  const userData = JSON.parse(localStorage.getItem('userFinanceData') || '{}');
  const budgetData = JSON.parse(localStorage.getItem('userBudgets') || '[]'); // CHANGED: 'userBudgets' not 'budgetData'
  const transactionData = JSON.parse(localStorage.getItem('transactionData') || '{}');
  
  console.log('Checking achievements with data:', {
    userData,
    budgetData,
    transactionData
  });
  
  // Budget Master: User must have at least one REAL budget created
  // Check the correct location for budget data - 'userBudgets'
  const hasBudgets = (
    (Array.isArray(budgetData) && budgetData.length > 0) || // CHANGED: budgetData is directly the array
    (userData.budgets && Array.isArray(userData.budgets) && userData.budgets.length > 0)
  );
  
  if (hasBudgets) {
    resetAchievements.budgetMaster = true;
    console.log('Budget Master achievement EARNED - User has budgets:', budgetData);
  } else {
    console.log('Budget Master achievement LOCKED - No budgets found');
  }

  // Savings Hero: User must have saved over Nu. 1000
  const currentSavings = userData.balance || userData.savings || 0;
  if (currentSavings >= 1000) {
    resetAchievements.savingsHero = true;
    console.log('Savings Hero achievement EARNED - Savings:', currentSavings);
  } else {
    console.log('Savings Hero achievement LOCKED - Savings:', currentSavings);
  }

  // Goal Setter: User must have made at least 5 transactions
  const transactionCount = (
    (transactionData.transactions && Array.isArray(transactionData.transactions) && transactionData.transactions.length) ||
    (userData.transactions && Array.isArray(userData.transactions) && userData.transactions.length) ||
    0
  );
  
  if (transactionCount >= 5) {
    resetAchievements.goalSetter = true;
    console.log('Goal Setter achievement EARNED - Transactions:', transactionCount);
  } else {
    console.log('Goal Setter achievement LOCKED - Transactions:', transactionCount);
  }
  
  // Only unlock achievements that are actually earned
  Object.keys(resetAchievements).forEach(achievementId => {
    if (resetAchievements[achievementId] && !achievements[achievementId]) {
      unlockAchievement(achievementId, getAchievementTitle(achievementId), getAchievementDescription(achievementId));
    }
  });
  
  // Update localStorage with current achievement status
  const finalAchievements = {...achievements, ...resetAchievements};
  localStorage.setItem('achievements', JSON.stringify(finalAchievements));
}

function getAchievementTitle(achievementId) {
  const titles = {
    budgetMaster: 'Budget Master 🏆',
    savingsHero: 'Savings Hero 💰',
    goalSetter: 'Goal Setter 🌟'
  };
  return titles[achievementId] || 'Achievement';
}

function getAchievementDescription(achievementId) {
  const descriptions = {
    budgetMaster: 'Created your first budget!',
    savingsHero: 'Saved over Nu. 1000!',
    goalSetter: 'Made 5 transactions!'
  };
  return descriptions[achievementId] || 'Completed an achievement!';
}

function updateAchievementDisplay() {
  const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');

  document.querySelectorAll('.achievement-card').forEach(card => {
    const achievementId = card.getAttribute('data-achievement');
    const statusElement = card.querySelector('.achievement-status');

    if (achievements[achievementId]) {
      card.classList.add('unlocked');
      if (statusElement) statusElement.textContent = 'Unlocked!';
    } else {
      card.classList.remove('unlocked');
      if (statusElement) statusElement.textContent = 'Locked';
    }
  });
}

function unlockAchievement(id, title, description) {
  const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
  achievements[id] = true;
  localStorage.setItem('achievements', JSON.stringify(achievements));

  const body = document.getElementById('achievementModalBody');
  if (body) {
    body.innerHTML = `
      <div class="text-center">
        <h4>${title}</h4>
        <p>${description}</p>
        <div style="font-size: 48px;">🎉</div>
      </div>
    `;
  }

  const modalEl = document.getElementById('achievementModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  createConfetti();
  updateAchievementDisplay();
}

// Small confetti using emojis
function createConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  const emojis = ['🎉', '🎊', '⭐', '🏆', '💰', '🌟', '🎈', '👑'];

  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(confetti);

    setTimeout(() => {
      if (confetti.parentNode) confetti.remove();
    }, 3000);
  }
}

// -----------------------------
// Initialization helpers - UPDATED to match budget.js storage
// -----------------------------
function initializeData() {
  if (!localStorage.getItem('achievements')) {
    localStorage.setItem('achievements', JSON.stringify({
      budgetMaster: false,
      savingsHero: false,
      goalSetter: false
    }));
  }
  if (!localStorage.getItem('securitySettings')) {
    localStorage.setItem('securitySettings', JSON.stringify({}));
  }
  if (!localStorage.getItem('profileData')) {
    const initial = {
      name: 'User',
      phone: '+1234567890',
      email: 'user@example.com',
      address: '123 Main Street',
      occupation: 'Student',
      bio: 'Short bio about me.',
      profilePic: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    };
    localStorage.setItem('profileData', JSON.stringify(initial));
  }
  
  // Initialize finance data if not exists (with empty arrays)
  // MATCHING WHAT budget.js EXPECTS
  if (!localStorage.getItem('userFinanceData')) {
    localStorage.setItem('userFinanceData', JSON.stringify({
      balance: 0,
      income: 0,
      expenses: 0,
      transactions: [],
      budgets: [],
      budgetSummary: {
        totalBudget: 0,
        totalUsed: 0,
        totalRemaining: 0,
        budgetCount: 0
      },
      balanceHistory: []
    }));
  }
  
  // Initialize budget data with the correct key that budget.js uses
  if (!localStorage.getItem('userBudgets')) {
    localStorage.setItem('userBudgets', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('transactionData')) {
    localStorage.setItem('transactionData', JSON.stringify({
      transactions: []
    }));
  }
}