// services/apiService.js
import axios from "axios";

// Backend API client (Laravel)
const backendAPI = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Ollama API client
const ollamaAPI = axios.create({
  baseURL: "http://172.29.63.184:11434/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Piston API client for code execution
const pistonAPI = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

// Add auth token interceptor for backend API
backendAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Generate level content using Ollama
  generateLevelContent: async (levelId, difficulty = "beginner") => {
    try {
      const topics = {
        1: "variables and basic data types",
        2: "conditional statements (if/else)",
        3: "loops (for and while)",
        4: "functions and parameters",
        5: "lists and basic operations",
        6: "dictionaries and key-value pairs",
        7: "string manipulation",
        8: "error handling with try/except",
      };

      const topic = topics[levelId] || "basic Python concepts";

      const prompt = `Generate a ${difficulty}-level Python coding exercise focused on ${topic}. 

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Use escaped strings for multi-line code.

{
  "title": "Exercise title",
  "objective": "Brief description of what the student will learn",
  "description": "Detailed explanation of the exercise",
  "starter_code": "Python code with TODO comments as a single escaped string",
  "solution": "Complete working solution as a single escaped string",
  "hints": [
    "Hint 1: Specific guidance for the first part",
    "Hint 2: Specific guidance for the second part"
  ],
  "test_cases": [
    {
      "input": "sample input",
      "expected_output": "expected result"
    }
  ],
  "key_concepts": ["concept1", "concept2"]
}

The starter_code should have clear # TODO: comments showing exactly where students need to add or fix code. Make it educational and engaging. Use \\n for line breaks in code strings.`;

      const response = await ollamaAPI.post("/generate", {
        model: "qwen2.5-coder:7b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      });

      // Parse the JSON response from the model
      const content = response.data.response.trim();
      console.log("Raw response:", content);

      try {
        // Try to extract JSON from the response
        let jsonString = content;

        // Remove any markdown code blocks if present
        jsonString = jsonString
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "");

        // Find the JSON object
        const jsonStart = jsonString.indexOf("{");
        const jsonEnd = jsonString.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
        }

        // Parse the JSON
        const parsedContent = JSON.parse(jsonString);

        // Validate required fields
        const requiredFields = [
          "title",
          "objective",
          "description",
          "starter_code",
          "solution",
          "hints",
        ];
        const missingFields = requiredFields.filter(
          (field) => !parsedContent[field]
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        return parsedContent;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        console.error("Content that failed to parse:", content);

        // Fallback response with proper structure
        return {
          title: `Level ${levelId}: Python ${
            topic.charAt(0).toUpperCase() + topic.slice(1)
          }`,
          objective: `Learn ${topic} in Python`,
          description: `Complete the code to practice ${topic}. Follow the TODO comments to guide your implementation.`,
          starter_code: `# TODO: Write your code here for ${topic}\n# Start by reading the problem carefully\nprint("Starting Level ${levelId}")`,
          solution: `# Solution for ${topic}\nprint("Level ${levelId} completed!")`,
          hints: [
            `Focus on ${topic} concepts`,
            "Read the TODO comments carefully",
            "Test your code step by step",
          ],
          test_cases: [
            {
              input: "",
              expected_output: `Level ${levelId} completed!`,
            },
          ],
          key_concepts: [topic.replace(" and ", ", ").split(" ")[0]],
        };
      }
    } catch (error) {
      console.error("Error generating level content:", error);
      throw error;
    }
  },

  // Get AI hint for user's code
  getCodeHint: async (levelId, userCode, levelContent) => {
    try {
      const prompt = `You are a helpful Python tutor. A student is working on this exercise:

Exercise: ${levelContent.title}
Objective: ${levelContent.objective}
Expected Solution: ${levelContent.solution}

Student's current code:
${userCode}

Analyze the student's code and provide a helpful hint. Return ONLY valid JSON:

{
  "hint": "Specific, encouraging hint about what to fix or improve",
  "severity": "info",
  "line_number": 1,
  "suggestion": "Concrete suggestion for improvement"
}

Be encouraging and provide specific guidance without giving away the complete solution.`;

      const response = await ollamaAPI.post("/generate", {
        model: "qwen2.5-coder:7b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
        },
      });

      const content = response.data.response.trim();
      console.log("Hint response:", content);

      try {
        // Clean up the response similar to level content
        let jsonString = content;
        jsonString = jsonString
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "");

        const jsonStart = jsonString.indexOf("{");
        const jsonEnd = jsonString.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }

        throw new Error("No valid JSON found");
      } catch (parseError) {
        console.error("Failed to parse hint response:", parseError);

        // Fallback hint
        return {
          hint: "Check your syntax and variable names. Make sure they match the requirements.",
          severity: "info",
          line_number: 1,
          suggestion: "Review the TODO comments for guidance.",
        };
      }
    } catch (error) {
      console.error("Error getting code hint:", error);
      throw error;
    }
  },

  // Execute code using Piston API
  executeCode: async (language, sourceCode) => {
    try {
      const response = await pistonAPI.post("/execute", {
        language: language,
        version: "3.10.0",
        files: [{ content: sourceCode }],
      });
      return response.data;
    } catch (error) {
      console.error("Error executing code:", error);
      throw error;
    }
  },

  // Backend API calls
  backend: {
    // Submit user's code solution
    submitCode: async (levelId, code, isCorrect) => {
      try {
        const response = await backendAPI.post("/submissions", {
          level_id: levelId,
          code: code,
          is_correct: isCorrect,
        });
        return response.data;
      } catch (error) {
        console.error("Error submitting code:", error);
        throw error;
      }
    },

    // Get user's submissions for a level
    getSubmissions: async (levelId) => {
      try {
        const response = await backendAPI.get(
          `/submissions?level_id=${levelId}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }
    },

    // Get user progress
    getUserProgress: async () => {
      try {
        const response = await backendAPI.get("/user/progress");
        console.log("User progress data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching user progress:", error);
        throw error;
      }
    },

    // Update user progress
    updateProgress: async (levelId, score, isCompleted) => {
      try {
        const response = await backendAPI.post("/user/progress", {
          level_id: levelId,
          score: score,
          is_completed: isCompleted,
        });
        return response.data;
      } catch (error) {
        console.error("Error updating progress:", error);
        throw error;
      }
    },

    // Get level data (if stored in backend)
    getLevel: async (levelId) => {
      try {
        const response = await backendAPI.get(`/levels/${levelId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching level:", error);
        throw error;
      }
    },
  },
};

export default apiService;
