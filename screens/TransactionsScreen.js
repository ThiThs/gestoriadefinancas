import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Text,
  Chip,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  List
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme, spacing } from '../src/theme';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'Outros',
    type: 'expense' // expense or income
  });

  const categories = [
    'Alimentação', 'Transporte', 'Lazer', 'Saúde', 
    'Educação', 'Casa', 'Roupas', 'Outros'
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery]);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem('transactions');
      if (stored) {
        const parsedTransactions = JSON.parse(stored);
        setTransactions(parsedTransactions);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const filterTransactions = () => {
    if (!searchQuery) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  };

  const saveTransaction = async () => {
    try {
      const amount = parseFloat(newTransaction.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Erro', 'Por favor, insira um valor válido');
        return;
      }
      
      if (!newTransaction.description.trim()) {
        Alert.alert('Erro', 'Por favor, insira uma descrição');
        return;
      }

      const transaction = {
        id: Date.now().toString(),
        description: newTransaction.description.trim(),
        amount: amount,
        category: newTransaction.category,
        type: newTransaction.type,
        date: new Date().toISOString(),
      };

      const updatedTransactions = [transaction, ...transactions];
      setTransactions(updatedTransactions);
      
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // Atualizar total de gastos
      const totalExpenses = updatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      await AsyncStorage.setItem('totalExpenses', totalExpenses.toString());
      
      setShowAddModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a transação');
    }
  };

  const resetForm = () => {
    setNewTransaction({
      description: '',
      amount: '',
      category: 'Outros',
      type: 'expense'
    });
  };

  const deleteTransaction = async (id) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // Atualizar total de gastos
      const totalExpenses = updatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      await AsyncStorage.setItem('totalExpenses', totalExpenses.toString());
      
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      Alert.alert('Erro', 'Não foi possível deletar a transação');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Alimentação': 'restaurant',
      'Transporte': 'car',
      'Lazer': 'game-controller',
      'Saúde': 'medical',
      'Educação': 'school',
      'Casa': 'home',
      'Roupas': 'shirt',
      'Outros': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const renderTransaction = ({ item }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Ionicons 
              name={getCategoryIcon(item.category)} 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.transactionDetails}>
              <Title style={styles.transactionTitle}>{item.description}</Title>
              <Paragraph style={styles.transactionDate}>
                {formatDate(item.date)}
              </Paragraph>
            </View>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText, 
              { color: item.type === 'expense' ? theme.colors.error : theme.colors.success }
            ]}>
              {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
            <Button
              mode="text"
              onPress={() => {
                Alert.alert(
                  'Excluir Transação',
                  'Deseja realmente excluir esta transação?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Excluir', 
                      style: 'destructive',
                      onPress: () => deleteTransaction(item.id)
                    }
                  ]
                );
              }}
              compact
            >
              Excluir
            </Button>
          </View>
        </View>
        <Chip style={styles.categoryChip} compact>
          {item.category}
        </Chip>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar transações..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.placeholder} />
          <Title style={styles.emptyTitle}>Nenhuma transação encontrada</Title>
          <Paragraph style={styles.emptyText}>
            {searchQuery ? 'Tente buscar com outros termos' : 'Adicione sua primeira transação'}
          </Paragraph>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
      />

      {/* Modal para adicionar transação */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Nova Transação</Title>
          
          <TextInput
            label="Descrição"
            mode="outlined"
            value={newTransaction.description}
            onChangeText={(text) => setNewTransaction({...newTransaction, description: text})}
            style={styles.input}
          />
          
          <TextInput
            label="Valor"
            mode="outlined"
            keyboardType="numeric"
            value={newTransaction.amount}
            onChangeText={(text) => setNewTransaction({...newTransaction, amount: text})}
            style={styles.input}
            left={<TextInput.Icon icon="currency-brl" />}
          />

          <View style={styles.categoryContainer}>
            <Paragraph>Categoria:</Paragraph>
            <View style={styles.categoryChips}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={newTransaction.category === category}
                  onPress={() => setNewTransaction({...newTransaction, category})}
                  style={styles.categoryChip}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.typeContainer}>
            <Paragraph>Tipo:</Paragraph>
            <View style={styles.typeButtons}>
              <Button
                mode={newTransaction.type === 'expense' ? 'contained' : 'outlined'}
                onPress={() => setNewTransaction({...newTransaction, type: 'expense'})}
                style={styles.typeButton}
                buttonColor={newTransaction.type === 'expense' ? theme.colors.error : undefined}
              >
                Gasto
              </Button>
              <Button
                mode={newTransaction.type === 'income' ? 'contained' : 'outlined'}
                onPress={() => setNewTransaction({...newTransaction, type: 'income'})}
                style={styles.typeButton}
                buttonColor={newTransaction.type === 'income' ? theme.colors.success : undefined}
              >
                Entrada
              </Button>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={saveTransaction}
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
  searchContainer: {
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  transactionCard: {
    marginBottom: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spacing.sm,
    textAlign: 'center',
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
    margin: spacing.md,
    borderRadius: theme.roundness,
    maxHeight: '90%',
  },
  input: {
    marginVertical: spacing.sm,
  },
  categoryContainer: {
    marginVertical: spacing.md,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  typeContainer: {
    marginVertical: spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  modalButton: {
    marginLeft: spacing.md,
  },
});