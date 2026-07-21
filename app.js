document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const els = {
    progressFill: document.getElementById('progressFill'),
    progressInfo: document.getElementById('progressInfo'),
    steps: Array.from({ length: 8 }, (_, i) => document.getElementById(`step-${i + 1}`)),
    stepSuccess: document.getElementById('step-success'),
    
    // Step 1: Contact
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    company: document.getElementById('company'),
    phone: document.getElementById('phone'),
    
    // Step 2: Overview
    projectName: document.getElementById('projectName'),
    description: document.getElementById('description'),
    successMetrics: document.getElementById('successMetrics'),
    
    // Step 3: Personas
    userRoles: document.getElementById('userRoles'),
    userPainPoints: document.getElementById('userPainPoints'),
    platformTypeTags: document.getElementById('platformTypeTags'),

    // Step 4: Functions & Features
    featureModulesTags: document.getElementById('featureModulesTags'),
    coreFeatureDetails: document.getElementById('coreFeatureDetails'),

    // Step 5: Auth & Security
    authTypeTags: document.getElementById('authTypeTags'),
    permissionLevels: document.getElementById('permissionLevels'),
    complianceNeeds: document.getElementById('complianceNeeds'),

    // Step 6: Integrations
    integrationTags: document.getElementById('integrationTags'),
    customIntegrations: document.getElementById('customIntegrations'),

    // Step 7: Tech & Scope
    budget: document.getElementById('budget'),
    timeline: document.getElementById('timeline'),
    frontendTags: document.getElementById('frontendTags'),
    backendTags: document.getElementById('backendTags'),
    aiTags: document.getElementById('aiTags'),
    letGuavaDecide: document.getElementById('letGuavaDecide'),

    // Step 8: Review
    reviewContent: document.getElementById('reviewContent'),
    
    // Nav
    backBtn: document.getElementById('backBtn'),
    nextBtn: document.getElementById('nextBtn'),
    navButtons: document.getElementById('navButtons'),
    themeToggle: document.getElementById('themeToggle')
  };

  // Theme Toggle Logic
  const savedTheme = localStorage.getItem('guava_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  if (els.themeToggle) {
    els.themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      let targetTheme = 'light';
      
      if (currentTheme === 'light') {
        targetTheme = 'dark';
      } else if (currentTheme === 'dark') {
        targetTheme = 'light';
      } else {
        const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        targetTheme = isSystemLight ? 'dark' : 'light';
      }
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('guava_theme', targetTheme);
    });
  }

  // State
  let currentStep = 1;
  const totalSteps = 8;
  const state = {
    platforms: new Set(),
    featureModules: new Set(),
    authTypes: new Set(),
    integrations: new Set(),
    techStack: {
      frontend: new Set(),
      backend: new Set(),
      ai: new Set(),
      letGuavaDecide: false
    }
  };

  // Tag datasets for rendering
  const tagData = {
    platforms: [
      { label: 'Desktop Web App', emoji: '💻' },
      { label: 'Mobile Responsive Web', emoji: '📱' },
      { label: 'iOS Native App', emoji: '🍎' },
      { label: 'Android Native App', emoji: '🤖' },
      { label: 'Chrome Extension', emoji: '🧩' },
      { label: 'Desktop App (Electron)', emoji: '🖥️' }
    ],
    featureModules: [
      { label: 'User Dashboard & Analytics', emoji: '📊' },
      { label: 'AI Chatbot & Conversational UI', emoji: '💬' },
      { label: 'Automated Workflow Engine', emoji: '⚡' },
      { label: 'E-Commerce / Checkout / Billing', emoji: '🛒' },
      { label: 'CRM & Lead Management', emoji: '👥' },
      { label: 'File Upload & Document Parsing', emoji: '📄' },
      { label: 'Real-time Notifications / Alerts', emoji: '🔔' },
      { label: 'Multi-Tenant Workspace / Organizations', emoji: '🏢' },
      { label: 'Search & Filtering Engine', emoji: '🔍' },
      { label: 'Public API / Webhook Subscriptions', emoji: '🔌' }
    ],
    authTypes: [
      { label: 'Email & Password', emoji: '🔑' },
      { label: 'Social Login (Google / Apple / GitHub)', emoji: '🌐' },
      { label: 'Magic Link (Passwordless)', emoji: '✨' },
      { label: 'Enterprise Single Sign-On (SAML / Okta)', emoji: '🏢' },
      { label: 'Two-Factor Authentication (2FA)', emoji: '🛡️' },
      { label: 'Public Access (No Auth Needed)', emoji: '🔓' }
    ],
    integrations: [
      { label: 'Payment Gateway (Stripe / PayPal)', emoji: '💳' },
      { label: 'CRM (HubSpot / Salesforce / Notion)', emoji: '💼' },
      { label: 'AI APIs (OpenAI / Claude / Gemini)', emoji: '🧠' },
      { label: 'Transactional Email (Resend / SendGrid)', emoji: '✉️' },
      { label: 'Messaging (Slack / WhatsApp / Telegram)', emoji: '💬' },
      { label: 'Analytics (PostHog / Mixpanel / Google)', emoji: '📈' },
      { label: 'Storage (AWS S3 / Cloudflare R2)', emoji: '☁️' }
    ],
    frontend: ['React', 'Next.js', 'Vue', 'React Native', 'Flutter', 'TailwindCSS'],
    backend: ['Node.js', 'Python (FastAPI/Django)', 'PostgreSQL', 'Supabase', 'MongoDB', 'Redis'],
    ai: ['OpenAI GPT-4o', 'Claude 3.5 Sonnet', 'Custom RAG System', 'Make.com / n8n', 'LangChain / LlamaIndex']
  };

  // Tag Element Generator
  const createTagElement = (label, category, emoji = null) => {
    const btn = document.createElement('button');
    btn.className = 'tag-card';
    btn.dataset.value = label;
    btn.dataset.category = category;
    btn.type = 'button';
    
    let innerHTML = '';
    if (emoji) {
      innerHTML += `<span class="tag-emoji">${emoji}</span>`;
    }
    innerHTML += `<span class="tag-label">${label}</span>`;
    btn.innerHTML = innerHTML;
    
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const isSelected = btn.classList.contains('selected');
      
      if (category === 'platforms') {
        if (isSelected) state.platforms.add(label); else state.platforms.delete(label);
      } else if (category === 'featureModules') {
        if (isSelected) state.featureModules.add(label); else state.featureModules.delete(label);
      } else if (category === 'authTypes') {
        if (isSelected) state.authTypes.add(label); else state.authTypes.delete(label);
      } else if (category === 'integrations') {
        if (isSelected) state.integrations.add(label); else state.integrations.delete(label);
      } else {
        if (isSelected) state.techStack[category].add(label); else state.techStack[category].delete(label);
      }
      
      clearError(btn.closest('.form-group'));
    });
    
    return btn;
  };

  const renderTags = () => {
    // Categorized Render
    const maps = [
      { key: 'platforms', el: els.platformTypeTags },
      { key: 'featureModules', el: els.featureModulesTags },
      { key: 'authTypes', el: els.authTypeTags },
      { key: 'integrations', el: els.integrationTags }
    ];

    maps.forEach(m => {
      if (m.el) {
        tagData[m.key].forEach(item => {
          m.el.appendChild(createTagElement(item.label, m.key, item.emoji));
        });
      }
    });

    ['frontend', 'backend', 'ai'].forEach(category => {
      if (els[`${category}Tags`]) {
        tagData[category].forEach(label => {
          els[`${category}Tags`].appendChild(createTagElement(label, category));
        });
      }
    });
  };

  renderTags();

  // Custom Tags Logic
  const handleAddCustomTag = (inputEl, containerEl, category) => {
    if (!inputEl || !containerEl) return;
    const val = inputEl.value.trim();
    if (!val) return;
    
    let setRef = category === 'projectType' ? state.projectTypes : state.techStack.custom;
    
    if (setRef.has(val)) {
      inputEl.value = '';
      return; // prevent duplicate
    }
    
    setRef.add(val);
    containerEl.appendChild(createTagElement(val, category, true));
    inputEl.value = '';
    clearError(containerEl.closest('.form-group'));
  };

  if (els.addProjectTypeBtn && els.customProjectType) {
    els.addProjectTypeBtn.addEventListener('click', () => handleAddCustomTag(els.customProjectType, els.projectTypeTags, 'projectType'));
    els.customProjectType.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomTag(els.customProjectType, els.projectTypeTags, 'projectType');
      }
    });
  }

  if (els.addTechBtn && els.customTech) {
    // For custom tech, we will append it to frontendTags container if a dedicated customTechContainer does not exist
    const container = document.getElementById('customTechContainer') || els.frontendTags;
    els.addTechBtn.addEventListener('click', () => handleAddCustomTag(els.customTech, container, 'custom'));
    els.customTech.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomTag(els.customTech, container, 'custom');
      }
    });
  };

  // Let Guava Decide
  if (els.letGuavaDecide) {
    els.letGuavaDecide.addEventListener('click', () => {
      els.letGuavaDecide.classList.toggle('active');
      const isActive = els.letGuavaDecide.classList.contains('active');
      state.techStack.letGuavaDecide = isActive;
      
      const grids = document.querySelectorAll('#step-7 .tag-grid');
      
      if (isActive) {
        grids.forEach(grid => grid.classList.add('dimmed'));
        const selectedTechTags = document.querySelectorAll('#step-7 .tag-card.selected');
        selectedTechTags.forEach(tag => tag.classList.remove('selected'));
        ['frontend', 'backend', 'ai'].forEach(cat => state.techStack[cat].clear());
      } else {
        grids.forEach(grid => grid.classList.remove('dimmed'));
      }
    });
  }

  // Navigation Logic
  const updateNavUI = () => {
    if (els.progressFill) els.progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
    if (els.progressInfo) els.progressInfo.textContent = `Step ${currentStep} of ${totalSteps}`;
    
    if (els.backBtn) {
      els.backBtn.style.display = currentStep === 1 ? 'none' : 'block';
    }
    
    if (els.nextBtn) {
      if (currentStep === 7) {
        els.nextBtn.textContent = 'Review PRD →';
      } else if (currentStep === 8) {
        els.nextBtn.textContent = 'Generate & Submit PRD →';
      } else {
        els.nextBtn.textContent = 'Continue →';
      }
    }
  };

  const goToStep = (n) => {
    if (n > currentStep && !validateStep(currentStep)) return;
    if (n < 1 || n > totalSteps) return;
    
    const direction = n > currentStep ? 'forward' : 'backward';
    const outStep = els.steps[currentStep - 1];
    const inStep = els.steps[n - 1];
    
    if (!outStep || !inStep) return;

    // Animation classes
    const outClass = direction === 'forward' ? 'slideOutLeft' : 'slideOutRight';
    const inClass = direction === 'forward' ? 'slideInRight' : 'slideInLeft';
    
    outStep.classList.add(outClass);
    
    setTimeout(() => {
      outStep.style.display = 'none';
      outStep.classList.remove(outClass);
      
      if (n === 8) buildReviewStep();
      
      inStep.style.display = 'block';
      inStep.classList.add(inClass);
      
      setTimeout(() => {
        inStep.classList.remove(inClass);
      }, 400); // Wait for incoming animation
      
      currentStep = n;
      updateNavUI();
    }, 400); // Wait for outgoing animation
  };

  // Validation
  const showError = (fieldEl, message) => {
    if (!fieldEl) return;
    const group = fieldEl.closest('.form-group');
    if (!group) return;
    group.classList.add('error');
    
    let errorSpan = group.querySelector('.field-error');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'field-error';
      group.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    
    // Shake animation
    fieldEl.classList.remove('shake');
    void fieldEl.offsetWidth; // trigger reflow
    fieldEl.classList.add('shake');
  };

  const clearError = (groupEl) => {
    if (!groupEl) return;
    groupEl.classList.remove('error');
    const err = groupEl.querySelector('.field-error');
    if (err) err.remove();
  };

  const clearErrorOnInput = (e) => clearError(e.target.closest('.form-group'));

  // Attach clear error listeners
  [els.fullName, els.email, els.description, els.userRoles, els.coreFeatureDetails].forEach(el => {
    if(el) {
      el.addEventListener('input', clearErrorOnInput);
      el.addEventListener('change', clearErrorOnInput);
    }
  });

  const validateStep = (step) => {
    let isValid = true;
    
    if (step === 1) {
      if (els.fullName && !els.fullName.value.trim()) {
        showError(els.fullName, 'Full Name is required');
        isValid = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (els.email && (!els.email.value.trim() || !emailRegex.test(els.email.value.trim()))) {
        showError(els.email, 'Valid email is required');
        isValid = false;
      }
    } else if (step === 2) {
      if (els.description && els.description.value.trim().length < 15) {
        showError(els.description, 'Executive summary/problem statement is required');
        isValid = false;
      }
    } else if (step === 3) {
      if (els.userRoles && !els.userRoles.value.trim()) {
        showError(els.userRoles, 'Please define target user roles/personas');
        isValid = false;
      }
    } else if (step === 4) {
      if (els.coreFeatureDetails && els.coreFeatureDetails.value.trim().length < 15) {
        showError(els.coreFeatureDetails, 'Please outline key features');
        isValid = false;
      }
    }
    
    return isValid;
  };

  // Review Step (Step 8)
  const buildReviewStep = () => {
    if (!els.reviewContent) return;
    
    const reviewData = {
      '1. Executive Contact': [
        { label: 'Name', value: els.fullName?.value },
        { label: 'Email', value: els.email?.value },
        { label: 'Company', value: els.company?.value || 'N/A' },
        { label: 'Phone', value: els.phone?.value || 'N/A' }
      ],
      '2. Product Overview': [
        { label: 'Product Name', value: els.projectName?.value || 'N/A' },
        { label: 'Problem & Vision', value: els.description?.value },
        { label: 'Success Metrics', value: els.successMetrics?.value || 'N/A' }
      ],
      '3. Personas & Platforms': [
        { label: 'User Roles', value: els.userRoles?.value },
        { label: 'Pain Points', value: els.userPainPoints?.value || 'N/A' }
      ],
      'Target Platforms': Array.from(state.platforms),
      '4. Functional Scope': [
        { label: 'Core Features', value: els.coreFeatureDetails?.value }
      ],
      'Feature Modules': Array.from(state.featureModules),
      '5. Auth & Access': [
        { label: 'Permissions', value: els.permissionLevels?.value || 'N/A' },
        { label: 'Compliance', value: els.complianceNeeds?.value || 'N/A' }
      ],
      'Auth Methods': Array.from(state.authTypes),
      '6. Integrations & Data': [
        { label: 'Custom APIs', value: els.customIntegrations?.value || 'N/A' }
      ],
      Integrations: Array.from(state.integrations),
      '7. Tech & Scope': [
        { label: 'Budget', value: els.budget?.options?.[els.budget.selectedIndex]?.text || els.budget?.value || 'N/A' },
        { label: 'Timeline', value: els.timeline?.options?.[els.timeline.selectedIndex]?.text || els.timeline?.value || 'N/A' }
      ],
      'Tech Stack': state.techStack.letGuavaDecide ? ['Let Guava Recommend ✨'] : [
        ...state.techStack.frontend,
        ...state.techStack.backend,
        ...state.techStack.ai
      ].filter(Boolean)
    };

    let html = '';
    
    const stepMap = {
      '1. Executive Contact': 1,
      '2. Product Overview': 2,
      '3. Personas & Platforms': 3,
      'Target Platforms': 3,
      '4. Functional Scope': 4,
      'Feature Modules': 4,
      '5. Auth & Access': 5,
      'Auth Methods': 5,
      '6. Integrations & Data': 6,
      Integrations: 6,
      '7. Tech & Scope': 7,
      'Tech Stack': 7
    };

    for (const [section, data] of Object.entries(reviewData)) {
      html += `
        <div class="review-section">
          <div class="review-header">
            <h3>${section}</h3>
            <button type="button" class="edit-btn" data-goto="${stepMap[section]}">Edit ✏️</button>
          </div>
          <div class="review-content-body">
      `;
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          html += `<p class="review-none">None specified</p>`;
        } else if (typeof data[0] === 'string') {
          html += `<div class="review-pills">`;
          data.forEach(pill => {
            html += `<span class="review-pill">${pill}</span>`;
          });
          html += `</div>`;
        } else {
          html += `<div class="review-kv-list">`;
          data.forEach(kv => {
            html += `
              <div class="review-kv">
                <span class="review-label">${kv.label}:</span>
                <span class="review-value">${kv.value || 'N/A'}</span>
              </div>
            `;
          });
          html += `</div>`;
        }
      }
      
      html += `
          </div>
        </div>
      `;
    }

    els.reviewContent.innerHTML = html;

    els.reviewContent.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const goto = parseInt(btn.dataset.goto, 10);
        if (goto) goToStep(goto);
      });
    });
  };

  // Submit
  const submitForm = async () => {
    if (!validateStep(currentStep)) return;

    const payload = {
      contact: {
        fullName: els.fullName?.value,
        email: els.email?.value,
        company: els.company?.value,
        phone: els.phone?.value
      },
      overview: {
        projectName: els.projectName?.value,
        description: els.description?.value,
        successMetrics: els.successMetrics?.value
      },
      personas: {
        userRoles: els.userRoles?.value,
        userPainPoints: els.userPainPoints?.value,
        targetPlatforms: Array.from(state.platforms)
      },
      functionalScope: {
        featureModules: Array.from(state.featureModules),
        coreFeatureDetails: els.coreFeatureDetails?.value
      },
      authAndSecurity: {
        authTypes: Array.from(state.authTypes),
        permissionLevels: els.permissionLevels?.value,
        complianceNeeds: els.complianceNeeds?.value
      },
      integrations: {
        integrationTypes: Array.from(state.integrations),
        customIntegrations: els.customIntegrations?.value
      },
      techAndDelivery: {
        budget: els.budget?.value,
        timeline: els.timeline?.value,
        frontend: Array.from(state.techStack.frontend),
        backend: Array.from(state.techStack.backend),
        ai: Array.from(state.techStack.ai),
        letGuavaDecide: state.techStack.letGuavaDecide
      },
      submittedAt: new Date().toISOString()
    };
    
    if (els.nextBtn) {
      els.nextBtn.disabled = true;
      els.nextBtn.classList.add('loading');
      els.nextBtn.dataset.originalText = els.nextBtn.textContent;
      els.nextBtn.textContent = 'Submitting...';
    }
    
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess();
      } else {
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error(error);
      showToast('Error submitting form. Please try again.');
      if (els.nextBtn) {
        els.nextBtn.disabled = false;
        els.nextBtn.classList.remove('loading');
        els.nextBtn.textContent = els.nextBtn.dataset.originalText || 'Submit Brief →';
      }
    }
  };

  const showSuccess = () => {
    if (els.steps[5]) els.steps[5].style.display = 'none';
    if (els.navButtons) els.navButtons.style.display = 'none';
    if (els.stepSuccess) {
      els.stepSuccess.style.display = 'block';
      els.stepSuccess.classList.add('slideInRight');
    }
    triggerConfetti();
  };

  // Confetti
  const triggerConfetti = () => {
    const colors = ['#512FEB', '#FFD700', '#00FF88', '#FF6B6B', '#4ECDC4', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 6 + 6; // 6-12px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * window.innerWidth;
      const delay = Math.random() * 3; // 0-3s
      const duration = Math.random() * 2 + 2; // 2-4s
      const isCircle = Math.random() > 0.5;
      
      particle.style.cssText = `
        position: fixed;
        top: -20px;
        left: ${x}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        z-index: 9999;
        border-radius: ${isCircle ? '50%' : '0'};
        pointer-events: none;
        animation: fall ${duration}s ${delay}s linear forwards;
      `;
      
      document.body.appendChild(particle);
      
      // Cleanup
      setTimeout(() => {
        particle.remove();
      }, (delay + duration) * 1000);
    }
    
    // Add keyframes dynamically if not present
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.innerHTML = `
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(${window.innerHeight + 20}px) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Toast
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background-color: #FF6B6B;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      transition: transform 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    `;
    
    document.body.appendChild(toast);
    
    // Slide up
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    // Auto dismiss
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Event Listeners for Nav
  if (els.backBtn) els.backBtn.addEventListener('click', () => goToStep(currentStep - 1));
  if (els.nextBtn) els.nextBtn.addEventListener('click', () => {
    if (currentStep === 6) {
      submitForm();
    } else {
      goToStep(currentStep + 1);
    }
  });

  // Init
  els.steps.forEach((step, i) => {
    if (step && i !== 0) step.style.display = 'none';
  });
  if (els.stepSuccess) els.stepSuccess.style.display = 'none';
  updateNavUI();
});
