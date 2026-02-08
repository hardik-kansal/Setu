'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { AIReasoningLog } from '@/lib/supabase';

interface AIReasoningTerminalProps {
  reasoning: AIReasoningLog | null;
  logs: string[];
}

function TypewriterText({ text, delay = 20 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(index + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [index, text, delay]);

  return <span>{displayedText}</span>;
}

export function AIReasoningTerminal({ reasoning, logs }: AIReasoningTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; message: string; type: string }>>([]);

  useEffect(() => {
    if (reasoning) {
      const thoughts = reasoning.reasoning_trace.thoughts;
      const newLogs = thoughts.map((thought, i) => ({
        timestamp: new Date(reasoning.analysis_timestamp).toLocaleTimeString(),
        message: thought,
        type: thought.includes('✅') ? 'success' : thought.includes('⚠️') ? 'warning' : 'info',
      }));
      setTerminalLogs(newLogs);
    }
  }, [reasoning]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <Card className="bg-black border-green-500">
      <CardHeader>
        <CardTitle className="text-green-400 font-mono flex items-center gap-2">
          <span className="animate-pulse">▶</span> AI Reasoning Terminal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={terminalRef}
          className="h-96 overflow-y-auto bg-black text-green-400 font-mono text-sm p-4 rounded space-y-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-800"
        >
          {terminalLogs.length === 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span className="animate-pulse">Waiting for AI analysis...</span>
            </div>
          ) : (
            terminalLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-2"
              >
                <span className="text-gray-500">[{log.timestamp}]</span>
                <span className={
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  'text-green-400'
                }>
                  {log.message}
                </span>
              </motion.div>
            ))
          )}
          
          {logs.map((log, i) => (
            <div key={`extra-${i}`} className="flex gap-2">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
