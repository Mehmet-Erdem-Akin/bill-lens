export type DetectedPlatform =
  | 'Trendyol'
  | 'Yemeksepeti'
  | 'Getir'
  | 'Amazon TR'
  | 'Hepsiburada'
  | 'Unknown';

const RULES: Array<{ platform: DetectedPlatform; match: RegExp }> = [
  { platform: 'Trendyol', match: /trendyol\.com/i },
  { platform: 'Yemeksepeti', match: /yemeksepeti\.com/i },
  { platform: 'Getir', match: /getir\.com/i },
  { platform: 'Amazon TR', match: /amazon\.(com\.tr|com)/i },
  { platform: 'Hepsiburada', match: /hepsiburada\.com/i },
];

export const detectPlatform = (fromHeader = '', subject = ''): DetectedPlatform => {
  const haystack = `${fromHeader} ${subject}`;
  for (const rule of RULES) {
    if (rule.match.test(haystack)) return rule.platform;
  }
  return 'Unknown';
};
