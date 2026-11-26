// NativeWind v4 / Tailwind CSS 3 örneği
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {
    colors: {
    "primary": "#3267E8",
    "primaryDark": "#1746CE",
    "primaryLight": "#EAF1FF",
    "primaryGradientEnd": "#4E82F5",
    "savings": "#07866B",
    "savingsDark": "#00624F",
    "savingsLight": "#E7F7EF",
    "price": "#7338D8",
    "priceDark": "#5722B0",
    "priceLight": "#F1EAFE",
    "warning": "#B45309",
    "warningLight": "#FFF2E4",
    "danger": "#C91F35",
    "dangerLight": "#FFF0F2",
    "background": "#F6F8FC",
    "surface": "#FFFFFF",
    "text": "#101828",
    "textSecondary": "#475467",
    "textMuted": "#667085",
    "border": "#E4E8F0",
    "track": "#E8ECF3",
    "trendyol": "#F27A1A",
    "yemeksepeti": "#ED1651",
    "getir": "#5D3EBC",
    "amazon": "#232F3E",
    "hepsiburada": "#FFB82E"
},
    fontFamily: { regular: ['Inter_400Regular'], medium: ['Inter_500Medium'], semibold: ['Inter_600SemiBold'], bold: ['Inter_700Bold'] },
    borderRadius: { card: '20px', hero: '24px' }
  } }, plugins: []
};
