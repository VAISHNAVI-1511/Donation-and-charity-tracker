// Utility to handle authentication state
const auth = {
    getToken: () => localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user')),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    },
    isLoggedIn: () => !!localStorage.getItem('token')
};

// Update UI based on auth
document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.getElementById('auth-links');
    if (auth.isLoggedIn()) {
        const user = auth.getUser();
        authLinks.innerHTML = `
            <a href="dashboard.html" style="margin-right: 15px; color: var(--text); text-decoration: none; font-weight: 500;">Dashboard</a>
            <a href="profile.html" style="margin-right: 15px; color: var(--text); text-decoration: none; font-weight: 500;">
                <span style="color: var(--text-muted)">Hi,</span> ${user.name}
            </a>
            <a href="#" onclick="auth.logout()" style="color: var(--text); text-decoration: none; font-weight: 500;">Logout</a>
        `;
    }

    // Categories List
    const categories = [
        "Medical", "Education", "Disaster Relief", "Animal Rescue", 
        "Community Support", "Environment", "Child Welfare", 
        "Elderly Care", "Women Empowerment", "Food & Hunger", "Shelter & Housing"
    ];

    // Populating Navbar Dropdown
    const dropdownContents = document.querySelectorAll('#browse-dropdown-content');
    dropdownContents.forEach(content => {
       content.innerHTML = categories.map(cat => `
           <a href="campaigns.html?category=${encodeURIComponent(cat)}">${cat}</a>
       `).join('');
    });

    // Page Specific Loading Logic
    const path = window.location.pathname;
    if (document.getElementById('campaign-list')) {
        if (path.endsWith('index.html') || path === '/' || path.includes('index')) {
            loadCampaigns('', '', 3); // Top 3 featured on home
        }
        // campaigns.html handles its own initial load based on URL params
    }

    if (document.getElementById('top-donors-list')) {
        loadTopDonors();
    }

    // Global Search and Filter Logic
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    if (searchBtn && searchInput) {
        const performSearch = () => {
            const search = searchInput.value;
            const category = categoryFilter ? categoryFilter.value : '';
            
            // Redirect if on Home or other pages
            if (!path.includes('campaigns.html')) {
                window.location.href = `campaigns.html?search=${encodeURIComponent(search)}${category ? `&category=${encodeURIComponent(category)}` : ''}`;
            } else {
                // Already on Discovery page, just update results and UI
                loadCampaigns(search, category);
                
                // Update Title
                const titleEl = document.getElementById('browse-title');
                if (category) titleEl.innerText = `${category} Fundraisers`;
                else if (search) titleEl.innerText = `Search: ${search}`;
                else titleEl.innerText = "Browse Fundraisers";
            }
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
        if (categoryFilter) categoryFilter.addEventListener('change', performSearch);
    }
});

async function loadCampaigns(search = '', category = '', limit = '') {
    const list = document.getElementById('campaign-list');
    if (!list) return;
    
    list.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Loading fundraisers...</p>';

    try {
        let url = `/api/campaigns?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&limit=${limit}`;
        const res = await fetch(url);
        const campaigns = await res.json();

        if (campaigns.length === 0) {
            list.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-muted); padding: 3rem;">No fundraisers found in this category.</p>';
            return;
        }

        list.innerHTML = campaigns.map(c => `
            <div class="card glass fade-in">
                <img src="${c.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'}" alt="${c.title}" class="card-img">
                <div class="card-content">
                    <div class="card-category">${c.category}</div>
                    <h3 class="card-title">${c.title}</h3>
                    <div class="progress-stats">
                        <span>₹${c.raisedAmount.toLocaleString()} raised</span>
                        <span>₹${c.goalAmount.toLocaleString()} goal</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${Math.min((c.raisedAmount / c.goalAmount) * 100, 100)}%"></div>
                    </div>
                    <div style="margin-top: 1.5rem;">
                         <a href="campaign.html?id=${c._id}" class="btn btn-primary" style="width: 100%; text-align: center; padding: 0.6rem;">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        list.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Error loading campaigns.</p>';
    }
}

async function loadTopDonors() {
    const list = document.getElementById('top-donors-list');
    if (!list) return;

    try {
        const res = await fetch('/api/donations/top-donors');
        const donors = await res.json();

        if (donors.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted)">No donations yet. Be the first!</p>';
            return;
        }

        list.innerHTML = donors.map((d, index) => `
            <div style="text-align: center; padding: 1rem; flex: 1; min-width: 120px;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '✨'}</div>
                <div style="font-weight: 700; color: var(--text);">${d.donorName}</div>
                <div style="font-size: 0.85rem; color: var(--primary);">₹${d.totalDonated.toLocaleString()}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading leaderboard:', err);
    }
}
