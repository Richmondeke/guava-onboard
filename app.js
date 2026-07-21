document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const els = {
    progressFill: document.getElementById('progressFill'),
    progressInfo: document.getElementById('progressInfo'),
    steps: Array.from({ length: 6 }, (_, i) => document.getElementById(`step-${i + 1}`)),
    stepSuccess: document.getElementById('step-success'),
    
    // Step 1
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    company: document.getElementById('company'),
    phone: document.getElementById('phone'),
    
    // Step 2
    projectTypeTags: document.getElementById('projectTypeTags'),
    customProjectType: document.getElementById('customProjectType'),
    addProjectTypeBtn: document.getElementById('addProjectTypeBtn'),
    
    // Step 3
    budget: document.getElementById('budget'),
    timeline: document.getElementById('timeline'),
    teamSize: document.getElementById('teamSize'),
    
    // Step 4
    frontendTags: document.getElementById('frontendTags'),
    backendTags: document.getElementById('backendTags'),
    databaseTags: document.getElementById('databaseTags'),
    aiTags: document.getElementById('aiTags'),
    cloudTags: document.getElementById('cloudTags'),
    letGuavaDecide: document.getElementById('letGuavaDecide'),
    customTech: document.getElementById('customTech'),
    addTechBtn: document.getElementById('addTechBtn'),
    
    // Step 5
    projectName: document.getElementById('projectName'),
    description: document.getElementById('description'),
    additionalNotes: document.getElementById('additionalNotes'),
    
    // Step 6
    reviewContent: document.getElementById('reviewContent'),
    
    // Nav
    backBtn: document.getElementById('backBtn'),
    nextBtn: document.getElementById('nextBtn'),
    navButtons: document.getElementById('navButtons'),
    
    // Theme Toggle
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
        // If not set, check system preference
        const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        targetTheme = isSystemLight ? 'dark' : 'light';
      }
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('guava_theme', targetTheme);
    });
  }

  // State
  let currentStep = 1;
  const totalSteps = 6;
  const state = {
    projectTypes: new Set(),
    techStack: {
      frontend: new Set(),
      backend: new Set(),
      database: new Set(),
      ai: new Set(),
      cloud: new Set(),
      custom: new Set(),
      letGuavaDecide: false
    }
  };

  // Data to render
  const tagData = {
    projectType: [
      { label: 'Web Application', emoji: '🌐' },
      { label: 'Mobile App', emoji: '📱' },
      { label: 'AI Agent / Chatbot', emoji: '🤖' },
      { label: 'Automation Workflow', emoji: '⚡' },
      { label: 'E-Commerce Platform', emoji: '🛒' },
      { label: 'Dashboard / Analytics', emoji: '📊' },
      { label: 'API / Integration', emoji: '🔌' },
      { label: 'Landing Page / Website', emoji: '🎨' },
      { label: 'CRM / Sales Tool', emoji: '💬' },
      { label: 'SaaS Platform', emoji: '🔄' }
    ],
    frontend: ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'HTML/CSS'],
    backend: ['Node.js', 'Python', 'Go', 'Java', 'Ruby', 'PHP'],
    database: ['PostgreSQL', 'MongoDB', 'Supabase', 'Firebase', 'MySQL', 'Redis'],
    ai: ['OpenAI', 'Claude', 'Gemini', 'Custom LLM', 'Computer Vision', 'Voice AI'],
    cloud: ['AWS', 'GCP', 'Azure', 'Vercel', 'Make.com', 'n8n', 'Zapier', 'Latenode']
  };

  // Render Tags
  const createTagElement = (label, category, isCustom = false, emoji = null) => {
    const btn = document.createElement('button');
    btn.className = `tag-card ${isCustom ? 'custom-tag selected' : ''}`;
    btn.dataset.value = label;
    btn.dataset.category = category;
    btn.type = 'button';
    
    let innerHTML = '';
    if (emoji) {
      innerHTML += `<span class="tag-emoji">${emoji}</span>`;
    }
    innerHTML += `<span class="tag-label">${label}</span>`;
    if (isCustom) {
      innerHTML += `<span class="remove-tag">×</span>`;
    } else {
      innerHTML += `<span class="tag-check">✓</span>`;
    }
    
    btn.innerHTML = innerHTML;
    
    // Event listener
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-tag')) {
        btn.remove();
        if (category === 'projectType') {
          state.projectTypes.delete(label);
        } else {
          state.techStack.custom.delete(label);
        }
        return;
      }
      
      if (isCustom) return; // Custom tags are always selected, can only be removed
      
      btn.classList.toggle('selected');
      const isSelected = btn.classList.contains('selected');
      
      if (category === 'projectType') {
        if (isSelected) state.projectTypes.add(label);
        else state.projectTypes.delete(label);
      } else {
        if (isSelected) state.techStack[category].add(label);
        else state.techStack[category].delete(label);
      }
      
      clearError(btn.closest('.form-group'));
    });
    
    return btn;
  };

  const renderTags = () => {
    // Project Types
    tagData.projectType.forEach(item => {
      if (els.projectTypeTags) {
        els.projectTypeTags.appendChild(createTagElement(item.label, 'projectType', false, item.emoji));
      }
    });
    // Tech
    ['frontend', 'backend', 'database', 'ai', 'cloud'].forEach(category => {
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
  }

  // Let Guava Decide
  if (els.letGuavaDecide) {
    els.letGuavaDecide.addEventListener('click', () => {
      els.letGuavaDecide.classList.toggle('active');
      const isActive = els.letGuavaDecide.classList.contains('active');
      state.techStack.letGuavaDecide = isActive;
      
      const grids = document.querySelectorAll('#step-4 .tag-grid');
      
      if (isActive) {
        grids.forEach(grid => grid.classList.add('dimmed'));
        // Deselect all tech tags
        const selectedTechTags = document.querySelectorAll('#step-4 .tag-card.selected');
        selectedTechTags.forEach(tag => tag.classList.remove('selected'));
        // Clear sets
        ['frontend', 'backend', 'database', 'ai', 'cloud', 'custom'].forEach(cat => state.techStack[cat].clear());
        // Remove custom tech tags from DOM
        document.querySelectorAll('#step-4 .custom-tag').forEach(tag => tag.remove());
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
      if (currentStep === 5) {
        els.nextBtn.textContent = 'Review Brief →';
      } else if (currentStep === 6) {
        els.nextBtn.textContent = 'Submit Brief →';
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
      
      if (n === 6) buildReviewStep();
      
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
  [els.fullName, els.email, els.budget, els.timeline, els.teamSize, els.description].forEach(el => {
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
      if (state.projectTypes.size === 0 && els.projectTypeTags) {
        showError(els.projectTypeTags, 'Please select at least one project type');
        isValid = false;
      }
    } else if (step === 3) {
      [els.budget, els.timeline, els.teamSize].forEach(el => {
        if (el && !el.value) {
          showError(el, 'This field is required');
          isValid = false;
        }
      });
    } else if (step === 5) {
      if (els.description && els.description.value.trim().length < 20) {
        showError(els.description, 'Description must be at least 20 characters');
        isValid = false;
      }
    }
    
    return isValid;
  };

  // Review Step
  const buildReviewStep = () => {
    if (!els.reviewContent) return;
    
    const reviewData = {
      Contact: [
        { label: 'Name', value: els.fullName?.value },
        { label: 'Email', value: els.email?.value },
        { label: 'Company', value: els.company?.value || 'N/A' },
        { label: 'Phone', value: els.phone?.value || 'N/A' }
      ],
      'Project Types': Array.from(state.projectTypes),
      Scope: [
        { label: 'Budget', value: els.budget?.options?.[els.budget.selectedIndex]?.text || els.budget?.value },
        { label: 'Timeline', value: els.timeline?.options?.[els.timeline.selectedIndex]?.text || els.timeline?.value },
        { label: 'Team Size', value: els.teamSize?.options?.[els.teamSize.selectedIndex]?.text || els.teamSize?.value }
      ],
      'Tech Stack': state.techStack.letGuavaDecide ? ['Let Guava Decide ✨'] : [
        ...state.techStack.frontend,
        ...state.techStack.backend,
        ...state.techStack.database,
        ...state.techStack.ai,
        ...state.techStack.cloud,
        ...state.techStack.custom
      ],
      Vision: [
        { label: 'Project Name', value: els.projectName?.value || 'N/A' },
        { label: 'Description', value: els.description?.value },
        { label: 'Additional Notes', value: els.additionalNotes?.value || 'N/A' }
      ]
    };

    let html = '';
    
    const stepMap = {
      'Contact': 1,
      'Project Types': 2,
      'Scope': 3,
      'Tech Stack': 4,
      'Vision': 5
    };

    for (const [section, data] of Object.entries(reviewData)) {
      html += `
        <div class="review-section">
          <div class="review-header">
            <h3>${section}</h3>
            <button class="edit-btn" data-goto="${stepMap[section]}">Edit</button>
          </div>
          <div class="review-content-body">
      `;
      
      if (Array.isArray(data) && typeof data[0] === 'string') {
        // Pills
        if (data.length === 0) {
          html += `<p>None selected</p>`;
        } else {
          html += `<div class="review-pills">`;
          data.forEach(pill => {
            html += `<span class="review-pill">${pill}</span>`;
          });
          html += `</div>`;
        }
      } else {
        // Key-Value
        html += `<div class="review-kv-list">`;
        data.forEach(kv => {
          html += `
            <div class="review-kv">
              <span class="review-kv-label">${kv.label}:</span>
              <span class="review-kv-value">${kv.value}</span>
            </div>
          `;
        });
        html += `</div>`;
      }
      
      html += `</div></div>`;
    }
    
    els.reviewContent.innerHTML = html;
    
    // Attach edit listeners
    els.reviewContent.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetStep = parseInt(e.target.dataset.goto, 10);
        goToStep(targetStep);
      });
    });
  };

  // Submit
  const submitForm = async () => {
    if (!validateStep(6)) return;
    
    const payload = {
      contact: {
        fullName: els.fullName?.value.trim() || '',
        email: els.email?.value.trim() || '',
        company: els.company?.value.trim() || '',
        phone: els.phone?.value.trim() || ''
      },
      projectTypes: Array.from(state.projectTypes),
      scope: {
        budget: els.budget?.value || '',
        timeline: els.timeline?.value || '',
        teamSize: els.teamSize?.value || ''
      },
      techStack: {
        frontend: Array.from(state.techStack.frontend),
        backend: Array.from(state.techStack.backend),
        database: Array.from(state.techStack.database),
        ai: Array.from(state.techStack.ai),
        cloud: Array.from(state.techStack.cloud),
        custom: Array.from(state.techStack.custom),
        letGuavaDecide: state.techStack.letGuavaDecide
      },
      vision: {
        projectName: els.projectName?.value.trim() || '',
        description: els.description?.value.trim() || '',
        additionalNotes: els.additionalNotes?.value.trim() || ''
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
      
      if (response.ok) {
        showSuccess();
      } else {
        throw new Error('Submission failed');
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
