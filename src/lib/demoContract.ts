export const DEMO_CONTRACT_NAME = 'Acme Cloud Services Master Agreement.pdf';

export const DEMO_CONTRACT_TEXT = `[PAGE 1]
MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of January 15, 2025 ("Effective Date") by and between Acme Corporation, a Delaware corporation ("Client"), and CloudNet Solutions Inc., a California corporation ("Provider").

WHEREAS, Provider provides cloud computing and managed IT services; and
WHEREAS, Client desires to engage Provider to furnish certain services;

NOW, THEREFORE, the parties agree as follows:

1. SERVICES
Provider shall provide cloud hosting, data storage, and managed security services as described in one or more Statements of Work ("SOWs"). Each SOW shall describe the scope, fees, and timeline of services.

2. TERM AND TERMINATION
This Agreement shall commence on the Effective Date and continue for an initial term of three (3) years. Either party may terminate this Agreement for material breach with thirty (30) days written notice, provided the breaching party fails to cure such breach within the notice period. Upon termination, Provider must return all Client data within fifteen (15) business days.

[PAGE 2]
3. PAYMENT TERMS
Client shall pay Provider the fees set forth in each SOW. Invoices are due net thirty (30) days from the date of invoice. Late payments accrue interest at one percent (1%) per month. Client must dispute any invoice in writing within ten (10) business days of receipt; otherwise the invoice is deemed accepted.

4. DATA PROTECTION AND PRIVACY
Provider shall comply with all applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Provider must notify Client of any data breach within seventy-two (72) hours of discovery. Provider shall conduct annual security audits and provide the audit report to Client within thirty (30) days of completion. Provider is responsible for maintaining SOC 2 Type II certification throughout the term of this Agreement.

5. CONFIDENTIALITY
Each party agrees to protect the other party's Confidential Information with the same degree of care it uses for its own, but no less than reasonable care. Confidential Information includes all non-public business, technical, and financial information. The confidentiality obligations survive termination for a period of five (5) years.

[PAGE 3]
6. INTELLECTUAL PROPERTY
All work product created by Provider for Client under this Agreement is the exclusive property of Client. Provider retains ownership of pre-existing tools and methodologies. Provider grants Client a perpetual, royalty-free license to any pre-existing tools incorporated into the work product.

7. INDEMNIFICATION
Provider shall indemnify, defend, and hold harmless Client from any third-party claims arising from Provider's negligence or breach of this Agreement. Client shall provide prompt notice of any claim. Provider's indemnification obligations are capped at the total fees paid in the twelve (12) months preceding the claim.

8. INSURANCE
Provider shall maintain commercial general liability insurance of at least two million dollars ($2,000,000) per occurrence and cyber liability insurance of at least five million dollars ($5,000,000) per incident. Provider must furnish certificates of insurance to Client within ten (10) business days of request.

[PAGE 4]
9. REPORTING OBLIGATIONS
Provider shall submit a monthly service report to Client by the fifth (5th) business day of each month. The report must include uptime metrics, incident summaries, and support ticket resolution times. Provider must also provide a quarterly business review within thirty (30) days after the end of each quarter.

10. SERVICE LEVELS
Provider guarantees a monthly uptime of 99.9% for all production services. If the uptime falls below the guaranteed level, Provider shall issue service credits as described in Schedule A. Client must submit a claim for service credits within ten (10) business days of the end of the affected month.

11. SUBPROCESSORS
Provider may use approved subprocessors to perform elements of the services. Provider must notify Client at least thirty (30) days before engaging a new subprocessor. Client may object to the subprocessor; if the objection is not resolved, Client may terminate the affected SOW without penalty.

[PAGE 5]
12. LIMITATION OF LIABILITY
Except for indemnification and confidentiality breaches, each party's total liability is capped at the total fees paid in the twelve (12) months preceding the claim. Neither party is liable for indirect or consequential damages.

13. COMPLIANCE WITH LAWS
Provider shall comply with all federal, state, and local laws applicable to the services, including export control laws and anti-corruption laws including the Foreign Corrupt Practices Act (FCPA). Provider must maintain accurate books and records and permit Client to audit them annually with thirty (30) days notice.

14. ASSIGNMENT
Neither party may assign this Agreement without the prior written consent of the other party, except in connection with a merger or sale of substantially all assets.

15. GOVERNING LAW
This Agreement is governed by the laws of the State of California. Disputes shall be resolved in the state or federal courts located in San Francisco, California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.`;

export function getDemoContractFile(): File {
  return new File([DEMO_CONTRACT_TEXT], DEMO_CONTRACT_NAME, {
    type: 'text/plain',
  });
}
