// Jab user pincode input field mein kuch likhe toh yeh event listener trigger hota hai
document.getElementById('pincode').addEventListener('input', function() {
    // Input field ka value (jo pincode user likha hai) ko store karo pincode variable mein
    const pincode = this.value;
    // Check karo ki pincode ki length 6 hai aur sirf numbers hain (regex /^\d{6}$/ use karte ho)
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
        // Agar valid pincode hai toh fetchLocation function ko call karo
        fetchLocation(pincode);
    } else {
        // Warna results ko clear kar do (kuch na likha ho ya galat format ho)
        clearResults();
    }
});

// Yeh function pincode se location details fetch karta hai
function fetchLocation(pincode) {
    // Yeh Nominatim API ka URL hai jo OpenStreetMap se location data fetch karta hai, pincode ke basis pe
    // format=json: response JSON format mein chahiye
    // q=${pincode},India: search query pincode aur India ke liye
    // limit=1: sirf ek result chahiye
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${pincode},India&limit=1`;
    
    // fetch() function API ko call karta hai aur promise return karta hai
    fetch(url)
        // Pehli .then(): API se response aata hai, usko JSON format mein convert karo
        .then(response => response.json())
        // Doosri .then(): converted data ko handle karo
        .then(data => {
            // Agar data mein kuch results hain (array khali nahi hai)
            if (data.length > 0) {
                // Pehla result nikalo
                const place = data[0];
                // Address ka full name nikal lo
                const address = place.display_name;
                // Latitude ko number mein convert karo
                const lat = parseFloat(place.lat);
                // Longitude ko number mein convert karo
                const lon = parseFloat(place.lon);
                // displayResults function ko call karo address aur coordinates ke saath
                displayResults(address, lat, lon);
            } else {
                // Agar koi result nahi mila toh error message dikha do
                displayError('Location not found for this pin code.');
            }
        })
        // Agar network error ya koi problem ho toh catch mein aye
        .catch(error => {
            // Browser console mein error log karo
            console.error('Error fetching location:', error);
            // User ko error message dikha do
            displayError('Error fetching location. Please try again.');
        });
}

// Yeh function location ka address aur map display karta hai
function displayResults(address, lat, lon) {
    // 'results' div ko select karo jahan par ham location dikhaenge
    const resultsDiv = document.getElementById('results');
    // HTML structure ko results div mein set karo:
    // - Address display ke liye ek div
    // - Map display ke liye ek div (id="map")
    resultsDiv.innerHTML = `
        <div id="address">${address}</div>
        <div id="map"></div>
    `;
    
    // L.map object create karo 'map' div mein aur map ko [latitude, longitude] par center karo
    // 13 zoom level hai (jitna zyada number utna zyada zoom)
    const map = L.map('map').setView([lat, lon], 13);
    
    // Yeh tile layer hai jo OpenStreetMap se map tiles load karta hai aur copyright attribution add karta hai
    // {s}: subdomain (a, b, c) - load balancing ke liye
    // {z}: zoom level
    // {x}, {y}: tile coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // Attribution: copyright aur OpenStreetMap ko credit dena zaruri hai
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Location par ek marker (red pin) laga do
    L.marker([lat, lon]).addTo(map);
}

// Yeh function error message display karta hai jab location nahi mila
function displayError(message) {
    // 'results' div ko select karo
    const resultsDiv = document.getElementById('results');
    // Red color mein error message display karo
    resultsDiv.innerHTML = `<div style="color: red;">${message}</div>`;
}

// Yeh function results ko clear kar deta hai (blank kar deta hai)
function clearResults() {
    // 'results' div ko empty karo
    document.getElementById('results').innerHTML = '';
}