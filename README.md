Instructions:

## 🚀 Setup Instructions

### 1. Clone the Repository
### 2. Go on the folder and run npm install
### 3. Create a .env.local file in the root directory and add your OpenAI key
### 4. Then run npm run dev and open http://localhost:3000 to use the app.

💡 How It Works
The app estimates clothing resale value by combining form inputs with GPT-4 reasoning:

User Input: Brand, category, original price, usage level, and age.

Prompt Engineering: These inputs are combined into a prompt to GPT-4 to mimic resale pricing logic.

GPT-4 Response: The LLM returns a dollar estimate based on realistic market intuition.

This method avoids building a traditional pricing model while still delivering strong estimation capabilities.
