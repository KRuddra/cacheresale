# 🧥 Cache Resell Estimator

A lightweight web app that estimates the resale value of second-hand clothing using OpenAI's GPT-4. Built for the Cache technical assignment.

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cache-resell-estimator.git
cd cache-resell-estimator
2. Install Dependencies
Ensure you have Node.js and npm installed. Then, run:

bash
Copy
Edit
npm install
3. Add Your OpenAI API Key
Create a .env.local file in the root directory and add your OpenAI key:

ini
Copy
Edit
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
⚠️ Note: Since the key is exposed client-side (NEXT_PUBLIC_), it's recommended to use a restricted OpenAI key with rate and permission limits.

4. Start the Development Server
bash
Copy
Edit
npm run dev
Then navigate to http://localhost:3000 to use the app.

💡 How It Works
The app estimates clothing resale value by combining form inputs with GPT-4 reasoning:

User Input: Brand, category, original price, usage level, and age.

Prompt Engineering: These inputs are combined into a prompt to GPT-4 to mimic resale pricing logic.

GPT-4 Response: The LLM returns a dollar estimate based on realistic market intuition.

Client-Only Architecture: No backend needed — the OpenAI call runs entirely in-browser.

This method avoids building a traditional pricing model while still delivering strong estimation capabilities.

🧠 Why GPT-4?
By leveraging GPT-4 instead of building a resale pricing model from scratch:

🧠 You get nuanced understanding of brand perception, depreciation, and wear

🧩 It adapts to diverse product types, styles, and categories

⚡️ It works with minimal data and delivers fast results

🛠️ Zero backend or training pipelines to maintain

🛠️ Tech Stack
Framework: Next.js (App Router)

API: OpenAI GPT-4

Styling: Tailwind CSS

Deployment: Vercel (fully compatible)
