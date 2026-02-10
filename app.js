// ==================== APP STATE ====================
const state = {
  currentPage: 'login',
  currentStep: 1,
  totalSteps: 6,
  isLoggedIn: false,
  propertyData: {
    name: '',
    type: '',
    location: {},
    amenities: [],
    rooms: [],
    policies: {},
    documents: {}
  }
};

// ==================== DOM ELEMENTS ====================
const pages = {
  login: document.getElementById('loginPage'),
  dashboard: document.getElementById('dashboardPage'),
  onboarding: document.getElementById('onboardingPage'),
  success: document.getElementById('successPage')
};

const forms = {
  login: document.getElementById('loginForm'),
  signup: document.getElementById('signupForm'),
  otp: document.getElementById('otpForm')
};

const modals = {
  property: document.getElementById('propertyModal')
};

// ==================== PAGE NAVIGATION ====================
function showPage(pageName) {
  Object.values(pages).forEach(page => page.classList.add('hidden'));
  pages[pageName].classList.remove('hidden');
  state.currentPage = pageName;
  window.scrollTo(0, 0);
}

// ==================== STEP NAVIGATION ====================
function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > state.totalSteps) return;

  // Update state
  state.currentStep = stepNumber;

  // Update step content visibility
  document.querySelectorAll('.step-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`step${stepNumber}`).classList.add('active');

  // Update progress indicators
  document.querySelectorAll('.progress-steps .step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');

    if (stepNum < stepNumber) {
      step.classList.add('completed');
    } else if (stepNum === stepNumber) {
      step.classList.add('active');
    }
  });

  // Update connectors
  document.querySelectorAll('.step-connector').forEach((connector, index) => {
    if (index < stepNumber - 1) {
      connector.classList.add('completed');
    } else {
      connector.classList.remove('completed');
    }
  });

  window.scrollTo(0, 0);
}

// Make goToStep globally accessible
window.goToStep = goToStep;

// ==================== MODAL FUNCTIONS ====================
function showModal(modalName) {
  modals[modalName].classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideModal(modalName) {
  modals[modalName].classList.remove('active');
  document.body.style.overflow = '';
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  toastMessage.textContent = message;
  toast.className = 'toast show' + (type ? ' ' + type : '');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==================== AUTH FUNCTIONS ====================
function initAuthHandlers() {
  // Show/Hide Forms
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');

  if (showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      forms.login.classList.add('hidden');
      forms.signup.classList.remove('hidden');
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      forms.signup.classList.add('hidden');
      forms.login.classList.remove('hidden');
    });
  }

  // Send OTP
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      const email = document.getElementById('loginEmail').value;
      if (!email) {
        showToast('Please enter your email address');
        return;
      }

      sendOtpBtn.innerHTML = '<div class="spinner"></div> Sending...';
      sendOtpBtn.disabled = true;

      setTimeout(() => {
        sendOtpBtn.innerHTML = 'Send Verification Code <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        sendOtpBtn.disabled = false;

        document.getElementById('otpEmail').textContent = email;
        forms.login.classList.add('hidden');
        forms.otp.classList.remove('hidden');
        startOtpTimer();

        // Focus first OTP input
        document.querySelector('.otp-input').focus();
      }, 1500);
    });
  }

  // Signup
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const phone = document.getElementById('signupPhone').value;
      const terms = document.getElementById('acceptTerms').checked;

      if (!name || !email || !phone) {
        showToast('Please fill in all required fields');
        return;
      }

      if (!terms) {
        showToast('Please accept the Terms & Conditions');
        return;
      }

      signupBtn.innerHTML = '<div class="spinner"></div> Creating...';
      signupBtn.disabled = true;

      setTimeout(() => {
        signupBtn.innerHTML = 'Create Account <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        signupBtn.disabled = false;

        document.getElementById('otpEmail').textContent = email;
        forms.signup.classList.add('hidden');
        forms.otp.classList.remove('hidden');
        startOtpTimer();

        document.querySelector('.otp-input').focus();
      }, 1500);
    });
  }

  // Verify OTP
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', () => {
      const otpInputs = document.querySelectorAll('.otp-input');
      let otp = '';
      otpInputs.forEach(input => otp += input.value);

      if (otp.length !== 6) {
        showToast('Please enter the complete 6-digit code');
        return;
      }

      verifyOtpBtn.innerHTML = '<div class="spinner"></div> Verifying...';
      verifyOtpBtn.disabled = true;

      setTimeout(() => {
        state.isLoggedIn = true;
        showToast('Login successful!', 'success');
        showPage('dashboard');
      }, 1500);
    });
  }

  // OTP Input Handling
  const otpInputs = document.querySelectorAll('.otp-input');
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;

      if (value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').slice(0, 6);
      pastedData.split('').forEach((char, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = char;
        }
      });
      if (pastedData.length === 6) {
        otpInputs[5].focus();
      }
    });
  });

  // Resend OTP
  const resendOtp = document.getElementById('resendOtp');
  if (resendOtp) {
    resendOtp.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('OTP sent again!', 'success');
      startOtpTimer();
    });
  }
}

let otpTimerInterval;
function startOtpTimer() {
  let seconds = 30;
  const timerSpan = document.querySelector('.timer');
  const resendLink = document.getElementById('resendOtp');

  resendLink.style.pointerEvents = 'none';
  resendLink.style.opacity = '0.5';

  clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    seconds--;
    timerSpan.textContent = `(${seconds}s)`;

    if (seconds <= 0) {
      clearInterval(otpTimerInterval);
      timerSpan.textContent = '';
      resendLink.style.pointerEvents = 'auto';
      resendLink.style.opacity = '1';
    }
  }, 1000);
}

// ==================== DASHBOARD HANDLERS ====================
function initDashboardHandlers() {
  // Add Property Button
  const addPropertyBtn = document.getElementById('addPropertyBtn');
  if (addPropertyBtn) {
    addPropertyBtn.addEventListener('click', () => {
      showPage('onboarding');
      goToStep(1);
    });
  }

  // Back to Dashboard
  const backToDashboard = document.getElementById('backToDashboard');
  if (backToDashboard) {
    backToDashboard.addEventListener('click', () => {
      if (confirm('Are you sure you want to leave? Your progress will be saved as draft.')) {
        showPage('dashboard');
      }
    });
  }

  // Tab Navigation
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Filter properties based on tab
    });
  });

  // Save Draft
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => {
      showToast('Draft saved successfully!', 'success');
    });
  }
}

// ==================== PROPERTY SELECTION HANDLERS ====================
function initPropertySelectionHandlers() {
  // Find Property Button
  const findPropertyBtn = document.getElementById('findPropertyBtn');
  if (findPropertyBtn) {
    findPropertyBtn.addEventListener('click', () => {
      const propertyName = document.getElementById('propertyName').value;
      const city = document.getElementById('city').value;

      if (!propertyName) {
        showToast('Please enter the property name');
        return;
      }

      findPropertyBtn.innerHTML = '<div class="spinner"></div> Searching...';
      findPropertyBtn.disabled = true;

      setTimeout(() => {
        findPropertyBtn.innerHTML = 'Find My Property <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        findPropertyBtn.disabled = false;

        // Update modal with property details
        document.getElementById('modalPropertyName').textContent = propertyName || 'HiTech Residency';
        document.getElementById('modalPropertyLocation').textContent = city ? `${city}` : 'Location';

        showModal('property');
      }, 2000);
    });
  }

  // Confirm Property
  const confirmPropertyBtn = document.getElementById('confirmPropertyBtn');
  if (confirmPropertyBtn) {
    confirmPropertyBtn.addEventListener('click', () => {
      hideModal('property');
      showToast('Property matched! Content will be pre-filled.', 'success');

      setTimeout(() => {
        goToStep(2);
      }, 500);
    });
  }

  // Manual Entry
  const manualEntryLink = document.getElementById('manualEntryLink');
  if (manualEntryLink) {
    manualEntryLink.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal('property');
      showToast('Continuing with manual entry');

      setTimeout(() => {
        goToStep(2);
      }, 500);
    });
  }

  // Close modal on overlay click
  if (modals.property) {
    modals.property.addEventListener('click', (e) => {
      if (e.target === modals.property) {
        hideModal('property');
      }
    });
  }
}

// ==================== PROPERTY DETAILS HANDLERS ====================
function initPropertyDetailsHandlers() {
  // Channel Manager Toggle
  const channelManagerRadios = document.querySelectorAll('input[name="channelManager"]');
  const channelManagerSelect = document.getElementById('channelManagerSelect');

  channelManagerRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'yes') {
        channelManagerSelect.classList.remove('hidden');
      } else {
        channelManagerSelect.classList.add('hidden');
      }
    });
  });

  // Image Upload Handlers
  const heroImageUpload = document.getElementById('heroImageUpload');
  if (heroImageUpload) {
    heroImageUpload.addEventListener('click', () => {
      // Simulate file picker
      showToast('Image upload functionality - Click handled');
    });
  }

  const addImageBtn = document.getElementById('addImageBtn');
  if (addImageBtn) {
    addImageBtn.addEventListener('click', () => {
      addUploadedImage();
    });
  }

  // Verify buttons
  document.querySelectorAll('.verify-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.innerHTML = '<div class="spinner"></div>';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '✓ Verified';
        btn.classList.add('verified');
        btn.style.color = '#22C55E';
        btn.style.borderColor = '#22C55E';
      }, 1500);
    });
  });
}

function addUploadedImage() {
  const imagesGrid = document.getElementById('imagesGrid');
  const addBtn = document.getElementById('addImageBtn');

  const imageBox = document.createElement('div');
  imageBox.className = 'image-upload-box uploaded';
  imageBox.innerHTML = `
    <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&h=150&fit=crop" alt="Property" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">
  `;

  imagesGrid.insertBefore(imageBox, addBtn);

  // Update count
  const countEl = document.querySelector('.image-count');
  const currentCount = imagesGrid.querySelectorAll('.uploaded').length;
  countEl.textContent = `(${currentCount}/10 minimum)`;
}

// ==================== ROOM HANDLERS ====================
function initRoomHandlers() {
  const addRoomBtn = document.getElementById('addRoomBtn');
  const roomForm = document.getElementById('roomForm');
  const closeRoomForm = document.getElementById('closeRoomForm');
  const cancelRoomBtn = document.getElementById('cancelRoomBtn');
  const saveRoomBtn = document.getElementById('saveRoomBtn');

  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', () => {
      roomForm.classList.remove('hidden');
      addRoomBtn.classList.add('hidden');
      roomForm.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (closeRoomForm) {
    closeRoomForm.addEventListener('click', () => {
      roomForm.classList.add('hidden');
      addRoomBtn.classList.remove('hidden');
    });
  }

  if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
      roomForm.classList.add('hidden');
      addRoomBtn.classList.remove('hidden');
    });
  }

  if (saveRoomBtn) {
    saveRoomBtn.addEventListener('click', () => {
      // Add new room card
      const roomsList = document.getElementById('roomsList');
      const newRoom = document.createElement('div');
      newRoom.className = 'room-card';
      newRoom.innerHTML = `
        <div class="room-card-header">
          <div class="room-info">
            <h3>Premium Suite</h3>
            <span class="room-meta">3 Adults • 1 King Bed • 45 sqm</span>
          </div>
          <div class="room-actions">
            <button class="btn btn-icon btn-sm" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-icon btn-sm" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="room-card-body">
          <div class="room-images">
            <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=100&h=80&fit=crop" alt="Room">
            <span class="more-images">+2</span>
          </div>
          <div class="room-details-grid">
            <div class="detail-item">
              <span class="detail-label">Base Price</span>
              <span class="detail-value">₹7,500/night</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Inventory</span>
              <span class="detail-value">4 rooms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Meal Plan</span>
              <span class="detail-value">MAP</span>
            </div>
          </div>
        </div>
      `;
      roomsList.appendChild(newRoom);

      roomForm.classList.add('hidden');
      addRoomBtn.classList.remove('hidden');
      showToast('Room type added successfully!', 'success');
    });
  }
}

// ==================== DOCUMENTS HANDLERS ====================
function initDocumentHandlers() {
  // Bank verification
  const verifyBankBtn = document.getElementById('verifyBankBtn');
  if (verifyBankBtn) {
    verifyBankBtn.addEventListener('click', () => {
      verifyBankBtn.innerHTML = '<div class="spinner"></div> Verifying...';
      verifyBankBtn.disabled = true;

      setTimeout(() => {
        verifyBankBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Bank Account Verified';
        verifyBankBtn.classList.add('verified');
        verifyBankBtn.style.color = '#22C55E';
        verifyBankBtn.style.borderColor = '#22C55E';
        showToast('Bank account verified successfully!', 'success');
      }, 2000);
    });
  }

  // IFSC Code - Auto fill bank name
  const ifscCode = document.getElementById('ifscCode');
  const bankName = document.getElementById('bankName');
  if (ifscCode && bankName) {
    ifscCode.addEventListener('blur', () => {
      if (ifscCode.value.length >= 11) {
        bankName.value = 'HDFC Bank Ltd.';
      }
    });
  }

  // Document uploads
  document.querySelectorAll('.document-upload-box').forEach(box => {
    box.addEventListener('click', () => {
      // Simulate successful upload
      setTimeout(() => {
        box.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style="color: #22C55E; font-weight: 500;">Document Uploaded</span>
          <small>registration_doc.pdf</small>
        `;
        box.style.borderColor = '#22C55E';
        box.style.background = '#DCFCE7';
      }, 500);
    });
  });
}

// ==================== REVIEW & SUBMIT HANDLERS ====================
function initReviewHandlers() {
  const submitPropertyBtn = document.getElementById('submitPropertyBtn');
  if (submitPropertyBtn) {
    submitPropertyBtn.addEventListener('click', () => {
      const termsChecked = document.getElementById('finalTerms').checked;

      if (!termsChecked) {
        showToast('Please accept the Terms & Conditions');
        return;
      }

      submitPropertyBtn.innerHTML = '<div class="spinner"></div> Submitting...';
      submitPropertyBtn.disabled = true;

      setTimeout(() => {
        showPage('success');
      }, 2000);
    });
  }

  // Success page handlers
  const addAnotherPropertyBtn = document.getElementById('addAnotherPropertyBtn');
  if (addAnotherPropertyBtn) {
    addAnotherPropertyBtn.addEventListener('click', () => {
      showPage('onboarding');
      goToStep(1);
      // Reset form...
    });
  }

  const goToDashboardBtn = document.getElementById('goToDashboardBtn');
  if (goToDashboardBtn) {
    goToDashboardBtn.addEventListener('click', () => {
      showPage('dashboard');
    });
  }
}

// ==================== INITIALIZE APP ====================
function initApp() {
  initAuthHandlers();
  initDashboardHandlers();
  initPropertySelectionHandlers();
  initPropertyDetailsHandlers();
  initRoomHandlers();
  initDocumentHandlers();
  initReviewHandlers();

  // Add spinner CSS
  const style = document.createElement('style');
  style.textContent = `
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn:has(.spinner) {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Show login page initially
  showPage('login');
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
