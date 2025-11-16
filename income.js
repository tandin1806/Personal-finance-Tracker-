// Load incomes from localStorage
let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
let editingIndex = -1;
let deletingIndex = -1;

// DOM elements
const modal = document.getElementById("income-modal");
const confirmPopup = document.getElementById("confirmPopup");
const addIncomeBtn = document.getElementById("add-income");
const cancelBtn = document.getElementById("cancel-btn");
const saveBtn = document.getElementById("save-btn");
const updateBtn = document.getElementById("update-btn");
const incomeList = document.getElementById("income-list");
const filterSelect = document.getElementById("filter");
const currencySymbol = document.getElementById("currency-symbol");
const modalTitle = document.getElementById("modal-title");

// ------------ SIDEBAR TOGGLE --------------
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

// ------------ OPEN & CLOSE MODAL --------------
addIncomeBtn.onclick = () => {
    editingIndex = -1;
    modalTitle.textContent = "ADD NEW INCOME";
    saveBtn.style.display = "block";
    updateBtn.style.display = "none";
    modal.style.display = "flex";
};

cancelBtn.onclick = () => {
    closeModal();
};

function closeModal() {
    modal.style.display = "none";
    document.getElementById("income-source").value = "";
    document.getElementById("income-country").value = "";
    document.getElementById("income-amount").value = "";
    document.getElementById("income-notes").value = "";
    currencySymbol.innerText = "Nu.";
}

// Close modal when clicking outside
window.onclick = (e) => {
    if (e.target === modal) closeModal();
    if (e.target === confirmPopup) confirmPopup.style.display = "none";
};

// ------------ CHANGE CURRENCY SYMBOL ----------
document.getElementById("income-country").addEventListener("change", function () {
    let symbol = this.options[this.selectedIndex].dataset.symbol;
    currencySymbol.textContent = symbol;
});

// ------------ SAVE INCOME --------------
saveBtn.addEventListener("click", () => {
    let source = document.getElementById("income-source").value;
    let amount = Number(document.getElementById("income-amount").value);
    let notes = document.getElementById("income-notes").value;
    let currency = document.getElementById("income-country").value;

    if (!source || !amount || !currency) {
        alert("Please fill all required fields!");
        return;
    }

    incomes.push({
        source,
        amount,
        currency,
        notes,
        date: new Date().toISOString().split("T")[0],
        id: Date.now()
    });

    localStorage.setItem("incomes", JSON.stringify(incomes));

    closeModal();
    loadIncome();
    refreshDashboardIfOpen(); // Refresh dashboard if open
});

// ------------ UPDATE INCOME --------------
updateBtn.addEventListener("click", () => {
    if (editingIndex === -1) return;
    
    let source = document.getElementById("income-source").value;
    let amount = Number(document.getElementById("income-amount").value);
    let notes = document.getElementById("income-notes").value;
    let currency = document.getElementById("income-country").value;

    if (!source || !amount || !currency) {
        alert("Please fill all required fields!");
        return;
    }

    incomes[editingIndex] = {
        ...incomes[editingIndex],
        source,
        amount,
        currency,
        notes
    };

    localStorage.setItem("incomes", JSON.stringify(incomes));

    closeModal();
    loadIncome();
    refreshDashboardIfOpen(); // Refresh dashboard if open
});

// ------------ EDIT INCOME --------------
function editIncome(index) {
    editingIndex = index;
    const income = incomes[index];
    
    document.getElementById("income-source").value = income.source;
    document.getElementById("income-amount").value = income.amount;
    document.getElementById("income-notes").value = income.notes || '';
    document.getElementById("income-country").value = income.currency;
    
    // Update currency symbol
    let symbol = getCurrencySymbol(income.currency);
    currencySymbol.textContent = symbol;
    
    modalTitle.textContent = "EDIT INCOME";
    saveBtn.style.display = "none";
    updateBtn.style.display = "block";
    modal.style.display = "flex";
}

// ------------ DELETE INCOME --------------
function deleteIncome(index) {
    deletingIndex = index;
    confirmPopup.style.display = "flex";
}

function confirmDelete(yes) {
    confirmPopup.style.display = "none";
    if (yes && deletingIndex !== -1) {
        incomes.splice(deletingIndex, 1);
        localStorage.setItem("incomes", JSON.stringify(incomes));
        loadIncome();
        refreshDashboardIfOpen(); // Refresh dashboard if open
    }
    deletingIndex = -1;
}

// ------------ LOAD & DISPLAY INCOME ----------
function loadIncome() {
    incomeList.innerHTML = "";
    let filter = filterSelect.value;

    let filtered = incomes.filter(i => {
        if (filter === "") return true;
        return i.source.toLowerCase().includes(filter.toLowerCase());
    });

    let total = 0;

    if (filtered.length === 0) {
        incomeList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #777;">No income records found</div>';
    } else {
        filtered.forEach((inc, index) => {
            total += Number(inc.amount);

            // Find the original index for editing/deleting
            const originalIndex = incomes.findIndex(item => item.id === inc.id);

            let card = document.createElement("div");
            card.classList.add("income-card");

            card.innerHTML = `
                <div>
                    <div class="source">${inc.source}</div>
                    <div style="font-size: 12px; color: #777;">${inc.date}</div>
                    ${inc.notes ? `<div style="font-size: 12px; color: #777; margin-top: 5px;">${inc.notes}</div>` : ''}
                </div>
                <div class="amount">
                    ${getCurrencySymbol(inc.currency)}${inc.amount.toLocaleString()}
                    <div class="income-actions">
                        <button class="edit-btn" onclick="editIncome(${originalIndex})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteIncome(${originalIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            incomeList.appendChild(card);
        });
    }

    document.getElementById("total").innerHTML = `Nu.${total.toLocaleString()}`;
}

// Currency symbol helper
function getCurrencySymbol(curr) {
    switch (curr) {
        case "USD": return "$";
        case "INR": return "₹";
        case "EUR": return "€";
        case "GBP": return "£";
        default: return "Nu.";
    }
}

// ------------ DASHBOARD REFRESH ----------
function refreshDashboardIfOpen() {
    // Check if dashboard is open and refresh it
    if (window.opener && typeof window.opener.refreshDashboard === 'function') {
        window.opener.refreshDashboard();
    }
    
    // Also trigger storage event for same-window updates
    window.dispatchEvent(new Event('storage'));
}

// ------------ FILTERING ---------------
filterSelect.addEventListener("change", loadIncome);

// Initial load
loadIncome();