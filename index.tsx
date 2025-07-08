/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- STATE AND TYPES --- //

interface Page {
  text: string;
  image_prompt: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface Story {
  title: string;
  pages: Page[];
}

let story: Story | null = null;
let currentPageIndex = 0;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let isLoading = false;
let ai: GoogleGenAI;

// --- DOM ELEMENTS --- //

const mainContainer = document.querySelector(".app-main") as HTMLElement;
const navButtons = document.querySelectorAll('.nav-button');

// --- INITIALIZATION --- //

function initialize() {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setupEventListeners();
    showView('home-view');
  } catch (e) {
    console.error(e);
    showError("خطا در راه‌اندازی اولیه. لطفاً از تنظیم بودن کلید API اطمینان حاصل کنید.");
  }
}

// --- VIEW MANAGEMENT --- //

function showView(viewId: 'home-view' | 'create-view' | 'book-viewer') {
  mainContainer.innerHTML = ''; // Clear previous content
  const template = document.getElementById(viewId) as HTMLTemplateElement;
  if (template) {
    const view = template.content.cloneNode(true);
    mainContainer.appendChild(view);
  } else {
      console.error(`View template not found: ${viewId}`);
  }

  // Special setup for views
  if (viewId === 'book-viewer') renderBookPage();
  if (viewId === 'create-view') {
     const form = mainContainer.querySelector("#story-form") as HTMLFormElement;
     form.addEventListener('submit', handleStoryFormSubmit);
  }

  // Update nav button active state
  navButtons.forEach(btn => {
    const id = btn.id.replace('nav-', '');
    let currentViewId = viewId;
    if (viewId === 'book-viewer') currentViewId = 'home-view'; // Keep home active for book view
    if (id === 'create' && viewId === 'create-view') {
        btn.classList.add('active');
    } else if (id === 'home' && currentViewId === 'home-view') {
        btn.classList.add('active');
    }
    else {
        btn.classList.remove('active');
    }
  });
}

function setupEventListeners() {
    document.getElementById('nav-home')?.addEventListener('click', () => {
        if (story) {
            showView('book-viewer');
        } else {
            showView('home-view');
        }
    });
    document.getElementById('nav-create')?.addEventListener('click', () => showView('create-view'));
}


// --- AI STORY GENERATION --- //

async function handleStoryFormSubmit(event: Event) {
    event.preventDefault();
    const promptInput = document.getElementById('story-prompt') as HTMLInputElement;
    const prompt = promptInput.value.trim();
    if (!prompt || isLoading) return;

    setLoading(true, "در حال نوشتن داستان...");
    try {
        const storyPages = await generateStoryPages(prompt);
        setLoading(true, "در حال کشیدن تصاویر...");

        const imagePromises = storyPages.map(async (page, index) => {
            setLoading(true, `در حال کشیدن تصویر ${index + 1} از ${storyPages.length}...`);
            const imageUrl = await generateImage(page.image_prompt);
            return { ...page, imageUrl };
        });

        const pagesWithImages = await Promise.all(imagePromises);

        story = { title: prompt, pages: pagesWithImages };
        currentPageIndex = 0;
        showView('book-viewer');
    } catch (e) {
        console.error(e);
        showError("متاسفانه در ساخت داستان خطایی رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
        setLoading(false);
    }
}

async function generateStoryPages(prompt: string): Promise<Page[]> {
    const generationPrompt = `یک داستان کوتاه کودکانه در مورد "${prompt}" بساز.
    داستان باید ۵ صفحه باشد. خروجی را در قالب JSON ارائه بده.
    JSON باید یک آرایه از اشیاء باشد، که هر شیء یک صفحه را نشان می‌دهد و دارای دو کلید است:
    'text' (متن داستان برای آن صفحه، به فارسی) و
    'image_prompt' (یک توضیح ساده و توصیفی برای تصویرسازی آن صفحه، به انگلیسی، مناسب برای هوش مصنوعی مولد تصویر).`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: generationPrompt,
        config: { responseMimeType: "application/json" },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
        return parsed as Page[];
    }
    throw new Error("پاسخ دریافتی از مدل در فرمت مورد انتظار نیست.");
}

async function generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `child-friendly, simple, colorful, storybook illustration of: ${prompt}`,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

// --- BOOK VIEWER & RENDERING --- //

function renderBookPage() {
    if (!story) {
        showView('home-view');
        return;
    }

    const page = story.pages[currentPageIndex];

    const bookViewer = document.getElementById('book-viewer');
    if (!bookViewer) {
         // Create the view if it doesn't exist
        const template = document.getElementById('book-viewer-template') as HTMLTemplateElement;
        const view = template.content.cloneNode(true);
        mainContainer.innerHTML = '';
        mainContainer.appendChild(view);
    }

    const pageImage = document.querySelector(".page-image") as HTMLElement;
    const pageText = document.querySelector(".page-text") as HTMLElement;
    const prevButton = document.getElementById("prev-page") as HTMLButtonElement;
    const nextButton = document.getElementById("next-page") as HTMLButtonElement;
    const recordButton = document.getElementById('record-button') as HTMLButtonElement;
    const audioPlayback = document.getElementById('audio-playback') as HTMLAudioElement;

    pageImage.innerHTML = page.imageUrl ? `<img src="${page.imageUrl}" alt="${page.image_prompt}">` : '<div class="spinner"></div>';
    pageText.textContent = page.text;
    
    prevButton.disabled = currentPageIndex === 0;
    nextButton.disabled = currentPageIndex === story.pages.length - 1;

    prevButton.onclick = () => { if (currentPageIndex > 0) { currentPageIndex--; renderBookPage(); } };
    nextButton.onclick = () => { if (currentPageIndex < story.pages.length - 1) { currentPageIndex++; renderBookPage(); } };

    // Handle recording UI
    recordButton.onclick = toggleRecording;
    if (page.audioUrl) {
        audioPlayback.src = page.audioUrl;
        audioPlayback.classList.remove('hidden');
    } else {
        audioPlayback.classList.add('hidden');
    }
}


// --- AUDIO RECORDING --- //

async function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        document.getElementById('record-button')?.classList.remove('recording');
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                if (story) {
                    story.pages[currentPageIndex].audioUrl = audioUrl;
                }
                renderBookPage();
                // In a real app, you'd upload this blob to a server.
            };

            mediaRecorder.start();
            document.getElementById('record-button')?.classList.add('recording');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            showError("دسترسی به میکروفون امکان‌پذیر نیست. لطفاً دسترسی لازم را بدهید.");
        }
    }
}


// --- UI HELPERS (LOADING & ERROR) --- //

function setLoading(show: boolean, text: string = "") {
  isLoading = show;
  const view = document.getElementById('create-view');
  if(!view) return;

  const form = view.querySelector('#story-form');
  const loader = view.querySelector('.loading-indicator');
  const button = view.querySelector('#generate-button') as HTMLButtonElement;
  const loaderText = view.querySelector('#loading-text');

  if (show) {
    form?.classList.add('hidden');
    loader?.classList.remove('hidden');
    if(loaderText) loaderText.textContent = text;
  } else {
    form?.classList.remove('hidden');
    loader?.classList.add('hidden');
  }

  if (button) {
    button.disabled = show;
  }
}

function showError(message: string) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    mainContainer.innerHTML = '';
    mainContainer.appendChild(errorElement);
}

// --- TEMPLATES (in-JS for simplicity) --- //
function addTemplates() {
    const templates = `
    <template id="home-view">
        <div class="view active">
            <p>سلام! به «راما» خوش آمدید.<br>برای شروع، از منوی پایین یک داستان جدید بسازید.</p>
        </div>
    </template>
    <template id="create-view">
        <div class="view active" id="create-story-container">
             <form id="story-form">
                <label for="story-prompt">دوست داری داستان در مورد چی باشه؟</label>
                <input type="text" id="story-prompt" placeholder="مثلاً: یک اژدهای مهربون که آشپزی دوست داره" required>
                <button type="submit" id="generate-button">
                    <i class="fas fa-magic-sparkles"></i>
                    <span>بساز!</span>
                </button>
            </form>
            <div class="loading-indicator hidden">
                <div class="spinner"></div>
                <p id="loading-text">در حال ساخت داستان...</p>
            </div>
        </div>
    </template>
    <template id="book-viewer">
        <div id="book-viewer" class="view active">
            <div class="page-container">
                <div class="page-image"></div>
                <p class="page-text"></p>
            </div>
            <div class="recording-controls">
                <button id="record-button" aria-label="ضبط صدا">
                    <i class="fas fa-microphone"></i>
                </button>
                <audio id="audio-playback" controls class="hidden"></audio>
            </div>
            <div class="book-nav">
                <button class="book-nav-button" id="next-page" aria-label="صفحه بعد"><i class="fas fa-chevron-right"></i></button>
                <button class="book-nav-button" id="prev-page" aria-label="صفحه قبل"><i class="fas fa-chevron-left"></i></button>
            </div>
        </div>
    </template>
    `;
    document.body.insertAdjacentHTML('beforeend', templates);
}


// --- APP START --- //
addTemplates();
document.addEventListener("DOMContentLoaded", initialize);
