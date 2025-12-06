const ShowdownUI = {
    createVisualizerButton: function (onClick) {
        const btn = document.createElement('button');
        btn.innerText = 'Visualize 🔍';
        btn.className = 'gsv-viz-btn';
        btn.onclick = onClick;
        return btn;
    },

    showPokemonCard: function (data, showdownData) {
        // Remove existing card if any
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
        content.appendChild(header);

        // 2. Details (Stats, Nature, Item)
        const details = document.createElement('div');
        details.className = 'gsv-details';

        // TODO: Add more details here
        details.innerHTML = `
        <p><strong>Item:</strong> ${showdownData.item || 'None'}</p>
        <p><strong>Ability:</strong> ${showdownData.ability || 'None'}</p>
        <p><strong>Nature:</strong> ${showdownData.nature || 'None'}</p>
    `;
        content.appendChild(details);

        card.appendChild(content);
        document.body.appendChild(card);
    }
};
