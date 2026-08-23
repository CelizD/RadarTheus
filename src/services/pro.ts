import { Plan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../db.js";

export async function hasProAccess(telegramId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });

  if (!user) return false;

  // PRO manual funciona como acceso permanente/administrativo.
  if (user.plan === Plan.PRO) return true;

  const active = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: { gt: new Date() }
    },
    orderBy: { expiresAt: "desc" }
  });

  return Boolean(active);
}

export async function activateProFromPayment(params: {
  telegramId: number;
  starsAmount: number;
  telegramPaymentChargeId: string;
  providerPaymentChargeId?: string;
}) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { telegramId: BigInt(params.telegramId) }
  });

  const now = new Date();
  const latest = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: { gt: now }
    },
    orderBy: { expiresAt: "desc" }
  });

  const base = latest && latest.expiresAt > now ? latest.expiresAt : now;
  const expiresAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { telegramPaymentChargeId: params.telegramPaymentChargeId },
    update: {
      status: SubscriptionStatus.ACTIVE,
      starsAmount: params.starsAmount,
      expiresAt,
      autoRenew: true
    },
    create: {
      userId: user.id,
      starsAmount: params.starsAmount,
      telegramPaymentChargeId: params.telegramPaymentChargeId,
      providerPaymentChargeId: params.providerPaymentChargeId,
      expiresAt,
      autoRenew: true
    }
  });

  return expiresAt;
}
