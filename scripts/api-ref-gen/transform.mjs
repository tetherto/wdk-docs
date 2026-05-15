import { readFileSync, writeFileSync } from 'fs'

/**
 * TypeDoc kind constants.
 * See https://typedoc.org/api/enums/Models.ReflectionKind.html
 */
const KIND = {
  ENUM: 8,
  CLASS: 128,
  CONSTRUCTOR: 512,
  FUNCTION: 64,
  METHOD: 2048,
  ACCESSOR: 262144,
  TYPE_ALIAS: 2097152,
  INTERFACE: 256
}

/** Maximum output size before we warn or error. */
const WARN_LINES = 3000
const MAX_LINES = 10000

function formatType (type, _seen) {
  if (!type) return 'unknown'
  // Guard against circular type references
  const seen = _seen || new Set()
  const typeId = type.id ?? (type.name + ':' + type.type)
  if (seen.has(typeId)) return type.name || 'unknown'
  seen.add(typeId)

  if (type.type === 'intrinsic') return type.name
  if (type.type === 'literal') return JSON.stringify(type.value)
  if (type.type === 'union') {
    return type.types.map(t => formatType(t, seen)).join(' | ')
  }
  if (type.type === 'reference') {
    let name = type.name
    if (type.typeArguments?.length) {
      name += `<${type.typeArguments.map(t => formatType(t, seen)).join(', ')}>`
    }
    return name
  }
  if (type.type === 'reflection') return 'object'
  if (type.type === 'array') return `${formatType(type.elementType, seen)}[]`
  if (type.type === 'tuple') {
    const els = type.elements?.map(t => formatType(t, seen)).join(', ') || ''
    return `[${els}]`
  }
  if (type.type === 'intersection') {
    return type.types.map(t => formatType(t, seen)).join(' & ')
  }
  return type.name || 'unknown'
}

/** Stable slug for heading anchors: lowercase, hyphen-separated. */
function slug (str) {
  return String(str)
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Sanitize text for use in a Markdown table cell: no newlines, no pipe, no curly braces. */
function tableCell (str) {
  return String(str ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '&#124;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Escape type string for MDX so < > & { } are not parsed as JSX/HTML/expressions. */
function mdxSafeType (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;')
}

function extractComment (comment) {
  if (!comment?.summary) return ''
  return comment.summary.map(s => s.text || '').join('')
}

function getThrows (comment) {
  if (!comment?.blockTags) return []
  return comment.blockTags
    .filter(t => t.tag === '@throws')
    .map(t => t.content.map(c => c.text).join(''))
}

function getExamples (comment) {
  if (!comment?.blockTags) return []
  return comment.blockTags
    .filter(t => t.tag === '@example')
    .map(t => t.content.map(c => c.text).join(''))
}

/**
 * Strip nested code fences that TypeDoc sometimes double-wraps inside
 * @example blocks. Returns clean code without the inner fence markers.
 */
function cleanExample (raw) {
  let text = raw.trim()
  const fenceRe = /^```\w*\n([\s\S]*?)```$/
  const match = text.match(fenceRe)
  if (match) text = match[1].trim()
  return text
}

function getReturnsDescription (comment) {
  if (!comment?.blockTags) return ''
  const ret = comment.blockTags.find(t => t.tag === '@returns')
  if (!ret) return ''
  return ret.content.map(c => c.text).join('')
}

function sourceLink (sources) {
  if (!sources?.length) return ''
  const s = sources[0]
  if (s.url) return `[source](${s.url})`
  return ''
}

/** Extract "filename#Lline" from TypeDoc source or GitHub URL. */
function sourceLabel (s) {
  if (s.fileName != null && s.line != null) return `${s.fileName}#L${s.line}`
  if (!s.url) return ''
  const hash = s.url.includes('#') ? '#' + s.url.slice(s.url.indexOf('#')) : ''
  const pathMatch = s.url.match(/\/blob\/[^/]+\/(.+?)(?:#|$)/)
  const path = pathMatch ? pathMatch[1] : s.url.replace(/^https?:\/\/[^/]+\//, '').replace(/#.*/, '')
  return path ? path + hash : s.url
}

/** Source as ##### Source heading + link (link text = filename and line only). */
function sourceBlock (sources) {
  if (!sources?.length) return ''
  const s = sources[0]
  if (!s.url) return ''
  const label = sourceLabel(s) || s.url
  return `##### Source\n\n[${label}](${s.url})\n\n`
}

function isClass (child) {
  return child.kind === KIND.CLASS ||
    (child.children?.some(c => c.kind === KIND.CONSTRUCTOR))
}

function isTypeAlias (child) {
  return child.kind === KIND.TYPE_ALIAS || child.kind === KIND.INTERFACE ||
    (child.children?.length > 0 && !isClass(child) && child.name !== 'default')
}

/** Escape special regex characters in a string. */
function escapeRegex (str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replace entity names (classes, types, methods, properties) in prose with doc links.
 * @param {string} text - Raw description text
 * @param {object} ctx - { classAnchors, typeAnchors, methodAnchors, propertyNamesByClass, currentClassSlug }
 */
function linkifyProse (text, ctx) {
  if (!text || !ctx) return text
  const { classAnchors, typeAnchors, methodAnchors, propertyNamesByClass, currentClassSlug } = ctx

  // Protect inline code spans from linkification
  const codeSpans = []
  let out = String(text).replace(/`[^`]+`/g, (match) => {
    const placeholder = `\u0001C${codeSpans.length}\u0001`
    codeSpans.push(match)
    return placeholder
  })

  out = out.replace(/{/g, '&#123;').replace(/}/g, '&#125;')
  const classNames = [...(classAnchors?.keys() || [])].sort((a, b) => b.length - a.length)
  for (const name of classNames) {
    const anchor = classAnchors.get(name)
    if (anchor) {
      out = out.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, 'g'), `[${name}](#${anchor})`)
    }
  }
  const typeNames = [...(typeAnchors?.keys() || [])].sort((a, b) => b.length - a.length)
  for (const name of typeNames) {
    const anchor = typeAnchors.get(name)
    if (anchor) {
      out = out.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, 'g'), `[${name}](#${anchor})`)
    }
  }
  if (currentClassSlug) {
    const methodMap = methodAnchors?.get(currentClassSlug)
    if (methodMap) {
      const methodNames = [...methodMap.keys()].sort((a, b) => b.length - a.length)
      for (const name of methodNames) {
        const anchor = methodMap.get(name)
        if (anchor) {
          out = out.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, 'g'), `[${name}](#${anchor})`)
        }
      }
    }
    // Property name linkification removed — names like "seed", "path", "index"
    // are too common as English words to safely auto-link in prose.
  }

  // Restore inline code spans
  for (let i = 0; i < codeSpans.length; i++) {
    out = out.replace(`\u0001C${i}\u0001`, codeSpans[i])
  }

  return out
}

/**
 * Format a type string with class/type names as links and the rest MDX-safe.
 * Returns HTML-escaped type with markdown links for known classes/types (no wrapping backticks).
 */
function linkifyType (typeStr, classAnchors, typeAnchors) {
  if (!typeStr) return ''
  const placeholders = []
  let out = String(typeStr)
  const allNames = [
    ...(classAnchors ? [...classAnchors.keys()] : []),
    ...(typeAnchors ? [...typeAnchors.keys()] : [])
  ].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b.length - a.length)
  for (const name of allNames) {
    const anchor = classAnchors?.get(name) ?? typeAnchors?.get(name)
    if (anchor) {
      const link = `[${name}](#${anchor})`
      const placeholder = `\u0000L${placeholders.length}\u0000`
      placeholders.push(link)
      out = out.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, 'g'), placeholder)
    }
  }
  out = mdxSafeType(out)
  for (let i = 0; i < placeholders.length; i++) {
    out = out.replace(`\u0000L${i}\u0000`, placeholders[i])
  }
  return out
}

/**
 * Transform TypeDoc JSON output into Fumadocs-compatible MDX.
 *
 * @param {object} options
 * @param {string} options.inputPath    - Path to TypeDoc JSON file
 * @param {string} options.outputPath   - Path to write the generated MDX
 * @param {object} options.moduleConfig - Module entry from modules.json
 * @returns {{ lines: number, classes: number, types: number }}
 */
export function transform ({ inputPath, outputPath, moduleConfig }) {
  const json = JSON.parse(readFileSync(inputPath, 'utf-8'))

  // Guard: zero exports
  if (!json.children?.length) {
    const stub = `---
title: ${moduleConfig.title}
description: ${moduleConfig.description}
docType: reference
schemaType: APIReference
icon: Code
---

{/* AUTO-GENERATED — DO NOT EDIT. Run scripts/api-ref-gen to regenerate. */}

# API Reference

No public API exports were found for this module.
`
    writeFileSync(outputPath, stub)
    console.warn(`  ⚠ No public exports found for ${moduleConfig.name}`)
    return { lines: stub.split('\n').length, classes: 0, types: 0, functions: 0, enums: 0 }
  }

  const defaultRename = moduleConfig.defaultExportRename || null

  function displayName (child) {
    if (child.name === 'default' && defaultRename) return defaultRename
    return child.name
  }

  const classes = json.children.filter(c => isClass(c) || c.name === 'default')
  const types = json.children.filter(c => isTypeAlias(c))
  const functions = json.children.filter(c => c.kind === KIND.FUNCTION)
  const enums = json.children.filter(c => c.kind === KIND.ENUM)

  const classAnchors = new Map()
  const methodAnchors = new Map()
  const propertyNamesByClass = new Map()
  for (const cls of classes) {
    const cname = displayName(cls)
    classAnchors.set(cname, slug(cname))
    const methods = cls.children?.filter(c => c.kind === KIND.METHOD) || []
    const methodMap = new Map()
    for (const m of methods) {
      const params = m.signatures?.[0]?.parameters || []
      const methodSlug = slug(`${m.name}(${params.map(p => p.name).join(', ')})`)
      methodMap.set(m.name, `${slug(cname)}-${methodSlug}`)
    }
    methodAnchors.set(slug(cname), methodMap)
    const accessors = cls.children?.filter(c => c.kind === KIND.ACCESSOR) || []
    if (accessors.length) propertyNamesByClass.set(slug(cname), new Set(accessors.map(a => a.name)))
  }
  const typeAnchors = new Map(types.map(t => [t.name, slug(t.name)]))

  let md = `---
title: ${moduleConfig.title}
description: ${moduleConfig.description}
docType: reference
schemaType: APIReference
icon: Code
---

{/* AUTO-GENERATED — DO NOT EDIT. Run scripts/api-ref-gen to regenerate. */}

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
`

  const tocLinkCtx = { classAnchors, typeAnchors, methodAnchors, propertyNamesByClass, currentClassSlug: null }
  for (const cls of classes) {
    const name = displayName(cls)
    const classSlug = slug(name)
    let fallbackDesc = `${name} class`
    if (cls.extendedTypes?.length) {
      const ext = cls.extendedTypes[0]
      const extName = ext.name === 'default' ? null : ext.name
      if (extName && ext.package) fallbackDesc = `Extends \`${extName}\` from \`${ext.package}\`.`
      else if (extName) fallbackDesc = `Extends \`${extName}\`.`
      else if (ext.package) fallbackDesc = `Extends \`${ext.package}\`.`
    }
    if (cls.implementedTypes?.length) {
      const impls = cls.implementedTypes.filter(i => i.name !== 'default')
      if (impls.length) {
        const impl = impls.map(i => `\`${i.name}\``).join(', ')
        fallbackDesc += ` Implements ${impl}.`
      }
    }
    const rawDesc = extractComment(cls.comment) || extractComment(cls.signatures?.[0]?.comment) || fallbackDesc
    const desc = tableCell(linkifyProse(rawDesc, tocLinkCtx))
    const ctor = cls.children?.find(c => c.kind === KIND.CONSTRUCTOR)
    const methods = cls.children?.filter(c => c.kind === KIND.METHOD) || []
    const accessors = cls.children?.filter(c => c.kind === KIND.ACCESSOR) || []
    const methodLinks = []
    if (ctor && !ctor.flags?.isPrivate && !ctor.flags?.isProtected) methodLinks.push(`[Constructor](#${classSlug}-constructor)`)
    if (methods.length) methodLinks.push(`[Methods](#${classSlug}-methods)`)
    if (accessors.length) methodLinks.push(`[Properties](#${classSlug}-properties)`)
    const methodsCell = methodLinks.length ? tableCell(methodLinks.join(', ')) : '-'
    md += `| [${name}](#${classSlug}) | ${desc} | ${methodsCell} |\n`
  }

  md += '\n'

  for (const cls of classes) {
    const name = displayName(cls)
    const classSlug = slug(name)
    const linkCtx = { classAnchors, typeAnchors, methodAnchors, propertyNamesByClass, currentClassSlug: classSlug }

    md += `---\n\n## ${name}\n\n<span id="${classSlug}"></span>\n\n`

    const classDesc = extractComment(cls.comment) || ''
    if (classDesc) md += `${linkifyProse(classDesc, linkCtx)}\n\n`

    if (cls.extendedTypes?.length) {
      const ext = cls.extendedTypes[0]
      const extName = ext.name === 'default' ? null : ext.name
      if (extName && ext.package) md += `Extends \`${extName}\` from \`${ext.package}\`\n\n`
      else if (extName) md += `Extends \`${extName}\`\n\n`
      else if (ext.package) md += `Extends \`${ext.package}\`\n\n`
    }
    if (cls.implementedTypes?.length) {
      const impls = cls.implementedTypes.filter(i => i.name !== 'default')
      if (impls.length) {
        const implInfo = impls.map(i => `\`${i.name}\``).join(', ')
        md += `Implements ${implInfo}\n\n`
      }
    }

    const ctor = cls.children?.find(c => c.kind === KIND.CONSTRUCTOR)
    if (ctor && !ctor.flags?.isPrivate && !ctor.flags?.isProtected) {
      const sig = ctor.signatures?.[0]
      const params = sig?.parameters || []
      const paramStr = params.map(p => {
        const opt = p.flags?.isOptional ? '?' : ''
        return `${p.name}${opt}`
      }).join(', ')

      md += '### Constructor\n\n'
      md += `<span id="${classSlug}-constructor"></span>\n\n`
      md += '```javascript\n'
      md += `new ${name}(${paramStr})\n`
      md += '```\n\n'

      if (params.length) {
        md += '##### Parameters\n\n'
        for (const p of params) {
          const opt = p.flags?.isOptional ? ', optional' : ''
          const desc = extractComment(p.comment)
          md += `- \`${p.name}\` (${linkifyType(formatType(p.type), classAnchors, typeAnchors)}${opt}): ${linkifyProse(desc, linkCtx)}\n`
        }
        md += '\n'
      }
      md += sourceBlock(ctor.sources)
    }

    const methods = cls.children?.filter(c => c.kind === KIND.METHOD) || []
    const accessors = cls.children?.filter(c => c.kind === KIND.ACCESSOR) || []

    if (methods.length) {
      md += `### Methods\n\n<span id="${classSlug}-methods"></span>\n\n`
      md += '| Method | Description | Returns | Throws |\n'
      md += '|--------|-------------|---------|--------|\n'

      for (const m of methods) {
        const sig = m.signatures?.[0]
        const desc = extractComment(sig?.comment)
        const retType = formatType(sig?.type)
        const throws = getThrows(sig?.comment)
        const throwsStr = throws.length ? 'Yes' : '-'
        const params = sig?.parameters || []
        const paramNames = params.map(p => p.name).join(', ')
        const isStatic = m.flags?.isStatic ? '(static) ' : ''
        md += `| \`${isStatic}${m.name}(${paramNames})\` | ${tableCell(linkifyProse(desc, linkCtx))} | ${tableCell(linkifyType(retType, classAnchors, typeAnchors))} | ${throwsStr} |\n`
      }
      md += '\n'

      for (const m of methods) {
        const signatures = m.signatures?.length ? m.signatures : [m.signatures?.[0]].filter(Boolean)
        const isStatic = m.flags?.isStatic ? ' (static)' : ''

        for (let si = 0; si < signatures.length; si++) {
          const sig = signatures[si]
          if (!sig) continue
          const desc = extractComment(sig.comment)
          const retType = formatType(sig.type)
          const retDesc = getReturnsDescription(sig.comment)
          const throws = getThrows(sig.comment)
          const examples = getExamples(sig.comment)
          const params = sig.parameters || []

          const overloadSuffix = signatures.length > 1 ? ` (overload ${si + 1})` : ''
          const methodSlug = slug(`${m.name}(${params.map(p => p.name).join(', ')})`)
          const anchorSlug = signatures.length > 1 ? `${methodSlug}-${si + 1}` : methodSlug

          md += `#### \`${m.name}(${params.map(p => p.name).join(', ')})\`${isStatic}${overloadSuffix}\n\n`
          md += `<span id="${classSlug}-${anchorSlug}"></span>\n\n`
          md += `${linkifyProse(desc, linkCtx)}\n\n`

          if (params.length) {
            md += '##### Parameters\n\n'
            for (const p of params) {
              const opt = p.flags?.isOptional ? ', optional' : ''
              const pdesc = extractComment(p.comment)
              md += `- \`${p.name}\` (${linkifyType(formatType(p.type), classAnchors, typeAnchors)}${opt}): ${linkifyProse(pdesc, linkCtx)}\n`
            }
            md += '\n'
          }

          md += `##### Returns\n\n${linkifyType(retType, classAnchors, typeAnchors)}${retDesc ? ` - ${linkifyProse(retDesc, linkCtx)}` : ''}\n\n`

          if (throws.length) {
            md += '#### Throws\n\n'
            for (const t of throws) {
              md += `${linkifyProse(t, linkCtx)}\n\n`
            }
          }

          if (examples.length) {
            md += '##### Example\n\n'
            for (const ex of examples) {
              md += '```javascript\n' + cleanExample(ex) + '\n```\n\n'
            }
          }
        }
        md += sourceBlock(m.sources)
      }
    }

    if (accessors.length) {
      md += `### Properties\n\n<span id="${classSlug}-properties"></span>\n\n`
      md += '| Property | Type | Description |\n'
      md += '|----------|------|-------------|\n'
      for (const a of accessors) {
        const sig = a.getSignature || a
        const desc = extractComment(sig?.comment)
        const retType = formatType(sig?.type)
        md += `| \`${a.name}\` | \`${mdxSafeType(retType)}\` | ${tableCell(linkifyProse(desc, linkCtx))} |\n`
      }
      md += '\n'
    }
  }

  // --- Functions section (top-level exported functions, kind 64) ---
  if (functions.length) {
    const fnLinkCtx = { classAnchors, typeAnchors, methodAnchors, propertyNamesByClass, currentClassSlug: null }
    md += '---\n\n## Functions\n\n'
    md += '| Function | Description | Returns |\n'
    md += '|----------|-------------|--------|\n'

    for (const fn of functions) {
      const sig = fn.signatures?.[0]
      const desc = extractComment(sig?.comment)
      const retType = formatType(sig?.type)
      const params = sig?.parameters || []
      const paramNames = params.map(p => p.name).join(', ')
      md += `| \`${fn.name}(${paramNames})\` | ${tableCell(linkifyProse(desc, fnLinkCtx))} | ${tableCell(linkifyType(retType, classAnchors, typeAnchors))} |\n`
    }
    md += '\n'

    for (const fn of functions) {
      const sig = fn.signatures?.[0]
      if (!sig) continue
      const desc = extractComment(sig.comment)
      const retType = formatType(sig.type)
      const retDesc = getReturnsDescription(sig.comment)
      const throws = getThrows(sig.comment)
      const examples = getExamples(sig.comment)
      const params = sig.parameters || []

      const fnSlug = slug(`${fn.name}(${params.map(p => p.name).join(', ')})`)
      md += `### \`${fn.name}(${params.map(p => p.name).join(', ')})\`\n\n`
      md += `<span id="${fnSlug}"></span>\n\n`
      md += `${linkifyProse(desc, fnLinkCtx)}\n\n`

      if (params.length) {
        md += '#### Parameters\n\n'
        for (const p of params) {
          const opt = p.flags?.isOptional ? ', optional' : ''
          const pdesc = extractComment(p.comment)
          md += `- \`${p.name}\` (${linkifyType(formatType(p.type), classAnchors, typeAnchors)}${opt}): ${linkifyProse(pdesc, fnLinkCtx)}\n`
        }
        md += '\n'
      }

      md += `#### Returns\n\n${linkifyType(retType, classAnchors, typeAnchors)}${retDesc ? ` - ${linkifyProse(retDesc, fnLinkCtx)}` : ''}\n\n`

      if (throws.length) {
        md += '#### Throws\n\n'
        for (const t of throws) {
          md += `${linkifyProse(t, fnLinkCtx)}\n\n`
        }
      }

      if (examples.length) {
        md += '#### Example\n\n'
        for (const ex of examples) {
          md += '```javascript\n' + cleanExample(ex) + '\n```\n\n'
        }
      }
      md += sourceBlock(fn.sources)
    }
  }

  // --- Types section ---
  if (types.length) {
    md += '---\n\n## Types\n\n'
    const typeLinkCtx = { classAnchors, typeAnchors, methodAnchors, propertyNamesByClass, currentClassSlug: null }
    for (const t of types) {
      // Skip empty type stubs: re-exported aliases with no documentable content
      const hasChildren = t.children?.length > 0
      const hasDeclarationChildren = t.type?.declaration?.children?.length > 0
      const hasDesc = !!extractComment(t.comment)
      if (!hasChildren && !hasDeclarationChildren && !hasDesc) continue

      const typeSlug = typeAnchors.get(t.name)
      md += `### ${t.name}\n\n`
      md += `<span id="${typeSlug}"></span>\n\n`

      const desc = extractComment(t.comment)
      if (desc) md += `${linkifyProse(desc, typeLinkCtx)}\n\n`

      if (t.children?.length) {
        md += '| Property | Type | Description |\n'
        md += '|----------|------|-------------|\n'
        for (const f of t.children) {
          const fType = formatType(f.type)
          const fDesc = extractComment(f.comment)
          const opt = f.flags?.isOptional ? '?' : ''
          md += `| \`${f.name}${opt}\` | \`${mdxSafeType(fType)}\` | ${tableCell(linkifyProse(fDesc, typeLinkCtx))} |\n`
        }
        md += '\n'
      }
      md += sourceBlock(t.sources)
    }
  }

  // --- Enums section (kind 8) ---
  if (enums.length) {
    md += '---\n\n## Enums\n\n'
    for (const e of enums) {
      const enumSlug = slug(e.name)
      md += `### ${e.name}\n\n`
      md += `<span id="${enumSlug}"></span>\n\n`

      const desc = extractComment(e.comment)
      if (desc) md += `${desc}\n\n`

      if (e.children?.length) {
        md += '| Member | Value | Description |\n'
        md += '|--------|-------|-------------|\n'
        for (const member of e.children) {
          const val = member.type?.value !== undefined ? JSON.stringify(member.type.value) : '-'
          const mDesc = extractComment(member.comment)
          md += `| \`${member.name}\` | ${val} | ${tableCell(mDesc)} |\n`
        }
        md += '\n'
      }
      md += sourceBlock(e.sources)
    }
  }

  // --- Size guard ---
  const lineCount = md.split('\n').length
  if (lineCount > MAX_LINES) {
    throw new Error(
      `Generated output for ${moduleConfig.name} is ${lineCount} lines (max: ${MAX_LINES}). ` +
      'This likely indicates a bug in the transformer or excessive re-exports.'
    )
  }
  if (lineCount > WARN_LINES) {
    console.warn(`  ⚠ Large output for ${moduleConfig.name}: ${lineCount} lines (threshold: ${WARN_LINES})`)
  }

  writeFileSync(outputPath, md)

  const stats = {
    lines: lineCount,
    classes: classes.length,
    types: types.length,
    functions: functions.length,
    enums: enums.length
  }

  return stats
}
