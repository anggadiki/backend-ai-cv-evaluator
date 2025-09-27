# Backend AI CV Evaluator

Mini project backend untuk evaluasi kandidat menggunakan CV dan project report dengan bantuan AI (RAG + LLM).  
Mendukung asynchronous job processing via BullMQ + Redis.

---

## 🚀 Tech Stack

- **Node.js (ESM) + Express.js**
- **Prisma ORM** (SQLite by default, bisa ganti PostgreSQL)
- **BullMQ + Redis** untuk job queue
- **OpenAI API** (Embeddings + LLM)
- **Nodemon** untuk development

---

## ⚙️ Setup & Installation

### 1. Clone repo & install dependencies

```bash
git clone <repo-url>
cd backend-ai-cv-evaluator
npm install
```

### 2. Setup database

```bash
npx prisma migrate dev --name init
```

### 3. Jalankan Redis

```bash
# start as service
brew services start redis

# atau manual run
redis-server /opt/homebrew/etc/redis.conf
```

### 4. Setup environment

Buat file `.env`:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=sk-xxxx
LLM_MOCK=true   # set true untuk dummy mode, false untuk real call
```

### 5. Jalankan server & worker

Buka 2 terminal:

```bash
# Terminal 1: API server
npm run dev

# Terminal 2: Worker
npm run worker
```

---

## 📌 API Endpoints

### 1. Buat Candidate

```bash
curl -X POST http://localhost:3000/candidate \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### 2. Upload CV

```bash
curl -F "file=@cv.pdf" \
     -F "candidateId=<candidateId>" \
     http://localhost:3000/upload/cv
```

### 3. Upload Project Report

```bash
curl -F "file=@project.pdf" \
     -F "candidateId=<candidateId>" \
     http://localhost:3000/upload/project
```

### 4. Request Evaluation

```bash
curl -X POST http://localhost:3000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"<candidateId>"}'
```

Response:

```json
{ "id": "<evaluationId>", "status": "queued" }
```

### 5. Cek Hasil Evaluasi

```bash
curl http://localhost:3000/result/<evaluationId>
```

Response (mock mode):

```json
{
  "id": "<evaluationId>",
  "candidate": { "id": "<candidateId>", "name": "John Doe" },
  "status": "completed",
  "result": {
    "cv_match_rate": 0.82,
    "cv_feedback": "...",
    "project_score": 7.5,
    "project_feedback": "...",
    "overall_summary": "Good candidate fit."
  },
  "createdAt": "..."
}
```

---

## 🧪 Testing Flow

1. Create candidate
2. Upload CV & project
3. Request evaluation
4. Check result (status → `queued` → `completed` after worker processes)

---

## 🗂️ Arsitektur (ASCII Diagram)

```text
+-------------+       +-------------+       +----------+       +----------+
|  Candidate  |  -->  |   Backend   |  -->  |  Redis   |  -->  |  Worker  |
|   (Client)  |       |   (API)     |       |  Queue   |       | (BullMQ) |
+-------------+       +-------------+       +----------+       +----------+
       |                     |                   |                  |
       |   Upload CV/Project |                   |                  |
       |-------------------->|                   |                  |
       |                     |                   |                  |
       |   Request Evaluate  |                   |                  |
       |-------------------->|   enqueue job ---->                  |
       |                     |                   |                  |
       |                     |     fetch result  |                  |
       |<--------------------|<------------------|<-----------------|
```

---

## 🔮 Notes

- Jika `OPENAI_API_KEY` invalid / quota habis → gunakan `LLM_MOCK=true`.
- Jika pakai PostgreSQL, update `DATABASE_URL` di `.env`.
- Worker **harus dijalankan bersamaan** dengan server.
