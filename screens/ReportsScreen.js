import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Surface,
  Chip,
  Portal,
  Modal,
  Button as PaperButton
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

import { theme, spacing } from '../src/theme';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [businessMode, setBusinessMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [trendStartMonth, setTrendStartMonth] = useState(0); // 0 = últimos 6 meses
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    loadData();
    loadDarkMode();
  }, [selectedPeriod]);

  useEffect(() => {
    // Recalcular tendência quando mudar o período do gráfico
    if (transactions.length > 0) {
      calculateMonthlyTrend(transactions);
    }
  }, [trendStartMonth, transactions]);

  // Monitorar mudanças no modo escuro
  useEffect(() => {
    const checkDarkModeChanges = setInterval(async () => {
      try {
        const currentDarkMode = await AsyncStorage.getItem('darkMode');
        const isDark = currentDarkMode ? JSON.parse(currentDarkMode) : false;
        if (isDark !== darkMode) {
          setDarkMode(isDark);
        }
      } catch (error) {
        // Ignora erro silenciosamente
      }
    }, 1000);

    return () => clearInterval(checkDarkModeChanges);
  }, [darkMode]);

  useEffect(() => {
    // Listener para recarregar quando a tela ganhar foco
    const unsubscribe = navigation?.addListener('focus', () => {
      console.log('ReportsScreen ganhou foco - recarregando dados');
      setTimeout(() => {
        loadData();
      }, 100);
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadDarkMode = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error('Erro ao carregar modo escuro:', error);
    }
  };

  const loadData = async () => {
    try {
      const transactionsData = await AsyncStorage.getItem('transactions');
      const income = await AsyncStorage.getItem('monthlyIncome');
      const savedBusinessMode = await AsyncStorage.getItem('businessMode');
      
      const transactionsArray = transactionsData ? JSON.parse(transactionsData) : [];
      const incomeValue = income ? parseFloat(income) : 0;
      const businessModeValue = savedBusinessMode ? JSON.parse(savedBusinessMode) : false;
      
      setTransactions(transactionsArray);
      setMonthlyIncome(incomeValue);
      setBusinessMode(businessModeValue);
      
      calculateChartData(transactionsArray);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const calculateChartData = (transactionsArray) => {
    // Filtrar transações do período selecionado
    const filteredTransactions = filterTransactionsByPeriod(transactionsArray);
    
    // Calcular gastos por categoria
    calculateExpensesByCategory(filteredTransactions);
    
    // Calcular tendência mensal
    calculateMonthlyTrend(transactionsArray);
  };

  const filterTransactionsByPeriod = (transactions) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (selectedPeriod === 'thisMonth') {
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      } else if (selectedPeriod === 'lastMonth') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return transactionDate.getMonth() === lastMonth && 
               transactionDate.getFullYear() === lastMonthYear;
      } else if (selectedPeriod === 'last3Months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return transactionDate >= threeMonthsAgo;
      }
      
      return true;
    });
  };

  const calculateExpensesByCategory = (transactionsArray) => {
    const expenseTransactions = transactionsArray.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Outros';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    
    const chartColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#FF8A80', '#80CBC4', '#81C784', '#FFB74D'
    ];
    
    const chartData = Object.keys(categoryTotals).map((category, index) => {
      // Forçar branco no modo escuro
      const legendColor = darkMode ? 'white' : 'black';
      console.log(`🎨 Cor da legenda para ${category}:`, legendColor, 'DarkMode:', darkMode);
      return {
        name: category,
        population: categoryTotals[category],
        color: chartColors[index % chartColors.length],
        legendFontColor: legendColor, // Forçando string simples
        legendFontSize: 15,
        legendFontWeight: '600'
      };
    });
    
    setExpensesByCategory(chartData);
  };

  const calculateMonthlyTrend = (transactionsArray) => {
    const monthlyData = {};
    const now = new Date();
    
    // Inicializar 6 meses a partir do mês de início selecionado
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i + trendStartMonth);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }) + '/' + date.getFullYear().toString().slice(-2);
      monthlyData[monthKey] = {
        name: monthName,
        expenses: 0,
        income: 0,
        transactions: 0,
        fullDate: new Date(date)
      };
    }
    
    // Calcular totais por mês
    transactionsArray.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === 'expense') {
          monthlyData[monthKey].expenses += transaction.amount;
        } else {
          monthlyData[monthKey].income += transaction.amount;
        }
        monthlyData[monthKey].transactions++;
      }
    });
    
    const trendData = Object.values(monthlyData).sort((a, b) => a.fullDate - b.fullDate);
    setMonthlyTrend(trendData);
  };

  const navigateTrendMonths = (direction) => {
    if (direction === 'prev') {
      // Ir para o passado (valores mais negativos)
      const newStartMonth = trendStartMonth - 6;
      if (newStartMonth >= -24) {
        setTrendStartMonth(newStartMonth);
      }
    } else if (direction === 'next') {
      // Ir para o futuro (valores menos negativos)
      const newStartMonth = trendStartMonth + 6;
      if (newStartMonth <= 0) {
        setTrendStartMonth(newStartMonth);
      }
    }
  };

  const getTrendPeriodLabel = () => {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 5 + trendStartMonth);
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + trendStartMonth);
    
    const startLabel = startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    const endLabel = endDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    
    return `${startLabel} - ${endLabel}`;
  };

  const getAdvancedAnalysis = () => {
    const analysis = [];
    const totalExpenses = getTotalExpenses();
    const avgMonthlyExpense = monthlyTrend.reduce((sum, month) => sum + month.expenses, 0) / monthlyTrend.length;
    const currentMonthExpense = monthlyTrend[monthlyTrend.length - 1]?.expenses || 0;
    
    // Análise de gastos vs renda
    if (totalExpenses > monthlyIncome * 0.9 && monthlyIncome > 0) {
      analysis.push({
        type: 'alert',
        icon: 'alert-circle',
        color: theme.colors.error,
        title: businessMode ? 'Fluxo de Caixa Crítico' : 'Orçamento Ultrapassado',
        message: businessMode 
          ? `Gastos representam ${((totalExpenses / monthlyIncome) * 100).toFixed(1)}% da receita. Risco de fluxo de caixa negativo.`
          : `Você gastou ${((totalExpenses / monthlyIncome) * 100).toFixed(1)}% da sua renda. Orçamento comprometido.`,
        action: businessMode 
          ? 'Revisar custos operacionais urgentemente'
          : 'Listar todos os gastos e identificar quais podem ser eliminados ou reduzidos este mês'
      });
    } else if (totalExpenses > monthlyIncome * 0.7 && monthlyIncome > 0) {
      analysis.push({
        type: 'warning',
        icon: 'warning',
        color: theme.colors.warning,
        title: businessMode ? 'Margem Apertada' : 'Atenção ao Orçamento',
        message: businessMode
          ? `Gastos estão em ${((totalExpenses / monthlyIncome) * 100).toFixed(1)}% da receita. Margem de segurança baixa.`
          : `${((totalExpenses / monthlyIncome) * 100).toFixed(1)}% da renda comprometida. Monitore de perto.`,
        action: businessMode
          ? 'Identificar oportunidades de economia'
          : 'Revisar gastos da categoria que mais consome e definir limites mensais'
      });
    }
    
    // Análise de tendência
    if (currentMonthExpense > avgMonthlyExpense * 1.3) {
      analysis.push({
        type: 'warning',
        icon: 'trending-up',
        color: theme.colors.warning,
        title: 'Gastos em Alta',
        message: businessMode
          ? `Gastos do período ${((currentMonthExpense / avgMonthlyExpense - 1) * 100).toFixed(1)}% acima da média.`
          : `Seus gastos aumentaram ${((currentMonthExpense / avgMonthlyExpense - 1) * 100).toFixed(1)}% comparado à média.`,
        action: businessMode
          ? 'Investigar causas do aumento'
          : 'Comparar gastos deste mês com o anterior e identificar compras extras ou emergenciais'
      });
    } else if (currentMonthExpense < avgMonthlyExpense * 0.7) {
      analysis.push({
        type: 'tip',
        icon: 'trending-down',
        color: theme.colors.success,
        title: 'Controle Eficiente',
        message: businessMode
          ? `Excelente! Custos ${((1 - currentMonthExpense / avgMonthlyExpense) * 100).toFixed(1)}% abaixo da média.`
          : `Parabéns! Você economizou ${((1 - currentMonthExpense / avgMonthlyExpense) * 100).toFixed(1)}% comparado à média.`,
        action: businessMode
          ? 'Manter essa disciplina'
          : 'Aproveite para aumentar sua reserva de emergência ou investir a diferença'
      });
    }
    
    // Análise de diversificação
    if (getMostExpensiveCategory() && getMostExpensiveCategory().population > totalExpenses * 0.6) {
      analysis.push({
        type: 'warning',
        icon: 'pie-chart',
        color: theme.colors.warning,
        title: 'Concentração de Gastos',
        message: businessMode
          ? `${getMostExpensiveCategory().name} representa ${((getMostExpensiveCategory().population / totalExpenses) * 100).toFixed(1)}% dos custos.`
          : `${getMostExpensiveCategory().name} consome ${((getMostExpensiveCategory().population / totalExpenses) * 100).toFixed(1)}% do orçamento.`,
        action: businessMode
          ? 'Diversificar estrutura de gastos'
          : `Analisar detalhadamente os gastos de ${getMostExpensiveCategory().name} e buscar alternativas mais econômicas`
      });
    }
    
    // Análises adicionais para usuários pessoais
    if (!businessMode) {
      // Análise de saúde financeira
      if (monthlyIncome > 0) {
        const savingsRate = ((monthlyIncome - totalExpenses) / monthlyIncome) * 100;
        
        if (savingsRate < 10) {
          analysis.push({
            type: 'warning',
            icon: 'wallet',
            color: theme.colors.warning,
            title: 'Taxa de Poupança Baixa',
            message: `Você está poupando apenas ${savingsRate.toFixed(1)}% da renda. Ideal seria pelo menos 20%.`,
            action: 'Estabelecer meta de economia de 10-20% da renda mensal e automatizar transfersências'
          });
        } else if (savingsRate > 30) {
          analysis.push({
            type: 'tip',
            icon: 'trending-up',
            color: theme.colors.success,
            title: 'Excelente Poupador',
            message: `Parabéns! Você está poupando ${savingsRate.toFixed(1)}% da renda.`,
            action: 'Considere diversificar investimentos: 70% renda fixa, 30% renda variável'
          });
        }
      }
      
      // Análise por categoria comum
      const foodCategory = expensesByCategory.find(cat => 
        cat.name.toLowerCase().includes('alimentação') || 
        cat.name.toLowerCase().includes('comida') ||
        cat.name.toLowerCase().includes('restaurante')
      );
      
      if (foodCategory && foodCategory.population > totalExpenses * 0.3) {
        analysis.push({
          type: 'tip',
          icon: 'restaurant',
          color: theme.colors.primary,
          title: 'Gastos com Alimentação',
          message: `Alimentação representa ${((foodCategory.population / totalExpenses) * 100).toFixed(1)}% dos gastos.`,
          action: 'Planejar refeições, cozinhar mais em casa e evitar delivery nos dias de semana'
        });
      }
      
      // Análise de emergência
      if (totalExpenses > monthlyIncome && monthlyIncome > 0) {
        analysis.push({
          type: 'alert',
          icon: 'alert-triangle',
          color: theme.colors.error,
          title: 'Situação de Emergência',
          message: 'Gastos maiores que a renda. Risco de endividamento.',
          action: 'URGENTE: Cortar gastos supérfluos, negociar dívidas e buscar renda extra'
        });
      }
      
      // Análise de diversidade de categorias
      if (expensesByCategory.length <= 2 && totalExpenses > 0) {
        analysis.push({
          type: 'tip',
          icon: 'apps',
          color: theme.colors.primary,
          title: 'Organize Melhor os Gastos',
          message: 'Você usa poucas categorias. Isso dificulta análises detalhadas.',
          action: 'Crie categorias como: Alimentação, Transporte, Saúde, Lazer, Casa para melhor controle'
        });
      }
      
      // Análise de frequência de transações
      const transactionsThisMonth = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const now = new Date();
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      });
      
      if (transactionsThisMonth.length > 0) {
        const dailyAverage = transactionsThisMonth.length / new Date().getDate();
        
        if (dailyAverage > 5) {
          analysis.push({
            type: 'tip',
            icon: 'time',
            color: theme.colors.primary,
            title: 'Muitas Transações Diárias',
            message: `Você faz em média ${dailyAverage.toFixed(1)} compras por dia.`,
            action: 'Considere agrupar compras: 1x supermercado/semana, 1x farmácia/quinzena para economizar tempo e dinheiro'
          });
        }
      }
    }
    
    return analysis;
  };

  const getTrendInsights = () => {
    const insights = [];
    
    if (monthlyTrend.length >= 3) {
      const recentMonths = monthlyTrend.slice(-3);
      const isIncreasing = recentMonths.every((month, index) => 
        index === 0 || month.expenses > recentMonths[index - 1].expenses
      );
      const isDecreasing = recentMonths.every((month, index) => 
        index === 0 || month.expenses < recentMonths[index - 1].expenses
      );
      
      if (isIncreasing) {
        insights.push(businessMode
          ? 'Tendência crescente nos últimos 3 meses. Avaliar se é investimento estratégico ou crescimento não controlado.'
          : 'Gastos aumentando consistentemente nos últimos 3 meses. Hora de revisar o orçamento.'
        );
      } else if (isDecreasing) {
        insights.push(businessMode
          ? 'Otimização de custos bem-sucedida! Redução consistente nos últimos 3 meses.'
          : 'Ótima disciplina! Redução consistente de gastos nos últimos 3 meses.'
        );
      }
      
      // Análise sazonal
      const seasonalPattern = analyzeSeasonalPattern();
      if (seasonalPattern) {
        insights.push(seasonalPattern);
      }
    }
    
    return insights;
  };

  const analyzeSeasonalPattern = () => {
    const currentMonth = new Date().getMonth();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Aug', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Padrões conhecidos
    if ([11, 0].includes(currentMonth)) {
      return businessMode
        ? 'Período de fim de ano tipicamente tem gastos elevados. Planeje fluxo de caixa para janeiro.'
        : 'Dezembro e janeiro são meses de gastos elevados. Prepare-se para o começo do ano.';
    }
    
    if ([2, 3].includes(currentMonth)) {
      return businessMode
        ? 'Período pós-feriados é ideal para otimização de custos e planejamento anual.'
        : 'Início do ano é ótimo para estabelecer metas financeiras e revisar gastos.';
    }
    
    return null;
  };

  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    const totalExpenses = getTotalExpenses();
    const categories = expensesByCategory;
    
    if (businessMode) {
      recommendations.push(
        { icon: 'document-text', text: 'Configure alertas automáticos para gastos que ultrapassem 80% do orçado por categoria.' },
        { icon: 'people', text: 'Implemente um sistema de aprovação para despesas acima de R$ 500.' },
        { icon: 'analytics', text: 'Faça reuniões mensais de revisão financeira com a equipe.' },
        { icon: 'card', text: 'Considere cartões corporativos com limites por categoria para melhor controle.' },
        { icon: 'calendar', text: 'Agende revisões trimestrais do fluxo de caixa e projeções.' }
      );
      
      if (categories.length > 5) {
        recommendations.push(
          { icon: 'funnel', text: 'Simplifique categorias de gastos. Muitas categorias podem dificultar o controle.' }
        );
      }
    } else {
      recommendations.push(
        { icon: 'calendar', text: 'Defina domingo à noite como horário fixo para revisar gastos da semana e planejar a próxima.' },
        { icon: 'wallet', text: 'Aplique a regra 50/30/20: 50% necessidades básicas, 30% desejos pessoais, 20% poupança/investimentos.' },
        { icon: 'notifications', text: 'Configure 3 alarmes diários (manhã, tarde, noite) para lembrar de registrar compras.' },
        { icon: 'trending-up', text: 'Meta: economizar R$ 200 por mês cortando 1 delivery por semana e 2 cafeterias.' },
        { icon: 'card', text: 'Use cartão de débito para gastos diários e reserve o crédito apenas para emergências.' }
      );
      
      if (totalExpenses < monthlyIncome * 0.5) {
        recommendations.push(
          { icon: 'leaf', text: 'Parabéns pelo controle! Direcione 70% da sobra para reserva de emergência e 30% para investimentos.' }
        );
      }
      
      if (categories.some(cat => cat.name === 'Alimentação' && cat.population > totalExpenses * 0.4)) {
        recommendations.push(
          { icon: 'restaurant', text: 'Alimentação consome muito do orçamento. Planeje cardápio semanal e faça compras com lista.' }
        );
      }
    }
    
    return recommendations.slice(0, 4); // Limitar a 4 recomendações
  };

  const getFinancialScore = () => {
    let score = 100;
    const totalExpenses = getTotalExpenses();
    
    // Penalizar gastos excessivos
    if (monthlyIncome > 0) {
      const expenseRatio = totalExpenses / monthlyIncome;
      if (expenseRatio > 1) score -= 40;
      else if (expenseRatio > 0.8) score -= 25;
      else if (expenseRatio > 0.6) score -= 10;
      else if (expenseRatio < 0.3) score += 10; // Bonus por economia
    }
    
    // Penalizar concentração excessiva
    if (getMostExpensiveCategory() && getMostExpensiveCategory().population > totalExpenses * 0.7) {
      score -= 15;
    }
    
    // Bonus por diversificação
    if (expensesByCategory.length >= 4) score += 5;
    
    // Bonus por consistência (gastos similares mes a mes)
    if (monthlyTrend.length >= 3) {
      const variance = calculateVariance(monthlyTrend.map(m => m.expenses));
      const mean = monthlyTrend.reduce((sum, m) => sum + m.expenses, 0) / monthlyTrend.length;
      const cv = Math.sqrt(variance) / mean;
      
      if (cv < 0.2) score += 10; // Baixa variabilidade é boa
      else if (cv > 0.5) score -= 10; // Alta variabilidade é ruim
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
      color = '#f44336';
    }
    
    return { score, level, description, color };
  };

  const calculateVariance = (numbers) => {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  };

  const getDetailedActionTips = (action) => {
    const tipMap = {
      // Dicas para gastos altos
      'Listar todos os gastos e identificar quais podem ser eliminados ou reduzidos este mês': {
        title: 'Como Reduzir Gastos Urgentemente',
        tips: [
          '✓ Faça uma lista de TODOS os gastos do mês',
          '✓ Classifique em: Essencial, Importante, Desejável, Supérfluo',
          '✓ Corte 100% dos supérfluos (delivery, streaming extra, compras por impulso)',
          '✓ Reduza 50% dos desejáveis (cinema, roupas, perfumes)',
          '✓ Negocie os importantes (plano de celular, internet)',
          '✓ Meta: reduzir 20-30% dos gastos neste mês'
        ]
      },
      'Revisar gastos da categoria que mais consome e definir limites mensais': {
        title: 'Como Controlar a Maior Categoria de Gastos',
        tips: [
          '✓ Identifique qual categoria consome mais dinheiro',
          '✓ Defina um limite máximo mensal para essa categoria',
          '✓ Divida o limite por semanas (limite mensal ÷ 4)',
          '✓ Use envelope físico ou app para controlar o limite semanal',
          '✓ Quando atingir 80% do limite, pare e reavalie',
          '✓ Busque alternativas mais baratas na mesma categoria'
        ]
      },
      'Comparar gastos deste mês com o anterior e identificar compras extras ou emergenciais': {
        title: 'Como Investigar Aumento de Gastos',
        tips: [
          '✓ Abra suas transações dos últimos 2 meses',
          '✓ Compare categoria por categoria',
          '✓ Identifique: O que aumentou? Por quê?',
          '✓ Marque compras emergenciais (remédios, consertos)',
          '✓ Marque compras extras (festa, presente, viagem)',
          '✓ Se foram emergências: crie reserva para próxima vez',
          '✓ Se foram extras: planeje melhor o próximo mês'
        ]
      },
      'Aproveite para aumentar sua reserva de emergência ou investir a diferença': {
        title: 'Como Aproveitar a Economia',
        tips: [
          '✓ Calcule quanto você economizou este mês',
          '✓ Se não tem reserva: guarde 100% da economia',
          '✓ Meta da reserva: 3-6 meses de gastos essenciais',
          '✓ Se já tem reserva: invista 70% e guarde 30%',
          '✓ Opções de investimento: Tesouro Direto, CDB, Poupança',
          '✓ Configure transferência automática para não gastar'
        ]
      },
      'Analisar detalhadamente os gastos de Alimentação e buscar alternativas mais econômicas': {
        title: 'Como Economizar em Alimentação',
        tips: [
          '✓ Liste todos os gastos com comida (mercado, delivery, restaurante)',
          '✓ Identifique o maior vilão (geralmente delivery/restaurante)',
          '✓ Planeje cardápio semanal antes de comprar',
          '✓ Faça lista de compras e siga à risca',
          '✓ Cozinhe em lote no fim de semana',
          '✓ Limite delivery: máximo 1x por semana',
          '✓ Meta: reduzir 30% dos gastos com alimentação'
        ]
      },
      // Dicas empresariais
      'Revisar custos operacionais urgentemente': {
        title: 'Revisão de Custos Operacionais',
        tips: [
          '✓ Analise todos os contratos e mensalidades',
          '✓ Renegocie com fornecedores principais',
          '✓ Avalie necessidade de cada serviço contratado',
          '✓ Considere terceirizar serviços não essenciais',
          '✓ Otimize uso de recursos (energia, água, materiais)',
          '✓ Implemente controles de aprovação de gastos'
        ]
      },
      'Investigar causas do aumento': {
        title: 'Investigação de Aumento de Custos',
        tips: [
          '✓ Compare relatórios dos últimos 3 meses',
          '✓ Identifique quais departamentos aumentaram gastos',
          '✓ Verifique se houve compras de equipamentos',
          '✓ Analise se aumentou o quadro de funcionários',
          '✓ Revise contratos que podem ter tido reajuste',
          '✓ Documente todas as causas encontradas'
        ]
      }
    };
    
    return tipMap[action] || {
      title: 'Dicas Personalizadas',
      tips: [
        '✓ Analise sua situação financeira atual',
        '✓ Defina metas claras e alcançáveis',
        '✓ Monitore seu progresso semanalmente',
        '✓ Ajuste a estratégia conforme necessário'
      ]
    };
  };

  const showActionTips = (action) => {
    setSelectedAction(getDetailedActionTips(action));
    setShowActionModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTotalExpenses = () => {
    return expensesByCategory.reduce((total, category) => total + category.population, 0);
  };

  const getMostExpensiveCategory = () => {
    if (expensesByCategory.length === 0) return null;
    return expensesByCategory.reduce((max, category) => 
      category.population > max.population ? category : max
    );
  };

  const getBarChartData = () => {
    if (monthlyTrend.length === 0) return null;
    
    const expenseData = monthlyTrend.map(month => Math.max(month.expenses, 0));
    const maxValue = Math.max(...expenseData);
    
    // Se todos os valores são zero, usar um valor mínimo para evitar gráfico vazio
    const adjustedData = expenseData.map(value => {
      if (maxValue === 0) {
        return 10; // Valor mínimo visível
      }
      return Math.max(value, 0.1); // Garantir valor mínimo para visibilidade
    });
    
    console.log('📊 Dados do gráfico de barras:', {
      monthlyTrend: monthlyTrend.map(m => ({ name: m.name, expenses: m.expenses })),
      expenseData,
      adjustedData,
      labels: monthlyTrend.map(month => month.name)
    });
    
    return {
      labels: monthlyTrend.map(month => month.name),
      datasets: [
        {
          data: adjustedData,
          color: (opacity = 1) => darkMode ? `rgba(76, 175, 80, ${opacity})` : `rgba(46, 125, 50, ${opacity})`, // Verde mais claro no modo escuro
        }
      ],
    };
  };

  const getChartConfig = () => {
    const bgColor = darkMode ? '#1F1F1F' : theme.colors.surface;
    const labelColorValue = darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(33, 33, 33, 0.9)';
    const barColor = darkMode ? '#4CAF50' : '#2E7D32'; // Verde mais visível
    
    return {
      backgroundColor: bgColor,
      backgroundGradientFrom: bgColor,
      backgroundGradientTo: bgColor,
      decimalPlaces: 0,
      color: (opacity = 1) => darkMode ? `rgba(76, 175, 80, ${opacity})` : `rgba(46, 125, 50, ${opacity})`,
      labelColor: (opacity = 1) => labelColorValue,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: barColor
      },
      formatYLabel: (value) => `R$${Math.round(value)}`,
      fromZero: true,
      paddingRight: 40,
      paddingTop: 20,
      fillShadowGradient: barColor,
      fillShadowGradientOpacity: darkMode ? 0.6 : 0.4,
      barPercentage: 0.7, // Barras mais largas
      propsForBackgroundLines: {
        strokeDasharray: '', // Remove linhas tracejadas
        stroke: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        strokeWidth: 1
      }
    };
  };

  const getPieChartConfig = () => {
    const textColor = darkMode ? 'white' : 'black';
    return {
      backgroundColor: 'transparent',
      backgroundGradientFrom: 'transparent', 
      backgroundGradientTo: 'transparent',
      color: (opacity = 1) => darkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => textColor, // Forçando cor simples
      style: {
        borderRadius: 16
      },
      decimalPlaces: 0,
      // Forçar cores de texto
      propsForLabels: {
        fontSize: 15,
        fontWeight: '600',
        color: textColor
      }
    };
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#121212' : theme.colors.background }]}>
      <View style={styles.content}>
        {/* Filtros de Período */}
        <Card style={[styles.filtersCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Período</Title>
            <View style={styles.filtersContainer}>
              <Chip 
                selected={selectedPeriod === 'thisMonth'} 
                onPress={() => setSelectedPeriod('thisMonth')}
                style={styles.filterChip}
              >
                Este Mês
              </Chip>
              <Chip 
                selected={selectedPeriod === 'lastMonth'} 
                onPress={() => setSelectedPeriod('lastMonth')}
                style={styles.filterChip}
              >
                Mês Passado
              </Chip>
              <Chip 
                selected={selectedPeriod === 'last3Months'} 
                onPress={() => setSelectedPeriod('last3Months')}
                style={styles.filterChip}
              >
                Últimos 3 Meses
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Resumo Financeiro */}
        <Surface style={[styles.summaryCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]} elevation={4}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-down" size={32} color={theme.colors.error} />
              <View style={styles.summaryText}>
                <Title style={[styles.summaryTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Gastos Totais</Title>
                <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
                  {formatCurrency(getTotalExpenses())}
                </Text>
              </View>
            </View>
            
            {getMostExpensiveCategory() && (
              <View style={styles.summaryItem}>
                <Ionicons name="alert-circle" size={32} color={theme.colors.warning} />
                <View style={styles.summaryText}>
                  <Title style={[styles.summaryTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Maior Gasto</Title>
                  <Text style={[styles.summaryAmount, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                    {getMostExpensiveCategory().name}
                  </Text>
                  <Text style={[styles.summarySubtext, { color: theme.colors.warning }]}>
                    {formatCurrency(getMostExpensiveCategory().population)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Surface>

        {/* Gráfico de Gastos por Categoria */}
        {expensesByCategory.length > 0 && (
          <Card style={[styles.chartCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <Ionicons name="pie-chart" size={24} color={theme.colors.primary} />
                <Title style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Distribuição de Gastos</Title>
              </View>
              <PieChart
                key={`reports-pie-${expensesByCategory.length}-${selectedPeriod}-${darkMode}`}
                data={expensesByCategory}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  ...getPieChartConfig(),
                  color: (opacity = 1) => darkMode ? 'white' : 'black',
                  labelColor: (opacity = 1) => darkMode ? 'white' : 'black'
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
              />
            </Card.Content>
          </Card>
        )}

        {/* Tendência Mensal */}
        {monthlyTrend.length > 0 && getBarChartData() && (
          <Card style={[styles.chartCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
                <Title style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Tendência de Gastos</Title>
              </View>
              
              {/* Controles de Navegação */}
              <View style={styles.trendNavigation}>
                <View style={styles.trendNavigationButtons}>
                  <TouchableOpacity 
                    onPress={() => navigateTrendMonths('prev')}
                    disabled={trendStartMonth <= -24}
                    style={[styles.navButton, { opacity: trendStartMonth > -24 ? 1 : 0.3 }]}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={24} 
                      color={trendStartMonth > -24 ? (darkMode ? '#FFFFFF' : theme.colors.primary) : (darkMode ? '#666' : '#CCC')} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTrendStartMonth(0)} style={styles.periodButton}>
                    <Text style={[styles.periodLabel, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                      {getTrendPeriodLabel()}
                    </Text>
                    {trendStartMonth !== 0 && (
                      <Text style={[styles.currentPeriodHint, { color: darkMode ? '#90CAF9' : theme.colors.primary }]}>
                        (toque para atual)
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => navigateTrendMonths('next')}
                    disabled={trendStartMonth >= 0}
                    style={[styles.navButton, { opacity: trendStartMonth < 0 ? 1 : 0.3 }]}
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color={trendStartMonth < 0 ? (darkMode ? '#FFFFFF' : theme.colors.primary) : (darkMode ? '#666' : '#CCC')} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <BarChart
                key={`reports-bar-${monthlyTrend.length}-${selectedPeriod}-${darkMode}-${trendStartMonth}`}
                data={getBarChartData()}
                width={screenWidth - 64}
                height={280}
                chartConfig={getChartConfig()}
                verticalLabelRotation={0}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                showValuesOnTopOfBars={true}
              />
            </Card.Content>
          </Card>
        )}

        {/* Análise Inteligente Avançada */}
        <Card style={[styles.analysisCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Ionicons name="analytics" size={24} color={theme.colors.primary} />
              <Title style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>{businessMode ? 'Análise Empresarial Avançada' : 'Análise Inteligente'}</Title>
            </View>
            
            {/* Análises críticas */}
            {getAdvancedAnalysis().map((analysis, index) => (
              <View key={index} style={[styles.analysisItem, analysis.type === 'alert' ? styles.alert : analysis.type === 'warning' ? styles.warning : styles.tip]}>
                <Ionicons name={analysis.icon} size={20} color={analysis.color} />
                <View style={styles.analysisContent}>
                  <Text style={[styles.analysisTitle, { color: analysis.color }]}>{analysis.title}</Text>
                  <Paragraph style={[styles.analysisText, { color: darkMode ? '#CCCCCC' : theme.colors.text }]}>{analysis.message}</Paragraph>
                  {analysis.action && (
                    <TouchableOpacity 
                      onPress={() => showActionTips(analysis.action)}
                      style={[styles.actionButton, { borderColor: analysis.color }]}
                    >
                      <Ionicons name="help-circle-outline" size={16} color={analysis.color} />
                      <Text style={[styles.actionButtonText, { color: analysis.color }]}>{analysis.action}</Text>
                      <Ionicons name="chevron-forward" size={16} color={analysis.color} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            
            {/* Insights de tendência */}
            {getTrendInsights().length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={[styles.sectionTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                  📈 Insights de Tendência
                </Text>
                {getTrendInsights().map((insight, index) => (
                  <View key={index} style={styles.insight}>
                    <Text style={[styles.insightText, { color: darkMode ? '#E0E0E0' : theme.colors.text }]}>
                      {insight}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Recomendações personalizadas */}
            <View style={styles.recommendationsSection}>
              <Text style={[styles.sectionTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                🎥 Recomendações Personalizadas
              </Text>
              {getPersonalizedRecommendations().map((rec, index) => (
                <View key={index} style={styles.recommendation}>
                  <Ionicons name={rec.icon} size={16} color={theme.colors.primary} />
                  <Text style={[styles.recommendationText, { color: darkMode ? '#E0E0E0' : theme.colors.text }]}>
                    {rec.text}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Score financeiro */}
            <View style={styles.scoreSection}>
              <Text style={[styles.sectionTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                🎆 Score Financeiro
              </Text>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreCircle}>
                  <Text style={[styles.scoreNumber, { color: getFinancialScore().color }]}>
                    {getFinancialScore().score}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: darkMode ? '#CCCCCC' : theme.colors.text }]}>/ 100</Text>
                </View>
                <View style={styles.scoreDetails}>
                  <Text style={[styles.scoreName, { color: getFinancialScore().color }]}>
                    {getFinancialScore().level}
                  </Text>
                  <Text style={[styles.scoreDescription, { color: darkMode ? '#E0E0E0' : theme.colors.text }]}>
                    {getFinancialScore().description}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
      
      {/* Modal de Dicas Detalhadas */}
      <Portal>
        <Modal
          visible={showActionModal}
          onDismiss={() => setShowActionModal(false)}
          contentContainerStyle={[styles.actionModal, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}
        >
          {selectedAction && (
            <>
              <View style={styles.modalHeader}>
                <Ionicons name="lightbulb" size={24} color={theme.colors.primary} />
                <Title style={[styles.modalTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                  {selectedAction.title}
                </Title>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {selectedAction.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={[styles.tipText, { color: darkMode ? '#E0E0E0' : theme.colors.text }]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <PaperButton
                  mode="contained"
                  onPress={() => setShowActionModal(false)}
                  style={styles.closeButton}
                >
                  Entendi!
                </PaperButton>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: spacing.md,
  },
  filtersCard: {
    marginBottom: spacing.lg,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  filterChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  summaryContent: {
    gap: spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summarySubtext: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    marginLeft: spacing.md,
    fontSize: 18,
  },
  analysisCard: {
    marginBottom: spacing.lg,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  alertText: {
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '500',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipText: {
    marginLeft: spacing.sm,
    flex: 1,
    color: theme.colors.placeholder,
  },
  trendNavigation: {
    marginBottom: spacing.md,
  },
  trendNavigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  currentPeriodHint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: spacing.md,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  analysisContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  warning: {
    borderLeftColor: '#FF9800',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  insightsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  insight: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: spacing.sm,
    borderRadius: theme.roundness,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  recommendationText: {
    marginLeft: spacing.sm,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  scoreSection: {
    marginTop: spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: spacing.lg,
    borderRadius: theme.roundness,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: -4,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  scoreDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: theme.roundness,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
    fontSize: 13,
    fontWeight: '500',
  },
  actionModal: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: theme.roundness,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    marginLeft: spacing.sm,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: 400,
  },
  tipItem: {
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalActions: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  closeButton: {
    minWidth: 120,
  },
});
