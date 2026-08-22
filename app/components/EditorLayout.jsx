"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Y from "yjs";
import Navbar from "./Navbar";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import AuthForm from "./AuthForm";
import { socket } from "../lib/socket";
import { authClient } from "../lib/auth-client";

export default function EditorLayout({ roomId }) {
  const [files, setFiles] = useState([]); const [selectedFileName, setSelectedFileName] = useState("");
  const [connected, setConnected] = useState(false); const [participants, setParticipants] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); const [yDoc, setYDoc] = useState(null);
  const remoteOrigin = useRef({ remote: true });
  useEffect(() => { authClient.getSession().then(({ data }) => setUser(data?.user || null)); }, []);

  useEffect(() => {
    if (!user) return;
    const doc = new Y.Doc(); const yFiles = doc.getMap("files");
    const refresh = () => { const next = [...yFiles.entries()].map(([name, yFile]) => ({ name, language: yFile.get("language") || "plaintext", content: yFile.get("content")?.toString() || "" })); setFiles(next); setSelectedFileName((current) => next.some((file) => file.name === current) ? current : next[0]?.name || ""); };
    const relay = (update, origin) => { if (origin !== remoteOrigin.current && socket.connected) socket.emit("yjs-update", { roomId, update }); };
    const receive = (update) => Y.applyUpdate(doc, new Uint8Array(update), remoteOrigin.current);
    const join = () => socket.emit("join-room", { roomId }, (result) => { if (!result?.ok) { setConnected(false); setError(result?.error || "Could not join this room."); return; } Y.applyUpdate(doc, new Uint8Array(result.yjsUpdate), remoteOrigin.current); setYDoc(doc); refresh(); setParticipants(result.participants || []); setConnected(true); setError(""); });
    const disconnected = () => setConnected(false); const connectError = () => setError("Could not reach the collaboration server."); const participantUpdate = ({ participants: next }) => setParticipants(next || []);
    yFiles.observeDeep(refresh); doc.on("update", relay); socket.on("connect", join); socket.on("disconnect", disconnected); socket.on("connect_error", connectError); socket.on("yjs-update", receive); socket.on("participants-updated", participantUpdate); socket.connect();
    return () => { socket.off("connect", join); socket.off("disconnect", disconnected); socket.off("connect_error", connectError); socket.off("yjs-update", receive); socket.off("participants-updated", participantUpdate); socket.disconnect(); yFiles.unobserveDeep(refresh); doc.off("update", relay); doc.destroy(); setYDoc(null); };
  }, [roomId, user]);

  const selectedFile = files.find((file) => file.name === selectedFileName); const yFiles = yDoc?.getMap("files");
  const getLanguage = (name) => ({ js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", json: "json", css: "css", html: "html", py: "python", java: "java", cpp: "cpp", c: "c", md: "markdown" })[name.split(".").pop()] || "plaintext";
  function createFile() { const name = prompt("Enter file name:")?.trim(); if (!name) return; if (files.some((file) => file.name.toLowerCase() === name.toLowerCase())) return alert("A file with this name already exists."); const yFile = new Y.Map(); yFile.set("language", getLanguage(name)); yFile.set("content", new Y.Text()); yFiles.set(name, yFile); setSelectedFileName(name); }
  function deleteFile(name) { if (files.length <= 1) return alert("You must have at least one file."); if (confirm(`Delete ${name}?`)) yFiles.delete(name); }
  function renameFile(oldName) { const name = prompt("Enter new file name:", oldName)?.trim(); if (!name || name === oldName) return; if (files.some((file) => file.name.toLowerCase() === name.toLowerCase() && file.name !== oldName)) return alert("A file with this name already exists."); const yFile = yFiles.get(oldName); yDoc.transact(() => { yFiles.delete(oldName); yFile.set("language", getLanguage(name)); yFiles.set(name, yFile); }); setSelectedFileName((current) => current === oldName ? name : current); }
  async function shareRoom() { const invite = window.location.href; try { await navigator.clipboard.writeText(invite); alert("Invite link copied to your clipboard."); } catch { prompt("Copy this invite link:", invite); } }
  if (!user) return <AuthForm onAuthenticated={setUser} />;
  if (error) return <main className="min-h-screen bg-[#0d1117] text-white grid place-items-center p-6"><div className="max-w-md text-center"><h1 className="text-xl font-semibold mb-2">Unable to join room</h1><p className="text-gray-400 mb-4">{error}</p><Link href="/" className="text-blue-400">Return home</Link></div></main>;
  return <div className="h-screen bg-[#0d1117] text-white flex flex-col"><Navbar roomId={roomId} participants={participants} connected={connected} onShare={shareRoom}/><div className="flex flex-1 min-h-0"><FileExplorer files={files} selectedFile={selectedFile} onSelect={(file) => setSelectedFileName(file.name)} onCreateFile={createFile} onDeleteFile={deleteFile} onRenameFile={renameFile}/><main className="flex-1 min-w-0 flex flex-col"><div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center overflow-x-auto">{files.map((file) => <button key={file.name} onClick={() => setSelectedFileName(file.name)} className={`h-full px-3 text-sm border-r border-[#30363d] ${selectedFileName === file.name ? "bg-[#0d1117] text-white" : "text-gray-400 hover:text-gray-200"}`}>{file.name}</button>)}</div><div className="flex-1 min-h-0">{selectedFile && yFiles && <CodeEditor file={selectedFile} yText={yFiles.get(selectedFile.name)?.get("content")}/>}</div></main></div><div className="h-7 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-3 text-xs text-gray-400"><span><span className={connected ? "text-green-500" : "text-yellow-500"}>●</span> {connected ? "Connected" : "Connecting"}</span><span>{selectedFile?.language || ""} &nbsp; UTF-8</span></div></div>;
}
