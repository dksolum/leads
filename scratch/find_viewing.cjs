const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/AdminDashboard.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, idx) => {
    if (line.includes('viewingPricing')) {
        console.log(`Linha ${idx + 1}: ${line.trim()}`);
    }
});
