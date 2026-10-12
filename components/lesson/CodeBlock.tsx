'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { PrismLight } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import arduino from 'react-syntax-highlighter/dist/esm/languages/prism/arduino';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { CODE_LANGUAGES } from '@/lib/code-languages';

PrismLight.registerLanguage('python', python);
PrismLight.registerLanguage('javascript', javascript);
PrismLight.registerLanguage('typescript', typescript);
PrismLight.registerLanguage('jsx', jsx);
PrismLight.registerLanguage('tsx', tsx);
PrismLight.registerLanguage('bash', bash);
PrismLight.registerLanguage('json', json);
PrismLight.registerLanguage('markup', markup);
PrismLight.registerLanguage('css', css);
PrismLight.registerLanguage('c', c);
PrismLight.registerLanguage('cpp', cpp);
PrismLight.registerLanguage('java', java);
PrismLight.registerLanguage('sql', sql);
PrismLight.registerLanguage('arduino', arduino);

const KNOWN = new Set(CODE_LANGUAGES.map((l) => l.value).filter((v) => v !== 'text'));

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={copy}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

const codeStyle = {
  margin: 0,
  padding: '1.25rem',
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export function CodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language?: string | null;
  title?: string | null;
}) {
  const lang = language && KNOWN.has(language) ? language : 'text';
  const label = CODE_LANGUAGES.find((l) => l.value === lang)?.label ?? 'Code';

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-card">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <Tag variant="neutral">Code</Tag>
          <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
          {title ? <span className="text-sm text-muted">{title}</span> : null}
        </div>
        <CopyButton text={code} />
      </div>
      <div className="overflow-x-auto bg-black/30">
        {lang === 'text' ? (
          <pre style={codeStyle} className="text-white/85">
            {code}
          </pre>
        ) : (
          <PrismLight
            language={lang}
            style={oneDark}
            customStyle={{ background: 'transparent', margin: 0, padding: '1.25rem', fontSize: '0.8125rem', lineHeight: 1.7 }}
            codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } }}
            showLineNumbers={false}
          >
            {code}
          </PrismLight>
        )}
      </div>
    </section>
  );
}
