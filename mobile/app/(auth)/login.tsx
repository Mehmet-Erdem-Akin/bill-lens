import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { illustrations } from '@/theme/asset-map';
import { tokens } from '@/theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const loginWithApple = useAuthStore((s) => s.loginWithApple);
  const enterDemoMode = useAuthStore((s) => s.enterDemoMode);
  const loadDemoData = useAppStore((s) => s.loadDemoData);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    const result = await loginWithEmail(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Giriş başarısız');
      return;
    }
    router.replace('/(tabs)');
  };

  const handleApple = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'ios') {
        await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
      }
      await loginWithApple();
      router.replace('/(tabs)');
    } catch {
      // Simulator / cancel — still allow mock Apple login for development
      await loginWithApple();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loadDemoData();
    enterDemoMode();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[tokens.colors.primaryLight, tokens.colors.background]}
        style={styles.gradient}
      >
        <View style={styles.hero}>
          <Image
            source={illustrations['email-receipt']}
            style={styles.logo}
            resizeMode="contain"
            accessible={false}
          />
          <Text style={styles.brand}>Bill Lens</Text>
          <Text style={styles.tagline}>
            E-ticaret harcamalarını otomatik takip et, tasarruf fırsatlarını yakala.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta"
            placeholderTextColor={tokens.colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            accessibilityLabel="E-posta"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Şifre"
            placeholderTextColor={tokens.colors.textMuted}
            secureTextEntry
            style={styles.input}
            accessibilityLabel="Şifre"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleEmailLogin}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Giriş yap"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Giriş Yap</Text>
            )}
          </Pressable>

          {Platform.OS === 'ios' ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleBtn}
              onPress={handleApple}
            />
          ) : (
            <Pressable
              onPress={handleApple}
              style={styles.secondaryBtn}
              accessibilityRole="button"
              accessibilityLabel="Apple ile giriş (geliştirme)"
            >
              <Text style={styles.secondaryText}>Apple ile Giriş (geliştirme)</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDemo}
            style={styles.demoBtn}
            accessibilityRole="button"
            accessibilityLabel="E-posta bağlamadan örnek verilerle keşfet"
          >
            <Text style={styles.demoText}>
              E-posta Bağlamadan Örnek Verilerle Keşfet (Demo Mode)
            </Text>
          </Pressable>

          <Text style={styles.note}>
            Gmail/Outlook bağlantısı giriş ekranında sunulmaz. Giriş sonrası Ayarlar → Veri
            Kaynakları üzerinden bağlanır (App Store Kural 4.8).
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  gradient: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 120, height: 120, marginBottom: 8 },
  brand: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 36,
    color: tokens.colors.primaryDark,
  },
  tagline: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: tokens.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: tokens.colors.textSecondary,
  },
  form: { gap: 12 },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontFamily: tokens.fontFamily.regular,
    fontSize: 15,
    color: tokens.colors.text,
  },
  error: {
    color: tokens.colors.danger,
    fontFamily: tokens.fontFamily.medium,
    fontSize: 13,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 16,
  },
  appleBtn: { width: '100%', height: 52 },
  secondaryBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#fff',
    fontFamily: tokens.fontFamily.semibold,
  },
  demoBtn: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  demoText: {
    textAlign: 'center',
    color: tokens.colors.primaryDark,
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 14,
  },
  note: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: tokens.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.textMuted,
  },
});
