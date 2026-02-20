# GlitchJS

A lightweight, zero‑dependency utility library designed for modern web apps.  
UMD compatible — works in Browser, Node (CJS), AMD, and ESM environments.

GlitchJS powers My‑Radio.io but is flexible enough for any project.  
It bundles environment detection, DOM helpers, timing utilities, media tools, a global audio volume controller, a client‑side abuse limiter, and a remote cipher API integration.

---

## ✨ Features

### **Environment Detection**
- `isNode`, `isBrowser`, `isMobile`, `isTouch`, `isOnline`
- Capability checks for audio, video, localStorage, and more

### **DOM Helpers**
- `create(tag, attrs)`
- `$` and `$all` selectors
- Safe element creation and manipulation

### **Timing Utilities**
- `debounce(fn, ms)`
- `throttle(fn, ms)`
- `wait(ms)` Promise‑based delay

### **Media Helpers**
- `formatTime(seconds)`
- `loadAudio(url)` with error handling
- Global volume control for all audio elements

### **UUID Generation**
- Cryptographically strong when available  
- Fallback to a safe pseudo‑random generator

### **Permissions Manager**
- Unified interface for browser permissions  
- Supports `"never"` and `"always"` modes stored in localStorage

### **K1LLBOT (Client‑Side Abuse Limiter)**
- Tracks click and key events  
- Detects flooding  
- Temporarily locks input to prevent abuse  
- Fully client‑side and customizable

### **Cipher API Integration**
- `GlitchJS.cipher(text, key, raw)`  
- Calls an external POST‑only API for hashing  
- Flexible key input (array, comma‑string, or number)  
- Built‑in error handling

### **Robust Error Handling**
- `GJSLogError()`  
- `GJSError(code, message)`  
- Debug mode for verbose logging

---

## 📦 Installation

```bash
npm install glitchjs
