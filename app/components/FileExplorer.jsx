"use client";

export default function FileExplorer({
  files,
  selectedFile,
  onSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}) {
  return (
    <aside className="w-60 shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          Explorer
        </span>

        <button
          onClick={onCreateFile}
          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-[#21262d] text-lg"
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

        <div className="mt-1">
          {files.map((file) => {
            const active =
              selectedFile?.name === file.name;

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
                  className={`flex-1 min-w-0 text-left px-4 py-1.5 text-sm truncate ${
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

                {/* Rename */}
                <button
                  onClick={() =>
                    onRenameFile(file.name)
                  }
                  className="hidden group-hover:block px-1 text-gray-500 hover:text-white"
                  title="Rename"
                >
                  ✎
                </button>

                {/* Delete */}
                <button
                  onClick={() =>
                    onDeleteFile(file.name)
                  }
                  className="hidden group-hover:block px-2 text-gray-500 hover:text-red-400"
                  title="Delete"
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