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
    content = content.replace(/@\/components/g, '.');
    content = content.replace(/@\/lib/g, '../lib');
    content = content.replace(/@\/hooks/g, '../hooks');
    content = content.replace(/@\/types/g, '../types');
    fs.writeFileSync(file, content);
});
console.log('Fixed imports');
