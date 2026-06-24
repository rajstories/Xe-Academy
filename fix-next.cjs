const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/components').filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import Image from 'next\/image';\n?/g, '');
    content = content.replace(/<Image([^>]+)>/g, (match, p1) => {
        return `<img${p1}>`;
    });
    content = content.replace(/import { useRouter, useParams } from 'next\/navigation';\n?/g, '');
    fs.writeFileSync(file, content);
});
console.log('Fixed Next.js specific components');
