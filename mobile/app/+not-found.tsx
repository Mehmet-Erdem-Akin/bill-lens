import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/theme/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Bu ekran bulunamadı.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ana sayfaya dön</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: tokens.colors.background,
  },
  title: {
    fontSize: 20,
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: tokens.colors.primary,
    fontFamily: tokens.fontFamily.medium,
  },
});
