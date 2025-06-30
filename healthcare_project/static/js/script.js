document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const symptomsInput = document.getElementById('symptoms');
    const submitBtn = document.getElementById('submit-btn');
    const loadingIndicator = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const healthAdviceContainer = document.getElementById('health-advice');
    const newSearchBtn = document.getElementById('new-search-btn');
    
    // Submit symptoms and get health advice
    submitBtn.addEventListener('click', function() {
        const symptoms = symptomsInput.value.trim();
        
        // Validate input
        if (!symptoms) {
            alert('Please describe your symptoms before submitting.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        submitBtn.disabled = true;
        
        // Send request to backend
        fetch('/get_health_assistance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symptoms: symptoms })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'An error occurred while processing your request.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Format and display the health advice
            displayHealthAdvice(data.healthAdvice);
            
            // Hide loading indicator and show results
            loadingIndicator.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            submitBtn.disabled = false;
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            // Handle errors
            alert(error.message);
            loadingIndicator.classList.add('hidden');
            submitBtn.disabled = false;
        });
    });
    
    // Format and display health advice
    function displayHealthAdvice(advice) {
        // Convert markdown-like text to HTML
        let formattedAdvice = advice
            .replace(/\n\n/g, '<br><br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*)/gm, '<li>$1</li>');
            
        // Wrap lists in ul tags
        formattedAdvice = formattedAdvice.replace(/<li>(.*?)<\/li>(\s*<li>.*?<\/li>)*/g, function(match) {
            return '<ul>' + match + '</ul>';
        });
        
        // Add disease headers
        formattedAdvice = formattedAdvice.replace(/^(.*?):/gm, function(match, p1) {
            if (p1.length > 3 && !match.includes('<')) {
                return '<h3 class="disease-name">' + p1 + ':</h3>';
            }
            return match;
        });
        
        // Set the formatted advice
        healthAdviceContainer.innerHTML = formattedAdvice;
        
        // Add section classes for styling
        const sections = ['Description', 'Additional symptoms', 'Precautions', 'Medications', 'Workouts', 'Diet', 'Expected outcomes'];
        sections.forEach(section => {
            const regex = new RegExp(`<strong>${section}:</strong>`, 'g');
            formattedAdvice = formattedAdvice.replace(regex, `<strong class="section-header">${section}:</strong>`);
        });
        
        healthAdviceContainer.innerHTML = formattedAdvice;
    }
    
    // New search button handler
    newSearchBtn.addEventListener('click', function() {
        // Hide results and clear input
        resultsSection.classList.add('hidden');
        symptomsInput.value = '';
        
        // Focus on symptoms input
        symptomsInput.focus();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Enable Enter key submission in textarea
    symptomsInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            submitBtn.click();
        }
    });
});