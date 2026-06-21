# Codex Deployment Guide (Hinglish) 🚀

Is guide mein hum seekhenge ki kaise is full-stack application ko free platforms par deploy karna hai.

---

## Step 1: Database (MongoDB Atlas) Setup 🍃
Hum apne local MongoDB database ko cloud database se replace karenge taaki production par data save ho sake.

1. **MongoDB Atlas** (https://www.mongodb.com/cloud/atlas) par sign up/login karein.
2. Ek free **Shared Cluster (M0)** create karein.
3. **Database Access** tab mein jakar ek database user banayein (username aur secure password ke sath).
4. **Network Access** tab mein jakar IP Address rules mein `0.0.0.0/0` (Allow Access from Anywhere) add karein taaki Render/Vercel isse connect kar sakein.
5. Cluster ke homepage par **Connect** -> **Drivers** par click karein.
6. Aapko ek connection string milegi (e.g. `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority`).
7. Is connection string ko copy kar lein (password replace karna mat bhulna).

---

## Step 2: Backend (Render) Deployment 🐍
FastAPI backend ko deploy karne ke liye hum **Render** का use karenge.

1. **Render** (https://render.com/) par GitHub account ke sath login/sign up karein.
2. Dashboard par **New +** -> **Web Service** par click karein.
3. Apne GitHub repository (`Codex`) ko connect karein.
4. Niche diye gaye settings fill karein:
   - **Name**: `cortexcraft-backend` (ya jo aap chahein)
   - **Runtime**: `Python 3` (ya automatic select hoga)
   - **Root Directory**: `backend` (Ye step bohot important hai!)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Advanced** par click karein aur **Environment Variables** add karein:
   - `MONGODB_URL` = (Aapki MongoDB Atlas connection string jo Step 1 mein mili)
   - `GROQ_API_KEY` = (Aapki GROQ API Key)
   - `JWT_SECRET` = (Koi bhi random secure string JWT token generate karne ke liye)
6. **Create Web Service** par click karein. Render building start kar dega aur deploy hone par aapko ek unique URL dega (e.g., `https://cortexcraft-backend.onrender.com`).

---

## Step 3: Frontend (Vercel) Deployment ⚡
React + Vite frontend ko deploy karne ke liye hum **Vercel** ka use karenge.

1. **Vercel** (https://vercel.com/) par GitHub se login karein.
2. **Add New** -> **Project** par click karein.
3. Apni GitHub repository (`Codex`) ko import karein.
4. Configuration screen par:
   - **Root Directory**: **`frontend`** (Edit karke ise select karein!)
   - **Framework Preset**: `Vite` (automatic set ho jayega)
5. **Environment Variables** section ko expand karein aur add karein:
   - Name: `VITE_API_URL`
   - Value: (Aapke Render backend ka unique URL jo Step 2 mein mila)
6. **Deploy** button par click karein.

Bas! Aapka website deploy ho jayega aur Vercel aapko live production URL de dega.

---

## Step 4: Git updates push karna (Important)
Is guide aur `requirements.txt` ko GitHub par push karne ke liye terminal mein ye chalao:
```powershell
git add .
git commit -m "Added deployment files and guide"
git push origin main
```
