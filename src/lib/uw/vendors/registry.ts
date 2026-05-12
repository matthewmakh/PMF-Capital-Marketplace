import { isDataMerchConfigured } from "./datamerch";
import { isKybConfigured } from "./kyb";
import { isMicrobiltConfigured } from "./microbilt";
import { isUccConfigured } from "./ucc";
import { isPlaidConfigured } from "../statements/plaid-statements";
import { isAzureDocIntelConfigured } from "../statements/azure-doc-intel";
import { isInscribeConfigured } from "../tamper/inscribe";
import { isS3Configured } from "../storage/s3";

export interface VendorStatus {
  key: string;
  label: string;
  purpose: string;
  envVars: string[];
  configured: boolean;
}

export function vendorStatuses(): VendorStatus[] {
  return [
    {
      key: "s3",
      label: "Object Storage (S3)",
      purpose: "Storing uploaded merchant documents",
      envVars: ["UW_S3_BUCKET", "AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
      configured: isS3Configured(),
    },
    {
      key: "plaid",
      label: "Plaid",
      purpose: "Live bank link + transaction pull",
      envVars: ["PLAID_CLIENT_ID", "PLAID_SECRET", "PLAID_ENV"],
      configured: isPlaidConfigured(),
    },
    {
      key: "azure_doc_intel",
      label: "Azure AI Document Intelligence",
      purpose: "Bank-statement PDF OCR (prebuilt-bankStatement.us)",
      envVars: ["AZURE_DOC_INTEL_ENDPOINT", "AZURE_DOC_INTEL_KEY"],
      configured: isAzureDocIntelConfigured(),
    },
    {
      key: "inscribe",
      label: "Inscribe (Document Tamper Detection)",
      purpose:
        "Industry-grade fraud detection on uploaded bank-statement PDFs (complements built-in inspector)",
      envVars: ["INSCRIBE_API_KEY", "INSCRIBE_BASE_URL"],
      configured: isInscribeConfigured(),
    },
    {
      key: "microbilt",
      label: "Microbilt",
      purpose: "Consumer credit, business credit, OFAC, ID Verify",
      envVars: ["MICROBILT_ACCOUNT_KEY", "MICROBILT_CUSTOMER_CODE"],
      configured: isMicrobiltConfigured(),
    },
    {
      key: "datamerch",
      label: "DataMerch",
      purpose: "MCA shared blacklist (EIN lookup)",
      envVars: ["DATAMERCH_API_KEY"],
      configured: isDataMerchConfigured(),
    },
    {
      key: "ucc",
      label: "Wolters Kluwer iLien",
      purpose: "UCC filings, judgments, liens, bankruptcies",
      envVars: ["WK_ILIEN_API_KEY"],
      configured: isUccConfigured(),
    },
    {
      key: "kyb",
      label: "Middesk / Cobalt KYB",
      purpose: "Secretary-of-State / business legitimacy",
      envVars: ["MIDDESK_API_KEY", "COBALT_API_KEY"],
      configured: isKybConfigured(),
    },
  ];
}
