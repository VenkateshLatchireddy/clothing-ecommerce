# 👕 Clothing E-Commerce Store

A full-stack MERN e-commerce application for clothing products.

## 🚀 Live Demo
- **Frontend**: [Vercel Link]()
- **Backend**: [Render Link]()
- **API Documentation**: [Add when available]()

## 📋 Features
- ✅ User Authentication (Register/Login/Logout)
- ✅ Product Catalog with Filtering
- ✅ Shopping Cart Management
- ✅ Order Processing
- ✅ Responsive Design
- ✅ Secure Payments

## 🛠 Tech Stack
### Frontend
- React 18
- React Router DOM
- Vite
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure  



clothing-ecommerce/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ └── server.js
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── context/
│ │ ├── pages/
│ │ └── services/
│ ├── public/
│ └── package.json
└── README.md



## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB URI and JWT secret to .env
npm run dev 



Frontend Setup

cd frontend
npm install
cp .env.example .env
# Add your API URL to .env
npm run dev 

🔧 Environment Variables
Backend (.env) 


MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000  


Frontend (.env) 

VITE_API_URL=http://localhost:5000 


📝 API Endpoints 



Method	   Endpoint      	            Description

POST	/api/auth/register	            User registration
POST	/api/auth/login	                User login
GET	    /api/products	                    Get all products
GET	    /api/products/:id	                Get single product
GET	    /api/cart	                        Get user cart
POST    /api/cart/add	                Add to cart
PUT	    /api/cart/update	                Update cart item
POST	/api/orders             	    Create order   

🚀 Deployment  

Connect GitHub repo to Render

Set environment variables

Deploy!  

🚀 Deployment 

Frontend (Vercel)
Connect GitHub repo to Vercel

Set environment variables

Deploy!
