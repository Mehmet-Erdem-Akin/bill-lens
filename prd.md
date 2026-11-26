# Bill Lens — Teknik Ürün ve Mimari Analiz Dokümanı (PRD)

**Proje Adı:** Bill Lens — Bireysel E-Ticaret Harcama ve Tasarruf Analiz Mobil Uygulaması  
**Mobil Teknoloji Yığını:** React Native (Expo SDK 58 / Expo Router), TypeScript, Zustand, TanStack Query, NativeWind token’ları + StyleSheet, Firebase JS SDK  
**Backend & Veritabanı:** Firebase Cloud Functions (Express), Cloud Firestore, Firebase Auth  
**Hedef Platformlar:** iOS & Android  
**Temel Amaç:** Trendyol, Yemeksepeti, Getir, Amazon TR, Hepsiburada sipariş/fatura e-postalarını otomatik ayrıştırarak ürün bazlı fiyat takibi, kategori bazlı harcama analizi ve tasarruf önerileri sunmak.

---

## 1. E-posta entegrasyon mimarisi

### Faz 1 — Inbound Email Parse (MVP)
- Kullanıcıya unique `inbound_alias` atanır (Auth user create + `/auth/register`).
- Mobilde `expo-clipboard` ile kopyalama + filtre rehberi.
- Webhook: `POST /api/webhooks/inbound-email` (Cloud Function `api`).

### Faz 2 — OAuth + on-device parsing
- Gmail / Outlook `expo-auth-session` stub’ları.
- Token’lar `expo-secure-store` içinde.
- Sunucuya yalnızca anonimleştirilmiş harcama özeti.

---

## 2. Parsing pipeline
1. Gönderici / şablon tespiti  
2. Cheerio deterministik HTML parser (Trendyol, Yemeksepeti, Getir)  
3. LLM / heuristic fallback (PDF e-Arşiv metni dahil)

---

## 3. Mobil ekranlar
- Onboarding / Login + Demo Mode  
- Dashboard `/(tabs)/index`  
- Harcamalar `/(tabs)/expenses`  
- Ürün Fiyat Geçmişi `/(tabs)/products`  
- Tasarruf Analizi `/(tabs)/savings`  
- Ayarlar `/(tabs)/settings`

---

## 4. Veri modeli (Firestore)
- `users/{uid}` — profil, `inboundAlias`, bütçe
- `users/{uid}/connectedAccounts/{id}`
- `users/{uid}/orders/{orderId}` — kalemler gömülü dizi
- `inboundAliases/{alias}` → `{ userId }` (webhook çözümlemesi)

Kurallar: `firestore.rules`. Ayrı Postgres / Docker gerekmez.

---

## 5. Mağaza uyumluluğu
1. Auth ayrımı (Gmail login ekranında yok)  
2. Demo Mode  
3. `DELETE /user/account` (Firebase Auth + Firestore cascade) + local OAuth temizliği  
4. Şeffaf izin modalı

---

## Yapıldı

- Expo (TypeScript + Expo Router) iskeleti: `mobile/app`, `components`, `services`, `store`, `types`, `theme`
- Demo Mode (Zustand) + Dashboard / Harcamalar / Ürünler / Tasarruf / Ayarlar ekranları (mock veriler + gifted-charts)
- Tasarım sistemi token’ları, asset-map ve illüstrasyonlar entegre edildi
- Backend Prisma şeması, inbound alias üretimi, inbound-email webhook, hesap silme endpoint’i
- Trendyol / Yemeksepeti / Getir Cheerio parser’ları + LLM fallback stub
- Faz 2 OAuth stub’ları (`expo-auth-session` + SecureStore)
- App Store uyumluluğu: Apple Sign-In akışı, Demo Mode, gizlilik modalı, hesap/veri silme
- Store config’leri word-rush referanslı (`app.json`, `eas.json`, appleTeamId)
- Firebase entegrasyonu: Cloud Functions API, Firestore, Auth; Express/Prisma/Postgres kaldırıldı
