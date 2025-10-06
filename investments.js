// ========== INVESTMENTS FUNCTIONALITY ==========

// Initialize investments screen
function loadInvestmentsScreen() {
    loadInvestments();
    updateInvestmentSuggestion();
    updateInvestmentsSummary();
    updateInvestmentCategories();
    updateInvestmentProgress();
    updateInvestmentGoals();
}

// ========== INVESTMENT SUGGESTION ==========
function updateInvestmentSuggestion() {
    const suggestionElement = document.getElementById('investment-suggestion');
    
    // Se não há dados de renda, mostrar estado vazio
    if (monthlyIncome <= 0) {
        suggestionElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">💡</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Aguardando Dados</h3>
                <p style="margin: 0;">Defina sua renda mensal na tela inicial para receber sugestões inteligentes de investimento.</p>
            </div>
        `;
        return;
    }
    
    // Calcular sugestão baseada no perfil
    const balance = monthlyIncome - totalExpenses;
    let suggestedAmount = 0;
    let suggestion = '';
    let color = '#2196F3';
    let priority = '';
    
    if (businessMode) {
        // Lógica empresarial - mais conservadora e focada em reservas
        if (balance > monthlyIncome * 0.3) {
            // Empresa com boa margem
            suggestedAmount = balance * 0.6;
            suggestion = 'Com sua margem operacional positiva, sugerimos investir 60% do saldo em reservas de emergência e expansão.';
            priority = '🎯 Prioridade: Reserva de emergência (6 meses de operação)';
            color = '#4CAF50';
        } else if (balance > 0) {
            // Empresa com margem apertada
            suggestedAmount = balance * 0.4;
            suggestion = 'Margem operacional apertada. Foque em criar uma reserva de emergência antes de investimentos arriscados.';
            priority = '⚠️ Prioridade: Reserva de segurança (3 meses de operação)';
            color = '#FF9800';
        } else {
            // Empresa no vermelho
            suggestion = 'Fluxo de caixa negativo. Priorize reduzir custos antes de pensar em investimentos.';
            priority = '🚨 Ação urgente: Revisar custos operacionais';
            color = '#F44336';
        }
    } else {
        // Lógica pessoal - mais flexível
        if (balance > monthlyIncome * 0.2) {
            // Boa situação financeira
            suggestedAmount = balance * 0.7;
            suggestion = 'Situação financeira saudável! Você pode investir uma parte significativa do que sobra.';
            priority = '🎯 Sugestão: Diversifique entre renda fixa (70%) e variável (30%)';
            color = '#4CAF50';
        } else if (balance > 0) {
            // Situação okay
            suggestedAmount = balance * 0.5;
            suggestion = 'Situação financeira estável. Comece investindo de forma gradual.';
            priority = '💡 Dica: Comece com renda fixa e vá aumentando aos poucos';
            color = '#2196F3';
        } else {
            // No vermelho
            suggestion = 'Gastos excedem a renda. Foque primeiro em equilibrar as finanças.';
            priority = '⚠️ Prioridade: Reduzir gastos e criar reserva de emergência';
            color = '#F44336';
        }
    }
    
    suggestionElement.innerHTML = `
        <div style="background: linear-gradient(135deg, ${color}20, ${color}10); padding: 20px; border-radius: 12px; border: 2px solid ${color}30;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="font-size: 32px; margin-right: 12px;">💡</div>
                <div>
                    <div style="font-size: 18px; font-weight: bold; color: ${color};">
                        ${businessMode ? 'Análise Empresarial' : 'Análise Pessoal'}
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">Baseado na sua situação atual</div>
                </div>
            </div>
            
            ${suggestedAmount > 0 ? `
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 28px; font-weight: bold; color: ${color};">
                        ${formatCurrency(suggestedAmount)}
                    </div>
                    <div style="font-size: 14px; opacity: 0.7;">Valor sugerido para investir este mês</div>
                </div>
            ` : ''}
            
            <div style="margin: 16px 0; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <p style="margin: 0; line-height: 1.4;">${suggestion}</p>
            </div>
            
            <div style="display: flex; align-items: center; padding: 8px 0;">
                <span style="margin-right: 8px;">ℹ️</span>
                <span style="font-size: 14px; font-weight: 500;">${priority}</span>
            </div>
        </div>
    `;
}

// ========== INVESTMENTS SUMMARY ==========
function updateInvestmentsSummary() {
    const summaryElement = document.getElementById('investments-summary');
    
    if (investments.length === 0) {
        summaryElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">💼</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Seus Investimentos</h3>
                <p style="margin: 0;">Comece a construir seu portfólio de investimentos. Adicione seu primeiro investimento abaixo!</p>
            </div>
        `;
        return;
    }
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const thisMonth = getThisMonthInvestments();
    const categoryCounts = getCategoryCounts();
    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, 'Nenhuma');
    
    summaryElement.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 16px; background: rgba(76, 175, 80, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${formatCurrency(totalInvested)}</div>
                <div style="color: #4CAF50; font-weight: 500;">💰 Total Investido</div>
            </div>
            <div style="text-align: center; padding: 16px; background: rgba(33, 150, 243, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: #2196F3;">${formatCurrency(thisMonth)}</div>
                <div style="color: #2196F3; font-weight: 500;">📅 Este Mês</div>
            </div>
            <div style="text-align: center; padding: 16px; background: rgba(156, 39, 176, 0.1); border-radius: 12px;">
                <div style="font-size: 24px; font-weight: bold; color: #9C27B0;">${investments.length}</div>
                <div style="color: #9C27B0; font-weight: 500;">📈 Investimentos</div>
            </div>
            <div style="text-align: center; padding: 16px; background: rgba(255, 152, 0, 0.1); border-radius: 12px;">
                <div style="font-size: 16px; font-weight: bold; color: #FF9800;">${topCategory}</div>
                <div style="color: #FF9800; font-weight: 500;">🎯 Categoria Principal</div>
            </div>
        </div>
        
        <div style="max-height: 300px; overflow-y: auto;">
            ${investments.map(investment => `
                <div style="display: flex; align-items: center; padding: 12px; margin: 8px 0; background: rgba(0,0,0,0.02); border-radius: 8px; border-left: 4px solid #4CAF50;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${investment.description}</div>
                        <div style="font-size: 14px; color: #666;">
                            ${investment.category}${investment.goal ? ` • ${investment.goal}` : ''} • ${formatDate(investment.date)}
                        </div>
                    </div>
                    <div style="text-align: right; margin-right: 12px;">
                        <div style="font-weight: bold; color: #4CAF50;">${formatCurrency(investment.amount)}</div>
                    </div>
                    <button onclick="deleteInvestment('${investment.id}')" style="background: #F44336; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== INVESTMENT CATEGORIES ==========
function updateInvestmentCategories() {
    const categoriesElement = document.getElementById('investment-categories');
    
    if (investments.length === 0) {
        categoriesElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Por Categoria</h3>
                <p style="margin: 0;">Veja como seus investimentos estão distribuídos por categoria de risco e tipo.</p>
            </div>
        `;
        return;
    }
    
    const categoryTotals = {};
    const categoryIcons = {
        'Renda Fixa': '🏦',
        'Renda Variável': '📈',
        'Fundos de Investimento': '🏢',
        'Criptomoedas': '₿',
        'Imóveis': '🏠',
        'Reserva de Emergência': '🛡️',
        'Outros': '📦'
    };
    
    investments.forEach(investment => {
        const category = investment.category || 'Outros';
        categoryTotals[category] = (categoryTotals[category] || 0) + investment.amount;
    });
    
    const totalInvested = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
    
    const chartColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548'];
    
    categoriesElement.innerHTML = sortedCategories.map((category, index) => {
        const percentage = ((categoryTotals[category] / totalInvested) * 100).toFixed(1);
        const color = chartColors[index % chartColors.length];
        
        return `
            <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <div style="width: 20px; height: 20px; border-radius: 50%; background: ${color}; margin-right: 12px;"></div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">
                        ${categoryIcons[category] || '📦'} ${category}
                    </div>
                    <div style="font-size: 14px; opacity: 0.7;">${percentage}% do portfólio</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${color};">${formatCurrency(categoryTotals[category])}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== INVESTMENT PROGRESS ==========
function updateInvestmentProgress() {
    const progressElement = document.getElementById('investment-progress');
    
    if (investments.length === 0 || monthlyIncome <= 0) {
        progressElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Progresso</h3>
                <p style="margin: 0;">Acompanhe seu progresso em relação às metas de investimento sugeridas.</p>
            </div>
        `;
        return;
    }
    
    const balance = monthlyIncome - totalExpenses;
    const suggestedAmount = businessMode ? balance * 0.6 : balance * 0.7;
    const thisMonthInvested = getThisMonthInvestments();
    const progressPercentage = suggestedAmount > 0 ? Math.min((thisMonthInvested / suggestedAmount) * 100, 100) : 0;
    
    let progressColor = '#F44336';
    let progressText = 'Abaixo da meta';
    if (progressPercentage >= 100) {
        progressColor = '#4CAF50';
        progressText = 'Meta alcançada!';
    } else if (progressPercentage >= 70) {
        progressColor = '#FF9800';
        progressText = 'Quase lá!';
    }
    
    progressElement.innerHTML = `
        <div style="background: rgba(0,0,0,0.02); padding: 20px; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div>
                    <div style="font-size: 18px; font-weight: bold;">Meta Mensal de Investimento</div>
                    <div style="font-size: 14px; opacity: 0.7;">Baseado na sua situação financeira</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: bold; color: ${progressColor};">${progressPercentage.toFixed(0)}%</div>
                    <div style="font-size: 14px; color: ${progressColor};">${progressText}</div>
                </div>
            </div>
            
            <div style="background: #E0E0E0; height: 12px; border-radius: 6px; margin-bottom: 16px; overflow: hidden;">
                <div style="background: ${progressColor}; height: 100%; width: ${progressPercentage}%; border-radius: 6px; transition: all 0.3s ease;"></div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
                <div>
                    <span style="color: #666;">Investido: </span>
                    <span style="font-weight: bold; color: ${progressColor};">${formatCurrency(thisMonthInvested)}</span>
                </div>
                <div>
                    <span style="color: #666;">Meta: </span>
                    <span style="font-weight: bold;">${formatCurrency(suggestedAmount)}</span>
                </div>
            </div>
        </div>
    `;
}

// ========== INVESTMENT GOALS ==========
function updateInvestmentGoals() {
    const goalsElement = document.getElementById('investment-goals');
    
    if (investments.length === 0) {
        goalsElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎆</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Metas e Objetivos</h3>
                <p style="margin: 0;">Defina objetivos para seus investimentos e acompanhe o progresso de cada meta.</p>
            </div>
        `;
        return;
    }
    
    const goalTotals = {};
    const goalIcons = {
        'Reserva de Emergência': '🛡️',
        'Aposentadoria': '👴',
        'Casa Própria': '🏠',
        'Viagem': '✈️',
        'Educação': '🎓',
        'Expansão do Negócio': '🚀',
        'Equipamentos': '⚙️',
        'Outros': '🎯'
    };
    
    investments.forEach(investment => {
        if (investment.goal) {
            const goal = investment.goal;
            goalTotals[goal] = (goalTotals[goal] || 0) + investment.amount;
        }
    });
    
    if (Object.keys(goalTotals).length === 0) {
        goalsElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9E9E9E;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎆</div>
                <h3 style="margin-bottom: 8px; color: inherit;">Defina Objetivos</h3>
                <p style="margin: 0;">Seus investimentos não têm objetivos definidos. Edite-os para adicionar metas específicas.</p>
            </div>
        `;
        return;
    }
    
    const totalWithGoals = Object.values(goalTotals).reduce((sum, val) => sum + val, 0);
    const sortedGoals = Object.keys(goalTotals).sort((a, b) => goalTotals[b] - goalTotals[a]);
    
    goalsElement.innerHTML = sortedGoals.map(goal => {
        const percentage = ((goalTotals[goal] / totalWithGoals) * 100).toFixed(1);
        
        return `
            <div style="display: flex; align-items: center; padding: 16px; margin: 8px 0; background: rgba(156, 39, 176, 0.05); border-radius: 8px; border-left: 4px solid #9C27B0;">
                <div style="font-size: 24px; margin-right: 12px;">${goalIcons[goal] || '🎯'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${goal}</div>
                    <div style="font-size: 14px; opacity: 0.7;">${percentage}% dos investimentos com objetivos</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #9C27B0;">${formatCurrency(goalTotals[goal])}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== HELPER FUNCTIONS ==========
function getThisMonthInvestments() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return investments
        .filter(investment => {
            const investmentDate = new Date(investment.date);
            return investmentDate.getMonth() === currentMonth && 
                   investmentDate.getFullYear() === currentYear;
        })
        .reduce((sum, investment) => sum + investment.amount, 0);
}

function getCategoryCounts() {
    const counts = {};
    investments.forEach(investment => {
        const category = investment.category || 'Outros';
        counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// Initialize investments when switching to investments tab
function initializeInvestments() {
    loadInvestmentsScreen();
}