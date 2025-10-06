import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Text,
  Surface,
  Portal,
  Modal,
  TextInput
} from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { theme, spacing } from '../src/theme';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [businessMode, setBusinessMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadData();
    loadBusinessMode();
    loadDarkMode();
  }, []);

  useEffect(() => {
    // Listener para recarregar dados quando voltar para a tela
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen ganhou foco - recarregando dados');
      setTimeout(() => {
        loadData();
      }, 100); // Pequeno delay para garantir que os dados foram salvos
    });

    return unsubscribe;
  }, [navigation]);

  // Recalcular gráficos sempre que as transações mudarem
  useEffect(() => {
    if (transactions.length > 0) {
      calculateExpensesByCategory(transactions);
    } else {
      setExpensesByCategory([]);
    }
  }, [transactions]);

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

  const loadBusinessMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('businessMode');
      if (savedMode !== null) {
        setBusinessMode(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error('Erro ao carregar modo empresa:', error);
    }
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await loadBusinessMode();
    await loadDarkMode();
    setRefreshing(false);
  };

  const loadData = async () => {
    console.log('🔄 HomeScreen: Carregando dados...');
    try {
      const income = await AsyncStorage.getItem('monthlyIncome');
      const expenses = await AsyncStorage.getItem('totalExpenses');
      const transactionIncome = await AsyncStorage.getItem('totalIncome');
      const transactionsData = await AsyncStorage.getItem('transactions');
      
      console.log('📂 Dados brutos do AsyncStorage:');
      console.log('- income:', income);
      console.log('- expenses:', expenses);
      console.log('- transactionIncome:', transactionIncome);
      console.log('- transactionsData:', transactionsData ? 'EXISTS' : 'NULL');
      
      const incomeValue = income ? parseFloat(income) : 0;
      const expensesValue = expenses ? parseFloat(expenses) : 0;
      const transactionIncomeValue = transactionIncome ? parseFloat(transactionIncome) : 0;
      const transactionsArray = transactionsData ? JSON.parse(transactionsData) : [];
      
      console.log('📝 Dados processados:');
      console.log('- incomeValue:', incomeValue);
      console.log('- expensesValue:', expensesValue);
      console.log('- transactionIncomeValue:', transactionIncomeValue);
      console.log('- transactionsArray.length:', transactionsArray.length);
      
      // Saldo = Renda Mensal + Receitas das Transações - Gastos
      const totalBalance = incomeValue + transactionIncomeValue - expensesValue;
      
      console.log('💰 Cálculo do saldo:', {
        income: incomeValue,
        transactionIncome: transactionIncomeValue,
        expenses: expensesValue,
        balance: totalBalance
      });
      
      setMonthlyIncome(incomeValue);
      setTotalExpenses(expensesValue);
      setRemainingBalance(totalBalance);
      setTransactions(transactionsArray);
      
      // Forçar atualização dos gráficos
      setRefreshTrigger(prev => {
        const newTrigger = prev + 1;
        console.log('🔄 Trigger atualizado:', newTrigger);
        return newTrigger;
      });
      
      // Calcular gastos por categoria
      calculateExpensesByCategory(transactionsArray);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const calculateExpensesByCategory = (transactionsArray) => {
    console.log('🔄 Calculando gastos por categoria...');
    console.log('📊 Transações recebidas:', transactionsArray.length);
    
    const expenseTransactions = transactionsArray.filter(t => t.type === 'expense');
    console.log('💸 Transações de gasto:', expenseTransactions.length);
    
    const categoryTotals = {};
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Outros';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    
    console.log('📈 Totais por categoria:', categoryTotals);
    
    const chartColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#FF8A80', '#80CBC4', '#81C784', '#FFB74D'
    ];
    
    const chartData = Object.keys(categoryTotals).map((category, index) => {
      const legendColor = darkMode ? 'white' : 'black';
      return {
        name: category,
        population: categoryTotals[category],
        color: chartColors[index % chartColors.length],
        legendFontColor: legendColor,
        legendFontSize: 15,
        legendFontWeight: '600',
        value: categoryTotals[category], // Para usar no CategoryProgressCard
      };
    });
    
    console.log('📊 Dados finais do gráfico:', chartData);
    
    setExpensesByCategory(chartData);
    console.log('✅ Estado atualizado!');
  };

  const saveMonthlyIncome = async () => {
    try {
      const income = parseFloat(incomeInput);
      if (isNaN(income) || income < 0) {
        Alert.alert('Erro', 'Por favor, insira um valor válido');
        return;
      }
      
      await AsyncStorage.setItem('monthlyIncome', income.toString());
      setMonthlyIncome(income);
      setRemainingBalance(income - totalExpenses);
      setShowIncomeModal(false);
      setIncomeInput('');
    } catch (error) {
      console.error('Erro ao salvar renda:', error);
      Alert.alert('Erro', 'Não foi possível salvar a renda mensal');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getBalanceColor = () => {
    if (remainingBalance > 0) return theme.colors.success;
    if (remainingBalance < 0) return theme.colors.error;
    return theme.colors.text;
  };

  const getIncomeFromTransactions = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getRecentTransactionsCount = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return transactions.filter(t => new Date(t.date) >= lastWeek).length;
  };

  const getSavingsRate = () => {
    const totalIncome = monthlyIncome + getIncomeFromTransactions();
    if (totalIncome === 0) return 0;
    return ((totalIncome - totalExpenses) / totalIncome) * 100;
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : theme.colors.background }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >

        {/* Card Principal - Saldo */}
        <Surface style={[styles.balanceCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]} elevation={4}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={32} color={theme.colors.primary} />
            <Title style={[styles.balanceTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Saldo Disponível</Title>
          </View>
          <Text style={[styles.balanceAmount, { color: getBalanceColor() }]}>
            {formatCurrency(remainingBalance)}
          </Text>
          <Paragraph style={[styles.balanceDescription, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
            {remainingBalance >= 0 
              ? 'Você tem recursos disponíveis' 
              : 'Atenção: Saldo negativo'}
          </Paragraph>
        </Surface>
        {/* Cards de Resumo */}
        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Ionicons name="arrow-down" size={24} color={theme.colors.success} />
                <Title style={[styles.summaryTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Renda Mensal</Title>
              </View>
              <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
                {formatCurrency(monthlyIncome)}
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowIncomeModal(true)}
                style={styles.editButton}
                compact
              >
                Editar
              </Button>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Ionicons name="arrow-up" size={24} color={theme.colors.error} />
                <Title style={[styles.summaryTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Gastos Totais</Title>
              </View>
              <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
                {formatCurrency(totalExpenses)}
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Transactions')}
                style={styles.editButton}
                compact
              >
                Ver Detalhes
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Gráfico de Gastos por Categoria */}
        {expensesByCategory.length > 0 ? (
          <Card style={[styles.chartCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <Ionicons name="pie-chart" size={24} color={theme.colors.primary} />
                <Title style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Gastos por Categoria</Title>
              </View>
              
              {/* Gráfico Visual Simples */}
              <View style={styles.simpleChart}>
                <Text style={[styles.chartSubtitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Distribuição de Gastos:</Text>
                {expensesByCategory.map((category, index) => {
                  const percentage = ((category.population / expensesByCategory.reduce((sum, cat) => sum + cat.population, 0)) * 100).toFixed(1);
                  return (
                    <View key={index} style={styles.categoryRow}>
                      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                      <Text style={[styles.categoryName, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>{category.name}</Text>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryPercentage}>{percentage}%</Text>
                        <Text style={styles.categoryValue}>{formatCurrency(category.population)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={[styles.chartCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <Ionicons name="pie-chart" size={24} color={theme.colors.primary} />
                <Title style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Gastos por Categoria</Title>
              </View>
              <Text style={[styles.noDataText, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Nenhum gasto encontrado. Adicione algumas transações para ver o gráfico.</Text>
            </Card.Content>
          </Card>
        )}

      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          navigation.navigate('Transactions');
        }}
      />

      {/* Modal para editar renda mensal */}
      <Portal>
        <Modal
          visible={showIncomeModal}
          onDismiss={() => setShowIncomeModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}
        >
          <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Definir Renda Mensal</Title>
          <TextInput
            label="Valor da renda mensal"
            mode="outlined"
            keyboardType="numeric"
            value={incomeInput}
            onChangeText={setIncomeInput}
            style={styles.input}
            left={<TextInput.Icon icon="currency-brl" />}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setShowIncomeModal(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={saveMonthlyIncome}
              style={styles.modalButton}
            >
              Salvar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80, // Espaço para o FAB
  },
  balanceCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceTitle: {
    marginLeft: spacing.md,
    color: theme.colors.text,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  balanceDescription: {
    textAlign: 'center',
    color: theme.colors.placeholder,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  editButton: {
    marginTop: spacing.sm,
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
  simpleChart: {
    marginBottom: spacing.lg,
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: spacing.md,
    color: theme.colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.error,
    textAlign: 'right',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  noDataText: {
    textAlign: 'center',
    color: theme.colors.placeholder,
    fontStyle: 'italic',
    padding: spacing.lg,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    elevation: 8,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: theme.roundness,
  },
  input: {
    marginVertical: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  modalButton: {
    marginLeft: spacing.md,
  },
  // Estilos para gráficos e estatísticas
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
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: theme.roundness,
  },
  input: {
    marginVertical: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  modalButton: {
    marginLeft: spacing.md,
  },
});
