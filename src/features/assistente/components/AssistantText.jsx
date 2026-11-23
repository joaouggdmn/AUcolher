// O Gemini às vezes responde com marcações simples (**negrito**, listas com
// "- " ou "1."). Elas viram elementos do React aqui, sem innerHTML: o texto
// nunca é tratado como HTML

const BULLET = /^\s*[-*•]\s+/
const NUMBERED = /^\s*\d+[.)]\s+/

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-bold text-emerald-950">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}

// Agrupa as linhas em parágrafos e listas
function toBlocks(text) {
  const blocks = []
  for (const line of text.split('\n')) {
    const kind = BULLET.test(line) ? 'ul' : NUMBERED.test(line) ? 'ol' : line.trim() ? 'p' : 'gap'
    const last = blocks[blocks.length - 1]
    if (kind === 'gap') {
      if (last) last.closed = true
      continue
    }
    const content = kind === 'ul' ? line.replace(BULLET, '') : kind === 'ol' ? line.replace(NUMBERED, '') : line.trim()
    if (last && last.kind === kind && !last.closed && kind !== 'p') last.items.push(content)
    else if (last && last.kind === 'p' && kind === 'p' && !last.closed) last.items.push(content)
    else blocks.push({ kind, items: [content] })
  }
  return blocks
}

function AssistantText({ text }) {
  return (
    <div className="space-y-2">
      {toBlocks(text).map((block, i) => {
        if (block.kind === 'ul' || block.kind === 'ol') {
          const List = block.kind
          return (
            <List key={i} className={`space-y-1 pl-5 ${block.kind === 'ul' ? 'list-disc' : 'list-decimal'}`}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </List>
          )
        }
        return <p key={i}>{renderInline(block.items.join(' '))}</p>
      })}
    </div>
  )
}

export default AssistantText
