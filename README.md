# ETF Landing Page (Clientelo assignment B)

Lead-generation landing page that compares NYSE-listed S&P 500 ETFs for a Czech retail investor. Built with Nuxt, deployed on Vercel.

- Live page: https://etf-landing-tau.vercel.app/
- Ad versions: [`/ads`](./ads)
- AI conversation exports: [`/ai-log`](./ai-log)

## 1. Assignment in short

Landing page for a Czech retail investor who comes from a mobile ad and gives the page a few seconds. The page has to give value first and collect a contact in exchange. It is judged by one question: could an ad campaign run on it tomorrow?

## 2. Target audience

I picked one person and wrote everything for him:

- Czech, 25 to 40, has a job and some money left every month.
- Already has an account at a broker (XTB, Portu, Trading 212, Degiro) or is about to open one.
- Invests or plans to invest 2 000 to 5 000 CZK a month, long term.
- Has heard that "S&P 500 ETF" is the safe default, but there are several of them and he does not know which one to pick.
- Does not read long articles. He wants a number and a short answer.

I did not target complete beginners (they need to learn what an ETF is first, which is a different page) or active traders (they do not pick funds by fees).

What makes him leave in 3 seconds: a wall of text, a form before any value, anything that looks like a bank or a pushy "finance advisor" page.

## 3. The offer (lead magnet)

**Before any contact:** a fee calculator. He types how much he invests per month and for how many years. The page immediately shows how much the fees of 3 ETFs eat from his money over that time, in CZK. No form, no scrolling.

**In exchange for the contact:** the full comparison of the ETFs (fees, size, dividends, where to buy them from the Czech Republic) with his numbers from the calculator, sent by e-mail. The page shows 3 funds for free, the e-mail has all of them.

**When I ask for the contact:** right under the calculator result. At that moment he has already got a concrete number about his own money, so the request is not the first thing he sees. Asking before the result would kill most visits.

**Form fields:** only e-mail. The amount and years are already known from the calculator, so I do not ask for them again. Name is not needed for sending a PDF.

**After submit:** the thank-you screen shows the full comparison straight away and says the same thing is in his inbox. Nobody should have to leave the page and go check e-mail to get what he was promised.

## 4. Ads

Two versions with two different promises. The first screen of the page uses the same promise as the ad the visitor came from.

|                      | Version A: fees                                                                 | Version B: choice                                                                 |
| -------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Promise              | Fees cost you more than you think                                               | Which S&P 500 ETF should you buy                                                  |
| Headline             | Kolik vám poplatky ETF seberou za 20 let?                                       | Který S&P 500 ETF si vybrat?                                                      |
| Text                 | Spočítejte si to za 10 vteřin. Rozdíl mezi fondy je v řádu desítek tisíc korun. | Tři nejznámější fondy, stejný index, jiné poplatky. Porovnání na jedné obrazovce. |
| Headline on the page | Kolik vám poplatky seberou za 20 let?                                           | Který S&P 500 ETF? Spočítejte si rozdíl.                                          |

The page reads the `?v=a` / `?v=b` URL parameter and switches the headline. Default without the parameter is version A. Full ad texts are in [`/ads`](./ads).

## 5. Page structure

| #   | Section                                                            | What it does for the visitor                                                  | Why here                                                               |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Headline + calculator                                              | Continues the ad promise and gives him something to do in the first 3 seconds | He came for one thing, so it is the first thing on the screen          |
| 2   | Result                                                             | Shows the fee difference in CZK for his own numbers                           | This is the value. Everything before the form has to be earned here    |
| 3   | Form (e-mail only)                                                 | Offers the full comparison with his numbers                                   | Directly after the value, while the number is still on the screen      |
| 4   | Short comparison table (3 ETFs)                                    | Shows the data behind the calculator so the number is believable              | For people who did not fill the form yet and want to check the numbers |
| 5   | How to buy from CZ                                                 | Answers the next question he has: where do I buy it                           | Keeps him on the page instead of googling                              |
| 6   | Second form                                                        | Second chance after the table                                                 | People who scroll past the first form are more convinced here          |
| 7   | Footer: sources, date of data, not investment advice, consent note | Trust and legal minimum                                                       | Nobody converts from a footer, so it is last                           |

## 6. Interactive elements

**Fee calculator** (sections 1 and 2). Two inputs: monthly amount (slider, 500 to 20 000 CZK) and years (5, 10, 20, 30). It shows the end value with each fund and the fee difference between the cheapest and the most expensive one. Every change of the input is an event, so I can see where people stop.

It leads to the contact because the result is only for 3 funds and the full comparison with the same numbers is behind the e-mail.

Dropped ideas:

- Portfolio builder: too many steps for someone with a few seconds on mobile.
- Full comparison table of 10+ ETFs: on a phone it is a scrolling table, not an argument. The short table with 3 funds is enough to make the calculator believable.

## 7. Data and sources

All figures on the page are real and checked by hand against the issuer's page. The data is in [`/data/etfs.json`](./data/etfs.json), each value has its source URL and the date I checked it.

| ETF                      | Ticker | Issuer page |
| ------------------------ | ------ | ----------- |
| SPDR S&P 500 ETF Trust   | SPY    | TODO URL    |
| Vanguard S&P 500 ETF     | VOO    | TODO URL    |
| iShares Core S&P 500 ETF | IVV    | TODO URL    |

Fields per fund: expense ratio (TER), fund size, dividend yield, exchange, date checked. TODO: fill the table with values after verifying them.

Calculation: TODO (assumed yearly return, how fees are applied). The assumed return is shown on the page next to the result.

Keeping it up to date in production: a script that fetches the issuer pages once a month and a check that fails the deploy if a value is missing.

## 8. Measurement

Tool: TODO (PostHog / Plausible), because it is free for this volume and has a funnel view.

| Step | Event           | Fired when                                   |
| ---- | --------------- | -------------------------------------------- |
| 1    | `page_view`     | page loads, with the ad version from the URL |
| 2    | `calc_change`   | first change of a calculator input           |
| 3    | `calc_result`   | result is shown                              |
| 4    | `form_focus`    | user taps into the e-mail field              |
| 5    | `form_submit`   | form sent and lead saved                     |
| 6    | `thankyou_view` | thank-you screen shown                       |

Leads are stored in TODO (Supabase table `leads`: e-mail, amount, years, ad version, created_at).

How I verified it: TODO (opened the page on my phone, went through the whole path, checked the events in the analytics dashboard and the row in the database).

## 9. Expected conversion

Estimate for cold traffic from a mobile ad, calculated step by step:

- 100 % arrive. About 40 % leave without touching anything (bounce on cold mobile traffic is usually 50 to 70 %, the calculator on the first screen should keep it lower).
- 60 % change the calculator. Of those, 90 % see the result (it is instant): 54 %.
- Of those who see the result, 20 % tap into the form: about 11 %.
- Of those who start the form, 70 % submit (one field): about 7.5 %.

**Expected visit-to-lead: 5 to 8 %.** The number depends mostly on how well the ad and the first screen match. I would treat anything under 3 % as a sign that the first screen is wrong, not the form.

This is my estimate from the funnel steps, not a measured number. It needs a few hundred visits to confirm.

## 10. A/B test hypotheses

Ordered by expected impact:

1. **Form before vs. after the result.** Variant: ask for the e-mail to "unlock" the result. Expected: fewer people reach the result, but more of those who do give an e-mail. I expect the current order (result first) to win on leads per visit, but this is the biggest lever on the page, so it has to be tested first. Metric: `form_submit` / `page_view`.
2. **Fee headline vs. choice headline on the first screen.** Same as the two ad versions, but tested on the page with the same ad. Expected: the fee version wins, because a loss in CZK is more concrete than a question. Metric: `calc_change` / `page_view`.
3. **Default values in the calculator vs. empty inputs.** Variant: calculator starts with 3 000 CZK and 20 years already filled and the result visible. Expected: more people see the result, slightly fewer touch the inputs. Metric: `calc_result` / `page_view`.

## 11. Decisions where the assignment was unclear

| Unclear point                                                    | What I decided                                                                                                                                                                                                                     | Why                                                                                                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| "ETFs traded on NYSE" vs. what a Czech investor can actually buy | Compare the NYSE-listed funds as asked, and in the "How to buy from CZ" section say openly that most EU brokers do not sell US-domiciled ETFs to retail clients (missing KID document) and name the UCITS equivalent for each fund | Hiding this would make the page wrong for the target group. Saying it builds trust and is the kind of thing he would google anyway |
| How many funds to compare                                        | 3 on the page, full list in the e-mail                                                                                                                                                                                             | 3 fits one phone screen and leaves a reason to give the e-mail                                                                     |
| What return to assume in the calculator                          | TODO % per year, shown next to the result                                                                                                                                                                                          | Any number is a guess, so I show it instead of hiding it                                                                           |
| Legal text                                                       | One line "not investment advice" and a consent checkbox is not used, the consent is in the text under the submit button                                                                                                            | Keeps the form at one field. TODO: confirm this is enough for GDPR                                                                 |
| Exchange not stated on the issuer page (VOO)                     | Source is the NYSE listing page for that fund; the check script allows nyse.com only for this one field                                                                                                                            | The exchange is a fact about the listing, so the exchange itself is the right source. Every other figure stays issuer-only         |

## 12. How I worked with AI

Tools: Claude Code for implementation, Claude (chat) for discussing the approach before I started. Exports of the Claude Code sessions are in [`/ai-log`](./ai-log).

**Process.** I wrote sections 2 to 6 of this README first, by hand, before opening Claude Code. Then I asked for an implementation plan, not code, and went through it. After that each step of the plan was one session and one commit: data, calculator, form and storage, measurement, design, ads.

**Instructions the agents got.** TODO: short list of the main prompts with a link to the export file for each.

**How I checked the output.**

- Every number in `/data/etfs.json` against the issuer page, by hand.
- The calculator against a spreadsheet with the same inputs.
- The page on a real phone, not only in the browser's mobile view.
- The form submitted for real, then the row in the database and the events in the analytics dashboard.
- The Czech texts read by me. The AI writes correct but stiff Czech, I rewrote TODO.

**Where the AI got it wrong.**

| What it did wrong | How I noticed | What I did |
| ----------------- | ------------- | ---------- |
| TODO              | TODO          | TODO       |

## 13. What is missing

TODO: what I did not finish and how I would do it with more time.

## 14. Run locally

```bash
npm install
npm run dev
```

Environment variables: TODO (`.env.example`).

## Repository layout

```
/ads       both ad versions
/ai-log    exported Claude Code conversations
/data      ETF data with sources and dates
```
