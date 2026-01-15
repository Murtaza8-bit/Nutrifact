// Edamam Credentials provided by the user
const APP_ID = '7677e922';
const APP_KEY = '7775702780892bf5fbebf531fa4498ec';

// Selecting DOM elements
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const recipeGrid = document.querySelector('#recipe-grid');
const loader = document.querySelector('#loader');
const favList = document.querySelector('#fav-list');

// 1. Fetch Data from API (Asynchronous Request-Response Cycle)
async function getRecipes(query) {
    const url = `https://api.edamam.com/search?q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}&from=0&to=12`;
    
    // Show Loading Spinner
    loader.classList.remove('hidden');
    recipeGrid.innerHTML = ''; 

    try {
        const response = await fetch(url);
        const data = await response.json(); // Parsing JSON data
        
        loader.classList.add('hidden'); // Hide Loading Spinner
        renderCards(data.hits);
    } catch (error) {
        loader.classList.add('hidden');
        console.error("Fetch Error:", error);
        recipeGrid.innerHTML = `<p class="error">Error connecting to the network. Please check your internet or API limits.</p>`;
    }
}

// 2. Render Cards (DOM Manipulation with Placeholder Fallback)
const renderCards = (hits) => {
    if (hits.length === 0) {
        recipeGrid.innerHTML = "<h2>No results found. Try a different ingredient!</h2>";
        return;
    }

    hits.forEach(item => {
        // ES6 Destructuring
        const { label, image, calories, totalNutrients } = item.recipe;
        
        // Logical check for the image: use API image or local placeholder if missing
        const imageSrc = image ? image : 'assets/placeholder.jpg';

        const card = document.createElement('div');
        card.classList.add('card');
        
        // The 'onerror' attribute handles cases where the link exists but the image fails to load
        card.innerHTML = `
            <img src="${imageSrc}" 
                 onerror="this.onerror=null;this.src='assets/placeholder.jpg';" 
                 alt="${label}">
            <div class="card-body">
                <h4>${label}</h4>
                <div class="macros">
                    <span>🔥 ${Math.round(calories)} kcal</span>
                    <span>🥩 P: ${Math.round(totalNutrients.PROCNT.quantity)}g</span>
                </div>
                <button class="fav-btn" onclick="saveFavorite('${label.replace(/'/g, "\\'")}')">
                    ❤️ Favorite
                </button>
            </div>
        `;
        recipeGrid.appendChild(card);
    });
};

// 3. Local Storage Logic (Persistent Data Management)
const saveFavorite = (name) => {
    let favorites = JSON.parse(localStorage.getItem('nutrifact_list')) || [];
    
    if (!favorites.includes(name)) {
        favorites.push(name);
        localStorage.setItem('nutrifact_list', JSON.stringify(favorites));
        displayFavorites();
    } else {
        alert("This recipe is already in your favorites!");
    }
};

const displayFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('nutrifact_list')) || [];
    // Using .map() iterator and Template Literals
    favList.innerHTML = favorites.map(fav => `
        <li>
            ${fav}
            <button class="remove-btn" onclick="removeFavorite('${fav.replace(/'/g, "\\'")}')">&times;</button>
        </li>
    `).join('');
};

// 4. Remove Individual Favorite
window.removeFavorite = (name) => {
    let favorites = JSON.parse(localStorage.getItem('nutrifact_list')) || [];
    favorites = favorites.filter(fav => fav !== name);
    localStorage.setItem('nutrifact_list', JSON.stringify(favorites));
    displayFavorites();
};

// 5. Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents page reload on form submission
    getRecipes(searchInput.value);
});

document.querySelector('#clear-all').addEventListener('click', () => {
    if(confirm("Are you sure you want to clear all favorites?")) {
        localStorage.removeItem('nutrifact_list');
        displayFavorites();
    }
});

// Initialize Favorites Sidebar on Page Load
displayFavorites();