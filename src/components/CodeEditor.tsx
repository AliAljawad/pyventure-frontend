import { useRef, useState, useEffect } from "react";
import {
  Play,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";
import * as monaco from "monaco-editor";

// Create API client for Piston
const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

// Function to execute code via Piston API
const executeCode = async (language, sourceCode) => {
  const response = await API.post("/execute", {
    language: language,
    version: "3.10.0", // Default for Python, can be made dynamic
    files: [
      {
        content: sourceCode,
      },
    ],
  });
  return response.data;
};

const CodeEditor = () => {
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [language, setLanguage] = useState("python");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

 const runCode = async () => {
   setIsRunning(true);
   setOutput("");
   setHasError(false);

   try {
     // Ensure editorRef.current is defined
     if (!editorRef.current) {
       toast.error("Editor is not ready", {
         description: "Please wait for the editor to load.",
       });
       setIsRunning(false);
       return;
     }

     // Get the current code from the editor
     const sourceCode = editorRef.current.getValue();

     // Send code to Piston API
     const result = await executeCode(language, sourceCode);

     // Handle the API response
     if (result.run.stderr) {
       // Show error output
       setOutput(result.run.stderr);
       setHasError(true);
       toast.error("Code execution failed", {
         description: "Check your syntax and try again.",
       });
     } else {
       // Handle successful execution
       setOutput(result.run.stdout);
     }
   } catch (error) {
     setHasError(true);
     toast.error("An unexpected error occurred", {
       description: error.message || "Please try again later.",
     });
   } finally {
     setIsRunning(false);
   }
 };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="w-full">
      <Card className="cosmic-card overflow-hidden mb-6">
        <div className="p-4 border-b border-space-nebula/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Level 1: Syntax Sands
              </h3>
              <p className="text-gray-400">
                Fix the functions to find the hidden treasure
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="w-40 bg-space-deep-purple/30 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-gradient-to-r from-space-nebula to-space-neon-cyan h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-white text-xs">{progress}%</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-space-meteor-orange text-space-meteor-orange hover:bg-space-meteor-orange/10"
                onClick={toggleHint}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Hint
              </Button>
            </div>
          </div>

          {showHint && (
            <div className="mt-4 p-3 bg-space-deep-purple/20 border border-space-meteor-orange/30 rounded-lg">
              <p className="text-space-meteor-orange flex items-start">
                <Lightbulb className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>
                  Check the variable names carefully. Make sure the parameters
                  of{" "}
                  <code className="bg-space-deep-purple/40 px-1 rounded">
                    print
                  </code>{" "}
                  match the way it's being called later in the code.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Horizontal layout with editor and output side by side */}
        <div className="flex flex-col md:flex-row">
          {/* Code editor area - left side */}
          <div className="w-full md:w-1/2 md:border-r border-space-nebula/20">
            <div className="bg-[#1E1E1E] h-[500px]">
              <Editor
                options={{
                  minimap: {
                    enabled: false,
                  },
                  suggest: {
                    showWords: true,
                    showSnippets: true,
                    showClasses: true,
                    showFunctions: true,
                    showVariables: true,
                    preview: true,
                  },
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                  wordBasedSuggestions: "currentDocument",
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  autoSurround: "languageDefined",
                  tabCompletion: "on",
                }}
                height="500px"
                theme="vs-dark"
                language={language}
                onMount={onMount}
                value={code}
                onChange={(value) => setCode(value)}
              />
            </div>
          </div>

          {/* Output area - right side */}
          <div className="w-full md:w-1/2">
            <div className=" p-1 bg-black font-mono text-sm h-[500px] overflow-auto">
              {output ? (
                <pre
                  className={cn(
                    "whitespace-pre-wrap",
                    hasError ? "text-red-400" : "text-green-400"
                  )}
                >
                  {output}
                </pre>
              ) : (
                <div className="text-gray-500 italic">
                  Run your code to see output...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls at the bottom */}
        <div className="p-3 border-t border-space-nebula/20 flex justify-between items-center bg-space-deep-purple/20">
          <div className="flex space-x-2">
            <Button
              onClick={runCode}
              className="cosmic-button"
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-400">
            <Info className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="link" className="text-space-nebula">
          Previous Challenge
        </Button>
        <Button
          disabled={progress < 100}
          className={cn(
            "cosmic-button",
            progress < 100 && "opacity-50 cursor-not-allowed"
          )}
        >
          Next Challenge
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;
