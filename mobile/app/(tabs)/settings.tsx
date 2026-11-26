import * as Clipboard from 'expo-clipboard';
import {
  Check,
  Copy,
  Mail,
  ShieldCheck,
  Trash2,
  Coins,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { deleteUserAccount } from '@/services/api';
import {
  clearOAuthTokens,
  clearProviderToken,
  connectGmail,
  connectOutlook,
} from '@/services/oauth';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { illustrations, platformPlaceholders } from '@/theme/asset-map';
import { tokens } from '@/theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateBudget = useAuthStore((s) => s.updateBudget);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const connectedAccounts = useAppStore((s) => s.connectedAccounts);
  const connectAccount = useAppStore((s) => s.connectAccount);
  const disconnectAccount = useAppStore((s) => s.disconnectAccount);
  const deleteAllLocalData = useAppStore((s) => s.deleteAllLocalData);
  const privacyAccepted = useAppStore((s) => s.privacyAccepted);
  const setPrivacyAccepted = useAppStore((s) => s.setPrivacyAccepted);

  const [budgetText, setBudgetText] = useState(
    String(user?.monthlyBudgetLimit ?? 15000),
  );
  const [budgetEnabled, setBudgetEnabled] = useState(user?.budgetEnabled ?? true);
  const [copied, setCopied] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<'gmail' | 'outlook' | null>(null);

  const gmail = connectedAccounts.find((a) => a.provider === 'gmail');
  const outlook = connectedAccounts.find((a) => a.provider === 'outlook');
  const inboundAlias = user?.inboundAlias ?? 'alisveris+demo@harcamam.app';

  const handleCopyAlias = async () => {
    await Clipboard.setStringAsync(inboundAlias);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleBudgetToggle = (value: boolean) => {
    setBudgetEnabled(value);
    const parsed = Number(budgetText.replace(/\./g, '').replace(',', '.')) || 0;
    updateBudget(parsed, value);
  };

  const handleBudgetBlur = () => {
    const parsed = Number(budgetText.replace(/\./g, '').replace(',', '.')) || 0;
    setBudgetText(String(parsed));
    updateBudget(parsed, budgetEnabled);
  };

  const handleConnectPress = (provider: 'gmail' | 'outlook') => {
    if (!privacyAccepted) {
      setPendingProvider(provider);
      setPrivacyModalVisible(true);
      return;
    }
    void runConnect(provider);
  };

  const runConnect = async (provider: 'gmail' | 'outlook') => {
    const result = provider === 'gmail' ? await connectGmail() : await connectOutlook();
    if (result?.email) {
      connectAccount(provider, result.email);
    }
  };

  const handleAcceptPrivacy = async () => {
    setPrivacyAccepted(true);
    setPrivacyModalVisible(false);
    if (pendingProvider) {
      await runConnect(pendingProvider);
      setPendingProvider(null);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı ve Verileri Sil',
      'Bu işlem geri alınamaz. Tüm sipariş, OAuth ve hesap verileriniz silinecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isDemoMode) {
                await deleteUserAccount().catch(() => undefined);
              }
              await clearOAuthTokens();
              deleteAllLocalData();
              await logout();
              router.replace('/(auth)/login');
            } catch {
              Alert.alert('Hata', 'Hesap silinemedi. Lütfen tekrar deneyin.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ayarlar</Text>

        <Card style={styles.sourceHero} padded={false}>
          <LinearSourceHeader />
          <View style={styles.sourceList}>
            <AccountRow
              logo={platformPlaceholders.gmail}
              title="Gmail Bağla"
              connected={Boolean(gmail?.isActive && gmail.email)}
              email={gmail?.email}
              onPress={() => {
                if (gmail?.isActive) {
                  disconnectAccount('gmail');
                  void clearProviderToken('gmail');
                  return;
                }
                handleConnectPress('gmail');
              }}
            />
            <View style={styles.divider} />
            <AccountRow
              logo={platformPlaceholders.outlook}
              title="Outlook Bağla"
              connected={Boolean(outlook?.isActive && outlook.email)}
              email={outlook?.email}
              onPress={() => {
                if (outlook?.isActive) {
                  disconnectAccount('outlook');
                  void clearProviderToken('outlook');
                  return;
                }
                handleConnectPress('outlook');
              }}
            />
          </View>
        </Card>

        <Card>
          <View style={styles.rowIcon}>
            <View style={styles.iconBox}>
              <Mail size={20} color={tokens.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Özel E-posta Adresim</Text>
              <Text style={styles.cardDesc}>
                Alışveriş faturalarınızı bu adrese yönlendirerek harcamalarınızı otomatik takip
                edebilirsiniz.
              </Text>
            </View>
          </View>
          <View style={styles.aliasBox}>
            <Text style={styles.alias} numberOfLines={1}>
              {inboundAlias}
            </Text>
            <Pressable
              onPress={handleCopyAlias}
              accessibilityRole="button"
              accessibilityLabel="E-posta adresini kopyala"
              style={styles.copyBtn}
            >
              {copied ? (
                <Check size={18} color={tokens.colors.savings} />
              ) : (
                <Copy size={18} color="#fff" />
              )}
            </Pressable>
          </View>
          <Text style={styles.filterHint}>
            Gmail/Outlook filtresi örneği:{'\n'}
            from:(trendyol.com OR yemeksepeti.com OR getir.com OR amazon.com.tr OR
            hepsiburada.com)
          </Text>
        </Card>

        <Card>
          <View style={styles.rowIcon}>
            <View style={styles.iconBox}>
              <Coins size={20} color={tokens.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Aylık Bütçe Limiti</Text>
              <Text style={styles.cardDesc}>
                Aylık alışveriş bütçenizi belirleyin, harcamalarınız yaklaştığında sizi uyaralım.
              </Text>
            </View>
          </View>
          <View style={styles.budgetRow}>
            <View style={styles.budgetInput}>
              <TextInput
                value={budgetText}
                onChangeText={setBudgetText}
                onBlur={handleBudgetBlur}
                keyboardType="numeric"
                style={styles.input}
                accessibilityLabel="Aylık bütçe limiti"
              />
              <Text style={styles.currency}>TL</Text>
            </View>
            <Switch
              value={budgetEnabled}
              onValueChange={handleBudgetToggle}
              trackColor={{ false: tokens.colors.track, true: tokens.colors.primary }}
              thumbColor="#fff"
              accessibilityLabel="Bütçe uyarısını aç/kapat"
            />
          </View>
        </Card>

        <View style={styles.privacyBox}>
          <ShieldCheck size={22} color={tokens.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Gizliliğiniz Bizim İçin Önemli</Text>
            <Text style={styles.privacyBody}>
              Yalnızca e-ticaret fatura ve sipariş özetlerini işleriz. Diğer e-posta içeriklerinize
              erişilmez, saklanmaz veya reklam amacıyla paylaşılmaz. OAuth kapsamı teknik olarak
              posta okuma izni verir; uygulama yalnızca bilinen alışveriş göndericilerini filtreler.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleDeleteAccount}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel="Hesabı ve verileri sil"
        >
          <Trash2 size={18} color={tokens.colors.danger} />
          <Text style={styles.deleteText}>Hesabı ve Verileri Sil</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void (async () => {
              await logout();
              router.replace('/(auth)/login');
            })();
          }}
          style={styles.logoutBtn}
          accessibilityRole="button"
          accessibilityLabel="Çıkış yap"
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={privacyModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ShieldCheck size={28} color={tokens.colors.primary} />
            <Text style={styles.modalTitle}>E-posta Erişim Onayı</Text>
            <Text style={styles.modalBody}>
              Bill Lens yalnızca Trendyol, Yemeksepeti, Getir, Amazon TR ve Hepsiburada gibi
              bilinen e-ticaret göndericilerinden gelen fatura/sipariş e-postalarını işler.
              Verileriniz reklam amacıyla kullanılmaz. Devam ederek bu kullanımı onaylarsınız.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setPrivacyModalVisible(false);
                  setPendingProvider(null);
                }}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Vazgeç</Text>
              </Pressable>
              <Pressable onPress={handleAcceptPrivacy} style={styles.modalConfirm}>
                <Text style={styles.modalConfirmText}>Onayla ve Bağla</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const LinearSourceHeader = () => (
  <View style={styles.sourceHeader}>
    <Image source={illustrations['email-receipt']} style={styles.sourceImage} resizeMode="contain" />
    <View style={{ flex: 1 }}>
      <Text style={styles.sourceTitle}>Veri Kaynakları</Text>
      <Text style={styles.sourceDesc}>
        Alışveriş verilerinizi e-posta hesaplarınızdan güvenle toplayın.
      </Text>
    </View>
  </View>
);

type AccountRowProps = {
  logo: number;
  title: string;
  connected: boolean;
  email?: string;
  onPress: () => void;
};

const AccountRow = ({ logo, title, connected, email, onPress }: AccountRowProps) => (
  <Pressable
    onPress={onPress}
    style={styles.accountRow}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <Image source={logo} style={styles.accountLogo} />
    <View style={{ flex: 1 }}>
      <Text style={styles.accountTitle}>{title}</Text>
      {connected ? (
        <Text style={styles.connected}>
          ✓ Bağlı · {email}
        </Text>
      ) : (
        <Text style={styles.disconnected}>Bağlı değil</Text>
      )}
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    paddingHorizontal: tokens.layout.pagePadding,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    marginTop: 8,
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.h1,
    color: tokens.colors.text,
  },
  sourceHero: { overflow: 'hidden' },
  sourceHeader: {
    backgroundColor: tokens.colors.primaryLight,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceImage: { width: 72, height: 72 },
  sourceTitle: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.h3,
    color: tokens.colors.text,
  },
  sourceDesc: {
    marginTop: 4,
    fontFamily: tokens.fontFamily.regular,
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  sourceList: { paddingHorizontal: 8, paddingVertical: 4 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  accountLogo: { width: 36, height: 36, borderRadius: 10 },
  accountTitle: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  connected: {
    marginTop: 2,
    color: tokens.colors.savings,
    fontFamily: tokens.fontFamily.medium,
    fontSize: 12,
  },
  disconnected: {
    marginTop: 2,
    color: tokens.colors.textMuted,
    fontFamily: tokens.fontFamily.regular,
    fontSize: 12,
  },
  chevron: {
    fontSize: 22,
    color: tokens.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginHorizontal: 8,
  },
  rowIcon: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: tokens.fontFamily.semibold,
    fontSize: tokens.fontSize.h3,
    color: tokens.colors.text,
  },
  cardDesc: {
    marginTop: 4,
    fontFamily: tokens.fontFamily.regular,
    fontSize: 13,
    color: tokens.colors.textSecondary,
    lineHeight: 18,
  },
  aliasBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primaryLight,
    borderRadius: tokens.radius.md,
    paddingLeft: 12,
    paddingVertical: 4,
    paddingRight: 4,
  },
  alias: {
    flex: 1,
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.primaryDark,
    fontSize: 13,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterHint: {
    marginTop: 12,
    fontFamily: tokens.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.textMuted,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 16,
    color: tokens.colors.text,
  },
  currency: {
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textMuted,
  },
  privacyBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: tokens.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#C9D9FF',
    borderRadius: tokens.radius.xl,
    padding: 16,
  },
  privacyTitle: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primaryDark,
    marginBottom: 4,
  },
  privacyBody: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 13,
    color: tokens.colors.textSecondary,
    lineHeight: 19,
  },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: tokens.colors.danger,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.surface,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteText: {
    color: tokens.colors.danger,
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 15,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: tokens.colors.textMuted,
    fontFamily: tokens.fontFamily.medium,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 18,
    color: tokens.colors.text,
  },
  modalBody: {
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  modalConfirm: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontFamily: tokens.fontFamily.semibold,
    color: '#fff',
  },
});
