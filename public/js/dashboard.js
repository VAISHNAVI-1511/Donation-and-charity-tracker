document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch('/api/campaigns/user-stats', {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();

        // Update Stats
        document.getElementById('user-campaign-count').innerText = data.campaignCount;
        document.getElementById('user-total-raised').innerText = `₹${data.totalRaised.toLocaleString()}`;
        document.getElementById('user-total-donors').innerText = data.totalDonors;

        // Update Table
        const list = document.getElementById('user-campaign-list');
        if (data.campaigns.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">You haven\'t created any campaigns yet.</td></tr>';
            return;
        }

        list.innerHTML = data.campaigns.map(c => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 1rem;">${c.title}</td>
                <td style="padding: 1rem;">₹${c.goalAmount.toLocaleString()}</td>
                <td style="padding: 1rem;">₹${c.raisedAmount.toLocaleString()}</td>
                <td style="padding: 1rem;">
                    <span style="color: ${c.raisedAmount >= c.goalAmount ? 'var(--success)' : 'var(--accent)'}">
                        ${c.raisedAmount >= c.goalAmount ? 'Completed' : 'Active'}
                    </span>
                </td>
                <td style="padding: 1rem;">
                    <a href="campaign.html?id=${c._id}" class="btn glass" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View</a>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
        // alert('Error loading dashboard');
    }
});
