# Ads

Two versions with two different promises. The page headline matches the ad word for word; the page picks it from `?v=a` / `?v=b` (no or unknown parameter → A).

Format: Meta (Facebook / Instagram) feed ad, mobile. The CTA is one of Meta's fixed buttons.

## Version A: fees

**Promise:** the visitor sees what the fee costs them in crowns, not in percent, and gets the number for their own monthly amount in seconds.

| Field      | Text                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Headline   | Kolik vás stojí poplatek ETF? U SPY za 20 let přes 16 000 Kč.                                                |
| Text       | Při 3 000 Kč měsíčně zaplatíte u SPY za 20 let na poplatcích přes 16 000 Kč. Spočítejte si to pro svou částku. |
| CTA        | Zjistit více                                                                                                 |
| Target URL | https://etf-landing-tau.vercel.app/?v=a                                                                      |

The 16 000 Kč is SPY's fees at 3 000 Kč a month for 20 years with 7 % return before fees (16 237 Kč, rounded down). It is computed from `/data/etfs.json`; `shared/content/headline.test.ts` fails if a data change moves it, and then this text must change too.

## Version B: choice

**Promise:** the three best-known S&P 500 ETFs hold the same index, so the visitor learns that the fee (and which version they can buy from CZ) is the only real difference.

| Field      | Text                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Headline   | Který S&P 500 ETF si vybrat? Stejný index, jiné poplatky.                                                                 |
| Text       | SPY, VOO a IVV kopírují stejný index. Liší se poplatkem a tím, kterou verzi koupíte u českého brokera. Porovnání na jedné obrazovce. |
| CTA        | Zjistit více                                                                                                              |
| Target URL | https://etf-landing-tau.vercel.app/?v=b                                                                                   |
