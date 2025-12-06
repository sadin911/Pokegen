console.log("Gemini Showdown Visualizer loaded");

const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            shouldScan = true;
            break;
        }
    }
    if (shouldScan) scanForShowdownBlocks();
});

// Start observing
observer.observe(document.body, { childList: true, subtree: true });
// Initial scan
setTimeout(scanForShowdownBlocks, 1000);

function scanForShowdownBlocks() {
    // Look for code blocks. Gemini often uses <pre class="code-block"> or similar, 
    // but generic <pre> or <code> is a good start. 
    // We need to be careful not to double-inject.
    const blocks = document.querySelectorAll('pre, code, .code-block');

    blocks.forEach(block => {
        if (block.hasAttribute('data-gsv-processed')) return;

        // Check text content
        const text = block.innerText;
        if (ShowdownParser.isShowdownBlock(text)) {
            console.log("Found Showdown block found!");
            block.setAttribute('data-gsv-processed', 'true');

            // Inject button
            // We need a wrapper to position the button if the block is not relative
            if (getComputedStyle(block).position === 'static') {
                block.style.position = 'relative';
            }

            const btn = ShowdownUI.createVisualizerButton(async (e) => {
                e.stopPropagation();
                e.preventDefault();

                btn.innerText = 'Loading...';
                try {
                    const showdownData = ShowdownParser.parseShowdown(text);
                    console.log("Parsed:", showdownData);

                    const apiData = await PokeAPI.fetchPokemonData(showdownData.name);
                    console.log("API Data:", apiData);

                    ShowdownUI.showPokemonCard(apiData, showdownData);
                } catch (err) {
                    console.error(err);
                    alert("Failed to load Pokemon data");
                } finally {
                    btn.innerText = 'Visualize 🔍';
                }
            });

            block.appendChild(btn);
        }
    });
}
