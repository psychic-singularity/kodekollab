"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

export default function CodeEditor({ file, yText }) {
  const disposeRef = useRef(null);
  useEffect(() => () => disposeRef.current?.(), [file.name]);
  function handleMount(editor) {
    disposeRef.current?.();
    const model = editor.getModel();
    let applyingRemoteChange = false;
    const applyToEditor = () => {
      const text = yText.toString();
      if (model.getValue() === text) return;
      applyingRemoteChange = true;
      model.setValue(text);
      applyingRemoteChange = false;
    };
    const yTextObserver = () => applyToEditor();
    const editorListener = model.onDidChangeContent((event) => {
      if (applyingRemoteChange) return;
      // Monaco provides ranges against the pre-change document, so apply from end to start.
      yText.doc.transact(() => [...event.changes].reverse().forEach((change) => {
        if (change.rangeLength) yText.delete(change.rangeOffset, change.rangeLength);
        if (change.text) yText.insert(change.rangeOffset, change.text);
      }));
    });
    yText.observe(yTextObserver);
    applyToEditor();
    disposeRef.current = () => { editorListener.dispose(); yText.unobserve(yTextObserver); };
  }
  return <Editor key={file.name} height="100%" language={file.language} value={file.content} onMount={handleMount} theme="vs-dark" options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: "smooth", padding: { top: 12 } }} />;
}
