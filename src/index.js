var path = require('path');
var fs = require('fs');
var fetch = require('node-fetch');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const dataUrl = "https://raw.githubusercontent.com/help-14/mechanical-keyboard/master/README.md"
const titles = ['## Normal Keyboards', '## Ergonomics Keyboards', '## Ortholinear Keyboards', '## Numpad/Macropad', '## Others Keyboards', '## Controller', '## Case', '## Plate', '## Keycaps', '## Firmware', '## Tools', '## Tutorials']
const outputPath = path.join(__dirname, '../dist')

function trimSpecialText(input) {
    return input.replace(/[^a-z0-9\s]/gi, '').trim()
}

function normalize(input) {
    return trimSpecialText(input.replace('/', ' ')).replace(/ /g, '-').toLowerCase()
}

async function loadData() {
    const res = await fetch(dataUrl)
    if (!res.ok) {
        throw new Error("Couldn't load data from Github")
    }
    const docs = await res.text();
    const result = []

    for (const title of titles) {
        let section = docs.substring(docs.indexOf(title) + title.length)
        section = section.substring(0, section.indexOf('##')).trim()
        const data = {
            title: trimSpecialText(title),
            id: normalize(title),
            rows: null,
            markdown: null
        }

        if (section.includes('img')) {
            data.rows = section
                .split('\n')
                .filter(r => r.includes('img'))
                .map(r => r.trim().trimStart('|').trimEnd('|').split('|').map(c => c.trim()).filter(c => c.length > 0))
                .map(r => ({
                    img: /src="([^"]*)"/.exec(r[0])[1],
                    name: r[1].includes('[') ? /\[([^"]*)\]/.exec(r[1])[1] : r[1],
                    url: r[1].includes('(') ? /\(([^"]*)\)/.exec(r[1])[1] : '',
                    des: md.render(r[2] ?? '').replace(/&lt;br \/&gt;/g, '<br />')
                }))
        } else {
            data.markdown = md.render(section ?? '')
        }
        result.push(data)
    }
    return result
}

function copyFileSync(source, target) {
    var targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
    var files = [];
    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

function copyFileSync(source, target) {
    var targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
    var files = [];
    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

function exportTemplate(templateName, data) {
    const layout = fs.readFileSync(path.join(__dirname, 'templates', 'layout.html')).toString()
    const ads = fs.readFileSync(path.join(__dirname, 'templates', 'ads.html')).toString()
    const botads = fs.readFileSync(path.join(__dirname, 'templates', 'bottom-ads.html')).toString()

    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`)
    if (!fs.existsSync(templatePath)) {
        throw new Error('Template not found: ' + templatePath)
    }
    const template = fs.readFileSync(templatePath).toString()

    let content = layout.replace('<!-- Content -->', template)
    content = content.replace(/<!-- Ads -->/g, ads).replace(/<!-- Bottom Ads -->/g, botads)

    if (data.title)
        content = content.replace('<!-- title -->', data.title)

    if (data.description)
        content = content.replace('<!-- description -->', data.description)

    if (data.categories) {
        content = content.replace('<!-- categories -->', data.categories.map(c => `
        <div class="card col-lg-4 m-2 p-0" style="width: 18rem;">
            <img class="card-img-top" src="/assets/images/categories/${c.id}.png" title="${c.title}">
            <div class="card-body">
                <a href="/${c.id}.html"><h5 class="card-title">${c.title}</h5></a>
            </div>
        </div>`).join(''))
    }

    if (data.rows) {
        content = content.replace('<!-- rows -->', data.rows.map(r => `
        <div class="col-lg-6">
            <article class="card post-card h-100 border-0 bg-transparent">
                <div class="card-body">
                    <a class="d-block " href="${r.url}">
                        <div class="post-image position-relative">
                            <img loading="lazy" class="w-100 h-auto rounded" src="${r.img}" height="500">
                        </div>
                    </a>
                    <a class="d-block" href="${r.url}">
                        <h3 class="mb-3 post-title">${r.name}</h3>
                    </a>
                    <p>${r.des}</p>
                </div>
            </article>
        </div>
        `).join(''))
    }

    if (data.markdown) {
        content = content.replace('<!-- rows -->', data.markdown)
    }

    fs.writeFileSync(path.join(outputPath, `${data.id}.html`), content)
}

function exportFiles() {
    fs.mkdirSync(outputPath, { recursive: true, mode: 0700 })
    copyFolderRecursiveSync(path.join(__dirname, 'assets'), outputPath)
    copyFolderRecursiveSync(path.join(__dirname, 'plugins'), outputPath)
}


(async () => {
    const data = await loadData()
    const categories = titles.map(t => ({
        title: trimSpecialText(t),
        id: normalize(t)
    }))

    exportFiles()
    exportTemplate('home', { id: 'index', categories })
    data.forEach(d => exportTemplate('category', d))
})()