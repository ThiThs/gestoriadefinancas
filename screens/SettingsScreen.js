import React, { useState } from 'react';
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
  Text
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme, spacing } from '../src/theme';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
      
      const exportData = {
        transactions: transactions ? JSON.parse(transactions) : [],
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
        totalExpenses: totalExpenses ? parseFloat(totalExpenses) : 0,
        exportDate: new Date().toISOString()
      };
      
      // Em um app real, você poderia usar expo-sharing ou expo-file-system
      // para salvar o arquivo ou compartilhar
      console.log('Dados para exportação:', exportData);
      Alert.alert(
        'Exportação',
        'Funcionalidade de exportação em desenvolvimento.\nVerifique o console para ver os dados.'
      );
      
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Informações do App */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.appInfo}>
              <Ionicons name="wallet" size={48} color={theme.colors.primary} />
              <View style={styles.appDetails}>
                <Title>Payment Management</Title>
                <Paragraph>Versão 1.0.0</Paragraph>
                <Paragraph style={styles.description}>
                  Gestão inteligente de recibos e pagamentos
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Configurações Gerais */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Configurações</Title>
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
                onValueChange={setDarkMode}
                disabled={true}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Moeda"
            description="Real Brasileiro (R$)"
            left={props => <List.Icon {...props} icon="currency-brl" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em Desenvolvimento', 'Funcionalidade em breve')}
          />
        </Card>

        {/* Dados */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Dados</Title>
          </Card.Content>
          
          <List.Item
            title="Exportar Dados"
            description="Fazer backup das suas informações"
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
        <Card style={styles.card}>
          <Card.Content>
            <Title>Suporte</Title>
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
        <Card style={styles.card}>
          <Card.Content>
            <Title>Sobre</Title>
            <Paragraph style={styles.aboutText}>
              Payment Management é um aplicativo desenvolvido para facilitar o controle 
              de gastos pessoais de forma simples e intuitiva.
            </Paragraph>
            <Paragraph style={styles.aboutText}>
              Desenvolvido com React Native e focado na privacidade, todos os seus 
              dados são armazenados localmente no seu dispositivo.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Versão e Copyright */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Payment Management v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Thiago</Text>
        </View>
      </View>
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
});