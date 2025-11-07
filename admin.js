const tableBody = document.querySelector("#claimsTable tbody");

function loadClaims() {
    const claims = JSON.parse(localStorage.getItem("claims")) || [];

    tableBody.innerHTML = "";

    if (claims.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>No claims found</td></tr>";
        return;
    }

    claims.forEach((claim, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${claim.id}</td>
            <td>${claim.name}</td>
            <td>${claim.type}</td>
            <td>₹${claim.amount}</td>
            <td>${claim.date}</td>
            <td class="status">${claim.status}</td>
            <td>
                ${claim.receipt ? `
                    <button class="view-receipt-btn" data-index="${index}">View Receipt</button>
                    <div class="receipt-modal" id="modal-${index}" style="display:none">
                        <div class="modal-content">
                            <span class="close-modal" data-index="${index}">&times;</span>
                            ${claim.receipt.type.startsWith('image/') 
                                ? `<img src="${claim.receipt.data}" alt="Receipt" style="max-width:100%">` 
                                : `<iframe src="${claim.receipt.data}" style="width:100%;height:500px;border:none;"></iframe>`
                            }
                            <div class="file-info">
                                <p>File name: ${claim.receipt.name}</p>
                                <p>File type: ${claim.receipt.type}</p>
                            </div>
                        </div>
                    </div>
                ` : '<span class="no-receipt">No receipt</span>'}
                <button class="approve-btn" data-index="${index}">Approve</button>
                <button class="reject-btn" data-index="${index}">Reject</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll(".approve-btn").forEach(btn => {
        btn.addEventListener("click", (e) => updateStatus(e.target.dataset.index, "Approved"));
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", (e) => updateStatus(e.target.dataset.index, "Rejected"));
    });

    // Add receipt view functionality
    document.querySelectorAll(".view-receipt-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = document.getElementById(`modal-${e.target.dataset.index}`);
            modal.style.display = "block";
        });
    });

    // Add modal close functionality
    document.querySelectorAll(".close-modal").forEach(span => {
        span.addEventListener("click", (e) => {
            const modal = document.getElementById(`modal-${e.target.dataset.index}`);
            modal.style.display = "none";
        });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("receipt-modal")) {
            e.target.style.display = "none";
        }
    });
}

function updateStatus(index, status) {
    const claims = JSON.parse(localStorage.getItem("claims")) || [];
    claims[index].status = status;
    localStorage.setItem("claims", JSON.stringify(claims));
    loadClaims();
}

loadClaims();
