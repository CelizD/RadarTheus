import type { User as TelegramUser } from "grammy/types";
import { prisma } from "../db.js";

export async function upsertTelegramUser(user: TelegramUser) {
  return prisma.user.upsert({
    where: { telegramId: BigInt(user.id) },
    update: {
      username: user.username ?? null,
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null
    },
    create: {
      telegramId: BigInt(user.id),
      username: user.username ?? null,
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null
    }
  });
}

export async function getUserByTelegramId(telegramId: number) {
  return prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });
}
