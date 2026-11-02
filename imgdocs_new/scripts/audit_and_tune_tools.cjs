const fs = require('fs');
const path = require('path');

console.log('Auditing toolsData.ts...');
const toolsFilePath = path.join(__dirname, '../src/data/toolsData.ts');
const toolsDataRaw = fs.readFileSync(toolsFilePath, 'utf8');

// Let's count words for each tool as rendered in ToolSEOContent / ssrRenderer
