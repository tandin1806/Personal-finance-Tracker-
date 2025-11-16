document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const logoutBtn = document.getElementById('logoutBtn');

  // Sidebar toggle
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
  });

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('userData');
      sessionStorage.removeItem('userData');
      window.location.href = 'index.html';
    });
  }

  // Initialize dashboard with user data
  initializeDashboard();
});

// Function to initialize dashboard with user data
function initializeDashboard() {
  const userData = getUserData();
  const budgetData = getBudgetData();
  
  // Update summary cards
  updateSummaryCards(userData, budgetData);
  
  // Update budget summary card
  updateBudgetSummaryCard(budgetData);
  
  // Initialize charts based on available data
  initializeCharts(userData, budgetData);
  
  // Update budgets section
  updateBudgetsSection(userData, budgetData);
  
  // Update recent transactions
  updateRecentTransactions(userData);
}

// Function to get user data
function getUserData() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const incomes = JSON.parse(localStorage.getItem("incomes")) || [];
  
  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Math.abs(parseFloat(expense.amount || 0)), 0);
  const balance = totalIncome - totalExpenses;
  
  // Get recent transactions (last 10)
  const allTransactions = [
    ...incomes.map(income => ({
      type: 'income',
      category: income.source,
      amount: parseFloat(income.amount),
      date: income.date,
      notes: income.notes
    })),
    ...expenses.map(expense => ({
      type: 'expense',
      category: expense.category,
      amount: Math.abs(parseFloat(expense.amount)),
      date: expense.date,
      notes: expense.notes
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  
  return {
    balance: balance,
    income: totalIncome,
    expenses: totalExpenses,
    transactions: allTransactions,
    balanceHistory: generateBalanceHistory(incomes, expenses)
  };
}

// Function to get budget data - FIXED: Now reads from correct localStorage key
function getBudgetData() {
  // First try to get from userBudgets (from budget page)
  const storedBudgets = localStorage.getItem('userBudgets');
  if (storedBudgets) {
    return JSON.parse(storedBudgets);
  }
  
  // Fallback to old key for backward compatibility
  const oldBudgets = localStorage.getItem('budgets');
  return oldBudgets ? JSON.parse(oldBudgets) : [];
}

// Function to update budget summary card
function updateBudgetSummaryCard(budgetData) {
  const totalBudgetElement = document.getElementById('total-budget');
  const budgetUsedElement = document.getElementById('budget-used');
  const budgetRemainingElement = document.getElementById('budget-remaining');
  const budgetCountElement = document.getElementById('budget-count');
  
  if (budgetData && budgetData.length > 0) {
    const totalBudget = budgetData.reduce((sum, budget) => sum + parseFloat(budget.amount || budget.limit || 0), 0);
    const totalUsed = budgetData.reduce((sum, budget) => sum + parseFloat(budget.used || 0), 0);
    const totalRemaining = Math.max(0, totalBudget - totalUsed);
    const budgetCount = budgetData.length;
    
    if (totalBudgetElement) totalBudgetElement.textContent = `Nu.${totalBudget.toFixed(2)}`;
    if (budgetUsedElement) budgetUsedElement.textContent = `Nu.${totalUsed.toFixed(2)}`;
    if (budgetRemainingElement) budgetRemainingElement.textContent = `Nu.${totalRemaining.toFixed(2)}`;
    if (budgetCountElement) budgetCountElement.textContent = budgetCount;
  } else {
    if (totalBudgetElement) totalBudgetElement.textContent = 'Nu.0.00';
    if (budgetUsedElement) budgetUsedElement.textContent = 'Nu.0.00';
    if (budgetRemainingElement) budgetRemainingElement.textContent = 'Nu.0.00';
    if (budgetCountElement) budgetCountElement.textContent = '0';
  }
}

// Function to update summary cards with budget data
function updateSummaryCards(data, budgetData) {
  const balanceElement = document.getElementById('balanceAmount');
  const incomeElement = document.getElementById('incomeAmount');
  const expenseElement = document.getElementById('expenseAmount');
  const budgetTotalElement = document.getElementById('budgetTotalAmount');
  const budgetUsedElement = document.getElementById('budgetUsedAmount');
  
  if (balanceElement) {
    balanceElement.textContent = `Nu. ${data.balance.toFixed(2)}`;
    balanceElement.className = data.balance >= 0 ? 'green' : 'red';
  }
  
  if (incomeElement) {
    incomeElement.textContent = `Nu. ${data.income.toFixed(2)}`;
  }
  
  if (expenseElement) {
    expenseElement.textContent = `Nu. ${data.expenses.toFixed(2)}`;
  }
  
  // Update budget summary in main card
  if (budgetTotalElement && budgetUsedElement) {
    if (budgetData && budgetData.length > 0) {
      const totalBudget = budgetData.reduce((sum, budget) => sum + parseFloat(budget.amount || budget.limit || 0), 0);
      const totalUsed = budgetData.reduce((sum, budget) => sum + parseFloat(budget.used || 0), 0);
      
      budgetTotalElement.textContent = `Nu. ${totalBudget.toFixed(2)}`;
      budgetUsedElement.textContent = `Nu. ${totalUsed.toFixed(2)}`;
    } else {
      budgetTotalElement.textContent = 'Nu. 0';
      budgetUsedElement.textContent = 'Nu. 0';
    }
  }
}

// Function to initialize charts based on available data
function initializeCharts(data, budgetData) {
  const hasIncomeExpenseData = data.income > 0 || data.expenses > 0;
  const hasBudgetData = budgetData && budgetData.length > 0;
  const hasTransactionData = data.transactions && data.transactions.length > 0;
  const hasBalanceHistory = data.balanceHistory && data.balanceHistory.length > 0;
  
  // Income vs Expense Donut Chart
  if (hasIncomeExpenseData) {
    createDonut1(data);
    document.getElementById('donut1Empty').style.display = 'none';
  } else {
    document.getElementById('donut1').style.display = 'none';
    document.getElementById('donut1Empty').style.display = 'flex';
  }
  
  // Budget Usage Donut Chart
  if (hasBudgetData) {
    createDonut2(budgetData);
    document.getElementById('donut2Empty').style.display = 'none';
  } else {
    document.getElementById('donut2').style.display = 'none';
    document.getElementById('donut2Empty').style.display = 'flex';
  }
  
  // Bar Chart (Last 7 Days)
  if (hasTransactionData) {
    createBarChart(data);
    document.getElementById('barChartEmpty').style.display = 'none';
  } else {
    document.getElementById('barChart').style.display = 'none';
    document.getElementById('barChartEmpty').style.display = 'flex';
  }
  
  // Line Chart (Balance Trend)
  if (hasBalanceHistory) {
    createLineChart(data);
    document.getElementById('lineChartEmpty').style.display = 'none';
  } else {
    document.getElementById('lineChart').style.display = 'none';
    document.getElementById('lineChartEmpty').style.display = 'flex';
  }
}

// Function to create Income vs Expense donut chart
function createDonut1(data) {
  const donut1 = document.getElementById("donut1");
  if (!donut1) return;
  
  // Destroy existing chart if it exists
  if (donut1.chart) {
    donut1.chart.destroy();
  }
  
  donut1.chart = new Chart(donut1.getContext('2d'), {
    type: 'doughnut',
    data: { 
      labels: ["Income", "Expense"], 
      datasets: [{ 
        data: [data.income || 0, data.expenses || 0], 
        backgroundColor: ["#2e7d32","#c62828"],
        borderWidth: 0
      }] 
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      cutout: '75%', 
      plugins: { 
        legend: { 
          display: true, 
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: Nu.${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Function to create Budget Usage donut chart
function createDonut2(budgetData) {
  const donut2 = document.getElementById("donut2");
  if (!donut2) return;
  
  // Destroy existing chart if it exists
  if (donut2.chart) {
    donut2.chart.destroy();
  }
  
  // Calculate total budget usage across all categories
  const totalBudget = budgetData.reduce((sum, budget) => sum + parseFloat(budget.amount || budget.limit || 0), 0);
  const totalUsed = budgetData.reduce((sum, budget) => sum + parseFloat(budget.used || 0), 0);
  const remaining = Math.max(0, totalBudget - totalUsed);
  
  donut2.chart = new Chart(donut2.getContext('2d'), {
    type: 'doughnut',
    data: { 
      labels: ["Used", "Remaining"], 
      datasets: [{ 
        data: [totalUsed, remaining], 
        backgroundColor: ["#ef5350","#4caf50"],
        borderWidth: 0
      }] 
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      cutout: '75%', 
      plugins: { 
        legend: { 
          display: true, 
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: Nu.${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Function to create bar chart for last 7 days
function createBarChart(data) {
  const barChart = document.getElementById("barChart");
  if (!barChart) return;
  
  // Destroy existing chart if it exists
  if (barChart.chart) {
    barChart.chart.destroy();
  }
  
  const last7Days = getLast7DaysData();
  
  barChart.chart = new Chart(barChart.getContext('2d'), {
    type: 'bar',
    data: {
      labels: last7Days.labels,
      datasets: [
        { 
          label: "Income", 
          data: last7Days.income, 
          backgroundColor: "#2e7d32",
          borderRadius: 4
        },
        { 
          label: "Expense", 
          data: last7Days.expenses, 
          backgroundColor: "#c62828",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true, 
      maintainAspectRatio: false,
      scales: { 
        y: { 
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Nu.' + value;
            }
          }
        } 
      }, 
      plugins: { 
        legend: { 
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: Nu.${context.raw}`;
            }
          }
        }
      }
    }
  });
}

// Function to create line chart for balance trend
function createLineChart(data) {
  const lineChart = document.getElementById("lineChart");
  if (!lineChart) return;
  
  // Destroy existing chart if it exists
  if (lineChart.chart) {
    lineChart.chart.destroy();
  }
  
  lineChart.chart = new Chart(lineChart.getContext('2d'), {
    type: 'line',
    data: {
      labels: data.balanceHistory.map(entry => entry.date),
      datasets: [{
        label: "Balance", 
        data: data.balanceHistory.map(entry => entry.amount), 
        borderColor: "#388e3c", 
        backgroundColor: "rgba(56, 142, 60, 0.1)",
        tension: 0.3, 
        fill: true, 
        pointRadius: 4, 
        pointBackgroundColor: "#2e7d32",
        pointBorderColor: "#fff",
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: true,
          position: 'top'
        } 
      }, 
      scales: { 
        y: { 
          beginAtZero: false, 
          ticks: { 
            callback: function(value) {
              return 'Nu.' + value;
            }
          } 
        }
      }
    }
  });
}

// Function to update budgets section
function updateBudgetsSection(data, budgetData) {
  const budgetsContainer = document.getElementById('budgetsContainer');
  const noBudgetsMessage = document.getElementById('noBudgetsMessage');
  
  if (!budgetsContainer) return;
  
  // Clear existing budget items
  const existingBudgetItems = budgetsContainer.querySelectorAll('.budget-item');
  existingBudgetItems.forEach(item => item.remove());
  
  // Check if there are budgets
  if (budgetData && budgetData.length > 0) {
    // Hide the no budgets message
    if (noBudgetsMessage) noBudgetsMessage.style.display = 'none';
    
    // Add each budget item
    budgetData.forEach((budget, index) => {
      const budgetAmount = budget.amount || budget.limit || 0;
      const usedAmount = budget.used || 0;
      const percentage = budgetAmount > 0 ? Math.min(100, (usedAmount / budgetAmount) * 100) : 0;
      let color = '#4caf50'; // Green
      if (percentage > 80) color = '#ff9800'; // Orange
      if (percentage > 95) color = '#f44336'; // Red
      
      const budgetItem = document.createElement('div');
      budgetItem.className = 'budget-item';
      budgetItem.innerHTML = `
        <div class="budget-header">
          <span class="budget-category">${budget.name || budget.category}</span>
          <span class="budget-amount">Nu.${usedAmount.toFixed(2)} / Nu.${budgetAmount.toFixed(2)}</span>
        </div>
        <div class="progress">
          <div class="fill" style="width:${percentage}%; background-color:${color};"></div>
        </div>
        <div class="budget-footer">
          <span class="budget-type">${budget.type || 'Monthly'}</span>
          <span class="budget-percentage">${Math.round(percentage)}% used</span>
        </div>
      `;
      
      budgetsContainer.appendChild(budgetItem);
    });
  } else {
    // Show the no budgets message
    if (noBudgetsMessage) noBudgetsMessage.style.display = 'block';
  }
}

// Function to update recent transactions
function updateRecentTransactions(data) {
  const recentTransactions = document.getElementById('recentTransactions');
  
  if (!recentTransactions) return;
  
  // Clear existing content
  recentTransactions.innerHTML = '';
  
  if (data.transactions && data.transactions.length > 0) {
    data.transactions.forEach(transaction => {
      const transactionItem = document.createElement('div');
      transactionItem.className = 'transaction-item';
      transactionItem.innerHTML = `
        <div class="transaction-info">
          <span class="transaction-category">${transaction.category}</span>
          <span class="transaction-date">${formatDate(transaction.date)}</span>
          ${transaction.notes ? `<span class="transaction-notes" style="font-size: 12px; color: #666;">${transaction.notes}</span>` : ''}
        </div>
        <div class="transaction-amount ${transaction.type}">
          ${transaction.type === 'income' ? '+' : '-'}Nu.${transaction.amount.toFixed(2)}
        </div>
      `;
      recentTransactions.appendChild(transactionItem);
    });
  } else {
    recentTransactions.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exchange-alt"></i>
        <p>No recent transactions</p>
        <small>Add income or expenses to see recent activity</small>
      </div>
    `;
  }
}

// Budget Modal Functions
let currentEditingBudgetIndex = -1;

function openEditBudgetModal(index) {
  const budgets = getBudgetData();
  const budget = budgets[index];
  
  if (!budget) return;
  
  currentEditingBudgetIndex = index;
  
  document.getElementById('editBudgetCategory').value = budget.category || budget.name;
  document.getElementById('editBudgetLimit').value = budget.amount || budget.limit;
  
  document.getElementById('editBudgetModal').style.display = 'flex';
}

function closeEditBudgetModal() {
  document.getElementById('editBudgetModal').style.display = 'none';
  currentEditingBudgetIndex = -1;
}

function saveBudgetEdit() {
  const category = document.getElementById('editBudgetCategory').value;
  const limit = parseFloat(document.getElementById('editBudgetLimit').value);
  
  if (!category || !limit) {
    alert('Please fill in all fields');
    return;
  }
  
  const budgets = getBudgetData();
  if (currentEditingBudgetIndex >= 0 && currentEditingBudgetIndex < budgets.length) {
    if (budgets[currentEditingBudgetIndex].name) {
      budgets[currentEditingBudgetIndex].name = category;
    } else {
      budgets[currentEditingBudgetIndex].category = category;
    }
    
    if (budgets[currentEditingBudgetIndex].amount) {
      budgets[currentEditingBudgetIndex].amount = limit;
    } else {
      budgets[currentEditingBudgetIndex].limit = limit;
    }
    
    localStorage.setItem('budgets', JSON.stringify(budgets));
    closeEditBudgetModal();
    refreshDashboard();
  }
}

function openDeleteBudgetModal(index) {
  currentEditingBudgetIndex = index;
  document.getElementById('deleteBudgetModal').style.display = 'flex';
}

function closeDeleteBudgetModal() {
  document.getElementById('deleteBudgetModal').style.display = 'none';
  currentEditingBudgetIndex = -1;
}

function confirmDeleteBudget() {
  const budgets = getBudgetData();
  if (currentEditingBudgetIndex >= 0 && currentEditingBudgetIndex < budgets.length) {
    budgets.splice(currentEditingBudgetIndex, 1);
    localStorage.setItem('budgets', JSON.stringify(budgets));
    closeDeleteBudgetModal();
    refreshDashboard();
  }
}

// Helper function to process last 7 days data
function getLast7DaysData() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const incomes = JSON.parse(localStorage.getItem("incomes")) || [];
  
  const labels = [];
  const incomeData = new Array(7).fill(0);
  const expenseData = new Array(7).fill(0);
  
  // Generate last 7 days labels
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    
    const dateString = date.toISOString().split('T')[0];
    
    // Calculate income for this day
    const dayIncome = incomes
      .filter(income => income.date === dateString)
      .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    
    // Calculate expenses for this day
    const dayExpenses = expenses
      .filter(expense => expense.date === dateString)
      .reduce((sum, expense) => sum + Math.abs(parseFloat(expense.amount || 0)), 0);
    
    incomeData[6-i] = dayIncome;
    expenseData[6-i] = dayExpenses;
  }
  
  return { labels, income: incomeData, expenses: expenseData };
}

// Helper function to generate balance history
function generateBalanceHistory(incomes, expenses) {
  const allTransactions = [
    ...incomes.map(income => ({ ...income, type: 'income' })),
    ...expenses.map(expense => ({ ...expense, type: 'expense' }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let runningBalance = 0;
  const balanceHistory = [];
  
  allTransactions.forEach(transaction => {
    if (transaction.type === 'income') {
      runningBalance += parseFloat(transaction.amount || 0);
    } else {
      runningBalance -= Math.abs(parseFloat(transaction.amount || 0));
    }
    
    balanceHistory.push({
      date: new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: runningBalance
    });
  });
  
  // If no transactions, return current balance
  if (balanceHistory.length === 0) {
    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Math.abs(parseFloat(expense.amount || 0)), 0);
    return [{
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: totalIncome - totalExpenses
    }];
  }
  
  return balanceHistory.slice(-10); // Last 10 points
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Function to refresh dashboard (call this when new data is added)
function refreshDashboard() {
  initializeDashboard();
}

// Add event listener for storage changes to update dashboard when data changes
window.addEventListener('storage', function(e) {
  if (e.key === 'userBudgets' || e.key === 'budgets' || e.key === 'expenses' || e.key === 'incomes') {
    refreshDashboard();
  }
});

// Also refresh when returning to the page
window.addEventListener('focus', refreshDashboard);

// Listen for custom events from budget page
window.addEventListener('budgetUpdated', refreshDashboard);