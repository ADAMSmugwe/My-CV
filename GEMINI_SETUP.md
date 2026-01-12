# 🤖 Gemini AI Chatbot Setup

## Quick Start

### 1. Get Your API Key

**For Gemini Premium users:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account (the one with Premium)
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

**For Free Tier users:**
- Same steps as above, but you'll use `gemini-1.5-flash` model

### 2. Add Your API Key

Open `.env.local` file and replace `your_api_key_here` with your actual API key:

```
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 3. Restart Your Dev Server

Stop your current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

## Model Options

### Premium Users (Recommended):
Already set to: `gemini-1.5-pro`
- Most capable model
- Best reasoning
- Longer context (1M tokens)

### Free Tier Users:
Change line 30 in `ChatBot.jsx`:
```javascript
model: "gemini-1.5-flash",  // Fast and free
```

## Features

✅ **Real AI conversations** - Powered by Google Gemini
✅ **Context-aware** - Remembers conversation history
✅ **Personality** - Friendly and professional tone
✅ **Smart fallback** - Uses rule-based system if API fails
✅ **CV knowledge** - Knows everything about your resume

## Testing

Try these questions:
- "Tell me about your experience"
- "What's your most impressive project?"
- "How can I contact you?"
- "Do you know React?"
- "What makes you a great developer?"

## Troubleshooting

**Error: API key not found**
- Check `.env.local` file exists
- Verify API key is correct
- Restart dev server

**Slow responses**
- Normal for first request
- Premium users get faster responses
- Check your internet connection

**Fallback to rules**
- API key might be invalid
- Check console for errors
- Verify API key permissions

## Cost (Important!)

**Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- Perfect for CV website

**Premium:**
- Higher rate limits
- Better quality responses
- Access to Pro model

Your chatbot will work great on the free tier! 🎉
