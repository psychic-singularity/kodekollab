"use client";

export default function FileExplorer({
  files,
  selectedFile,
  onSelect,
}) {
  return (
    <aside className="w-60 shrink-0 bg-[#0d1117] border-r border-[#30363d]">
      <div className="h-10 px-4 flex items-center text-xs font-semibold text-gray-400 uppercase">
        Explorer
      </div>

      <div className="px-2">
        <div className="px-2 py-1.5 text-sm text-gray-300">
          📁 project
        </div>

        <div className="mt-1">
          {files.map((file) => {
            const active = selectedFile.name === file.name;

            return (
              <button
                key={file.name}
                onClick={() => onSelect(file)}
                className={`w-full text-left px-4 py-1.5 text-sm rounded-md ${
                  active
                    ? "bg-[#21262d] text-white"
                    : "text-gray-400 hover:bg-[#161b22] hover:text-gray-200"
                }`}
              >
                <span className="mr-2">
                  {file.name.endsWith(".js") ? "JS" : "{}"}
                </span>

                {file.name}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}