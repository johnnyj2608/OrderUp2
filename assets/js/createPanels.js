async function toggleStrikethrough(element, orderID, menu_received) {
    element.classList.toggle('strikethrough');
    const hasStrikethrough = element.classList.contains('strikethrough');
    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                orderID,
                menu_received,
                hasStrikethrough,
            }),
        });

        const result = await response.json();
        if (result.success) {
            
        } else {
            alert("error")
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function createPanelRows(menuItems, containerId) {
    const panels = Object.keys(menuItems).length;
    let rows = Math.ceil(panels / 4);
    let index = 0;
    let html = '';

    const keys = Object.keys(menuItems);
    const menu = containerId[0]
    const menu_received = menu+"_received";

    function createPanelCols(cols) {
        let rowHtml = '<div class="row w-100 breakfast-panel justify-content-center mt-4">';

        for (let i = index; i < index + cols && i < keys.length; i++) {
            const key = keys[i];
            const item = menuItems[key];

            rowHtml += `
                <div class="col-md-3 col-sm-4 panel">
                    <div class="view-mode w-100">
                        <div class="image-container">
                            <img src="${item.image ? item.image : '/img/default.png'}" 
                                 class="panel-img w-100" 
                                 onerror="this.onerror=null; this.src='/img/default.png';" />
                            <div class="amount-overlay">${item.amt}</div>
                        </div>
                        <p class="panel-title">${item.name}</p>

                        <ul class="nameResponses">
                            <!-- Non-Received Orders (Top Section) -->
                            ${item.orders
                                .filter(order => !order.received)
                                .map(order => {
                                    return `
                                        <li class="pointer" 
                                            data-order-id="${menu}-${order.id}"
                                            onclick="toggleStrikethrough(this, ${order.id}, '${menu_received}')">
                                            ${order.name}
                                        </li>
                                    `;
                                })
                                .join('')}
                            
                            <!-- Received Orders (Bottom Section) -->
                            ${item.orders
                                .filter(order => order.received)
                                .map(order => {
                                    return `
                                        <li class="pointer strikethrough" 
                                            data-order-id="${menu}-${order.id}"
                                            onclick="toggleStrikethrough(this, ${order.id}, '${menu_received}')">
                                            ${order.name}
                                        </li>
                                    `;
                                })
                                .join('')}
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