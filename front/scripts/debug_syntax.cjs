const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/teacher/TeacherDashboard.jsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const stack = []; // Stores objects { char: '(', line: 1 }

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let inString = false;
    let quoteChar = '';

    for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (inString) {
            if (char === quoteChar && line[j - 1] !== '\\') {
                inString = false;
            }
            continue;
        }

        if (char === '"' || char === "'" || char === '`') {
            inString = true;
            quoteChar = char;
            continue;
        }

        if (char === '(' || char === '{' || char === '[') {
            stack.push({ char, line: i + 1 });
        }

        if (char === ')' || char === '}' || char === ']') {
            if (stack.length === 0) {
                console.log(`IMBALANCE: Unexpected closing '${char}' at line ${i + 1}`);
                // process.exit(1);
                // Don't exit, just warn?
            } else {
                const last = stack[stack.length - 1];
                if ((char === ')' && last.char === '(') ||
                    (char === '}' && last.char === '{') ||
                    (char === ']' && last.char === '[')) {
                    stack.pop();
                } else {
                    console.log(`MISMATCH: Expected closing for '${last.char}' (from line ${last.line}), but found '${char}' at line ${i + 1}`);
                    // process.exit(1);
                }
            }
        }
    }
}

console.log('--- Unclosed Elements ---');
stack.forEach(item => {
    console.log(`Unclosed '${item.char}' at line ${item.line}`);
});
console.log(`Total Unclosed: ${stack.length}`);
