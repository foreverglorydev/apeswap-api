import { tvlQuery } from './subgraph.queries';

export async function getSubgraphData(httpService): Promise<any> {
  const query = tvlQuery();
  const {
    data,
  } = await httpService
    .post(
      'https://graph.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph',
      { query },
    )
    .toPromise();
  return data;
}
