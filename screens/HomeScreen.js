import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  Alert
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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme, spacing } from '../src/theme';

export default function HomeScreen({ navigation }) {
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const income = await AsyncStorage.getItem('monthlyIncome');
      const expenses = await AsyncStorage.getItem('totalExpenses');
      
      const incomeValue = income ? parseFloat(income) : 0;
      const expensesValue = expenses ? parseFloat(expenses) : 0;
      
      setMonthlyIncome(incomeValue);
      setTotalExpenses(expensesValue);
      setRemainingBalance(incomeValue - expensesValue);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card Principal - Saldo */}
        <Surface style={styles.balanceCard} elevation={4}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={32} color={theme.colors.primary} />
            <Title style={styles.balanceTitle}>Saldo Disponível</Title>
          </View>
          <Text style={[styles.balanceAmount, { color: getBalanceColor() }]}>
            {formatCurrency(remainingBalance)}
          </Text>
          <Paragraph style={styles.balanceDescription}>
            {remainingBalance >= 0 
              ? 'Você tem recursos disponíveis' 
              : 'Atenção: Saldo negativo'}
          </Paragraph>
        </Surface>

        {/* Cards de Resumo */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Ionicons name="arrow-down" size={24} color={theme.colors.success} />
                <Title style={styles.summaryTitle}>Renda Mensal</Title>
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

          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Ionicons name="arrow-up" size={24} color={theme.colors.error} />
                <Title style={styles.summaryTitle}>Gastos Totais</Title>
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

        {/* Dicas ou Ações Rápidas */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Title>Dicas Financeiras</Title>
            <Paragraph style={styles.tipText}>
              • Mantenha suas despesas organizadas
            </Paragraph>
            <Paragraph style={styles.tipText}>
              • Revise seus gastos mensalmente
            </Paragraph>
            <Paragraph style={styles.tipText}>
              • Defina metas de economia
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          // Aqui você pode navegar para tela de adicionar transação
          Alert.alert(
            'Nova Transação',
            'Funcionalidade em desenvolvimento',
            [{ text: 'OK' }]
          );
        }}
      />

      {/* Modal para editar renda mensal */}
      <Portal>
        <Modal
          visible={showIncomeModal}
          onDismiss={() => setShowIncomeModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Definir Renda Mensal</Title>
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
  tipsCard: {
    marginBottom: spacing.lg,
  },
  tipText: {
    marginBottom: spacing.xs,
    color: theme.colors.placeholder,
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