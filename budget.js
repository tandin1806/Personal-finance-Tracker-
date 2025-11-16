// Budget Management System
class BudgetManager {
  constructor() {
    this.budgets = this.loadBudgets();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderBudgets();
  }

  setupEventListeners() {
    // Sidebar toggle
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menuToggle');
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('show'));

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", e => {
      e.preventDefault();
      window.location.href = "index.html";
    });

    // Add budget button
    document.getElementById("add-budget").addEventListener("click", () => {
      this.openAddBudgetModal();
    });

    // Modal events
    const modal = document.getElementById("budget-modal");
    const closeBtn = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancel-budget");

    closeBtn.addEventListener("click", () => this.closeModal());
    cancelBtn.addEventListener("click", () => this.closeModal());
    
    window.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Form submission
    document.getElementById("budget-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveBudget();
    });
  }

  openAddBudgetModal() {
    document.getElementById("budget-modal").style.display = "block";
    document.getElementById("budget-form").reset();
  }

  closeModal() {
    document.getElementById("budget-modal").style.display = "none";
  }

  saveBudget() {
    const name = document.getElementById("budget-name").value;
    const type = document.getElementById("budget-type").value;
    const amount = parseFloat(document.getElementById("budget-amount").value);
    const category = document.getElementById("budget-category").value;

    const newBudget = {
      id: Date.now().toString(),
      name,
      type,
      amount,
      category,
      used: 0,
      createdAt: new Date().toISOString(),
      startDate: new Date().toLocaleDateString(),
      endDate: this.calculateEndDate(type)
    };

    this.budgets.push(newBudget);
    this.saveBudgets();
    this.renderBudgets();
    this.closeModal();
    
    // Update dashboard data
    this.updateDashboardData();
  }

  calculateEndDate(type) {
    const endDate = new Date();
    if (type === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (type === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate.toLocaleDateString();
  }

  deleteBudget(budgetId) {
    this.budgets = this.budgets.filter(budget => budget.id !== budgetId);
    this.saveBudgets();
    this.renderBudgets();
    this.updateDashboardData();
    
    // Show success message
    this.showNotification('Budget deleted successfully!', 'success');
  }

  editBudget(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    // Create edit modal
    this.createEditModal(budget);
  }

  createEditModal(budget) {
    // Remove existing edit modal if present
    const existingModal = document.getElementById('edit-budget-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'edit-budget-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close edit-close">&times;</span>
        <h2>Edit Budget</h2>
        <form id="edit-budget-form">
          <div class="form-group">
            <label for="edit-budget-name">Budget Name</label>
            <input type="text" id="edit-budget-name" value="${budget.name}" required>
          </div>
          
          <div class="form-group">
            <label for="edit-budget-amount">Total Amount (Nu.)</label>
            <input type="number" id="edit-budget-amount" value="${budget.amount}" required min="0" step="0.01">
          </div>
          
          <div class="form-group">
            <label for="edit-budget-used">Used Amount (Nu.)</label>
            <input type="number" id="edit-budget-used" value="${budget.used}" required min="0" step="0.01" max="${budget.amount}">
            <small style="color: #666; font-size: 0.85rem;">Maximum: Nu.${budget.amount.toFixed(2)}</small>
          </div>
          
          <div class="form-group">
            <label for="edit-budget-category">Category</label>
            <select id="edit-budget-category" required>
              <option value="Entertainment" ${budget.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
              <option value="Shopping" ${budget.category === 'Shopping' ? 'selected' : ''}>Shopping</option>
              <option value="Transportation" ${budget.category === 'Transportation' ? 'selected' : ''}>Transportation</option>
              <option value="Food" ${budget.category === 'Food' ? 'selected' : ''}>Food</option>
              <option value="Utilities" ${budget.category === 'Utilities' ? 'selected' : ''}>Utilities</option>
              <option value="Healthcare" ${budget.category === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
              <option value="Education" ${budget.category === 'Education' ? 'selected' : ''}>Education</option>
              <option value="Other" ${budget.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-cancel" id="cancel-edit-budget">Cancel</button>
            <button type="submit" class="btn-save">Update Budget</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Event listeners for edit modal
    modal.querySelector('.edit-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#cancel-edit-budget').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#edit-budget-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateBudget(budget.id, modal);
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  updateBudget(budgetId, modal) {
    const name = document.getElementById('edit-budget-name').value;
    const amount = parseFloat(document.getElementById('edit-budget-amount').value);
    const used = parseFloat(document.getElementById('edit-budget-used').value);
    const category = document.getElementById('edit-budget-category').value;

    if (used > amount) {
      alert('Used amount cannot exceed total budget amount!');
      return;
    }

    const budget = this.budgets.find(b => b.id === budgetId);
    if (budget) {
      budget.name = name;
      budget.amount = amount;
      budget.used = used;
      budget.category = category;
      
      this.saveBudgets();
      this.renderBudgets();
      this.updateDashboardData();
      modal.remove();
      
      // Show success message
      this.showNotification('Budget updated successfully!', 'success');
    }
  }

  createDeleteModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    // Remove existing delete modal if present
    const existingModal = document.getElementById('delete-budget-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'delete-budget-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close delete-close">&times;</span>
        <h2>Delete Budget</h2>
        <p>Are you sure you want to delete the budget "<strong>${budget.name}</strong>"?</p>
        <p style="color: #f44336; font-size: 0.9rem;">This action cannot be undone.</p>
        <div class="form-actions">
          <button type="button" class="btn-cancel" id="cancel-delete-budget">Cancel</button>
          <button type="button" class="btn-delete" id="confirm-delete-budget">
            <i class="fas fa-trash"></i> Delete Budget
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Event listeners for delete modal
    modal.querySelector('.delete-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#cancel-delete-budget').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#confirm-delete-budget').addEventListener('click', () => {
      this.deleteBudget(budgetId);
      modal.remove();
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : '#2196f3'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 15px;
      animation: slideIn 0.3s ease;
    `;

    // Close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(notification);

    // Event listeners
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  loadBudgets() {
    const stored = localStorage.getItem('userBudgets');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  saveBudgets() {
    localStorage.setItem('userBudgets', JSON.stringify(this.budgets));
  }

  renderBudgets() {
    const weeklyContainer = document.getElementById("weekly-budgets");
    const monthlyContainer = document.getElementById("monthly-budgets");
    const noWeekly = document.getElementById("no-weekly-budgets");
    const noMonthly = document.getElementById("no-monthly-budgets");

    // Clear containers
    weeklyContainer.innerHTML = '';
    monthlyContainer.innerHTML = '';

    const weeklyBudgets = this.budgets.filter(b => b.type === 'weekly');
    const monthlyBudgets = this.budgets.filter(b => b.type === 'monthly');

    // Show/hide empty states
    noWeekly.style.display = weeklyBudgets.length === 0 ? 'block' : 'none';
    noMonthly.style.display = monthlyBudgets.length === 0 ? 'block' : 'none';

    // Render weekly budgets
    weeklyBudgets.forEach(budget => {
      weeklyContainer.appendChild(this.createBudgetCard(budget));
    });

    // Render monthly budgets
    monthlyBudgets.forEach(budget => {
      monthlyContainer.appendChild(this.createBudgetCard(budget));
    });

    // Re-attach event listeners
    this.attachBudgetCardEvents();
  }

  createBudgetCard(budget) {
    const percentage = Math.min(100, (budget.used / budget.amount) * 100);
    const residual = budget.amount - budget.used;
    
    let progressColor = '#4caf50'; // Green
    if (percentage > 75) progressColor = '#ff9800'; // Orange
    if (percentage > 90) progressColor = '#f44336'; // Red

    const card = document.createElement("div");
    card.classList.add("budget-card");
    card.setAttribute("data-id", budget.id);
    card.innerHTML = `
      <div class="budget-header">
        <div>
          <div class="budget-title">${budget.name}</div>
          <div class="date-range">${budget.startDate} - ${budget.endDate}</div>
          <div class="budget-category">${budget.category}</div>
        </div>
        <div class="actions">
          <button class="edit-btn" data-id="${budget.id}" title="Edit Budget">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${budget.id}" title="Delete Budget">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="progress-bar">
        <div style="width:${percentage}%; background-color:${progressColor};"></div>
      </div>
      <div class="amounts">
        <span>Used: Nu.${budget.used.toFixed(2)}</span>
        <span>${percentage.toFixed(1)}%</span>
        <span>Total: Nu.${budget.amount.toFixed(2)}</span>
      </div>
      <p class="residual">Residual amount: Nu.${residual.toFixed(2)}</p>
    `;
    
    return card;
  }

  attachBudgetCardEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = (e) => {
        const budgetId = e.currentTarget.getAttribute("data-id");
        this.createDeleteModal(budgetId);
      };
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = (e) => {
        const budgetId = e.currentTarget.getAttribute("data-id");
        this.editBudget(budgetId);
      };
    });
  }

  updateDashboardData() {
    // This function updates the main user data that the dashboard uses
    const userData = this.getUserData();
    
    // Calculate totals for dashboard
    const totalBudget = this.budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalUsed = this.budgets.reduce((sum, budget) => sum + budget.used, 0);
    const totalRemaining = totalBudget - totalUsed;
    
    // Update user data with budget information
    userData.budgets = this.budgets;
    userData.budgetSummary = {
      totalBudget,
      totalUsed,
      totalRemaining,
      budgetCount: this.budgets.length
    };
    
    // Save updated user data
    localStorage.setItem('userFinanceData', JSON.stringify(userData));
    
    // If dashboard is open in another tab, it will refresh when needed
    if (window.opener) {
      window.opener.refreshDashboard();
    }
  }

  getUserData() {
    const storedData = localStorage.getItem('userFinanceData');
    if (storedData) {
      return JSON.parse(storedData);
    } else {
      return {
        balance: 0,
        income: 0,
        expenses: 0,
        transactions: [],
        budgets: [],
        budgetSummary: {
          totalBudget: 0,
          totalUsed: 0,
          totalRemaining: 0,
          budgetCount: 0
        },
        balanceHistory: []
      };
    }
  }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Initialize the budget manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BudgetManager();
});