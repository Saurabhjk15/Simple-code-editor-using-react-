import { useState } from "react";
import { Box, Button, Text, useToast } from "@chakra-ui/react";
import { executeCode } from "../api";

const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      try {
        const result = await executeCode(language, sourceCode);
        console.log("API Response:", result); // Debug log
        
        if (!result || !result.run) {
          setOutput(["Error: Invalid API response"]);
          setIsError(true);
          return;
        }

        const output = result.run.stdout || result.run.stderr || result.run.output;
        if (output) {
          setOutput(output.split("\n"));
          setIsError(!!result.run.stderr);
        } else if (result.run.compile_output) {
          setOutput(["Compilation Error:", ...result.run.compile_output.split("\n")]);
          setIsError(true);
        } else {
          setOutput(["No output produced"]);
          setIsError(false);
        }
      } catch (error) {
        console.error("Execution error:", error);
        setOutput([`Error: ${error.message}`]);
        setIsError(true);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg">
        Output
      </Text>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
      >
        Run Code
      </Button>
      <Box
        height="75vh"
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
      >
        {output
          ? output.map((line, i) => <Text key={i}>{line}</Text>)
          : 'Click "Run Code" to see the output here'}
      </Box>
    </Box>
  );
};
export default Output;
