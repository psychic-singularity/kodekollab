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
  const [files, setFiles] = useState(initialFiles);
  const [selectedFile, setSelectedFile] = useState(initialFiles[0]);

  function handleFileSelect(file) {
    setSelectedFile(file);
  }

  function handleEditorChange(value) {
    const updatedFile = {
      ...selectedFile,
      content: value,
    };

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.name === selectedFile.name ? updatedFile : file
      )
    );

    setSelectedFile(updatedFile);
  }

  function createFile() {
    const name = prompt("Enter file name:");

    if (!name) return;

    if (files.some((file) => file.name === name)) {
      alert("A file with this name already exists.");
      return;
    }

    const extension = name.split(".").pop();

    let language = "plaintext";

    if (extension === "js") language = "javascript";
    if (extension === "jsx") language = "javascript";
    if (extension === "ts") language = "typescript";
    if (extension === "tsx") language = "typescript";
    if (extension === "json") language = "json";
    if (extension === "css") language = "css";
    if (extension === "html") language = "html";

    const newFile = {
      name,
      language,
      content: "",
    };

    setFiles((currentFiles) => [...currentFiles, newFile]);
    setSelectedFile(newFile);
  }

  function deleteFile(fileName) {
    if (files.length === 1) {
      alert("You must have at least one file.");
      return;
    }

    const confirmed = confirm(`Delete ${fileName}?`);

    if (!confirmed) return;

    const newFiles = files.filter((file) => file.name !== fileName);

    setFiles(newFiles);

    if (selectedFile.name === fileName) {
      setSelectedFile(newFiles[0]);
    }
  }

  return (
    <div className="h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        <FileExplorer
          files={files}
          selectedFile={selectedFile}
          onSelect={handleFileSelect}
          onCreateFile={createFile}
          onDeleteFile={deleteFile}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          {/* Tabs */}
          <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center">
            {files.map((file) => {
              const active = selectedFile.name === file.name;

              return (
                <button
                  key={file.name}
                  onClick={() => handleFileSelect(file)}
                  className={`h-full px-4 text-sm border-r border-[#30363d] ${
                    active
                      ? "bg-[#0d1117] text-white"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#21262d]"
                  }`}
                >
                  {file.name}
                </button>
              );
            })}
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              file={selectedFile}
              onChange={handleEditorChange}
            />
          </div>
        </main>
      </div>

      {/* Status bar */}
      <div className="h-7 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-3 text-xs text-gray-400">
        <span>
          <span className="text-green-500">●</span> Connected
        </span>

        <span>
          {selectedFile.language} &nbsp; UTF-8
        </span>
      </div>
    </div>
  );
}