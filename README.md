# Agricultural Super App

A comprehensive platform designed to centralize agricultural information and foster networking among agricultural experts, promoting sustainable practices and productivity.

## Vision

Empower farmers and agricultural professionals by addressing challenges such as limited information access, fragmented supply chains, financial constraints, low technology adoption, and data privacy. The goal is to build a vibrant digital ecosystem for seamless knowledge sharing and resource access.

## Core Features

- User registration, authentication, and profile management
- Browse and interact with agricultural blogs/posts
- Follow/unfollow experts and communities
- Real-time messaging (direct and group chats)
- Create and manage blog posts (with image support)
- Comment on and like posts

## Technology Stack

**Backend:**  
- Python Flask  
- PostgreSQL  
- Testing: unittest

**Frontend:**  
- React.js  
- Redux Toolkit  
- CSS Modules / CSS  
- Testing: Jest

**Design:**  
- Figma (mobile-friendly wireframes)

## Getting Started

Refer to `backend/README.md` and `frontend/README.md` for setup and usage instructions.

## Project Structure

```
.
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── routes.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── migrations/
│   ├── uploads/
│   ├── tests/
│   ├── utils/
│   ├── static/
│   ├── templates/
│   └── README.md
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── .env
│   └── README.md
├── .gitignore
├── package.json
└── README.md
```

---

**Version Control Workflow**

1. Navigate to the project root:
    ```bash
    cd ~/Development/code/Phase-5/Final-Project/Agricultural-Super-App-/agricultural_super_app/
    ```
2. Stage changes:
    ```bash
    git add README.md
    ```
3. Commit:
    ```bash
    git commit -m "docs: Update README with core features and structure"
    ```
