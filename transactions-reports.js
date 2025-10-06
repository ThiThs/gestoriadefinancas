// ========== TRANSACTIONS & REPORTS FUNCTIONALITY ==========

// Global variables for transactions
let transactions = [];
let filteredTransactions = [];

// Categories
const personalCategories = [
    'Alimentação', 'Transporte', 'Lazer', 'Saúde', 
    'Educação', 'Casa', 'Roupas', 'Outros'
];

const businessCategories = [
    'Operacional', 'Marketing', 'Recursos Humanos', 'Vendas',
    'Financeiro', 'Tecnologia', 'Jurídico', 'Logística',
    'Manutenção', 'Segurança', 'Treinamento', 'Outros'
];

// Category Icons
const categoryIcons = {
    'Alimentação': '🍽️',
    'Transporte': '🚗',
    'Lazer': '🎮',
    'Saúde': '🏥',
    'Educação': '📚',
    'Casa': '🏠',
    'Roupas': '👕',
    'Outros': '📦',
    'Operacional': '⚙️',
    'Marketing': '📢',
    'Recursos Humanos': '👥',
    'Vendas': '💰',
    'Financeiro': '💹',
    'Tecnologia': '💻',
    'Jurídico': '⚖️',
    'Logística': '🚚',
    'Manutenção': '🔧',
    'Segurança': '🔒',
    'Treinamento': '📖'
};

// ========== TRANSACTIONS FUNCTIONS ==========

function loadTransactions() {
    const saved = localStorage.getItem('transactions');
    
    // Sempre iniciar vazio se não há dados salvos
    transactions = saved ? JSON.parse(saved) : [];
    
    filteredTransactions = [...transactions];
    renderTransactions();
    updateTotals();
    updateHomeScreenChart();
}

// Função removida - app agora inicia sempre vazio

function renderTransactions() {
    const listElement = document.getElementById('transactions-list');
    const emptyElement = document.getElementById('empty-transactions');
    
    if (filteredTransactions.length === 0) {
        listElement.style.display = 'none';
        emptyElement.style.display = 'block';
        return;
    }
    
    listElement.style.display = 'block';
    emptyElement.style.display = 'none';
    
    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    listElement.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-header">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}-transaction">
                        ${categoryIcons[transaction.category] || (transaction.type === 'income' ? '💰' : '💸')}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-date">${formatDate(transaction.date)}</div>
                    </div>
                </div>
                <div class="transaction-amount">
                    <div class="amount-value ${transaction.type}">
                        ${transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount)}
                    </div>
                </div>
            </div>
            <div class="transaction-footer">
                <span class="transaction-category">${transaction.category}</span>
                <button class="delete-button" onclick="deleteTransaction('${transaction.id}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `).join('');
}

function filterTransactions() {
    const query = document.getElementById('transaction-search').value.toLowerCase();
    
    if (!query) {
        filteredTransactions = [...transactions];
    } else {
        filteredTransactions = transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(query) ||
            transaction.category.toLowerCase().includes(query)
        );
    }
    
    renderTransactions();
}

function addTransaction(transactionData) {
    const newTransaction = {
        id: Date.now().toString(),
        ...transactionData,
        date: new Date().toISOString()
    };
    
    transactions.unshift(newTransaction);
    saveTransactions();
    loadTransactions();
    showToast(`✅ Transação "${newTransaction.description}" adicionada!`);
}

function deleteTransaction(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    const transaction = transactions.find(t => t.id === id);
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    loadTransactions();
    showToast(`🗑️ Transação "${transaction.description}" excluída!`);
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateTotals() {
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    totalExpenses = expenses;
    localStorage.setItem('totalExpenses', totalExpenses.toString());
    localStorage.setItem('totalIncome', income.toString());
    
    updateBalanceDisplay();
}

function updateHomeScreenChart() {
    const chartContent = document.getElementById('chart-content');
    if (!chartContent) return;
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenseTransactions.forEach(transaction => {
        const category = transaction.category || 'Outros';
        categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    
    const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    if (totalExpenses === 0) {
        chartContent.innerHTML = `
            <div class="chart-subtitle">Distribuição de Gastos:</div>
            <div class="no-data-text">Nenhum gasto encontrado. Adicione algumas transações para ver o gráfico.</div>
        `;
        return;
    }
    
    const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const categoryRows = Object.keys(categoryTotals)
        .sort((a, b) => categoryTotals[b] - categoryTotals[a])
        .slice(0, 6)
        .map((category, index) => {
            const percentage = ((categoryTotals[category] / totalExpenses) * 100).toFixed(1);
            return `
                <div class="category-row">
                    <div class="category-color" style="background-color: ${chartColors[index]};"></div>
                    <div class="category-name">${category}</div>
                    <div class="category-right">
                        <div class="category-percentage">${percentage}%</div>
                        <div class="category-value">${formatCurrency(categoryTotals[category])}</div>
                    </div>
                </div>
            `;
        }).join('');
    
    chartContent.innerHTML = `
        <div class="chart-subtitle">Distribuição de Gastos:</div>
        ${categoryRows}
    `;
}

// ========== TRANSACTION MODAL ==========

function openRealAddTransactionModal() {
    const modalHTML = `
        <div class="modal-overlay" id="real-transaction-modal">
            <div class="modal" style="max-height: 90vh; max-width: 500px;">
                <div class="modal-title">Nova Transação</div>
                
                <div class="input-group">
                    <label class="input-label">Descrição *</label>
                    <input type="text" class="input-field" id="new-description" placeholder="Ex: Supermercado, Salário...">
                </div>
                
                <div class="input-group">
                    <label class="input-label">Valor *</label>
                    <input type="number" class="input-field" id="new-amount" placeholder="0,00" step="0.01">
                </div>
                
                <div class="input-group">
                    <label class="input-label">Tipo</label>
                    <div style="display: flex; gap: 12px; margin-top: 8px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="transaction-type" value="expense" checked style="margin-right: 8px;">
                            <span style="color: #F44336;">💸 Gasto</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="transaction-type" value="income" style="margin-right: 8px;">
                            <span style="color: #4CAF50;">💰 Receita</span>
                        </label>
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Categoria</label>
                    <select class="input-field" id="new-category">
                        ${(businessMode ? businessCategories : personalCategories).map(cat => 
                            `<option value="${cat}">${cat}</option>`
                        ).join('')}
                    </select>
                </div>
                
                ${businessMode ? `
                    <div class="input-group" style="border: 1px solid #4CAF50; border-radius: 8px; padding: 16px; margin: 16px 0; background: rgba(76, 175, 80, 0.05);">
                        <div style="font-weight: bold; color: #4CAF50; margin-bottom: 12px;">📊 Informações Empresariais (Opcionais)</div>
                        
                        <div class="input-group" style="margin-bottom: 12px;">
                            <label class="input-label">Fornecedor</label>
                            <input type="text" class="input-field" id="new-supplier" placeholder="Nome do fornecedor">
                        </div>
                        
                        <div style="display: flex; gap: 12px;">
                            <div class="input-group" style="flex: 1;">
                                <label class="input-label">Centro de Custo</label>
                                <input type="text" class="input-field" id="new-cost-center" placeholder="Ex: ADM, VEN">
                            </div>
                            <div class="input-group" style="flex: 1;">
                                <label class="input-label">Projeto</label>
                                <input type="text" class="input-field" id="new-project" placeholder="Nome do projeto">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label">Número da Nota Fiscal</label>
                            <input type="text" class="input-field" id="new-invoice" placeholder="Ex: 12345">
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-buttons">
                    <button class="modal-button secondary" onclick="closeRealTransactionModal()">Cancelar</button>
                    <button class="modal-button primary" onclick="saveNewTransaction()">Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('real-transaction-modal').classList.add('active');
    document.getElementById('new-description').focus();
}

function closeRealTransactionModal() {
    const modal = document.getElementById('real-transaction-modal');
    if (modal) {
        modal.remove();
    }
}

function saveNewTransaction() {
    const description = document.getElementById('new-description').value.trim();
    const amount = parseFloat(document.getElementById('new-amount').value);
    const type = document.querySelector('input[name="transaction-type"]:checked').value;
    const category = document.getElementById('new-category').value;
    
    if (!description || isNaN(amount) || amount <= 0) {
        showToast('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    const transactionData = {
        description,
        amount,
        type,
        category,
        supplier: businessMode ? document.getElementById('new-supplier')?.value || '' : '',
        costCenter: businessMode ? document.getElementById('new-cost-center')?.value || '' : '',
        project: businessMode ? document.getElementById('new-project')?.value || '' : '',
        invoiceNumber: businessMode ? document.getElementById('new-invoice')?.value || '' : ''
    };
    
    addTransaction(transactionData);
    closeRealTransactionModal();
}

// Override the original function
function openAddTransactionModal() {
    openRealAddTransactionModal();
}

// ========== REPORTS FUNCTIONALITY ==========

function loadReportsScreen() {
    const reportsHTML = `
        <!-- Period Filters -->
        <div class="card fade-in">
            <h3 class="card-title">📊 Período de Análise</h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                <button class="period-filter active" data-period="thisMonth" onclick="selectPeriod('thisMonth')">Este Mês</button>
                <button class="period-filter" data-period="lastMonth" onclick="selectPeriod('lastMonth')">Mês Passado</button>
                <button class="period-filter" data-period="last3Months" onclick="selectPeriod('last3Months')">Últimos 3 Meses</button>
                <button class="period-filter" data-period="all" onclick="selectPeriod('all')">Todos</button>
            </div>
        </div>
        
        <!-- Financial Summary -->
        <div class="card fade-in">
            <h3 class="card-title">💰 Resumo Financeiro</h3>
            <div id="financial-summary"></div>
        </div>
        
        <!-- Category Chart -->
        <div class="card fade-in">
            <h3 class="card-title">🥧 Gastos por Categoria</h3>
            <div id="category-chart"></div>
        </div>
        
        <!-- Monthly Trend -->
        <div class="card fade-in">
            <h3 class="card-title">📈 Tendência Mensal</h3>
            <div id="monthly-trend"></div>
        </div>
        
        <!-- Advanced Analysis -->
        <div class="card fade-in">
            <h3 class="card-title">${businessMode ? '🏢 Análise Empresarial Avançada' : '🧠 Análise Inteligente'}</h3>
            <div id="advanced-analysis"></div>
        </div>
        
        <!-- Financial Score -->
        <div class="card fade-in">
            <h3 class="card-title">🎯 Score Financeiro</h3>
            <div id="financial-score"></div>
        </div>
    `;
    
    document.getElementById('reports-screen').innerHTML = reportsHTML;
    
    // Add CSS for period filters
    const style = document.createElement('style');
    style.textContent = `
        .period-filter {
            padding: 8px 16px;
            border: 1px solid #2E7D32;
            background: transparent;
            color: #2E7D32;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
        }
        
        .period-filter:hover, .period-filter.active {
            background: #2E7D32;
            color: white;
        }
        
        body.dark-mode .period-filter {
            border-color: #4CAF50;
            color: #4CAF50;
        }
        
        body.dark-mode .period-filter:hover,
        body.dark-mode .period-filter.active {
            background: #4CAF50;
            color: #000;
        }
    `;
    document.head.appendChild(style);
    
    updateReports('thisMonth');
}

let currentPeriod = 'thisMonth';

function selectPeriod(period) {
    currentPeriod = period;
    document.querySelectorAll('.period-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    updateReports(period);
}

function updateReports(period) {
    const filteredData = filterTransactionsByPeriod(period);
    
    updateFinancialSummary(filteredData);
    updateCategoryChart(filteredData);
    updateMonthlyTrend();
    updateAdvancedAnalysis(filteredData);
    updateFinancialScore(filteredData);
}

function filterTransactionsByPeriod(period) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        
        switch(period) {
            case 'thisMonth':
                return transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
            case 'lastMonth':
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                return transactionDate.getMonth() === lastMonth && 
                       transactionDate.getFullYear() === lastMonthYear;
            case 'last3Months':
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                return transactionDate >= threeMonthsAgo;
            case 'all':
            default:
                return true;
        }
    });
}

function updateFinancialSummary(data) {
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    const transactionCount = data.length;
    
    document.getElementById('financial-summary').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="text-align: center; padding: 16px; background: rgba(76, 175, 80, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${formatCurrency(totalIncome)}</div>
                <div style="color: #4CAF50; font-weight: 500;">📈 Receitas</div>
            </div>
            <div style="text-align: center; padding: 16px; background: rgba(244, 67, 54, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: #F44336;">${formatCurrency(totalExpenses)}</div>
                <div style="color: #F44336; font-weight: 500;">📉 Gastos</div>
            </div>
            <div style="text-align: center; padding: 16px; background: rgba(46, 125, 50, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: ${balance >= 0 ? '#4CAF50' : '#F44336'};">${formatCurrency(balance)}</div>
                <div style="font-weight: 500;">💰 Saldo</div>
            </div>
            <div style="text-align: center; padding: 16px; background: rgba(33, 150, 243, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: #2196F3;">${transactionCount}</div>
                <div style="color: #2196F3; font-weight: 500;">📊 Transações</div>
            </div>
        </div>
    `;
}

function updateCategoryChart(data) {
    const expenseTransactions = data.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenseTransactions.forEach(transaction => {
        const category = transaction.category || 'Outros';
        categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    
    const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    if (totalExpenses === 0) {
        document.getElementById('category-chart').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">🍰</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Gastos por Categoria</h3>
                <p style="margin: 0;">Adicione alguns gastos para ver como seus recursos estão sendo distribuídos por categoria.</p>
            </div>
        `;
        return;
    }
    
    const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
    
    const categoryRows = sortedCategories.map((category, index) => {
        const percentage = ((categoryTotals[category] / totalExpenses) * 100).toFixed(1);
        return `
            <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <div style="width: 20px; height: 20px; border-radius: 50%; background: ${chartColors[index % chartColors.length]}; margin-right: 12px;"></div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${categoryIcons[category] || '📦'} ${category}</div>
                    <div style="font-size: 14px; opacity: 0.7;">${percentage}% do total</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #F44336;">${formatCurrency(categoryTotals[category])}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('category-chart').innerHTML = categoryRows;
}

function updateMonthlyTrend() {
    // Se não há transações, mostrar estado vazio
    if (transactions.length === 0) {
        document.getElementById('monthly-trend').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Tendência Mensal</h3>
                <p style="margin: 0;">Adicione transações para ver a evolução dos seus gastos e receitas ao longo dos meses.</p>
            </div>
        `;
        return;
    }
    
    const monthlyData = {};
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyData[monthKey] = {
            name: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            income: 0,
            expenses: 0,
            transactions: 0
        };
    }
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (monthlyData[monthKey]) {
            if (transaction.type === 'expense') {
                monthlyData[monthKey].expenses += transaction.amount;
            } else {
                monthlyData[monthKey].income += transaction.amount;
            }
            monthlyData[monthKey].transactions++;
        }
    });
    
    const trendData = Object.values(monthlyData);
    const maxValue = Math.max(...trendData.map(m => Math.max(m.income, m.expenses)));
    
    const trendHTML = trendData.map(month => {
        const incomeHeight = maxValue > 0 ? (month.income / maxValue) * 100 : 0;
        const expenseHeight = maxValue > 0 ? (month.expenses / maxValue) * 100 : 0;
        
        return `
            <div style="flex: 1; text-align: center; margin: 0 4px;">
                <div style="height: 120px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; margin-bottom: 8px;">
                    <div style="width: 20px; background: #4CAF50; height: ${incomeHeight}%; margin-bottom: 2px; border-radius: 2px;" title="Receitas: ${formatCurrency(month.income)}"></div>
                    <div style="width: 20px; background: #F44336; height: ${expenseHeight}%; border-radius: 2px;" title="Gastos: ${formatCurrency(month.expenses)}"></div>
                </div>
                <div style="font-size: 12px; font-weight: 500;">${month.name}</div>
                <div style="font-size: 10px; opacity: 0.7;">${month.transactions} transações</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('monthly-trend').innerHTML = `
        <div style="display: flex; margin: 16px 0;">
            <div style="display: flex; align-items: center; margin-right: 16px;">
                <div style="width: 12px; height: 12px; background: #4CAF50; border-radius: 2px; margin-right: 6px;"></div>
                <span style="font-size: 14px;">Receitas</span>
            </div>
            <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: #F44336; border-radius: 2px; margin-right: 6px;"></div>
                <span style="font-size: 14px;">Gastos</span>
            </div>
        </div>
        <div style="display: flex; align-items: end; background: rgba(0,0,0,0.05); padding: 16px; border-radius: 8px;">
            ${trendHTML}
        </div>
    `;
}

function updateAdvancedAnalysis(data) {
    // Se não há dados, mostrar estado vazio
    if (data.length === 0) {
        document.getElementById('advanced-analysis').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Aguardando Dados</h3>
                <p style="margin: 0;">Adicione algumas transações para ver análises inteligentes e recomendações personalizadas.</p>
            </div>
        `;
        return;
    }
    
    const analysis = getAdvancedAnalysis(data);
    const insights = getTrendInsights();
    const recommendations = getPersonalizedRecommendations(data);
    
    const analysisHTML = analysis.map(item => `
        <div style="border-left: 4px solid ${item.color}; padding: 16px; margin: 16px 0; background: ${item.color}10; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 8px;">${getAnalysisIcon(item.type)}</span>
                <strong style="color: ${item.color};">${item.title}</strong>
            </div>
            <p style="margin-bottom: 12px;">${item.message}</p>
            ${item.action ? `<div style="font-style: italic; color: #666;">💡 ${item.action}</div>` : ''}
        </div>
    `).join('');
    
    const insightsHTML = insights.length > 0 ? `
        <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">📈 Insights de Tendência</h4>
            ${insights.map(insight => `<div style="padding: 8px 12px; background: rgba(33, 150, 243, 0.1); border-radius: 8px; margin: 8px 0;">${insight}</div>`).join('')}
        </div>
    ` : '';
    
    const recommendationsHTML = `
        <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">🎯 Recomendações Personalizadas</h4>
            ${recommendations.map(rec => `
                <div style="display: flex; align-items: flex-start; padding: 8px 0;">
                    <span style="margin-right: 8px;">${getRecommendationIcon(rec.icon)}</span>
                    <span>${rec.text}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('advanced-analysis').innerHTML = analysisHTML + insightsHTML + recommendationsHTML;
}

function getAdvancedAnalysis(data) {
    const analysis = [];
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Análise de gastos vs renda
    if (totalExpenses > totalIncome * 0.9 && totalIncome > 0) {
        analysis.push({
            type: 'alert',
            color: '#F44336',
            title: businessMode ? 'Fluxo de Caixa Crítico' : 'Orçamento Ultrapassado',
            message: businessMode 
                ? `Gastos representam ${((totalExpenses / totalIncome) * 100).toFixed(1)}% da receita. Risco de fluxo de caixa negativo.`
                : `Você gastou ${((totalExpenses / totalIncome) * 100).toFixed(1)}% da sua renda. Orçamento comprometido.`,
            action: businessMode 
                ? 'Revisar custos operacionais urgentemente'
                : 'Listar todos os gastos e identificar quais podem ser eliminados este mês'
        });
    } else if (totalExpenses > totalIncome * 0.7 && totalIncome > 0) {
        analysis.push({
            type: 'warning',
            color: '#FF9800',
            title: businessMode ? 'Margem Apertada' : 'Atenção ao Orçamento',
            message: businessMode
                ? `Gastos estão em ${((totalExpenses / totalIncome) * 100).toFixed(1)}% da receita. Margem de segurança baixa.`
                : `${((totalExpenses / totalIncome) * 100).toFixed(1)}% da renda comprometida. Monitore de perto.`,
            action: businessMode
                ? 'Identificar oportunidades de economia'
                : 'Revisar gastos da categoria que mais consome e definir limites mensais'
        });
    }
    
    // Análise de economia
    if (totalIncome > totalExpenses && totalIncome > 0) {
        const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
        if (savingsRate > 30) {
            analysis.push({
                type: 'success',
                color: '#4CAF50',
                title: 'Excelente Poupador',
                message: `Parabéns! Você está economizando ${savingsRate.toFixed(1)}% ${businessMode ? 'da receita' : 'da renda'}.`,
                action: businessMode ? 'Considere reinvestir no negócio' : 'Diversifique investimentos: 70% renda fixa, 30% renda variável'
            });
        }
    }
    
    return analysis;
}

function getTrendInsights() {
    const insights = [];
    const currentMonth = new Date().getMonth();
    
    // Insights sazonais
    if ([11, 0].includes(currentMonth)) {
        insights.push(businessMode
            ? 'Período de fim de ano tipicamente tem gastos elevados. Planeje fluxo de caixa para janeiro.'
            : 'Dezembro e janeiro são meses de gastos elevados. Prepare-se para o começo do ano.');
    }
    
    return insights;
}

function getPersonalizedRecommendations(data) {
    const recommendations = [];
    
    if (businessMode) {
        recommendations.push(
            { icon: 'document-text', text: 'Configure alertas automáticos para gastos que ultrapassem 80% do orçado por categoria.' },
            { icon: 'people', text: 'Implemente um sistema de aprovação para despesas acima de R$ 500.' },
            { icon: 'analytics', text: 'Faça reuniões mensais de revisão financeira com a equipe.' }
        );
    } else {
        recommendations.push(
            { icon: 'calendar', text: 'Defina domingo à noite como horário fixo para revisar gastos da semana.' },
            { icon: 'wallet', text: 'Aplique a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança.' },
            { icon: 'trending-up', text: 'Meta: economizar R$ 200/mês cortando 1 delivery/semana e 2 cafeterias.' }
        );
    }
    
    return recommendations.slice(0, 3);
}

function updateFinancialScore(data) {
    // Se não há dados, mostrar estado vazio
    if (data.length === 0) {
        document.getElementById('financial-score').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Score Financeiro</h3>
                <p style="margin: 0;">Adicione receitas e gastos para calcular seu score financeiro e receber avaliação personalizada.</p>
            </div>
        `;
        return;
    }
    
    let score = 100;
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Penalizar gastos excessivos
    if (totalIncome > 0) {
        const expenseRatio = totalExpenses / totalIncome;
        if (expenseRatio > 1) score -= 40;
        else if (expenseRatio > 0.8) score -= 25;
        else if (expenseRatio > 0.6) score -= 10;
        else if (expenseRatio < 0.3) score += 10;
    }
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    let level, description, color;
    
    if (score >= 90) {
        level = 'Excelente';
        description = businessMode ? 'Gestão financeira exemplar' : 'Controle financeiro excepcional';
        color = '#4CAF50';
    } else if (score >= 75) {
        level = 'Muito Bom';
        description = businessMode ? 'Gestão sólida com pequenos ajustes' : 'Bom controle, alguns ajustes';
        color = '#8BC34A';
    } else if (score >= 60) {
        level = 'Bom';
        description = businessMode ? 'No caminho certo, precisa melhorar' : 'Razoável, pode melhorar';
        color = '#FFC107';
    } else if (score >= 40) {
        level = 'Regular';
        description = businessMode ? 'Requer atenção e replanejamento' : 'Precisa de mais disciplina';
        color = '#FF9800';
    } else {
        level = 'Crítico';
        description = businessMode ? 'Situação financeira preocupante' : 'Requer ação imediata';
        color = '#F44336';
    }
    
    document.getElementById('financial-score').innerHTML = `
        <div style="display: flex; align-items: center; background: linear-gradient(135deg, ${color}20, ${color}10); padding: 24px; border-radius: 16px; border: 2px solid ${color}30;">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-right: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="font-size: 36px; font-weight: bold; color: ${color};">${score}</div>
                <div style="font-size: 14px; color: #666;">/100</div>
            </div>
            <div>
                <div style="font-size: 24px; font-weight: bold; color: ${color}; margin-bottom: 8px;">${level}</div>
                <div style="font-size: 16px; margin-bottom: 12px;">${description}</div>
                <div style="font-size: 14px; opacity: 0.8;">Score baseado na relação receitas vs gastos e diversificação</div>
            </div>
        </div>
    `;
}

// Helper functions
function getAnalysisIcon(type) {
    const icons = {
        'alert': '🚨',
        'warning': '⚠️',
        'success': '✅',
        'tip': '💡'
    };
    return icons[type] || '📊';
}

function getRecommendationIcon(iconName) {
    const icons = {
        'calendar': '📅',
        'wallet': '💰',
        'trending-up': '📈',
        'document-text': '📄',
        'people': '👥',
        'analytics': '📊'
    };
    return icons[iconName] || '💡';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// Initialize when switching to reports
function initializeReports() {
    loadReportsScreen();
}

// Initialize when switching to transactions  
function initializeTransactions() {
    loadTransactions();
}