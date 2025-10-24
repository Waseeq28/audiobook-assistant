## Goal

An Expo (Android) audiobook player with voice-activated, context-aware AI assistant for interaction with LibriVox audiobooks. The focus is to build a funbctional MVP as fast as possible without worrying about UI, optimizations, and elaborate error handling.

## Key Features

- LibriVox API integration that provides DRM-free audio files.
- A search feature for getting audiobooks from LibriVox and an upload feature which lets user upload from mobile storage
- An audio player for the audiobooks
- An AI Assistant button in the audio player tapping which leads to a totally automated and immediate "Assistant Flow" as follows:

    1) An audio clip is created and transcribed (clip-transcription) with a window of few seconds before and after the current timestamp to provide the context of the audiobook
    2) The voice recorder is enabled, user asks the question (e.g, meaning of a word or details of an event mentioned), which is then transcribed (user-transcription)
    3) Both clip and user transcriptions are sent to an AI which has the audiobook context and the user's query
    4) AI gives a response, and the response is converted to voice 
    5) Once the flow is completed and user's query is answered, audiobook playback can be manually resumed by the user

- Create test UIs for every step, but once success is confirmed for each component, the test UI is removed.
- Final UI has a minimalist, user frinedly player with one button for controlling the Assistant Flow. Rest of processing happens in the background
- The button uses text for indicating the status (listening, processing, speaking).  

## Audio Clipper Requirement

Implement an audio clipping service using Vercel serverless deployment. It can extract a short window around the current playback timestamp, return the clipped snippet for local preview, and supply the same segment to downstream transcription.