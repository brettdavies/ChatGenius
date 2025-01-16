import { formatText } from '../../utils/text-formatter';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  const segments = formatText(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.isCode) {
          return (
            <code
              key={index}
              className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-pink-500 dark:bg-gray-800"
            >
              {segment.text}
            </code>
          );
        }

        if (segment.isLink) {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {segment.text}
            </a>
          );
        }

        let className = '';
        if (segment.isBold) className += 'font-bold ';
        if (segment.isItalic) className += 'italic ';
        if (segment.isStrikethrough) className += 'line-through ';

        return (
          <span key={index} className={className.trim()}>
            {segment.text}
          </span>
        );
      })}
    </span>
  );
} 