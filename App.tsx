import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { CompareSlider } from './components/CompareSlider';
import { StyleSelector } from './components/StyleSelector';
import { ChatInterface } from './components/ChatInterface';
import { AppState, DesignStyle, ChatMessage } from './types';
import { generateRoomDesign, chatWithDesignConsultant } from './services/geminiService';
import { Sparkles, Layout, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    originalImage: null,
    generatedImage: null,
    history: [],
    isLoading: false,
    error: null,
    selectedStyle: null,
  });

  const handleImageUpload = useCallback((base64: string) => {
    setState(prev => ({ 
      ...prev, 
      originalImage: base64, 
      generatedImage: null, // Reset generated on new upload
      history: [] // Reset chat
    }));
  }, []);

  const handleStyleSelect = useCallback(async (style: DesignStyle) => {
    if (!state.originalImage || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, selectedStyle: style, error: null }));

    try {
      const prompt = `Redesign this room interior in a ${style} style. Keep the structural layout but change furniture, colors, and textures to match the aesthetic. Photorealistic, high quality.`;
      const generatedBase64 = await generateRoomDesign(state.originalImage, prompt);
      
      setState(prev => ({ 
        ...prev, 
        generatedImage: generatedBase64,
        isLoading: false,
        history: [
          ...prev.history, 
          {
             id: Date.now().toString(),
             role: 'model',
             text: `I've redesigned your room in a **${style}** style! How do you like it? You can ask me to refine specific details or find similar products.`,
             timestamp: Date.now()
          }
        ]
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to generate design. Please try again." 
      }));
    }
  }, [state.originalImage, state.isLoading]);

  const handleSendMessage = useCallback(async (text: string, isVisualUpdate: boolean) => {
    if (state.isLoading) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      isVisualUpdate
    };

    setState(prev => ({
      ...prev,
      history: [...prev.history, newMessage],
      isLoading: true,
      error: null
    }));

    try {
      if (isVisualUpdate) {
        // Visual Edit Flow
        const sourceImage = state.generatedImage || state.originalImage;
        if (!sourceImage) throw new Error("No image to edit");

        // Use prompt directly for edit
        const prompt = `Modify this room image: ${text}. Maintain photorealism.`;
        const newImage = await generateRoomDesign(sourceImage, prompt);

        setState(prev => ({
          ...prev,
          generatedImage: newImage,
          isLoading: false,
          history: [
            ...prev.history,
            {
              id: (Date.now() + 1).toString(),
              role: 'model',
              text: `I've updated the design based on your request: "${text}".`,
              timestamp: Date.now()
            }
          ]
        }));
      } else {
        // Chat Q&A Flow
        const contextImage = state.generatedImage || state.originalImage;
        const responseText = await chatWithDesignConsultant(state.history, contextImage, text);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          history: [
            ...prev.history,
            {
              id: (Date.now() + 1).toString(),
              role: 'model',
              text: responseText,
              timestamp: Date.now()
            }
          ]
        }));
      }
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Something went wrong. Please try again."
      }));
    }
  }, [state.generatedImage, state.originalImage, state.history, state.isLoading]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 text-indigo-700">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
             <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Lumina Design AI</h1>
        </div>
        <div className="hidden md:flex items-center text-sm text-slate-500 gap-4">
            <span className="flex items-center gap-1"><Sparkles size={14} className="text-yellow-500"/> Gemini Powered</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: Visualization */}
        <div className="flex-1 flex flex-col h-full relative bg-slate-100/50">
          {/* Main Canvas Area */}
          <div className="flex-1 p-4 md:p-6 flex items-center justify-center overflow-hidden relative">
            {state.error && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">{state.error}</span>
              </div>
            )}

            {!state.originalImage ? (
              <div className="w-full max-w-xl aspect-video">
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>
            ) : (
              <div className="relative w-full h-full max-w-5xl flex flex-col">
                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl bg-slate-800 ring-1 ring-black/5">
                    {!state.generatedImage ? (
                        <img 
                          src={state.originalImage} 
                          alt="Original" 
                          className="w-full h-full object-contain bg-slate-900" 
                        />
                    ) : (
                        <CompareSlider 
                            originalImage={state.originalImage}
                            generatedImage={state.generatedImage}
                        />
                    )}
                    
                    {/* Loading Overlay */}
                    {state.isLoading && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
                         <div className="flex flex-col items-center text-white space-y-3">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-medium text-sm tracking-wide animate-pulse">Generating Design...</p>
                         </div>
                      </div>
                    )}
                </div>
                
                {/* Style Selector (Bottom of Viz) */}
                <div className="mt-4 md:mt-6 flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Select Style</p>
                    <StyleSelector 
                        selectedStyle={state.selectedStyle} 
                        onSelect={handleStyleSelect} 
                    />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat & Controls */}
        <div className="w-full md:w-[400px] lg:w-[450px] h-[40vh] md:h-full border-t md:border-t-0 md:border-l border-slate-200 bg-white flex-shrink-0 flex flex-col z-10 shadow-xl">
           <ChatInterface 
              messages={state.history} 
              onSendMessage={handleSendMessage}
              isLoading={state.isLoading}
           />
        </div>
      </main>
    </div>
  );
};

export default App;
