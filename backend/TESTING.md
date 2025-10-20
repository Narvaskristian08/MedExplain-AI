# MedExplain AI Backend Testing Guide

Provides step-by-step instructions for testing and integrating the MedExplain AI backend.

### Prerequisites

- Node.js: v16+ (v22.2.0 recommended, tested). Install from nodejs.org.
- MongoDB: Running locally (mongod) or via cloud (e.g., MongoDB Atlas). Set MONGO_URI in backend/.env (e.g., MONGO_URI=mongodb://localhost:27017/medexplain).
- Dependencies: Installed via npm install in backend
- Testing Tool: Postman (recommended, postman.com) or curl. For file uploads, use Postman’s form-data body.
- JWT Token: Required for protected routes. Create patient/admin users and login to obtain tokens (see [LOGIN_API] (./backend/LOGIN_API.md) - Authentication Guide)
- Sample Files: Optional PDF/DOCX files in backend/test-files/ for upload testing (create folder if needed).

### Starting Server
```bash
# Navigate to Backend
cd backend

# Run Dev
npm run dev
```

### Testing Key Routes
#### 1. Uploading Document
- **POST** `api/documents/upload`
- **Headers** `Authorization: Bearer <user_token>`
- **Body** `form-data: key - userId, file - sample file (PDF/DOCX <5mb)`

- Text Input
- **POST** `api/documents/upload`
- **Headers** `Authorization: Bearer <user_token>, Content-Type: application/json`
- **Body**
    ```json
    {"userId":"68ed38b8268ff57e9f8aebad", "originalText":"Patient with Hypertension prescribed lisinopril"}
    ```

- **Response**
    ```json
    {
    "message": "Document uploaded",
    "document": {
        "userId": "68ed38b8268ff57e9f8aebad",
        "originalText": "Patient with Hypertension prescribed lisinopril",
        "complexityScore": 8.6,
        "_id": "68f11f4e6d95eec0a5aefdcf",
        "glossary": [],
        "createdAt": "2025-10-16T16:37:34.314Z",
        "updatedAt": "2025-10-16T16:37:34.314Z",
        "__v": 0
    }
    }
    ```

#### 2. Simplifier
- **POST** `api/documents/simplify`
- **Headers** `Authorization: Bearer <user_token>`
- **Body** 
    ```json
    {
  "documentId": "68f11caf6d95eec0a5aefdcd"
    }
    ```
- **Response**
    ```json
    (Conflict due to LLM Placeholder mweheh)
    ```

#### 3. Export Documents to XLSX 
- **GET** `api/documents/export-xlsx` (you can also do `api/documents/export-xlsx?userId=<userId>`, remove userId key on form-data)
- **Headers** `Authorization: Bearer <admin_token, personnel_token>`
- **Body** `form-data: Key - file, value (file) - <sample_pdf>, Key - userId, value (text) - <userId>`

- **Download the Response**
- Look for the columns, `Document ID, User ID, Original Text, Simplified Text, Complexity Score, Uploaded, Glossary Terms`.

#### 4. Get Stats 
- **GET** `api/documents/stats`
- **Headers** `Authorization: Bearer <admin_token, personnel_token>`
- **Response**
    ```json
    {
    "message": "Admin stats retrieved",
    "stats": {
        "totalDocuments": 10,
        "recentDocuments": [
            {
                "_id": "68f11f4e6d95eec0a5aefdcf",
                "userId": "68ed38b8268ff57e9f8aebad",
                "originalText": "Patient with Hypertension prescribed lisinopril",
                "complexityScore": 8.6,
                "glossary": [],
                "createdAt": "2025-10-16T16:37:34.314Z",
                "updatedAt": "2025-10-16T16:37:34.314Z",
                "__v": 0
            },
            {
                "_id": "68f11caf6d95eec0a5aefdcd",
                "userId": "68ed38b8268ff57e9f8aebad",
                "originalText": "Patient with Hypertension prescribed lisinopril",
                "complexityScore": 8.6,
                "glossary": [],
                "createdAt": "2025-10-16T16:26:23.826Z",
                "updatedAt": "2025-10-16T16:26:23.826Z",
                "__v": 0
            },
            {
                "_id": "68f0898141c0b8fab7cd34e5",
                "userId": "68ed38b8268ff57e9f8aebad",
                "originalText": "Medical Reports Summary  Document 1  ID: 68ed46abfb1539f033f7ae23  User ID: 68ed38b8268ff57e9f8aebad  Original Text: Medical jargon here  Simplified Text: Simplified version of Medical jargon here  Uploaded: Mon Oct 13 2025 11:36:27 GMT-0700 (Pacific Daylight Time)  Document 2  ID: 68ed556f439cf26f2a0407ee  User ID: 68ed38b8268ff57e9f8aebad  Original Text: Blood Pressure Test and Medical History  Simplified Text: Not simplified  Uploaded: Mon Oct 13 2025 12:39:27 GMT-0700 (Pacific Daylight Time)",
                "complexityScore": 6.887096774193548,
                "glossary": [],
                "createdAt": "2025-10-16T05:58:25.222Z",
                "updatedAt": "2025-10-16T05:58:25.222Z",
                "__v": 0
            },
            {
                "_id": "68eeb7d2d9023a511fbb36e6",
                "userId": "68ed38b8268ff57e9f8aebad",
                "originalText": "Sample medical text for rechecking.",
                "createdAt": "2025-10-14T20:51:30.419Z",
                "updatedAt": "2025-10-15T18:30:08.586Z",
                "__v": 1,
                "complexityScore": 6.2,
                "glossary": []
            }
        ],
        "totalUsers": 2,
        "documentsByUser": [
            {
                "_id": "68ed38b8268ff57e9f8aebad",
                "count": 10
            }
        ],
        "complexityStats": {
            "_id": null,
            "avgComplexity": 6.4632400221792965,
            "maxComplexity": 8.6,
            "minComplexity": 4.872705018359853
        },
        "termFrequency": []
    }
    }
    ```

#### 5. Generate Glossary
- Admin and User
- **GET** `api/documents/glossary`
- **Headers** `Authorization: <admin/user_token>
- **Response**
    ```json
    {
    "message": "Glossary generated",
    "glossary": {
        "Medical": "Simplified explanation of medical",
        "Blood Pressure": "Simplified explanation of blood pressure",
        "Medical Consultant": "Simplified explanation of medical consultant",
        "Pang Community": "Simplified explanation of pang community",
        "Sample": "Simplified explanation of sample",
        "Medical Reports": "Simplified explanation of medical reports",
        "Patient": "Simplified explanation of patient"
    }
    }
    ```

#### 6. Export Glossary (to be removed diba)
- PDF Format
- **GET** `api/documents/glossary/export`
- **Headers** `Authorization: Bearer <admin_token, personnel_token>`
- **Response** `PDF File`

#### 7. Export (Medical Report)
- Admin only
- **GET** `api/documents/export
- **Headers** ``Authorization: Bearer <admin_token, personnel_token>`
- **Response** `Generated PDF`
