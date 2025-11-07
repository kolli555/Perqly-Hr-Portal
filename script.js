// Utility: render a professional claim card
function renderClaimCard(claim, title) {
    if (!claim) return `<div class="claim-card"><p>❌ Claim information is not available.</p></div>`;

    const statusClass = (claim.status || 'Pending').toLowerCase();

    return `
        <div class="claim-header">
            <div><strong>${title}</strong></div>
            <div><span class="status-badge ${statusClass}">${claim.status}</span></div>
        </div>
        <div class="claim-body">
            <p><strong>Claim ID:</strong> <span class="claim-id">${claim.id}</span>
               <button class="copy-id" data-id="${claim.id}" aria-label="Copy claim id">Copy</button>
            </p>
            <p><strong>Name:</strong> ${claim.name}</p>
            <p><strong>Type:</strong> ${claim.type}</p>
            <p><strong>Amount:</strong> ₹${claim.amount}</p>
            <p><strong>Date:</strong> ${claim.date}</p>
        </div>
    `;
}

// Show a temporary toast-like message in the claim container
function showMessage(container, html) {
    container.innerHTML = html;
    container.classList.remove('hidden');
    container.scrollIntoView({behavior: 'smooth', block: 'center'});
}

// Handle Claim Submission
document.getElementById('claimForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;

    const claimId = 'CLM' + Date.now().toString().slice(-6);

    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    
    // Create a promise to read the file
    const readFile = new Promise((resolve) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                });
            };
            reader.readAsDataURL(file);
        } else {
            resolve(null);
        }
    });

    // Wait for file to be read
    const fileData = await readFile;
    
    const claim = {
        id: claimId,
        name,
        type,
        amount,
        date: new Date().toLocaleDateString(),
        status: 'Pending',
        receipt: fileData
    };

    // Save to localStorage
    const claims = JSON.parse(localStorage.getItem('claims')) || [];
    claims.push(claim);
    localStorage.setItem('claims', JSON.stringify(claims));

    const msg = document.getElementById('msg');
    const html = renderClaimCard(claim, 'Claim Submitted Successfully');
    showMessage(msg, html);
    this.reset();
});

// Handle Status Check
document.getElementById('statusForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const claimId = document.getElementById('claimId').value.trim();
    const claims = JSON.parse(localStorage.getItem('claims')) || [];
    const claim = claims.find(c => c.id === claimId);

    const statusResult = document.getElementById('statusResult');
    if (claim) {
        const html = renderClaimCard(claim, 'Claim Details');
        showMessage(statusResult, html);
    } else {
        showMessage(statusResult, `<div class="claim-header"><strong>Not found</strong></div><div class="claim-body"><p>❌ No claim found with that ID. Please check the ID and try again.</p></div>`);
    }
});

// Copy-to-clipboard support (delegated)
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('copy-id')) {
        const id = e.target.dataset.id;
        if (!id) return;
        navigator.clipboard?.writeText(id).then(() => {
            const original = e.target.textContent;
            e.target.textContent = 'Copied';
            setTimeout(() => e.target.textContent = original, 1500);
        }).catch(() => {
            // Fallback
            const tmp = document.createElement('input');
            document.body.appendChild(tmp);
            tmp.value = id;
            tmp.select();
            document.execCommand('copy');
            tmp.remove();
            const original = e.target.textContent;
            e.target.textContent = 'Copied';
            setTimeout(() => e.target.textContent = original, 1500);
        });
    }
});
