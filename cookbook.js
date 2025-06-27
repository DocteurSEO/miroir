document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & State ---
    const stepsData = {
        '1': {
            html: `<div class="bind">\n    <h1>Bonjour, {{ name }} !</h1>\n    <p>Vous avez {{ age }} ans.</p>\n    <br>\n    <input d-model="name" placeholder="Votre nom">\n    <input type="number" d-model="age">\n</div>`,
            js: `const state = miroir.create({\n  name: 'Visiteur',\n  age: 30\n});`
        },
        '2': {
            html: `<div class="bind">\n    <label>\n        <input type="checkbox" d-model="showSecret">\n        Révéler le secret\n    </label>\n\n    <div m-show="showSecret" style="margin-top: 1rem; padding: 1rem; background: rgba(9, 105, 218, 0.1); border-radius: 6px;">\n        <p style="color: #0969da; margin: 0;">\n            <strong>Le secret :</strong> Miroir.js est incroyablement simple !\n        </p>\n    </div>\n</div>`,
            js: `// L'extension m-show est déjà dans extensions.js\n// donc nous n'avons pas besoin de la redéfinir ici.\n\nconst app = miroir.create({\n  showSecret: false\n});`
        },
        '3': {
            html: `<div class="bind">\n    <h2 m-color="myColor">Ce texte change de couleur !</h2>\n    <br>\n    <label for="color-picker">Choisissez une couleur :</label>\n    <input type="color" d-model="myColor" id="color-picker">\n    <p>La couleur est : <code>{{ myColor }}</code></p>\n</div>`,
            js: `// 1. Créez votre extension !\nmiroir.extend('m-color', (el, prop, state) => {\n  // el: l'élément <h2>\n  // prop: la chaîne \"myColor\"\n  // state: l'objet réactif\n  \n  // TODO: Liez la couleur de 'el' à la valeur de state[prop].\n  \n});\n\n// 2. Créez l'état\nconst app = miroir.create({\n  myColor: '#3498db'\n});\n\n// 3. (Bonus) Observez les changements dans la console\nmiroir.watch('myColor', (newValue) => {\n    console.log(\`La couleur a changé en : 
${newValue}
\`);\n});`,
            solution: `  el.style.color = state[prop];`
        }
    };
    let editors = {};
    let activeStep = '1';

    // --- Monaco Editor Loader ---
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' }});

    window.onresize = () => {
        Object.values(editors).forEach(editorPair => {
            if (editorPair.html) editorPair.html.layout();
            if (editorPair.js) editorPair.js.layout();
        });
    };

    // --- Core Functions ---
    function createPreviewContent(html, js, step) {
        const consoleScript = `
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            function postMessageToParent(type, args) {
                try {
                    window.parent.postMessage({
                        source: 'iframe-console',
                        step: '${step}',
                        type: type,
                        message: args.map(arg => JSON.stringify(arg, null, 2)).join(' ')
                    }, '*');
                } catch (e) {
                    // Ignore errors from circular structures in JSON.stringify
                }
            }

            console.log = function(...args) {
                originalLog.apply(console, args);
                postMessageToParent('log', args);
            };
            console.error = function(...args) {
                originalError.apply(console, args);
                postMessageToParent('error', args);
            };
            console.warn = function(...args) {
                originalWarn.apply(console, args);
                postMessageToParent('warn', args);
            };
            
            window.addEventListener('error', function(e) {
                console.error(e.message);
            });
        `;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="styles/miroir.css">
                <script src="miroir.js"><\/script>
                <script src="extensions.js"><\/script>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                        color: #2c3e50;
                        padding: 1rem;
                        background-color: #fff;
                    }
                    input { display: block; margin-top: 0.5rem; width: 80%; }
                    input[type=checkbox] { width: auto; display: inline-block; }
                    code { background-color: rgba(9, 105, 218, 0.1); color: #0969da; padding: 2px 5px; border-radius: 4px; }
                </style>
            </head>
            <body>
                ${html}
                <script>${consoleScript}<\/script>
                <script>
                    try {
                        ${js}
                    } catch(e) {
                        console.error(e.message);
                    }
                <\/script>
            </body>
            </html>
        `;
    }

    function updatePreview(step) {
        const iframe = document.getElementById(`preview-${step}`);
        const consoleEl = document.getElementById(`console-${step}`);
        if (!iframe || !consoleEl || !editors[step]) return;

        consoleEl.innerHTML = ''; // Clear console on update
        const html = editors[step].html.getValue();
        const js = editors[step].js.getValue();
        iframe.srcdoc = createPreviewContent(html, js, step);
    }

    function initEditor(step) {
        if (editors[step] || !stepsData[step]) return;

        const htmlEditorContainer = document.getElementById(`html-editor-${step}`);
        const jsEditorContainer = document.getElementById(`js-editor-${step}`);

        editors[step] = {
            html: monaco.editor.create(htmlEditorContainer, {
                value: stepsData[step].html,
                language: 'html',
                theme: 'vs',
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 14,
                wordWrap: 'on'
            }),
            js: monaco.editor.create(jsEditorContainer, {
                value: stepsData[step].js,
                language: 'javascript',
                theme: 'vs',
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 14,
                wordWrap: 'on'
            })
        };

        editors[step].html.onDidChangeModelContent(() => updatePreview(step));
        editors[step].js.onDidChangeModelContent(() => updatePreview(step));
    }

    function handleStepChange(step) {
        activeStep = step;
        document.querySelectorAll('.step-btn, .tutorial-step').forEach(el => el.classList.remove('active'));
        
        const stepButton = document.querySelector(`[data-step="${step}"]`);
        const stepContent = document.getElementById(`step-${step}`);

        if (stepButton) stepButton.classList.add('active');
        if (stepContent) stepContent.classList.add('active');
        
        // Refresh layout of the now visible editor
        if (editors[step] && editors[step].html) {
            editors[step].html.layout();
            editors[step].js.layout();
        }
    }

    // --- Main Execution ---
    require(['vs/editor/editor.main'], () => {
        // 1. Initialize all editors
        ['1', '2', '3'].forEach(step => {
            initEditor(step);
            updatePreview(step);
        });

        // 2. Set up event listeners
        window.addEventListener('message', (event) => {
            if (event.data.source !== 'iframe-console' || event.data.step !== activeStep) return;

            const consoleEl = document.getElementById(`console-${activeStep}`);
            if (consoleEl) {
                const logEntry = document.createElement('div');
                logEntry.className = `console-log ${event.data.type}`;
                logEntry.textContent = `> ${event.data.message.replace(/"/g, '')}`;
                consoleEl.appendChild(logEntry);
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }
        });

        document.querySelectorAll('.step-btn').forEach(btn => {
            btn.addEventListener('click', () => handleStepChange(btn.dataset.step));
        });

        const hintBtn = document.getElementById('btn-hint-3');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                alert("Indice : Vous devez utiliser 'el.style.color' pour affecter la couleur de l'élément.");
            });
        }

        const solutionBtn = document.getElementById('btn-solution-3');
        if (solutionBtn) {
            solutionBtn.addEventListener('click', () => {
                if (editors['3'] && stepsData['3'].solution) {
                    const jsEditor = editors['3'].js;
                    const fullCode = jsEditor.getValue();
                    const newCode = fullCode.replace(/\/\/ TODO:.*\n/, stepsData['3'].solution + '\n');
                    jsEditor.setValue(newCode);
                }
            });
        }

        // 3. Show the first step
        handleStepChange('1');
    });
});