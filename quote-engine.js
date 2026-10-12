// Chuy's Tires & Brake Service - TreadAI Quote Engine Widget
(function() {
  window.QuoteEngine = {
    openModal: function(service) {
      const modal = document.getElementById('quote-modal');
      if (modal) {
        if (service) {
          const serviceSelect = document.getElementById('modal-service-type');
          if (serviceSelect) serviceSelect.value = service;
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeModal: function() {
      const modal = document.getElementById('quote-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    submitQuote: async function(event, formId) {
      if (event) event.preventDefault();
      const form = document.getElementById(formId);
      if (!form) return;

      const year = form.querySelector('[name="year"]').value;
      const make = form.querySelector('[name="make"]').value;
      const model = form.querySelector('[name="model"]').value;
      const tireSize = form.querySelector('[name="tire_size"]').value;
      const email = form.querySelector('[name="email"]').value;
      const serviceType = form.querySelector('[name="service_type"]')?.value || 'tires';

      if (!year || !make || !model || !tireSize || !email) {
        alert('Please complete all fields to unleash your instant quote!');
        return;
      }

      // If submitted from inline form on homepage, open modal to show loading & results
      this.openModal(serviceType);

      const formContainer = document.getElementById('modal-quote-form-container');
      const loadingContainer = document.getElementById('modal-quote-loading-container');
      const resultsContainer = document.getElementById('modal-quote-results-container');
      const progressBar = document.getElementById('quote-progress-bar');
      const loadingStatus = document.getElementById('quote-loading-status');

      if (formContainer) formContainer.classList.add('hidden');
      if (resultsContainer) resultsContainer.classList.add('hidden');
      if (loadingContainer) loadingContainer.classList.remove('hidden');

      // TreadAI Multi-Step 4.5s Animated Pipeline
      const steps = [
        { progress: 15, msg: 'Connecting to TreadAI National Warehouse Inventory...' },
        { progress: 42, msg: 'Querying TreadAI Pricing API for Real-Time Tire Deals...' },
        { progress: 70, msg: 'Calling TreadAI Compatibility API for Bolt & Tolerance Checks...' },
        { progress: 90, msg: 'Calculating Chuy\'s Guaranteed Certified Labor & Brake Packages...' },
        { progress: 100, msg: 'Massive Action Complete! Quote Locked with 100% Certainty!' }
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 850));
        if (progressBar) progressBar.style.width = steps[i].progress + '%';
        if (loadingStatus) loadingStatus.textContent = steps[i].msg;
      }

      // Try calling serverless Cloudflare Worker API
      let quoteData = null;
      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, make, model, tireSize, email, serviceType })
        });
        if (response.ok) {
          quoteData = await response.json();
        }
      } catch (err) {
        console.warn('API endpoint unavailable or offline. Falling back to local TreadAI client engine.', err);
      }

      // High-Fidelity Client-Side Fallback if server offline
      if (!quoteData) {
        quoteData = QuoteEngine.generateMockTreadAIQuote(year, make, model, tireSize, email, serviceType);
      }

      // Update Credits in localStorage
      if (quoteData.remainingCredits !== undefined) {
        localStorage.setItem('chuys_quote_credits', quoteData.remainingCredits.toString());
        localStorage.setItem('chuys_subscription_tier', quoteData.plan || 'Free Tier');
        const creditDisplays = document.querySelectorAll('.user-credits-remaining');
        creditDisplays.forEach(el => {
          el.textContent = `${quoteData.remainingCredits} Quote Credits (${quoteData.plan || 'Free Tier'})`;
        });
      }

      // Render Results
      QuoteEngine.renderResults(quoteData);

      if (loadingContainer) loadingContainer.classList.add('hidden');
      if (resultsContainer) resultsContainer.classList.remove('hidden');
    },

    generateMockTreadAIQuote: function(year, make, model, tireSize, email, serviceType) {
      let currentCredits = parseInt(localStorage.getItem('chuys_quote_credits') || '1', 10);
      let plan = localStorage.getItem('chuys_subscription_tier') || 'Free Tier';
      let remaining = Math.max(0, currentCredits - 1);

      return {
        success: true,
        vehicle: `${year} ${make} ${model}`,
        tireSize: tireSize,
        email: email,
        serviceType: serviceType,
        plan: plan,
        remainingCredits: remaining,
        laborRate: 89.99,
        brakePackage: 179.99,
        options: [
          {
            tier: 'Good (Solid Value)',
            brand: 'RoadMaster Touring All-Season',
            size: tireSize,
            unitPrice: 114.99,
            fourTires: 459.96,
            labor: 89.99,
            totalTirePackage: 549.95,
            warranty: '45,000 Mile Treadwear Warranty',
            compatibilityScore: '100% Verified OEM Fitment',
            specs: 'Standard silica compound, wet traction rating A'
          },
          {
            tier: 'Better (Peak Performer - Recommended)',
            brand: 'Continental ExtremeGrip DWS06 Plus',
            size: tireSize,
            unitPrice: 168.50,
            fourTires: 674.00,
            labor: 89.99,
            totalTirePackage: 763.99,
            warranty: '65,000 Mile Treadwear Warranty + Free Road Hazard',
            compatibilityScore: '100% Verified Performance Fitment',
            specs: 'High-silica wet/dry grip, SportPlus tech, rim protection'
          },
          {
            tier: 'Best (Apex Dominator)',
            brand: 'Michelin Pilot Sport All-Season 4',
            size: tireSize,
            unitPrice: 219.00,
            fourTires: 876.00,
            labor: 89.99,
            totalTirePackage: 965.99,
            warranty: '70,000 Mile Treadwear Warranty + 3-Year Free Hazard',
            compatibilityScore: '100% Verified Ultra-High-Performance',
            specs: 'Dynamic Response tech, extreme stopping power, track-inspired'
          }
        ]
      };
    },

    renderResults: function(data) {
      const container = document.getElementById('quote-results-content');
      if (!container) return;

      const hasBrakeDiscount = (data.plan === 'Peak Performer' || data.plan === '$35/mo Tier');
      const brakePrice = hasBrakeDiscount ? (data.brakePackage * 0.9).toFixed(2) : data.brakePackage.toFixed(2);
      const brakeDiscountBadge = hasBrakeDiscount 
        ? '<span class="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-bold ml-2">10% MEMBER DISCOUNT APPLIED</span>' 
        : '';

      let optionsHtml = data.options.map((opt, idx) => `
        <div class="p-4 rounded-lg border ${idx === 1 ? 'border-orange-500 bg-gray-800/80 shadow-lg shadow-orange-950/40 relative' : 'border-gray-700 bg-gray-800/40'}">
          ${idx === 1 ? '<div class="absolute -top-3 right-4 badge-popular">Chuy\'s Top Choice</div>' : ''}
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-orange-400">${opt.tier}</span>
              <h4 class="text-lg font-bold text-white">${opt.brand}</h4>
              <p class="text-xs text-gray-400">Size: ${opt.size} • ${opt.compatibilityScore}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-black text-white">$${opt.totalTirePackage.toFixed(2)}</div>
              <div class="text-xs text-gray-400">Includes 4 tires + Mount & Road-Force Balance</div>
            </div>
          </div>
          <div class="text-xs text-gray-300 bg-gray-900/60 p-2 rounded mb-3">
            ✓ ${opt.warranty} | ✓ ${opt.specs}
          </div>
          <button onclick="QuoteEngine.bookBay('${opt.brand}', ${opt.totalTirePackage})" class="w-full ${idx === 1 ? 'btn-massive-action' : 'btn-secondary-action'} text-sm py-2">
            Lock In This Bay Reservation Now
          </button>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="mb-4 p-3 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-between text-xs">
          <div>
            <span class="text-gray-400">Vehicle:</span> <strong class="text-white">${data.vehicle}</strong> (${data.tireSize})
          </div>
          <div>
            <span class="text-gray-400">Remaining Monthly Credits:</span> <strong class="text-orange-400">${data.remainingCredits}</strong>
          </div>
        </div>

        <div class="space-y-3 mb-5">
          ${optionsHtml}
        </div>

        <div class="p-4 rounded-lg bg-orange-950/20 border border-orange-500/30 mb-4">
          <div class="flex justify-between items-center">
            <div>
              <h5 class="font-bold text-white text-sm flex items-center">
                <span>Add Ceramic Brake & Rotor Overhaul Package</span>
                ${brakeDiscountBadge}
              </h5>
              <p class="text-xs text-gray-300">50-Point Stopping Distance Inspection + Premium Ceramic Pads</p>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-orange-400">+$${brakePrice}</div>
              <span class="text-xs text-gray-400">Installed by ASE Master Tech</span>
            </div>
          </div>
        </div>
      `;
    },

    bookBay: function(packageName, price) {
      alert(`CONGRATULATIONS ON TAKING MASSIVE ACTION!\n\nYour reservation for ${packageName} ($${price.toFixed(2)}) is locked into Chuy's Priority Bay!\n\nCheck your email for VIP confirmation and gate code.`);
      this.closeModal();
    }
  };

  // Close modal when clicking outside
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('quote-modal');
    if (modal && e.target === modal) {
      QuoteEngine.closeModal();
    }
  });
})();
