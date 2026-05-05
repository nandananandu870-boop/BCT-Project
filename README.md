# 📄 Blockchain Document Verification System

## 📌 Project Overview

This project is a **Blockchain-based Document Verification System** that ensures the authenticity and integrity of uploaded documents.

It uses **SHA-256 hashing** and a **blockchain structure** to store document fingerprints securely.

---

## 🚀 Features

* 📂 Upload any document (PDF, DOCX, Images, ZIP)
* 🔐 Generate SHA-256 hash of file
* ⛓ Store hash in blockchain (backend)
* ✅ Verify document authenticity
* 📊 View blockchain ledger
* 📥 Export blockchain data (JSON)
* 🗑 Clear blockchain

---

## 🛠 Technologies Used

* Frontend: HTML, CSS, JavaScript
* Backend: Python (Flask)
* Hashing: Web Crypto API (SHA-256)
* Version Control: Git & GitHub

---

## ⚙️ How It Works

1. User uploads a document
2. System generates SHA-256 hash
3. Hash is stored in blockchain as a block
4. Each block links to previous block
5. For verification, hash is recomputed and compared

---

## 📂 Project Structure

```
BCT-Project/
│
├── index.html
├── style.css
├── ui.js
├── blockchain.js
│
└── backend/
    ├── app.py
    ├── blockchain.py
    └── requirements.txt
```

---

## ▶️ How to Run

### 1. Start Backend

```bash
cd backend
pip install flask flask-cors
python app.py
```

### 2. Start Frontend

* Open `index.html` using Live Server

---

## 🎯 Output

* Documents are securely stored as hashes
* Blockchain ensures tamper-proof verification
* Users can verify authenticity anytime

---

## 🎤 Viva Explanation (Short)

"This system uses SHA-256 hashing to convert documents into unique fingerprints, which are stored in a blockchain. Any change in the document results in a different hash, ensuring integrity and authenticity."

---

## 👩‍💻 Author

Nandana Nandu
