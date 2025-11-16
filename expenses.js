/* ---------- Utilities ---------- */
function getTotalIncome() {
    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    return incomes.reduce((sum, i) => sum + Number(i.amount), 0);
}

/* ---------- Data ---------- */
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [
    "Transportation", "Shopping", "Entertainment", "Food/Drinks"
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let editIndex = null;
let deleteIndex = null;

/* ---------- On Load ---------- */
window.onload = () => {
    loadCategories();
    displayExpenses();
    document.getElementById('date').valueAsDate = new Date();
    updateBudgetUsage(); // Initialize budget usage
};

/* ---------- Sidebar Toggle ---------- */
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("show");
}

/* ---------- Add Expense ---------- */
function addExpense() {
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;

    if (!category || !amount || !date) {
        alert("Please fill all required fields!");
        return;
    }

    expenses.push({
        category, 
        amount: -Number(amount), 
        date, 
        notes,
        id: Date.now()
    });
    localStorage.setItem("expenses", JSON.stringify(expenses));
    clearForm();
    displayExpenses();
    updateBudgetUsage(); // Update budget usage
    refreshDashboardIfOpen(); // Refresh dashboard if open
}

/* ---------- Edit Expense ---------- */
function editExpense(i) {
    const e = expenses[i];
    document.getElementById("category").value = e.category;
    document.getElementById("amount").value = Math.abs(e.amount);
    document.getElementById("date").value = e.date;
    document.getElementById("notes").value = e.notes;
    editIndex = i;
    document.getElementById("addBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "block";
}

function updateExpense() {
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;

    expenses[editIndex] = {
        ...expenses[editIndex],
        category, 
        amount: -Number(amount), 
        date, 
        notes
    };
    localStorage.setItem("expenses", JSON.stringify(expenses));
    clearForm();
    displayExpenses();
    updateBudgetUsage(); // Update budget usage
    refreshDashboardIfOpen(); // Refresh dashboard if open

    document.getElementById("addBtn").style.display = "block";
    document.getElementById("updateBtn").style.display = "none";
}

/* ---------- Delete Expense ---------- */
function deleteExpense(i) {
    deleteIndex = i;
    document.getElementById("confirmPopup").style.display = "flex";
}

function confirmDelete(yes) {
    document.getElementById("confirmPopup").style.display = "none";
    if (yes) {
        expenses.splice(deleteIndex, 1);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        displayExpenses();
        updateBudgetUsage(); // Update budget usage
        refreshDashboardIfOpen(); // Refresh dashboard if open
    }
}

/* ---------- Display Expenses ---------- */
function displayExpenses() {
    const tbody = document.querySelector("#transaction-table tbody");
    tbody.innerHTML = "";

    const filtered = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    if (filtered.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = "No expense records for this month";
        cell.style.textAlign = "center";
        cell.style.color = "#777";
        cell.style.padding = "20px";
    } else {
        filtered.forEach((e, i) => {
            const row = tbody.insertRow();
            
            const categoryCell = row.insertCell();
            categoryCell.textContent = e.category;
            
            const amountCell = row.insertCell();
            amountCell.textContent = `Nu.${Math.abs(e.amount).toLocaleString()}`;
            
            const dateCell = row.insertCell();
            dateCell.textContent = e.date;
            
            const actionCell = row.insertCell();
            actionCell.className = "action";
            actionCell.innerHTML = `
                <div class="expense-actions">
                    <button class="edit-btn" onclick="editExpense(${expenses.findIndex(exp => exp.id === e.id)})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense(${expenses.findIndex(exp => exp.id === e.id)})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    document.getElementById("month-display").innerText =
        new Date(currentYear, currentMonth).toLocaleString("default", {month:"long", year:"numeric"});
    document.getElementById("count").innerText = "Transactions: " + filtered.length;

    const total = filtered.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    document.getElementById("total").innerText = `Total: Nu.${total.toLocaleString()}`;
}

/* ---------- Category Popup ---------- */
function openCategoryPopup() { 
    document.getElementById("categoryPopup").style.display = "flex"; 
    document.getElementById("searchCategory").value = "";
    document.getElementById("newCategory").value = "";
    filterCategory(); // Reset filter
}

function closePopup() { 
    document.getElementById("categoryPopup").style.display = "none"; 
}

function loadCategories() {
    const list = document.getElementById("categoryList");
    list.innerHTML = "";
    categories.forEach(c => {
        const li = document.createElement("li");
        li.innerText = c;
        li.onclick = () => { 
            document.getElementById("category").value = c; 
            closePopup(); 
        };
        list.appendChild(li);
    });
}

function filterCategory() {
    const q = document.getElementById("searchCategory").value.toLowerCase();
    document.querySelectorAll("#categoryList li").forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(q) ? "block" : "none";
    });
}

function addCustomCategory() {
    const c = document.getElementById("newCategory").value.trim();
    if (c && !categories.includes(c)) {
        categories.push(c);
        localStorage.setItem("categories", JSON.stringify(categories));
        loadCategories();
        document.getElementById("category").value = c;
        closePopup();
    }
    document.getElementById("newCategory").value = "";
}

// Add Enter key support for custom category
document.getElementById("newCategory").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addCustomCategory();
    }
});

/* ---------- Helper Functions ---------- */
function clearForm() {
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").valueAsDate = new Date();
    document.getElementById("notes").value = "";
    editIndex = null;
}

/* ---------- Month Navigation ---------- */
function prevMonth() { 
    currentMonth--; 
    if(currentMonth < 0) {
        currentMonth = 11; 
        currentYear--;
    } 
    displayExpenses(); 
}

function nextMonth() { 
    currentMonth++; 
    if(currentMonth > 11) {
        currentMonth = 0; 
        currentYear++;
    } 
    displayExpenses(); 
}

/* ---------- Budget Usage Update ---------- */
function updateBudgetUsage() {
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    
    if (budgets.length === 0) return;
    
    budgets.forEach(budget => {
        const categoryExpenses = expenses.filter(expense => 
            expense.category === budget.category
        );
        
        const totalSpent = categoryExpenses.reduce((sum, expense) => 
            sum + Math.abs(parseFloat(expense.amount || 0)), 0
        );
        
        budget.used = totalSpent;
    });
    
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

/* ---------- Dashboard Refresh ---------- */
function refreshDashboardIfOpen() {
    // Check if dashboard is open and refresh it
    if (window.opener && typeof window.opener.refreshDashboard === 'function') {
        window.opener.refreshDashboard();
    }
    
    // Also trigger storage event for same-window updates
    window.dispatchEvent(new Event('storage'));
}

/* ---------- Logout ---------- */
document.getElementById("logoutBtn").addEventListener("click", e => {
    e.preventDefault();
    window.location.href = "index.html";
});