// DOM Elements
const addBtn = document.getElementById("add-income");
const modal = document.getElementById("income-modal");
const cancelBtn = document.getElementById("cancel-btn");
const saveBtn = document.getElementById("save-btn");
const incomeList = document.getElementById("income-list");
const totalAmountEl = document.getElementById("total");
const incomeSource = document.getElementById("income-source");
const incomeCountry = document.getElementById("income-country");
const incomeAmount = document.getElementById("income-amount");
const incomeNotes = document.getElementById("income-notes");
const currencySymbol = document.getElementById("currency-symbol");

// Store incomes
let incomes = [];

// Open modal
addBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal
cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  clearModal();
});

// Close modal on clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    clearModal();
  }
});

// Update currency symbol when country changes
incomeCountry.addEventListener("change", () => {
  const selected = incomeCountry.selectedOptions[0];
  currencySymbol.textContent = selected.dataset.symbol || "Nu.";
});

// Save new income
saveBtn.addEventListener("click", () => {
  const source = incomeSource.value.trim();
  const country = incomeCountry.value;
  const symbol = incomeCountry.selectedOptions[0]?.dataset.symbol || "Nu.";
  const amount = parseFloat(incomeAmount.value);
  const notes = incomeNotes.value.trim();

  if (!source || !country || isNaN(amount) || amount <= 0) {
    alert("Please fill in all required fields with valid values.");
    return;
  }

  const income = { source, country, symbol, amount, notes };
  incomes.push(income);
  renderIncomes();
  modal.style.display = "none";
  clearModal();
});

// Clear modal fields
function clearModal() {
  incomeSource.value = "";
  incomeCountry.value = "";
  incomeAmount.value = "";
  incomeNotes.value = "";
  currencySymbol.textContent = "Nu.";
}

// Render incomes
function renderIncomes() {
  incomeList.innerHTML = "";

  let total = 0;

  incomes.forEach((inc, index) => {
    total += inc.amount;

    const card = document.createElement("div");
    card.classList.add("income-card");

    card.innerHTML = `
      <div>
        <div class="source">${inc.source}</div>
        <div class="notes">${inc.notes || ""}</div>
      </div>
      <div class="actions">
        <span class="amount">${inc.symbol}${inc.amount.toLocaleString()}</span>
        <button onclick="deleteIncome(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;

    incomeList.appendChild(card);
  });

  totalAmountEl.textContent = `${incomes[0]?.symbol || "Nu."}${total.toLocaleString()}`;
}

// Delete income
function deleteIncome(index) {
  if (confirm("Are you sure you want to delete this income?")) {
    incomes.splice(index, 1);
    renderIncomes();
  }
}
