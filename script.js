// ===== Finaniyal - Personal Finance Manager =====

// Force fresh start
localStorage.clear();

// ===== Categories Configuration =====
const CATEGORIES = {
    expense: [
        { id: 'transport', name: 'Transport', icon: 'fa-car' },
        { id: 'food', name: 'Food & Dining', icon: 'fa-utensils' },
        { id: 'shopping', name: 'Shopping', icon: 'fa-shopping-bag' },
        { id: 'bills', name: 'Bills & Utilities', icon: 'fa-file-invoice' },
        { id: 'entertainment', name: 'Entertainment', icon: 'fa-film' },
        { id: 'health', name: 'Health', icon: 'fa-heart-pulse' },
        { id: 'subscriptions', name: 'Subscriptions', icon: 'fa-repeat' },
        { id: 'savings', name: 'Savings', icon: 'fa-piggy-bank' },
        { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
    ],
    income: [
        { id: 'salary', name: 'Salary', icon: 'fa-briefcase' },
        { id: 'freelance', name: 'Freelance', icon: 'fa-laptop' },
        { id: 'investment', name: 'Investment', icon: 'fa-chart-line' },
        { id: 'gift', name: 'Gift', icon: 'fa-gift' },
        { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
    ]
};

// ===== App Data =====
const App = {
    transactions: [
        { id: 1, type: 'income', category: 'salary', description: 'Monthly Salary (Net)', amount: 4187.75, date: '2026-01-01', notes: 'January net income' },
        { id: 2, type: 'expense', category: 'transport', description: 'Car Loan Payment', amount: 758, date: '2026-01-05', notes: 'Monthly car installment' },
        { id: 3, type: 'expense', category: 'bills', description: 'Internet Bill', amount: 364, date: '2026-01-03', notes: 'Quarterly payment' },
        { id: 4, type: 'expense', category: 'transport', description: 'Petrol', amount: 150, date: '2026-01-06', notes: '' },
        { id: 5, type: 'expense', category: 'subscriptions', description: 'Subscriptions', amount: 86.30, date: '2026-01-02', notes: 'Netflix, Spotify, etc.' },
        { id: 6, type: 'expense', category: 'savings', description: 'Monthly Savings', amount: 800, date: '2026-01-01', notes: 'ASB, Versa, Public Gold, Mae' },
        { id: 7, type: 'expense', category: 'food', description: 'Groceries', amount: 250, date: '2026-01-07', notes: 'Weekly groceries' },
        { id: 8, type: 'expense', category: 'food', description: 'Restaurant', amount: 85, date: '2026-01-10', notes: 'Dinner with friends' },
        { id: 9, type: 'expense', category: 'entertainment', description: 'Cinema', amount: 45, date: '2026-01-11', notes: '' },
    ],
    
    budgets: [
        { id: 1, category: 'transport', limit: 1000, period: 'monthly' },
        { id: 2, category: 'bills', limit: 400, period: 'monthly' },
        { id: 3, category: 'transport', limit: 200, period: 'monthly' },
        { id: 4, category: 'subscriptions', limit: 100, period: 'monthly' },
        { id: 5, category: 'savings', limit: 800, period: 'monthly' }
    ],
    
    goals: [
        { id: 1, name: 'ASB', target: 6000, current: 1180.61, deadline: '2026-12-31', monthlyTarget: 500 },
        { id: 2, name: 'Versa', target: 1800, current: 354.18, deadline: '2026-12-31', monthlyTarget: 150 },
        { id: 3, name: 'Public Gold', target: 1200, current: 236.12, deadline: '2026-12-31', monthlyTarget: 100 },
        { id: 4, name: 'Tabung Mae', target: 600, current: 118.06, deadline: '2026-12-31', monthlyTarget: 50 }
    ],
    
    settings: {
        currency: 'MYR',
        darkMode: false
    },
    
    getCategory(type, id) {
        return CATEGORIES[type]?.find(c => c.id === id) || { name: 'Unknown', icon: 'fa-question' };
    },
    
    save() {
        localStorage.setItem('finaniyal_data', JSON.stringify({
            transactions: this.transactions,
            budgets: this.budgets,
            goals: this.goals,
            settings: this.settings
        }));
    },
    
    load() {
        const saved = localStorage.getItem('finaniyal_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.transactions = data.transactions || this.transactions;
            this.budgets = data.budgets || this.budgets;
            this.goals = data.goals || this.goals;
            this.settings = data.settings || this.settings;
        }
    }
};

// ===== Format Currency =====
function formatCurrency(amount) {
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ===== Format Date =====
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ===== Calculate Stats =====
function getStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyTransactions = App.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = App.goals.reduce((sum, g) => sum + g.current, 0);
    
    return { income, expenses, balance: income - expenses, savings };
}

// ===== Render Dashboard =====
function renderDashboard() {
    const stats = getStats();
    
    document.getElementById('totalBalance').textContent = formatCurrency(stats.balance);
    document.getElementById('totalIncome').textContent = formatCurrency(stats.income);
    document.getElementById('totalExpenses').textContent = formatCurrency(stats.expenses);
    document.getElementById('totalSavings').textContent = formatCurrency(stats.savings);
    
    // Recent transactions (last 5)
    const recent = [...App.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const tbody = document.getElementById('recentTransactions');
    
    tbody.innerHTML = recent.map(t => {
        const cat = App.getCategory(t.type, t.category);
        return `
            <tr>
                <td>
                    <div class="transaction-info">
                        <div class="transaction-icon ${t.type}">
                            <i class="fas ${cat.icon}"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${t.description}</h4>
                            <span>${cat.name}</span>
                        </div>
                    </div>
                </td>
                <td>${formatDate(t.date)}</td>
                <td><span class="badge badge-${t.type === 'income' ? 'success' : 'warning'}">${cat.name}</span></td>
                <td><span class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</span></td>
            </tr>
        `;
    }).join('');
    
    renderCharts();
}

// ===== Render Charts =====
let spendingChart, categoryChart;

function renderCharts() {
    const ctx1 = document.getElementById('spendingChart')?.getContext('2d');
    const ctx2 = document.getElementById('categoryChart')?.getContext('2d');
    
    if (!ctx1 || !ctx2) return;
    
    // Destroy existing charts
    if (spendingChart) spendingChart.destroy();
    if (categoryChart) categoryChart.destroy();
    
    // Spending Chart - Last 7 days
    const last7Days = [];
    const dailySpending = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString('en-MY', { weekday: 'short' }));
        
        const daySpending = App.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === d.toDateString())
            .reduce((sum, t) => sum + t.amount, 0);
        dailySpending.push(daySpending);
    }
    
    spendingChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Spending',
                data: dailySpending,
                backgroundColor: 'rgba(20, 184, 166, 0.8)',
                borderColor: 'rgba(20, 184, 166, 1)',
                borderWidth: 0,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { callback: v => 'RM ' + v }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Category Chart
    const categoryTotals = {};
    App.transactions.filter(t => t.type === 'expense').forEach(t => {
        const cat = App.getCategory('expense', t.category);
        categoryTotals[cat.name] = (categoryTotals[cat.name] || 0) + t.amount;
    });
    
    const colors = ['#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#6366f1'];
    
    categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: colors.slice(0, Object.keys(categoryTotals).length),
                borderWidth: 0,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15
                    }
                }
            }
        }
    });
}

// ===== Render Transactions Table =====
function renderTransactionsTable() {
    const month = document.getElementById('filterMonth')?.value;
    const type = document.getElementById('filterType')?.value || 'all';
    const category = document.getElementById('filterCategory')?.value || 'all';
    
    let filtered = [...App.transactions];
    
    if (month) {
        filtered = filtered.filter(t => t.date.startsWith(month));
    }
    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }
    if (category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>No transactions found</h3>
                        <p>Add your first transaction to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(t => {
        const cat = App.getCategory(t.type, t.category);
        return `
            <tr>
                <td>
                    <div class="transaction-info">
                        <div class="transaction-icon ${t.type}">
                            <i class="fas ${cat.icon}"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${t.description}</h4>
                            <span>${t.type === 'income' ? 'Income' : 'Expense'}</span>
                        </div>
                    </div>
                </td>
                <td>${formatDate(t.date)}</td>
                <td><span class="badge badge-${t.type === 'income' ? 'success' : 'warning'}">${cat.name}</span></td>
                <td class="text-muted">${t.notes || '-'}</td>
                <td><span class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn delete" onclick="deleteTransaction(${t.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== Render Budgets =====
function renderBudgets() {
    const grid = document.getElementById('budgetsGrid');
    if (!grid) return;
    
    if (App.budgets.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-pie"></i>
                <h3>No budgets set</h3>
                <p>Create a budget to track your spending</p>
            </div>
        `;
        return;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    grid.innerHTML = App.budgets.map(b => {
        const cat = App.getCategory('expense', b.category);
        const spent = App.transactions
            .filter(t => {
                const d = new Date(t.date);
                return t.type === 'expense' && t.category === b.category && 
                       d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percent = Math.min((spent / b.limit) * 100, 100);
        const status = percent >= 100 ? 'danger' : percent >= 75 ? 'warning' : '';
        
        return `
            <div class="card budget-card">
                <div class="budget-header">
                    <div class="budget-info">
                        <div class="budget-icon">
                            <i class="fas ${cat.icon}"></i>
                        </div>
                        <div class="budget-details">
                            <h4>${cat.name}</h4>
                            <span>Monthly Budget</span>
                        </div>
                    </div>
                    <button class="action-btn delete" onclick="deleteBudget(${b.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${status}" style="width: ${percent}%"></div>
                    </div>
                    <div class="budget-stats">
                        <span class="spent">${formatCurrency(spent)} spent</span>
                        <span>${formatCurrency(b.limit - spent)} left</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Render Goals =====
function renderGoals() {
    const grid = document.getElementById('goalsGrid');
    if (!grid) return;
    
    if (App.goals.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <h3>No savings goals</h3>
                <p>Set a goal to start saving</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = App.goals.map(g => {
        const percent = Math.min((g.current / g.target) * 100, 100);
        const remaining = g.target - g.current;
        
        return `
            <div class="card goal-card">
                <div class="goal-header">
                    <div class="goal-info">
                        <h4>${g.name}</h4>
                        <span>Target: ${formatDate(g.deadline)}</span>
                    </div>
                    <button class="action-btn delete" onclick="deleteGoal(${g.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="goal-progress">
                    <div class="goal-amount">
                        <span class="goal-current">${formatCurrency(g.current)}</span>
                        <span class="goal-target">of ${formatCurrency(g.target)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-primary btn-sm" onclick="addFundsToGoal(${g.id})">
                        <i class="fas fa-plus"></i> Add Funds
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Render savings prediction
    renderSavingsPrediction();
}

// ===== Render 5-Year Savings Prediction =====
let savingsProjectionChart;

function renderSavingsPrediction() {
    // Calculate current total savings
    const currentTotal = App.goals.reduce((sum, g) => sum + g.current, 0);
    
    // Calculate monthly contribution total
    const monthlyTotal = App.goals.reduce((sum, g) => sum + (g.monthlyTarget || 0), 0);
    
    // Calculate 5-year projection (60 months)
    const months = 60;
    const fiveYearTotal = currentTotal + (monthlyTotal * months);
    
    // Update summary values
    document.getElementById('currentTotalSavings').textContent = formatCurrency(currentTotal);
    document.getElementById('fiveYearSavings').textContent = formatCurrency(fiveYearTotal);
    
    // Render individual goal predictions
    const detailsContainer = document.getElementById('predictionDetails');
    if (detailsContainer) {
        const iconClasses = {
            'ASB': 'asb',
            'Versa': 'versa',
            'Public Gold': 'gold',
            'Tabung Mae': 'mae'
        };
        
        const iconSymbols = {
            'ASB': 'fa-landmark',
            'Versa': 'fa-mobile-alt',
            'Public Gold': 'fa-coins',
            'Tabung Mae': 'fa-piggy-bank'
        };
        
        detailsContainer.innerHTML = App.goals.map(g => {
            const monthlyContrib = g.monthlyTarget || 0;
            const fiveYearValue = g.current + (monthlyContrib * 60);
            const iconClass = iconClasses[g.name] || 'asb';
            const iconSymbol = iconSymbols[g.name] || 'fa-piggy-bank';
            
            return `
                <div class="prediction-detail-item">
                    <div class="icon ${iconClass}">
                        <i class="fas ${iconSymbol}"></i>
                    </div>
                    <div class="info">
                        <h5>${g.name}</h5>
                        <span class="current">RM${monthlyContrib}/mo × 60 months</span>
                        <span class="future">${formatCurrency(fiveYearValue)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Render projection chart
    renderSavingsProjectionChart(currentTotal, monthlyTotal);
}

function renderSavingsProjectionChart(currentTotal, monthlyTotal) {
    const ctx = document.getElementById('savingsProjectionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (savingsProjectionChart) savingsProjectionChart.destroy();
    
    // Generate data for 5 years (yearly intervals)
    const years = ['Now', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    const projectedValues = [];
    
    for (let i = 0; i <= 5; i++) {
        projectedValues.push(currentTotal + (monthlyTotal * 12 * i));
    }
    
    // Calculate compound interest scenario (assuming 4% annual return for ASB)
    const compoundValues = [];
    let compoundTotal = currentTotal;
    compoundValues.push(compoundTotal);
    
    for (let i = 1; i <= 5; i++) {
        // Add yearly contributions and apply 4% interest
        compoundTotal = (compoundTotal + (monthlyTotal * 12)) * 1.04;
        compoundValues.push(Math.round(compoundTotal));
    }
    
    savingsProjectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Regular Savings',
                    data: projectedValues,
                    borderColor: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#14b8a6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: 'With ~4% Returns (ASB)',
                    data: compoundValues,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) {
                            return 'RM ' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// ===== Render Reports =====
let incomeExpenseChart, trendChart;

function renderReports() {
    const stats = getStats();
    const savingsRate = stats.income > 0 ? ((stats.income - stats.expenses) / stats.income * 100).toFixed(0) : 0;
    
    document.getElementById('avgMonthlyIncome').textContent = formatCurrency(stats.income);
    document.getElementById('avgMonthlyExpense').textContent = formatCurrency(stats.expenses);
    document.getElementById('savingsRate').textContent = savingsRate + '%';
    
    const ctx1 = document.getElementById('incomeExpenseChart')?.getContext('2d');
    const ctx2 = document.getElementById('trendChart')?.getContext('2d');
    
    if (!ctx1 || !ctx2) return;
    
    if (incomeExpenseChart) incomeExpenseChart.destroy();
    if (trendChart) trendChart.destroy();
    
    // Income vs Expense Chart
    incomeExpenseChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses', 'Savings'],
            datasets: [{
                data: [stats.income, stats.expenses, stats.savings],
                backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { callback: v => 'RM ' + v }
                },
                x: { grid: { display: false } }
            }
        }
    });
    
    // Trend Chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = [4500, 4500, 4800, 4500, 5000, 4500];
    const expenseData = [3200, 2800, 3500, 3000, 3400, 2538.30];
    
    trendChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, pointStyle: 'circle' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { callback: v => 'RM ' + v }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// ===== Navigation =====
function navigateTo(section) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.toggle('active', s.id === section);
    });
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        budgets: 'Budgets',
        goals: 'Savings Goals',
        reports: 'Reports',
        settings: 'Settings'
    };
    document.querySelector('.page-title').textContent = titles[section] || 'Dashboard';
    
    // Close mobile sidebar
    document.querySelector('.sidebar').classList.remove('open');
    
    // Render section-specific content
    if (section === 'reports') renderReports();
}

// ===== Modals =====
function openModal(type) {
    closeAllModals();
    
    if (type === 'transaction') {
        document.getElementById('transactionModal').classList.add('active');
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        populateCategorySelect('expense');
    } else if (type === 'budget') {
        document.getElementById('budgetModal').classList.add('active');
        populateBudgetCategorySelect();
    } else if (type === 'goal') {
        document.getElementById('goalModal').classList.add('active');
        document.getElementById('goalDeadline').value = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function populateCategorySelect(type) {
    const select = document.getElementById('category');
    select.innerHTML = CATEGORIES[type].map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function populateBudgetCategorySelect() {
    const select = document.getElementById('budgetCategory');
    select.innerHTML = CATEGORIES.expense.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function populateFilterCategory() {
    const select = document.getElementById('filterCategory');
    if (!select) return;
    select.innerHTML = '<option value="all">All Categories</option>' +
        [...CATEGORIES.expense, ...CATEGORIES.income].map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

// ===== CRUD Operations =====
function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        App.transactions = App.transactions.filter(t => t.id !== id);
        App.save();
        refreshAll();
    }
}

function deleteBudget(id) {
    if (confirm('Delete this budget?')) {
        App.budgets = App.budgets.filter(b => b.id !== id);
        App.save();
        renderBudgets();
    }
}

function deleteGoal(id) {
    if (confirm('Delete this goal?')) {
        App.goals = App.goals.filter(g => g.id !== id);
        App.save();
        renderGoals();
    }
}

function addFundsToGoal(id) {
    const amount = prompt('Enter amount to add (RM):');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const goal = App.goals.find(g => g.id === id);
        if (goal) {
            goal.current += parseFloat(amount);
            App.save();
            renderGoals();
            renderDashboard();
        }
    }
}

// ===== Refresh All =====
function refreshAll() {
    renderDashboard();
    renderTransactionsTable();
    renderBudgets();
    renderGoals();
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo(this.dataset.section);
        });
    });
    
    // View all links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo(this.dataset.section);
        });
    });
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle')?.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });
    
    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeAllModals();
        });
    });
    
    // Add Transaction Button
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => openModal('transaction'));
    
    // Transaction Type Toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const type = this.dataset.type;
            document.getElementById('transactionType').value = type;
            populateCategorySelect(type);
        });
    });
    
    // Transaction Form
    document.getElementById('transactionForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const transaction = {
            id: Date.now(),
            type: document.getElementById('transactionType').value,
            amount: parseFloat(document.getElementById('amount').value),
            date: document.getElementById('date').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            notes: document.getElementById('notes').value
        };
        
        App.transactions.push(transaction);
        App.save();
        closeAllModals();
        this.reset();
        refreshAll();
    });
    
    // Budget Form
    document.getElementById('budgetForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const budget = {
            id: Date.now(),
            category: document.getElementById('budgetCategory').value,
            limit: parseFloat(document.getElementById('budgetAmount').value),
            period: 'monthly'
        };
        
        App.budgets.push(budget);
        App.save();
        closeAllModals();
        this.reset();
        renderBudgets();
    });
    
    // Goal Form
    document.getElementById('goalForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const goal = {
            id: Date.now(),
            name: document.getElementById('goalName').value,
            target: parseFloat(document.getElementById('goalTarget').value),
            current: parseFloat(document.getElementById('goalCurrent').value) || 0,
            deadline: document.getElementById('goalDeadline').value
        };
        
        App.goals.push(goal);
        App.save();
        closeAllModals();
        this.reset();
        renderGoals();
        renderDashboard();
    });
    
    // Filters
    document.getElementById('filterMonth')?.addEventListener('change', renderTransactionsTable);
    document.getElementById('filterType')?.addEventListener('change', renderTransactionsTable);
    document.getElementById('filterCategory')?.addEventListener('change', renderTransactionsTable);
    
    // Dark Mode Toggle
    document.getElementById('darkModeToggle')?.addEventListener('change', function() {
        document.documentElement.setAttribute('data-theme', this.checked ? 'dark' : 'light');
        App.settings.darkMode = this.checked;
        App.save();
    });
    
    // Export Data
    document.getElementById('exportData')?.addEventListener('click', () => {
        const csv = [['Date', 'Type', 'Description', 'Category', 'Amount', 'Notes']];
        App.transactions.forEach(t => {
            const cat = App.getCategory(t.type, t.category);
            csv.push([t.date, t.type, t.description, cat.name, t.amount, t.notes || '']);
        });
        
        const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `finaniyal-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    });
    
    // Clear Data
    document.getElementById('clearData')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            localStorage.clear();
            App.transactions = [];
            App.budgets = [];
            App.goals = [];
            App.save();
            refreshAll();
        }
    });
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    // Save initial data
    App.save();
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate filter categories
    populateFilterCategory();
    
    // Set current month filter
    const now = new Date();
    const filterMonth = document.getElementById('filterMonth');
    if (filterMonth) {
        filterMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    // Apply saved dark mode setting
    if (App.settings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Render all sections
    refreshAll();
    
    console.log('✅ Finaniyal loaded successfully!');
});
