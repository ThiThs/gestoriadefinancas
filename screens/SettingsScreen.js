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
  List,
  Switch,
  Divider,
  Text,
  Portal,
  Modal
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme, spacing } from '../src/theme';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [businessMode, setBusinessMode] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const currencies = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedBusinessMode = await AsyncStorage.getItem('businessMode');
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      
      if (savedBusinessMode !== null) {
        setBusinessMode(JSON.parse(savedBusinessMode));
      }
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
      if (savedCurrency !== null) {
        setSelectedCurrency(savedCurrency);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const toggleBusinessMode = async (enabled) => {
    try {
      setBusinessMode(enabled);
      await AsyncStorage.setItem('businessMode', JSON.stringify(enabled));
      
      Alert.alert(
        enabled ? 'Modo Empresa Ativado' : 'Modo Pessoal Ativado',
        enabled 
          ? 'Agora você terá acesso a categorias e funcionalidades empresariais!' 
          : 'Voltando ao modo pessoal com categorias simplificadas.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro ao salvar modo:', error);
      Alert.alert('Erro', 'Não foi possível alterar o modo');
    }
  };

  const toggleDarkMode = async (enabled) => {
    try {
      setDarkMode(enabled);
      await AsyncStorage.setItem('darkMode', JSON.stringify(enabled));
    } catch (error) {
      console.error('Erro ao salvar modo escuro:', error);
      Alert.alert('Erro', 'Não foi possível alterar o tema');
    }
  };

  const selectCurrency = async (currencyCode) => {
    try {
      setSelectedCurrency(currencyCode);
      await AsyncStorage.setItem('selectedCurrency', currencyCode);
      setShowCurrencyModal(false);
      
      const currency = currencies.find(c => c.code === currencyCode);
      Alert.alert('Moeda Alterada', `Moeda alterada para ${currency.name}`);
    } catch (error) {
      console.error('Erro ao salvar moeda:', error);
      Alert.alert('Erro', 'Não foi possível alterar a moeda');
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Esta ação irá apagar todas as suas transações e configurações. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'transactions',
                'monthlyIncome',
                'totalExpenses'
              ]);
              Alert.alert('Sucesso', 'Todos os dados foram limpos');
            } catch (error) {
              console.error('Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Não foi possível limpar os dados');
            }
          }
        }
      ]
    );
  };

  const exportData = async () => {
    try {
      const transactions = await AsyncStorage.getItem('transactions');
      const monthlyIncome = await AsyncStorage.getItem('monthlyIncome');
      const totalExpenses = await AsyncStorage.getItem('totalExpenses');
      const totalIncome = await AsyncStorage.getItem('totalIncome');
      
      const transactionsArray = transactions ? JSON.parse(transactions) : [];
      
      // Gerar CSV
      let csvContent = businessMode 
        ? "Data,Descrição,Valor,Categoria,Tipo,Fornecedor,Centro de Custo,Projeto,Nota Fiscal\n"
        : "Data,Descrição,Valor,Categoria,Tipo\n";
      
      transactionsArray.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        const amount = transaction.amount.toFixed(2).replace('.', ',');
        const type = transaction.type === 'expense' ? 'Gasto' : 'Receita';
        
        if (businessMode) {
          csvContent += `"${date}","${transaction.description}","R$ ${amount}","${transaction.category}","${type}","${transaction.supplier || ''}","${transaction.costCenter || ''}","${transaction.project || ''}","${transaction.invoiceNumber || ''}"\n`;
        } else {
          csvContent += `"${date}","${transaction.description}","R$ ${amount}","${transaction.category}","${type}"\n`;
        }
      });
      
      // Criar blob e download (funciona no web)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financeiro_${businessMode ? 'empresa' : 'pessoal'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Alert.alert(
        'Exportação Realizada',
        'Arquivo CSV baixado com sucesso!\nPerfeito para enviar ao contador.'
      );
      
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#121212' : theme.colors.background }]}>
      <View style={styles.content}>
        {/* Informações do App */}
        <Card style={[styles.card, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.appInfo}>
              <Ionicons name="wallet" size={48} color={theme.colors.primary} />
              <View style={styles.appDetails}>
                <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Payment Management</Title>
                <Paragraph style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Versão 1.0.0</Paragraph>
                <Paragraph style={[styles.description, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
                  Gestão inteligente de recibos e pagamentos
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Configurações Gerais */}
        <Card style={[styles.card, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Configurações</Title>
          </Card.Content>
          
          <List.Item
            title="Notificações"
            description="Receba lembretes sobre seus gastos"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Modo Escuro"
            description="Alterar tema da interface"
            left={props => <List.Icon {...props} icon="moon-waning-crescent" />}
            right={() => (
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
            />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Modo Empresa"
            description={businessMode 
              ? "Categorias e funcionalidades empresariais ativas" 
              : "Ativar funcionalidades para empresas e negócios"}
            left={props => <List.Icon {...props} icon="office-building" />}
            right={() => (
              <Switch
                value={businessMode}
                onValueChange={toggleBusinessMode}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Moeda"
            description={`${currencies.find(c => c.code === selectedCurrency)?.name} (${currencies.find(c => c.code === selectedCurrency)?.symbol})`}
            left={props => <List.Icon {...props} icon="cash" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowCurrencyModal(true)}
          />
        </Card>

        {/* Dados */}
        <Card style={[styles.card, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Dados</Title>
          </Card.Content>
          
          <List.Item
            title="Exportar Dados"
            description={businessMode 
              ? "Gerar planilha CSV para contador/auditoria"
              : "Fazer backup das suas informações"}
            left={props => <List.Icon {...props} icon="download" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={exportData}
          />
          
          <Divider />
          
          <List.Item
            title="Importar Dados"
            description="Restaurar backup anterior"
            left={props => <List.Icon {...props} icon="upload" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')}
          />
          
          <Divider />
          
          <List.Item
            title="Limpar Todos os Dados"
            description="Apagar todas as transações"
            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={clearAllData}
            titleStyle={{ color: theme.colors.error }}
          />
        </Card>

        {/* Suporte */}
        <Card style={[styles.card, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Suporte</Title>
          </Card.Content>
          
          <List.Item
            title="Central de Ajuda"
            description="Perguntas frequentes e tutoriais"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')}
          />
          
          <Divider />
          
          <List.Item
            title="Reportar Problema"
            description="Envie feedback ou relate bugs"
            left={props => <List.Icon {...props} icon="bug" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')}
          />
          
          <Divider />
          
          <List.Item
            title="Avalie o App"
            description="Deixe sua avaliação na loja"
            left={props => <List.Icon {...props} icon="star" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')}
          />
        </Card>

        {/* Sobre */}
        <Card style={[styles.card, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Sobre</Title>
            <Paragraph style={[styles.aboutText, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
              Payment Management é um aplicativo desenvolvido para facilitar o controle 
              de gastos pessoais de forma simples e intuitiva.
            </Paragraph>
            <Paragraph style={[styles.aboutText, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>
              Desenvolvido com React Native e focado na privacidade, todos os seus 
              dados são armazenados localmente no seu dispositivo.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Versão e Copyright */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>Payment Management v1.0.0</Text>
          <Text style={[styles.footerText, { color: darkMode ? '#FFFFFF' : theme.colors.text }]}>© 2025 Thiago</Text>
        </View>
      </View>
      
      {/* Modal de Seleção de Moeda */}
      <Portal>
        <Modal
          visible={showCurrencyModal}
          onDismiss={() => setShowCurrencyModal(false)}
          contentContainerStyle={[styles.currencyModal, { backgroundColor: darkMode ? '#1F1F1F' : theme.colors.surface }]}
        >
          <Title style={{ color: darkMode ? '#FFFFFF' : theme.colors.text }}>Selecionar Moeda</Title>
          {currencies.map((currency) => (
            <List.Item
              key={currency.code}
              title={currency.name}
              description={`${currency.code} - ${currency.symbol}`}
              left={props => <List.Icon {...props} icon="cash" />}
              right={() => selectedCurrency === currency.code ? <List.Icon icon="check" color={theme.colors.primary} /> : null}
              onPress={() => selectCurrency(currency.code)}
              style={selectedCurrency === currency.code ? styles.selectedCurrency : null}
            />
          ))}
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
  card: {
    marginBottom: spacing.md,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  description: {
    marginTop: spacing.xs,
    color: theme.colors.placeholder,
  },
  aboutText: {
    marginBottom: spacing.md,
    lineHeight: 20,
    color: theme.colors.placeholder,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: spacing.xs,
  },
  currencyModal: {
    backgroundColor: theme.colors.surface,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: theme.roundness,
    maxHeight: '70%',
  },
  selectedCurrency: {
    backgroundColor: theme.colors.primary + '20',
  },
});
