## Goal

An Expo (Android) audiobook player with voice-activated, context-aware AI assistant for interaction with LibriVox audiobooks. The focus is to build a funbctional MVP as fast as possible without worrying about UI, optimizations, and elaborate error handling.

## Key Features

- LibriVox API integration that provides DRM-free audio files.
- A button which can be tapped by the user when a recording is being played
- User asks a question regarding the timestamp context (e.g, meaning of a word or details of an event mentioned in that particular moment of audiobook)
- The timestamp context and user query are sent to the AI
- AI responds with voice being aware of the book timestamp context and user query
- User can tap the button again and resume listening to the audiobook after receiving the answer

## MVP-focused Development Plan

- Stage 1 – LibriVox UI Shell: Build Expo screens for browsing/searching titles, book details, and core playback controls against mocked data.
- Stage 2 – LibriVox Integration: Connect the UI to the LibriVox API (audiobooks, audiotracks) to search, fetch metadata, and stream DRM-free audio.
- Stage 3 – Audio Experience: Implement background playback, timestamp capture, and resilience for slow networks or long recordings.
- Stage 4 – Assistant Pipeline: Capture current playback context, call the AI service, and return synthesized voice responses while pausing/resuming audio appropriately.
