# National cloud and AI champions: South Korea and Singapore (as of 15 November 2026)

Researcher notes on method and reliability (read first):
- Labels used throughout: **[ACTUAL]** reported/operational; **[COMMITTED]** signed contract or budgeted; **[ANNOUNCED]** plan, press release or MoU without confirmed execution; **[ESTIMATE]** analyst/third-party; **[SNIPPET]** fact seen only in a search-result summary, page not opened — verify before quoting.
- The shared web-search budget for this session ran out part-way through. Topics I could not search afterwards are listed under Gaps in each section (notably CSAP, GovTech GCC, Temasek's exact Singtel stake, NHN Cloud, Kakao, Rebellions/FuriosaAI, OpenAI/Stargate Korea, ST Engineering, NSCC, Sea/Grab, Green Data Centre Roadmap, Johor market data). Nothing in "Cited Findings" comes from memory; anything from background knowledge is confined to Gaps and marked UNVERIFIED.
- Several IMDA, EDB, smartnation.gov.sg and aisingapore.org pages returned empty/404 to the fetch tool, so Singapore primary-source coverage is thinner than Korea's.
- Important late-breaking facts a writer could miss: (1) Naver Cloud was **eliminated** from Korea's sovereign AI foundation model project in January 2026; (2) Naver's next HyperCLOVA X generation is being fine-tuned from Nvidia's Nemotron open model (June 2026); (3) most of Naver's overseas sovereign-AI MoUs have stalled (Aug–Sep 2026 Korean press audits); (4) KT has a new CEO (Park Yoon-young, 31 March 2026) who publicly reframed the Microsoft tie-up as "diversification"; (5) the KKR–Singtel STT GDC buyout closed in early September 2026; (6) SEA-LION moved from Meta/Google bases to Alibaba Qwen (v4, late 2025) and then to Nvidia Nemotron (v4.8, 2026).

---

## 1. Overview: HQ, founding, leadership, ownership, structure, geography

### Takeaway
All five main entities are tied to the state or a dominant domestic group rather than being free-standing start-ups: Naver is a founder-led listed platform whose largest disclosed holder is the National Pension Service; KT is a privatised incumbent with Hyundai Motor Group, Wellington and NPS as top holders and a politically sensitive CEO seat; LG AI Research is a group-level lab under the LG holding structure; Singtel is Temasek-majority-owned with Nxera 20% held by KKR; AI Singapore is an NRF-funded programme office, not a company.

### Cited Findings
**Naver / Naver Cloud**
- Naver founded 2 June 1999 (as Naver Comm) by Lee Hae-jin; HQ Naver Green Factory, Bundang-gu, Seongnam; chairman Lee Hae-jin, CEO Choi Soo-yeon; infobox shareholders NPS 9.25%, BlackRock 6.12% (undated on the page — verify against DART). Naver Cloud is the subsidiary that runs infrastructure for the group and sells Naver Cloud Platform; Naver Labs (R&D, est. Jan 2017) is a sister unit — [Wikipedia: Naver Corporation](https://en.wikipedia.org/wiki/Naver_Corporation)
- GAK Chuncheon opened June 2013, described as the first self-built data centre by a Korean web company — [Wikipedia: Naver Corporation](https://en.wikipedia.org/wiki/Naver_Corporation)
- Naver Cloud CEO is Kim Yoo-won; Chae Sun-joo heads Naver's strategic business division (the overseas/sovereign-AI lead); Naver Labs CEO Seok Sang-ok (as of June 2025) — [Korea Herald, 13 Jun 2025](https://www.koreaherald.com/article/10508497)
- Lee Hae-jin is quoted as "NAVER founder and chairman" in the June 2026 Nvidia release, confirming he is back as chairman — [Nvidia newsroom, 7 Jun 2026](https://nvidianews.nvidia.com/news/naver-ai-infrastructure)
- Overseas vehicles: Naver Arabia (MENA regional HQ) and Naver Innovation, a JV formed May 2025 with NHC Innovation (digital arm of Saudi National Housing Company) — [Edaily, 2 Sep 2026](https://en.edaily.co.kr/news/eda202609025527/)
- From Q1 2026 Naver reports three segments: Naver Platform, Financial Platform, and Global Initiatives/"Global Challenge" (C2C, content, enterprise). Enterprise/cloud is therefore no longer broken out as a headline segment — [Naver Q3 2026 press release, 12 Nov 2026](https://www.navercorp.com/media/pressReleasesDetail?seq=10034879)

**KT / KT Cloud**
- KT traces to 1885; incorporated as Korea Telecommunications Authority 10 Dec 1981; privatisation completed 2002; HQ Bundang, Seongnam. Infobox shareholders: Hyundai Motor Group 7.89%, NPS 7.51%, Shinhan Bank 5.64% (undated; body text of the same page gives a stale, conflicting NPS figure) — [Wikipedia: KT Corporation](https://en.wikipedia.org/wiki/KT_Corporation)
- [SNIPPET] June 2026: Wellington raised its stake to 7.58%, becoming second-largest holder after Hyundai Motor Group and passing NPS — [Newstomato](https://newstomato.com/ReadNews.aspx?no=1305026)
- [SNIPPET] For Hyundai Motor Group to be formally recognised as largest shareholder, MSIT review and ministerial approval are needed (a public-interest test under telecom law) — [Newstomato](https://newstomato.com/ReadNews.aspx?no=1305026)
- CEO: Park Yoon-young, elected at the AGM on 31 March 2026 with 97.33% approval (NPS and Hyundai voted in favour); replaced CEO-direct division heads and cut executive-level organisations by about 30% on day one. Reported as a B2B veteran and an internal appointment ("end of external hires") — [The Star, 2 Apr 2026](https://www.thestar.com.my/business/business-news/2026/04/02/ktcorp-names-b2b-veteran-as-new-ceo-signals-shift-to-ai); [Newstomato](https://newstomato.com/ReadNews.aspx?no=1296157)
- KT Cloud CEO: Kim Bong-gyun (Sept 2026) — [Asia Economy, 28 Sep 2026](https://view.asiae.co.kr/en/article/2026092810392071232)
- Analysts speculate KT may re-merge KT Cloud into the parent to speed the "AX" pivot; KT says only that it is "reviewing options" (unconfirmed) — [Digital Today, 6 Jul 2026](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)
- Affiliates relevant to platform strategy: Kbank (16 million customers), BC Card (3.5 million merchants) — [Digital Today, 6 Jul 2026](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)

**LG AI Research**
- Described as "the conglomerate's AI think tank"; co-head Lim Woo-hyung; built EXAONE 1.0 (described as Korea's first multimodal model) in 2021; EXAONE Lab leader Lee Jin-sik — [Korea Herald, 2 Mar 2026](https://www.koreaherald.com/article/10685061); [Korea Times, 11 Jan 2026](https://www.koreatimes.co.kr/amp/business/tech-science/20260111/lgs-k-exaone-delivers-top-benchmark-results)
- Works through "One LG": LG Uplus (Paju AIDC), LG Electronics, LG Energy Solution and LG CNS are the deployment and infrastructure arms — [Korea Herald, 2 Mar 2026](https://www.koreaherald.com/article/10685061)

**Singtel / Nxera**
- Singtel: origins 1879; incorporated March 1992; IPO October 1993 (SGX: Z74); "majority owned" by Temasek; Group CEO Yuen Kuan Moon since 1 Oct 2020; >24,000 staff; associates Bharti Airtel 27.5%, Telkomsel 30%, Globe 47%, AIS 23%; Optus 100% — [Wikipedia: Singtel](https://en.wikipedia.org/wiki/Singtel)
- Nxera: KKR agreed on 18 Sep 2023 to invest up to S$1.1bn (~US$800m) for 20% of Singtel's regional data-centre business at S$5.5bn enterprise value, with an option to go to 25% by 2027 at the pre-agreed valuation; partners Telkom + Medco Power (Batam) and Gulf + AIS (Bangkok) — [Nxera newsroom, 18 Sep 2023](https://nxera-dc.com/about-us/newsroom/kkr-to-acquire-20-stake-in-singtel-regional-data-centre-business)
- Nxera sits in Singtel's Digital InfraCo unit, led by CEO Bill Chang — [Tech Wire Asia, 25 Feb 2026](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)
- STT GDC: KKR-led consortium with Singtel bought the remaining 82% from ST Telemedia for S$6.6bn (EV S$13.8bn); after conversion of preference shares KKR holds 75% and Singtel 25%; closed early Sept 2026 (sources say 2 or 3 Sept); S$5bn sustainability-linked loan underwritten by DBS, OCBC, UOB [SNIPPET for closing details] — [Entrepreneur APAC](https://apac.entrepreneur.com/?p=9937); [Remio](https://www.remio.ai/post/kkr-and-singtel-complete-stt-gdc-acquisition-as-capacity-reaches-780-mw); deal terms confirmed at announcement in [Tech Wire Asia, 25 Feb 2026](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)

**AI Singapore (AISG)**
- Launched May 2017 as a national programme bringing together research institutions and AI companies; backed by NRF, Smart Nation, IMDA, Enterprise SG and EDB; research partners NUS, NTU, SMU, SUTD, A*STAR, SIT, SUSS — [aisingapore.org](https://aisingapore.org/)
- "Supported by Singapore's National Research Foundation and hosted by the National University of Singapore" — [sea-lion.ai](https://sea-lion.ai/)

### Inferences
- Ownership shows two patterns: Korea's champions are private/listed with the state present mainly through NPS and regulatory veto points (KT's CEO appointments and largest-shareholder approval), while Singapore's are directly Temasek-linked (Singtel; ST Telemedia as the seller of STT GDC) or simply public programmes (AISG).
- STT GDC and Nxera are separate vehicles: Nxera is 80% Singtel/20% KKR and consolidated; STT GDC is 25% Singtel/75% KKR, so Singtel is a minority partner there. The "2.8 GW combined design capacity" headline mixes the two.

### Gaps
- Temasek's exact Singtel stake was not confirmed in this session (commonly reported at roughly 50–51%; UNVERIFIED). Whether KKR exercised its option to raise Nxera to 25% is unknown; one 2026 source still says 20%.
- LG AI Research founding date (commonly given as December 2020; UNVERIFIED), headcount, legal status within LG Corp./LG Management Development Institute, and co-head Lee Hong-lak's role were not verified.
- Naver Cloud's establishment date and the former NBP name, and Naver's current DART shareholding table, were not checked. KT's current DART shareholding (Hyundai Motor vs Hyundai Mobis split) not checked.
- AISG's current executive leadership (Leslie Teo is widely cited as senior director of AI Products; UNVERIFIED this session).

---

## 2. Strategic mandate and national role (formal vs informal)

### Takeaway
None of the Korean firms holds a statutory "national champion" mandate; status is conferred project by project (sovereign model competition, National AI Computing Center consortium, GPU allocations) and can be withdrawn — as Naver Cloud's January 2026 elimination shows. In Singapore the mandate is more explicit for AISG (a government programme) and structural for Singtel (state-owned, serving government and regulated sectors with an in-country "sovereign AI cloud").

### Cited Findings
**Korea — policy frame**
- AI Basic Act took effect 22 Jan 2026: creates a National AI Committee chaired by the president as policy control tower, an AI Policy Center and an AI Safety Research Institute; requires government support for R&D, data centres, SMEs; fines capped at KRW 30m with a one-year grace period signalled by MSIT; foreign providers above thresholds must appoint a local agent — [Cooley, 27 Jan 2026](https://www.cooley.com/news/insight/2026/2026-01-27-south-koreas-ai-basic-act-overview-and-key-takeaways)
- [SNIPPET] National Growth Fund: KRW 150tn being built; KRW 30tn to be executed in 2026 of which KRW 6tn for AI (KRW 3tn direct equity, 7tn indirect, 10tn infrastructure, 10tn ultra-low-interest loans across the whole fund) — [Asia Economy, 9 Jan 2026](https://cm.asiae.co.kr/en/article/2026010911075380438)
- Sovereign AI Foundation Model Project ("독파모", MSIT/NIPA): five teams selected Aug 2025 (Naver Cloud, SK Telecom, LG AI Research, NC AI, Upstage per the assignment brief); Stage 1 results 15 Jan 2026 — LG AI Research ranked first; LG, Upstage, SK Telecom advanced; Naver Cloud was eliminated for failing the "from-scratch" sovereignty requirement because its technical report showed vision/audio encoders using an existing open model's frozen weights. Naver said it has its own encoders and used only a small part; MSIT did not consider this as evaluation had closed. Support runs through 2027; design was to narrow to two teams by end-2026; MSIT opened a call for one replacement team — [Inven Global, Jan 2026](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms)
- Stage 2 results 18 Aug 2026: Upstage, SK Telecom, LG AI Research passed; Motif Technologies (the replacement team, which topped the four on Artificial Analysis Intelligence Index with 47) was eliminated on usability. Scoring: benchmarks 40 (avg 22.5), experts 35 (avg 28.8), users 25 (avg 17.6; decisive). Vice Minister Ryu Je-myung: no team was first in every category. MSIT is weighing restructuring to concentrate GPUs/funding on a single model given the gap to the frontier (AAII ~61–63 for leading US models; original goal of 95% of frontier would need ~57) — [Money Today, 18 Aug 2026](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016); [Digital Daily](https://www.ddaily.co.kr/page/view/2026081811112476409)
- [SNIPPET] Timing of the final two-team selection is reported inconsistently: "year-end 2026" (Herald) vs "early 2027" (Economist Korea) — [Herald](https://www.heraldk.com/article/2026081719003163195); [Economist Korea](https://economist.co.kr/article/view/ecn202608180032)
- National AI Computing Center (NAICC): Samsung SDS-led consortium (Naver Cloud, Samsung C&T, Kakao, Samsung Electronics, KT, Clush, Jeonnam Development Corp.) was sole bidder after two failed tenders; preferred partner March 2026, confirmed May 2026 [SNIPPET]; operating company KOACC established June 2026, co-funded by the FSC's National Growth Fund and the consortium; groundbreaking 3 Aug 2026 at Solaseado, Haenam; completion target 2028; interim capacity from a Samsung SDS data centre in 2027 — [Asia Economy, 3 Aug 2026](https://view.asiae.co.kr/en/article/2026080313080357696); [SE Daily, 11 May 2026](https://en.sedaily.com/technology/2026/05/11/samsung-sds-confirmed-to-build-koreas-national-ai-computing)
- NAICC scale [ANNOUNCED]: KRW 2.4tn; 15,000 GPUs by 2028 rising to 50,000 by 2030; 40 MW initially plus another 40 MW — [Herald Corp, 28 Jul 2026](https://mbiz.heraldcorp.com/article/10822626) (an earlier report gave KRW 2.5tn — [Asia Economy, 27 Oct 2025](https://www.asiae.co.kr/en/article/2025102714521487662))
- Nvidia APEC announcement, 30 Oct 2025 [ANNOUNCED]: "over 260,000" GPUs — MSIT up to 50,000 (for NAICC and CSPs NHN Cloud, Kakao, Naver Cloud; initial 13,000 across those three CSPs), Samsung >50,000, SK >50,000, Hyundai 50,000 (~US$3bn), Naver Cloud >60,000. Wording is "plans to deploy"/"is building"; nothing confirmed operational in the release — [Nvidia newsroom, 30 Oct 2025](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure)

**Naver's role**
- Dual positioning: lost the sovereign *model* slot (Jan 2026) but remains inside state compute projects — NAICC consortium member and one of three CSPs receiving government-procured GPUs — [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms); [Nvidia newsroom](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure); [Herald Corp](https://mbiz.heraldcorp.com/article/10822626)

**KT's role**
- NAICC consortium member; named in Nvidia's AI-RAN/6G collaboration; plans to join MSIT's robot foundation model demonstration; positions itself as an "AX platform company" and wants Korea to be an "Asian AX connectivity hub" — [Herald Corp](https://mbiz.heraldcorp.com/article/10822626); [Digital Today, 6 Jul 2026](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)
- KT's dependence on Microsoft drew criticism at a National Assembly audit, which is the stated context for its "open ecosystem"/diversification line — [Edaily, 6 Jul 2026](https://en.edaily.co.kr/news/eda202607065521/)

**LG AI Research's role**
- The most consistently endorsed model developer: first in Stage 1, through Stage 2; model K-EXAONE developed under the government project — [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms); [Money Today](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016)

**Singapore — policy frame**
- Budget 2024 (16 Feb 2024): S$1bn over five years for AI, partly to secure GPU access; target of 15,000 AI professionals — [Techgoondu, 19 Feb 2024](https://www.techgoondu.com/2024/02/19/singapores-new-s1-billion-gambit-to-be-a-pre-eminent-ai-hub/)
- 24 Jan 2026 (MDDI): more than S$1bn for public AI research through 2030 (responsible AI, resource-efficient AI, talent pipeline, industry capability). Same article: S$500m earmarked in 2024 for high-performance compute; AISG received more than S$500m for AI R&D in 2024; SEA-LION backed by S$70m — [Nation Thailand/Bloomberg-syndicated, 26 Jan 2026](https://www.nationthailand.com/business/investment/40061698)
- [SNIPPET] Budget 2026 (12 Feb 2026): new National AI Council chaired by PM Lawrence Wong; national AI "missions" in four sectors; RIE2030 (2026–2030) S$37bn — [EDB round-up](https://www.edb.gov.sg/en/news-and-insights/latest-in-singapores-ai-scene-that-businesses-should-know-a-round-up-from-january-to-march-2026); [POEMS, 20 Feb 2026](https://www.poems.com.sg/market-journal/singapore-budget-2026-ai-strategy-equity-market-boost/)
- National Multimodal LLM Programme launched Dec 2023 with S$70m (IMDA with AISG and A*STAR) — [TechNode, 25 Nov 2025](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/); [IMDA programme page](https://www.imda.gov.sg/how-we-can-help/national-multimodal-llm-programme) (page did not render; cited for location only)

**Singtel/Nxera and AISG roles**
- Singtel markets RE:AI as a "sovereign AI cloud"; early demand "driven mainly by government agencies and research institutions"; data-residency rules for banks/government are cited as the demand driver — [Tech Wire Asia, 25 Feb 2026](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)
- AISG's mission statement is explicitly national: build deep national AI capabilities, grow local talent, develop the ecosystem — [aisingapore.org](https://aisingapore.org/)

### Inferences
- Korea's approach is competitive tournament plus consortium procurement: champion status is contestable and time-limited. The Naver elimination and the Motif "revival then elimination" show the state enforcing a from-scratch definition of sovereignty that conflicts with how most firms (including Naver, now using Nemotron) actually build.
- Singapore does not pursue a from-scratch frontier model; AISG's mandate is regional-language adaptation on top of foreign open models, and the compute mandate is about access (GPU procurement, in-country hosting) rather than ownership of the technology stack.
- The August 2026 MSIT signal about concentrating resources on one model implies the three-team structure may not survive to 2027.

### Gaps
- CSAP (Cloud Security Assurance Program) as a de facto market barrier: not researched this session (search budget). Background (UNVERIFIED): CSAP was re-tiered in 2023 into low/medium/high, with physical network-separation rules relaxed for the low tier, after which foreign hyperscalers obtained low-tier certification; domestic CSPs still dominate medium/high-tier public workloads. Needs sourcing.
- "AI G3"/KRW 100tn pledge wording, the Presidential Council on National AI Strategy's membership, and the 2026 MSIT AI budget were not sourced. The AI Basic Act source names the body "National AI Committee".
- Whether NC AI's Stage 1 elimination reason was disclosed (the source consulted does not mention NC AI; elimination is implied because only three of five advanced).
- NAIS 2.0 (Dec 2023) text and Smart Nation 2.0 (Oct 2024) were not retrievable (404/empty). The IMDA programme page did not render.

---

## 3. Business model, customers, revenue streams, partnerships

### Takeaway
Naver and KT are shifting from selling domestic cloud to selling GPU capacity ("AI factory", GPUaaS, AIDC design-build-operate), with Nvidia central to both; KT layers foreign partners (Microsoft, Palantir, Google) on top, while Naver sells its own stack. Singtel/Nxera is an infrastructure landlord plus GPUaaS reseller built on Nvidia; LG AI Research and AISG are not revenue businesses — they serve group affiliates and the public ecosystem respectively.

### Cited Findings
**Naver / Naver Cloud**
- Enterprise revenue drivers named by the company for FY2025: new GPUaaS revenue and global projects (Saudi "Super App" and digital twin) — [Naver FY2025 press release, Feb 2026](https://www.navercorp.com/en/media/pressReleasesDetail?seq=10034311)
- AI factory business pursued with Brookfield and Nvidia; ~KRW 2tn computing-service supply contract signed with an unnamed initial customer; revenue to be recognised from 1H 2027; CEO says it is pursuing mid/long-term contracts with large customers and "high-growth global AI companies" [COMMITTED, customer undisclosed] — [Naver Q3 2026 press release, 12 Nov 2026](https://www.navercorp.com/media/pressReleasesDetail?seq=10034879); [Womentimes](https://www.womentimes.co.kr/news/articleView.html?idxno=107874)
- Nvidia partnership, 7 Jun 2026 [ANNOUNCED]: DSX-based AI cloud at GAK Sejong starting at 55 MW with a gigawatt-scale goal (no date); next-generation HyperCLOVA X fine-tuned from Nvidia Nemotron 3 Ultra; "Seoul World Model" on Nvidia Cosmos; AI Agent Platform in 2H 2026; Naver is the first Korean member of the Nvidia Nemotron Coalition. No financial terms — [Nvidia newsroom](https://nvidianews.nvidia.com/news/naver-ai-infrastructure)
- [SNIPPET] A July 2026 joint release reportedly raised the Sejong expansion to 200 MW / about 100,000 Nvidia GPUs — [Asia Economy, 8 Jun 2026 (related)](https://view.asiae.co.kr/en/article/2026060809443449390); Money Today also refers to a "Phase 1 200 MW AI factory based on its Sejong data centre" — [Money Today, 13 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/13/2026081216512071169)
- Partners abroad: NHC Innovation (JV), MagnaAI (July 2026 agreement to co-develop sovereign AI infrastructure and security platforms), HanmiGlobal (April 2025 alliance for overseas data-centre projects) in Saudi Arabia; Siam AI in Thailand; Nvidia, Nexus Core Systems, Lloyds Capital and TAQA (PPA) in Morocco — [Edaily, 2 Sep 2026](https://en.edaily.co.kr/news/eda202609025527/); [Korea Herald, 13 Jun 2025](https://www.koreaherald.com/article/10508497)

**KT / KT Cloud**
- Microsoft (announced 28 Sep 2024): five-year "multibillion-dollar" partnership — Korea-customised GPT-4o and possibly Phi models; "Secure Public Cloud" built on Microsoft Cloud for Sovereignty for regulated industries incl. public sector; an AX services company (possible ASEAN expansion); co-innovation centre; KT migrating its own IT workloads to Azure; Copilot for all employees. Exact value not disclosed — [Microsoft Source Asia](https://news.microsoft.com/source/asia/2024/09/28/kt-corporation-and-microsoft-take-giant-step-to-accelerate-ai-innovation-in-korea-2/)
- Delivery [ACTUAL]: "SOTA K" model developed with Microsoft rolled out Sept 2025; Secure Public Cloud launched Nov 2025; Palantir partnership "starting to gain more visibility", particularly with financial-sector customers [from Q4 2025 earnings call, SNIPPET] — [KT earnings call transcript](https://equibles.com/stocks/kt/documents/de854c51-751e-45dd-875e-406b7eae5a8b); [Korea Times, 10 Feb 2026](https://www.koreatimes.co.kr/business/tech-science/20260210/kt-posts-earnings-surge-on-property-gains-ai-cloud-push)
- July 2026 strategy: Park said KT won new customers on Azure and that "many KT cloud resources run on Microsoft Azure"; partner set widened to Google and Palantir (global) and Upstage, Rebellions, Saltlux (domestic); "token factory" (token generation, brokerage, billing using KT's own and partner models) and a stablecoin platform using Kbank/BC Card — [Edaily, 6 Jul 2026](https://en.edaily.co.kr/news/eda202607065521/); [Digital Today, 6 Jul 2026](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)
- KT Cloud's model is increasingly design-build-operate (DBO) for third-party-owned AI data centres (Gunsan with SGC Energy and Hyundai Engineering; Cheongna) plus colocation for "global customers" and an "AI foundry" business — [Asia Economy, 28 Sep 2026](https://view.asiae.co.kr/en/article/2026092810392071232); [Digital Today (Q1 2026)](https://www.digitaltoday.co.kr/en/view/54819/kt-q1-operating-profit-falls-299-percent-on-cost-burden-seeks-rebound-with-ax)

**LG AI Research**
- No disclosed external revenue; strategy is four-fold: foundation-model leadership, expert-oriented AI, wider industrial deployment, trust/safety. LG Uplus plans "end-to-end customized AI services built on Exaone and the Paju AIDC" — [Korea Herald, 2 Mar 2026](https://www.koreaherald.com/article/10685061)
- Nvidia: LG AI Research cited for EXAONE Path (healthcare, built with MONAI) and physical-AI cooperation — [Nvidia newsroom, 30 Oct 2025](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure)
- Open-weight distribution on Hugging Face for research/education; commercial licensing restricted [SNIPPET] — [LG AI Research blog, 9 Apr 2026](https://www.lgresearch.ai/blog/view?seq=641)

**Singtel / Nxera**
- Revenue streams: colocation (DC Tuas >90% committed before opening), GPUaaS (RE:AI, commercialised January 2026), and JV data centres with local telcos/energy firms (Telekom Malaysia in Johor; Telkom/Medco in Batam; Gulf/AIS in Bangkok) — [Tech Wire Asia, 25 Feb 2026](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/); [TelecomTV, FY26 results](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)
- Nvidia: Centre of Excellence for Applied AI announced 24 Feb 2026, to open at Punggol Digital District around June 2026 [ANNOUNCED at time of source]; Nxera runs GB200 systems at ~200 kW per rack — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)
- Funding model: of S$1.2bn FY27 growth capex for data centres/GPUaaS/AI, S$0.7bn is to come from external partners and customer advances — [TelecomTV](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)

**AI Singapore**
- 100 Experiments: 6-month MVP track with co-funding up to S$150,000 per project, matched by the company in cash and in-kind manpower; 3-month POC track delivered through the apprenticeship programme; "over 300 completed AI projects"; named cases include GIC, Sompo, IBM, Continental, SGH, WWF — [AISG 100E page](https://aisingapore.org/?p=17086)
- AI Apprenticeship Programme: 9 months full-time (2 months training + 7 months on real projects), Singapore citizens only, stipend S$3,500–5,500/month; ">200 apprentices graduated" and >90% placement (page last modified May 2025 but content appears to date from ~2023, so the count is stale) — [AISG AIAP page](https://aisingapore.org/the-ai-apprenticeship-programme/)
- SEA-LION is distributed free via Hugging Face, Ollama and "all major hyperscalers"; described as open source for research and commercial use — [sea-lion.ai](https://sea-lion.ai/)
- Model partners over time: Alibaba Cloud (Qwen-SEA-LION-v4; Alibaba supplied technical support and ~100bn SEA-language tokens), Nvidia (Nemotron-SEA-LION v4.8), Google (Gemma-based Guard models) — [TechNode, 25 Nov 2025](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/); [sea-lion.ai](https://sea-lion.ai/)

### Inferences
- Naver's KRW 2tn contract is the first evidence that its Nvidia/Brookfield AI-factory plan has a paying anchor customer; because the customer is unnamed and may be a foreign AI company, it supports a "GPU landlord" reading more than a "sovereign AI exporter" one.
- KT's stack is the most foreign-dependent of the Korean champions: model (SOTA K on GPT-4o), sovereign cloud (Microsoft Cloud for Sovereignty), analytics (Palantir) and own IT (Azure). The domestic-partner list announced in July 2026 looks like political hedging until revenue is shown.
- AISG's base-model switching (Meta → Google → Alibaba → Nvidia) shows low lock-in but also that Singapore's "national" model is a fine-tune whose capabilities are set upstream.

### Gaps
- Customer mix (government vs private share) is not disclosed by Naver Cloud, KT Cloud or Nxera. Brookfield's role and financing terms in Naver's AI factory not found in English primary sources.
- Samsung/Intel partnerships with Naver (earlier AI-chip collaboration), Aramco Digital and SDAIA MoUs: not researched this session; the Saudi partners actually evidenced in 2025–26 sources are MOMRAH (ministry), NHC/NHC Innovation and MagnaAI.
- Mi:dm (KT's own model) details and KT's Google deal terms not found.
- Named SEA-LION adopters beyond GoTo (Sahabat-AI) not confirmed; sea-lion.ai lists none on its landing page.

---

## 4. Technology: data centres, MW, GPUs, cloud stack, models

### Takeaway
Announced capacity far exceeds operating capacity in every case. Operational anchors are modest (Nxera 120 MW in Singapore; KT Cloud's new Gasan site 26 MW; Naver's two GAK campuses), while headline plans run to hundreds of MW or 1 GW. On models, LG's K-EXAONE (236B MoE, open weights) is Korea's best-benchmarked domestic model but sits well below the US frontier; Naver and AISG are now building on Nvidia's Nemotron.

### Cited Findings
**Naver**
- GAK Sejong described as Naver's hyperscale site and the base for the AI factory; 1 GW is "approximately four times the maximum capacity" of GAK Sejong [SNIPPET] (implies roughly 250–270 MW design maximum) — [Asia Economy, 8 Jun 2026](https://view.asiae.co.kr/en/article/2026060809443449390)
- AI factory [ANNOUNCED]: initial 55 MW (2027 start per secondary reports), later reported as 200 MW/~100,000 GPUs, gigawatt-scale ambition undated — [Nvidia newsroom, 7 Jun 2026](https://nvidianews.nvidia.com/news/naver-ai-infrastructure); [Rallies summary](https://rallies.ai/news/naver-to-expand-ai-factories-from-55mw-to-gigawatt-scale-with-nvidia-dsx)
- GPUs [ANNOUNCED Oct 2025]: Naver Cloud "plans to deploy" over 60,000 Nvidia GPUs — [Nvidia newsroom, 30 Oct 2025](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure); [SNIPPET] Naver described ~KRW 1tn GPU investment to secure 60,000 units — [Digital Daily, 5 Nov 2025](https://www.ddaily.co.kr/page/view/2025110511015654112)
- Models: next HyperCLOVA X generation is a fine-tune of Nvidia Nemotron 3 Ultra with Naver's proprietary data — [Nvidia newsroom, 7 Jun 2026](https://nvidianews.nvidia.com/news/naver-ai-infrastructure). [SNIPPET] HyperCLOVA X SEED (open release) cited by Naver at >2 million downloads — [Naver press release](https://navercorp.com/en/media/pressReleasesDetail?seq=33506)
- Sovereignty finding by MSIT (Jan 2026): Naver's project model used frozen open-model weights for video/audio encoders — [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms)
- Thai-specialised model built with Siam AI was released as open source (end-2025) — [Money Today, 13 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/13/2026081216512071169)

**KT / KT Cloud**
- [SNIPPET] Sites: Gasan AI Data Center opened Nov 2025 (26 MW IT, liquid cooling) [ACTUAL]; Guro ~19.8 MW (KT Cloud as operator); Ansan 50 MW under construction, completion 2029; Cheongna (Incheon) 50 MW DBO, completion Q1 2030 [ANNOUNCED] — [W.Media](https://w.media/kt-cloud-commence-construction-of-26mw-hyperscale-data-center-in-seoul/); [DCD (Ansan)](https://datacenterdynamics.com/en/news/kt-breaks-ground-on-50mw-data-center-in-ansan-south-korea); [MTN, 7 Oct 2026](https://news.mtn.co.kr/news-detail/2026100709273543444)
- Gunsan AIDC with SGC Energy [ANNOUNCED 28 Sep 2026]: phase 1 60 MW, groundbreaking end-2026, operation Q1 2028, expandable to 300 MW "in line with demand"; liquid cooling on all floors; designed for Nvidia Vera Rubin; KT Cloud is DBO partner, not owner. KT Cloud target: 1 GW by 2031 — [Asia Economy](https://view.asiae.co.kr/en/article/2026092810392071232)
- Group plan (6 Jul 2026) [ANNOUNCED]: about KRW 5tn to add 1 GW of AIDC "based on actual demand"; KRW 12tn over three years for security/IT/network (KRW 4tn security+IT, KRW 8tn network); KRW 1tn subsea cables (the article headline totals KRW 18tn) — [Digital Today](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)
- Sovereign cloud capability is Microsoft's: Secure Public Cloud is built on Microsoft Cloud for Sovereignty — [Microsoft Source Asia](https://news.microsoft.com/source/asia/2024/09/28/kt-corporation-and-microsoft-take-giant-step-to-accelerate-ai-innovation-in-korea-2/)

**LG AI Research**
- K-EXAONE (Jan 2026): 236B parameters, mixture-of-experts with ~23B active; hybrid sliding-window/global attention; 70% lower memory/compute vs EXAONE 4.0; runs on A100-class GPUs; topped 10 of 13 Stage 1 benchmarks (avg 72, highest of five consortia); Artificial Analysis Intelligence Index 32 — first in Korea, seventh globally among open-weight models (top 10 otherwise six Chinese, three US); reached No. 2 on Hugging Face trending; five LG models on Epoch AI's notable-models list — [Korea Times, 11 Jan 2026](https://www.koreatimes.co.kr/amp/business/tech-science/20260111/lgs-k-exaone-delivers-top-benchmark-results)
- EXAONE 4.5 (9 Apr 2026): LG's first open-weight vision-language model (33B on Hugging Face), proprietary visual encoder on EXAONE 4.0; LG-reported results ahead of GPT-5 mini on OCR/document benchmarks and of Qwen 3 VL 32B on Korean vision-language tests; long-context score >3x the previous version. All benchmarks are self-reported — [LG AI Research blog](https://www.lgresearch.ai/blog/view?seq=641)
- [SNIPPET, single source, uncorroborated] K-EXAONE 2.0 with 750B parameters reported released around 1 Aug 2026 — [ProPakistani, 1 Aug 2026](https://propakistani.pk/2026/08/01/lg-releases-south-koreas-largest-ai-model-with-750-billion-parameters/amp/)
- Group compute [ANNOUNCED]: LG Uplus Paju AIDC, 200 MW, up to 120,000 GPUs, completion 2027 — [Korea Herald, 2 Mar 2026](https://www.koreaherald.com/article/10685061)

**Other Korean models (Stage 2, Aug 2026)**
- Upstage: Solar Open 2 with up to 1M-token context; "sovereign full stack" running on FuriosaAI NPUs and linked to the Daum portal. SK Telecom: A.X K1 supplied to defence; A.X K2 reportedly reached gold-medal score on IMO 2026 problems [SNIPPET for K2/Solar details] — [Money Today, 18 Aug 2026](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016); [Digital Daily](https://www.ddaily.co.kr/page/view/2026081811112476409)

**Singtel / Nxera**
- Singapore [ACTUAL]: DC Tuas (58 MW, AI-ready) opened 9 Feb 2026 (operations from January); total Singapore footprint 120 MW; >90% committed pre-opening — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/); [TelecomTV](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)
- Regional: operational plus pipeline capacity "200 MW today", expected to exceed 400 MW mid-term; 40–50% for high-density AI; Johor and Batam capacity due 2H 2026 — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)
- [SNIPPET] Johor (TM Nxera JV, Iskandar Puteri): 64 MW initial, scalable to 200 MW; 280 MW electricity supply agreement with TNB (power contract, not IT load); first building topped out — [Developing Telecoms](https://developingtelecoms.com/telecom-technology/data-centres-networks/20106-tm-nxera-tops-out-first-ai-data-centre-in-johor.html); [W.Media](https://w.media/tm-nxera-tops-out-ai-data-center-in-johor/)
- STT GDC (separate, 25% Singtel): 2.3 GW design capacity across 12 markets (Feb 2026); [SNIPPET] operational capacity 780 MW and pipeline >1.7 GW at closing — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/); [Remio](https://www.remio.ai/post/kkr-and-singtel-complete-stt-gdc-acquisition-as-capacity-reaches-780-mw)
- Group claim of ~2.8 GW design capacity combines Nxera and STT GDC — [TelecomTV](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)

**AI Singapore — SEA-LION**
- v4 (Qwen-SEA-LION-v4, Oct–Nov 2025): built on Alibaba's Qwen3-32B; ranked first among open-source models under 200B parameters on SEA-HELM at release (no scores given); earlier versions used Meta's model family — [TechNode, 25 Nov 2025](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/)
- 2026 line: v4.5 onward "built for agentic workflows"; Nemotron-SEA-LION v4.8 is its first mixture-of-experts and first Nemotron-based suite (with Nvidia); image+text input; 11+ SEA languages; quantised versions for laptops/edge; Gemma-SEA-LION-Guard-v2 (21 Oct 2026), SEA-HELM Audio (23 Oct 2026), SEA-GULL and SEA-CAST speech models (27 Oct 2026) — [sea-lion.ai](https://sea-lion.ai/)
- [SNIPPET] Third-party listing describes "SEA-LION v4.8 120B-A12B" — [LLM Reference](https://www.llmreference.com/model/sea-lion-v4.8-120b-a12b)
- v4 enhanced for Burmese, Filipino, Indonesian, Malay, Tamil, Thai, Vietnamese — [Nation Thailand, 26 Jan 2026](https://www.nationthailand.com/business/investment/40061698)

### Inferences
- "Sovereign" has three different technical meanings in these cases: weights trained from scratch domestically (MSIT test; LG, SKT, Upstage), domestically operated infrastructure running foreign technology (KT Secure Public Cloud, Singtel RE:AI, Naver's Nemotron-based HyperCLOVA X), and regional-language fine-tunes of foreign open models (SEA-LION, Naver's Thai model).
- KT Cloud's and Naver's GW-scale numbers are demand-contingent plans; committed, dated capacity is closer to 26 MW (Gasan, live), 60 MW (Gunsan phase 1, 2028) and 55 MW (Naver Sejong first phase, 2027).

### Gaps
- GAK Chuncheon/GAK Sejong official MW and server counts, HyperCLOVA X version history (incl. SEED sizes/licence, THINK), and Naver's currently installed GPU count were not verified from primary sources.
- EXAONE 3.5, 4.0 and Deep details (dates, sizes, licence terms) were not retrieved; only referenced indirectly. K-EXAONE 2.0 needs confirmation from lgresearch.ai or Korean press.
- KT Cloud's total operating MW and number of data centres; KT's Mi:dm model specifications.
- RE:AI GPU count/types beyond GB200, and Nxera's operating MW in Thailand/Indonesia/Malaysia as of Nov 2026.
- SEA-LION v3/v3.5 base models (reported elsewhere as Gemma/Llama; UNVERIFIED this session) and current SEA-HELM leaderboard position.

---

## 5. Financials (actual vs committed vs announced)

### Takeaway
Reported cloud/AI revenues are small relative to announced capex: Naver's enterprise line was KRW 588bn in FY2025 against group revenue of KRW 12tn; KT Cloud was just under KRW 1tn; Nxera's revenue is in the hundreds of millions of Singapore dollars. AI infrastructure spending is already depressing Naver's margin (Q3 2026 operating profit −20.9% YoY).

### Cited Findings
**Naver [ACTUAL unless noted]**
- FY2025: revenue KRW 12.035tn (+12.1%), operating profit KRW 2.2081tn (+11.6%); Q4 2025 revenue KRW 3.1951tn, operating profit KRW 610.6bn. Enterprise segment FY2025 KRW 587.8bn (+4.3%); Q4 KRW 171.8bn (−3.2%; +16.6% excluding LY settlement effects) — [Naver press release](https://www.navercorp.com/en/media/pressReleasesDetail?seq=10034311)
- FY2025 net profit KRW 1.820tn (−5.8%) on goodwill impairment and tax; Nomura flagged margin pressure from the 60,000-GPU purchase [SNIPPET] — [Morningstar/Dow Jones, 5 Feb 2026](https://www.morningstar.com/news/dow-jones/2026020516590/naver-has-record-year-despite-weaker-final-quarter-update)
- Q2 2026: revenue KRW 3.3888tn, operating profit KRW 520.3bn (−0.2% YoY) [SNIPPET] — [Edaily, Aug 2026](https://en.edaily.co.kr/news/eda202608075085/)
- Q3 2026 (12 Nov 2026): revenue KRW 3.4724tn (+10.7%), operating profit KRW 451.3bn (−20.9%; margin 13.0%, down 5.2 pts) attributed to AI-related investment in infrastructure, content and offline data. Segments: Naver Platform KRW 1.9484tn, Financial Platform KRW 487.7bn, Global Challenge KRW 1.0364tn (enterprise "steady", incl. Saudi digital twin). No stand-alone enterprise/cloud figure — [Naver press release](https://www.navercorp.com/media/pressReleasesDetail?seq=10034879)
- Consensus before the release had been operating profit of ~KRW 490–500bn, so the result missed [ESTIMATE] — [Korea Times, 21 Oct 2026](https://www.koreatimes.co.kr/business/companies/20261021/is-ai-investment-slowing-navers-profits)
- [COMMITTED] ~KRW 2tn AI-factory computing supply contract; revenue from 1H 2027 — [Naver press release](https://www.navercorp.com/media/pressReleasesDetail?seq=10034879)

**KT / KT Cloud**
- FY2025 [ACTUAL]: KT revenue KRW 28.24tn (+6.9%); operating profit KRW 2.47tn (+205%, mainly property development gains); KT Cloud revenue +27.4% to KRW 997.5bn; Q4 hit by costs of the security breach disclosed in September 2025 — [Korea Times, 10 Feb 2026](https://www.koreatimes.co.kr/business/tech-science/20260210/kt-posts-earnings-surge-on-property-gains-ai-cloud-push); [AlphaStreet](https://news.alphastreet.com/kt-corp-annual-operating-profit-surges-205-as-ai-and-real-estate-drive-growth/)
- Q1 2026 [ACTUAL, SNIPPET]: revenue KRW 6.78tn (−1.0%), operating profit KRW 482.7bn (−29.9%) on hacking-related compensation; KT Cloud revenue flat YoY — [Digital Today](https://www.digitaltoday.co.kr/en/view/54712/kt-first-quarter-operating-profit-482-7-billion-won-down-29-9-percent-year-on-year); [Asia Economy, 12 May 2026](https://www.asiae.co.kr/en/article/2026051214103506635)
- [ANNOUNCED] KRW 5tn for 1 GW AIDC; KRW 12tn security/IT/network; KRW 1tn subsea — [Digital Today, 6 Jul 2026](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)
- Microsoft deal value: "multibillion-dollar" (Microsoft) / "multi-trillion-won" (Korean press); not disclosed precisely — [Microsoft](https://news.microsoft.com/source/asia/2024/09/28/kt-corporation-and-microsoft-take-giant-step-to-accelerate-ai-innovation-in-korea-2/); [Edaily](https://en.edaily.co.kr/news/eda202607065521/)

**LG AI Research**
- No stand-alone financials located. Government project resources (GPUs, data, budget) were not quantified in the sources consulted — [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms)

**Singtel / Nxera (FY ends 31 March)**
- FY26 [ACTUAL]: group revenue S$14.26bn (stable); net profit S$5.61bn incl. S$2.84bn exceptional gains (mainly Airtel stake sales); underlying net profit S$2.77bn (+12%); net debt S$8.7bn; Digital InfraCo revenue +12%, EBIT +24%; Nxera revenue +16%. Nxera EBITDA not disclosed in the source. FY27 guidance: capex ~S$3.0bn, incl. S$1.2bn for data centres/GPUaaS/AI (S$0.7bn externally funded); EBIT growth low-to-mid single digit — [TelecomTV](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)
- [SNIPPET, conflicting] Nxera FY26 revenue S$378m (+15.8%) per The Edge; S$486m (+12%) and EBIT S$81m (+24%) are the Digital InfraCo totals; a blog attributes S$486m to Nxera. FY26 capex ~S$2.5bn. Verify against the SGX slides — [SGX FY26 slides](https://links.sgx.com/1.0.0/corporate-announcements/7DAX544PTU347WL1/889653_FY26%20slides.pdf); [blog analysis](https://tjjlearningjournal.blogspot.com/2026/05/decoding-singtels-fy26-earnings-release.html)
- [ANNOUNCED guidance, SNIPPET] Nxera EBITDA expected to grow >20% a year over four years (1H FY26 commentary); Singtel's own funding share of the STT GDC deal S$740m — [The Edge Singapore (mirror)](https://testing.dev.theedgesingapore.com/capital/results/one-gains-and-operational-improvements-lift-singtels-1hfy2026-176-y-o-y-34-billion)
- STT GDC [ACTUAL, closed Sept 2026]: S$6.6bn for 82%; EV S$13.8bn — [Entrepreneur APAC](https://apac.entrepreneur.com/?p=9937)

**AI Singapore / Singapore public funding**
- [COMMITTED] S$70m for the National Multimodal LLM Programme (Dec 2023); >S$500m for AISG AI R&D (2024); S$500m for national HPC/AI compute (2024); >S$1bn public AI research through 2030 (Jan 2026) — [Nation Thailand, 26 Jan 2026](https://www.nationthailand.com/business/investment/40061698); [TechNode](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/)

**Korea public funding**
- [ANNOUNCED] NAICC KRW 2.4tn; [SNIPPET] National Growth Fund KRW 150tn total, KRW 6tn for AI in 2026 — [Herald Corp](https://mbiz.heraldcorp.com/article/10822626); [Asia Economy](https://cm.asiae.co.kr/en/article/2026010911075380438)

### Inferences
- The S$1bn (2024), S$500m compute, >S$500m AISG and >S$1bn (2026) Singapore figures partly overlap or re-package one another; they should not be summed.
- Naver's Q3 2026 margin drop is the first clear financial evidence of the cost of the sovereign-AI/AI-factory strategy, arriving before any AI-factory revenue (1H 2027).
- KT's FY2025 profit jump is property-driven, not cloud/AI-driven; KT Cloud's flat Q1 2026 suggests the 27% growth of 2025 has not continued.

### Gaps
- Naver Cloud stand-alone revenue/operating profit for FY2025 (audit report) and Naver's FY2025/2026 capex; Q1 2026 Naver figures; Q2–Q3 2026 KT and KT Cloud results; KT's 2026 half-year AI/IT revenue.
- Nxera EBITDA and capex in absolute terms; RE:AI revenue; Singtel 1H FY27 results (expected mid-November 2026) not found.
- AISG's annual budget and the split of the >S$500m; first-phase AISG funding (commonly cited as S$150m over five years from 2017; UNVERIFIED).
- Budget and GPU allocation per team in Korea's sovereign model project.

---

## 6. Achievements and operating international deals

### Takeaway
Verified operating results are narrower than the publicity: Naver has two real overseas references (Saudi digital twin, phases 1 and 2; a completed paid Thai model project), KT has delivered the Microsoft-based products it promised, LG has the top-ranked Korean open model, Nxera has filled its new Singapore capacity, and AISG has 300+ industry projects and a model line used by at least one large regional company.

### Cited Findings
**Naver**
- Saudi Arabia [ACTUAL]: won a digital twin platform contract from the Ministry of Municipal and Rural Affairs and Housing in 2023; build-out for Mecca, Medina and Jeddah completed June 2025; definitive Phase 2 contract signed May 2026 (value and Riyadh/Dammam timelines undisclosed). JV Naver Innovation set up May 2025; NHC announced a SAR 200m-scale (approx. KRW 70bn; the source text is garbled, verify) project framework for Naver Innovation, which Naver says is overall project scale, not contracted value — [Money Today, 13 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/13/2026081216512071169)
- Saudi revenue is visible in accounts: Saudi super app and digital twin cited as enterprise revenue contributors in FY2025 and Q3 2026 — [Naver FY2025 release](https://www.navercorp.com/en/media/pressReleasesDetail?seq=10034311); [Naver Q3 2026 release](https://www.navercorp.com/media/pressReleasesDetail?seq=10034879)
- Thailand [ACTUAL]: "Thai sovereign AI model and tourism AI agent" project with Siam AI (announced May 2025) completed end-2025 — Naver's first paid sovereign-AI project in Southeast Asia — [Money Today, 13 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/13/2026081216512071169); [Korea Times, 23 May 2025](https://www.koreatimes.co.kr/amp/business/tech-science/20250523/naver-enters-thai-ai-market-backed-by-nvidia-partnership)
- Domestic: member of the NAICC consortium; recipient CSP for government-procured GPUs — [Herald Corp](https://mbiz.heraldcorp.com/article/10822626); [Nvidia](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure)

**KT**
- Delivered [ACTUAL]: SOTA K (Sept 2025), Secure Public Cloud (Nov 2025), Gasan AI data centre (Nov 2025); KT Cloud revenue KRW 997.5bn in 2025 with growth from global customers' data-centre usage — [KT earnings call](https://equibles.com/stocks/kt/documents/de854c51-751e-45dd-875e-406b7eae5a8b); [AlphaStreet](https://news.alphastreet.com/kt-corp-annual-operating-profit-surges-205-as-ai-and-real-estate-drive-growth/)
- CEO claim (not quantified): new customers won on Azure; Palantir traction in financial sector — [Edaily, 6 Jul 2026](https://en.edaily.co.kr/news/eda202607065521/)

**LG AI Research**
- K-EXAONE first among five consortia in Stage 1 (10 of 13 benchmarks); seventh among open-weight models worldwide on Artificial Analysis (32 points; OpenAI's open model at 33); passed Stage 2 in Aug 2026 with recognition for international collaboration, agentic AI and safety focus — [Korea Times](https://www.koreatimes.co.kr/amp/business/tech-science/20260111/lgs-k-exaone-delivers-top-benchmark-results); [Korea Herald](https://www.koreaherald.com/article/10685061); [Money Today](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016)

**Singtel / Nxera**
- DC Tuas >90% committed before opening and "almost fully contracted"; RE:AI commercialised Jan 2026 with "strong customer take-up" (company characterisation); medium-term ROIC target reached (11.1%); S$3.9bn asset recycling in FY26 — [TelecomTV](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)
- STT GDC acquisition closed Sept 2026, described at signing as Singapore's largest M&A deal in four years — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)

**AI Singapore**
- Over 300 completed industry AI projects under 100E; >200 AIAP graduates with >90% placement (dated figure) — [AISG 100E](https://aisingapore.org/?p=17086); [AISG AIAP](https://aisingapore.org/the-ai-apprenticeship-programme/)
- SEA-LION adopted by Indonesia's GoTo; v4 topped SEA-HELM among open models under 200B parameters at release — [Nation Thailand](https://www.nationthailand.com/business/investment/40061698); [TechNode](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/)

### Inferences
- Naver's exportable product so far is digital-twin/urban-platform software and bespoke model work, not sovereign cloud or data centres: no Naver-built or Naver-operated overseas AI data centre is confirmed operating as of Nov 2026.
- AISG's measurable impact is strongest in talent and applied projects; SEA-LION's impact is ecosystem-level (benchmarks, safety models, speech models) rather than commercial.

### Gaps
- Public-sector cloud market shares (Naver Cloud vs KT Cloud vs NHN Cloud) — no sourced figures obtained. HyperCLOVA X enterprise customer counts not obtained.
- Contract values for Saudi phases 1 and 2. Secure Public Cloud customer names/count. RE:AI customer names.
- Up-to-date AIAP graduate totals and SEA-LION download counts.

---

## 7. National ecosystems (shorter coverage of other actors)

### Takeaway
Korea's ecosystem is conglomerate- and Nvidia-centred, with the state acting as tournament organiser, anchor GPU buyer and co-investor through the National Growth Fund; Singapore's is state-capital-centred (Temasek-linked telco and data-centre assets, NRF-funded research programmes) and outward-looking, relying on foreign models and on neighbouring countries for power and land.

### Cited Findings
**Korea**
- SK Telecom/SK Group: finalist in the sovereign model project (A.X K1/K2; K1 supplied to defence) — [Money Today](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016). SK–AWS Ulsan AI data centre: announced June 2025, groundbreaking 29 Aug 2025, 100 MW (40 MW phase by Nov 2027, full by Feb 2029 per 2025 reporting), AWS under a 15-year arrangement [SNIPPET] — [Asia Economy, 15 Jun 2025](https://www.asiae.co.kr/en/article/2025061515511823958). Chairman Chey Tae-won said on 11 Sep 2026 that an expansion "approaching 900 MW" is under negotiation with global tech firms (not a completed agreement); SK Telecom roadmap of 2 GW Nvidia DSX AI factories and 5 GW from 2029 [ANNOUNCED, secondary source] — [Remio](https://www.remio.ai/post/sk-group-ai-data-center-plan-turns-ulsan-into-a-gigawatt-scale-test)
- Samsung SDS: lead of the NAICC consortium; will provide interim compute from its own data centre in 2027; Samsung building a >50,000-GPU semiconductor AI factory [ANNOUNCED] — [Asia Economy, 3 Aug 2026](https://view.asiae.co.kr/en/article/2026080313080357696); [Nvidia](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure)
- NHN Cloud and Kakao: with Naver Cloud, designated CSPs for the government's GPU purchase (initial 13,000 GPUs across the three); Kakao is also an NAICC consortium member — [Nvidia](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure); [Herald Corp](https://mbiz.heraldcorp.com/article/10822626)
- Upstage: finalist; Solar Open 2; runs on FuriosaAI NPUs; linked with the Daum portal; named KT partner — [Money Today](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016); [Digital Today](https://www.digitaltoday.co.kr/en/view/78454/kt-bets-on-ax-with-18-trillion-won-investment-over-three-years-to-grow-aidc-and-token-factory)
- AI chips: FuriosaAI NPUs used in Upstage's stack; Rebellions is a KT partner and signed (Feb 2025) an Arabic-LLM MoU with Naver that shows no progress; NAICC will include an R&D zone for domestic AI semiconductors — [Money Today, 18 Aug 2026](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016); [Money Today, 13 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/13/2026081216512071169); [Asia Economy](https://view.asiae.co.kr/en/article/2026080313080357696)
- LG group infrastructure: Paju AIDC 200 MW/120,000 GPUs by 2027 [ANNOUNCED] — [Korea Herald](https://www.koreaherald.com/article/10685061)
- Research institutions in the Nvidia programme: KISTI (HANGANG supercomputer centre of excellence), ETRI and Yonsei (AI-RAN/6G) — [Nvidia](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure)
- State procurement shift at NAICC: after two failed tenders, the structure moved toward private control with National Growth Fund co-funding (commentary) — [Remio analysis](https://www.remio.ai/post/koreas-national-ai-computing-center-breaks-ground-after-a-policy-retreat); [Asia Economy](https://view.asiae.co.kr/en/article/2026080313080357696)

**Singapore**
- Governance: National AI Council chaired by the PM and sector AI missions (Budget 2026) [SNIPPET]; RIE2030 S$37bn [SNIPPET] — [EDB round-up](https://www.edb.gov.sg/en/news-and-insights/latest-in-singapores-ai-scene-that-businesses-should-know-a-round-up-from-january-to-march-2026)
- Research base: AISG's partners are NUS (host), NTU, SMU, SUTD, A*STAR, SIT, SUSS; A*STAR is a partner in the multimodal LLM programme — [aisingapore.org](https://aisingapore.org/); [TechNode](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/)
- State capital: ST Telemedia (Temasek-owned) sold STT GDC to KKR/Singtel; Singtel itself is Temasek-majority; financing by the three local banks — [Entrepreneur APAC](https://apac.entrepreneur.com/?p=9937); [Wikipedia: Singtel](https://en.wikipedia.org/wiki/Singtel)
- Spillover: Nxera's Johor campus is positioned as part of an "AI grid" linked to Singapore by subsea cable, with Batam also due in 2H 2026; Singtel says market power availability "is already constrained" — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)
- Regional demand: Indonesia's GoTo adopted SEA-LION — [Nation Thailand](https://www.nationthailand.com/business/investment/40061698)

### Inferences
- Korea: champions are organically grown private firms that the state is steering and co-financing; the state creates demand (GPU purchases, NAICC, model tournament) but has had to concede control to private consortia to get projects built.
- Singapore: champions are state-created or state-transformed (privatised telco still majority state-owned; AISG a programme office), and the model is to orchestrate foreign technology and capital (KKR, Nvidia, Alibaba, Google) around state-linked assets.

### Gaps
- Not researched (search budget exhausted): OpenAI/Stargate Korea (Samsung/SK MoUs, Oct 2025) status; NHN Cloud and Kakao detail; Rebellions/FuriosaAI funding and products; KAIST/SNU roles; ST Engineering; GIC; GovTech's Government on Commercial Cloud (GCC) and its hyperscaler-based model; NSCC supercomputers; Sea/Grab AI activity; Green Data Centre Roadmap (background, UNVERIFIED: launched May 2024, at least 300 MW of additional capacity on top of roughly 1.4 GW installed, with more tied to green energy); Johor data-centre market figures; data-sovereignty/classification rules in both countries.

---

## 8. Critical assessment

### Takeaway
The evidence as of November 2026 undercuts the strongest versions of each champion narrative: Naver's sovereign-AI export pipeline is mostly unexecuted MoUs and its own "sovereign" model failed the government's sovereignty test; KT's sovereign cloud is Microsoft technology; Korea's best domestic models score about half the frontier's index value; and Singapore's capacity growth depends on scarce domestic power and on offshore sites.

### Cited Findings
**Naver — limits of the export claims**
- Korean press audit (Aug 2026): of the Southeast Asia initiatives, "only the Thailand project survived"; Philippines (Converge ICT MoU, May 2024) has "no ongoing collaboration"; Indonesia (Telkom/Cisco, March 2023) no progress; Arabic LLM MoU with Rebellions (Feb 2025) no progress; Morocco 40 MW phase 1 (targeted for 2025) "has not progressed" — [Money Today, 13 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/13/2026081216512071169); [Money Today, 12 Aug 2026](https://www.mt.co.kr/en/tech/2026/08/12/2026081209070777838)
- Morocco as announced (June 2025): 500 MW consortium with Nvidia, Nexus Core Systems, Lloyds Capital, TAQA PPA; phase 1 to start Q4 2025 and complete by year-end 2025; no investment amount or binding terms disclosed — [Korea Herald, 13 Jun 2025](https://www.koreaherald.com/article/10508497); [Korea JoongAng Daily, 13 Jun 2025](https://www.koreajoongangdaily.com/business/naver-to-build-ai-hub-in-morocco-targeting-gdpr-bound-markets/12080961)
- Saudi data centre: Naver Arabia's website describes a sovereign AI cloud "currently under construction in Saudi Arabia", but a Naver Cloud representative said it "is still under discussion, and nothing has been decided at this time"; CEO Choi described "very concrete discussions" on the Q2 2026 call — [Edaily, 2 Sep 2026](https://en.edaily.co.kr/news/eda202609025527/)
- The June 2026 Nvidia release refers to Naver's "sovereign AI infrastructure in Europe and the Middle East" as existing without naming sites or capacity — [Nvidia](https://nvidianews.nvidia.com/news/naver-ai-infrastructure)
- Sovereignty of the model itself: eliminated from the state project over frozen open-source encoder weights (Jan 2026), then announced that next-generation HyperCLOVA X will be fine-tuned from Nvidia's Nemotron 3 Ultra (June 2026) — [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms); [Nvidia](https://nvidianews.nvidia.com/news/naver-ai-infrastructure)
- Financial cost: Q3 2026 operating profit −20.9% on AI investment; AI-factory revenue only from 1H 2027 — [Naver Q3 2026 release](https://www.navercorp.com/media/pressReleasesDetail?seq=10034879)

**KT — dependence on Microsoft**
- Secure Public Cloud is built on Microsoft Cloud for Sovereignty; SOTA K on customised GPT-4o; KT's own workloads migrated to Azure — [Microsoft](https://news.microsoft.com/source/asia/2024/09/28/kt-corporation-and-microsoft-take-giant-step-to-accelerate-ai-innovation-in-korea-2/)
- Dependence criticised at a National Assembly audit; new CEO: "diversification" rather than "going all-in on Microsoft", while "our basic stance on cooperation with Microsoft is not changing" — [Edaily, 6 Jul 2026](https://en.edaily.co.kr/news/eda202607065521/)
- Execution risks: 2025 security breach and compensation costs (Q4 2025, Q1 2026 profit −29.9%); KT Cloud revenue flat in Q1 2026; CEO turnover and reorganisation in March–April 2026 — [Asia Economy, 12 May 2026](https://www.asiae.co.kr/en/article/2026051214103506635); [Korea Times](https://www.koreatimes.co.kr/business/tech-science/20260210/kt-posts-earnings-surge-on-property-gains-ai-cloud-push)

**Korea — model competitiveness**
- MSIT acknowledges Korean models "still trail" frontier models. Aug 2026: best Korean score on AAII 47 (Motif) vs 61–63 for leading US models; target of 95% of frontier would need ~57; ministry considering concentrating resources on one model — [Money Today, 18 Aug 2026](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016); [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms)
- Jan 2026: K-EXAONE at 32 on AAII; the open-weight top 10 was six Chinese and three US models — [Korea Times](https://www.koreatimes.co.kr/amp/business/tech-science/20260111/lgs-k-exaone-delivers-top-benchmark-results)
- Process credibility: Upstage and SK Telecom were criticised for citation practices in Stage 1 technical reports (treated as an ethics issue, not disqualifying); the top benchmark performer (Motif) was eliminated in Stage 2 on user-evaluation scores from 49 experts and ~185 members of the public — [Inven Global](https://www.invenglobal.com/articles/20098/lg-ai-tops-koreas-sovereign-ai-project-as-naver-cloud-fails-to-advance-msit-confirms); [Money Today](https://www.mt.co.kr/tech/2026/08/18/2026081812375747016)
- Infrastructure announcements vs delivery: Nvidia's 260,000-GPU figure is plans; NAICC needed three tenders and will not open until 2028 — [Nvidia](https://nvidianews.nvidia.com/news/south-korea-ai-infrastructure); [Remio analysis](https://www.remio.ai/post/koreas-national-ai-computing-center-breaks-ground-after-a-policy-retreat)

**Singapore — constraints**
- Power: Singtel states power availability is already constrained; GB200 racks draw ~200 kW (20–25x conventional) and next generations may need 600 kW–1 MW per rack; Nxera's growth beyond 120 MW in Singapore is in Johor, Batam and Bangkok — [Tech Wire Asia](https://techwireasia.com/2026/02/singtel-sovereign-ai-infrastructure-southeast-asia-johor/)
- Singtel's minority position: 25% of STT GDC under KKR control (75%); KKR also holds 20% of Nxera with an option on 25% — [Entrepreneur APAC](https://apac.entrepreneur.com/?p=9937); [Nxera newsroom](https://nxera-dc.com/about-us/newsroom/kkr-to-acquire-20-stake-in-singtel-regional-data-centre-business)
- Singtel's FY27 outlook is cautious (low-to-mid single-digit EBIT growth) citing energy-price and FX exposure — [TelecomTV](https://www.telecomtv.com/content/digital-platforms-services/singtel-posts-fy26-net-profit-of-s-5-61bn-underlying-profit-up-12-to-s-2-77bn-55535/)
- AISG's national model depends on foreign base models: Meta family → Alibaba Qwen3-32B (v4) → Nvidia Nemotron (v4.8); Alibaba supplied training tokens and technical support — [TechNode](https://technode.com/2025/11/25/singapores-national-ai-program-drops-meta-model-and-switches-to-alibabas-qwen/); [sea-lion.ai](https://sea-lion.ai/)
- AISG scale is small relative to peers: S$70m for the LLM programme; a 2024 commentary argued the amount "should be exceeded" — [Techgoondu](https://www.techgoondu.com/2024/02/19/singapores-new-s1-billion-gambit-to-be-a-pre-eminent-ai-hub/)

### Inferences
- Naver's "sovereign AI exporter" identity is, on current evidence, a domestic GPU-infrastructure business plus a Saudi urban-software franchise; the gap between website claims and spokesperson statements on the Saudi data centre is a red flag for promotional language.
- KT is best described as a sovereign *reseller/integrator* of US technology; this may satisfy data-residency rules but not technological-autonomy goals, and it is politically contested inside Korea.
- LG AI Research is the Korean entity whose champion label is best supported by independent benchmarks, but its commercial footprint outside LG affiliates is not evidenced.
- Singapore's champions carry less technological-sovereignty ambition and therefore less narrative risk; their binding constraint is physical (power, land), and control of the largest data-centre platform (STT GDC) now sits with a US private-equity firm.
- For GCC-market readers: both Naver (Saudi) and Singtel/Nxera sell "sovereign" infrastructure abroad on the basis of operating know-how, with Nvidia as the common technology supplier; neither has yet demonstrated an operating sovereign AI data centre outside its home region.

### Gaps
- No independent (non-company, non-government) assessment of RE:AI utilisation, Secure Public Cloud uptake, or HyperCLOVA X market share was found.
- Whether Morocco or the Saudi data centre advanced between September and mid-November 2026 is unknown; only single-outlet (Money Today, Edaily) stall reports were found.
- Singapore's official data-centre capacity allocations and grid constraints (EMA/IMDA figures) were not retrieved.
