# OpenAI Agent for Activity Suggestions

This project implements an AI agent that suggests activities based on location, weather, and local events. It's an improved version of the tutorial found at [OpenAI Cookbook: How to build an agent with the Node.js SDK](https://cookbook.openai.com/examples/how_to_build_an_agent_with_the_node_sdk). It integrates the TICKETMASTER API for finding local events. 

## Features

- Get user's location based on IP address with manual override option
- Fetch current weather data
- Search for local events using the Ticketmaster API
- Provide personalized activity suggestions based on time of day
- Enhanced error handling and fallback options

## Improvements Over the Tutorial

This implementation extends the original tutorial by:

1. Adding error handling and fallback options for location services
2. Implementing a local events search function using the Ticketmaster API
3. Enhancing the agent's ability to provide more contextual suggestions based on time of day
4. Allowing users to manually input their location if the IP-based geolocation is inaccurate
5. Implementing time-based activity recommendations

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

The agent will prompt for activity suggestions based on your location, the weather, local events, and the current time of day. If the automatically detected location is incorrect, you'll have the option to manually input your correct location.

## New Features

1. **Time-based Recommendations**: The agent now considers the time of day when suggesting activities, categorizing them into morning, afternoon, evening, and night activities.

2. **Location Confirmation**: Users can now confirm or correct their automatically detected location, ensuring more accurate activity suggestions.

3. **Enhanced Context**: The agent now includes the current time in its context, allowing for more relevant and timely suggestions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

This project is based on the tutorial from the [OpenAI Cookbook](https://cookbook.openai.com/examples/how_to_build_an_agent_with_the_node_sdk), with additional features and improvements.
