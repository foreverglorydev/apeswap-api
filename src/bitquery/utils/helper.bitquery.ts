import { QUOTE_CURRENCY_BSC, QUOTE_CURRENCY_MATIC } from '../bitquery.queries';
import { PairInformationDto } from '../dto/pairInformation.dto';

export function getQuoteCurrency(network: string) {
  switch (network) {
    case 'bsc':
      return {
        network,
        ...QUOTE_CURRENCY_BSC.BUSD,
      };
    case 'matic':
      return {
        network,
        ...QUOTE_CURRENCY_MATIC.USDT,
      };

    default:
      return {
        network,
        ...QUOTE_CURRENCY_BSC.USDT,
      };
  }
}

export function getQuoteCurrencies(network: string) {
  switch (network) {
    case 'bsc':
      return QUOTE_CURRENCY_BSC;
    case 'matic':
      return QUOTE_CURRENCY_MATIC;

    default:
      return null;
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
  return modul.updateOne(filter, {
    $currentDate: {
      createdAt: true,
    },
  });
}

export function calculatePrice(
  pairInfo: PairInformationDto,
  base,
  target,
  token1,
) {
  let basePrice = 0;
  let targetPrice = 0;
  if (base.length === 0 && target.length !== 0) {
    basePrice =
      (pairInfo.base.pooled_token / pairInfo.target.pooled_token) *
      target[0].quotePrice;
    targetPrice = target[0].quotePrice;
  }
  if (base.length !== 0 && target.length === 0) {
    targetPrice =
      (pairInfo.target.pooled_token / pairInfo.base.pooled_token) *
      base[0].quotePrice;
    basePrice = base[0].quotePrice;
  }
  if (base.length !== 0 && target.length !== 0) {
    basePrice = base[0].quotePrice;
    targetPrice = target[0].quotePrice;
  }

  if (pairInfo.base.address !== token1) {
    const tmpBase = basePrice;
    const tmpTarget = targetPrice;

    basePrice = tmpTarget;
    targetPrice = tmpBase;
  }
  return { basePrice, targetPrice };
}
