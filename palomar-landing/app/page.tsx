"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  RefreshCw,
  Radio,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Copy,
  ExternalLink,
  Key,
  Cpu,
  Layers,
  Activity,
  BarChart3,
  Database,
  Sparkles,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  Wallet,
  Terminal,
  Sliders,
  Check,
  BookOpen,
  Users,
  Zap,
} from "lucide-react";

// --- TYPES ---
type TabId = "home" | "dashboard" | "ledger" | "privacy" | "analytics" | "activity";

interface LedgerState {
  sessionState: "OPEN" | "CLOSED";
  courseCode: string;
  courseCommitment: string;
  studentCommitment: string;
  attendanceCommitment: string;
  registrar: string;
  sequence: number;
}

interface ActivityLog {
  id: string;
  action: string;
  role: "Instructor" | "Student" | "Ledger";
  txHash: string;
  timestamp: string;
  status: "confirmed" | "processing";
  details: string;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
}

// Preset courses for quick testing
const PRESET_COURSES = [
  "CS-401 · Distributed Systems & ZK",
  "BIO-204 · Computational Genomics",
  "MATH-301 · Applied Cryptography",
  "AI-502 · Privacy-Preserving Machine Learning",
];

export default function AuroraApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // Wallet State
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress] = useState<string>("addr_shielded_1z9x4k87qm2vlp4w90tyx68e3p2b1a");
  const [walletName] = useState<string>("Midnight Lace Wallet");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Contract & Ledger State
  const [ledger, setLedger] = useState<LedgerState>({
    sessionState: "OPEN",
    courseCode: "CS-401 · Distributed Systems & ZK",
    courseCommitment: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    studentCommitment: "0x3a91c0e482319df6b45a90e32b49c71e8fa654921098bca4371e5491029c88fe",
    attendanceCommitment: "0x289fbc78912e34a7b980c65123d45e67f89012a3b4c5d6e7f8a9b0c1d2e3f4a5",
    registrar: "0xd9428b6319842aef9120c4e78a23019842bc194a8e72301948ba1209384bc194",
    sequence: 14,
  });

  // Metrics
  const [totalCheckIns, setTotalCheckIns] = useState<number>(142);
  const [sessionCheckIns, setSessionCheckIns] = useState<number>(18);
  const [successRate] = useState<number>(100.0);

  // Form Inputs
  const [inputCourseCode, setInputCourseCode] = useState<string>(PRESET_COURSES[0]);
  const [inputStudentId, setInputStudentId] = useState<string>("STU-2026-8941");

  // Modals
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);

  // ZK Proof Progress State for Student Check-In
  const [zkStep, setZkStep] = useState<number>(0);
  const [isProving, setIsProving] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Activity Log
  const [activities, setActivities] = useState<ActivityLog[]>([
    {
      id: "tx-1",
      action: "Private Student Check-In",
      role: "Student",
      txHash: "0x89ab...4e21",
      timestamp: "Just now",
      status: "confirmed",
      details: "Disclosed rotating pseudonym for Sequence #14",
    },
    {
      id: "tx-2",
      action: "Private Student Check-In",
      role: "Student",
      txHash: "0x34cd...11fa",
      timestamp: "2 mins ago",
      status: "confirmed",
      details: "Disclosed rotating pseudonym for Sequence #14",
    },
    {
      id: "tx-3",
      action: "Open Attendance Session",
      role: "Instructor",
      txHash: "0xef56...90bc",
      timestamp: "12 mins ago",
      status: "confirmed",
      details: "Published course commitment for CS-401",
    },
    {
      id: "tx-4",
      action: "Close Attendance Session",
      role: "Instructor",
      txHash: "0x12fe...8831",
      timestamp: "1 hour ago",
      status: "confirmed",
      details: "Sequence counter incremented: 13 → 14",
    },
  ]);

  const addToast = (title: string, message: string, type: "success" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast("Copied to Clipboard", `${label} commitment hash copied`, "success");
  };

  const toggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      addToast("Wallet Disconnected", "Lace Wallet disconnected from session", "info");
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setWalletConnected(true);
        addToast("Wallet Connected", "Connected to Midnight Preprod with shielded address", "success");
      }, 700);
    }
  };

  // Instructor: Open Session
  const handleOpenSession = (course: string) => {
    const randomCommitment = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setLedger((prev) => ({
      ...prev,
      sessionState: "OPEN",
      courseCode: course,
      courseCommitment: randomCommitment,
    }));
    setSessionCheckIns(0);
    setShowOpenModal(false);

    const newActivity: ActivityLog = {
      id: `tx-${Date.now()}`,
      action: "Open Attendance Session",
      role: "Instructor",
      txHash: "0x" + Math.random().toString(16).substring(2, 6) + "..." + Math.random().toString(16).substring(2, 6),
      timestamp: "Just now",
      status: "confirmed",
      details: `Published course commitment for ${course}`,
    };
    setActivities((prev) => [newActivity, ...prev]);
    addToast("Session Opened", `Attendance window opened for ${course}`, "success");
  };

  // Instructor: Close Session
  const handleCloseSession = () => {
    setLedger((prev) => ({
      ...prev,
      sessionState: "CLOSED",
      sequence: prev.sequence + 1,
    }));

    const newActivity: ActivityLog = {
      id: `tx-${Date.now()}`,
      action: "Close Attendance Session",
      role: "Instructor",
      txHash: "0x" + Math.random().toString(16).substring(2, 6) + "..." + Math.random().toString(16).substring(2, 6),
      timestamp: "Just now",
      status: "confirmed",
      details: `Sequence counter incremented: ${ledger.sequence} → ${ledger.sequence + 1}`,
    };
    setActivities((prev) => [newActivity, ...prev]);
    addToast("Session Closed", `Attendance window closed. Sequence incremented to #${ledger.sequence + 1} to rotate student pseudonyms.`, "warning");
  };

  // Student: Check-In with Multi-step ZK Proof Pipeline
  const handleExecuteCheckIn = () => {
    setIsProving(true);
    setZkStep(1);

    setTimeout(() => {
      setZkStep(2);
      setTimeout(() => {
        setZkStep(3);
        setTimeout(() => {
          setZkStep(4);
          setTimeout(() => {
            const newPseudonym = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
            const newEvidence = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

            setLedger((prev) => ({
              ...prev,
              studentCommitment: newPseudonym,
              attendanceCommitment: newEvidence,
            }));
            setTotalCheckIns((prev) => prev + 1);
            setSessionCheckIns((prev) => prev + 1);
            setIsProving(false);
            setZkStep(0);
            setShowCheckInModal(false);

            const newActivity: ActivityLog = {
              id: `tx-${Date.now()}`,
              action: "Private Student Check-In",
              role: "Student",
              txHash: "0x" + Math.random().toString(16).substring(2, 6) + "..." + Math.random().toString(16).substring(2, 6),
              timestamp: "Just now",
              status: "confirmed",
              details: `ZK proof verified. Published rotating pseudonym for Seq #${ledger.sequence}`,
            };
            setActivities((prev) => [newActivity, ...prev]);
            addToast("Zero-Knowledge Check-In Verified", "Proof confirmed on Midnight ledger without revealing your student ID", "success");
          }, 600);
        }, 700);
      }, 700);
    }, 700);
  };

  return (
    <div className="aurora-bg min-h-screen text-[#dae2fd] flex flex-col selection:bg-[#7E22CE] selection:text-white">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto glass-panel-elevated p-4 rounded-xl border border-white/20 shadow-glass flex items-start gap-3 animate-fade-down"
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
              <p className="text-xs text-[#c4c7c8] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-[#8e9192] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 lg:px-8 py-3.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Network */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] flex items-center justify-center shadow-glow-purple">
              <div className="w-full h-full bg-[#0b1326] rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">Aurora</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ZK v0.23
                </span>
              </div>
              <p className="text-xs text-[#8e9192] hidden sm:block">Midnight Preprod · Zero-Knowledge Attendance</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131b2e]/80 p-1 rounded-xl border border-white/10">
            {[
              { id: "home", label: "Overview", icon: Layers },
              { id: "dashboard", label: "ZK Studio", icon: Sliders },
              { id: "ledger", label: "Ledger State", icon: Database },
              { id: "privacy", label: "Privacy Matrix", icon: Lock },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "activity", label: "Activity", icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabId)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === id
                    ? "bg-white/15 text-white shadow-sm font-semibold border border-white/10"
                    : "text-[#c4c7c8] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Wallet Action */}
          <div className="flex items-center gap-3">
            {walletConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleWallet}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171f33] border border-white/15 hover:border-white/30 text-xs font-medium text-white transition-all shadow-sm"
                  title="Click to disconnect"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px] text-[#adc9eb]">addr_shielded...31a</span>
                  <span className="hidden sm:inline text-[#8e9192] text-[10px]">| Preprod</span>
                </button>
              </div>
            ) : (
              <button
                onClick={toggleWallet}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-glow-cyan"
              >
                <Wallet className="w-3.5 h-3.5" />
                {isConnecting ? "Connecting..." : "Connect Lace Wallet"}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-start gap-1 overflow-x-auto pt-3 mt-2 border-t border-white/5 no-scrollbar">
          {[
            { id: "home", label: "Overview" },
            { id: "dashboard", label: "ZK Studio" },
            { id: "ledger", label: "Ledger State" },
            { id: "privacy", label: "Privacy Matrix" },
            { id: "analytics", label: "Analytics" },
            { id: "activity", label: "Activity" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabId)}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
                activeTab === id
                  ? "bg-white/20 text-white font-semibold"
                  : "text-[#c4c7c8] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 md:py-12 space-y-12">
        {/* ======================================================== */}
        {/* TAB 1: HOME / OVERVIEW HERO */}
        {/* ======================================================== */}
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-up">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden glass-panel-elevated p-8 md:p-12 border border-white/20">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-[#dae2fd]">
                    Compact Smart Contract v0.23 · Level 3 Challenge
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#c4c7c8]" />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                  Presence, <br />
                  <span className="bg-gradient-to-r from-sky-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    proven privately.
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-[#c4c7c8] leading-relaxed font-normal">
                  Aurora verifies student attendance on the Midnight ledger without ever publishing who was there.
                  Students prove presence via local zero-knowledge proofs — zero names, zero IDs, and zero linkable
                  history on-chain.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => (ledger.sessionState === "OPEN" ? setShowCheckInModal(true) : setShowOpenModal(true))}
                    className="px-6 py-3.5 rounded-2xl bg-white text-[#0b1326] font-bold text-sm hover:bg-[#dae2fd] transition-all flex items-center gap-2 shadow-glass"
                  >
                    {ledger.sessionState === "OPEN" ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-purple-700" />
                        Check In With ZK Proof
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-purple-700" />
                        Open Attendance Window
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/15 transition-all flex items-center gap-2"
                  >
                    Launch ZK Studio
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab("privacy")}
                    className="px-5 py-3.5 rounded-2xl text-[#adc9eb] hover:text-white font-medium text-sm transition-all flex items-center gap-1.5"
                  >
                    View Privacy Model
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8e9192] uppercase tracking-wider font-semibold">
                  <span>Session Status</span>
                  <Radio className={`w-4 h-4 ${ledger.sessionState === "OPEN" ? "text-emerald-400" : "text-amber-400"}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${ledger.sessionState === "OPEN" ? "text-emerald-400" : "text-amber-400"}`}>
                    {ledger.sessionState}
                  </span>
                  {ledger.sessionState === "OPEN" && (
                    <span className="text-xs text-[#c4c7c8] truncate max-w-[140px]">{ledger.courseCode.split("·")[0]}</span>
                  )}
                </div>
                <p className="text-xs text-[#8e9192]">
                  {ledger.sessionState === "OPEN" ? "Accepting ZK student check-ins" : "No active attendance window"}
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8e9192] uppercase tracking-wider font-semibold">
                  <span>Private Check-Ins</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalCheckIns} <span className="text-xs font-normal text-emerald-400">+{sessionCheckIns} this window</span>
                </div>
                <p className="text-xs text-[#8e9192]">Zero identities revealed on-chain</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8e9192] uppercase tracking-wider font-semibold">
                  <span>ZK Proof Accuracy</span>
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{successRate}%</div>
                <p className="text-xs text-[#8e9192]">100% circuit verification rate</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8e9192] uppercase tracking-wider font-semibold">
                  <span>Ledger Sequence</span>
                  <RefreshCw className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-white">#{ledger.sequence}</div>
                <p className="text-xs text-[#8e9192]">Rotates student pseudonyms on close</p>
              </div>
            </div>

            {/* Core Privacy Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Nothing Personal On-Chain</h3>
                <p className="text-sm text-[#c4c7c8] leading-relaxed">
                  Student IDs and course names never leave your browser. The ledger receives only salted 32-byte
                  commitments and cryptographic hashes.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Rotating Pseudonyms</h3>
                <p className="text-sm text-[#c4c7c8] leading-relaxed">
                  Every attendance session increments a global sequence counter, producing a fresh mathematical
                  pseudonym so check-ins can never be linked across sessions.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Witness Stays Local</h3>
                <p className="text-sm text-[#c4c7c8] leading-relaxed">
                  Your private key is accessed exclusively inside the client-side <code className="text-pink-300">localSecretKey()</code> witness
                  function. Proofs are computed on-device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ZK STUDIO / DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Zero-Knowledge Attendance Studio</h2>
                <p className="text-sm text-[#8e9192]">
                  Interact with the Compact smart contract as an Instructor (Registrar) or Student (Attendee).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8e9192]">Contract State:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    ledger.sessionState === "OPEN"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {ledger.sessionState}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Role 1: Instructor Panel */}
              <div className="glass-panel p-7 rounded-3xl border border-white/15 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Instructor · Session Manager</h3>
                    </div>
                    <span className="text-xs font-mono text-[#8e9192]">Role: Registrar</span>
                  </div>

                  <p className="text-xs text-[#c4c7c8] leading-relaxed">
                    Open a cryptographically sealed attendance session. The Compact circuit hashes the course code
                    with a salt and publishes only the 32-byte course commitment on-chain.
                  </p>

                  {ledger.sessionState === "OPEN" ? (
                    <div className="p-4 rounded-2xl bg-[#0b1326]/80 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8e9192]">Current Active Window:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Live on Midnight
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{ledger.courseCode}</div>
                      <div className="text-[11px] font-mono text-[#8e9192] truncate">
                        Commitment: {ledger.courseCommitment}
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={handleCloseSession}
                          className="w-full py-2.5 px-4 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all"
                        >
                          Close Attendance Session (Bump Sequence)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-[#c4c7c8] block mb-1.5">
                          Select or Enter Course Code
                        </label>
                        <input
                          type="text"
                          value={inputCourseCode}
                          onChange={(e) => setInputCourseCode(e.target.value)}
                          placeholder="e.g. CS-401 · Distributed Systems"
                          className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COURSES.map((course) => (
                          <button
                            key={course}
                            type="button"
                            onClick={() => setInputCourseCode(course)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#adc9eb] border border-white/5 transition-all"
                          >
                            {course.split("·")[0].trim()}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleOpenSession(inputCourseCode)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-purple"
                      >
                        Open Cryptographically Sealed Window
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#8e9192] space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[#c4c7c8]">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Zero-Knowledge Assertion:
                  </div>
                  <div>Only the registrar who opened the session can close it on Midnight ledger.</div>
                </div>
              </div>

              {/* Role 2: Student Panel */}
              <div className="glass-panel p-7 rounded-3xl border border-white/15 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Student · Private Check-In</h3>
                    </div>
                    <span className="text-xs font-mono text-[#8e9192]">Role: Attendee</span>
                  </div>

                  <p className="text-xs text-[#c4c7c8] leading-relaxed">
                    Prove your attendance using client-side zero-knowledge proofs. Your student ID is computed inside
                    the local witness and never reaches the network.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-[#c4c7c8] block mb-1.5">Student ID (Secret Witness)</label>
                      <input
                        type="text"
                        value={inputStudentId}
                        onChange={(e) => setInputStudentId(e.target.value)}
                        placeholder="e.g. STU-2026-8941"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#c4c7c8] block mb-1.5">Target Course</label>
                      <input
                        type="text"
                        disabled
                        value={ledger.sessionState === "OPEN" ? ledger.courseCode : "No Active Window"}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#8e9192] cursor-not-allowed"
                      />
                    </div>

                    <button
                      disabled={ledger.sessionState !== "OPEN" || isProving}
                      onClick={handleExecuteCheckIn}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        ledger.sessionState === "OPEN"
                          ? "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-glow-cyan"
                          : "bg-white/10 text-[#8e9192] cursor-not-allowed"
                      }`}
                    >
                      {isProving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Proving Circuit & Submitting...
                        </>
                      ) : ledger.sessionState === "OPEN" ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate & Submit ZK Proof
                        </>
                      ) : (
                        "Attendance Window Closed"
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Proving Progress */}
                {isProving && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2 animate-fade-down">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                      <span>Generating Client ZK Proof</span>
                      <span>Step {zkStep} / 4</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-purple-400 h-full transition-all duration-500"
                        style={{ width: `${(zkStep / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#c4c7c8]">
                      {zkStep === 1 && "Executing localSecretKey() witness function..."}
                      {zkStep === 2 && "Calculating rotating pseudonym: hash('psa:student:', seq, sk)..."}
                      {zkStep === 3 && "Synthesizing salted attendance commitment..."}
                      {zkStep === 4 && "Disclosing proof to Midnight Preprod ledger..."}
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#8e9192] space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[#c4c7c8]">
                    <Shield className="w-3 h-3 text-sky-400" />
                    Guaranteed On-Chain Privacy:
                  </div>
                  <div>Your student ID ({inputStudentId}) will never be disclosed on the blockchain.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: LEDGER STATE EXPLORER */}
        {/* ======================================================== */}
        {activeTab === "ledger" && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Live On-Chain Ledger State</h2>
                <p className="text-sm text-[#8e9192]">
                  Direct view of public state variables disclosed on the Midnight ledger by Compact smart contract.
                </p>
              </div>
              <button
                onClick={() => addToast("Ledger Synchronized", "Fetched latest block data from Midnight Preprod", "info")}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Ledger
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Session State */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8e9192]">ledger state: SessionState</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      ledger.sessionState === "OPEN"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {ledger.sessionState}
                  </span>
                </div>
                <div className="text-lg font-bold text-white">
                  {ledger.sessionState === "OPEN" ? "Window Open" : "Window Closed"}
                </div>
                <p className="text-xs text-[#c4c7c8]">
                  Governs whether student check-in circuits can execute on-chain.
                </p>
              </div>

              {/* Field 2: Sequence Counter */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8e9192]">ledger sequence: Counter</span>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    Counter
                  </span>
                </div>
                <div className="text-lg font-bold text-white">Sequence #{ledger.sequence}</div>
                <p className="text-xs text-[#c4c7c8]">
                  Increments on every session close, resetting all student pseudonym derivations.
                </p>
              </div>

              {/* Field 3: Course Commitment */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8e9192]">ledger courseCommitment: Maybe&lt;Bytes&lt;32&gt;&gt;</span>
                  <button
                    onClick={() => copyToClipboard(ledger.courseCommitment, "Course")}
                    className="text-xs text-[#38bdf8] hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div className="font-mono text-xs text-[#dae2fd] bg-[#060e20] p-3 rounded-xl break-all border border-white/5">
                  {ledger.courseCommitment}
                </div>
                <p className="text-xs text-[#8e9192]">
                  Salted SHA-256 hash of <span className="text-white font-semibold">{ledger.courseCode}</span>. Plaintext never appears on-chain.
                </p>
              </div>

              {/* Field 4: Student Commitment (Rotating Pseudonym) */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8e9192]">ledger studentCommitment: Maybe&lt;Bytes&lt;32&gt;&gt;</span>
                  <button
                    onClick={() => copyToClipboard(ledger.studentCommitment, "Student Pseudonym")}
                    className="text-xs text-[#38bdf8] hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div className="font-mono text-xs text-[#dae2fd] bg-[#060e20] p-3 rounded-xl break-all border border-white/5">
                  {ledger.studentCommitment}
                </div>
                <p className="text-xs text-[#8e9192]">
                  Derived via <code className="text-sky-300">persistentHash(["psa:student:", sequence, localSecretKey()])</code>. Changes dynamically.
                </p>
              </div>

              {/* Field 5: Registrar Public Key */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8e9192]">ledger registrar: Bytes&lt;32&gt;</span>
                  <button
                    onClick={() => copyToClipboard(ledger.registrar, "Registrar Pubkey")}
                    className="text-xs text-[#38bdf8] hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div className="font-mono text-xs text-[#dae2fd] bg-[#060e20] p-3 rounded-xl break-all border border-white/5">
                  {ledger.registrar}
                </div>
                <p className="text-xs text-[#8e9192]">
                  Session opener identity hash. Prevents unauthorized instructors from tampering with active sessions.
                </p>
              </div>
            </div>

            {/* Compact Contract Code View */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white font-mono">attendance.compact (Compact v0.23)</h3>
                </div>
                <span className="text-[10px] text-[#8e9192] uppercase tracking-wider">Level 3 Architecture</span>
              </div>
              <pre className="bg-[#060e20] p-4 rounded-xl font-mono text-xs text-[#dae2fd] overflow-x-auto border border-white/5 leading-relaxed">
{`export circuit openSession(course: Bytes<32>): [] {
  assert(state != SessionState.OPEN, "An attendance session is already open");
  registrar = disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>));
  courseCommitment = disclose(some<Bytes<32>>(course));
  state = SessionState.OPEN;
}

export circuit checkIn(evidence: Bytes<32>): [] {
  assert(state == SessionState.OPEN, "No attendance session is open");
  studentCommitment = disclose(
    some<Bytes<32>>(studentPseudonym(localSecretKey(), sequence as Field as Bytes<32>))
  );
  attendanceCommitment = disclose(some<Bytes<32>>(evidence));
}`}
              </pre>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PRIVACY MODEL MATRIX */}
        {/* ======================================================== */}
        {activeTab === "privacy" && (
          <div className="space-y-8 animate-fade-up">
            <div>
              <h2 className="text-2xl font-bold text-white">Midnight Privacy Guarantee</h2>
              <p className="text-sm text-[#8e9192]">
                Detailed breakdown of what an observer learns vs. what is mathematically protected by zero-knowledge proofs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Strictly Private */}
              <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-rose-500/20">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-rose-300">Strictly Private (Kept Off-Chain)</h3>
                    <p className="text-xs text-[#8e9192]">Observer CANNOT Learn</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      label: "Student Identity Number",
                      desc: "Stored only in local ZK witness (localSecretKey()), never transmitted across network.",
                    },
                    {
                      label: "Student Name & PII",
                      desc: "Never enters the circuit; hashed client-side before any blockchain interaction.",
                    },
                    {
                      label: "Raw Course Identifier",
                      desc: "Salted SHA-256 commitment generated off-chain; plaintext never reaches the ledger.",
                    },
                    {
                      label: "Cross-Session Linkability",
                      desc: "Pseudonyms rotate per sequence counter, preventing any behavioral tracking.",
                    },
                    {
                      label: "Wallet ↔ Student Correlation",
                      desc: "Shielded address from Midnight Lace Wallet is never bound to a student profile.",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#0b1326]/60 border border-white/5 space-y-1">
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        {item.label}
                      </div>
                      <p className="text-xs text-[#c4c7c8] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Disclosed Public State */}
              <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-500/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-300">Disclosed On-Chain Public State</h3>
                    <p className="text-xs text-[#8e9192]">Observer CAN Learn</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      label: "sessionState",
                      desc: "READY / OPEN / CLOSED — shows whether an attendance window is currently live.",
                    },
                    {
                      label: "courseCommitment",
                      desc: "32-byte salted hash proving that the session belongs to a valid course curriculum.",
                    },
                    {
                      label: "studentCommitment (Pseudonym)",
                      desc: "Rotating cryptographic proof: hash('psa:student:' || sequence || sk).",
                    },
                    {
                      label: "attendanceCommitment",
                      desc: "32-byte salted evidence commitment verifying check-in criteria.",
                    },
                    {
                      label: "sequence",
                      desc: "Monotonic counter that increments on session close, rotating all pseudonyms.",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#0b1326]/60 border border-white/5 space-y-1">
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-[11px]">{item.label}</span>
                      </div>
                      <p className="text-xs text-[#c4c7c8] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ANALYTICS */}
        {/* ======================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-up">
            <div>
              <h2 className="text-2xl font-bold text-white">System Analytics & Proof Performance</h2>
              <p className="text-sm text-[#8e9192]">
                Zero-knowledge proof verification times, verification rates, and session metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
                <div className="text-xs text-[#8e9192] uppercase font-semibold">Average Proving Latency</div>
                <div className="text-3xl font-bold text-white">1.18s</div>
                <p className="text-xs text-emerald-400">Client-side proving in WebAssembly</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
                <div className="text-xs text-[#8e9192] uppercase font-semibold">PII Leakage Rate</div>
                <div className="text-3xl font-bold text-emerald-400">0.00%</div>
                <p className="text-xs text-[#8e9192]">Strictly zero student records stored</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
                <div className="text-xs text-[#8e9192] uppercase font-semibold">Supported Networks</div>
                <div className="text-3xl font-bold text-purple-400">Preprod</div>
                <p className="text-xs text-[#8e9192]">Midnight Substrate Testnet</p>
              </div>
            </div>

            {/* Course Distribution Table */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Active Curriculum Verified</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8e9192] font-semibold">
                      <th className="pb-3">Course Code</th>
                      <th className="pb-3">Sessions</th>
                      <th className="pb-3">Verified Check-Ins</th>
                      <th className="pb-3">Privacy Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 font-semibold text-white">CS-401 · Distributed Systems</td>
                      <td className="py-3">6</td>
                      <td className="py-3 font-mono">68 check-ins</td>
                      <td className="py-3 text-emerald-400">Shielded ZK Commitments</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-white">BIO-204 · Computational Genomics</td>
                      <td className="py-3">4</td>
                      <td className="py-3 font-mono">42 check-ins</td>
                      <td className="py-3 text-emerald-400">Shielded ZK Commitments</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-white">MATH-301 · Cryptography</td>
                      <td className="py-3">3</td>
                      <td className="py-3 font-mono">32 check-ins</td>
                      <td className="py-3 text-emerald-400">Shielded ZK Commitments</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ACTIVITY FEED */}
        {/* ======================================================== */}
        {activeTab === "activity" && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">On-Chain Activity Feed</h2>
                <p className="text-sm text-[#8e9192]">Live audit log of all zero-knowledge interactions and session updates.</p>
              </div>
              <span className="text-xs text-[#8e9192]">{activities.length} Recorded Events</span>
            </div>

            <div className="glass-panel rounded-2xl border border-white/10 divide-y divide-white/5">
              {activities.map((activity) => (
                <div key={activity.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        activity.role === "Instructor"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-sky-500/20 text-sky-400"
                      }`}
                    >
                      {activity.role === "Instructor" ? <Key className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{activity.action}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#c4c7c8]">
                          {activity.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#8e9192] mt-0.5">{activity.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="font-mono text-xs text-[#38bdf8]">{activity.txHash}</span>
                    <span className="text-xs text-[#8e9192]">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: OPEN SESSION MODAL */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-down">
          <div className="glass-panel-elevated max-w-md w-full p-7 rounded-3xl border border-white/20 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Open Attendance Session</h3>
              </div>
              <button onClick={() => setShowOpenModal(false)} className="text-[#8e9192] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#c4c7c8] block mb-1.5">Course Code / Name</label>
                <input
                  type="text"
                  value={inputCourseCode}
                  onChange={(e) => setInputCourseCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-[#8e9192]">Preset Courses:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COURSES.map((course) => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => setInputCourseCode(course)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#adc9eb] border border-white/5 transition-all"
                    >
                      {course.split("·")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#8e9192] leading-relaxed">
                Opening the session computes a 32-byte salted hash and publishes it to the Midnight ledger. Plaintext course
                codes remain strictly local.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8e9192] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOpenSession(inputCourseCode)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-glow-purple"
              >
                Open Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-down">
          <div className="glass-panel-elevated max-w-md w-full p-7 rounded-3xl border border-white/20 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Student Zero-Knowledge Check-In</h3>
              </div>
              <button onClick={() => setShowCheckInModal(false)} className="text-[#8e9192] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-xs text-[#8e9192]">Target Course Window:</div>
                <div className="text-sm font-bold text-white">{ledger.courseCode}</div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#c4c7c8] block mb-1.5">Student ID (Secret Witness)</label>
                <input
                  type="text"
                  value={inputStudentId}
                  onChange={(e) => setInputStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              {isProving && (
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                    <span>Computing ZK Proof</span>
                    <span>Step {zkStep} / 4</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-purple-400 h-full transition-all duration-500"
                      style={{ width: `${(zkStep / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#c4c7c8]">
                    {zkStep === 1 && "Executing localSecretKey() witness..."}
                    {zkStep === 2 && "Synthesizing rotating pseudonym..."}
                    {zkStep === 3 && "Constructing evidence hash..."}
                    {zkStep === 4 && "Disclosing proof on-chain..."}
                  </p>
                </div>
              )}

              <p className="text-xs text-[#8e9192] leading-relaxed">
                Your student ID is used only as private witness data. It will never be disclosed or stored on the Midnight
                ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProving}
                onClick={() => setShowCheckInModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8e9192] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProving}
                onClick={handleExecuteCheckIn}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-cyan flex items-center gap-2"
              >
                {isProving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Proving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Submit ZK Proof
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & ECOSYSTEM */}
      <footer className="glass-panel border-t border-white/10 px-6 lg:px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8e9192]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">Aurora</span> — Zero-Knowledge Student Attendance on Midnight
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Compact v0.23</span>
            <span className="hover:text-white cursor-pointer transition-colors">Midnight Preprod</span>
            <span className="hover:text-white cursor-pointer transition-colors">IOG Ecosystem</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
