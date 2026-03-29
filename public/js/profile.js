document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });

        if (!res.ok) {
            if (res.status === 401) auth.logout();
            throw new Error('Failed to fetch profile');
        }

        const user = await res.json();
        
        // Update UI
        document.getElementById('profile-name').innerText = user.name;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('profile-avatar').innerText = user.name[0].toUpperCase();
        document.getElementById('profile-role').innerText = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        if (user.role === 'admin') {
            document.getElementById('admin-link').style.display = 'inline-block';
        }

        // Fetch user specific stats (mocking impact for now or could be extended)
        // In a real app, we'd have a separate endpoint for this or include it in /profile
        loadUserStats(user._id);

    } catch (err) {
        console.error(err);
        // alert('Session expired or error loading profile');
    }
});

async function loadUserStats(userId) {
    try {
        // Count campaigns by user
        const campRes = await fetch('/api/campaigns');
        const campaigns = await campRes.json();
        const userCampaigns = campaigns.filter(c => c.creator._id === userId || c.creator === userId);
        document.getElementById('user-campaigns-count').innerText = userCampaigns.length;

        // Total impact (sum of raised in their campaigns)
        const impact = userCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
        document.getElementById('user-impact-total').innerText = `₹${impact.toLocaleString()}`;

    } catch (err) {
        console.error('Error loading stats:', err);
    }
}
