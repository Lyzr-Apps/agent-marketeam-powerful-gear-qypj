'use client'

import { useState, useCallback, useRef } from 'react'
import { callAIAgent, type AIAgentResponse } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import {
  FiCopy, FiDownload, FiEdit, FiSettings,
  FiChevronDown, FiCheck, FiX,
  FiSearch, FiFileText, FiImage, FiBarChart2, FiLayout,
  FiTag, FiTarget, FiTrendingUp, FiAlertCircle,
  FiRefreshCw, FiClipboard, FiZap
} from 'react-icons/fi'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MARKETING_COORDINATOR_ID = '6991e15a83535abf424bf440'

const AGENTS = [
  { id: '6991e15a83535abf424bf440', name: 'Marketing Coordinator', role: 'Orchestrates the full pipeline' },
  { id: '6991e141197e042c402253be', name: 'Content Writer', role: 'Drafts written content' },
  { id: '6991e14183535abf424bf43e', name: 'SEO Analyzer', role: 'Evaluates SEO quality' },
  { id: '6991e1426a46d7921f7bf5a4', name: 'Graphics Generator', role: 'Creates visual assets' },
]

const CONTENT_TYPES = ['Blog Post', 'Social Media', 'Ad Copy', 'Email']
const TONES = ['Professional', 'Casual', 'Persuasive', 'Informative']
const LOADING_MESSAGES = [
  'Drafting content...',
  'Analyzing SEO...',
  'Generating graphics...',
  'Finalizing package...',
]

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

interface WrittenContent {
  title: string
  content: string
  meta_description: string
  word_count: number
  content_type: string
  summary: string
}

interface SeoAnalysis {
  seo_score: number
  keyword_analysis: string
  readability_score: string
  heading_structure: string
  meta_description_quality: string
  recommendations: string
  content_length_assessment: string
  improvement_summary: string
}

interface Graphics {
  image_description: string
  image_type: string
  design_notes: string
  suggested_alt_text: string
  dimensions: string
}

interface MarketingResponse {
  project_title: string
  content_brief_summary: string
  written_content: WrittenContent
  seo_analysis: SeoAnalysis
  graphics: Graphics
  status: string
}

interface ArtifactFile {
  file_url: string
  name?: string
  format_type?: string
}

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------

const SAMPLE_FORM = {
  topic: 'The Future of AI in Digital Marketing',
  contentType: 'Blog Post',
  tone: 'Professional',
  targetAudience: 'Marketing managers and CMOs at mid-size SaaS companies looking to leverage AI tools for campaign optimization and content personalization.',
  keywords: ['AI marketing', 'digital transformation', 'marketing automation', 'personalization'],
  wordCount: 1200,
  brandNotes: 'Use a forward-thinking, data-driven tone. Avoid jargon. Reference industry statistics where possible.',
}

const SAMPLE_RESULT: MarketingResponse = {
  project_title: 'The Future of AI in Digital Marketing',
  content_brief_summary: 'A comprehensive blog post exploring how AI is transforming digital marketing for SaaS companies, targeting marketing managers and CMOs.',
  written_content: {
    title: 'How AI Is Reshaping Digital Marketing in 2025',
    content: '# How AI Is Reshaping Digital Marketing in 2025\n\nArtificial intelligence has moved from a futuristic concept to an everyday reality in digital marketing. According to recent studies, **73% of marketing leaders** now use AI-powered tools in their daily workflows.\n\n## The Rise of Predictive Analytics\n\nPredictive analytics powered by machine learning is helping marketers anticipate customer behavior with remarkable accuracy. By analyzing historical data patterns, AI models can:\n\n- Forecast campaign performance before launch\n- Identify high-value customer segments automatically\n- Optimize ad spend allocation in real-time\n- Predict churn risk and trigger retention campaigns\n\n## Content Personalization at Scale\n\nGone are the days of one-size-fits-all messaging. AI enables **hyper-personalization** across every touchpoint:\n\n1. Dynamic email subject lines tailored to individual preferences\n2. Website content that adapts to visitor behavior patterns\n3. Product recommendations based on collaborative filtering\n4. Automated A/B testing with statistical significance tracking\n\n## Marketing Automation 2.0\n\nThe next generation of marketing automation goes beyond simple drip campaigns. Modern AI-powered platforms offer:\n\n- **Intelligent Lead Scoring**: ML models that continuously learn which signals indicate purchase intent\n- **Conversational AI**: Chatbots that handle complex queries and qualify leads 24/7\n- **Creative Optimization**: Automated generation and testing of ad creative variations\n\n## Key Takeaways\n\nThe integration of AI into digital marketing is no longer optional. Companies that embrace these technologies now will gain a significant competitive advantage in customer acquisition, retention, and lifetime value optimization.',
    meta_description: 'Discover how AI is transforming digital marketing in 2025. Learn about predictive analytics, content personalization, and next-gen marketing automation strategies for SaaS companies.',
    word_count: 1187,
    content_type: 'Blog Post',
    summary: 'A data-driven exploration of AI applications in digital marketing, covering predictive analytics, personalization at scale, and next-generation automation tools.',
  },
  seo_analysis: {
    seo_score: 82,
    keyword_analysis: 'Primary keyword "AI marketing" appears 4 times with natural placement. Secondary keywords "digital transformation" and "marketing automation" are well-distributed. Keyword density is optimal at 1.8%.',
    readability_score: 'Grade Level: 10.2 (Professional audience appropriate). Flesch Reading Ease: 54.3. Sentences are varied in length with good paragraph structure.',
    heading_structure: 'H1: 1 (correct), H2: 4 (good hierarchy), H3: 0. Consider adding H3 subheadings under longer sections for better scannability.',
    meta_description_quality: 'Meta description is 158 characters (ideal range 150-160). Contains primary keyword and a clear value proposition. Includes a call to action verb "Discover".',
    recommendations: 'Add internal links to related content, Include more specific statistics and data points, Add schema markup for article type, Optimize image alt text for target keywords, Consider adding a FAQ section for featured snippet potential, Increase use of semantic keywords and LSI terms',
    content_length_assessment: 'Content length of 1187 words is appropriate for a blog post targeting competitive keywords. Consider expanding to 1500+ words for improved ranking potential in competitive SERPs.',
    improvement_summary: 'Strong foundation with good keyword placement and readability. Key improvements: add internal links, expand content length slightly, include FAQ section for featured snippets, and enhance heading hierarchy with H3 tags.',
  },
  graphics: {
    image_description: 'A futuristic digital illustration showing interconnected marketing channels (email, social, web) with AI neural network patterns overlaying a gradient background of deep indigo to teal.',
    image_type: 'Blog Header',
    design_notes: 'Clean, modern design using the brand color palette. Abstract data visualization elements convey the AI/technology theme without being overly technical. High contrast text overlay area on the left third for title placement.',
    suggested_alt_text: 'AI-powered digital marketing channels interconnected through neural network visualization',
    dimensions: '1200x630',
  },
  status: 'Complete - All deliverables generated successfully',
}

const SAMPLE_IMAGES: ArtifactFile[] = [
  { file_url: 'https://placehold.co/1200x630/4f46e5/ffffff?text=AI+Marketing+Blog+Header', name: 'blog-header.png', format_type: 'image/png' },
]

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-indigo-300">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-4 mb-1 text-indigo-200">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-white">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm text-slate-300">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm text-slate-300">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-slate-300">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Safe JSON parser for agent response
// ---------------------------------------------------------------------------

function safeParseResult(result: AIAgentResponse | null): MarketingResponse | null {
  if (!result) return null
  let data: any = result?.response?.result
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      const match = data.match(/\{[\s\S]*\}/)
      if (match) {
        try { data = JSON.parse(match[0]) } catch { return null }
      } else {
        return null
      }
    }
  }
  if (data?.result && typeof data.result === 'object') {
    data = data.result
  }
  if (!data || typeof data !== 'object') return null
  return data as MarketingResponse
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SidebarIcon({ icon: Icon, label, active, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'}`}
    >
      <Icon size={18} />
    </button>
  )
}

function SEOScoreCircle({ score }: { score: number }) {
  const safeScore = typeof score === 'number' ? score : 0
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeScore / 100) * circumference
  const color = safeScore >= 80 ? '#22c55e' : safeScore >= 60 ? '#eab308' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{safeScore}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium mt-2" style={{ color }}>
        {safeScore >= 80 ? 'Excellent' : safeScore >= 60 ? 'Good' : 'Needs Work'}
      </span>
    </div>
  )
}

function KeywordTag({ keyword, onRemove }: { keyword: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
      <FiTag size={10} />
      {keyword}
      <button onClick={onRemove} className="ml-0.5 hover:text-red-400 transition-colors"><FiX size={12} /></button>
    </span>
  )
}

function LoadingOverlay({ messageIndex }: { messageIndex: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '2s' }} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-slate-200">{LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]}</p>
        <p className="text-xs text-slate-500">Our AI agents are collaborating to create your content package</p>
      </div>
      <div className="flex gap-2 mt-2">
        {AGENTS.map((agent, idx) => (
          <div key={agent.id} className={`w-2 h-2 rounded-full transition-all duration-500 ${idx <= messageIndex ? 'bg-indigo-500 scale-110' : 'bg-slate-600'}`} />
        ))}
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-indigo-400" />
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="text-sm text-slate-300">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Page() {
  // Form state
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState('Blog Post')
  const [tone, setTone] = useState('Professional')
  const [targetAudience, setTargetAudience] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [wordCount, setWordCount] = useState(800)
  const [brandNotes, setBrandNotes] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'graphics'>('content')
  const [sampleMode, setSampleMode] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [sidebarPage, setSidebarPage] = useState<'dashboard' | 'history' | 'templates' | 'settings'>('dashboard')
  const [checkedRecs, setCheckedRecs] = useState<Record<number, boolean>>({})

  // Result state
  const [resultData, setResultData] = useState<MarketingResponse | null>(null)
  const [artifactFiles, setArtifactFiles] = useState<ArtifactFile[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const loadingInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Computed display data
  const displayData = sampleMode && !resultData ? SAMPLE_RESULT : resultData
  const displayImages = sampleMode && artifactFiles.length === 0 && !resultData ? SAMPLE_IMAGES : artifactFiles
  const hasResults = displayData !== null

  // Apply sample data to form
  const applySample = useCallback((on: boolean) => {
    setSampleMode(on)
    if (on && !resultData) {
      setTopic(SAMPLE_FORM.topic)
      setContentType(SAMPLE_FORM.contentType)
      setTone(SAMPLE_FORM.tone)
      setTargetAudience(SAMPLE_FORM.targetAudience)
      setKeywords([...SAMPLE_FORM.keywords])
      setWordCount(SAMPLE_FORM.wordCount)
      setBrandNotes(SAMPLE_FORM.brandNotes)
    }
    if (!on && !resultData) {
      setTopic('')
      setContentType('Blog Post')
      setTone('Professional')
      setTargetAudience('')
      setKeywords([])
      setWordCount(800)
      setBrandNotes('')
    }
  }, [resultData])

  // Add keyword
  const addKeyword = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault()
      const kw = keywordInput.trim()
      if (!keywords.includes(kw)) {
        setKeywords(prev => [...prev, kw])
      }
      setKeywordInput('')
    }
  }, [keywordInput, keywords])

  const removeKeyword = useCallback((kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw))
  }, [])

  // Copy handler
  const handleCopy = useCallback(async (text: string, field: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }, [])

  // Download all as text
  const downloadAll = useCallback(() => {
    if (!displayData) return
    const wc = displayData.written_content
    const seo = displayData.seo_analysis
    const gfx = displayData.graphics

    let text = `MARKETING CONTENT PACKAGE\n`
    text += `========================\n\n`
    text += `Project: ${displayData.project_title ?? ''}\n`
    text += `Brief: ${displayData.content_brief_summary ?? ''}\n`
    text += `Status: ${displayData.status ?? ''}\n\n`
    text += `--- WRITTEN CONTENT ---\n\n`
    text += `Title: ${wc?.title ?? ''}\n`
    text += `Type: ${wc?.content_type ?? ''}\n`
    text += `Word Count: ${wc?.word_count ?? 0}\n`
    text += `Meta Description: ${wc?.meta_description ?? ''}\n`
    text += `Summary: ${wc?.summary ?? ''}\n\n`
    text += `${wc?.content ?? ''}\n\n`
    text += `--- SEO ANALYSIS ---\n\n`
    text += `SEO Score: ${seo?.seo_score ?? 0}/100\n`
    text += `Keyword Analysis: ${seo?.keyword_analysis ?? ''}\n`
    text += `Readability: ${seo?.readability_score ?? ''}\n`
    text += `Heading Structure: ${seo?.heading_structure ?? ''}\n`
    text += `Meta Quality: ${seo?.meta_description_quality ?? ''}\n`
    text += `Content Length: ${seo?.content_length_assessment ?? ''}\n`
    text += `Recommendations: ${seo?.recommendations ?? ''}\n`
    text += `Improvement Summary: ${seo?.improvement_summary ?? ''}\n\n`
    text += `--- GRAPHICS ---\n\n`
    text += `Description: ${gfx?.image_description ?? ''}\n`
    text += `Type: ${gfx?.image_type ?? ''}\n`
    text += `Design Notes: ${gfx?.design_notes ?? ''}\n`
    text += `Alt Text: ${gfx?.suggested_alt_text ?? ''}\n`
    text += `Dimensions: ${gfx?.dimensions ?? ''}\n`

    if (Array.isArray(displayImages) && displayImages.length > 0) {
      text += `\nImage URLs:\n`
      displayImages.forEach((img, i) => {
        text += `  ${i + 1}. ${img?.file_url ?? 'N/A'}\n`
      })
    }

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(displayData.project_title ?? 'marketing-content').replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [displayData, displayImages])

  // Generate content
  const generateContent = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a content topic before generating.')
      return
    }
    setError(null)
    setLoading(true)
    setLoadingMsgIdx(0)
    setResultData(null)
    setArtifactFiles([])
    setCheckedRecs({})
    setActiveAgentId(MARKETING_COORDINATOR_ID)

    loadingInterval.current = setInterval(() => {
      setLoadingMsgIdx(prev => prev + 1)
    }, 3000)

    const message = `Content Brief:
- Topic: ${topic}
- Content Type: ${contentType}
- Tone: ${tone}
- Target Audience: ${targetAudience || 'General audience'}
- Primary Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'None specified'}
- Word Count: ${wordCount}
- Brand Voice Notes: ${brandNotes || 'None specified'}

Please create a complete marketing content package including written content, SEO analysis, and graphics.`

    try {
      const result = await callAIAgent(message, MARKETING_COORDINATOR_ID)

      if (loadingInterval.current) clearInterval(loadingInterval.current)

      if (result?.success) {
        const parsed = safeParseResult(result)
        if (parsed) {
          setResultData(parsed)
          setActiveTab('content')
        } else {
          setError('Received a response but could not parse the marketing data. The agent may have returned an unexpected format.')
        }

        const files = Array.isArray(result?.module_outputs?.artifact_files) ? result.module_outputs.artifact_files : []
        setArtifactFiles(files as ArtifactFile[])
      } else {
        setError(result?.error || result?.response?.message || 'Failed to generate content. Please try again.')
      }
    } catch (err: any) {
      if (loadingInterval.current) clearInterval(loadingInterval.current)
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [topic, contentType, tone, targetAudience, keywords, wordCount, brandNotes])

  // Recommendations as array
  const recommendations: string[] = displayData?.seo_analysis?.recommendations
    ? displayData.seo_analysis.recommendations.split(',').map(r => r.trim()).filter(Boolean)
    : []

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* ---- LEFT SIDEBAR ---- */}
      <aside className="w-16 flex-shrink-0 bg-slate-900/80 border-r border-slate-800 flex flex-col items-center py-4 gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
          <FiZap size={16} className="text-white" />
        </div>
        <SidebarIcon icon={FiLayout} label="Dashboard" active={sidebarPage === 'dashboard'} onClick={() => setSidebarPage('dashboard')} />
        <SidebarIcon icon={FiRefreshCw} label="History" active={sidebarPage === 'history'} onClick={() => setSidebarPage('history')} />
        <SidebarIcon icon={FiClipboard} label="Templates" active={sidebarPage === 'templates'} onClick={() => setSidebarPage('templates')} />
        <div className="flex-1" />
        <SidebarIcon icon={FiSettings} label="Settings" active={sidebarPage === 'settings'} onClick={() => setSidebarPage('settings')} />
      </aside>

      {/* ---- MAIN AREA ---- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ---- CENTER: Form workspace ---- */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Marketing Team Hub</h1>
              <p className="text-sm text-slate-400 mt-0.5">Create complete marketing content packages with AI-powered agents</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-slate-400">Sample Data</span>
                <button
                  role="switch"
                  aria-checked={sampleMode}
                  onClick={() => applySample(!sampleMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${sampleMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ${sampleMode ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
              </label>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
              <FiAlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><FiX size={14} /></button>
            </div>
          )}

          {/* Content brief form */}
          <div className="space-y-5 max-w-2xl">
            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Topic</label>
              <input
                type="text"
                placeholder="Enter your content topic..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Content type + Tone row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Content Type</label>
                <div className="relative">
                  <select
                    value={contentType}
                    onChange={e => setContentType(e.target.value)}
                    className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 appearance-none transition-all"
                  >
                    {CONTENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </select>
                  <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tone</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TONES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${tone === t ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:border-slate-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1"><FiTarget size={11} /> Target Audience</span>
              </label>
              <textarea
                rows={2}
                placeholder="Describe your target audience..."
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1"><FiTag size={11} /> Primary Keywords</span>
              </label>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {keywords.map(kw => <KeywordTag key={kw} keyword={kw} onRemove={() => removeKeyword(kw)} />)}
                </div>
                <input
                  type="text"
                  placeholder={keywords.length === 0 ? 'Type a keyword and press Enter...' : 'Add another...'}
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={addKeyword}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Word count slider */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Word Count: <span className="text-indigo-400">{wordCount}</span>
              </label>
              <input
                type="range"
                min={300}
                max={2000}
                step={50}
                value={wordCount}
                onChange={e => setWordCount(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                <span>300</span><span>1000</span><span>2000</span>
              </div>
            </div>

            {/* Brand notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Brand Voice Notes <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Any brand guidelines or voice notes..."
                value={brandNotes}
                onChange={e => setBrandNotes(e.target.value)}
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={generateContent}
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <FiRefreshCw size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiZap size={16} />
                  Create Marketing Content
                </>
              )}
            </button>
          </div>

          {/* Agent info section */}
          <div className="mt-8 max-w-2xl">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Agent Pipeline</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AGENTS.map(agent => {
                  const isActive = activeAgentId === agent.id
                  return (
                    <div key={agent.id} className={`rounded-md border p-2 transition-all duration-300 ${isActive ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-slate-800 bg-slate-800/30'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : resultData ? 'bg-green-500' : 'bg-slate-600'}`} />
                        <span className="text-[10px] font-semibold text-slate-300 truncate">{agent.name}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-tight">{agent.role}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>

        {/* ---- RIGHT: Results panel ---- */}
        <aside className={`border-l border-slate-800 bg-slate-900/50 flex flex-col transition-all duration-300 ${hasResults || loading ? 'w-full lg:w-[520px] xl:w-[580px]' : 'w-0 lg:w-0 overflow-hidden'}`}>
          {loading && (
            <div className="flex-1 p-6">
              <LoadingOverlay messageIndex={loadingMsgIdx} />
            </div>
          )}

          {!loading && hasResults && (
            <>
              {/* Project header */}
              <div className="px-5 pt-5 pb-3 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white truncate">{displayData?.project_title ?? 'Marketing Package'}</h2>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{displayData?.content_brief_summary ?? ''}</p>
                {displayData?.status && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium border border-green-500/20">
                    <FiCheck size={10} /> {displayData.status}
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {[
                  { key: 'content' as const, icon: FiFileText, label: 'Content' },
                  { key: 'seo' as const, icon: FiBarChart2, label: 'SEO' },
                  { key: 'graphics' as const, icon: FiImage, label: 'Graphics' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200 border-b-2 ${activeTab === tab.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5">

                {/* ---- CONTENT TAB ---- */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="text-lg font-bold text-white">{displayData?.written_content?.title ?? 'Untitled'}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {displayData?.written_content?.content_type && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-medium border border-indigo-500/20">
                            <FiFileText size={9} /> {displayData.written_content.content_type}
                          </span>
                        )}
                        {(displayData?.written_content?.word_count ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-medium border border-purple-500/20">
                            {displayData?.written_content?.word_count} words
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {displayData?.written_content?.summary && (
                      <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 p-3">
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Summary</h4>
                        <p className="text-sm text-slate-300">{displayData.written_content.summary}</p>
                      </div>
                    )}

                    {/* Content body */}
                    <div className="rounded-lg bg-slate-800/30 border border-slate-700/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Article Content</h4>
                        <button
                          onClick={() => handleCopy(displayData?.written_content?.content ?? '', 'content')}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 transition-all"
                        >
                          {copiedField === 'content' ? <><FiCheck size={11} /> Copied</> : <><FiCopy size={11} /> Copy</>}
                        </button>
                      </div>
                      {renderMarkdown(displayData?.written_content?.content ?? '')}
                    </div>

                    {/* Meta description */}
                    {displayData?.written_content?.meta_description && (
                      <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Meta Description</h4>
                          <button
                            onClick={() => handleCopy(displayData?.written_content?.meta_description ?? '', 'meta')}
                            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                          >
                            {copiedField === 'meta' ? <FiCheck size={10} /> : <FiCopy size={10} />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 italic">{displayData.written_content.meta_description}</p>
                        <span className="text-[9px] text-slate-600 mt-1 block">{(displayData.written_content.meta_description ?? '').length} characters</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ---- SEO TAB ---- */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    {/* Score */}
                    <div className="flex justify-center py-2">
                      <SEOScoreCircle score={displayData?.seo_analysis?.seo_score ?? 0} />
                    </div>

                    {/* Analysis sections */}
                    <InfoCard icon={FiSearch} title="Keyword Analysis">
                      {renderMarkdown(displayData?.seo_analysis?.keyword_analysis ?? '')}
                    </InfoCard>

                    <InfoCard icon={FiFileText} title="Readability Score">
                      {renderMarkdown(displayData?.seo_analysis?.readability_score ?? '')}
                    </InfoCard>

                    <InfoCard icon={FiLayout} title="Heading Structure">
                      {renderMarkdown(displayData?.seo_analysis?.heading_structure ?? '')}
                    </InfoCard>

                    <InfoCard icon={FiEdit} title="Meta Description Quality">
                      {renderMarkdown(displayData?.seo_analysis?.meta_description_quality ?? '')}
                    </InfoCard>

                    <InfoCard icon={FiBarChart2} title="Content Length Assessment">
                      {renderMarkdown(displayData?.seo_analysis?.content_length_assessment ?? '')}
                    </InfoCard>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FiTrendingUp size={14} className="text-indigo-400" />
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recommendations</h4>
                        </div>
                        <ul className="space-y-2">
                          {recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <button
                                onClick={() => setCheckedRecs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${checkedRecs[idx] ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600 hover:border-slate-500'}`}
                              >
                                {checkedRecs[idx] && <FiCheck size={10} className="text-white" />}
                              </button>
                              <span className={`text-sm ${checkedRecs[idx] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvement summary */}
                    {displayData?.seo_analysis?.improvement_summary && (
                      <InfoCard icon={FiAlertCircle} title="Improvement Summary">
                        {renderMarkdown(displayData.seo_analysis.improvement_summary)}
                      </InfoCard>
                    )}
                  </div>
                )}

                {/* ---- GRAPHICS TAB ---- */}
                {activeTab === 'graphics' && (
                  <div className="space-y-4">
                    {/* Generated images */}
                    {Array.isArray(displayImages) && displayImages.length > 0 && (
                      <div className="space-y-4">
                        {displayImages.map((img, idx) => (
                          <div key={idx} className="rounded-lg border border-slate-700/60 bg-slate-800/40 overflow-hidden">
                            {img?.file_url && (
                              <div className="relative bg-slate-900">
                                <img
                                  src={img.file_url}
                                  alt={displayData?.graphics?.suggested_alt_text ?? 'Generated image'}
                                  className="w-full h-auto max-h-72 object-contain"
                                />
                              </div>
                            )}
                            <div className="p-3 space-y-1">
                              {img?.name && <p className="text-xs text-slate-400">{img.name}</p>}
                              <a
                                href={img?.file_url ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                <FiDownload size={11} /> Download Image
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Graphics metadata */}
                    <InfoCard icon={FiImage} title="Image Description">
                      <p className="text-sm text-slate-300">{displayData?.graphics?.image_description ?? 'No description available'}</p>
                    </InfoCard>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</h4>
                        <p className="text-sm text-slate-300">{displayData?.graphics?.image_type ?? 'N/A'}</p>
                      </div>
                      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Dimensions</h4>
                        <p className="text-sm text-slate-300">{displayData?.graphics?.dimensions ?? 'N/A'}</p>
                      </div>
                    </div>

                    <InfoCard icon={FiEdit} title="Design Notes">
                      {renderMarkdown(displayData?.graphics?.design_notes ?? '')}
                    </InfoCard>

                    <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Alt Text</h4>
                        <button
                          onClick={() => handleCopy(displayData?.graphics?.suggested_alt_text ?? '', 'alt')}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          {copiedField === 'alt' ? <FiCheck size={10} /> : <FiCopy size={10} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 italic">{displayData?.graphics?.suggested_alt_text ?? 'N/A'}</p>
                    </div>

                    {/* No images placeholder */}
                    {(!Array.isArray(displayImages) || displayImages.length === 0) && (
                      <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                        <FiImage size={28} className="mx-auto text-slate-600 mb-2" />
                        <p className="text-sm text-slate-500">No generated images available</p>
                        <p className="text-xs text-slate-600 mt-1">The graphics agent may not have produced artifact files for this request</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Export actions */}
              <div className="px-5 py-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => handleCopy(displayData?.written_content?.content ?? '', 'content-bottom')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                >
                  {copiedField === 'content-bottom' ? <><FiCheck size={13} /> Copied</> : <><FiCopy size={13} /> Copy Content</>}
                </button>
                <button
                  onClick={downloadAll}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-all"
                >
                  <FiDownload size={13} /> Download All
                </button>
              </div>
            </>
          )}

          {/* Empty state when no results and not loading */}
          {!loading && !hasResults && (
            <div className="hidden lg:flex flex-col items-center justify-center flex-1 p-8 text-center w-[520px]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <FiZap size={24} className="text-indigo-500/50" />
              </div>
              <h3 className="text-base font-semibold text-slate-400 mb-1">Ready to Create</h3>
              <p className="text-xs text-slate-600 max-w-xs">Fill out the content brief on the left and click "Create Marketing Content" to generate your full marketing package.</p>
              <p className="text-[10px] text-slate-700 mt-3">Or toggle "Sample Data" to preview the output format</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
