// Canonical signatures used to detect existing MCA / cash-advance ACH debits
// on a merchant's bank statement. Substrings are matched case-insensitively.
// This list is intentionally explicit so it can be reviewed and versioned.

export interface FunderSignature {
  funder: string;
  patterns: string[];
}

export const FUNDER_SIGNATURES: FunderSignature[] = [
  { funder: "OnDeck", patterns: ["ondeck", "on deck capital"] },
  { funder: "Kapitus", patterns: ["kapitus", "strategic funding"] },
  { funder: "Forward Financing", patterns: ["forward financing", "fwd financing"] },
  { funder: "Reliant Funding", patterns: ["reliant funding"] },
  { funder: "CFG Merchant Solutions", patterns: ["cfg merchant", "cfgms"] },
  { funder: "Yellowstone Capital", patterns: ["yellowstone capital"] },
  { funder: "Rapid Finance", patterns: ["rapid finance", "rapidadvance"] },
  { funder: "Credibly", patterns: ["credibly"] },
  { funder: "Fora Financial", patterns: ["fora financial"] },
  { funder: "BlueVine", patterns: ["bluevine"] },
  { funder: "Funding Circle", patterns: ["funding circle"] },
  { funder: "PayPal Working Capital", patterns: ["paypal working capital", "pp working cap"] },
  { funder: "Square Capital", patterns: ["square capital", "sq capital"] },
  { funder: "Shopify Capital", patterns: ["shopify capital"] },
  { funder: "Amazon Lending", patterns: ["amazon lending"] },
  { funder: "Greenbox Capital", patterns: ["greenbox capital"] },
  { funder: "National Funding", patterns: ["national funding"] },
  { funder: "Mantis Funding", patterns: ["mantis funding"] },
  { funder: "Everest Business Funding", patterns: ["everest business funding"] },
  { funder: "Lendio", patterns: ["lendio"] },
  { funder: "Headway Capital", patterns: ["headway capital"] },
  { funder: "Premier Merchant Funding", patterns: ["premier merchant funding", "pmf capital"] },
  { funder: "Newco Capital", patterns: ["newco capital"] },
  { funder: "Capify", patterns: ["capify"] },
  { funder: "Pearl Capital", patterns: ["pearl capital"] },
  { funder: "Lendr", patterns: ["lendr.online", "lendr "] },
  { funder: "Last Chance Funding", patterns: ["last chance funding"] },
];

export interface CardProcessorSignature {
  processor: string;
  patterns: string[];
}

export const CARD_PROCESSOR_SIGNATURES: CardProcessorSignature[] = [
  { processor: "Square", patterns: ["square inc", "sq * ", "tst*"] },
  { processor: "Stripe", patterns: ["stripe"] },
  { processor: "Shopify", patterns: ["shopify"] },
  { processor: "Worldpay", patterns: ["worldpay", "vantiv"] },
  { processor: "TSYS", patterns: ["tsys"] },
  { processor: "First Data", patterns: ["first data", "fiserv"] },
  { processor: "Clover", patterns: ["clover"] },
  { processor: "Toast", patterns: ["toast inc"] },
  { processor: "Heartland", patterns: ["heartland"] },
  { processor: "PayPal", patterns: ["paypal"] },
  { processor: "Chase Paymentech", patterns: ["paymentech", "chase merchant"] },
  { processor: "Authorize.net", patterns: ["authorize.net", "authnet"] },
];

export const NSF_PATTERNS = [
  "nsf",
  "insufficient funds",
  "returned item",
  "return item",
  "ach return",
  "uncollected funds",
];

export const OVERDRAFT_PATTERNS = [
  "overdraft",
  "od fee",
  "od charge",
  "sustained overdraft",
];

export const TRANSFER_PATTERNS = [
  "transfer to",
  "transfer from",
  "internal transfer",
  "book transfer",
  "xfer",
  "online transfer",
];
