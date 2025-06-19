import { useRef, useState, useEffect } from "react";
import {
  Play,
  Info,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  Send,
  TestTube,
  Eye,
  EyeOff,
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import apiService from "@/api/code-editor";

const CodeEditor = ({ levelId = 1, onLevelComplete }) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTestCases, setShowTestCases] = useState(false); // New state for test cases visibility
  const [language, setLanguage] = useState("python");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Level content state
  const [levelContent, setLevelContent] = useState(null);
  const [isLoadingLevel, setIsLoadingLevel] = useState(true);
  const [currentHint, setCurrentHint] = useState(null);
  const [aiHints, setAiHints] = useState([]);

  // Load level content on mount
  useEffect(() => {
    loadLevelContent();
  }, [levelId]);

  const loadLevelContent = async () => {
    setIsLoadingLevel(true);
    try {
      const content = await apiService.generateLevelContent(levelId);
      setLevelContent(content);
      setCode(content.starter_code || "");

      toast.success("Level loaded successfully!", {
        description: content.title,
      });
    } catch (error) {
      console.error("Failed to load level:", error);
      toast.error("Failed to load level content", {
        description: "Please try refreshing the page.",
      });

      // Fallback content
      setLevelContent({
        title: `Level ${levelId}: Python Challenge`,
        objective: "Complete the coding challenge",
        description: "Write Python code to solve the given problem",
        starter_code: "# TODO: Write your code here\n",
        hints: ["Start by reading the problem carefully"],
      });
      setCode("# TODO: Write your code here\n");
    } finally {
      setIsLoadingLevel(false);
    }
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setHasError(false);

    try {
      if (!editorRef.current) {
        toast.error("Editor is not ready", {
          description: "Please wait for the editor to load.",
        });
        return;
      }

      const sourceCode = editorRef.current.getValue();

      // Execute code
      const result = await apiService.executeCode(language, sourceCode);

      if (result.run.stderr) {
        setOutput(result.run.stderr);
        setHasError(true);
        toast.error("Code execution failed", {
          description: "Check your syntax and try again.",
        });

        // Get AI hint for the error
        await getAIHint(sourceCode);
      } else {
        const stdout = result.run.stdout || "";
        setOutput(stdout);

        // Check if solution is correct
        const isCorrect = checkSolution(stdout);

        console.log("Solution check result:", isCorrect);

        if (isCorrect) {
          setProgress(100);
          toast.success("🎉 Great job! Solution is correct!", {
            description: "You can now submit your solution.",
          });
        } else {
          // Only show progress if we have some output without errors
          if (stdout.trim() && !hasError) {
            setProgress(50); // Partial progress for working code
            toast.info("Code runs but doesn't match expected output", {
              description: "Check the requirements and try again.",
            });
          }
          await getAIHint(sourceCode);
        }
      }
    } catch (error) {
      setHasError(true);
      setOutput(`Error: ${error.message}`);
      toast.error("An unexpected error occurred", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const checkSolution = (actualOutput) => {
    if (!levelContent?.test_cases || levelContent.test_cases.length === 0) {
      console.log(
        "No test cases available - considering solution correct if no errors"
      );
      return !hasError; // If no test cases, consider correct if no runtime errors
    }

    console.log("=== SOLUTION CHECK DEBUG ===");
    console.log("Actual output:", JSON.stringify(actualOutput));
    console.log("Number of test cases:", levelContent.test_cases.length);

    for (let i = 0; i < levelContent.test_cases.length; i++) {
      const testCase = levelContent.test_cases[i];
      console.log(`\nTest case ${i + 1}:`);
      console.log("Expected:", JSON.stringify(testCase.expected_output));

      const actual = actualOutput.trim();
      const expected = testCase.expected_output.trim();

      // Multiple comparison strategies
      const checks = {
        exactMatch: actual === expected,
        caseInsensitive: actual.toLowerCase() === expected.toLowerCase(),
        actualContainsExpected: actual.includes(expected),
        expectedContainsActual: expected.includes(actual),
        whitespaceNormalized:
          actual.replace(/\s+/g, " ") === expected.replace(/\s+/g, " "),
        noWhitespace: actual.replace(/\s/g, "") === expected.replace(/\s/g, ""),
      };

      console.log("Comparison results:", checks);

      // Return true if any comparison method succeeds
      if (Object.values(checks).some((result) => result)) {
        console.log(`✅ Test case ${i + 1} PASSED!`);
        return true;
      }
    }

    console.log("❌ All test cases FAILED");
    console.log("=== END DEBUG ===");
    return false;
  };

  const getAIHint = async (userCode) => {
    try {
      if (!levelContent) return;

      const hint = await apiService.getCodeHint(
        levelId,
        userCode,
        levelContent
      );
      setCurrentHint(hint);
      setAiHints((prev) => [...prev, { ...hint, timestamp: new Date() }]);

      toast.info("AI hint available!", {
        description: "Click the hint button to see suggestions.",
      });
    } catch (error) {
      console.error("Failed to get AI hint:", error);
    }
  };

  const submitSolution = async () => {
    setIsSubmitting(true);
    try {
      const currentCode = editorRef.current?.getValue() || code;
      const isCorrect = progress >= 100;

      // Submit to backend
      await apiService.backend.submitCode(levelId, currentCode, isCorrect);

      // Update progress
      if (isCorrect) {
        await apiService.backend.updateProgress(levelId, progress, true);
        toast.success("Solution submitted successfully!", {
          description: "Great work! Moving to next level.",
        });

        // Notify parent component
        onLevelComplete?.(levelId, progress);
      } else {
        toast.warning("Solution submitted but needs improvement", {
          description: "Keep working on it!",
        });
      }
    } catch (error) {
      console.error("Failed to submit solution:", error);
      toast.error("Failed to submit solution", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const toggleTestCases = () => {
    setShowTestCases(!showTestCases);
  };

  const refreshLevel = () => {
    loadLevelContent();
  };

  if (isLoadingLevel) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-space-nebula" />
          <p className="text-gray-400">Loading level content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="cosmic-card overflow-hidden mb-6 flex flex-col max-h-full">
        <div className="flex-shrink-0 p-4 border-b border-space-nebula/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {levelContent?.title || `Level ${levelId}`}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshLevel}
                  className="text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-400 mb-2">
                {levelContent?.objective || "Complete the coding challenge"}
              </p>
              {levelContent?.description && (
                <p className="text-sm text-gray-500">
                  {levelContent.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="w-40 bg-space-deep-purple/30 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-gradient-to-r from-space-nebula to-space-neon-cyan h-2.5 rounded-full transition-all duration-300"
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
                Hint {aiHints.length > 0 && `(${aiHints.length})`}
              </Button>

              {/* New Test Cases Button */}
              {levelContent?.test_cases &&
                levelContent.test_cases.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                    onClick={toggleTestCases}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {showTestCases ? (
                      <EyeOff className="h-4 w-4 ml-1" />
                    ) : (
                      <Eye className="h-4 w-4 ml-1" />
                    )}
                    Tests ({levelContent.test_cases.length})
                  </Button>
                )}
            </div>
          </div>

          {showHint && (
            <div className="mt-4 space-y-3">
              {/* Original static hints */}
              {levelContent?.hints && levelContent.hints.length > 0 && (
                <div className="p-3 bg-space-deep-purple/20 border border-space-meteor-orange/30 rounded-lg">
                  <h4 className="text-space-meteor-orange font-semibold mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Level Hints:
                  </h4>
                  {levelContent.hints.map((hint, index) => (
                    <p
                      key={index}
                      className="text-space-meteor-orange text-sm mb-1"
                    >
                      • {hint}
                    </p>
                  ))}
                </div>
              )}

              {/* AI-generated hint */}
              {currentHint && (
                <div className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    AI Assistant:
                  </h4>
                  <p className="text-blue-300 text-sm mb-2">
                    {currentHint.hint}
                  </p>
                  {currentHint.suggestion && (
                    <p className="text-blue-200 text-xs">
                      <strong>Suggestion:</strong> {currentHint.suggestion}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* New Test Cases Display */}
          {showTestCases &&
            levelContent?.test_cases &&
            levelContent.test_cases.length > 0 && (
              <div className="mt-4">
                <div className="p-3 bg-blue-900/10 border border-blue-400/20 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Cases:
                  </h4>
                  <div className="space-y-3">
                    {levelContent.test_cases.map((testCase, index) => (
                      <div
                        key={index}
                        className="bg-black/30 rounded-md p-3 border border-gray-600/30"
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-blue-300 font-medium text-sm">
                            Test Case {index + 1}
                          </span>
                          {testCase.description && (
                            <span className="text-gray-400 text-xs ml-2">
                              - {testCase.description}
                            </span>
                          )}
                        </div>

                        {testCase.input && (
                          <div className="mb-2">
                            <span className="text-gray-400 text-xs">
                              Input:
                            </span>
                            <pre className="text-yellow-300 text-sm font-mono bg-black/50 p-2 rounded mt-1">
                              {typeof testCase.input === "string"
                                ? testCase.input
                                : JSON.stringify(testCase.input, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-400 text-xs">
                            Expected Output:
                          </span>
                          <pre className="text-green-300 text-sm font-mono bg-black/50 p-2 rounded mt-1">
                            {testCase.expected_output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    💡 Your code output should match the expected output for
                    these test cases
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Code editor area - left side */}
          <div className="flex-1 md:border-r border-space-nebula/20 flex flex-col min-h-0">
            <div className="flex-1 bg-[#1E1E1E] min-h-[300px] max-h-[400px]">
              <Editor
                options={{
                  minimap: { enabled: false },
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
                onChange={(value) => setCode(value || "")}
              />
            </div>
          </div>

          {/* Output area - right side */}
          <div className="w-full md:w-1/2">
            <div className="p-4 bg-black font-mono text-sm h-[500px] overflow-auto">
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

            <Button
              onClick={submitSolution}
              className={cn(
                "cosmic-button bg-green-600 hover:bg-green-700",
                progress < 100 && "opacity-70"
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Solution
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {progress >= 100 && (
              <div className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Ready to submit!</span>
              </div>
            )}

            <Button variant="ghost" size="sm" className="text-gray-400">
              <Info className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </Card>

      {/* Key concepts display */}
      {levelContent?.key_concepts && levelContent.key_concepts.length > 0 && (
        <div className="mb-4 p-3 bg-space-deep-purple/10 border border-space-nebula/20 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Key Concepts:</h4>
          <div className="flex flex-wrap gap-2">
            {levelContent.key_concepts.map((concept, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-space-nebula/20 text-space-neon-cyan text-xs rounded-full"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
