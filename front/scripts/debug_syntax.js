const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/teacher/TeacherDashboard.jsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let grade = 0; // ( ) balance
let brace = 0; // { } balance
let square = 0; // [ ] balance

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Simple parser ignoring strings/comments for speed (might have false positives but usually works for code structure)
    // To be safer, we should ignore content inside quotes.

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

        if (char === '(') grade++;
        if (char === ')') grade--;
        if (char === '{') brace++;
        if (char === '}') brace--;
        if (char === '[') square++;
        if (char === ']') square--;
    }

    if (grade < 0) {
        console.log(`IMBALANCE DETECTED at Line ${i + 1}: Extra closing parenthesis ')'`);
        console.log(`Line content: ${line.trim()}`);
        process.exit(1);
    }
    if (brace < 0) {
        console.log(`IMBALANCE DETECTED at Line ${i + 1}: Extra closing brace '}'`);
        console.log(`Line content: ${line.trim()}`);
        process.exit(1);
    }
}

console.log('Final Balance:');
console.log(`Parentheses: ${grade}`);
console.log(`Braces: ${brace}`);
console.log(`Squares: ${square}`);
