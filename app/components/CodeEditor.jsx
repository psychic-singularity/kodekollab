"use client";

import Editor from "@monaco-editor/react";

export default function CodeEditor({ file, onChange }) {
  return (
    <Editor
      height="100%"
      language={file.language}
      value={file.content}
      onChange={(value) => onChange(value || "")}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: {
          enabled: false,
        },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        padding: {
          top: 12,
        },
      }}
    />
  );
}