"use client";

import Editor from "@monaco-editor/react";

import { useEffect } from "react";
import { socket } from "../lib/socket";



export default function CodeEditor({ file, onChange }) {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("join-room", "test-room");
    });

    socket.on("user-joined", (userId) => {
      console.log("New user joined:", userId);
    });

    return () => {
      socket.off("connect");
      socket.off("user-joined");
    };
  }, []);
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