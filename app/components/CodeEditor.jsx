"use client";

import Editor from "@monaco-editor/react";

export default function CodeEditor({ file }) {
  return (
    <Editor
      height="100%"
      language={file.language}
      value={file.content}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: {
          enabled: false,
        },
        padding: {
          top: 12,
        },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
      }}
    />
  );
}