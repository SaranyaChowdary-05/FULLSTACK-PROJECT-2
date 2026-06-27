const fs = require('fs');
const filePath = process.argv[2] || 'Standalone_React_App.html';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
// Keep lines 1-107 (indices 0-106) and lines 641+ (index 640+)
// But we need to find the right cut points after previous partial removals
// Find the second </style> tag and remove everything between the first </style> and the line before the <script> tags
let firstStyleEnd = -1;
let secondStyleEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '</style>') {
    if (firstStyleEnd === -1) firstStyleEnd = i;
    else { secondStyleEnd = i; break; }
  }
}
console.log('First </style> at line', firstStyleEnd + 1);
console.log('Second </style> at line', secondStyleEnd + 1);
if (secondStyleEnd > firstStyleEnd) {
  const newLines = [...lines.slice(0, firstStyleEnd + 1), '', ...lines.slice(secondStyleEnd + 1)];
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log('Removed lines', firstStyleEnd + 2, 'to', secondStyleEnd + 1);
  console.log('Old line count:', lines.length, '-> New line count:', newLines.length);
} else {
  console.log('Could not find two </style> tags');
}
