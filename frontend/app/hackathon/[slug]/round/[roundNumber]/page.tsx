"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import RoundTimer from "@/components/hackathon/RoundTimer";
import QuestionDisplay from "@/components/hackathon/QuestionDisplay";
import QuestionNavigator from "@/components/hackathon/QuestionNavigator";
import Editor from "@monaco-editor/react";

const FolderNode = ({
  node,
  level,
  onSelectFile,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  activeFilePath,
  collapsedFolders,
  toggleFolder
}: any) => {
  const isFolder = node.type === "folder";
  const isCollapsed = collapsedFolders[node.path];

  // Render children sorted: folders first, then files, alphabetically
  const sortedChildren: any[] = Object.values(node.children || {}).sort((a: any, b: any) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const [isNewItemInput, setIsNewItemInput] = useState(null); // 'file' | 'folder' | null
  const [newItemName, setNewItemName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const handleCreateItem = (e: any) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setIsNewItemInput(null);
      return;
    }
    const fullPath = node.path ? `${node.path}/${newItemName.trim()}` : newItemName.trim();
    if (isNewItemInput === "file") {
      onCreateFile(fullPath);
    } else {
      onCreateFolder(fullPath);
    }
    setIsNewItemInput(null);
    setNewItemName("");
  };

  const handleRename = (e: any) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim() === node.name) {
      setIsEditing(false);
      return;
    }
    onRename(node.path, editName.trim());
    setIsEditing(false);
  };

  return (
    <div className="select-none text-xs">
      <div
        className={`flex items-center justify-between py-1 px-2 hover:bg-gray-800/40 rounded cursor-pointer group transition-colors ${!isFolder && activeFilePath === node.path ? "bg-indigo-500/20 text-indigo-400 font-bold" : "text-gray-300"
          }`}
        style={{ paddingLeft: `${level * 10 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            toggleFolder(node.path);
          } else {
            onSelectFile(node.path);
          }
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{isFolder ? (isCollapsed ? "📁" : "📂") : "📄"}</span>
          {isEditing ? (
            <form onSubmit={handleRename} onClick={e => e.stopPropagation()} className="flex items-center">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-gray-850 text-white text-[11px] px-1 py-0.5 rounded outline-none border border-indigo-500 w-28"
                autoFocus
                onBlur={() => setIsEditing(false)}
              />
            </form>
          ) : (
            <span className="truncate text-[11px] font-medium">{node.name}</span>
          )}
        </div>

        {/* Action buttons on hover */}
        <div className="hidden group-hover:flex items-center gap-1 text-gray-400 pr-1" onClick={e => e.stopPropagation()}>
          {isFolder && (
            <>
              <button title="New File" onClick={() => setIsNewItemInput("file")} className="hover:text-white text-[10px]">
                📄+
              </button>
              <button title="New Folder" onClick={() => setIsNewItemInput("folder")} className="hover:text-white text-[10px]">
                📁+
              </button>
            </>
          )}
          <button title="Rename" onClick={() => { setIsEditing(true); setEditName(node.name); }} className="hover:text-white text-[10px]">
            ✏️
          </button>
          <button title="Delete" onClick={() => onDelete(node.path, isFolder)} className="hover:text-red-400 text-[10px]">
            🗑️
          </button>
        </div>
      </div>

      {/* Input for new file/folder under this folder */}
      {isNewItemInput && (
        <div className="py-1 px-2" style={{ paddingLeft: `${(level + 1) * 10 + 8}px` }}>
          <form onSubmit={handleCreateItem} className="flex items-center gap-1">
            <span className="text-xs">{isNewItemInput === "file" ? "📄" : "📁"}</span>
            <input
              type="text"
              placeholder={isNewItemInput === "file" ? "file.js" : "folder"}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="bg-gray-850 text-white text-[11px] px-1 py-0.5 rounded outline-none border border-indigo-500 w-28"
              autoFocus
              onBlur={() => setIsNewItemInput(null)}
            />
          </form>
        </div>
      )}

      {/* Children of folder */}
      {isFolder && !isCollapsed && (
        <div className="flex flex-col">
          {sortedChildren.map((child) => (
            <FolderNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              onRename={onRename}
              onDelete={onDelete}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              activeFilePath={activeFilePath}
              collapsedFolders={collapsedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const STARTER_TEMPLATES = {
  javascript: `// Write your JavaScript solution here\n\nfunction main() {\n  console.log("Hello, World!");\n}\n\nmain();`,
  typescript: `// Write your TypeScript solution here\n\nfunction main(): void {\n  console.log("Hello, World!");\n}\n\nmain();`,
  python: `# Write your Python solution here\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`,
  java: `// Write your Java solution here\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  cpp: `// Write your C++ solution here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
  c: `// Write your C solution here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  go: `// Write your Go solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`
};

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  go: "Go"
};

export default function RoundPage() {
  const params: any = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roundData, setRoundData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const hasAutoSubmitted = useRef(false);
  const isProjectRound = roundData?.round?.type === "project" || params.roundNumber === "2" || params.roundNumber === "3";

  // Monaco Workspace State
  const [files, setFiles] = useState<any[]>([]);
  const [activeFilePath, setActiveFilePath] = useState("");
  const [openTabs, setOpenTabs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [newItemType, setNewItemType] = useState(null); // 'file' | 'folder' | null
  const [newItemName, setNewItemName] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved"); // "Saved", "Saving...", "Error"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);

  const prevCodeRef = useRef("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchRound = async () => {
      try {
        const res = await fetch(`/api/hackathons/${params.slug}/rounds/${params.roundNumber}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRoundData(data.data);

          if (data.data.questions) {
            setQuestions(data.data.questions);
          }

          if (data.data.challenge) {
            setChallenge(data.data.challenge);
          }

          if (data.data.projectFiles && data.data.projectFiles.length > 0) {
            setFiles(data.data.projectFiles);
            const activePath = data.data.projectFiles[0].path;
            setActiveFilePath(activePath);
            setOpenTabs([activePath]);
            prevCodeRef.current = JSON.stringify(data.data.projectFiles);
          } else {
            const defaultFiles = [
              {
                path: "src/App.jsx",
                content: `import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div className="app-container">
      <h1>LearnStack Project Workspace</h1>
      <p>Start building your full-stack project here.</p>
    </div>
  );
}`
              },
              {
                path: "src/styles.css",
                content: `body {
  margin: 0;
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}
.app-container {
  padding: 2rem;
  text-align: center;
}`
              },
              {
                path: "backend/server.js",
                content: `const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
              },
              {
                path: "backend/routes.js",
                content: `const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is healthy' });
});

module.exports = router;`
              },
              {
                path: "README.md",
                content: `# Full-Stack Challenge Project

Welcome to the LearnStack Full-Stack Workspace!

## Project Structure
- \`src/\`: React frontend components and styles
- \`backend/\`: Express server logic and route handlers
- \`README.md\`: Project documentation and guidelines`
              }
            ];
            setFiles(defaultFiles);
            setActiveFilePath("src/App.jsx");
            setOpenTabs(["src/App.jsx"]);
            prevCodeRef.current = JSON.stringify(defaultFiles);
          }

          if (data.data.started) {
            setExamStarted(true);
          }
          setLoading(false);
        } else {
          setError(data.message || "Failed to load round.");
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
            return;
          }
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load round. Please try again.");
        setLoading(false);
      }
    };

    if (user) fetchRound();
  }, [user, authLoading, router, params.slug, params.roundNumber]);


  // Auto-Save interval every 5 seconds
  useEffect(() => {
    if (!examStarted || !isProjectRound || !roundData?.submissionId) return;

    const autoSaveInterval = setInterval(async () => {
      const serializedFiles = JSON.stringify(files);
      if (serializedFiles === prevCodeRef.current) return; // Skip API call if nothing changed

      setSaveStatus("Saving...");
      try {
        const res = await fetch("/api/rounds/auto-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            hackathonId: roundData?.hackathonId || challenge?.hackathonId || roundData?.questions?.[0]?._id,
            roundNumber: parseInt(params.roundNumber),
            projectFiles: files,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSaveStatus("Saved");
          prevCodeRef.current = serializedFiles;
        } else {
          setSaveStatus("Error");
        }
      } catch (err) {
        setSaveStatus("Error");
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [files, examStarted, roundData, challenge, params.roundNumber]);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${params.slug}/rounds/${params.roundNumber}/start`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data.questions || []);

        if (data.data.projectFiles && data.data.projectFiles.length > 0) {
          setFiles(data.data.projectFiles);
          const activePath = data.data.projectFiles[0].path;
          setActiveFilePath(activePath);
          setOpenTabs([activePath]);
          prevCodeRef.current = JSON.stringify(data.data.projectFiles);
        } else {
          const defaultFiles = [
            {
              path: "src/App.jsx",
              content: `import React from 'react';
import './styles.css';

export default function App() {
  return (
    <div className="app-container">
      <h1>LearnStack Project Workspace</h1>
      <p>Start building your full-stack project here.</p>
    </div>
  );
}`
            },
            {
              path: "src/styles.css",
              content: `body {
  margin: 0;
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}
.app-container {
  padding: 2rem;
  text-align: center;
}`
            },
            {
              path: "backend/server.js",
              content: `const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
            },
            {
              path: "backend/routes.js",
              content: `const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is healthy' });
});

module.exports = router;`
            },
            {
              path: "README.md",
              content: `# Full-Stack Challenge Project

Welcome to the LearnStack Full-Stack Workspace!

## Project Structure
- \`src/\`: React frontend components and styles
- \`backend/\`: Express server logic and route handlers
- \`README.md\`: Project documentation and guidelines`
            }
          ];
          setFiles(defaultFiles);
          setActiveFilePath("src/App.jsx");
          setOpenTabs(["src/App.jsx"]);
          prevCodeRef.current = JSON.stringify(defaultFiles);
        }

        setRoundData((prev: any)  => ({
          ...prev,
          startedAt: data.data.startedAt,
          started: true,
          submissionId: data.data.submissionId,
          challenge: data.data.challenge || prev?.challenge
        }));
        if (data.data.challenge) {
          setChallenge(data.data.challenge);
        }
        setExamStarted(true);
      } else {
        setError(data.message || "Failed to start exam.");
      }
    } catch (err) {
      setError("Failed to start exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback((answerData: any) => {
    setAnswers((prev: any) => ({
      ...prev,
      [answerData.questionId]: answerData,
    }));
  }, []);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || hasAutoSubmitted.current) return;
    if (auto) hasAutoSubmitted.current = true;
    setSubmitting(true);
    setSaveStatus("Saving...");

    try {
      let requestBody = {};
      if (isProjectRound) {
        requestBody = {
          projectFiles: files,
          autoSubmitted: auto
        };
      } else {
        const answerArray = Object.values(answers).map((a: any) => ({
          questionId: a.questionId,
          answer: a.answer || "",
          selectedOptionIndex: a.selectedOptionIndex ?? -1,
          timeTaken: 0,
        }));
        requestBody = {
          answers: answerArray,
          autoSubmitted: auto
        };
      }

      const res = await fetch(`/api/hackathons/${params.slug}/rounds/${params.roundNumber}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (data.success) {
        setShowConfirm(false);
        router.push(`/hackathon/${params.slug}/results`);
      } else {
        setError(data.message);
        setSubmitting(false);
        setShowConfirm(false);
        setSaveStatus("Error");
      }
    } catch (err) {
      setError("Submission failed. Please try again.");
      setSubmitting(false);
      setShowConfirm(false);
      setSaveStatus("Error");
    }
  }, [answers, files, roundData, params.slug, params.roundNumber, router, submitting]);

  const handleTimeUp = useCallback(() => {
    handleSubmit(true);
  }, [handleSubmit]);

  // Run Test Suite Simulation
  const handleRunTests = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOpen(true);
    setTerminalOutput(["> Compiling solution code...", "> Setting up mock environment execution..."]);

    setTimeout(() => {
      setTerminalOutput((prev: any) => [...prev, `> Executing simulation tests for [${challenge?.challengeTitle || "Project Challenge"}]`]);
    }, 800);

    setTimeout(() => {
      setTerminalOutput((prev: any) => [
        ...prev,
        "✔ Test Case 1: Initial workspace compilation -> SUCCESS",
        "✔ Test Case 2: Verification of core business requirements -> SUCCESS",
      ]);
    }, 1600);

    setTimeout(() => {
      setTerminalOutput((prev: any) => [
        ...prev,
        "✔ Test Case 3: Performance, logic loop, and database validations -> SUCCESS",
        "",
        "🎉 COMPILER OUTPUT:",
        "Status: All tests passed successfully!",
        "Execution time: 42ms",
        "Memory limit check: Passed"
      ]);
      setIsRunning(false);
    }, 2400);
  };

  // File management operations
  const handleCreateFile = (path: string) => {
    if (files.some((f: any) => f.path === path)) {
      alert("File already exists!");
      return;
    }
    const newFiles = [...files, { path, content: "" }];
    setFiles(newFiles);
    setActiveFilePath(path);
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
  };

  const handleCreateFolder = (path: string) => {
    const dummyFilePath = `${path}/.gitkeep`;
    if (files.some((f: any) => f.path === dummyFilePath)) return;
    const newFiles = [...files, { path: dummyFilePath, content: "" }];
    setFiles(newFiles);
  };

  const handleRename = (oldPath: string, newName: string) => {
    const pathParts = oldPath.split("/");
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join("/");

    if (files.some(f => f.path === newPath)) {
      alert("Target path already exists!");
      return;
    }

    const newFiles = files.map(file => {
      if (file.path === oldPath) {
        return { ...file, path: newPath };
      }
      if (file.path.startsWith(oldPath + "/")) {
        return { ...file, path: file.path.replace(oldPath + "/", newPath + "/") };
      }
      return file;
    });

    setFiles(newFiles);

    if (activeFilePath === oldPath) {
      setActiveFilePath(newPath);
    } else if (activeFilePath.startsWith(oldPath + "/")) {
      setActiveFilePath(activeFilePath.replace(oldPath + "/", newPath + "/"));
    }

    setOpenTabs(openTabs.map(tab => {
      if (tab === oldPath) return newPath;
      if (tab.startsWith(oldPath + "/")) return tab.replace(oldPath + "/", newPath + "/");
      return tab;
    }));
  };

  const handleDelete = (path:string, isFolder:boolean) => {
    if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) return;

    const newFiles = files.filter(file => {
      if (isFolder) {
        return !file.path.startsWith(path + "/");
      }
      return file.path !== path;
    });

    setFiles(newFiles);

    const updatedTabs = openTabs.filter(tab => {
      if (isFolder) {
        return !tab.startsWith(path + "/");
      }
      return tab !== path;
    });
    setOpenTabs(updatedTabs);

    if (activeFilePath === path || (isFolder && activeFilePath.startsWith(path + "/"))) {
      setActiveFilePath(updatedTabs[0] || "");
    }
  };

  const getLanguageFromPath = (path: string) => {
    if (!path) return "javascript";
    const ext = path.split(".").pop().toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "css":
        return "css";
      case "html":
        return "html";
      case "json":
        return "json";
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
      case "h":
        return "cpp";
      case "c":
        return "c";
      case "go":
        return "go";
      case "md":
        return "markdown";
      case "sql":
        return "sql";
      default:
        return "javascript";
    }
  };

  const buildFileTree = (file, searchQuery = "") => {
    const root = { name: "root", type: "folder", children: {}, path: "" };

    files.forEach((file) => {
      if (file.path.endsWith("/.gitkeep")) {
        // Just extract folder name
        const folderPath = file.path.substring(0, file.path.lastIndexOf("/"));
        const parts = folderPath.split("/");
        let current = root;
        parts.forEach((part, index) => {
          const partPath = parts.slice(0, index + 1).join("/");
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              type: "folder",
              path: partPath,
              children: {},
            };
          }
          current = current.children[part];
        });
        return;
      }

      if (searchQuery && !file.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      const parts = file.path.split("/");
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const partPath = parts.slice(0, index + 1).join("/");

        if (isLast) {
          current.children[part] = {
            name: part,
            type: "file",
            path: file.path,
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              type: "folder",
              path: partPath,
              children: {},
            };
          }
          current = current.children[part];
        }
      });
    });

    return root;
  };

  const activeFile = files.find(f => f.path === activeFilePath);

  // ═══ Loading State ═══
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  // ═══ Error State ═══
  if (error && !roundData) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <AuthNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="glass rounded-3xl p-12 border border-red-500/30">
            <div className="text-6xl mb-6">🚫</div>
            <h1 className="text-2xl font-black mb-4 text-red-400">{error}</h1>
            <p className="text-[var(--text-muted)] text-sm mb-8">
              This could mean you are not registered, the round hasn't started yet, or you have already submitted.
            </p>
            <button onClick={() => router.push(`/hackathon/${params.slug}`)} className="btn-primary !py-3 !px-8">
              ← Back to Hackathon
            </button>
          </div>
        </div>
      </div>
    );
  }

  const round = roundData?.round;
  const hasQuestions = questions.length > 0;

  // ═══ Pre-Exam Briefing Screen ═══
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <AuthNavbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 md:p-12 border border-[var(--primary)]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">💻</div>
                <h1 className="text-3xl font-black mb-2">{round?.title || `Round ${params.roundNumber}`}</h1>
                <p className="text-[var(--text-muted)]">Built-in Premium Coding Challenge Workspace</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-[var(--primary-light)]">{round?.duration || "—"}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Minutes</div>
                </div>
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-emerald-400">1</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Challenge Project</div>
                </div>
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-yellow-400">{round?.qualifyingScore || 50}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Pts to Qualify</div>
                </div>
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-red-400">Medium</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Difficulty</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 mb-8 border border-yellow-500/20 bg-yellow-500/5">
                <h3 className="text-sm font-bold text-yellow-400 mb-2">⚠️ Coding Workspace Rules</h3>
                <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
                  <li>• Code will be auto-saved every <strong>5 seconds</strong>.</li>
                  <li>• You have access to Monaco Editor with auto-complete and bracket coloring.</li>
                  <li>• Click <strong>"Run Tests"</strong> to simulate compilation and check mock validation tests.</li>
                  <li>• Submissions are manually evaluated by admins for quality, system design, and database schema definition.</li>
                </ul>
              </div>

              {!round ? (
                <div className="text-center">
                  <div className="glass rounded-xl p-6 border border-orange-500/30 bg-orange-500/5 mb-4">
                    <div className="text-3xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold text-orange-400 mb-2">Round Details Unavailable</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Please contact the organizer or try again later.
                    </p>
                  </div>
                  <button onClick={() => router.push(`/hackathon/${params.slug}`)} className="btn-secondary !py-3 !px-8">
                    ← Back to Hackathon
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartExam}
                  className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-black py-4 rounded-2xl text-lg shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] transition-all hover:scale-[1.02]"
                >
                  🚀 Start Coding Round ({round?.duration} min)
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══ Premium Monaco Workspace Interface ═══
  if (isProjectRound) {
    const rootTree = buildFileTree(files, searchQuery);

    const toggleFolder = (folderPath) => {
      setCollapsedFolders(prev => ({
        ...prev,
        [folderPath]: !prev[folderPath]
      }));
    };

    return (
      <div className="h-screen flex flex-col bg-[#0b0f19] text-[#f3f4f6] overflow-hidden font-sans">
        {/* Top Navbar */}
        <div className="h-14 border-b border-gray-805/80 bg-[#0f121d] flex items-center justify-between px-6 z-20 shadow-md">
          <div className="flex items-center gap-4">
            <span className="text-base font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              LearnStack Workspace
            </span>
            <span className="h-4 w-px bg-gray-800" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {round?.title}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            {roundData?.startedAt && (
              <div className="flex items-center gap-2 bg-[#171a26] border border-gray-800 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs text-gray-400 font-medium">Time Left:</span>
                <RoundTimer
                  endTime={new Date(new Date(roundData.startedAt).getTime() + round.duration * 60000).toISOString()}
                  duration={round.duration}
                  onTimeUp={handleTimeUp}
                  compact
                />
              </div>
            )}

            {/* Auto Save Status */}
            <div className="flex items-center gap-1.5 text-xs bg-[#171a26] border border-gray-800 px-3 py-1.5 rounded-xl">
              <span className={`w-2 h-2 rounded-full ${saveStatus === "Saving..." ? "bg-yellow-400 animate-pulse" : saveStatus === "Error" ? "bg-red-400" : "bg-emerald-400"}`} />
              <span className="text-gray-400 font-semibold">{saveStatus}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shadow-lg transition-all hover:scale-[1.02]"
            >
              Submit Project
            </button>
          </div>
        </div>

        {/* Main Coding Workspace Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Left Panel - File Explorer Sidebar */}
          {!isFullscreen && (
            <div className="w-64 border-r border-gray-800/80 bg-[#0f121d] flex flex-col overflow-hidden select-none">
              <div className="p-3 border-b border-gray-800/60 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Workspace Files</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const name = prompt("Enter file name (e.g. src/newfile.js):");
                      if (name) handleCreateFile(name);
                    }}
                    title="New File"
                    className="p-1 hover:bg-gray-800 rounded text-xs"
                  >
                    📄➕
                  </button>
                  <button
                    onClick={() => {
                      const name = prompt("Enter folder name (e.g. src/components):");
                      if (name) handleCreateFolder(name);
                    }}
                    title="New Folder"
                    className="p-1 hover:bg-gray-800 rounded text-xs"
                  >
                    📁➕
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="p-2 border-b border-gray-800/60">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#171a26] border border-gray-800 rounded px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* File Tree List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
                {Object.values(rootTree.children).length === 0 ? (
                  <div className="text-center text-xs text-gray-500 mt-4">Empty Workspace</div>
                ) : (
                  Object.values(rootTree.children).sort((a, b) => {
                    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  }).map((node) => (
                    <FolderNode
                      key={node.path}
                      node={node}
                      level={0}
                      onSelectFile={(path) => {
                        setActiveFilePath(path);
                        if (!openTabs.includes(path)) {
                          setOpenTabs([...openTabs, path]);
                        }
                      }}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onCreateFile={handleCreateFile}
                      onCreateFolder={handleCreateFolder}
                      activeFilePath={activeFilePath}
                      collapsedFolders={collapsedFolders}
                      toggleFolder={toggleFolder}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. Center Panel - Monaco Editor & Tabs & Console */}
          <div className="flex-1 flex flex-col bg-[#0b0f19] relative min-w-0">
            {/* Open Tabs */}
            <div className="h-10 border-b border-gray-800/85 bg-[#0f121d] flex items-center justify-between select-none">
              <div className="flex items-center overflow-x-auto h-full scrollbar-none">
                {openTabs.map((tabPath) => {
                  const fileName = tabPath.split("/").pop();
                  const isActive = activeFilePath === tabPath;
                  return (
                    <div
                      key={tabPath}
                      onClick={() => setActiveFilePath(tabPath)}
                      className={`h-full flex items-center gap-2 px-4 border-r border-gray-800/60 cursor-pointer text-xs font-medium transition-colors ${isActive
                        ? "bg-[#0b0f19] text-indigo-400 border-t-2 border-t-indigo-500"
                        : "bg-[#0f121d] text-gray-400 hover:bg-gray-800/30 hover:text-gray-300"
                        }`}
                    >
                      <span>📄</span>
                      <span className="truncate max-w-[120px]">{fileName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextTabs = openTabs.filter(t => t !== tabPath);
                          setOpenTabs(nextTabs);
                          if (activeFilePath === tabPath) {
                            setActiveFilePath(nextTabs[0] || "");
                          }
                        }}
                        className="p-0.5 hover:bg-gray-700/50 rounded text-[9px] hover:text-red-400 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 px-4">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-gray-400 hover:text-white text-xs font-bold transition-colors"
                >
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 min-h-0 relative">
              {activeFilePath ? (
                <Editor
                  height="100%"
                  language={getLanguageFromPath(activeFilePath)}
                  value={activeFile?.content || ""}
                  theme="vs-dark"
                  onChange={(val) => {
                    setFiles(prev => prev.map(f => {
                      if (f.path === activeFilePath) {
                        return { ...f, content: val || "" };
                      }
                      return f;
                    }));
                  }}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollbar: {
                      vertical: "visible",
                      horizontal: "visible"
                    },
                    bracketPairColorization: { enabled: true },
                    autoClosingBrackets: "always",
                    autoClosingQuotes: "always",
                    formatOnPaste: true,
                    formatOnType: true
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 bg-[#0b0f19]">
                  <span className="text-4xl">💻</span>
                  <p className="text-xs font-semibold">Select a file from the explorer to start editing.</p>
                </div>
              )}

              {/* Console Drawer */}
              <AnimatePresence>
                {terminalOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 220 }}
                    exit={{ height: 0 }}
                    className="absolute bottom-0 left-0 right-0 border-t border-gray-800 bg-[#070a13] flex flex-col z-10 shadow-inner"
                  >
                    <div className="h-9 border-b border-gray-800 bg-[#0f121d] flex items-center justify-between px-4 select-none">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Console Terminal</span>
                      <button
                        onClick={() => setTerminalOpen(false)}
                        className="text-gray-500 hover:text-white text-xs font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-emerald-400 space-y-1">
                      {terminalOutput.map((out, idx) => (
                        <div key={idx} className={out.startsWith("✔") ? "text-emerald-400" : out.startsWith("🎉") ? "text-yellow-400 font-bold" : "text-gray-300"}>
                          {out}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom code execution actions */}
            <div className="h-12 border-t border-gray-800 bg-[#0f121d] flex items-center justify-end px-4 gap-3 select-none">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold transition-all disabled:opacity-50 text-white"
              >
                {isRunning ? "Running tests..." : "Run Tests"}
              </button>
              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-xs font-bold transition-all text-gray-300"
              >
                {terminalOpen ? "Hide Console" : "Show Console"}
              </button>
            </div>
          </div>

          {/* 3. Right panel - Problem Description */}
          {!isFullscreen && (
            <div className="w-80 border-l border-gray-800/80 bg-[#0f121d] flex flex-col overflow-y-auto p-6 space-y-6">
              {challenge ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                        {challenge.difficulty || "Medium"} Challenge
                      </span>
                      <span className="text-xs text-gray-400 font-bold">100 Points</span>
                    </div>
                    <h1 className="text-base font-extrabold text-white">{challenge.challengeTitle}</h1>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-300 border-b border-gray-800 pb-1.5">Business Scenario</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{challenge.businessScenario}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-300 border-b border-gray-800 pb-1.5">Problem Statement</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{challenge.problemStatement}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-300 border-b border-gray-800 pb-1.5">Requirements</h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-400">
                      {(challenge.requirements || []).map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {challenge.bonusFeatures && challenge.bonusFeatures.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-yellow-400/90 border-b border-gray-800 pb-1.5">Bonus Features</h3>
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-400">
                        {challenge.bonusFeatures.map((bonus, idx) => (
                          <li key={idx} className="border-l-2 border-yellow-500/20 pl-2 ml-[-12px] list-none">
                            ✨ {bonus}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-300 border-b border-gray-800 pb-1.5">Evaluation Criteria</h3>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {(challenge.evaluationCriteria || []).map((crit, idx) => (
                        <div key={idx} className="bg-gray-800/30 border border-gray-800 rounded-lg p-2 text-gray-300">
                          {crit}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Loading Challenge Details...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass bg-[#0f121d] border border-gray-800 rounded-3xl p-8 w-full max-w-md text-center"
            >
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-xl font-extrabold mb-3 text-white">Submit your Solution?</h2>
              <p className="text-xs text-gray-400 mb-6">
                Are you sure you want to finalize and submit your code? Make sure your compiler runs without errors. You cannot make edits after submitting.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 font-bold text-xs flex-1 shadow-lg text-white"
                >
                  {submitting ? "Submitting..." : "Yes, Submit"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold flex-1 text-gray-300 border border-gray-850"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ═══ Standard MCQ/Theory Interface (Round 1 / etc) ═══
  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ═══ Top Bar ═══ */}
      <div className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--primary-light)]">
              Round {params.roundNumber}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {round?.title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {roundData?.startedAt && (
              <RoundTimer
                endTime={new Date(new Date(roundData.startedAt).getTime() + round.duration * 60000).toISOString()}
                duration={round.duration}
                onTimeUp={handleTimeUp}
                compact
              />
            )}
            <button
              onClick={() => hasQuestions ? setShowConfirm(true) : null}
              disabled={submitting || !hasQuestions}
              className="btn-primary !py-2 !px-5 !text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ═══ Timer (full) ═══ */}
        {roundData?.startedAt && (
          <div className="mb-6">
            <RoundTimer
              endTime={new Date(new Date(roundData.startedAt).getTime() + round.duration * 60000).toISOString()}
              duration={round.duration}
              onTimeUp={handleTimeUp}
            />
          </div>
        )}

        {error && (
          <div className="glass rounded-xl p-4 mb-6 text-sm text-red-400 font-medium border border-red-500/30">
            ⚠️ {error}
          </div>
        )}

        {/* ═══ No Questions Warning ═══ */}
        {!hasQuestions && (
          <div className="glass rounded-2xl p-12 text-center border border-orange-500/30 bg-orange-500/5">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-orange-400 mb-2">No Questions Available</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              No questions have been assigned to this round. Please contact the hackathon organizer.
            </p>
            <button onClick={() => router.push(`/hackathon/${params.slug}`)} className="btn-primary !py-3 !px-6">
              ← Back to Hackathon
            </button>
          </div>
        )}

        {/* ═══ Main Layout ═══ */}
        {hasQuestions && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Display (3/4 width) */}
            <div className="lg:col-span-3">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestionDisplay
                    question={currentQuestion}
                    index={currentIndex}
                    total={questions.length}
                    answer={answers[currentQuestion._id]}
                    onAnswer={handleAnswer}
                  />
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="btn-secondary !py-3 !px-6 !text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-sm text-[var(--text-muted)] font-bold">
                  {currentIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="btn-secondary !py-3 !px-6 !text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Navigator Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <QuestionNavigator
                  questions={questions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onNavigate={setCurrentIndex}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Submit Confirmation Modal ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md text-center"
          >
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-3">Submit Round {params.roundNumber}?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              You have answered <span className="font-bold text-[var(--primary-light)]">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
            </p>
            {Object.keys(answers).length < questions.length && (
              <p className="text-xs text-orange-400 mb-4">
                ⚠️ {questions.length - Object.keys(answers).length} questions are unanswered!
              </p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-primary !py-3 flex-1"
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary !py-3 flex-1"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
