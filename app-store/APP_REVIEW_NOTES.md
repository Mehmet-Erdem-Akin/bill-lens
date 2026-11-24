# Bill Lens — App Store Review Notes

Paste the English block into App Store Connect → App Review Information → Notes.

```
BILL LENS — App Review Notes

1) DEMO MODE (no email required)
On the Login screen tap:
"E-posta Bağlamadan Örnek Verilerle Keşfet (Demo Mode)"
This loads local mock orders, charts, savings and settings so review can explore without connecting Gmail/Outlook.

Optional email/password login also works with any non-empty credentials in this build (creates a local session). Sign in with Apple is available on iOS.

2) PURPOSE
Bill Lens helps individuals track e-commerce spending from platforms such as Trendyol, Yemeksepeti, Getir, Amazon TR and Hepsiburada by parsing order/invoice emails (inbound alias MVP; OAuth on-device parsing planned). It shows monthly spend, budget progress, platform distribution, product price history from past purchases, and savings/discount analysis.

3) HOW TO TEST
1. Launch → Demo Mode
2. Home: monthly spend hero, budget bar, platform donut, recent orders
3. Harcamalar: search/filter orders
4. Ürünler: price history cards (purchase-based, not live market prices)
5. Tasarruf: discounts, shipping analysis, free-shipping tracker
6. Ayarlar: copy inbound email alias, connect/disconnect Gmail/Outlook (privacy consent modal first), set monthly budget, Delete Account & Data

4) AUTH SEPARATION (Guideline 4.8)
Gmail/Outlook are NOT login methods. They appear only under Settings → Veri Kaynakları after sign-in.

5) ACCOUNT DELETION (Guideline 5.1.1 / KVKK)
Settings → "Hesabı ve Verileri Sil" clears secure tokens locally and calls DELETE /api/user/account when backend is configured.

6) EXTERNAL SERVICES
- Bill Lens API (Express/Prisma/PostgreSQL) for inbound email webhook and account deletion
- Optional OpenAI for unknown invoice templates
- Optional Google/Microsoft OAuth when client IDs are configured

No IAP, no ads in this binary.
```
