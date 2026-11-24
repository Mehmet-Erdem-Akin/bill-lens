# Bill Lens

Bireysel e-ticaret harcama ve tasarruf analiz mobil uygulaması.

## Yapı

- `mobile/` — Expo SDK 58, Expo Router, TypeScript, Zustand, TanStack Query
- `backend/` — Express + Prisma + PostgreSQL (inbound email webhook & parsers)
- `app-store/` — mağaza inceleme notları ve listing taslakları
- `prd.md` — ürün / mimari dokümanı

## Hızlı başlangıç (mobil)

```bash
cd mobile
npm install
npx expo start
```

Demo Mode: giriş ekranında **E-posta Bağlamadan Örnek Verilerle Keşfet**.

## Backend

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Webhook: `POST /api/webhooks/inbound-email`  
Hesap silme: `DELETE /api/user/account` (`x-user-id` veya `x-user-email`)

## Mağaza kimlikleri

Word Rush referansından uyarlandı:

- iOS bundle: `com.akintechstudio.billlens`
- Android package: `com.akintechstudio.billlens`
- Apple Team ID: `L9XFYWS8GJ`
- Expo owner: `mehmetea57`
