"use client";

export default function FileExplorer({
  files,
  selectedFile,
  onSelect,
  onCreateFile,
  onDeleteFile,
}) {
  return (
    <aside className="w-60 shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col">
      {/* Explorer header */}
      <div className="h-10 px-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          Explorer
        </span>

        <button
          onClick={onCreateFile}
          className="text-gray-400 hover:text-white text-lg leading-none"
          title="New File"
        >
          +
        </button>
      </div>

      {/* Project */}
      <div className="px-2">
        <div className="px-2 py-1.5 text-sm text-gray-300">
          <span className="mr-2">📁</span>
          project
        </div>

        {/* Files */}
        <div className="mt-1">
          {files.map((file) => {
            const active = selectedFile.name === file.name;

            return (
              <div
                key={file.name}
                className={`group flex items-center rounded-md ${
                  active
                    ? "bg-[#21262d]"
                    : "hover:bg-[#161b22]"
                }`}
              >
                <button
                  onClick={() => onSelect(file)}
                  className={`flex-1 text-left px-4 py-1.5 text-sm ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-200"
                  }`}
                >
                  <span className="mr-2 text-xs">
                    {file.name.endsWith(".js")
                      ? "JS"
                      : file.name.endsWith(".json")
                      ? "{}"
                      : "•"}
                  </span>

                  {file.name}
                </button>

                <button
                  onClick={() => onDeleteFile(file.name)}
                  className="hidden group-hover:block px-2 text-gray-500 hover:text-red-400"
                  title="Delete file"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}