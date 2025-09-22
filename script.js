document.addEventListener('DOMContentLoaded', () => {
    const wakeTime = localStorage.getItem('wakeTime') || 7; // Hours
    const sleepHours = 6;
    const slotHeight = 20; // px per 5min
    const totalSlots = 288; // 24h * 12
    const wakingSlots = (24 - sleepHours) * 12;

    // Build timeline
    const timeline = document.getElementById('timeline');
    const grid = document.getElementById('grid');
    for (let i = 0; i < totalSlots; i++) {
        const hour = Math.floor(i / 12) % 24;
        const min = (i % 12) * 5;
        if (min === 0) {
            const timeEl = document.createElement('div');
            timeEl.classList.add('slot');
            timeEl.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeline.appendChild(timeEl);
        } else {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            timeline.appendChild(slot);
        }
        const gridSlot = document.createElement('div');
        gridSlot.classList.add('slot');
        grid.appendChild(gridSlot);
    }

    // Highlight waking hours
    const wakeSlot = (wakeTime * 12);
    for (let i = wakeSlot; i < wakeSlot + wakingSlots; i++) {
        grid.children[i % totalSlots].style.background = 'rgba(0,0,255,0.1)';
    }

    // Palette blocks
    const blocksDiv = document.getElementById('blocks');
    function addBlockToPalette(name, duration, priority) {
        const block = document.createElement('div');
        block.classList.add('block', priority);
        block.textContent = `${name} (${duration}m)`;
        block.dataset.duration = duration / 5; // Slots
        blocksDiv.appendChild(block);
    }

    // Modal for new block
    const modal = document.getElementById('modal');
    document.getElementById('new-block').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('create-block').addEventListener('click', () => {
        const name = document.getElementById('task-name').value;
        const duration = parseInt(document.getElementById('duration').value);
        const priority = document.getElementById('priority').value;
        if (name && duration >= 5 && duration % 5 === 0) {
            addBlockToPalette(name, duration, priority);
            modal.classList.add('hidden');
        }
    });

    // Drag to grid
    new Sortable(blocksDiv, { group: 'shared', animation: 150, ghostClass: 'ghost' });
    new Sortable(grid, {
        group: 'shared',
        animation: 150,
        onAdd: (evt) => {
            const block = evt.item;
            const slotIndex = Math.floor(evt.originalEvent.clientY / slotHeight) - Math.floor(grid.getBoundingClientRect().top / slotHeight);
            block.style.top = `${slotIndex * slotHeight}px`;
            block.style.height = `${parseInt(block.dataset.duration) * slotHeight}px`;
            checkOverlaps();
        },
        onUpdate: checkOverlaps
    });

    function checkOverlaps() {
        const blocks = grid.querySelectorAll('.block');
        blocks.forEach(b1 => {
            const r1 = b1.getBoundingClientRect();
            blocks.forEach(b2 => {
                if (b1 !== b2) {
                    const r2 = b2.getBoundingClientRect();
                    if (!(r1.bottom <= r2.top || r1.top >= r2.bottom)) {
                        alert('Overlap! Merge or delete - no multitask.');
                    }
                }
            });
        });
    }

    // Scan bottlenecks
    document.getElementById('scan').addEventListener('click', () => {
        const blocks = grid.querySelectorAll('.block');
        let totalMins = 0;
        blocks.forEach(b => { totalMins += parseInt(b.dataset.duration) * 5; });
        if (totalMins > (24 - sleepHours) * 60) alert('Overload! Cut waste.');
        // Add more rules: flag non-red >30min, etc.
        alert('Scan done: Attack reds first.');
    });

    // Lock day (save to localStorage or export)
    document.getElementById('lock').addEventListener('click', () => {
        // Simulate export to calendar - alert for now
        alert('Day locked. Export to iCal: [data here]');
    });

    // Weekly toggle (stub - expand for full)
    document.getElementById('weekly-toggle').addEventListener('click', () => alert('Weekly view: Theme days coming.'));

    // Theme select
    document.getElementById('theme-select').addEventListener('change', (e) => {
        document.body.style.background = e.target.value ? '#000' : '#111'; // Tint example
    });

    // Auto-insert fuel: Lunch 5min, etc.
    addBlockToPalette('Lunch Fuel', 5, 'yellow');
    addBlockToPalette('Email Batch', 30, 'gray');
    // Load history from localStorage if any
});