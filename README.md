
# 👩‍⚖️ LawyerUp – AI-Powered Legal Assistant

**LawyerUp** is a one-stop legal solution designed to simplify the legal process for individuals, professionals, and communities. Our web-based platform integrates AI to provide personalized legal support, document understanding, lawyer discovery, and more.

## 🚀 Live Preview  
> [🔗 Click here to view MVP ](https://tutorial-5151c.web.app/)

---

## 🧠 Features

- 💬 **AI Chatbot Legal Assistant** – Conversational AI (powered by Gemini) to answer legal queries in simple language.
- 📄 **Document Analyzer** – Upload legal documents and receive summarized explanations in your local language.
- 🧑‍💼 **Smart Lawyer Search** – Find lawyers based on filters like practice area, location, experience, and gender, powered by Google Maps API.
- 🗂 **Legal Document Repository** – Explore a collection of commonly used legal documents.
- 🧾 **User Dashboard** – Personalized space for users to manage chats, uploads, and lawyer interactions.
- 🏗 **Future Roadmap** – Document generation, real-time lawyer chat, virtual court guidance, and more.

---

## 🛠 Tech Stack

| Frontend | Backend | AI/ML | Storage/Auth | External APIs |
|---------|--------|--------|--------------|----------------|
| React.js | Node.js | Gemini API | Firebase Auth | Google Maps API |
| Tailwind CSS | LangChain | Pinecone | Firebase Firestore | – |
| – | – | – | Firebase Storage | – |

---

## 📁 Folder Structure
```
root/
├── frontend/         # ReactJS frontend with Tailwind CSS
├── backend/          # Node.js backend for API and Firebase logic
├── ML/               # Machine Learning models and scripts
├── public/           # Static assets
└── README.md

```

---

## ⚙️ Local Setup Instructions

Follow these simple steps to set up the project locally:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/lawyerup.git

# 2. Navigate into the cloned directory
cd lawyerup

# 3. Start the AI Document Analyser (ML service 1)
cd ml/AI_DOC_ANALYSER
python app.py

# 4. In a new terminal/tab, start the LawBot (ML service 2)
cd ml/lawbot/law
python app.py

# 5. In another terminal/tab, start the frontend
cd lawyerup/frontend
npm install
npm run dev

```

🌐 The app will now be running on `http://localhost:5173` (or another port if 5173 is in use).

---

## 📦 Requirements

- Firebase Project (Firestore, Storage, Auth enabled)
- API Key for Gemini (Gemini Pro / Gemini 1.5)
- Pinecone vector database API Key
- Google Maps API Key

---

## 🌟 Contribution

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🔐 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Team Chill Guys

- 👨‍💻 Team Lead: Arpit Anand  
- 👥 Members:  
  1. Snehal Gupta  
  2. Atharva Narkhede  
  3. Swarup Narkhede


---

## 📎 Links

- 🔗 [GitHub Repository](https://github.com/your-username/lawyerup)
- 📽 [Demo Video (3 mins)](https://your-video-link.com)
- 🌐 [Live MVP](https://your-mvp-link.com)
