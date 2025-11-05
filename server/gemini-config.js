const API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(API_KEY);



// Define the expected JSON schema for the response
const responseSchema = {
type: "object",
    properties: {
        username: { type: "string", description: "The user's unique identifier." },
        //id: { type: "integer", description: "A numerical user ID." },
        email: { type: "string", format: "email", description: "The user's email address." },
        //isActive: { type: "boolean", description: "Indicates if the user account is active." },
    },
    //required: ["username", "id", "email", "isActive"],
    required: ["username", "email"],
};



// Function to generate JSON output based on a prompt
async function generateJsonOutput(prompt) {
    const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite", // Or gemini-1.5-flash
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema, // Use the schema defined above
    },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonOutput = response.text(); // This will be a JSON string
    //console.log('Generated JSON Output:', JSON.parse(jsonOutput));
    return JSON.parse(jsonOutput); // Parse the JSON string into a JavaScript object
}

module.exports = generateJsonOutput;