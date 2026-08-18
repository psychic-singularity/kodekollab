"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import { socket } from "../lib/socket";

export default function EditorLayout({ roomId }) {
  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    function joinRoom() {
      socket.emit("join-room", { roomId }, (result) => {
        if (!result?.ok) {
          setConnected(false);
          setError(result?.error || "Could not join this room.");
          return;
        }
        setFiles(result.files);
        setSelectedFileName((currentName) => result.files.some((file) => file.name === currentName) ? currentName : result.files[0]?.name || "");
        setParticipantCount(result.participantCount);
        setConnected(true);
        setError("");
      });
    }

    function handleCodeUpdate({ fileName, code }) {
      setFiles((currentFiles) => currentFiles.map((file) => file.name === fileName ? { ...file, content: code } : file));
    }
    function handleFileCreated(file) {
      setFiles((currentFiles) => currentFiles.some((entry) => entry.name === file.name) ? currentFiles : [...currentFiles, file]);
    }
    function handleFileDeleted({ fileName }) {
      setFiles((currentFiles) => {
        const nextFiles = currentFiles.filter((file) => file.name !== fileName);
        setSelectedFileName((currentName) => currentName === fileName ? nextFiles[0]?.name || "" : currentName);
        return nextFiles;
      });
    }
    function handleFileRenamed({ oldName, newFile }) {
      setFiles((currentFiles) => currentFiles.map((file) => file.name === oldName ? newFile : file));
      setSelectedFileName((currentName) => currentName === oldName ? newFile.name : currentName);
    }

    socket.on("connect", joinRoom);
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setError("Could not reach the collaboration server."));
    socket.on("code-update", handleCodeUpdate);
    socket.on("file-created", handleFileCreated);
    socket.on("file-deleted", handleFileDeleted);
    socket.on("file-renamed", handleFileRenamed);
    socket.on("participants-updated", ({ count }) => setParticipantCount(count));
    socket.connect();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("code-update", handleCodeUpdate);
      socket.off("file-created", handleFileCreated);
      socket.off("file-deleted", handleFileDeleted);
      socket.off("file-renamed", handleFileRenamed);
      socket.off("participants-updated");
      socket.disconnect();
    };
  }, [roomId]);

  const selectedFile = files.find((file) => file.name === selectedFileName);
  const getLanguage = (filename) => ({ js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", json: "json", css: "css", html: "html", py: "python", java: "java", cpp: "cpp", c: "c", md: "markdown" })[filename.split(".").pop()] || "plaintext";

  function handleEditorChange(value) {
    if (!selectedFileName) return;
    setFiles((currentFiles) => currentFiles.map((file) => file.name === selectedFileName ? { ...file, content: value } : file));
    socket.emit("code-change", { roomId, fileName: selectedFileName, code: value });
  }

  function createFile() {
    const name = prompt("Enter file name:")?.trim();
    if (!name) return;
    if (files.some((file) => file.name.toLowerCase() === name.toLowerCase())) return alert("A file with this name already exists.");
    const file = { name, language: getLanguage(name), content: "" };
    setFiles((currentFiles) => [...currentFiles, file]);
    setSelectedFileName(name);
    socket.emit("create-file", { roomId, file });
  }

  function deleteFile(fileName) {
    if (files.length <= 1) return alert("You must have at least one file.");
    if (!confirm(`Delete ${fileName}?`)) return;
    const nextFiles = files.filter((file) => file.name !== fileName);
    setFiles(nextFiles);
    if (selectedFileName === fileName) setSelectedFileName(nextFiles[0]?.name || "");
    socket.emit("delete-file", { roomId, fileName });
  }

  function renameFile(oldName) {
    const name = prompt("Enter new file name:", oldName)?.trim();
    if (!name || name === oldName) return;
    if (files.some((file) => file.name.toLowerCase() === name.toLowerCase() && file.name !== oldName)) return alert("A file with this name already exists.");
    const oldFile = files.find((file) => file.name === oldName);
    const newFile = { ...oldFile, name, language: getLanguage(name) };
    setFiles((currentFiles) => currentFiles.map((file) => file.name === oldName ? newFile : file));
    if (selectedFileName === oldName) setSelectedFileName(name);
    socket.emit("rename-file", { roomId, oldName, newFile });
  }

  async function shareRoom() {
    const inviteUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert("Invite link copied to your clipboard.");
    } catch {
      prompt("Copy this invite link:", inviteUrl);
    }
  }

  if (error) {
    return <main className="min-h-screen bg-[#0d1117] text-white grid place-items-center p-6"><div className="max-w-md text-center"><h1 className="text-xl font-semibold mb-2">Unable to join room</h1><p className="text-gray-400 mb-4">{error}</p><Link href="/" className="text-blue-400 hover:text-blue-300">Return home</Link></div></main>;
  }

  return (
    <div className="h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar roomId={roomId} participantCount={participantCount} connected={connected} onShare={shareRoom} />
      <div className="flex flex-1 min-h-0">
        <FileExplorer files={files} selectedFile={selectedFile} onSelect={(file) => setSelectedFileName(file.name)} onCreateFile={createFile} onDeleteFile={deleteFile} onRenameFile={renameFile} />
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center overflow-x-auto">
            {files.map((file) => <button key={file.name} onClick={() => setSelectedFileName(file.name)} className={`h-full px-3 text-sm border-r border-[#30363d] ${selectedFileName === file.name ? "bg-[#0d1117] text-white" : "text-gray-400 hover:text-gray-200"}`}>{file.name}</button>)}
          </div>
          <div className="flex-1 min-h-0">{selectedFile && <CodeEditor file={selectedFile} onChange={handleEditorChange} />}</div>
        </main>
      </div>
      <div className="h-7 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-3 text-xs text-gray-400"><span><span className={connected ? "text-green-500" : "text-yellow-500"}>●</span> {connected ? "Connected" : "Connecting"}</span><span>{selectedFile?.language || ""} &nbsp; UTF-8</span></div>
    </div>
  );
}
