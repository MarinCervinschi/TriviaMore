import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JsonInputModeProps {
  classId: string;
  sectionId: string;
  jsonData: string;
  setJsonData: React.Dispatch<React.SetStateAction<string>>;
}

const JsonInputMode: React.FC<JsonInputModeProps> = ({ classId, sectionId, jsonData, setJsonData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Example:</Label>
        <pre className="bg-gray-100 p-2 rounded">
          {`[
    {
        "classId": "${classId}",
        "sectionId": "${sectionId}",
        "question": "What does the span tag in HTML do?",
        "options": [
            "Defines a hyperlink",
            "Defines a section in a document",
            "Defines a paragraph",
            "Defines a division or a section in an HTML document"
        ],
        "answer": [3]
    }
]`}
        </pre>
      </div>
      <div className="space-y-2">
        <Label htmlFor="json-data">JSON Data</Label>
        <Textarea
          id="json-data"
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          placeholder="Enter JSON data for the new class"
          rows={10}
          required
        />
      </div>
    </div>
  );
};

export default JsonInputMode;