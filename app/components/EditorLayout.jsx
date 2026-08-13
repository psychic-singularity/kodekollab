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
  const [selectedFileName, setSelectedFileName] = useState("index.js");

  const selectedFile = files.find(
    (file) => file.name === selectedFileName
  );

  function handleFileSelect(file) {
    setSelectedFileName(file.name);
  }

  function handleEditorChange(value) {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.name === selectedFileName
          ? {
              ...file,
              content: value,
            }
          : file
      )
    );
  }

  function getLanguage(filename) {
    const extension = filename.split(".").pop();

    const languages = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      json: "json",
      css: "css",
      html: "html",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      md: "markdown",
    };

    return languages[extension] || "plaintext";
  }

  function createFile() {
    const name = prompt("Enter file name:");

    if (!name) return;

    const trimmedName = name.trim();

    if (!trimmedName) return;

    if (
      files.some(
        (file) => file.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      alert("A file with this name already exists.");
      return;
    }

    const newFile = {
      name: trimmedName,
      language: getLanguage(trimmedName),
      content: "",
    };

    setFiles((currentFiles) => [...currentFiles, newFile]);
    setSelectedFileName(trimmedName);
  }

  function deleteFile(fileName) {
    if (files.length === 1) {
      alert("You must have at least one file.");
      return;
    }

    const confirmed = confirm(`Delete ${fileName}?`);

    if (!confirmed) return;

    const fileIndex = files.findIndex(
      (file) => file.name === fileName
    );

    const newFiles = files.filter(
      (file) => file.name !== fileName
    );

    setFiles(newFiles);

    if (selectedFileName === fileName) {
      const nextFile =
        newFiles[fileIndex] || newFiles[fileIndex - 1];

      setSelectedFileName(nextFile.name);
    }
  }

  function renameFile(oldName) {
    const newName = prompt(
      "Enter new file name:",
      oldName
    );

    if (!newName) return;

    const trimmedName = newName.trim();

    if (!trimmedName || trimmedName === oldName) {
      return;
    }

    if (
      files.some(
        (file) =>
          file.name.toLowerCase() ===
            trimmedName.toLowerCase() &&
          file.name !== oldName
      )
    ) {
      alert("A file with this name already exists.");
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.name === oldName
          ? {
              ...file,
              name: trimmedName,
              language: getLanguage(trimmedName),
            }
          : file
      )
    );

    if (selectedFileName === oldName) {
      setSelectedFileName(trimmedName);
    }
  }

  function closeTab(fileName) {
    if (files.length === 1) {
      return;
    }

    const fileIndex = files.findIndex(
      (file) => file.name === fileName
    );

    const newFiles = files.filter(
      (file) => file.name !== fileName
    );

    setFiles(newFiles);

    if (selectedFileName === fileName) {
      const nextFile =
        newFiles[fileIndex] ||
        newFiles[fileIndex - 1] ||
        newFiles[0];

      setSelectedFileName(nextFile.name);
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
          onRenameFile={renameFile}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          {/* Tabs */}
          <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center overflow-x-auto">
            {files.map((file) => {
              const active =
                selectedFileName === file.name;

              return (
                <div
                  key={file.name}
                  className={`h-full flex items-center border-r border-[#30363d] ${
                    active
                      ? "bg-[#0d1117]"
                      : "bg-[#161b22]"
                  }`}
                >
                  <button
                    onClick={() =>
                      handleFileSelect(file)
                    }
                    className={`h-full px-3 text-sm ${
                      active
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {file.name}
                  </button>

                  <button
                    onClick={() =>
                      closeTab(file.name)
                    }
                    className={`mr-1 px-1 text-xs rounded ${
                      active
                        ? "text-gray-400 hover:text-white hover:bg-[#21262d]"
                        : "text-gray-600 hover:text-white"
                    }`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            {selectedFile && (
              <CodeEditor
                file={selectedFile}
                onChange={handleEditorChange}
              />
            )}
          </div>
        </main>
      </div>

      {/* Status bar */}
      <div className="h-7 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-3 text-xs text-gray-400">
        <span>
          <span className="text-green-500">●</span>{" "}
          Connected
        </span>

        <span>
          {selectedFile?.language} &nbsp; UTF-8
        </span>
      </div>
    </div>
  );
}