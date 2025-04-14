// Show notification toasts
function showNotification(message, isError = true) {
  // Check if a toast already exists and remove it
  const existingToast = document.getElementById("notificationToast");
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create a new toast
  const toast = document.createElement('div');
  toast.id = "notificationToast";
  toast.className = `notification-toast ${isError ? 'error' : 'success'}`;
  
  toast.innerHTML = `
    <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

// Show/hide loading overlay
function toggleLoading(show = true) {
  let loadingOverlay = document.getElementById('loadingOverlay');
  
  // Create loading overlay if it doesn't exist
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-12 w-12 text-food-yellow mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-700 text-lg">Loading...</p>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  }
  
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Format currency (INR)
function formatCurrency(amount) {
  return '₹' + parseInt(amount).toLocaleString('en-IN');
}

// Format date
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleString('en-IN', options);
}

// Detect if user is on mobile
function isMobileDevice() {
  return (window.innerWidth <= 640) || 
         (navigator.maxTouchPoints > 0 && 
          /Android|iPhone|iPad|iPod/.test(navigator.userAgent));
}

// Add touchstart handling for better mobile responsiveness
document.addEventListener('touchstart', function() {}, {passive: true});
