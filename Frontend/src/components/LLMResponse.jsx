import React, { useRef, useEffect } from 'react';

const LLMResponse = ({ response}) => {
  const contentRef = useRef(null);
  const scrollRef = useRef(null);

  // Format response text with basic markdown support
  const formatResponse = (text) => {
    if (!text) return '';
    return text
      .replace(/\n\n/g, '</p><p class="mt-4">')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-gray-900">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="flex items-start mb-2 pl-2"><span class="text-emerald-500 mr-3 mt-1.5">•</span><span>$1</span></li>')
      .replace(/^\- (.*$)/gm, '<li class="flex items-start mb-2 pl-2"><span class="text-emerald-500 mr-3 mt-1.5">-</span><span>$1</span></li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="flex items-start mb-2 pl-2"><span class="text-emerald-500 font-medium mr-3">$&</span><span>$1</span></li>');
  };

  return (
    <div className="w-full container mx-auto mt-10">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mr-4 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Response</h2>
          <p className="text-gray-600">Generated response from LLM</p>
        </div>
      </div>

      {/* Response Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">


        {/* Content Area */}
        <div className="overflow-y-auto max-h-[500px]">
          {response ? (
            <div className="p-8">
              <div 
                ref={contentRef}
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="text-gray-700">${formatResponse(response)}</p>`
                }}
              />
     
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No response yet</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                The AI-generated response will appear here once available.
              </p>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
};

export default LLMResponse;