import { tokenListings } from '../tokens.config';

export const getTokenLogoUrl = async (tokenAddress: string) => {
  for (let i = 0; i < tokenListings.length; i++) {
    if (tokenAddress.toUpperCase() === tokenListings[i].address.toUpperCase()) {
      return tokenListings[i].logoURI;
    }
  }

  return null;
};
