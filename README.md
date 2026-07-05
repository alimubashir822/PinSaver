Created & Developed by [Mubashir Ali](#developer-creator) (Full-Stack Healthcare Technology Engineer | AI Healthcare Solutions Builder)

# PinSaver 📌🎥

PinSaver is a premium, fully responsive, glassmorphic dark-themed web application and Chrome extension built to download high-resolution videos and images from Pinterest—**without requiring an official Pinterest API key**. 

It works by directly scraping Pinterest pages, parsing hydration scripts and Relay query caches, and streaming download attachments through a local proxy to bypass CORS restrictions.

---

## 🚀 Key Features

* **High-Res Media Extractor**: Scrapes Pinterest pages using `cheerio`. Robustly handles hydration scripts (`__PWA_DATA__`) and GraphQL client registers (`__PWS_RELAY_REGISTER_COMPLETED_REQUEST__`) to extract the highest quality MP4 video streams or JPEG/PNG originals.
* **Fallback Image Support**: Automatically detects if a Pin is a standard image rather than a video, displaying an image preview and offering high-resolution download variants.
* **CORS Proxy Downloader**: Streams media files directly to the client as attachments with sanitized titles and correct file extensions, resolving Pinterest's CDN access policies.
* **Batch Downloader Queue**: Queue up multiple Pin URLs and run them in batch mode. Track download stats and observe progress bars.
* **Personalized Dashboard**:
  * **Download History**: Stores chronological download logs linked to user accounts.
  * **Starred Favorites**: Bookmark frequently downloaded Pins for quick access.
  * **Collections**: Organize downloads into custom categoric folders (e.g., Travel, DIY, Fashion).
* **Companion Chrome MV3 Extension**: An unpacked Chrome extension that scans active tabs for Pinterest links and sends them to the PinSaver queue in one click.
* **Secure Client Authentication**: Session-based JSON Web Token (JWT) cookie authentication for multiple user accounts.
* **Responsive Fluid Design**: Mobile slide-over drawer layouts, custom clamp-based responsive typography, and stacked card components that scale seamlessly down to `320px` width.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: Next.js 15 (React 19, TypeScript)
* **Styling**: Tailwind CSS (with custom glassmorphism utilities)
* **Icons**: Lucide React

### Backend
* **Database**: SQLite (local persistence)
* **ORM**: Prisma (v6 Client)
* **Scraper**: Cheerio HTML parser
* **Auth**: Custom JWT cookie-based session tokens

---

## 📦 Getting Started

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** (v10.x or higher)

### Installation

1. Clone or copy the project files to your directory.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database schema and push to SQLite:
   ```bash
   npx prisma db push
   ```
   *This command will create a local `prisma/dev.db` file automatically.*

### Development Mode

Start the Next.js development server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build

Compile the application for production:
```bash
npm run build
```
Start the production server:
```bash
npm start
```

---

## 🔌 Installing the Companion Chrome Extension

1. Open Google Chrome.
2. Navigate to the extensions manager page at `chrome://extensions/`.
3. Enable **Developer mode** by checking the toggle button in the top right-hand corner.
4. Click **Load unpacked** in the top left-hand corner.
5. Select the `extension` directory located inside this project folder.
6. The PinSaver icon will appear in your Chrome toolbar. Click it on any Pinterest page to instantly push links to your queue!

---

<a id="developer-creator"></a>
## 👤 Developer & Creator

I am a Full-Stack Healthcare Technology Developer specializing in building modern, scalable, and AI-powered healthcare platforms. I create high-performance digital solutions using React.js, Next.js, TypeScript, and Tailwind CSS to deliver fast, secure, and user-friendly experiences.

My expertise covers complete application development, from frontend architecture and responsive interfaces to backend systems powered by Node.js, REST APIs, GraphQL, PostgreSQL, and Prisma ORM. I build reliable platforms designed for scalability, performance, and long-term growth.

I work with modern cloud infrastructure including AWS, Vercel Edge, Google Cloud, Cloudflare CDN, Docker, and CI/CD pipelines to deploy secure and optimized applications.

With a strong focus on healthcare technology, I develop solutions including patient portals, AI automation systems, EHR integrations, and healthcare applications built around industry standards such as FHIR APIs and HIPAA compliance requirements.

My goal is to combine modern software engineering, cloud technologies, and healthcare innovation to help organizations build smarter digital experiences that improve patient engagement, operational efficiency, and healthcare delivery.

### 📫 Connect with Me

- 💼 **LinkedIn**: <a href="https://linkedin.com/in/mubashirali822" target="_blank" rel="noopener noreferrer">mubashirali822</a>
- 📧 **Email**: <a href="mailto:alimubashir822@gmail.com" target="_blank" rel="noopener noreferrer">alimubashir822@gmail.com</a>
