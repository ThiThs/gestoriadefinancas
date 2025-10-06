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
import * as ImagePicker from 'expo-image-picker';

import { theme, spacing } from '../src/theme';

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'Outros',
    type: 'expense', // expense or income
    receiptPhoto: null,
    // Campos empresariais
    supplier: '',
    costCenter: '',
    project: '',
    invoiceNumber: ''
  });

  // Estados para controle de modo
  const [businessMode, setBusinessMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Categorias pessoais
  const personalCategories = [
    'Alimentação', 'Transporte', 'Lazer', 'Saúde', 
    'Educação', 'Casa', 'Roupas', 'Outros'
  ];

  // Categorias empresariais
  const businessCategories = [
    'Operacional', 'Marketing', 'Recursos Humanos', 'Vendas',
    'Financeiro', 'Tecnologia', 'Jurídico', 'Logística',
    'Manutenção', 'Segurança', 'Treinamento', 'Outros'
  ];

  const categories = businessMode ? businessCategories : personalCategories;

  useEffect(() => {
    loadTransactions();
    loadBusinessMode();
    loadDarkMode();
  }, []);
  
  useEffect(() => {
  // Listener para recarregar quando a tela ganhar foco
    const unsubscribe = navigation?.addListener('focus', () => {
      loadTransactions();
      loadBusinessMode();
      loadDarkMode();
    });
    
    return unsubscribe;
  }, [navigation]);

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

  const pickReceiptImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setNewTransaction({...newTransaction, receiptPhoto: result.assets[0].uri});
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takeReceiptPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de permissão para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setNewTransaction({...newTransaction, receiptPhoto: result.assets[0].uri});
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Adicionar Recibo',
      'Como deseja adicionar a foto do recibo?',
      [
        { text: 'Câmera', onPress: takeReceiptPhoto },
        { text: 'Galeria', onPress: pickReceiptImage },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
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
        receiptPhoto: newTransaction.receiptPhoto,
      };

      const updatedTransactions = [transaction, ...transactions];
      setTransactions(updatedTransactions);
      
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // Atualizar totais
      const totalExpenses = updatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalIncome = updatedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      await AsyncStorage.setItem('totalExpenses', totalExpenses.toString());
      await AsyncStorage.setItem('totalIncome', totalIncome.toString());
      
      // Timestamp para forçar atualização de outras telas
      await AsyncStorage.setItem('lastUpdateTimestamp', Date.now().toString());
      
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
      type: 'expense',
      receiptPhoto: null,
      // Campos empresariais
      supplier: '',
      costCenter: '',
      project: '',
      invoiceNumber: ''
    });
  };

  const deleteTransaction = async (id) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // Atualizar totais
      const totalExpenses = updatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalIncome = updatedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      await AsyncStorage.setItem('totalExpenses', totalExpenses.toString());
      await AsyncStorage.setItem('totalIncome', totalIncome.toString());
      
      // Timestamp para forçar atualização de outras telas
      await AsyncStorage.setItem('lastUpdateTimestamp', Date.now().toString());
      
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
    <Card style={[styles.transactionCard, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Ionicons 
              name={getCategoryIcon(item.category)} 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.transactionDetails}>
              <Title style={[styles.transactionTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>{item.description}</Title>
              <Paragraph style={[styles.transactionDate, { color: darkMode ? '#CCCCCC' : theme.colors.text }]}>
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
          </View>
        </View>
        
        {/* Botão de Excluir separado */}
        <View style={styles.transactionActions}>
          <Button
            mode="contained"
            onPress={() => {
              console.log('Clicou excluir para ID:', item.id);
              if (confirm('Deseja realmente excluir esta transação?')) {
                deleteTransaction(item.id);
              }
            }}
            compact
            buttonColor={theme.colors.error}
            style={styles.deleteButton}
          >
            🗑️ Excluir
          </Button>
        </View>
        <View style={styles.transactionFooter}>
          <Chip style={styles.categoryChip} compact>
            {item.category}
          </Chip>
          {item.receiptPhoto && (
            <Chip style={styles.receiptChip} compact icon="camera">
              Recibo
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
        <Searchbar
          placeholder="Buscar transações..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: darkMode ? '#2A2A2A' : theme.colors.surface }]}
          inputStyle={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}
          iconColor={darkMode ? '#FFFFFF' : theme.colors.text}
          placeholderTextColor={darkMode ? '#888888' : theme.colors.placeholder}
        />
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.placeholder} />
          <Title style={[styles.emptyTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Nenhuma transação encontrada</Title>
          <Paragraph style={[styles.emptyText, { color: darkMode ? '#CCCCCC' : theme.colors.text }]}>
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
          contentContainerStyle={[styles.modal, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}
        >
          <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Nova Transação</Title>
          
          <TextInput
            label="Descrição"
            mode="outlined"
            value={newTransaction.description}
            onChangeText={(text) => setNewTransaction({...newTransaction, description: text})}
            style={styles.input}
            theme={{ colors: { text: darkMode ? '#FFFFFF' : theme.colors.text, placeholder: darkMode ? '#888888' : theme.colors.placeholder, outline: darkMode ? '#666666' : theme.colors.outline } }}
          />
          
          <TextInput
            label="Valor"
            mode="outlined"
            keyboardType="numeric"
            value={newTransaction.amount}
            onChangeText={(text) => setNewTransaction({...newTransaction, amount: text})}
            style={styles.input}
            left={<TextInput.Icon icon="currency-brl" />}
            theme={{ colors: { text: darkMode ? '#FFFFFF' : theme.colors.text, placeholder: darkMode ? '#888888' : theme.colors.placeholder, outline: darkMode ? '#666666' : theme.colors.outline } }}
          />

          {/* Seção de Recibo */}
          <View style={styles.receiptContainer}>
            <Paragraph style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Recibo (Opcional):</Paragraph>
            <View style={styles.receiptActions}>
              <Button
                mode="outlined"
                onPress={showImagePickerOptions}
                style={styles.receiptButton}
                icon="camera"
              >
                {newTransaction.receiptPhoto ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
              {newTransaction.receiptPhoto && (
                <Button
                  mode="text"
                  onPress={() => setNewTransaction({...newTransaction, receiptPhoto: null})}
                  style={styles.receiptButton}
                  textColor={theme.colors.error}
                  buttonColor={darkMode ? 'transparent' : undefined}
                >
                  Remover
                </Button>
              )}
            </View>
            {newTransaction.receiptPhoto && (
              <View style={styles.receiptPreview}>
                <Text style={[styles.receiptPreviewText, { color: darkMode ? '#90CAF9' : theme.colors.primary }]}>✓ Foto do recibo adicionada</Text>
              </View>
            )}
          </View>

          <View style={styles.categoryContainer}>
            <Paragraph style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Categoria:</Paragraph>
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
            <Paragraph style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Tipo:</Paragraph>
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

          {/* Campos Empresariais */}
          {businessMode && (
            <View style={styles.businessFieldsContainer}>
              <Text style={[styles.businessFieldsTitle, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Informações Empresariais (Opcionais)</Text>
              
              <TextInput
                label="Fornecedor"
                mode="outlined"
                value={newTransaction.supplier}
                onChangeText={(text) => setNewTransaction({...newTransaction, supplier: text})}
                style={styles.input}
                placeholder="Nome do fornecedor"
                theme={{ colors: { text: darkMode ? '#FFFFFF' : theme.colors.text, placeholder: darkMode ? '#888888' : theme.colors.placeholder, outline: darkMode ? '#666666' : theme.colors.outline } }}
              />
              
              <View style={styles.businessFieldsRow}>
                <TextInput
                  label="Centro de Custo"
                  mode="outlined"
                  value={newTransaction.costCenter}
                  onChangeText={(text) => setNewTransaction({...newTransaction, costCenter: text})}
                  style={[styles.input, styles.halfInput]}
                  placeholder="Ex: ADM, VEN"
                  theme={{ colors: { text: darkMode ? '#FFFFFF' : theme.colors.text, placeholder: darkMode ? '#888888' : theme.colors.placeholder, outline: darkMode ? '#666666' : theme.colors.outline } }}
                />
                
                <TextInput
                  label="Projeto"
                  mode="outlined"
                  value={newTransaction.project}
                  onChangeText={(text) => setNewTransaction({...newTransaction, project: text})}
                  style={[styles.input, styles.halfInput]}
                  placeholder="Nome do projeto"
                  theme={{ colors: { text: darkMode ? '#FFFFFF' : theme.colors.text, placeholder: darkMode ? '#888888' : theme.colors.placeholder, outline: darkMode ? '#666666' : theme.colors.outline } }}
                />
              </View>
              
              <TextInput
                label="Número da Nota Fiscal"
                mode="outlined"
                value={newTransaction.invoiceNumber}
                onChangeText={(text) => setNewTransaction({...newTransaction, invoiceNumber: text})}
                style={styles.input}
                placeholder="Ex: 12345"
                theme={{ colors: { text: darkMode ? '#FFFFFF' : theme.colors.text, placeholder: darkMode ? '#888888' : theme.colors.placeholder, outline: darkMode ? '#666666' : theme.colors.outline } }}
              />
            </View>
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={styles.modalButton}
              textColor={darkMode ? '#FFFFFF' : theme.colors.primary}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={saveTransaction}
              style={styles.modalButton}
              buttonColor={darkMode ? '#BB86FC' : theme.colors.primary}
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
    alignItems: 'center',
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
  // Estilos para recibos
  receiptContainer: {
    marginVertical: spacing.md,
  },
  receiptActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  receiptButton: {
    marginRight: spacing.sm,
  },
  receiptPreview: {
    backgroundColor: theme.colors.success + '20',
    padding: spacing.sm,
    borderRadius: theme.roundness,
    marginTop: spacing.sm,
  },
  receiptPreviewText: {
    color: theme.colors.success,
    fontSize: 14,
    textAlign: 'center',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptChip: {
    backgroundColor: theme.colors.primary + '20',
  },
  // Estilos para campos empresariais
  businessFieldsContainer: {
    marginVertical: spacing.lg,
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  businessFieldsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: spacing.md,
  },
  businessFieldsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  transactionActions: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
  deleteButton: {
    marginTop: spacing.xs,
    borderColor: theme.colors.error + '30',
  },
});
