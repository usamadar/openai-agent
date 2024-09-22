# OpenAI Agent for Activity Suggestions

This project implements an AI agent that suggests activities based on location, weather, and local events. It's an improved version of the tutorial found at [OpenAI Cookbook: How to build an agent with the Node.js SDK](https://cookbook.openai.com/examples/how_to_build_an_agent_with_the_node_sdk). It integrates the TICKETMASTER API for finding local events. 

## Features

- Get user's location based on IP address
- Fetch current weather data
- Search for local events
- Provide personalized activity suggestions

## Improvements Over the Tutorial

This implementation extends the original tutorial by:

1. Adding error handling and fallback options for location services
2. Implementing a local events search function using the Ticketmaster API
3. Enhancing the agent's ability to provide more contextual suggestions

## Prerequisites

- Node.js
- npm
- OpenAI API key
- Ticketmaster API key

## Installation

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
   ```

   Make sure to replace `your_openai_api_key_here` and `your_ticketmaster_api_key_here` with your actual API keys.

4. Ensure that the `.env` file is added to your `.gitignore` to keep your API keys secure.

## Usage

Run the script with:

```
node activities.js
```

The agent will prompt for activity suggestions based on your location, the weather, and local events.
