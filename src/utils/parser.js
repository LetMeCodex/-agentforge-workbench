/**
 * AgentForge Dataset Parser & Normalizer
 * Handles JSON, JSONL, CSV, and Table-like TXT copy-pasted formats.
 */

// Helper to normalize array or string fields to string
function normalizeField(field) {
  if (Array.isArray(field)) {
    return field.map(item => String(item).trim()).join('\n\n');
  }
  if (field === null || field === undefined) {
    return '';
  }
  return String(field).trim();
}

// Helper to clean expected_winner values
function cleanExpectedWinner(val) {
  if (!val) return null;
  const cleanVal = String(val).trim().toUpperCase();
  if (cleanVal === 'A' || cleanVal === 'RESPONSE_A' || cleanVal === 'RESPONSE A') return 'A';
  if (cleanVal === 'B' || cleanVal === 'RESPONSE_B' || cleanVal === 'RESPONSE B') return 'B';
  if (cleanVal === 'TIE' || cleanVal === 'T' || cleanVal === 'DRAW') return 'tie';
  return null;
}

// Auto-detect format from text content
export function detectFormat(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return 'json';
  }
  
  // Check if it's JSONL
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0 && lines[0].trim().startsWith('{') && lines[0].trim().endsWith('}')) {
    try {
      JSON.parse(lines[0]);
      return 'jsonl';
    } catch (e) {
      // Not JSONL
    }
  }

  // Check if it's CSV
  if (trimmed.includes(',') && (trimmed.toLowerCase().includes('prompt') || trimmed.toLowerCase().includes('response'))) {
    return 'csv';
  }

  // Fallback to table-like text
  return 'txt';
}

/**
 * Parses raw text dataset into normalized EvaluationItem schema.
 * @returns { items: Array, errors: Array }
 */
export function parseDataset(text, format = 'auto') {
  if (!text || !text.trim()) {
    return { items: [], errors: [{ row: 0, reason: 'Empty dataset content' }] };
  }

  let selectedFormat = format;
  if (format === 'auto') {
    selectedFormat = detectFormat(text);
  }

  const items = [];
  const errors = [];

  if (selectedFormat === 'json') {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        errors.push({ row: 1, reason: 'JSON content is not an array of objects' });
        return { items: [], errors };
      }

      parsed.forEach((item, index) => {
        const id = item.id !== undefined && item.id !== null ? String(item.id) : `row-${index + 1}`;
        const prompt = normalizeField(item.prompt);
        const responseA = normalizeField(item.response_a || item.responseA);
        const responseB = normalizeField(item.response_b || item.responseB);
        const expectedWinner = cleanExpectedWinner(item.expected_winner || item.expectedWinner);

        if (!prompt) {
          errors.push({ row: index + 1, reason: `Row ID ${id}: Missing prompt content` });
          return;
        }
        if (!responseA && !responseB) {
          errors.push({ row: index + 1, reason: `Row ID ${id}: Missing both candidate responses` });
          return;
        }

        items.push({
          id,
          prompt,
          response_a: responseA,
          response_b: responseB,
          expected_winner: expectedWinner,
          domain: item.domain || 'general',
          difficulty: item.difficulty || 'medium'
        });
      });
    } catch (err) {
      errors.push({ row: 1, reason: `Failed to parse JSON: ${err.message}` });
    }
  } else if (selectedFormat === 'jsonl') {
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // skip empty lines

      try {
        const item = JSON.parse(trimmedLine);
        const id = item.id !== undefined && item.id !== null ? String(item.id) : `row-${index + 1}`;
        const prompt = normalizeField(item.prompt);
        const responseA = normalizeField(item.response_a || item.responseA);
        const responseB = normalizeField(item.response_b || item.responseB);
        const expectedWinner = cleanExpectedWinner(item.expected_winner || item.expectedWinner);

        if (!prompt) {
          errors.push({ row: index + 1, reason: `Line ${index + 1}: Missing prompt content` });
          return;
        }
        if (!responseA && !responseB) {
          errors.push({ row: index + 1, reason: `Line ${index + 1}: Missing candidate responses` });
          return;
        }

        items.push({
          id,
          prompt,
          response_a: responseA,
          response_b: responseB,
          expected_winner: expectedWinner,
          domain: item.domain || 'general',
          difficulty: item.difficulty || 'medium'
        });
      } catch (err) {
        errors.push({ row: index + 1, reason: `Failed to parse JSONL line: ${err.message}` });
      }
    });
  } else if (selectedFormat === 'csv') {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        errors.push({ row: 1, reason: 'Empty CSV contents' });
        return { items: [], errors };
      }

      // Very basic CSV parser
      const parseCSVLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"_\s]/g, ''));
      
      const idIdx = headers.findIndex(h => h === 'id');
      const promptIdx = headers.findIndex(h => h === 'prompt' || h === 'query');
      const respAIdx = headers.findIndex(h => h === 'responsea' || h === 'candidatea');
      const respBIdx = headers.findIndex(h => h === 'responseb' || h === 'candidateb');
      const winnerIdx = headers.findIndex(h => h === 'expectedwinner' || h === 'winner' || h === 'preferredresponse');
      const domainIdx = headers.findIndex(h => h === 'domain');
      const diffIdx = headers.findIndex(h => h === 'difficulty');

      if (promptIdx === -1) {
        errors.push({ row: 1, reason: 'CSV must contain a "prompt" or "query" column header' });
        return { items: [], errors };
      }

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < Math.max(promptIdx, respAIdx, respBIdx)) {
          errors.push({ row: i + 1, reason: `Row has mismatched column count: ${lines[i]}` });
          continue;
        }

        const id = idIdx !== -1 && cols[idIdx] ? cols[idIdx] : `row-${i}`;
        const prompt = cols[promptIdx] || '';
        const responseA = respAIdx !== -1 ? cols[respAIdx] : '';
        const responseB = respBIdx !== -1 ? cols[respBIdx] : '';
        const expectedWinner = winnerIdx !== -1 ? cleanExpectedWinner(cols[winnerIdx]) : null;

        if (!prompt) {
          errors.push({ row: i + 1, reason: `Row ID ${id}: Missing prompt content` });
          continue;
        }

        items.push({
          id,
          prompt,
          response_a: responseA,
          response_b: responseB,
          expected_winner: expectedWinner,
          domain: domainIdx !== -1 ? cols[domainIdx] : 'general',
          difficulty: diffIdx !== -1 ? cols[diffIdx] : 'medium'
        });
      }
    } catch (err) {
      errors.push({ row: 1, reason: `CSV parsing error: ${err.message}` });
    }
  } else if (selectedFormat === 'txt') {
    // Parser for table-like txt format (e.g. test.txt)
    // It has: id, prompt, response_a, response_b
    // And brackets like ["text"] or nested brackets. Let's do a regex matching.
    try {
      const lines = text.split('\n');
      let currentItem = null;
      let textBuffer = '';
      
      // We can search for brackets ["..."] and numbers.
      // Let's parse test.txt by searching for ID matches: standard numbers at the beginning of columns, 
      // or parsing sections.
      // Since test.txt contains rows:
      // standard header: id     prompt           response_a                    response_b
      // Then row 1: 136060 with prompt ["..."] response_a ["..."] response_b ["..."]
      // Let's implement a parser that extracts segments based on ["..."] markers.
      
      const textClean = text.replace(/\r/g, '');
      
      // Let's use a regex to extract matching patterns:
      // Pattern: id, prompt, response_a, response_b
      // Since id is a number (e.g. 136060, 211333, 1233961)
      // We can split the file by locating the IDs.
      // IDs are 6-7 digit numbers.
      // Let's find all numbers that represent IDs in the text:
      const idMatches = [];
      const idRegex = /(?:^|\n)\s*(\d{5,7})\b/g;
      let match;
      while ((match = idRegex.exec(textClean)) !== null) {
        idMatches.push({
          id: match[1],
          index: match.index + match[0].indexOf(match[1])
        });
      }
      
      if (idMatches.length === 0) {
        // Fallback: split by lines, look for columns
        errors.push({ row: 1, reason: 'Could not find standard table ID markers. Using raw line parsing.' });
        
        // Let's just create a single item from the text if it doesn't look like a table
        items.push({
          id: 'manual-txt-import',
          prompt: textClean.substring(0, 1000),
          response_a: 'Text file imported. Set up prompt manually.',
          response_b: '',
          expected_winner: null,
          domain: 'general',
          difficulty: 'medium'
        });
        return { items, errors };
      }

      for (let i = 0; i < idMatches.length; i++) {
        const curId = idMatches[i].id;
        const startIdx = idMatches[i].index + curId.length;
        const endIdx = i + 1 < idMatches.length ? idMatches[i + 1].index : textClean.length;
        const chunk = textClean.substring(startIdx, endIdx).trim();

        // Inside this chunk, we have a prompt, response_a, response_b
        // Let's find all occurrences of JSON arrays/brackets: `[" ... "]`
        const bracketRegex = /\[\s*"([\s\S]*?)"\s*\]/g;
        const blocks = [];
        let blockMatch;
        while ((blockMatch = bracketRegex.exec(chunk)) !== null) {
          // Unescape quotes and slashes
          let cleaned = blockMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\/g, '');
          blocks.push(cleaned);
        }

        if (blocks.length >= 3) {
          // Prompt can consist of multiple segments if they were listed, but let's map:
          // In test.txt: prompt has 1 string (or 2), response_a has 1 (or 2), response_b has 1 (or 2)
          // Let's map prompt = blocks[0], response_a = blocks[1], response_b = blocks[2]
          // Wait! For ID 1233961: prompt has two parts: "How to initialize..." and "I want to do full finetuning".
          // response_a has two parts: "When you want..." and "If you want..."
          // response_b has two parts: "To initialize..." and "If you want..."
          // Let's count blocks:
          // If we have 6 blocks: prompt = block 0 & 1, response_a = block 2 & 3, response_b = block 4 & 5
          let prompt = '';
          let responseA = '';
          let responseB = '';

          if (blocks.length === 3) {
            prompt = blocks[0];
            responseA = blocks[1];
            responseB = blocks[2];
          } else if (blocks.length === 6) {
            prompt = blocks[0] + '\n\n' + blocks[1];
            responseA = blocks[2] + '\n\n' + blocks[3];
            responseB = blocks[4] + '\n\n' + blocks[5];
          } else {
            // Distribute as best as we can: divide blocks into 3 segments
            const segmentSize = Math.floor(blocks.length / 3);
            prompt = blocks.slice(0, segmentSize).join('\n\n');
            responseA = blocks.slice(segmentSize, segmentSize * 2).join('\n\n');
            responseB = blocks.slice(segmentSize * 2).join('\n\n');
          }

          items.push({
            id: curId,
            prompt,
            response_a: responseA,
            response_b: responseB,
            expected_winner: null,
            domain: 'general',
            difficulty: 'medium'
          });
        } else {
          // If bracket parsing failed, try simple regex/split
          errors.push({ row: i + 1, reason: `Row ID ${curId}: Failed to parse bracket structure. Blocks found: ${blocks.length}` });
        }
      }
    } catch (err) {
      errors.push({ row: 1, reason: `TXT table parser error: ${err.message}` });
    }
  }

  return { items, errors };
}
