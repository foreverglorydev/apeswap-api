import { BadRequestException } from "@nestjs/common";
import { QUOTE_CURRENCY_BSC, QUOTE_CURRENCY_MATIC } from "../bitquery.queries"

export function getQuoteCurrency(network: string) {
  switch (network) {
    case 'bsc':
      return {
        network,
        symbol: 'USDT',
        address: QUOTE_CURRENCY_BSC.USDT
      }
    case 'matic':
      return {
        network,
        symbol: 'USDT',
        address: QUOTE_CURRENCY_MATIC.USDT
      }

    default:
      return {
        network,
        symbol: 'USDT',
        address: QUOTE_CURRENCY_BSC.USDT
      }
  }
}

// Database
export async function verifyModel(model) {
  if (!model) return null;
  const now = Date.now();
  const lastCreatedAt = new Date(model.createdAt).getTime();
  const diff = now - lastCreatedAt;
  const time = 120000; // 2 minutes

  if (diff > time) return null;

  return model;
}

export function updateAllPair(modul, filter, pair) {
  return modul.updateOne(
    filter,
    {
      $set: pair,
      $currentDate: {
        createdAt: true,
      },
    },
    {
      upsert: true,
      timestamps: true,
    },
  );
}

export function updatePair(modul, filter) {
  return modul.updateOne(
    filter,
    {
      $currentDate: {
        createdAt: true,
      },
    },
  );
}