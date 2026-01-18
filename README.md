# 👤 RoopRas: The Essence of Form

RoopRas (formerly MonoFace) is an AI-driven tool that generates unique, high-contrast, monochrome avatars in the popular "Notion Faces" aesthetic. Built with React and powered by Google's **Imagen 4.0** through the Gemini API.

## 🚀 Overview

The goal of RoopRas is to provide a seamless, one-click solution for creating minimalist digital identities. By utilizing dynamic prompt randomization, the app ensures that no two avatars are exactly alike, while strictly adhering to a pure black-and-white, stippled art style.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **AI Engine:** Google Gemini API (Imagen 4.0)
- **Styling:** Dynamic Prompt Engineering for aesthetic consistency

## ✨ Benefits

- **Strict Aesthetic Control:** Unlike general-purpose AI generators, RoopRas is hard-coded to produce only pure black-and-white images. This ensures a consistent look for design systems or team directories.
- **Privacy-First Identity:** Provides a creative way for users to represent themselves online without using personal photographs.
- **Infinite Variety:** Uses a modular prompt construction system (randomizing head shapes, eyes, mouths, and accessories) to prevent repetitive outputs.
- **Zero Configuration:** No sliders or complex prompts needed. One button handles the entire creative process.
- **Instant Download:** Generates high-quality PNGs ready for immediate use.

## ⚠️ Cons & Limitations

- **Strictly Monochrome:** By design, the app does not support colors.
- **API Dependency:** Requires an active connection to the Google Gemini API.
- **Fixed Perspective:** Optimized for front-facing minimalist portraits.

## ⚙️ Setup

1. Clone the repository.
2. Ensure you have a valid Google Gemini API Key.
3. Set your environment variable: `process.env.API_KEY`.
4. Run the development server to start generating.

---
*Created with ❤️ for the minimalist community. RoopRas v1.1*
