import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const toPrismaPlatform = (platform: string) => {
  switch (platform) {
    case 'Trendyol':
      return 'Trendyol' as const;
    case 'Yemeksepeti':
      return 'Yemeksepeti' as const;
    case 'Getir':
      return 'Getir' as const;
    case 'Amazon TR':
      return 'AmazonTR' as const;
    case 'Hepsiburada':
      return 'Hepsiburada' as const;
    default:
      return 'Unknown' as const;
  }
};

export const createInboundAlias = (email: string): string => {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9.]/g, '') || 'user';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `alisveris+${local.toLowerCase()}.${suffix}@harcamam.app`;
};
