"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Minus, Plus, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { validateFormData } from "@/lib/advancedAuditEngine";
import { TOOL_PLANS } from "@/lib/pricing";

const STORAGE_KEY = "ai-spend-form-data";

const AI_TOOLS = [
  { id: "cursor", name: "Cursor", icon: "⌘" },
  { id: "github-copilot", name: "GitHub Copilot", icon: "🐙" },
  { id: "claude", name: "Claude", icon: "◐" },
  { id: "chatgpt", name: "ChatGPT", icon: "◉" },
  { id: "anthropic-api", name: "Anthropic API", icon: "△" },
  { id: "openai-api", name: "OpenAI API", icon: "○" },
  { id: "gemini", name: "Gemini", icon: "✦" },
  { id: "windsurf", name: "Windsurf", icon: "▲" },
] as const;

const TEAM_SIZES = ["Just me", "2-5", "6-15", "16-50", "51-200", "200+"] as const;
const USE_CASES = ["Coding", "Writing", "Data", "Research", "Mixed"] as const;

type TeamSize = (typeof TEAM_SIZES)[number];
type UseCase = (typeof USE_CASES)[number];

export interface ToolConfig {
  enabled: boolean;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface SpendFormData {
  tools: Record<string, ToolConfig>;
  teamSize: TeamSize | null;
  useCases: UseCase[];
}

export type { TeamSize, UseCase };

export interface SubscriptionFormProps {
  onSubmit: (data: SpendFormData) => void;
}

const defaultToolConfig: ToolConfig = {
  enabled: false,
  plan: "",
  monthlySpend: 0,
  seats: 1,
};

const getInitialFormData = (): SpendFormData => ({
  tools: AI_TOOLS.reduce(
    (acc, tool) => ({
      ...acc,
      [tool.id]: { ...defaultToolConfig },
    }),
    {}
  ),
  teamSize: null,
  useCases: [],
});

function mergeStoredFormData(parsed: Partial<SpendFormData>): SpendFormData {
  const initial = getInitialFormData();
  return {
    teamSize: parsed.teamSize ?? initial.teamSize,
    useCases: Array.isArray(parsed.useCases) ? parsed.useCases : initial.useCases,
    tools: AI_TOOLS.reduce(
      (acc, tool) => {
        const saved = parsed.tools?.[tool.id];
        acc[tool.id] = { ...defaultToolConfig, ...saved };
        return acc;
      },
      {} as Record<string, ToolConfig>
    ),
  };
}

function loadFormDataFromStorage(): SpendFormData {
  if (typeof window === "undefined") return getInitialFormData();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return getInitialFormData();
  try {
    return mergeStoredFormData(JSON.parse(saved) as Partial<SpendFormData>);
  } catch {
    return getInitialFormData();
  }
}

export function SubscriptionForm({ onSubmit }: SubscriptionFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<SpendFormData>(getInitialFormData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setFormData(loadFormDataFromStorage());
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isHydrated]);

  const enabledTools = Object.entries(formData.tools).filter(
    ([, config]) => config.enabled
  );
  const totalMonthlySpend = enabledTools.reduce(
    (sum, [, config]) => sum + config.monthlySpend * config.seats,
    0
  );

  const updateTool = (toolId: string, updates: Partial<ToolConfig>) => {
    setFormData((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: { ...prev.tools[toolId], ...updates },
      },
    }));
  };

  const toggleUseCase = (useCase: UseCase) => {
    setFormData((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(useCase)
        ? prev.useCases.filter((uc) => uc !== useCase)
        : [...prev.useCases, useCase],
    }));
  };

  function handleRunAudit() {
    const validation = validateFormData(formData);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear errors if validation passes
    setValidationErrors([]);
    onSubmit(formData);
  }

  if (!isHydrated) {
    return (
      <div className="w-full rounded-2xl border border-[#e7e5e4] bg-white flex items-center justify-center py-20 shadow-[0_12px_40px_-12px_rgba(28,25,23,0.1)]">
        <div className="text-[#57534e] text-sm">Loading saved data…</div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-[#e7e5e4] bg-white text-[#1c1917] pb-28 relative overflow-hidden shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_40px_-12px_rgba(28,25,23,0.1)]">
      <div className="flex items-center justify-center gap-2 px-6 pt-6">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            step === 1 ? "bg-[#cc785c]" : "bg-[#d6d3d1]"
          )}
        />
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            step === 2 ? "bg-[#cc785c]" : "bg-[#d6d3d1]"
          )}
        />
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div className="mx-6 mt-6 p-4 rounded-lg border border-red-200 bg-red-50 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-900">
                Please fix the following issues:
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-2">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="list-disc">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <main className="px-6 sm:px-10 py-8">
        {step === 1 ? (
          <Step1
            tools={formData.tools}
            updateTool={updateTool}
          />
        ) : (
          <Step2
            teamSize={formData.teamSize}
            setTeamSize={(size) => setFormData((prev) => ({ ...prev, teamSize: size }))}
            useCases={formData.useCases}
            toggleUseCase={toggleUseCase}
            totalMonthlySpend={totalMonthlySpend}
            enabledToolsCount={enabledTools.length}
          />
        )}
      </main>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#e7e5e4] rounded-b-2xl">
        <div className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:justify-between max-w-4xl mx-auto w-full">
          <div className="text-sm text-[#57534e]">
            <span className="text-[#1c1917] font-medium">{enabledTools.length} tools</span>
            {" · "}
            <span className="text-[#cc785c] font-medium">
              ${totalMonthlySpend.toLocaleString()}/mo
            </span>
          </div>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-[#57534e] hover:text-[#1c1917] hover:bg-[#f5f4f0]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                className="bg-[#cc785c] text-white hover:bg-[#b86a50]"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleRunAudit}
                className="bg-[#cc785c] text-white hover:bg-[#b86a50]"
              >
                Run Audit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Step1Props {
  tools: Record<string, ToolConfig>;
  updateTool: (toolId: string, updates: Partial<ToolConfig>) => void;
}

function Step1({ tools, updateTool }: Step1Props) {
  return (
    <div className="w-full">
      <div className="mb-10 text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-[#1c1917]">
          Select your AI tools
        </h1>
        <p className="text-[#57534e] text-sm sm:text-base leading-relaxed">
          Enable each tool you use and configure your spend details
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {AI_TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            config={tools[tool.id]}
            onUpdate={(updates) => updateTool(tool.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

interface ToolCardProps {
  tool: (typeof AI_TOOLS)[number];
  config: ToolConfig;
  onUpdate: (updates: Partial<ToolConfig>) => void;
}

function ToolCard({ tool, config, onUpdate }: ToolCardProps) {
  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all duration-200",
        config.enabled
          ? "border-[#cc785c]/50 bg-[#cc785c]/5"
          : "border-[#e7e5e4] bg-white hover:border-[#d6d3d1]"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f5f4f0] border border-[#e7e5e4] flex items-center justify-center text-lg">
            {tool.icon}
          </div>
          <span className="text-sm font-medium text-[#1c1917]">{tool.name}</span>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled: boolean) => onUpdate({ enabled })}
          className="data-[state=checked]:bg-[#cc785c]"
        />
      </div>

      {/* Expanded Config */}
      <div
        className={cn(
          "grid transition-all duration-200 overflow-hidden",
          config.enabled ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pt-3 border-t border-[#e7e5e4]">
            {/* Plan Dropdown */}
            <div>
              <label className="text-xs text-[#57534e] mb-1.5 block">Plan</label>
              <Select
                value={config.plan}
                onValueChange={(plan: string) => {
                  const selectedPlan = TOOL_PLANS[tool.id].find(p => p.name === plan);
                  onUpdate({ plan, monthlySpend: selectedPlan ? selectedPlan.price : config.monthlySpend });
                }}
              >
                <SelectTrigger className="w-full h-8 text-xs bg-white border-[#e7e5e4] text-[#1c1917]">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e7e5e4] text-[#1c1917]">
                  {TOOL_PLANS[tool.id].map((p) => (
                    <SelectItem key={p.name} value={p.name} className="text-xs text-[#1c1917]">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Spend */}
            <div>
              <label className="text-xs text-[#57534e] mb-1.5 block">
                Monthly spend
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534e] text-xs">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  value={config.monthlySpend || ""}
                  onChange={(e) =>
                    onUpdate({ monthlySpend: parseFloat(e.target.value) || 0 })
                  }
                  className="pl-6 h-8 text-xs bg-white border-[#e7e5e4] text-[#1c1917] placeholder:text-[#a8a29e]"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Seats Counter */}
            <div>
              <label className="text-xs text-[#57534e] mb-1.5 block">Seats</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdate({ seats: Math.max(1, config.seats - 1) })}
                  className="h-8 w-8 bg-white border-[#e7e5e4] text-[#1c1917]"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <div className="flex-1 h-8 flex items-center justify-center text-xs text-[#1c1917] bg-white rounded-md border border-[#e7e5e4]">
                  {config.seats}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdate({ seats: config.seats + 1 })}
                  className="h-8 w-8 bg-white border-[#e7e5e4] text-[#1c1917]"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Step2Props {
  teamSize: TeamSize | null;
  setTeamSize: (size: TeamSize) => void;
  useCases: UseCase[];
  toggleUseCase: (useCase: UseCase) => void;
  totalMonthlySpend: number;
  enabledToolsCount: number;
}

function Step2({
  teamSize,
  setTeamSize,
  useCases,
  toggleUseCase,
  totalMonthlySpend,
  enabledToolsCount,
}: Step2Props) {
  return (
    <div className="w-full">
      <div className="mb-10 text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-[#1c1917]">
          Team context
        </h1>
        <p className="text-[#57534e] text-sm sm:text-base leading-relaxed">
          Help us understand your team to provide better insights
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Team Size Selector */}
          <div className="text-center lg:text-left">
            <label className="text-sm font-medium mb-4 block text-[#1c1917]">Team size</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-center">
              {TEAM_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTeamSize(size)}
                  className={cn(
                    "py-3 px-4 rounded-lg border text-sm transition-all",
                    teamSize === size
                      ? "border-[#cc785c] bg-[#cc785c]/10 text-[#1c1917]"
                      : "border-[#e7e5e4] bg-white hover:border-[#d6d3d1] text-[#57534e] hover:text-[#1c1917]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Use Case Chips */}
          <div className="text-center lg:text-left">
            <label className="text-sm font-medium mb-4 block text-[#1c1917]">Primary use cases</label>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {USE_CASES.map((useCase) => (
                <button
                  key={useCase}
                  type="button"
                  onClick={() => toggleUseCase(useCase)}
                  className={cn(
                    "py-2 px-4 rounded-full border text-sm transition-all",
                    useCases.includes(useCase)
                      ? "border-[#cc785c] bg-[#cc785c]/10 text-[#1c1917]"
                      : "border-[#e7e5e4] bg-white hover:border-[#d6d3d1] text-[#57534e] hover:text-[#1c1917]"
                  )}
                >
                  {useCase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Preview Card */}
        <div className="border border-[#e7e5e4] rounded-lg p-6 bg-white">
          <h3 className="text-sm font-medium mb-6 text-[#57534e]">Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[#57534e]">Tools enabled</span>
              <span className="text-lg font-medium text-[#1c1917]">{enabledToolsCount}</span>
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[#57534e]">Team size</span>
              <span className="text-lg font-medium text-[#1c1917]">{teamSize || "—"}</span>
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[#57534e]">Use cases</span>
              <span className="text-lg font-medium text-[#1c1917]">
                {useCases.length > 0 ? useCases.join(", ") : "—"}
              </span>
            </div>
            
            <div className="pt-4 mt-4 border-t border-[#e7e5e4]">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[#57534e]">Total declared spend</span>
                <span className="text-2xl font-medium text-[#cc785c]">
                  ${totalMonthlySpend.toLocaleString()}
                  <span className="text-sm text-[#57534e] font-normal">/mo</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** v0 component name */
export const SpendInputForm = SubscriptionForm;
