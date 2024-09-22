const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const axios = require('axios');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async function getLocation() {
    try {
      const response = await axios.get("https://ipapi.co/json/", {
        headers: {
          'User-Agent': 'curl/7.64.1'
        }
      });
      console.log("Detected location:", response.data.city);
      
      // Ask user to confirm or correct the location
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        readline.question(`Is ${response.data.city} your correct location? (Y/N) `, async (answer) => {
          if (answer.toLowerCase() === 'y') {
            readline.close();
            resolve(response.data);
          } else {
            const manualCity = await new Promise((res) => {
              readline.question('Please enter your correct city: ', (city) => {
                readline.close();
                res(city);
              });
            });
            resolve({ ...response.data, city: manualCity });
          }
        });
      });
    } catch (error) {
      console.error("Error fetching location:", error.message);
      // Fallback to alternative service
      try {
        const fallbackResponse = await axios.get("https://ipinfo.io/json");
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("Error fetching location from fallback service:", fallbackError.message);
        throw new Error("Unable to fetch location data");
      }
    }
  }

  async function getCurrentWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
    const response = await fetch(url);
    const weatherData = await response.json();
    return weatherData;
  }

  async function searchLocalEvents(city, startDate, endDate) {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    
    // Convert dates to the required format
    const formatDate = (date) => {
      return new Date(date).toISOString().split('.')[0] + "Z";
    };

    const startDateTime = formatDate(startDate);
    const endDateTime = formatDate(endDate);
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&apikey=${apiKey}`;
    console.log(url);  // Log the URL for debugging

    try {
      const response = await axios.get(url);
      const events = response.data._embedded?.events || [];
      return events.slice(0, 5).map(event => ({
        name: event.name,
        date: event.dates.start.localDate,
        time: event.dates.start.localTime,
        venue: event._embedded.venues[0].name
      }));
    } catch (error) {
      console.error("Error fetching events:", error.response ? error.response.data : error.message);
      return [];
    }
  }

  async function getTimeBasedSuggestions(time) {
    const date = new Date(time);
    const hour = date.getHours();
    const localTime = date.toLocaleTimeString();
  
    console.log(`Current time: ${localTime}, Hour: ${hour}`);

    if (hour >= 5 && hour < 12) {
      console.log("Suggesting morning activities");
      return "morning activities (5 AM to 11:59 AM)";
    } else if (hour >= 12 && hour < 17) {
      console.log("Suggesting afternoon activities");
      return "afternoon activities (12 PM to 4:59 PM)";
    } else if (hour >= 17 && hour < 21) {
      console.log("Suggesting evening activities");
      return "evening activities (5 PM to 8:59 PM)";
    } else {
      console.log("Suggesting night activities");
      return "night activities (9 PM to 4:59 AM)";
    }
  }

  const tools = [
    {
      type: "function",
      function: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            latitude: {
              type: "string",
            },
            longitude: {
              type: "string",
            },
          },
          required: ["longitude", "latitude"],
        },
      }
    },
    {
      type: "function",
      function: {
        name: "getLocation",
        description: "Get the user's location based on their IP address",
        parameters: {
          type: "object",
          properties: {},
        },
      }
    },
    {
      type: "function",
      function: {
        name: "searchLocalEvents",
        description: "Search for local events in a given city",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "The city to search for events in"
            },
            startDate: {
              type: "string",
              description: "The start date for the event search (YYYY-MM-DD)"
            },
            endDate: {
              type: "string",
              description: "The end date for the event search (YYYY-MM-DD)"
            }
          },
          required: ["city", "startDate", "endDate"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "getTimeBasedSuggestions",
        description: "Get activity suggestions based on the time of day",
        parameters: {
          type: "object",
          properties: {
            time: {
              type: "string",
              description: "The current time in ISO 8601 format"
            }
          },
          required: ["time"]
        }
      }
    },
  ];
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant. You can suggest activities based on location, weather and time of day. Only use the functions you have been provided with.",
    },
  ];

  const availableTools = {
    getCurrentWeather,
    getLocation,
    searchLocalEvents,
    getTimeBasedSuggestions
  };
  
  async function agent(userInput) {
    messages.push({
      role: "user",
      content: userInput,
    });

    // Add current time to the context
    const currentTime = new Date().toISOString();
    messages.push({
      role: "system",
      content: `Current time is ${currentTime}`,
    });

    for (let i = 0; i < 5; i++) {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages,
          tools: tools,
        });
        const { finish_reason, message } = response.choices[0];
       
        if (finish_reason === "tool_calls" && message.tool_calls) {
          const functionName = message.tool_calls[0].function.name;
          const functionToCall = availableTools[functionName];
          const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
          const functionArgsArr = Object.values(functionArgs);
          const functionResponse = await functionToCall.apply(null, functionArgsArr);
       
          // Log the result of the function call
          console.log(`Result of ${functionName}:`, JSON.stringify(functionResponse, null, 2));
       
          messages.push({
            role: "function",
            name: functionName,
            content: `
                The result of the last function was this: ${JSON.stringify(
                  functionResponse
                )}
                `,
          });
        } else if (finish_reason === "stop") {
          messages.push(message);
          return message.content;
        }
      }
      return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";

  }

 async function main() {
  try {
    const response = await agent("Please suggest some activities based on my location, the weather, and the current time.");
    console.log(response);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();