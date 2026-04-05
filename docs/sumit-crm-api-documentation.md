# SUMIT (סאמיט) CRM API Documentation
## Email/Mailing, Contacts & Related Functionality

**Source:** https://app.sumit.co.il/developers/api/ (Swagger UI at https://app.sumit.co.il/help/developers/swagger/index.html)  
**API Base URL:** `https://api.sumit.co.il`  
**OpenAPI Version:** OAS 3.1  
**Documentation Crawl Date:** 2026-03-11  

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Email Subscriptions / Mailing Lists](#2-email-subscriptions--mailing-lists)
3. [SMS Subscriptions / Mailing Lists (Parallel to Email)](#3-sms-subscriptions--mailing-lists)
4. [SMS Send Endpoints](#4-sms-send-endpoints)
5. [Accounting Documents — Send by Email](#5-accounting-documents--send-by-email)
6. [Accounting Customers (Clients)](#6-accounting-customers-clients)
7. [CRM Data (Entities)](#7-crm-data-entities)
8. [CRM Schema (Folders)](#8-crm-schema-folders)
9. [CRM Views](#9-crm-views)
10. [Triggers (Webhooks)](#10-triggers-webhooks)
11. [Customer Service (Tickets)](#11-customer-service-tickets)
12. [Standard Response Format](#12-standard-response-format)
13. [Rate Limits & Notes](#13-rate-limits--notes)

---

## 1. Authentication

### Overview

All SUMIT API endpoints authenticate via a **Credentials object** included in the **JSON request body** of every POST request. There are no bearer tokens or header-based auth — authentication is embedded in the payload.

### Credential Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `CompanyID` | integer (int64) | Yes | Business/organization identifier. Found at Settings → API → API Keys page |
| `APIKey` | string (≥1 char) | Yes | Private API key secret. Generated at Settings → API → API Keys page |

### Key Types

- **Private Key (APIKey):** Grants full access to a large number of operations. Must be stored securely. Cannot be viewed or recovered after creation — generate a new one if lost.
- **Public Key (APIPublicKey):** Grants access to a limited subset of operations. This key is exposed to system users for those specific operations.
- **Key Expiration:** Keys not used for **120 days** are automatically deleted.

### How to Obtain Credentials

1. Log in to SUMIT at `https://app.sumit.co.il`
2. Navigate to **API** → **מפתחות API** (API Keys) at `/developers/keys/`
3. Your **CompanyID** is displayed at the top of the page
4. Click "הפקת מפתח התחברות פרטי חדש" to generate a new private APIKey
5. Click "הפקת מפתח התחברות ציבורי חדש" to generate a new public APIPublicKey

### Authentication Example

Every request body includes:
```json
{
  "Credentials": {
    "CompanyID": 12345678,
    "APIKey": "your-api-key-string-here"
  },
  ...other parameters...
}
```

### Optional Global Parameters

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `Content-Language` | Header | string | Sets the content response language. Defaults to Hebrew (`he`) |
| `ResponseLanguage` | Body | null | string | Alternative way to set response language (on some endpoints) |

### Content Types Accepted

- `application/json-patch+json`
- `application/json`
- `text/json`
- `application/*+json`

### Response Content Types

- `text/plain`
- `application/json`
- `text/json`

---

## 2. Email Subscriptions / Mailing Lists

### 2.1 List Mailing Lists

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/emailsubscriptions/mailinglists/list/` |
| **Description** | List all email mailing lists for the company |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  }
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Credentials` | object | Yes | Company API credentials |
| `Credentials.CompanyID` | integer (int64) | Yes | Company identifier |
| `Credentials.APIKey` | string (≥1 char) | Yes | API key secret |

**Response (200 OK):**
```json
{
  "Status": "Success (0)",
  "UserErrorMessage": "string",
  "TechnicalErrorDetails": "string",
  "Data": null
}
```

**Response Schema:** `Response_EmailSubscriptions_MailingLists_List_Response`

| Field | Type | Description |
|-------|------|-------------|
| `Status` | string | Operation status |
| `UserErrorMessage` | null | string | User-facing error message |
| `TechnicalErrorDetails` | null | string | Technical error details |
| `Data` | null | array | Array of mailing list objects (when successful) |

---

### 2.2 Add Subscriber to Mailing List

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/emailsubscriptions/mailinglists/add/` |
| **Description** | Add an email subscriber to a specific mailing list |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "MailingListID": 0,
  "EmailAddress": "string",
  "Name": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Credentials` | object | Yes | Company API credentials |
| `Credentials.CompanyID` | integer (int64) | Yes | Company identifier |
| `Credentials.APIKey` | string (≥1 char) | Yes | API key secret |
| `MailingListID` | integer (int64) | Yes | Target mailing list ID |
| `EmailAddress` | string (≥1 char) | Yes | Subscriber email address |
| `Name` | null | string | No | Subscriber display name |

**Response (200 OK):**
```json
{
  "Status": "Success (0)",
  "UserErrorMessage": "string",
  "TechnicalErrorDetails": "string",
  "Data": null
}
```

---

## 3. SMS Subscriptions / Mailing Lists

> These mirror the Email Subscriptions endpoints but are for SMS/phone-based mailing lists.

### 3.1 List SMS Mailing Lists

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/sms/mailinglists/list/` |
| **Description** | List all SMS mailing lists for the company |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  }
}
```

**Response (200 OK):** Standard response with `Data` containing list of SMS mailing lists.

---

### 3.2 Add Subscriber to SMS Mailing List

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/sms/mailinglists/add/` |
| **Description** | Add a phone subscriber to a specific SMS mailing list |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "MailingListID": 0,
  "PhoneNumber": "string",
  "Name": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Credentials` | object | Yes | Company API credentials |
| `MailingListID` | integer (int64) | Yes | Target SMS mailing list ID |
| `PhoneNumber` | string | Yes | Subscriber phone number |
| `Name` | null | string | No | Subscriber display name |

---

## 4. SMS Send Endpoints

### 4.1 Send Single SMS

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/sms/sms/send/` |
| **Description** | Send a single SMS message |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "Recipient": "string",
  "Text": "string",
  "SaveDraft": true,
  "Sender": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Recipient` | string | Yes | Phone number of recipient |
| `Text` | string | Yes | SMS message content |
| `SaveDraft` | boolean | No | If true, saves as draft instead of sending |
| `Sender` | string | No | Sender name/number |

---

### 4.2 Send Multiple SMS

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/sms/sms/sendmultiple/` |
| **Description** | Send SMS to multiple recipients |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "Recipients": [
    "string"
  ],
  "Text": "string",
  "SaveDraft": true,
  "Schedule": "2026-03-11T15:27:10.163Z",
  "Sender": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Recipients` | array of strings | Yes | Array of phone numbers |
| `Text` | string | Yes | SMS message content |
| `SaveDraft` | boolean | No | If true, saves as draft |
| `Schedule` | string (date-time) | No | Scheduled send time (ISO 8601) |
| `Sender` | string | No | Sender name/number |

---

### 4.3 List SMS Senders

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/sms/sms/listsenders/` |
| **Description** | List available SMS sender identities |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  }
}
```

---

## 5. Accounting Documents — Send by Email

### 5.1 Send Document by Email

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/accounting/documents/send/` |
| **Description** | Send an existing document (invoice, receipt, etc.) by email. Documents can be located either using DocumentID (EntityID), or a combination of DocumentType and DocumentNumber. |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "EntityID": 0,
  "DocumentType": "Invoice (0)",
  "DocumentNumber": 0,
  "EmailAddress": "string",
  "SenderUserID": 0,
  "Original": true,
  "Language": "Hebrew (0)",
  "PersonalMessage": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `EntityID` | integer | No* | Document entity ID (*use this OR DocumentType+DocumentNumber) |
| `DocumentType` | string (enum) | No* | Document type, e.g. "Invoice (0)" |
| `DocumentNumber` | integer | No* | Document number |
| `EmailAddress` | string | Yes | Recipient email address |
| `SenderUserID` | integer | No | Sender user ID |
| `Original` | boolean | No | Send original document |
| `Language` | string (enum) | No | Document language, e.g. "Hebrew (0)" |
| `PersonalMessage` | string | No | Personal message to include in the email |

---

## 6. Accounting Customers (Clients)

### 6.1 Create Customer

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/accounting/customers/create/` |
| **Description** | Create customer or find existing customer according to SearchMode |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Details": {
    "ExternalIdentifier": null,
    "NoVAT": null,
    "SearchMode": null,
    "Name": "Danny Dean",
    "Phone": "050-1234567",
    "EmailAddress": "danny@dean.com",
    "City": null,
    "Address": null,
    "ZipCode": null,
    "CompanyNumber": "514000123",
    "ID": null,
    "Folder": null,
    "Properties": null
  },
  "Credentials": {
    "CompanyID": 12345678,
    "APIKey": "your-api-key-here"
  },
  "ResponseLanguage": null
}
```

**Details Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ID` | null | integer (int64) | No | SUMIT identifier. Leave empty to create new or search by other fields |
| `Folder` | null | string | No | Folder identifier. Can be either application folder name, or FolderID |
| `Properties` | null | object | No | Entity fields (custom properties) |
| `Name` | null | string | Conditional | Customer full name (or company name). Required for creating new customer. Leave empty to search by other fields |
| `Phone` | null | string | No | Customer phone number |
| `EmailAddress` | null | string | No | Customer email address |
| `City` | null | string | No | Customer city |
| `Address` | null | string | No | Customer address |
| `ZipCode` | null | string | No | Customer ZipCode |
| `CompanyNumber` | null | string | No | Customer registered company number (VAT number) |
| `ExternalIdentifier` | null | string | No | Customer external identifier from calling application |
| `NoVAT` | null | boolean | No | NoVAT indication. Set to true for VAT exempt customers. Defaults to False |
| `SearchMode` | null (enum) | No | Customer searching mode. Defaults to None |

**SearchMode Enum Values:**

| Value | Name |
|-------|------|
| 0 | Automatic |
| 1 | None |
| 2 | ExternalIdentifier |
| 3 | Name |
| 4 | CompanyNumber |
| 5 | Phone |
| 6 | EmailAddress |

---

### 6.2 Update Customer

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/accounting/customers/update/` |
| **Description** | Update customer or find existing customer according to SearchMode |
| **Authentication** | Yes — Credentials object in body |

**Request Body:** Same structure as Create Customer (Details + Credentials + ResponseLanguage)

---

### 6.3 Get Customer Details URL

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/accounting/customers/getdetailsurl/` |
| **Description** | Gets a URL to the customer details page in the SUMIT web app |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "CustomerID": 0
}
```

---

### 6.4 Create Customer Remark

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/accounting/customers/createremark/` |
| **Description** | Create customer or find existing customer according to SearchMode, and add a remark/note |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "CustomerID": 0,
  "Content": "string",
  "Username": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `CustomerID` | integer | Yes | Target customer ID |
| `Content` | string | Yes | Remark/note content |
| `Username` | string | No | Username attribution for the remark |

---

## 7. CRM Data (Entities)

### 7.1 Create Entity

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/createentity/` |
| **Description** | Create a new CRM entity (contact, lead, etc.) |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "Entity": {
    "ID": 0,
    "Folder": "string",
    "Properties": {
      "additionalProp1": null,
      "additionalProp2": null,
      "additionalProp3": null
    },
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
```

---

### 7.2 Update Entity

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/updateentity/` |
| **Description** | Update an existing CRM entity |
| **Authentication** | Yes — Credentials object in body |

**Request Body:** Same structure as Create Entity

---

### 7.3 Archive Entity

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/archiveentity/` |
| **Description** | Archive a CRM entity |
| **Authentication** | Yes — Credentials object in body |

---

### 7.4 Delete Entity

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/deleteentity/` |
| **Description** | Delete a CRM entity |
| **Authentication** | Yes — Credentials object in body |

---

### 7.5 List Entities

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/listentities/` |
| **Description** | List/search CRM entities with filters, ordering and paging |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "Folder": "string",
  "IncludeInheritedFolders": true,
  "Filters": [
    {
      "Property": "string",
      "Value": null,
      "DateRange_From": "2026-03-11T15:13:54.399Z",
      "DateRange_To": "2026-03-11T15:13:54.399Z",
      "Negative": true
    }
  ],
  "Order": null,
  "Paging": null,
  "LoadProperties": true
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Folder` | string | Yes | Folder name or ID to search in |
| `IncludeInheritedFolders` | boolean | No | Whether to include entities from sub-folders |
| `Filters` | array | No | Array of filter objects |
| `Filters[].Property` | string | Yes | Property name to filter on (e.g. client type) |
| `Filters[].Value` | any | No | Value to match |
| `Filters[].DateRange_From` | string (date-time) | No | Start of date range filter |
| `Filters[].DateRange_To` | string (date-time) | No | End of date range filter |
| `Filters[].Negative` | boolean | No | If true, negates/inverts the filter |
| `Order` | null | object | No | Ordering specification |
| `Paging` | null | object | No | Paging specification |
| `LoadProperties` | boolean | No | If true, loads full entity properties in response |

---

### 7.6 Get Entity

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/getentity/` |
| **Description** | Get a single CRM entity by ID |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "EntityID": 0,
  "IncludeIncomingProperties": true,
  "IncludeFields": true
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `EntityID` | integer | Yes | Entity ID to retrieve |
| `IncludeIncomingProperties` | boolean | No | Include incoming/linked properties |
| `IncludeFields` | boolean | No | Include all fields/properties |

---

### 7.7 Count Entity Usage

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/countentityusage/` |
| **Description** | Count entity usage across the system |
| **Authentication** | Yes — Credentials object in body |

---

### 7.8 Get Entity Print HTML

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/getentityprinthtml/` |
| **Description** | Get entity HTML contents for print |
| **Authentication** | Yes — Credentials object in body |

---

### 7.9 Get Entities HTML (Multiple)

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/data/getentitieshtml/` |
| **Description** | Get entities HTML contents for print (multiple entities) |
| **Authentication** | Yes — Credentials object in body |

---

## 8. CRM Schema (Folders)

### 8.1 Get Folder

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/schema/getfolder/` |
| **Description** | Get folder details including its schema/properties |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "Folder": "string",
  "IncludeProperties": true
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Folder` | string | Yes | Folder name or ID |
| `IncludeProperties` | boolean | No | If true, includes the folder's property definitions |

---

### 8.2 List Folders

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/schema/listfolders/` |
| **Description** | List all CRM folders |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  }
}
```

---

## 9. CRM Views

### 9.1 List Views

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/crm/views/listviews/` |
| **Description** | List saved CRM views for a specific folder |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "FolderID": 0
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FolderID` | integer | Yes | Folder ID to list views for |

---

## 10. Triggers (Webhooks)

> Triggers function as webhooks. They are typically used by Make.com/Zapier integrations, but can also be used directly via the API.

### 10.1 Subscribe (Create Trigger)

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/triggers/triggers/subscribe/` |
| **Description** | Creates a trigger/webhook. Usually done by make.com/zapier, but can also be used directly. |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "URL": "string",
  "Folder": "string",
  "View": 0,
  "TriggerType": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `URL` | null | string | Yes | Webhook callback URL that SUMIT will POST to when the trigger fires |
| `Folder` | null | string | No | CRM folder to watch |
| `View` | integer (int64) | No | View ID to filter trigger scope |
| `TriggerType` | null | string | No | Type of trigger event (e.g. entity created, updated, etc.) |

---

### 10.2 Unsubscribe (Remove Trigger)

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/triggers/triggers/unsubscribe/` |
| **Description** | Removes a trigger/webhook. Usually done by make.com/zapier, but can also be used directly. |
| **Authentication** | Yes — Credentials object in body |

**Request Body:**
```json
{
  "Credentials": {
    "CompanyID": 0,
    "APIKey": "string"
  },
  "URL": "string"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `URL` | string | Yes | The webhook URL to unsubscribe/remove |

---

## 11. Customer Service (Tickets)

### 11.1 Create Ticket

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Full URL** | `https://api.sumit.co.il/customerservice/tickets/create/` |
| **Description** | Create a customer service ticket |
| **Authentication** | Yes — Credentials object in body |

---

## 12. Standard Response Format

All API endpoints return the same response structure:

```json
{
  "Status": "Success (0)",
  "UserErrorMessage": "string",
  "TechnicalErrorDetails": "string",
  "Data": null
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `Status` | string | Operation result status. "Success (0)" for success, other values for errors |
| `UserErrorMessage` | null | string | Human-readable error message (Hebrew or per Content-Language header) |
| `TechnicalErrorDetails` | null | string | Technical error information for debugging |
| `Data` | varies | Response payload. Type depends on the endpoint (null, object, array, string, etc.) |

---

## 13. Rate Limits & Notes

### Rate Limits
- **~100 API calls per minute.** Higher rates will result in temporary blocking.

### Email Mailing Pricing
- Email mailing: 0.01 ILS/email
- Above 5,000 emails/month: 0.0025 ILS/email (from email #5,001 onwards)
- Email attachments via mailing module: up to 1.5MB per message

### SMS Pricing
- SMS sending: 0.1 ILS/SMS
- Above 5,000 SMS/month: 0.05 ILS/SMS (from SMS #5,001 onwards)

### Campaign / Template Notes
The SUMIT API does **not** expose dedicated endpoints for:
- Creating/managing email campaigns (this is done through the SUMIT web UI under "דיוור במייל")
- HTML template management (templates are managed in the web UI)
- Email campaign sending to mailing lists (done through the web UI)

However, integrations with **Make.com** and **Zapier** support:
- Adding recipients to email mailing lists
- Creating documents and sending them by email
- Triggering actions based on CRM entity events

The API focuses on **mailing list management** (list/add subscribers) and **document email sending**, while the actual campaign creation and template design is performed through the SUMIT web application.

### Integration Platforms
SUMIT supports integration with:
- **Make.com** (formerly Integromat) — full integration module
- **Zapier** — trigger and action support
- **Direct API** — REST API as documented here

### Important Notes
- All endpoints use **POST** method (even for read/list operations)
- Authentication is always in the **request body** (not headers)
- No OAuth/Bearer token support — API key only
- The API spec is OpenAPI 3.1 (OAS 3.1)
- Hebrew is the default response language; set Content-Language header to change

---

## Appendix: Additional Endpoints (Not Email/Mailing Related — Summary Only)

The following endpoint categories exist in the SUMIT API but are **not related to email/mailing functionality** and are listed here only for completeness:

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Accounting (Documents) | create, list, getdetails, getpdf, cancel, movetobooks, addexpense, getdebt, getdebtreport | Invoice/receipt/document management |
| Accounting (General) | verifybankaccount, getvatrate, getexchangerate, updatesettings, getnextdocumentnumber, setnextdocumentnumber | General accounting utilities |
| Accounting (IncomeItems) | create, list | Income item management |
| Credit card terminal (Billing) | load, process, getstatus | Billing transaction management |
| Credit card terminal (Gateway) | transaction, gettransaction, beginredirect, getreferencenumbers | Credit card processing |
| Credit card terminal (Vault) | tokenize, tokenizesingleuse, tokenizesingleusejson | Card tokenization |
| Payments (GeneralBilling) | openupayterminal, setupaycredentials | Upay terminal management |
| Payments (PaymentMethods) | getforcustomer, setforcustomer, remove | Customer payment method management |
| Payments (Payments) | charge, multivendorcharge, get, list, beginredirect | Payment processing |
| Payments (Recurring) | listforcustomer, cancel, charge, update, updatesettings | Recurring billing |
| Scheduled documents | createfromdocument | Scheduled document creation |
| Stock management | list | Stock/inventory listing |
| Letter by Click | senddocument, gettrackingcode | Physical mail via Beeri's service |
| Outgoing faxes | send | Fax sending |
| Website (Companies) | create, update, getdetails, listquotas, installapplications | Organization management |
| Website (Permissions) | set, remove | User permission management |
| Website (Users) | create, loginredirect | User account management |
