"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";

const initialFiles = [
  {
    name: "index.js",
    language: "javascript",
    content: `const express = require("express");

const app = express();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});`,
  },
  {
    name: "app.js",
    language: "javascript",
    content: `function hello() {
  console.log("Hello World");
}

hello();`,
  },
  {
    name: "package.json",
    language: "json",
    content: `{
  "name": "collaborative-editor",
  "version": "1.0.0"
}`,
  },
];

export default function EditorLayout() {
  const [files] = useState(initialFiles);
  const [selectedFile, setSelectedFile] = useState(files[0]);

  return (
    <div className="h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        <FileExplorer
          files={files}
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
        />

        <main className="flex-1 min-w-0">
          <CodeEditor file={selectedFile} />
        </main>
      </div>

      <div className="h-7 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-3 text-xs text-gray-400">
        <span>● Connected</span>
        <span>{selectedFile.language}</span>
      </div>
    </div>
  );
}