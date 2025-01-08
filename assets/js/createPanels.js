function createPanelRows(menuItems, containerId) {
    const panels = Object.keys(menuItems).length;
    let rows = Math.ceil(panels / 4);
    let index = 0;
    let html = '';

    function createPanelCols(cols) {
        const keys = Object.keys(menuItems);
        let rowHtml = '<div class="row w-100 breakfast-panel justify-content-center mt-4">';

        for (let i = index; i < index + cols && i < keys.length; i++) {
            const key = keys[i];
            const item = menuItems[key];

            rowHtml += `
                <div class="col-md-3 col-sm-6 panel">
                    <div class="view-mode w-100">
                        <div class="image-container">
                            <img src="${item.image ? item.image : '/img/default.png'}" 
                                 class="panel-img w-100" 
                                 onerror="this.onerror=null; this.src='/img/default.png';" />
                            <div class="amount-overlay">${item.amt}</div>
                        </div>
                        <p class="panel-title">${item.name}</p>

                        <ul class="nameResponses">
                            ${item.names.map(name => `<li>${name}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        rowHtml += '</div>';
        html += rowHtml;
        return index + cols;
    }

    while (rows) {
        if (panels == 5) {
            index = createPanelCols(3)
            rows--;
            index = createPanelCols(2)
        } else if (panels > 4 && panels % 4 === 1 && rows <= 3) {
            index = createPanelCols(3)
        } else if (panels > 4 && panels % 4 === 2 && rows <= 2) {
            index = createPanelCols(3)
        } else if (panels > 4 && panels % 4 === 3 && rows <= 1) {
            index = createPanelCols(3)
        } else {
            index = createPanelCols(4)
        }
        rows--;
    }
    document.getElementById(containerId).innerHTML = html;
}