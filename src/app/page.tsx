"use client";

import { useState, useEffect } from "react";
import { CldImage, CldUploadWidget, getCldImageUrl } from "next-cloudinary";
import Image from "next/image";
import { getRecentAssets } from "./actions";
import { Sparkles, LayoutTemplate, History, UploadCloud, RefreshCw, Wand2, Image as ImageIcon, Search, ChevronRight, Check, Download, Moon, Sun } from "lucide-react";

interface Variant {
  id: string;
  prompt: string;
  format: string;
}

export default function Home() {
  const [imageId, setImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [activePrompt, setActivePrompt] = useState<string>("");
  const [format, setFormat] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [campaignMode, setCampaignMode] = useState<boolean>(false);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    loadAssets();
    const saved = sessionStorage.getItem("ai_studio_session");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.imageId) setImageId(data.imageId);
        if (data.prompt) setPrompt(data.prompt);
        if (data.activePrompt) setActivePrompt(data.activePrompt);
        if (data.format) setFormat(data.format);
        if (data.variants) setVariants(data.variants);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (imageId) {
      sessionStorage.setItem("ai_studio_session", JSON.stringify({
        imageId, prompt, activePrompt, format, variants
      }));
    } else {
      sessionStorage.removeItem("ai_studio_session");
    }
  }, [imageId, prompt, activePrompt, format, variants]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (imageId) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [imageId]);

  useEffect(() => {
    if (activePrompt || format || imageId) {
      setIsImageLoading(true);
    }
    if (activePrompt && imageId) {
      const id = `${activePrompt}-${format}`;
      setVariants(prev => {
        if (prev.find(v => v.id === id)) return prev;
        return [{ id, prompt: activePrompt, format }, ...prev];
      });
    }
  }, [activePrompt, format, imageId]);

  const loadAssets = async () => {
    const assets = await getRecentAssets();
    setRecentAssets(assets);
  };

  const handleDownload = (specificFormat?: string) => {
    if (!imageId) return;
    const downloadFormat = specificFormat || format;
    const url = getCldImageUrl({
      width: downloadFormat === "16:9" ? 1200 : downloadFormat === "9:16" ? 600 : 800,
      height: downloadFormat === "16:9" ? 675 : downloadFormat === "9:16" ? 1067 : 800,
      src: imageId,
      crop: "pad",
      fillBackground: true,
      replaceBackground: activePrompt || undefined,
      rawTransformations: ["fl_attachment:generated_asset"]
    });
    window.open(url, '_blank');
  };

  const [aiModel, setAiModel] = useState<"standard" | "high_def" | "creative">("standard");

  const presetPrompts = [
    { label: "Modern Office", prompt: "on a clean modern office desk with a blurred glowing monitor in the background and professional studio lighting" },
    { label: "Marble Kitchen", prompt: "on a pristine white marble kitchen counter with bright natural morning sunlight streaming through a window and soft elegant shadows" },
    { label: "Cozy Living Room", prompt: "resting on a rustic wooden coffee table in a cozy living room with warm ambient lighting and blurred fireplace in the background" },
    { label: "Minimalist Studio", prompt: "centered on a seamless white studio backdrop with dramatic softbox lighting for ultra-realistic commercial product photography" },
    { label: "Nature Outdoor", prompt: "sitting on a mossy rock in a lush green forest with dappled sunlight filtering through trees for cinematic nature photography" },
    { label: "Cyberpunk Neon", prompt: "on a wet metallic surface reflecting vibrant neon pink and blue city lights in a dark moody cyberpunk aesthetic with cinematic glow" }
  ];

  const applyGeneration = () => {
    let finalPrompt = prompt.replace(/,/g, ' and');
    if (aiModel === "high_def") finalPrompt += " in ultra 8k high definition, photorealistic, Unreal Engine 5 render";
    if (aiModel === "creative") finalPrompt += " in a highly stylized, artistic, vivid color grading, creative photography style";
    setActivePrompt(finalPrompt);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen font-sans transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="hover:opacity-80 transition-opacity cursor-pointer">
              <Image src="/logo.png" alt="Innov8 Studio Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-[22px] font-normal text-zinc-500 dark:text-zinc-400 tracking-tight">
              Innov8 <span className="font-medium text-zinc-900 dark:text-zinc-50">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="flex items-center justify-center w-10 h-10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={loadAssets} className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full text-sm font-medium transition-colors">
              <RefreshCw size={18} /> Sync Library
            </button>
            <div className="h-9 w-9 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-medium text-sm ml-2 cursor-pointer shadow-sm hover:opacity-90 transition-opacity">
              T8
            </div>
          </div>
        </nav>

        <main className="max-w-[1500px] mx-auto p-4 md:p-6 space-y-8">
          {!imageId ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="space-y-4 max-w-3xl mb-12">
                <h1 className="text-[44px] font-normal tracking-tight leading-[1.2]">
                  Create professional product photos. <br/>
                  <span className="text-blue-600 dark:text-blue-500">Powered by AI.</span>
                </h1>
                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light">
                  Upload a raw image and instantly generate multi-platform marketing assets.
                </p>
              </div>
              
              <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-12 shadow-md flex flex-col items-center gap-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UploadCloud size={44} strokeWidth={1.5} />
                </div>
                <CldUploadWidget
                  uploadPreset="ml_default"
                  options={{ tags: ['ai-product-studio'] }}
                  onSuccess={(result: any) => {
                    if (result.info?.public_id) {
                      setImageId(result.info.public_id);
                      loadAssets();
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-sm flex items-center gap-2 text-[15px]"
                    >
                      Select an image
                    </button>
                  )}
                </CldUploadWidget>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Supports high-resolution JPG, PNG, and WEBP</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[700px]">
              
              {/* Left Sidebar: Controls */}
              <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto no-scrollbar pr-1">
                
                <div className="bg-white dark:bg-zinc-900 rounded-[16px] p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-5 text-zinc-900 dark:text-zinc-50">
                    <Wand2 size={20} className="text-blue-600 dark:text-blue-500" />
                    <h3 className="font-medium text-base">Generate Scene</h3>
                  </div>
                  <div className="space-y-1.5">
                    {presetPrompts.map((p) => (
                      <button
                        key={p.label}
                        disabled={isImageLoading}
                        onClick={() => {
                          setPrompt(p.prompt);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-full text-[14px] font-medium transition-all duration-300 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed border border-transparent ${
                          prompt === p.prompt 
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50" 
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {p.label}
                        {prompt === p.prompt && <Check size={16} className="text-blue-600 dark:text-blue-500" />}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800">
                    <label className="block text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      Custom Description
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isImageLoading}
                        placeholder="e.g. resting on a sandy beach at sunset..."
                        rows={3}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-[8px] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 p-3 text-[14px] resize-none outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed no-scrollbar"
                      />
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Model Choice</label>
                        <select 
                          value={aiModel} 
                          onChange={(e) => setAiModel(e.target.value as any)}
                          disabled={isImageLoading}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-2 text-[13px] outline-none focus:border-blue-600 disabled:opacity-50"
                        >
                          <option value="standard">Standard Diffusion</option>
                          <option value="high_def">Photorealistic (8K)</option>
                          <option value="creative">Creative / Stylized</option>
                        </select>
                      </div>

                      <button
                        onClick={applyGeneration}
                        disabled={isImageLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2.5 rounded-full font-medium text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-[16px] p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-50">
                      <LayoutTemplate size={20} className="text-blue-600 dark:text-blue-500" />
                      <h3 className="font-medium text-base">Format & Fill</h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    {[
                      { id: "1:1", label: "Square" },
                      { id: "16:9", label: "Landscape" },
                      { id: "9:16", label: "Portrait" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        disabled={isImageLoading || campaignMode}
                        onClick={() => setFormat(f.id as any)}
                        className={`flex-1 py-2 rounded-full text-[13px] font-medium transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed ${
                          format === f.id && !campaignMode
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                     <div>
                       <p className="text-[14px] font-medium text-zinc-900 dark:text-zinc-50">Pro Campaign Mode</p>
                       <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Generate all formats at once</p>
                     </div>
                     <button 
                       onClick={() => setCampaignMode(!campaignMode)}
                       className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${campaignMode ? 'bg-blue-600 dark:bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                     >
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${campaignMode ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                  </div>
                </div>

                <button
                  disabled={isImageLoading}
                  onClick={() => {
                    setImageId(null);
                    setPrompt("");
                    setActivePrompt("");
                    setFormat("1:1");
                  }}
                  className="mt-2 w-full py-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-full transition-colors text-[14px] font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} /> Start Over
                </button>
              </div>

              {/* Middle: Canvas Preview */}
              <div className="lg:col-span-6 bg-zinc-100 dark:bg-zinc-950 rounded-[24px] relative overflow-hidden flex flex-col items-center justify-center p-6 border border-zinc-200 dark:border-zinc-800 group">
                
                {/* Floating Toolbar */}
                {activePrompt && !campaignMode && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleDownload()}
                      disabled={isImageLoading}
                      className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-500 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download Generated Asset"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                )}

                {campaignMode && activePrompt ? (
                  <div className="w-full h-full overflow-y-auto no-scrollbar pb-12 relative">
                     {isImageLoading && (
                       <div className="sticky top-0 z-10 w-full bg-zinc-100/90 dark:bg-zinc-950/90 backdrop-blur-md py-4 flex flex-col items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
                         <svg className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500 mb-2" viewBox="25 25 50 50">
                           <circle className="stroke-current" cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="1, 200" strokeDashoffset="0" style={{animation: 'dash 1.5s ease-in-out infinite'}}/>
                         </svg>
                         <div className="text-zinc-900 dark:text-zinc-50 font-medium text-[13px]">
                           Generating Full Campaign...
                         </div>
                       </div>
                     )}
                     <h2 className="text-zinc-900 dark:text-zinc-50 text-xl font-medium my-6 text-center">Full Campaign Assets</h2>
                     <div className="flex flex-col gap-8 items-center">
                       {/* Square */}
                       <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                         <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                           <span>Instagram Post (1:1)</span>
                           <button onClick={() => handleDownload("1:1")} className="text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-colors" title="Download 1:1">
                             <Download size={16} />
                           </button>
                         </div>
                         <CldImage width={800} height={800} src={imageId} crop="pad" aspectRatio="1:1" fillBackground replaceBackground={activePrompt} alt="1:1" className="w-full h-auto object-cover" onLoad={() => setIsImageLoading(false)} />
                       </div>
                       {/* Landscape */}
                       <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                         <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                           <span>Website Hero (16:9)</span>
                           <button onClick={() => handleDownload("16:9")} className="text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-colors" title="Download 16:9">
                             <Download size={16} />
                           </button>
                         </div>
                         <CldImage width={1200} height={675} src={imageId} crop="pad" aspectRatio="16:9" fillBackground replaceBackground={activePrompt} alt="16:9" className="w-full h-auto object-cover" />
                       </div>
                       {/* Portrait */}
                       <div className="w-full max-w-[300px] bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                         <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                           <span>TikTok / Reels (9:16)</span>
                           <button onClick={() => handleDownload("9:16")} className="text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-colors" title="Download 9:16">
                             <Download size={16} />
                           </button>
                         </div>
                         <CldImage width={600} height={1067} src={imageId} crop="pad" aspectRatio="9:16" fillBackground replaceBackground={activePrompt} alt="9:16" className="w-full h-auto object-cover" />
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    format === "16:9" ? "w-full max-w-2xl aspect-[16/9]" : 
                    format === "9:16" ? "h-full max-h-[600px] aspect-[9/16]" : 
                    "w-full max-w-md aspect-square"
                  } rounded-[12px] overflow-hidden bg-white dark:bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-none flex items-center justify-center border border-zinc-200 dark:border-zinc-800`}>
                    
                    {isImageLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                        <svg className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-500 mb-4" viewBox="25 25 50 50">
                          <circle className="stroke-current" cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="1, 200" strokeDashoffset="0" style={{animation: 'dash 1.5s ease-in-out infinite'}}/>
                        </svg>
                        <div className="text-zinc-900 dark:text-zinc-50 font-medium text-[14px]">
                          {activePrompt ? "Generating with AI..." : "Applying changes..."}
                        </div>
                      </div>
                    )}

                    {activePrompt ? (
                      <CldImage
                        width={format === "16:9" ? 1200 : format === "9:16" ? 600 : 800}
                        height={format === "16:9" ? 675 : format === "9:16" ? 1067 : 800}
                        src={imageId}
                        sizes="100vw"
                        alt="AI Generated Campaign Asset"
                        crop="pad"
                        aspectRatio={format}
                        fillBackground
                        replaceBackground={activePrompt}
                        onLoad={() => setIsImageLoading(false)}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <CldImage
                        width={800}
                        height={800}
                        src={imageId}
                        sizes="100vw"
                        alt="Original Product"
                        crop="fit"
                        onLoad={() => setIsImageLoading(false)}
                        className="object-contain w-full h-full p-8"
                      />
                    )}
                  </div>
                )}

                {!activePrompt && (
                  <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                     <div className="inline-block bg-zinc-900/80 dark:bg-zinc-50/90 backdrop-blur-md text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-full text-[13px] tracking-wide shadow-md">
                        Select a prompt to generate background
                     </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: History */}
              <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-[16px] border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <History size={20} className="text-zinc-500 dark:text-zinc-400" />
                    <h3 className="font-medium text-base">Session History</h3>
                  </div>
                  <span className="text-[12px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">{variants.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                  {variants.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <ImageIcon size={32} className="text-zinc-200 dark:text-zinc-800 mb-3" />
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Generations will appear here.</p>
                    </div>
                  ) : (
                    variants.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => {
                          setActivePrompt(v.prompt);
                          setPrompt(v.prompt);
                          setFormat(v.format as any);
                        }}
                        className={`cursor-pointer rounded-[12px] overflow-hidden border transition-all duration-200 group ${
                          activePrompt === v.prompt && format === v.format 
                            ? "border-blue-500 dark:border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)]" 
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-950">
                          <CldImage 
                            src={imageId}
                            width={300}
                            height={169}
                            crop="pad"
                            aspectRatio="16:9"
                            fillBackground
                            replaceBackground={v.prompt}
                            alt="variant"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                          />
                        </div>
                        <div className="p-3 bg-white dark:bg-zinc-900">
                          <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mb-1 inline-block">{v.format}</span>
                          <p className="text-[13px] text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2 mt-1">{v.prompt}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gallery Section */}
          <section id="library" className="pt-12 pb-24">
            <div className="flex items-center gap-3 mb-6">
              <Search size={24} className="text-blue-600 dark:text-blue-500" />
              <h2 className="text-[22px] font-normal text-zinc-900 dark:text-zinc-50">Team Asset Library</h2>
            </div>
            
            {recentAssets.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <p className="font-medium text-[15px]">No assets found</p>
                <p className="text-[13px] mt-1">Upload images to build your library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recentAssets.map((asset) => (
                  <div 
                    key={asset.public_id} 
                    onClick={() => {
                      setImageId(asset.public_id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`group relative aspect-square rounded-[16px] overflow-hidden bg-zinc-100 dark:bg-zinc-950 cursor-pointer transition-all duration-300 ${
                      imageId === asset.public_id 
                        ? "shadow-[0_0_0_3px_rgba(59,130,246,1)]" 
                        : "border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <CldImage
                      width={400}
                      height={400}
                      src={asset.public_id}
                      sizes="20vw"
                      alt="Gallery asset"
                      crop="fill"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    />
                    {imageId === asset.public_id && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dash {
            0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
            50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
            100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
          }
        `}} />
      </div>
    </div>
  );
}
