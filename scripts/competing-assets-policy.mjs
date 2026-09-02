// This catalog is intentionally explicit. The checker can prevent known prohibited
// references from returning, but it cannot infer whether a newly launched asset is
// a competitor. Add newly approved identifiers here together with regression tests.
// Source comments and listed deployments were reviewed on 2026-09-02. Retired
// identifiers remain listed when they can still recur in historical documentation.
export const COMPETING_ASSET_POLICIES = Object.freeze([
  {
    id: 'circle-usd',
    label: 'USD Coin',
    symbols: ['USDC.e', 'USDbC', 'USDC'],
    names: ['USD Coin'],
    // Native mainnet/testnet deployments verified against Circle's official
    // registry on 2026-09-02:
    // https://developers.circle.com/stablecoins/usdc-contract-addresses
    // Legacy bridged deployments are retained because they can recur in
    // historical documentation:
    // https://www.circle.com/blog/usdc-now-available-natively-on-base
    // https://www.circle.com/blog/now-available-usdc-on-op-mainnet
    addresses: [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      '0xd996633a415985DBd7D6D12f4A4343E31f5037cf',
      '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      '0x3D7F2C478aAfdB65542BCB44bCeeC05849999d2D',
      '0x98d2919b9A214E6Fa5384AC81E6864bA686Ad74c',
      '0xb88339CB7199b77E23DB6E890353E22632Ba630f',
      '0xa00C59fF5a080D2b954d0c75e46E22a0c371235a',
      '0x2D270e6886d130D724215A266106e6832161EAEd',
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
      '0xCfb1186F4e93D60E60a8bDd997427D1F33bc372B',
      '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      '0xC879C018dB60520F4355C26eD1a6D572cdAC1815',
      '0x2d661C89D812261039AF9764eceaAee884f5F67F',
      '0x222365EF19F7947e5484218551B56bb3965Aa7aF',
      '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
      '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
      '0x79A02482A880bCe3F13E09da970dC34dB4cD24D1',
      '0xB6CEceAB302E2E4948951eE7843FC24E92933061',
      '0xfA2958CB79b0491CC627c1557F441eF849Ca8eb1',
      '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4',
      '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      '0xFF970A61A04b1ca14834A43f5de4533ebddb5cc8',
      '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      '0x3600000000000000000000000000000000000000',
      '0x5425890298aed601595a70AB815c96711a31Bc65',
      '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      '0x01C5C0122039549AD1493B8220cABEdD739BC44E',
      '0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f',
      '0xEb33dc5fac03833e132593659e1dE7256aB59794',
      '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      '0x2d9F7CAD728051AA35Ecdc472a14cf8cDF5CFD6B',
      '0x2B3370eE501B4a559b57D449569354196457D8Ab',
      '0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d',
      '0xFabab97dCE620294D2B0b0e46C68964e326300Ac',
      '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7',
      '0x534b2f3A21130d7a60830c2Df862319e593943A3',
      '0x7433b41C6c5e1d58D4Da99483609520255ab661B',
      '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
      '0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B',
      '0xE67Fb267022cBA8064Dd388CC2FED724F3120D9D',
      '0xcB5f30e335672893c7eb944B374c196392C19D18',
      '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
      '0x0BA304580ee7c9a980CF72e55f5Ed2E9fd30Bc51',
      '0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6',
      '0x31d0220469e10c4E71834a79b1f276d740d3768F',
      '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
      '0xDec90b78111Ba2fc6FC6d84d8B9ec159A2d4b9B3',
      '0xb5AB69F7bBada22B28e79C8FFAECe55eF1c771D4',
      '0xAe045DE5638162fa134807Cb558E15A3F5A7F853',
      // Long-zero EVM forms of Hedera token IDs 0.0.456858 and 0.0.429274.
      '0x000000000000000000000000000000000006f89a',
      '0x0000000000000000000000000000000000068cda'
    ],
    opaqueIdentifiers: [
      '31566704',
      '10458941',
      '0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b',
      '0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832',
      '0.0.456858',
      '0.0.429274',
      '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
      '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af',
      'uusdc',
      '1337',
      '31337',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
      '0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb',
      '0x0512feAc6339Ff7889822cb5aA2a86C848e9D392bB0E3E237C008674feeD8343',
      'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      'USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
      'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
      '5553444300000000000000000000000000000000.rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE',
      '5553444300000000000000000000000000000000.rHuGNhqTG32mfmAvWA8hUyWRLV3tCSwKQt'
    ],
    // Circle's Polkadot Asset Hub asset IDs are short decimal values that are
    // meaningful only next to an asset/token identifier. Treating them as
    // unconditional literals would reject unrelated ports, examples, and IDs.
    contextRequiredOpaqueIdentifiers: ['1337', '31337']
  },
  {
    id: 'maker-dai',
    label: 'Dai',
    symbols: ['sDAI', 'DAI'],
    names: ['Dai Stablecoin', 'Savings Dai'],
    // Ethereum deployments and the shared Optimism/Arbitrum L2 deployment.
    // The archived official bridge repositories are retained as the primary
    // source for legacy L2 and testnet identifiers:
    // https://github.com/sky-ecosystem/optimism-dai-bridge#deployments
    // https://github.com/sky-ecosystem/arbitrum-dai-bridge#deployments
    addresses: [
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
      '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
      '0xd9e66A2f546880EA4d800F189d6F12Cc15Bff281'
    ]
  },
  {
    id: 'sky-usds',
    label: 'Sky Dollar',
    symbols: ['stUSDS', 'sUSDS', 'USDS'],
    ignoredSpellings: ['USDs', 'Usds', 'usds'],
    names: ['Sky Dollar', 'Staked USDS', 'Savings USDS'],
    addresses: [
      '0xdC035D45d973E3EC169d2276DDab16f1e407384F',
      '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD'
    ],
    opaqueIdentifiers: [
      '0x3274643db77a064abd3bc851de77556a4ad2e2f502f4f0c80845fa8f909ecf0b'
    ]
  },
  {
    id: 'paypal-usd',
    label: 'PayPal USD',
    symbols: ['PYUSD'],
    names: ['PayPal USD'],
    // https://docs.paxos.com/guides/stablecoin/pyusd/mainnet
    // Testnet identifiers verified on 2026-09-02:
    // https://docs.paxos.com/guides/stablecoin/pyusd/testnet
    addresses: [
      '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
      '0x46850aD61C2B7d64d08c9C754F45254596696984',
      '0x99aF3EeA856556646C98c8B9b2548Fe815240750',
      '0x87b4a8176B3Df6b71e26CC095edcAf4Db07506B4',
      '0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1',
      '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
      '0x4549bb98c667aAb626627C118102c28065E8f54C',
      '0xBA4966F36c90B280983468Fb856cf1a375FD89aa'
    ],
    opaqueIdentifiers: [
      '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
      'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM',
      'GDQE7IXJ4HUHV6RQHIUPRJSEZE4DRS5WY577O2FY6YQ5LVWZ7JZTU2V5'
    ]
  },
  {
    id: 'first-digital-usd',
    label: 'First Digital USD',
    symbols: ['FDUSD'],
    names: ['First Digital USD'],
    // https://www.firstdigitallabs.com/fdusd
    addresses: [
      '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409',
      '0x93C9932E4afa59201F0B5E63f7d816516F1669fE'
    ],
    opaqueIdentifiers: [
      'EQD0Evpk4timFOHmy4Sv3l_KEUXlM-dN1_KhroTCfB2wkO89',
      '0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a',
      '9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u'
    ]
  },
  {
    id: 'binance-usd',
    label: 'Binance USD',
    symbols: ['BUSD'],
    names: ['Binance USD'],
    // Paxos attestation for the Ethereum deployment:
    // https://paxos.com/wp-content/uploads/2024/08/BUSD-EXAM-fully-executed.pdf
    // Canonical chain records for the BNB Chain and Avalanche pegged forms:
    // https://explorer.bnbchain.org/asset/BUSD-BD1
    // https://snowtrace.io/token/0x9c9e5fd8bbc25984b178fdce6117defa39d2db39
    addresses: [
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39'
    ]
  },
  {
    id: 'trueusd',
    label: 'TrueUSD',
    symbols: ['TUSD'],
    names: ['TrueUSD'],
    // https://tusd.io/
    addresses: [
      '0x0000000000085d4780B73119b644AE5ecd22b376',
      '0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9',
      '0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB',
      '0x2e1ad108ff1d8c782fcbbb89aad783ac49586756',
      '0x4d15a3a2286d883af0aa1b3f21367843fac63e07',
      '0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e',
      '0xcB59a0A753fDB7491d5F3D794316F1adE197B21E',
      '0x5454bA0a9E3552f7828616D80a9D2D869726e6F5',
      '0x14016e85a25aeb13065688cafb43044c2ef86784'
    ],
    opaqueIdentifiers: ['TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4']
  },
  {
    id: 'pax-dollar',
    label: 'Pax Dollar',
    symbols: ['USDP', 'PAX'],
    caseSensitiveSymbols: ['PAX'],
    names: ['Pax Dollar', 'Paxos Standard'],
    // PAX/Paxos Standard was renamed to USDP in 2021; the legacy alias remains
    // prohibited: https://www.paxos.com/blog/the-digital-dollar-that-always-equals-a-dollar-paxos-standard-pax-is-now-pax-dollar-usdp
    // Current mainnet and testnet identifiers verified on 2026-09-02:
    // https://docs.paxos.com/guides/stablecoin/usdp/mainnet
    // https://docs.paxos.com/guides/stablecoin/usdp/testnet
    // https://docs.paxos.com/api-reference/endpoints/deposit-addresses/create-deposit-address
    addresses: [
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      '0x513421d7fb6A74AE51f3812826Aa2Db99a68F2C9'
    ],
    opaqueIdentifiers: [
      'HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM',
      'G8iheDY9bGix5qCXEitCExLcgZzZrEemngk9cbTR3CQs'
    ]
  },
  {
    id: 'pax-gold',
    label: 'Pax Gold',
    symbols: ['PAXG'],
    names: ['Pax Gold'],
    addresses: ['0x45804880De22913dAFE09f4980848ECE6EcbAf78']
  },
  {
    id: 'gemini-dollar',
    label: 'Gemini Dollar',
    symbols: ['GUSD'],
    names: ['Gemini Dollar'],
    // https://www.gemini.com/dollar
    addresses: ['0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd']
  },
  {
    id: 'frax-usd',
    label: 'Frax USD',
    symbols: ['sfrxUSD', 'frxUSD', 'sFRAX', 'LFRAX', 'FRAX'],
    names: ['Frax USD', 'Legacy Frax Dollar', 'Staked Frax USD'],
    // Legacy and current contracts retained from the official Frax registries:
    // https://docs.frax.finance/frax-v1-original/frax
    // https://docs.frax.com/frxusd/frxusd-contracts
    // https://docs.frax.finance/frax-v3-100-cr-and-more/sfrax-token-addresses
    // https://docs.frax.com/frxusd/stake-and-unstake-supported-networks
    addresses: [
      '0x853d955aCEf822Db058eb8505911ED77F175b99e',
      '0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29',
      '0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32',
      '0xcf62F905562626CfcDD2261162a51fd02Fc9c5b6',
      '0x80Eede496655FB9047dd39d9f418d5483ED600df',
      '0x5Bff88cA1442c2496f7E475E9e7786383Bc070c0',
      '0xfc00000000000000000000000000000000000001',
      '0xfc00000000000000000000000000000000000008'
    ]
  },
  {
    id: 'frax-fpi',
    label: 'Frax Price Index',
    symbols: ['FPI'],
    names: ['Frax Price Index'],
    // https://docs.frax.com/protocol/assets/fpi/addresses
    addresses: [
      '0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E',
      '0x90581eCa9469D8D7F5D3B60f4715027aDFCf7927',
      '0xEEdd3A0DDDF977462A97C1F0eBb89C3fbe8D084B',
      '0xDaF72Aa849d3C4FAA8A9c8c99f240Cf33dA02fc4',
      '0x580F2ee1476eDF4B1760bd68f6AaBaD57dec420E',
      '0x93cDc5d29293Cb6983f059Fec6e4FFEb656b6a62',
      '0xba554f7a47f0792b9fa41a1256d4cf628bb1d028',
      '0x00000000bC4aEF4bA6363a437455Cb1af19e2aEb'
    ]
  },
  {
    id: 'liquity-usd',
    label: 'Liquity USD',
    symbols: ['LUSD'],
    names: ['Liquity USD'],
    // https://docs.liquity.org/liquity-v1/documentation/resources
    addresses: [
      '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
      '0xc40F949F8a4e094D1b49a23ea9241D289B7b2819',
      '0x93b346b6BC2548dA6A1E7d98E9a421B42541425b',
      '0x503234F203fC7Eb888EEC8513210612a43Cf6115',
      '0x01E9A866c361eAd20Ab4e838287DD464dc67A50e',
      '0x368181499736d0c0CC614DBB145E2EC1AC86b8c6',
      '0xf93a85d53e4af0d62bdf3a83ccfc1ecf3eaf9f32',
      '0x63bA74893621d3d12F13CEc1e86517eC3d329837'
    ]
  },
  {
    id: 'liquity-bold',
    label: 'Liquity BOLD',
    symbols: ['BOLD'],
    contextRequiredSymbols: ['BOLD'],
    ignoredSpellings: ['Bold', 'bold'],
    names: ['Liquity BOLD', 'BOLD Stablecoin'],
    // https://docs.liquity.org/v2-documentation/technical-docs-and-audits
    addresses: [
      '0x6440f144b7e50D6a8439336510312d2F54beB01D',
      '0x03569CC076654F82679C4BA2124D64774781B01D',
      '0x84533b1512A3A23F0c9668D88FDf86FEffdbb11A',
      '0xf05a207442f14E446b0e32b12D2043bfc68Cb1C9',
      '0x1a17b22d762c8cf2ca0f07e2b3c32e7481bb0d8c'
    ]
  },
  {
    id: 'curve-usd',
    label: 'Curve USD',
    symbols: ['scrvUSD', 'crvUSD'],
    names: ['Curve USD', 'Curve.Fi USD Stablecoin', 'Curve Fi USD Stablecoin', 'Savings crvUSD'],
    // https://github.com/curvefi/docs/blob/master/docs/developer/crvusd/crvusd.md
    // https://gov.curve.finance/t/proposal-to-optimize-scrvusd-parameters-increase-fee-share-and-reduce-twa-window/10356
    addresses: [
      '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
      '0xE8d1E2531761406Af1615A6764B0d5fF52736F56'
    ]
  },
  {
    id: 'ethena-usd',
    label: 'Ethena USD',
    symbols: ['tsUSDe', 'sUSDe', 'USDtb', 'USDe'],
    names: ['Ethena USDe', 'Staked USDe'],
    // https://docs.ethena.fi/solution-design/key-addresses
    // https://docs.usdtb.money/key-addresses
    addresses: [
      '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
      '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
      '0xC139190F447e929f090Edeb554D95AbB8b18aC1C',
      '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
      '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2',
      '0x39Fe7a0DACcE31Bd90418e3e659fb0b5f0B3Db0d',
      '0xAD17Da2f6Ac76746EF261E835C50b2651ce36DA8',
      '0xc708B6887DB46005dA033501f8aeBee72d191a5d'
    ],
    opaqueIdentifiers: [
      'EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f',
      'EQDQ5UUyPHrLcQJlPAczd_fjxn8SLrlNQwolBznxCdSlfQwr',
      '0xb30a694a344edee467d9f82330bbe7c3b89f440a1ecd2da1f3bca266560fce69',
      'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT',
      'Eh6XEPhSwoLv5wFApukmnaVSHQ6sAnoD9BmgmwQoN2sN',
      '8yXrtJ54jZtE84xEBzTESKuegjcAkAuDrdAhRd8i8n3T'
    ]
  },
  {
    id: 'euro-coin',
    label: 'EURC',
    symbols: ['EUROC', 'EURC'],
    names: ['Euro Coin'],
    // Circle now uses EURC exclusively; EUROC and Euro Coin remain as legacy
    // aliases: https://www.circle.com/blog/usd-coin-and-euro-coin-are-now-exclusively-usdc-and-eurc
    // Current mainnet/testnet registry, verified on 2026-09-02:
    // https://developers.circle.com/stablecoins/eurc-contract-addresses
    addresses: [
      '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
      '0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD',
      '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
      '0x1C60ba0A0eD1019e8Eb035E6daF4155A5cE2380B',
      '0xA6dE01a2d62C6B5f3525d768f34d276652C554c8',
      '0x3EE196E78d4d4248b849B8E1C7F44C5457FAFD2C',
      '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
      '0x5E44db7996c682E92a960b65AC713a54AD815c6B',
      '0x31f7538adb53cF16350e6B0c89d03D91b7D12c46',
      '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4',
      '0x808456652fdb597867f38412077A9182bf77359F',
      '0x98AfA0F93Dd993B736399f9074eDcEBD1985A330',
      '0xe479EcA5740Ac65d6E1823bea2f1C08Bc14e954F'
    ],
    opaqueIdentifiers: [
      'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr',
      'EURC-GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
      'EURC-GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO'
    ]
  },
  {
    id: 'circle-usyc',
    label: 'Circle USYC',
    symbols: ['USYC'],
    names: ['US Yield Coin'],
    // Current mainnet/testnet registry, verified on 2026-09-02:
    // https://developers.circle.com/tokenized/usyc/smart-contracts
    addresses: [
      '0x8D0fA28f221eB5735BC71d3a0Da67EE5bC821311',
      '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b',
      '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',
      '0x109656Aba6F175c634c63C9874f29CeAAAB8E606',
      '0x38D3A3f8717F4DB1CcB4Ad7D8C755919440848A3'
    ],
    opaqueIdentifiers: [
      '7LWanZteUKtvFjv4MHYgKXXdAuCQYFPJysL9pxxdRQGn',
      '7WkaBNxz6jpJWGLPNFNsUbuVH8iQ2FxBooMak6itUMWb'
    ]
  },
  {
    id: 'ripple-usd',
    label: 'Ripple USD',
    symbols: ['RLUSD'],
    names: ['Ripple USD'],
    // https://docs.ripple.com/products/stablecoin/overview/token-addresses
    // https://docs.ripple.com/products/stablecoin/developer-resources/rlusd-on-the-xrpl
    // https://docs.ripple.com/products/stablecoin/developer-resources/rlusd-on-ethereum
    // The pre-launch Ethereum implementation address is retained from Ripple's
    // official testing announcement because it can recur in historical copy:
    // https://ripple.com/insights/a-new-era-of-stablecoins-ripple-usd-begins-testing-on-the-xrp-ledger-mainnet/
    addresses: [
      '0x8292bb45bf1ee4d140127049757c2e0ff06317ed',
      '0x8d58c0c60b8d6b88fa98b291a646db34d0f98258',
      '0x9747a0d261c2d56eb93f542068e5d1e23170fa9e',
      '0xe101FB315a64cDa9944E570a7bFfaFE60b994b1D',
      '0xa55705c7bd410612e1e658e7e3770e0d308bc180',
      '0xCfd748B9De538c9f5b1805e8db9e1d4671f7F2ec'
    ],
    opaqueIdentifiers: [
      'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
      'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
      '524C555344000000000000000000000000000000'
    ]
  },
  {
    id: 'blast-usd',
    label: 'Blast USD',
    symbols: ['nrUSDB', 'USDB'],
    names: ['Blast USD', 'Blast USDB', 'Non-rebasing USDB'],
    // https://docs.blast.io/building/bridged-token-addresses
    addresses: [
      '0x4300000000000000000000000000000000000003',
      '0x96F6b70f8786646E0FF55813621eF4c03823139C',
      '0x4200000000000000000000000000000000000022'
    ]
  },
  {
    id: 'aave-gho',
    label: 'Aave GHO',
    symbols: ['stkGHO', 'sGHO', 'GHO'],
    names: ['Aave GHO', 'Savings GHO', 'Staked GHO'],
    // https://github.com/aave-dao/aave-address-book/blob/main/src/AaveV3Ethereum.sol
    // https://github.com/aave-dao/aave-address-book/blob/main/src/GhoEthereum.sol
    // https://github.com/aave-dao/aave-address-book/blob/main/src/AaveSafetyModule.sol
    addresses: [
      '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
      '0xE1753F2e00940cC31213dd92013cF019DFE4ca1d',
      '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d',
      '0x7dfF72693f6A4149b17e7C6314655f6A9F7c8B33',
      '0x6Bb7a212910682DCFdbd5BCBb3e28FB4E8da10Ee',
      '0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73'
    ]
  },
  {
    id: 'magic-internet-money',
    label: 'Magic Internet Money',
    symbols: ['MIM'],
    names: ['Magic Internet Money'],
    // https://docs.abracadabra.money/learn/tokens/tokenomics
    addresses: [
      '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
      '0xB153FB3d196A8eB25522705560ac152eeEc57901',
      '0xfE19F0B51438fd612f6FD59C1dbB3eA319f433Ba',
      '0x49a0400587A7F65072c87c4910449fDcC5c47242',
      '0x82f0B8B456c1A451378467398982d4834b6829c1',
      '0x0cae51e1032e8461f4806e26332c030e34de3adb',
      '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
      '0x130966628846BFd36ff31a822705796e8cb8C18D'
    ]
  },
  {
    id: 'decentralized-usd',
    label: 'Decentralized USD',
    symbols: ['USDDOLD', 'USDD_t', 'USDD_e', 'USDD_b', 'sUSDD', 'USDD'],
    names: ['Decentralized USD', 'USDD 1.0', 'USDD 2.0'],
    // https://docs.usdd.io/developers/deployment-addresses
    // https://docs.usdd.io/introduction/collateral-asset-contract-addresses
    // https://docs.usdd.io/user-guide/migrate
    addresses: [
      '0x4f8e5DE400DE08B164E7421B3EE387f461beCD1A',
      '0x45E51bc23D592EB2DBA86da3985299f7895d66Ba',
      '0xC5d6A7B61d18AfA11435a889557b068BB9f29930',
      '0x8bA9dA757d1D66c58b1ae7e2ED6c04087348A82d',
      '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
      '0xd17479997f34dd9156deef8f95a52d81d265be9c',
      '0x17f235fd5974318e4e2a5e37919a209f7c37a6d1',
      '0xb602f26bf29b83e4e1595244000e0111a9d39f62',
      '0x74e7cef747db9c8752874321ba8b26119ef70c9e'
    ],
    opaqueIdentifiers: [
      'TCrEVahRbhDFB6uRXEWUg7wkptXvg47GKs',
      'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn'
    ]
  },
  {
    id: 'dola',
    label: 'Dola',
    symbols: ['fxDOLA', 'sDOLA', 'DOLA'],
    names: ['Dola stablecoin'],
    // https://docs.inverse.finance/inverse-finance/technical/smart-contracts
    addresses: [
      '0x865377367054516e17014ccded1e7d814edc9ce4',
      '0xb45ad160634c528Cc3D2926d9807104FA3157305',
      '0x8ae125e8653821e851f12a49f7765db9a9ce7384',
      '0x4621b7a9c75199271f773ebd9a499dbd165c3191',
      '0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6',
      '0xbC2b48BC930Ddc4E5cFb2e87a45c379Aab3aac5C'
    ]
  },
  {
    id: 'ondo-usdy',
    label: 'Ondo USDY',
    symbols: ['rUSDY', 'USDYc', 'mUSD', 'USDY'],
    names: ['Ondo USDY', 'Rebasing USDY', 'Cooking USDY', 'Mantle USD'],
    // https://docs.ondo.finance/addresses
    addresses: [
      '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
      '0xaf37c1167910ebC994e266949387d2c7C326b879',
      '0xe86845788d6e3e5c2393ade1a051ae617d974c09',
      '0x608593d17A2decBbc4399e4185bE4922F97eD32E',
      '0x5bE26527e817998A7206475496fDE1E68957c5A6',
      '0xab575258d37EaA5C8956EfABe71F4eE8F6397cF3',
      '0x35e050d3C0eC2d29D269a8EcEa763a183bDF9A9D',
      '0xD2B65e851Be3d80D3c2ce795eB2E78f16cB088b2',
      '0x54cD901491AeF397084453F4372B93c33260e2A6',
      '0x20c000000000000000000000D479B9f6eC0ceFf9'
    ],
    opaqueIdentifiers: [
      'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6',
      '0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY',
      '0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc::usdy::USDY',
      'ausdy',
      'USDY-GAJMPX5NBOG6TQFPQGRABJEEB2YE7RFRLUKJDZAZGAD5GFX4J7TADAZ6'
    ]
  },
  {
    id: 'ondo-usdon',
    label: 'Ondo USDon',
    symbols: ['USDon'],
    names: ['Ondo USDon'],
    // Current Ondo Global Markets settlement-token deployments, verified on
    // 2026-09-02: https://docs.ondo.finance/addresses
    addresses: [
      '0xAcE8E719899F6E91831B18AE746C9A965c2119F1',
      '0x1f8955E640Cbd9abc3C3Bb408c9E2E1f5F20DfE6'
    ],
    opaqueIdentifiers: ['ZPFtoCe7WWqG4N3ZFRccS8T9SMBeHsd1Vmgv2i7ondo']
  },
  {
    id: 'mountain-usdm',
    label: 'Mountain Protocol USD',
    symbols: ['wUSDM', 'USDM'],
    names: ['Mountain Protocol USD', 'Wrapped USDM'],
    // https://docs.mountainprotocol.com/legacy-docs/usdm-token
    addresses: [
      '0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C',
      '0x7715c206a14ac93cb1a6c0316a6e5f8ad7c9dc31',
      '0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812',
      '0xa900cbe7739c96d2b153a273953620a701d5442b'
    ]
  },
  {
    id: 'global-dollar',
    label: 'Global Dollar',
    symbols: ['USDG'],
    names: ['Global Dollar'],
    // https://docs.paxos.com/guides/stablecoin/usdg/mainnet
    // Testnet identifiers verified on 2026-09-02:
    // https://docs.paxos.com/guides/stablecoin/usdg/testnet
    addresses: [
      '0xe343167631d89B6Ffc58B88d6b7fB0228795491D',
      '0x004B506865409877C9fA29bfb1ebA929984B9bbC',
      '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
      '0x4ae46a509F6b1D9056937BA4500cb143933D2dc8',
      '0xFFC95faa3d63Cde504a05B567C600B78C0b41892',
      '0xfBb2A78CceEb415b00300925e464C3E44E6e06b0',
      '0xAA6870F78AA8A3427C9fF808c5De901f08B83fcd',
      '0x7E955252E15c84f5768B83c41a71F9eba181802F',
      '0xF0863D7A29a55d0c4263c11bFac754312ff078DF',
      '0x0d54755f5106BfdB43f7a35f5D49a23F940628d1'
    ],
    opaqueIdentifiers: [
      '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH',
      '4F6PM96JJxngmHnZLBh9n58RH4aTVNWvDs2nuwrT5BP7'
    ]
  },
  {
    id: 'paxos-lift-dollar',
    label: 'Paxos Lift Dollar',
    symbols: ['wUSDL', 'USDL'],
    names: ['Lift Dollar', 'Wrapped Lift Dollar'],
    // Retired deployments remain prohibited because their identifiers can
    // recur in historical documentation. The official repository records the
    // contracts and disabled mint/deposit paths; Paxos records the wind-down:
    // https://github.com/paxosglobal/ybs-contract
    // https://www.paxos.com/newsroom/winding-down-usdl-lift-dollar
    addresses: [
      '0xbdC7c08592Ee4aa51D06C27Ee23D5087D65aDbcD',
      '0x7f850b0ab1988dd17b69ac564c1e2857949e4dee',
      '0x7751E2F4b8ae93EF6B79d86419d42FE3295A4559'
    ]
  },
  {
    id: 'usual-eur0',
    label: 'Usual EUR0',
    symbols: ['sEUR0', 'EUR0'],
    names: ['Usual EUR0', 'Savings EUR0'],
    // https://docs.usual.money/resources-and-ecosystem/fact-sheets/usual-products/eur0
    // https://docs.usual.money/resources-and-ecosystem/fact-sheets/usual-products/seur0
    addresses: [
      '0x3c89Cd1884E7beF73ca3ef08d2eF6EC338fD8E49',
      '0x35f43C6604B0DE814ABAa2D94C878BD1F5165478'
    ]
  },
  {
    id: 'world-liberty-usd1',
    label: 'World Liberty Financial USD',
    symbols: ['USD1'],
    names: ['World Liberty Financial USD'],
    // https://github.com/worldliberty/usd1-metadata/blob/main/metadata.json
    // https://github.com/worldliberty/cre-por-dashboard/blob/main/lib/contracts/usd1-token.ts
    addresses: [
      '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d',
      '0x111111d2bf19e43C34263401e0CAd979eD1cdb61',
      '0x20C000000000000000000000111111111E910F0f'
    ],
    opaqueIdentifiers: [
      'TPFqcBAaaUMCSVRCqPaQ9QnzKhmuoLR6Rc',
      'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',
      '0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2'
    ]
  },
  {
    id: 'usual-usd0',
    label: 'Usual USD0',
    symbols: ['rt-bUSD0', 'bUSD0', 'sUSD0', 'USD0a', 'USD0++', 'USD0'],
    names: ['Usual USD', 'Bond USD0', 'Savings USD0', 'USD0 Alpha'],
    // https://tech.usual.money/smart-contracts/contract-deployments
    // https://docs.usual.money/resources-and-ecosystem/fact-sheets/usual-products/busd0
    addresses: [
      '0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5',
      '0x35D8949372D46B7a3D5A56006AE77B215fc69bC0',
      '0x82DCA22b48B14DE38ccf83B03330120c4b8acFe9',
      '0xd861bE82dEe3223CFBEd160791f6550b0704D406',
      '0x2e7fC02bE94BC7f0cD69DcAB572F64bcC173cd81',
      '0x35f1C5cB7Fb977E669fD244C567Da99d8a3a6850',
      '0x758a3e0b1F842C9306B783f8A4078C6C8C03a270',
      '0x2B65F9d2e4B84a2dF6ff0525741b75d1276a9C2F'
    ]
  },
  {
    id: 'falcon-usdf',
    label: 'Falcon USD',
    symbols: ['sUSDf', 'USDf'],
    names: ['Falcon USD', 'Staked USDf'],
    // Current official deployments, verified on 2026-09-02:
    // https://docs.falcon.finance/resources/app-smart-contracts
    addresses: [
      '0xFa2B947eEc368f42195f24F36d2aF29f7c24CeC2',
      '0xc8CF6D7991f15525488b2A83Df53468D682Ba4B0',
      '0xb3b02e4a9fb2bd28cc2ff97b0ab3f6b3ec1ee9d2',
      '0x8210c0634AB8f273806e4b7866E9Db353773c44B'
    ]
  },
  {
    id: 'resolv-usr',
    label: 'Resolv assets',
    symbols: ['wstUSR', 'stUSR', 'USR', 'RLP'],
    caseSensitiveSymbols: ['USR', 'RLP'],
    contextRequiredSymbols: ['RLP'],
    names: ['Resolv USD', 'Staked USR', 'Wrapped Staked USR', 'Resolv Liquidity Pool'],
    // Current official deployments, verified on 2026-09-02:
    // https://docs.resolv.xyz/litepaper/for-developers/smart-contracts
    addresses: [
      '0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110',
      '0x35E5dB674D8e93a03d814FA0ADa70731efe8a4b9',
      '0x2492D0006411Af6C8bbb1c8afc1B0197350a79e9',
      '0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77',
      '0xb1b385542b6e80f77b94393ba8342c3af699f15c',
      '0x6c8984bc7DBBeDAf4F6b2FD766f16eBB7d10AAb4',
      '0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055',
      '0xB67675158B412D53fe6B68946483ba920b135bA1',
      '0x2a52b289ba68bbd02676640aa9f605700c9e5699',
      '0x46c1c168Ca597B9e5423Aa7081a0DCE782caEAab',
      '0x66CFbD79257dC5217903A36293120282548E2254',
      '0x4956b52aE2fF65D74CA2d61207523288e4528f96',
      '0xC31389794Ffac23331E0D9F611b7953f90AA5fDC',
      '0x0a3d8466F5dE586FA5F6DE117301e2f90bCC5c48',
      '0x35533f54740F1F1aA4179E57bA37039dfa16868B'
    ]
  },
  {
    id: 'agora-ausd',
    label: 'Agora Dollar',
    symbols: ['AUSD'],
    caseSensitiveSymbols: ['AUSD'],
    names: ['Agora Dollar'],
    // Current official mainnet and testnet deployments, verified on 2026-09-02:
    // https://docs.agora.finance/developer/contract-deployments
    addresses: [
      '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a',
      '0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC'
    ],
    opaqueIdentifiers: ['AUSD1jCcCyPLybk1YnvPWsHQSrZ46dxwoMniN4N2UEB9']
  },
  {
    id: 'synthetix-susd',
    label: 'Synthetix USD',
    symbols: ['snxUSD', 'sUSD', 'USDx'],
    names: ['Synthetix USD'],
    // sUSD remains part of the official Synthetix V2 documentation. Current
    // V3 proxy deployments and the Arbitrum USDx launch are recorded here:
    // https://docs.synthetix.io/exchange/perps-v2-optimism/how-to-get-susd
    // https://docs.synthetix.io/developer-docs/for-developers/deployment-info/1-main
    // https://docs.synthetix.io/developer-docs/for-developers/deployment-info/10-main
    // https://docs.synthetix.io/developer-docs/for-developers/deployment-info/42161-main
    // https://docs.synthetix.io/developer-docs/for-developers/deployment-info/8453-andromeda
    // https://docs.synthetix.io/developer-docs/for-developers/deployment-info/11155111-main
    // https://blog.synthetix.io/synthetix-v3-deployment-on-arbitrum/
    addresses: [
      '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
      '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
      '0xb2F30A7C980f052f02563fb518dcc39e6bf38175',
      '0x09d51516F38980035153a554c26Df3C6f51a23C3',
      '0xF87E23c41Ce898Ab7640FC3Ce2eb8B11f257e67a'
    ]
  },
  {
    id: 'alchemix-alusd',
    label: 'Alchemix USD',
    symbols: ['alUSD'],
    names: ['Alchemix USD'],
    // Official Ethereum and cross-chain deployment registries, verified on 2026-09-02:
    // https://github.com/alchemix-finance/contract-addresses/blob/dev/alchemix-addresses.json
    // https://github.com/alchemix-finance/deployments
    addresses: [
      '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
      '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
      '0x303241e2B3b4aeD0bb0F8623e7442368FED8Faf3',
      '0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E',
      '0x0E17934B9735D479B2388347fAeF0F4e58b9cc06'
    ]
  },
  {
    id: 'm0-m',
    label: 'M0 M',
    symbols: ['wM', 'M'],
    caseSensitiveSymbols: ['wM', 'M'],
    contextRequiredSymbols: ['M'],
    names: ['M Token', 'Wrapped M Token'],
    // Current official deployments, verified on 2026-09-02:
    // https://docs.m0.org/resources/addresses/m0-platform
    // https://docs.m0.org/protocol/solana
    addresses: [
      '0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b',
      '0x437cc33344a0B27A429f795ff6B469C72698B291'
    ],
    opaqueIdentifiers: [
      'mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo',
      'mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6'
    ]
  },
  {
    id: 'ondo-ousg',
    label: 'Ondo OUSG',
    symbols: ['OUSG'],
    names: ['Ondo OUSG'],
    // Current official deployments, verified on 2026-09-02:
    // https://docs.ondo.finance/addresses
    addresses: [
      '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
      '0xbA11C5effA33c4D6F8f593CFA394241CfE925811'
    ],
    opaqueIdentifiers: [
      'i7u4r16TcsJTgq1kAG8opmVZyVnAKBwLKu6ZPMwzxNc',
      '4F55534700000000000000000000000000000000.rHuiXXjHLpMP8ZE9sSQU5aADQVWDwv6h5p'
    ]
  }
])

export const PROHIBITED_CHAIN_POLICY = Object.freeze({
  id: 'coinbase-base',
  label: 'Coinbase Base',
  chainIds: ['8453', '84531', '84532'],
  brandedNames: ['Base App', 'Base Build', 'Base Account', 'Base Pay'],
  domains: [
    'base.app',
    'base.dev',
    'base.org',
    'basescan.org',
    'base.blockscout.com',
    'base-sepolia.blockscout.com'
  ],
  slugs: ['base-mainnet', 'base-goerli', 'base-sepolia', 'coinbase-base'],
  // Base-specific L1 bridge/system contracts, Base's network-specific L2
  // mintable-token factory, and the two chain-specific batch inboxes from the
  // official registry, verified on 2026-09-02:
  // https://docs.base.org/specifications/reference/base-contracts
  // Shared OP Stack predeploys in the 0x4200... namespace are deliberately not
  // listed because the same address can identify an aligned non-Base network.
  addresses: [
    // Base Mainnet.
    '0x8EfB6B5c4767B09Dc9AA6Af4eAA89F749522BaE2',
    '0x909f6cf47ed12f010A796527f562bFc26C7F4E72',
    '0xd0D07924AdD740a87e41Ca8A0d4CBBf6b074EF71',
    '0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e',
    '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa',
    '0x608d94945A64503E642E6370Ec598e519a2C1E53',
    '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    '0x05cc379EBD9B30BbA19C6fA282AB29218EC61D84',
    '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
    '0x0475cBCAebd9CE8AfA5025828d5b98DFb67E059E',
    '0x73a79Fab69143498Ed3712e519A88a918e1f4072',
    '0x1fE3fdd1F0193Dd657C0a9AAC37314D6B479E557',
    '0xF10122D428B4bc8A9d050D06a2037259b4c4B83B',
    '0xff00000000000000000000000000000000008453',
    // Base Sepolia.
    '0x709c2B8ef4A9feFc629A8a2C1AF424Dc5BD6ad1B',
    '0x2fF5cC82dBf333Ea30D8ee462178ab1707315355',
    '0xd3683e4947A7769603Ab6418eC02f000CE3cF30b',
    '0xD6e2d9D4f1f8865AC983eE848983fb1979429914',
    '0x32cE910d9C6c8F78dc6779c1499aB05F281A054e',
    '0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1',
    '0xC34855F4De64F1840e5686e64278da901e261f20',
    '0x21eFD066e581FA55Ef105170Cc04d74386a09190',
    '0xfd0Bf71F60660E2f608ed56e1659C450eB113120',
    '0xb1efB9650aD6d0CC1ed3Ac4a0B7f1D5732696D37',
    '0x49f53e41452C74589E85cA1677426Ba426459e85',
    '0x0389E59Aa0a41E4A413Ae70f0008e76CAA34b1F3',
    '0xf272670eb55e895584501d564AfEB048bEd26194',
    '0xff00000000000000000000000000000000084532'
  ]
})
