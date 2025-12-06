const ShowdownUI = {
    createVisualizerButton: function (onClick) {
        const btn = document.createElement('button');
        btn.innerText = 'Visualize 🔍';
        btn.className = 'gsv-viz-btn';
        btn.onclick = onClick;
        return btn;
    },

    showPokemonCard: function (data, showdownData, evolutionLine) {
        const existing = document.querySelector('.gsv-card');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.className = 'gsv-card';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '×';
        closeBtn.className = 'gsv-close-btn';
        closeBtn.onclick = () => card.remove();
        card.appendChild(closeBtn);

        // Content Container
        const content = document.createElement('div');
        content.className = 'gsv-content';

        // 1. Header (Name + Sprite)
        const header = document.createElement('div');
        header.className = 'gsv-header';

        if (data && data.sprites) {
            const img = document.createElement('img');
            img.src = data.sprites.front_default || data.sprites.other['official-artwork'].front_default;
            img.className = 'gsv-sprite';
            header.appendChild(img);
        }

        const title = document.createElement('h2');
        title.innerText = showdownData.name;
        header.appendChild(title);

        // Types
        const typesDiv = document.createElement('div');
        typesDiv.className = 'gsv-types';
        data.types.forEach(t => {
            const span = document.createElement('span');
            span.innerText = t.type.name;
            span.className = `gsv-type type-${t.type.name}`;
            typesDiv.appendChild(span);
        });
        header.appendChild(typesDiv);

        content.appendChild(header);

        // 2. Tabs Container
        const tabs = document.createElement('div');
        tabs.className = 'gsv-tabs';

        // Helper to create tab button
        const createTab = (id, label, active = false) => {
            const btn = document.createElement('button');
            btn.innerText = label;
            btn.className = `gsv-tab ${active ? 'active' : ''}`;
            btn.addEventListener('click', (e) => {
                ShowdownUI.switchTab(e.target, id);
            });
            return btn;
        };

        tabs.appendChild(createTab('details', 'Details', true));
        tabs.appendChild(createTab('evolution', 'Evolution'));
        tabs.appendChild(createTab('moves', 'Moves'));

        content.appendChild(tabs);

        // 3. Details Tab
        const details = document.createElement('div');
        details.className = 'gsv-tab-content active';
        details.id = 'gsv-tab-details';
        // Clean up nulls
        const item = showdownData.item || 'None';
        const ability = showdownData.ability || 'None';
        const nature = showdownData.nature || 'None';

        details.innerHTML = `
        <p><strong>Item:</strong> ${item}</p>
        <p><strong>Ability:</strong> ${ability}</p>
        <p><strong>Nature:</strong> ${nature}</p>
        <div class="gsv-stats">
            ${data.stats.map(s => `
                <div class="gsv-stat-row">
                    <span>${s.stat.name.replace('special-', 'sp. ')}</span>
                    <div class="gsv-stat-bar-bg">
                        <div class="gsv-stat-bar" style="width: ${(s.base_stat / 255) * 100}%"></div>
                    </div>
                    <span>${s.base_stat}</span>
                </div>
            `).join('')}
        </div>
    `;
        content.appendChild(details);

        // 4. Evolution Tab
        const evoTab = document.createElement('div');
        evoTab.className = 'gsv-tab-content';
        evoTab.id = 'gsv-tab-evolution';

        // Recursive rendering helper
        const renderNode = (node) => {
            if (!node) return '';
            let html = `
            <div class="gsv-evo-node">
                <div class="gsv-evo-stage">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${node.id}.png" alt="${node.name}">
                    <span>${node.name}</span>
                    ${node.condition ? `<small>${node.condition}</small>` : ''}
                </div>
        `;

            if (node.evolves_to && node.evolves_to.length > 0) {
                html += '<div class="gsv-evo-children">';
                node.evolves_to.forEach(child => {
                    html += `
                    <div class="gsv-evo-branch">
                        <span class="gsv-arrow">→</span>
                        ${renderNode(child)}
                    </div>
                `;
                });
                html += '</div>';
            }

            html += '</div>';
            return html;
        };

        let evoHtml = '<div class="gsv-evo-container">';
        if (evolutionLine) {
            evoHtml += renderNode(evolutionLine);
        } else {
            evoHtml += '<p>No evolution data found.</p>';
        }
        evoHtml += '</div>';

        evoTab.innerHTML = evoHtml;
        content.appendChild(evoTab);


        // 5. Moves Tab
        const movesTab = document.createElement('div');
        movesTab.className = 'gsv-tab-content';
        movesTab.id = 'gsv-tab-moves';

        // Filter and process moves
        const version = showdownData.gameVersion;
        let processedMoves = data.moves.map(m => {
            // Find relevant detail for this version
            const detail = version
                ? m.version_group_details.find(d => d.version_group.name === version)
                : m.version_group_details[m.version_group_details.length - 1]; // Default to latest

            if (!detail) return null;

            return {
                name: m.move.name.replace(/-/g, ' '),
                method: detail.move_learn_method.name,
                level: detail.level_learned_at,
                // Sort helper
                sortOrder: detail.move_learn_method.name === 'level-up' ? 1 :
                    detail.move_learn_method.name === 'machine' ? 2 :
                        detail.move_learn_method.name === 'tutor' ? 3 :
                            detail.move_learn_method.name === 'egg' ? 4 : 5
            };
        }).filter(Boolean);

        // Sort moves: Method -> Level -> Name
        processedMoves.sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            if (a.method === 'level-up' && a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });

        const renderMoveBadge = (move) => {
            if (move.method === 'level-up') return `<span class="gsv-badge lvl">Lvl ${move.level}</span>`;
            if (move.method === 'machine') return `<span class="gsv-badge tm">TM</span>`;
            if (move.method === 'egg') return `<span class="gsv-badge egg">Egg</span>`;
            if (move.method === 'tutor') return `<span class="gsv-badge tutor">Tutor</span>`;
            return `<span class="gsv-badge other">${move.method}</span>`;
        };

        movesTab.innerHTML = `
        <h3>Moves for ${version || 'Latest'}</h3>
        <div class="gsv-move-container">
            ${processedMoves.length > 0 ? processedMoves.map(m => `
                <div class="gsv-move-row">
                    ${renderMoveBadge(m)}
                    <span class="gsv-move-name">${m.name}</span>
                </div>
            `).join('') : '<p>No moves found for this version</p>'}
        </div>
    `;
        content.appendChild(movesTab);

        card.appendChild(content);
        document.body.appendChild(card);
    },

    switchTab: function (btn, tabId) {
        const parent = btn.parentElement;
        parent.querySelectorAll('.gsv-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const container = parent.parentElement;
        container.querySelectorAll('.gsv-tab-content').forEach(c => c.classList.remove('active'));
        container.querySelector(`#gsv-tab-${tabId}`).classList.add('active');
    }
};
