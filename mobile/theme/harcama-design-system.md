# Harcama uygulaması — Mobile UI Kit

Expo + React Native + TypeScript için tasarım sistemi. Önceki dört AI mockup referans alınmıştır. Kaynak Figma/katman dosyaları mevcut olmadığından ikonlar, illüstrasyonlar ve token'lar yeniden oluşturulmuştur; birebir orijinal değildir. Değerler ölçü birimi olarak RN dp kullanır. Font dosyaları dahil değildir.

## 1. Görsel dil
- Fintech, açık tema, yumuşak kartlar, güçlü parasal veri hiyerarşisi.
- Ana mavi: dashboard ve veri kaynakları. Zümrüt: tasarruf ve olumlu durumlar. Mor: fiyat geçmişi.
- Birincil aksiyonlar mavi; yalnızca tehlikeli/silme aksiyonları kırmızı. Fiyat artışında turuncu/kırmızı + yön ikonu; azalışta yeşil + yön ikonu. Anlam yalnızca renkle ifade edilmemeli.
- Platform renkleri grafik serileri içindir; marka kimliğinin resmi spesifikasyonu olarak kullanılmamalıdır.

## 2. Renk paleti

| Token | HEX | Rol |
|---|---|---|
| primary | #3267E8 | Ana aksiyon, dashboard |
| primaryDark | #1746CE | Güçlü mavi, aktif durum |
| primaryLight | #EAF1FF | Mavi ikon zemini |
| primaryGradientEnd | #4E82F5 | Hero gradient bitişi |
| savings | #07866B | Tasarruf |
| savingsDark | #00624F | Tasarruf hero ve koyu metin |
| savingsLight | #E7F7EF | Pozitif kart zemini |
| price | #7338D8 | Ürün geçmişi, fiyat grafiği |
| priceDark | #5722B0 | Mor aktif durum |
| priceLight | #F1EAFE | Mor zemin |
| warning | #B45309 | Fiyat artışı, uyarı |
| warningLight | #FFF2E4 | Uyarı zemini |
| danger | #C91F35 | Hesap silme, hata |
| dangerLight | #FFF0F2 | Tehlike zemini |
| background | #F6F8FC | Sayfa zemini |
| surface | #FFFFFF | Kart |
| text | #101828 | Ana metin |
| textSecondary | #475467 | Açıklama |
| textMuted | #667085 | Meta bilgi |
| border | #E4E8F0 | Ayırıcı ve kart sınırı |
| track | #E8ECF3 | Progress track |

Platform chart: Trendyol #F27A1A, Yemeksepeti #ED1651, Getir #5D3EBC, Amazon TR #232F3E, Hepsiburada #FFB82E.

## 3. Tipografi

Önerilen font **Inter**, iOS/Android tutarlılığı ve Türkçe karakter desteği için. Mockup'ta kullanılan gerçek font tespit edilemez. Alternatif olarak iOS sistem fontu (SF Pro) / Android sistem fontu kullanılabilir. SF Pro dosyası dağıtılmamaktadır. Inter: https://fonts.google.com/specimen/Inter

| Stil | Boyut / satır | Ağırlık |
|---|---|---|
| Display | 36 / 44 | 700 |
| Para tutarı | 32 / 40 | 700 |
| H1 | 26 / 34 | 700 |
| H2 | 20 / 28 | 600–700 |
| H3 | 17 / 24 | 600 |
| Body | 15 / 22 | 400 |
| Caption | 12 / 18 | 400–500 |
| Tab | 11 / 16 | 500–600 |

Para gösterimi: `new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)`; sayısal metinlerde `fontVariant: ['tabular-nums']`.

## 4. Layout

- Safe area + ScrollView; sayfa yatay padding 20, kart padding 16, kart arası 12–16.
- Radius: küçük 8, input 12, normal kart 16–20, hero 24, pill 999.
- Touch target 48 × 48; tab bar içerik yüksekliği 64 + cihazın alt safe area değeri.
- Stroke: 1.8, default ikon 24, küçük ikon 16, büyük ikon 28. Hero görselleri yaklaşık 112–144 dp; ürün görselleri 48–64 dp.
- Shadow: iOS shadowColor #101828, opacity .07, radius 12, offset (0,4); Android elevation 2. Çizgilerde kontrastı ve cihaz font ölçeklemesini test et.
- 5 tab: Ana Sayfa / Harcamalar / Ürünler / Tasarruf / Ayarlar. Bütçe, dashboard içinden ayrı detay ekranına açılır. Bu navigasyon, önceki mockup'ların farklı tab etiketlerini PRD'ye göre birleştiren öneridir.

## 5. Asset envanteri

`assets/icons/svg/` ve `assets/icons/png/`: 37 yeniden çizilmiş outline ikon, SVG 24×24, PNG 96×96, şeffaf. SVG düzenlenebilir. PNG'ler koyu renkli; RN Image `tintColor` kullanılabilir.

`assets/illustrations/`: 512×512 şeffaf PNG'ler. Kaynak 3D görselden ayrılıp yeniden boyutlandırılmıştır; 512×512 tuval orijinal 512 detay çözünürlüğü garantisi değildir. Ürün görselleri temsili ve markasızdır.

| Dosya | Kullanım |
|---|---|
| shopping-bag-parcel.png | Dashboard harcama hero |
| savings-bag-coins.png | Tasarruf hero |
| email-receipt.png | E-posta bağlantısı |
| gift-box.png | Kargo / kupon içgörüsü |
| headphones.png | Demo sipariş |
| wireless-mouse.png | Demo sipariş |
| burger-fries.png | Demo sipariş |
| coffee-bag.png | Fiyat geçmişi |
| cat-food.png | Fiyat geçmişi |
| cleaning-spray.png / .svg | Fiyat geçmişi, vektör alternatif |

`assets/platform-placeholders/`: 7 platform/sağlayıcı için kısaltma içeren demo kutucuklar (SVG ve PNG). Bunlar **resmi logo değildir**. Yayından önce resmi marka varlıkları ve kullanım kuralları kontrol edilmeli. Google/Microsoft OAuth butonlarını platformun güncel marka kurallarına göre uygulayın.

İkon eşleştirmeleri: dashboard `home`, `calendar`, `bell`, `target`, `layers`; harcamalar `receipt`, `search`, `filter`, `shopping-bag`; fiyat `trending-up`, `package`, `tag`, `store`; tasarruf `ticket`, `percent`, `truck`, `gift`, `sparkles`; ayarlar `settings`, `mail`, `copy`, `shield-check`, `trash`.

## 6. Expo kurulumu (örnek)

```bash
npx expo install expo-font @expo-google-fonts/inter react-native-svg expo-linear-gradient
npm install lucide-react-native
```

Projede mevcut NativeWind yapılandırmasını koruyun. `theme/tailwind.config.cjs` örneği NativeWind v4 / Tailwind CSS 3 içindir; başka sürümler için proje yapılandırmasına göre uyarlayın. Paket bağımlılıkları ve örnekler çalıştırılarak doğrulanmamıştır.

```tsx
// app/_layout.tsx örneği; mevcut navigation/provider yapınıza ekleyin.
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium,
  Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium,
    Inter_600SemiBold, Inter_700Bold });
  if (!loaded && !error) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```tsx
// Örnek hero; theme ve assets klasörlerini proje köküne kopyalayın.
import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { illustrations } from '../theme/asset-map';

export function SpendHero({ amount }: { amount: number }) {
  return (
    <LinearGradient colors={[tokens.colors.primaryDark, tokens.colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24, padding: 20, minHeight: 156, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <ShoppingBag color="#FFFFFF" size={20} />
        <Text style={{ color: '#FFFFFF', fontFamily: tokens.fontFamily.medium, fontSize: 15 }}>Aylık Harcama</Text>
        <Text adjustsFontSizeToFit numberOfLines={1}
          style={{ color: '#FFFFFF', fontFamily: tokens.fontFamily.bold, fontSize: 32, fontVariant: ['tabular-nums'] }}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)}
        </Text>
      </View>
      <Image source={illustrations['shopping-bag-parcel']} style={{ width: 120, height: 120 }} resizeMode="contain" accessible={false} />
    </LinearGradient>
  );
}
```

Özel SVG dosyalarını JSX'e çevirebilir veya uygun `react-native-svg-transformer` Metro yapılandırmasıyla import edebilirsiniz. Alternatif: ikon paketi olarak Lucide React Native (`size={24}`, `strokeWidth={1.8}`), PNG'ler için RN Image. Lucide: https://lucide.dev/guide/packages/lucide-react-native

## 7. Ürün davranışı ve veri notları
- Demo modunda gerçek kullanıcıya ait olmayan örnek veriler kullanılır.
- Fiyat geçmişi, yalnızca e-posta/faturalardan doğrulanabilen **son satın alma fiyatını** gösterir; canlı piyasa fiyatı değildir. Ürün miktarı/gramajı normalize edilmeli. Veri eksikse gösterim 'Bilinmiyor'.
- Kargo tasarrufu analizi, eğer eşik ve gerçek kargo tutarı biliniyorsa gösterilmeli. Ücretsiz kargonun ödenen ücret olarak sayılmaması gerekir. İhtiyaç dışı alışveriş teşvik edilmemeli.
- E-posta izin metninde gerçek OAuth erişim kapsamını açıklayın. `Mail.Read` / Gmail okuma kapsamı teknik olarak yalnızca alışveriş faturalarıyla sınırlı değildir; uygulamanın uyguladığı filtre ile izin kapsamı farklıdır. Yalnızca yönlendirilen e-postalar veya doğrulanmış izin/işleme kapsamı hakkında kesin iddia kullanın.
- Mockup verileri, tutarlar ve bağlantı durumları temsili. Hesap silme ve veri güvenliği davranışı gerçek backend ile doğrulanmalıdır.
