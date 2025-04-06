import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

const JUDGE0_API = axios.create({
  baseURL: "https://judge0-ce.p.rapidapi.com",
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "YOUR RAPID API KEY",
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
  }
});

// Judge0 language IDs mapping
const JUDGE0_LANGUAGES = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  csharp: 51,
  php: 68,
  c: 50,
  cpp: 54,
  ruby: 72,
  go: 60,
  rust: 73,
  swift: 83,
  kotlin: 78,
  html: 83, // Using Swift ID as placeholder
  css: 83,  // Using Swift ID as placeholder
  react: 63 // Using JavaScript ID
};

export const getAvailableLanguages = async () => {
  try {
    const response = await JUDGE0_API.get("/languages");
    return response.data.reduce((acc, lang) => {
      acc[lang.name.toLowerCase()] = true;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching languages:", error);
    return {};
  }
};

export const executeCode = async (language, sourceCode) => {
  const languageId = JUDGE0_LANGUAGES[language] || 63; // Default to JavaScript
  
  try {
    console.log("Submitting to Judge0:", {
      language,
      languageId,
      sourceCode: sourceCode.substring(0, 100) + (sourceCode.length > 100 ? "..." : "")
    });
    
    // Submit code (gets token)
    const { data: submitData } = await JUDGE0_API.post("/submissions", {
      source_code: sourceCode,
      language_id: languageId,
      stdin: "",
      wait: false // Don't wait - we'll poll for results
    });

    console.log("Submission token:", submitData.token);
    
    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 1000; // 1 second between attempts
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
      const { data } = await JUDGE0_API.get(`/submissions/${submitData.token}`);
      
      if (data.status && data.status.id > 2) { // Status > 2 means finished
        result = data;
        break;
      }
      attempts++;
    }

    if (!result) {
      throw new Error("Execution timed out");
    }

    console.log("Execution result:", result);
    
    return {
      run: {
        output: result.stdout || result.stderr || result.compile_output || "No output",
        stderr: result.stderr || result.compile_output,
        stdout: result.stdout
      }
    };
  } catch (error) {
    console.error("Execution failed:", error);
    throw new Error(`Error executing ${language} code`);
  }
};
