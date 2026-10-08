document.addEventListener('DOMContentLoaded', () => {

  const calcBtn = document.getElementById('calc-btn');

  // Input Fields
  const purchaseYearSelect = document.getElementById('purchase-year');
  const shortTermGainsInput = document.getElementById('short-term-gains');
  const shortTermLossesInput = document.getElementById('short-term-losses');
  const longTermGainsInput = document.getElementById('long-term-gains');
  const lossCarryforwardInput = document.getElementById('loss-carryforward');
  const incomeRewardsInput = document.getElementById('income-rewards');
  const taxRateInput = document.getElementById('tax-rate');

  // Output Fields
  const totalTaxOutput = document.getElementById('total-tax');
  const resShortNetOutput = document.getElementById('res-short-net');
  const resLossUsedOutput = document.getElementById('res-loss-used');
  const resFreigrenze23Output = document.getElementById('res-freigrenze-23');
  const resTaxable23Output = document.getElementById('res-taxable-23');
  const resRewardsGrossOutput = document.getElementById('res-rewards-gross');
  const resFreigrenze22Output = document.getElementById('res-freigrenze-22');
  const resTaxable22Output = document.getElementById('res-taxable-22');
  const resTaxfreeLongOutput = document.getElementById('res-taxfree-long');
  const resTaxfreeFreigrenzeOutput = document.getElementById('res-taxfree-freigrenze');

  function calculateTaxEstimate() {
    // 1. Parsing Input Values
    const purchaseYear = purchaseYearSelect.value;
    const shortGains = parseFloat(shortTermGainsInput.value) || 0;
    const shortLosses = parseFloat(shortTermLossesInput.value) || 0;
    const longGains = parseFloat(longTermGainsInput.value) || 0;
    const lossCarryforward = parseFloat(lossCarryforwardInput.value) || 0;
    const rewards = parseFloat(incomeRewardsInput.value) || 0;
    const taxRatePercent = parseFloat(taxRateInput.value) || 0;

    const personalTaxRate = taxRatePercent / 100;

    // --- Private Veräußerungsgeschäfte (§ 23 EStG) ---
    let netShortGains = Math.max(0, shortGains - shortLosses);
    let lossUsed = 0;

    // Unverbindliche Verrechnung mit Verlustvortrag (§ 23 Abs. 3 Satz 8 EStG)
    if (netShortGains > 0 && lossCarryforward > 0) {
      lossUsed = Math.min(netShortGains, lossCarryforward);
      netShortGains -= lossUsed;
    }

    let taxable23 = 0;
    let freigrenze23Applied = false;
    let taxfreeFreigrenze23 = 0;

    // Schätzung der Freigrenze 1.000 € (§ 23 Abs. 3 Satz 5 EStG)
    if (netShortGains > 0) {
      if (netShortGains < 1000) {
        freigrenze23Applied = true;
        taxfreeFreigrenze23 = netShortGains;
        taxable23 = 0;
      } else {
        freigrenze23Applied = false;
        taxable23 = netShortGains;
      }
    }

    // --- Sonstige Einkünfte (§ 22 Nr. 3 EStG) ---
    let taxable22 = 0;
    let freigrenze22Applied = false;
    let taxfreeFreigrenze22 = 0;

    // Schätzung der Freigrenze 256 € (§ 22 Nr. 3 Satz 1 EStG)
    if (rewards > 0) {
      if (rewards < 256) {
        freigrenze22Applied = true;
        taxfreeFreigrenze22 = rewards;
        taxable22 = 0;
      } else {
        freigrenze22Applied = false;
        taxable22 = rewards;
      }
    }

    // --- Modellhafte Schätzberechnung ---
    let taxAmount23 = 0;
    let taxAmount22 = 0;

    if (purchaseYear === '2027') {
      // Geplante Abgeltungsteuer 25 % pauschal
      taxAmount23 = taxable23 * 0.25;
      taxAmount22 = taxable22 * personalTaxRate;
    } else {
      // Bis 2026: Persönlicher Steuersatz
      taxAmount23 = taxable23 * personalTaxRate;
      taxAmount22 = taxable22 * personalTaxRate;
    }

    const totalTaxEstimate = taxAmount23 + taxAmount22;

    // --- Rendering Results ---
    totalTaxOutput.textContent = formatCurrency(totalTaxEstimate);

    resShortNetOutput.textContent = formatCurrency(shortGains - shortLosses);
    resLossUsedOutput.textContent = formatCurrency(lossUsed);
    resFreigrenze23Output.textContent = freigrenze23Applied ? 'Ja (unter 1.000 €)' : 'Nein';
    resTaxable23Output.textContent = formatCurrency(taxable23);

    resRewardsGrossOutput.textContent = formatCurrency(rewards);
    resFreigrenze22Output.textContent = freigrenze22Applied ? 'Ja (unter 256 €)' : 'Nein';
    resTaxable22Output.textContent = formatCurrency(taxable22);

    resTaxfreeLongOutput.textContent = formatCurrency(longGains);
    resTaxfreeFreigrenzeOutput.textContent = formatCurrency(taxfreeFreigrenze23 + taxfreeFreigrenze22);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  // Event Listeners
  calcBtn.addEventListener('click', calculateTaxEstimate);
  
  // Real-time update on input change
  const allInputs = document.querySelectorAll('input, select');
  allInputs.forEach(input => {
    input.addEventListener('input', calculateTaxEstimate);
  });

  // Initial Calculation
  calculateTaxEstimate();
});