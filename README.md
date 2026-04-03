# RoopRas - The Essence of Form

RoopRas is a minimalist generative interface designed to create unique, Notion-style avatars (Roops) with a single click. Built with React, Tailwind CSS, and powered by Google's latest Gemini 3.1 Flash Image model, it offers a clean and focused experience for generating abstract, high-contrast digital identities.

## ✨ Features

- **Minimalist Generation:** Create abstract, black-and-white avatars inspired by the "Notion Faces" aesthetic.
- **Recent Roops Gallery:** Keep track of your last 5 generations for quick viewing and downloading.
- **Themed Loading Experience:** Watch your "Roop" come to life with a themed loading sequence (Adding Primer, Applying Foundation, Final Glow, etc.).
- **Brutalist UI:** A bold, high-contrast interface with thick borders and sharp shadows.
- **Instant Export:** Download your generated avatars directly as PNG files.
- **Powered by Gemini:** Uses the latest `gemini-3.1-flash-image-preview` and `gemini-3-pro-image-preview` models for high-quality, fast image generation.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/roopras.git
   cd roopras
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Animations:** Motion (motion/react)
- **AI Integration:** @google/genai (Gemini 3.1 & 3.0 Image Models)
- **Icons:** Lucide React

## 🎨 Design Philosophy

RoopRas follows a "Brutalist Minimalist" design language. It celebrates structure, bold typography, and a restricted color palette to keep the focus entirely on the generative art.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Created with ❤️ using Google AI Studio Build.*
