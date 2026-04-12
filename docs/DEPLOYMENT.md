# 🚀 Deployment

This project is deployed using:

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 🔧 Backend Deployment (Render)

**Platform:** Render

### Steps:

1. Push the project to GitHub
2. Go to Render Dashboard
3. Click **New → Web Service**
4. Connect your GitHub repository
5. Select the repository
6. Configure the service:

   * **Root Directory:** `backend`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
7. Add required environment variables
8. Click **Create Web Service**
9. Wait for deployment to complete

Once deployed, Render will provide a public URL:

```
https://urban-community-backend.onrender.com
```

---

## 🎨 Frontend Deployment (Vercel)

**Platform:** Vercel

### Steps:

1. Import your GitHub repository into Vercel
2. Set the root directory to:

   ```
   frontend
   ```
3. Add environment variables
4. Deploy the frontend

---

## 🔐 Environment Variables

### Backend (Render)

| Variable      | Required    | Purpose                         |
| ------------- | ----------- | ------------------------------- |
| `JWT_SECRET`  | Yes         | Secret for signing JWTs         |
| `MONGODB_URI` | Yes         | MongoDB Atlas connection string |
| `CLIENT_URL`  | Yes         | Frontend URL (Vercel domain)    |
| `NODE_ENV`    | Recommended | Set to `production`             |

> ⚠️ Note: `PORT` is automatically handled by Render

---

### Frontend (Vercel)

| Variable       | Required | Purpose                              |
| -------------- | -------- | ------------------------------------ |
| `VITE_API_URL` | Yes      | Base URL of the deployed backend API |

Example:

```
VITE_API_URL=https://your-backend-name.onrender.com
```

---

## 🔗 Live URLs

* **Frontend Application:**
  https://urban-community.vercel.app/

* **Backend API:**
  https://urban-community-backend.onrender.com

---

## 📸 Deployment Screenshots

### Frontend (Live Application)

![Frontend](./screenshots/frontend.png)

### Backend API Response

![Backend](./screenshots/backend.png)

### Database (MongoDB Atlas)

![Database](./screenshots/database.png)

### Deployment Dashboard (Render)

![Deployment](./screenshots/deployment.png)

---

## 📝 Notes

* The backend is deployed as a **Node.js Web Service on Render**
* The frontend communicates with the backend using the deployed API URL
* Free-tier Render services may take a few seconds to respond after inactivity
* Environment variables are securely managed via Render and Vercel dashboards
