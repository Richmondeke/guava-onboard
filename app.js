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
    
    // Step 2: Overview & Value Prop
    projectName: document.getElementById('projectName'),
    description: document.getElementById('description'),
    valueProp: document.getElementById('valueProp'),
    successMetrics: document.getElementById('successMetrics'),
    
    // Step 3: Personas & Market
    userRoles: document.getElementById('userRoles'),
    userPainPoints: document.getElementById('userPainPoints'),
    competitorAnalysis: document.getElementById('competitorAnalysis'),
    platformTypeTags: document.getElementById('platformTypeTags'),

    // Step 4: Functions, Stories & Journey
    featureModulesTags: document.getElementById('featureModulesTags'),
    coreFeatureDetails: document.getElementById('coreFeatureDetails'),
    userStories: document.getElementById('userStories'),
    userJourney: document.getElementById('userJourney'),
    outOfScope: document.getElementById('outOfScope'),

    // Step 5: Auth & Data Model
    authTypeTags: document.getElementById('authTypeTags'),
    permissionLevels: document.getElementById('permissionLevels'),
    dataEntities: document.getElementById('dataEntities'),
    complianceNeeds: document.getElementById('complianceNeeds'),

    // Step 6: Integrations, NFRs & UX
    integrationTags: document.getElementById('integrationTags'),
    customIntegrations: document.getElementById('customIntegrations'),
    designPreferences: document.getElementById('designPreferences'),
    nonFunctionalReqs: document.getElementById('nonFunctionalReqs'),

    // Step 7: Tech, Risks & Roadmap
    budget: document.getElementById('budget'),
    timeline: document.getElementById('timeline'),
    risksConstraints: document.getElementById('risksConstraints'),
    futureVision: document.getElementById('futureVision'),
    assetLinks: document.getElementById('assetLinks'),
    frontendTags: document.getElementById('frontendTags'),
    backendTags: document.getElementById('backendTags'),
    aiTags: document.getElementById('aiTags'),
    letGuavaDecide: document.getElementById('letGuavaDecide'),

    // Step 8: Review
    reviewContent: document.getElementById('reviewContent'),
    
    // Nav & Mode
    backBtn: document.getElementById('backBtn'),
    nextBtn: document.getElementById('nextBtn'),
    navButtons: document.getElementById('navButtons'),
    themeToggle: document.getElementById('themeToggle'),
    btnModeStep: document.getElementById('btnModeStep'),
    btnModeChat: document.getElementById('btnModeChat'),
    stepFormCard: document.getElementById('stepFormCard'),
    chatCard: document.getElementById('chatCard'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    chatSendBtn: document.getElementById('chatSendBtn'),
    btnSaveChatPRD: document.getElementById('btnSaveChatPRD')
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

  // Mode Switcher (Step Form vs Guava AI Chat)
  if (els.btnModeStep && els.btnModeChat) {
    els.btnModeStep.addEventListener('click', () => {
      els.btnModeStep.classList.add('active');
      els.btnModeChat.classList.remove('active');
      if (els.stepFormCard) els.stepFormCard.style.display = 'block';
      if (els.navButtons) els.navButtons.style.display = 'flex';
      if (els.chatCard) els.chatCard.style.display = 'none';
    });

    els.btnModeChat.addEventListener('click', () => {
      els.btnModeChat.classList.add('active');
      els.btnModeStep.classList.remove('active');
      if (els.stepFormCard) els.stepFormCard.style.display = 'none';
      if (els.navButtons) els.navButtons.style.display = 'none';
      if (els.chatCard) els.chatCard.style.display = 'flex';
      
      // Init chat if empty
      if (chatHistory.length === 0) {
        initChat();
      }
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
      // Step 2 (Optional executive summary)
      isValid = true;
    } else if (step === 3) {
      // Step 3 (Optional user roles)
      isValid = true;
    } else if (step === 4) {
      // Step 4 (Optional feature details)
      isValid = true;
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
      '2. Product Overview & Value Prop': [
        { label: 'Product Name', value: els.projectName?.value || 'N/A' },
        { label: 'Problem & Executive Summary', value: els.description?.value || 'N/A' },
        { label: 'Value Proposition', value: els.valueProp?.value || 'N/A' },
        { label: 'Success Metrics & Goals', value: els.successMetrics?.value || 'N/A' }
      ],
      '3. Target Audience & Market': [
        { label: 'User Roles & Personas', value: els.userRoles?.value || 'N/A' },
        { label: 'Pain Points & Needs', value: els.userPainPoints?.value || 'N/A' },
        { label: 'Competitor Analysis', value: els.competitorAnalysis?.value || 'N/A' }
      ],
      'Target Platforms': Array.from(state.platforms),
      '4. Functional Scope & Journey': [
        { label: 'Must-Have Features', value: els.coreFeatureDetails?.value || 'N/A' },
        { label: 'User Stories', value: els.userStories?.value || 'N/A' },
        { label: 'User Journey Flow', value: els.userJourney?.value || 'N/A' },
        { label: 'Out of Scope (Non-Goals)', value: els.outOfScope?.value || 'N/A' }
      ],
      'Feature Modules': Array.from(state.featureModules),
      '5. Auth, Security & Data': [
        { label: 'Access Control Matrix', value: els.permissionLevels?.value || 'N/A' },
        { label: 'Data Entities & Retention', value: els.dataEntities?.value || 'N/A' },
        { label: 'Security & Compliance', value: els.complianceNeeds?.value || 'N/A' }
      ],
      'Auth Methods': Array.from(state.authTypes),
      '6. Integrations & UX Guidelines': [
        { label: 'Custom APIs & Webhooks', value: els.customIntegrations?.value || 'N/A' },
        { label: 'Design & UX Inspiration', value: els.designPreferences?.value || 'N/A' },
        { label: 'Non-Functional Requirements (NFRs)', value: els.nonFunctionalReqs?.value || 'N/A' }
      ],
      Integrations: Array.from(state.integrations),
      '7. Architecture, Risks & Roadmap': [
        { label: 'Target Budget', value: els.budget?.options?.[els.budget.selectedIndex]?.text || els.budget?.value || 'N/A' },
        { label: 'Delivery Timeline', value: els.timeline?.options?.[els.timeline.selectedIndex]?.text || els.timeline?.value || 'N/A' },
        { label: 'Risks & Constraints', value: els.risksConstraints?.value || 'N/A' },
        { label: 'Future Vision & Roadmap', value: els.futureVision?.value || 'N/A' },
        { label: 'Deliverables & Asset Links', value: els.assetLinks?.value || 'N/A' }
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
      '2. Product Overview & Value Prop': 2,
      '3. Target Audience & Market': 3,
      'Target Platforms': 3,
      '4. Functional Scope & Journey': 4,
      'Feature Modules': 4,
      '5. Auth, Security & Data': 5,
      'Auth Methods': 5,
      '6. Integrations & UX Guidelines': 6,
      Integrations: 6,
      '7. Architecture, Risks & Roadmap': 7,
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
      overviewAndValueProp: {
        projectName: els.projectName?.value,
        description: els.description?.value,
        valueProp: els.valueProp?.value,
        successMetrics: els.successMetrics?.value
      },
      personasAndMarket: {
        userRoles: els.userRoles?.value,
        userPainPoints: els.userPainPoints?.value,
        competitorAnalysis: els.competitorAnalysis?.value,
        targetPlatforms: Array.from(state.platforms)
      },
      functionalScopeAndJourney: {
        featureModules: Array.from(state.featureModules),
        coreFeatureDetails: els.coreFeatureDetails?.value,
        userStories: els.userStories?.value,
        userJourney: els.userJourney?.value,
        outOfScope: els.outOfScope?.value
      },
      authAndDataModel: {
        authTypes: Array.from(state.authTypes),
        permissionLevels: els.permissionLevels?.value,
        dataEntities: els.dataEntities?.value,
        complianceNeeds: els.complianceNeeds?.value
      },
      integrationsAndUX: {
        integrationTypes: Array.from(state.integrations),
        customIntegrations: els.customIntegrations?.value,
        designPreferences: els.designPreferences?.value,
        nonFunctionalReqs: els.nonFunctionalReqs?.value
      },
      techRisksAndRoadmap: {
        budget: els.budget?.value,
        timeline: els.timeline?.value,
        risksConstraints: els.risksConstraints?.value,
        futureVision: els.futureVision?.value,
        assetLinks: els.assetLinks?.value,
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

  // ─── AI Chat Form Engine ──────────────────────────────────────
  const chatHistory = [];

  const addChatBubble = (text, role) => {
    if (!els.chatMessages) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    els.chatMessages.appendChild(bubble);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  };

  const initChat = () => {
    const welcomeMsg = "Hello! 👋 I'm your Guava AI Product Architect. I'm here to help you outline your product requirements in simple language.\n\nTo start, what is the name of your product, and what core problem does it solve for your users?";
    chatHistory.push({ role: 'model', text: welcomeMsg });
    addChatBubble(welcomeMsg, 'ai');
  };

  const handleSendChatMessage = async () => {
    if (!els.chatInput || !els.chatSendBtn) return;
    const userText = els.chatInput.value.trim();
    if (!userText) return;

    // Display User Message
    addChatBubble(userText, 'user');
    chatHistory.push({ role: 'user', text: userText });
    els.chatInput.value = '';

    // Show AI Typing Indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai';
    typingBubble.textContent = 'Guava AI is thinking... 💭';
    els.chatMessages.appendChild(typingBubble);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;

    els.chatSendBtn.disabled = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await res.json();
      typingBubble.remove();

      if (res.ok && data.success && data.reply) {
        addChatBubble(data.reply, 'ai');
        chatHistory.push({ role: 'model', text: data.reply });

        // Show compile button after 3 turns
        if (chatHistory.length >= 6 && els.btnSaveChatPRD) {
          els.btnSaveChatPRD.style.display = 'inline-block';
        }
      } else {
        addChatBubble(data.error || 'Sorry, I encountered an issue generating a response. Please try again.', 'ai');
      }
    } catch (err) {
      console.error(err);
      typingBubble.remove();
      addChatBubble('Network connection issue. Please try again.', 'ai');
    } finally {
      els.chatSendBtn.disabled = false;
    }
  };

  if (els.chatSendBtn && els.chatInput) {
    els.chatSendBtn.addEventListener('click', handleSendChatMessage);
    els.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendChatMessage();
      }
    });
  }

  // Save Chat PRD to Supabase Backend
  if (els.btnSaveChatPRD) {
    els.btnSaveChatPRD.addEventListener('click', async () => {
      els.btnSaveChatPRD.disabled = true;
      els.btnSaveChatPRD.textContent = 'Saving PRD to Backend...';

      const fullChatTranscript = chatHistory.map(m => `${m.role === 'user' ? 'Client' : 'Guava AI'}: ${m.text}`).join('\n\n');

      const payload = {
        contact: {
          fullName: 'AI Chat Client',
          email: 'chat-client@guava.earth'
        },
        overviewAndValueProp: {
          projectName: 'Guava AI Interactive Brief',
          description: fullChatTranscript.substring(0, 500) + '...'
        },
        aiChatTranscript: fullChatTranscript,
        submittedAt: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          addChatBubble(`🎉 Excellent! Your PRD transcript has been successfully saved to the backend (Lead ID: ${data.leadId}). Our Guava engineering team will review it and follow up shortly!`, 'ai');
          triggerConfetti();
        } else {
          alert('Failed to save PRD. Please try again.');
        }
      } catch (err) {
        console.error(err);
        alert('Network error saving PRD.');
      } finally {
        els.btnSaveChatPRD.disabled = false;
        els.btnSaveChatPRD.textContent = '💾 Compile & Save PRD to Backend';
      }
    });
  }

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
