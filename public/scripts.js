document.addEventListener("DOMContentLoaded", function () {
  // Remove scroll top button functionality
  /* 
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  // Show/hide button based on scroll position
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  // Scroll to top when button is clicked
  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  */

  // Menu Filtering with improved mobile handling
  const categoryButtons = document.querySelectorAll(".menu-category-btn");
  const menuItems = document.querySelectorAll(".menu-item");

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 480;

  // If on mobile, center active category button
  if (isMobile) {
    const activeButton = document.querySelector(".menu-category-btn.active");
    if (activeButton) {
      setTimeout(() => {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }, 100);
    }
  }

  // Add no-scrollbar utility
  const style = document.createElement("style");
  style.textContent = `
      .no-scrollbar::-webkit-scrollbar {
          display: none;
      }
      .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
      }
  `;
  document.head.appendChild(style);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      // Scroll the clicked button to center for better mobile UX
      if (isMobile) {
        this.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });

        // Scroll menu into view with a slight delay to feel smoother
        setTimeout(() => {
          document.getElementById("menu-items").scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }, 300);
      }

      // Update active button styling
      categoryButtons.forEach((btn) => {
        // Reset all buttons to inactive state
        btn.classList.remove("active", "bg-food-yellow", "text-white", "border-food-yellow");
        btn.classList.add(
          "bg-gray-100",
          "border", // Ensure border class is present for consistent structure
          "border-gray-300", 
          "text-gray-700"
        );
      });

      // Set the clicked button to active state
      this.classList.remove(
        "bg-gray-100",
        "border-gray-300",
        "text-gray-700"
      );
      this.classList.add(
        "active", 
        "bg-food-yellow", 
        "text-white", 
        "border", // Ensure border class is present
        "border-food-yellow"
      );

      // Add a subtle scale animation for better feedback on mobile
      if (isMobile) {
        this.style.transform = "scale(1.05)";
        setTimeout(() => {
          this.style.transform = "";
        }, 300);
      }

      // Filter menu items with fade animation
      menuItems.forEach((item) => {
        if (
          category === "all" ||
          item.getAttribute("data-category") === category
        ) {
          // First set display to flex/grid to enable animation
          item.style.display = isMobile ? "flex" : "block";
          item.style.opacity = "0";
          
          // Then fade in
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transition = "opacity 0.3s ease";
          }, 50);
        } else {
          item.style.opacity = "0";
          item.style.transition = "opacity 0.3s ease";
          
          // Hide after fade out
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // Add touch events for better mobile scrolling of category buttons
  const categoryScroll = document.querySelector(".menu-category-scroll");
  if (categoryScroll && isMobile) {
    let isDown = false;
    let startX;
    let scrollLeft;

    categoryScroll.addEventListener('touchstart', (e) => {
      isDown = true;
      categoryScroll.classList.add('active');
      startX = e.touches[0].pageX - categoryScroll.offsetLeft;
      scrollLeft = categoryScroll.scrollLeft;
    });

    categoryScroll.addEventListener('touchend', () => {
      isDown = false;
      categoryScroll.classList.remove('active');
    });

    categoryScroll.addEventListener('touchmove', (e) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - categoryScroll.offsetLeft;
      const walk = (x - startX) * 2;
      categoryScroll.scrollLeft = scrollLeft - walk;
    });

    // Hide scroll indicator after user has scrolled
    categoryScroll.addEventListener('scroll', debounce(() => {
      const isScrolled = categoryScroll.scrollLeft > 20;
      if (isScrolled) {
        const indicator = categoryScroll.querySelector('.scroll-indicator');
        if (indicator) {
          indicator.style.opacity = '0';
          setTimeout(() => {
            indicator.remove();
          }, 300);
        }
      }
    }, 200));
  }

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  // Cart functionality
  const cart = {}; // Store quantities for each unique item-weight combination

  function changeQuantity(button, change, isSmallSizeCheck = false) {
    try {
      const menuItem = button.closest(".menu-item");
      if (!menuItem) return;

      const weightSelect = menuItem.querySelector(".pickle-quantity");
      const selectedWeight = weightSelect ? weightSelect.value : "Single";
      const itemName = menuItem.querySelector("h3")?.textContent.trim();
      if (!itemName) return;

      const uniqueKey = `${itemName}-${selectedWeight}`;
      const currentQuantity = cart[uniqueKey] || 0;
      const isSmallSizeOliga = itemName === "Small Size Oliga";
      
      let newQuantity = currentQuantity + change;

      // Small Size Oliga specific logic
      if (isSmallSizeOliga) {
        // Prevent going below 50 when decrementing
        if (newQuantity < 50) {
           // If user tries to decrement from 50, trigger delete instead
           if (currentQuantity === 50 && change === -1) {
             deleteSmallOliga(button); // Call delete function directly
             return; // Stop further execution in this case
           }
           // Otherwise (e.g., trying to add negative value initially), show alert
           alert("Minimum order quantity for Small Size Oliga is 50.");
           return; // Prevent change
        }
        // Limit max quantity
        newQuantity = Math.min(99, newQuantity); 
      } else {
        // Default behavior for other items
        newQuantity = Math.max(0, Math.min(99, newQuantity)); 
      }

      cart[uniqueKey] = newQuantity;

      const quantityDisplay =
        button.parentElement.querySelector(".quantity-display");
      if (quantityDisplay) {
        quantityDisplay.textContent = newQuantity;
      }

      // Update Small Size Oliga button state AFTER quantity update
      if (isSmallSizeOliga) {
        const decrementButton = button.parentElement.querySelector(
          ".quantity-btn:first-child"
        );
        if (decrementButton) {
          if (newQuantity === 50) {
            // Set to Delete button
            decrementButton.innerHTML = `<i class="fas fa-trash"></i>`;
            decrementButton.classList.add("bg-red-500", "hover:bg-red-600", "text-white");
            decrementButton.classList.remove("bg-food-yellow", "hover:bg-yellow-500"); // Ensure default style removed
            decrementButton.onclick = () => deleteSmallOliga(decrementButton);
          } else { 
            // Set to Decrement (-) button
            decrementButton.innerHTML = `-`;
            decrementButton.classList.remove("bg-red-500", "hover:bg-red-600");
            decrementButton.classList.add("bg-food-yellow", "hover:bg-yellow-500", "text-white"); // Ensure default style added
            // Pass true for isSmallSizeCheck flag when setting decrement action
            decrementButton.onclick = () => changeQuantity(decrementButton, -1, true); 
          }
        }
      }

      // Add haptic feedback for mobile devices if available
      if ('vibrate' in navigator && isMobile) { // Only vibrate on mobile
        navigator.vibrate(40);
      }

      updateCart(menuItem, newQuantity);
    } catch (error) {
      console.error("Error changing quantity:", error);
    }
  }

  function handleWeightChange(selectElement) {
    try {
      const menuItem = selectElement.closest(".menu-item");
      if (!menuItem) return;

      const selectedWeight = selectElement.value;
      const itemName = menuItem.querySelector("h3")?.textContent.trim();
      if (!itemName) return;

      const uniqueKey = `${itemName}-${selectedWeight}`;
      const storedQuantity = cart[uniqueKey] || 0;

      const quantityDisplay = menuItem.querySelector(".quantity-display");
      if (quantityDisplay) {
        quantityDisplay.textContent = storedQuantity;
      }
    } catch (error) {
      console.error("Error handling weight change:", error);
    }
  }

  function updateCart(menuItem, quantity) {
    try {
      const cartItems = document.getElementById("cartItems");
      if (!cartItems) return;

      const itemName = menuItem.querySelector("h3")?.textContent.trim();
      if (!itemName) return;

      const weightSelect = menuItem.querySelector(".pickle-quantity");
      const selectedWeight = weightSelect ? weightSelect.value : "Single";
      const uniqueKey = `${itemName}-${selectedWeight}`;

      // Get price directly from HTML
      let basePrice;
      if (weightSelect) {
        // For items with weight selection (pickles)
        const selectedOption = weightSelect.options[weightSelect.selectedIndex];
        if (selectedOption) {
          const priceMatch = selectedOption.textContent.match(/₹(\d+)/);
          basePrice = priceMatch ? parseInt(priceMatch[1]) : 0;
        } else {
          basePrice = 0;
        }
      } else {
        // For regular items
        const priceText =
          menuItem.querySelector(".text-food-yellow")?.textContent;

        // Handle "Each ₹X" format for Small Size Oliga
        if (priceText && priceText.includes("Each")) {
          basePrice = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;
        } else {
          basePrice = parseInt(priceText?.replace(/[^0-9]/g, "")) || 0;
        }
      }

      const totalPrice = basePrice * quantity;

      let cartItem = Array.from(cartItems.children).find(
        (item) => item.dataset.key === uniqueKey
      );

      if (quantity <= 0) {
        if (cartItem) {
          cartItem.remove();
          delete cart[uniqueKey];
        }
        syncQuantityToMainPage(uniqueKey, 0); // Sync menu with cart
      } else {
        if (!cartItem) {
          cartItem = document.createElement("div");
          cartItem.dataset.key = uniqueKey;
          cartItem.dataset.name = itemName;
          cartItem.dataset.weight = selectedWeight;
          cartItem.dataset.basePrice = basePrice;
          cartItem.dataset.quantity = quantity;
          cartItem.className =
            "grid grid-cols-[2fr_0.7fr_0.8fr_0.3fr] items-center border-b pb-2";
        } else {
          // Update existing item data
          cartItem.dataset.basePrice = basePrice;
          cartItem.dataset.quantity = quantity;
        }

        cartItem.innerHTML = `
          <span class="font-semibold text-sm sm:text-base pr-1">${itemName}${
          selectedWeight !== "Single" ? ` (${selectedWeight})` : ""
        }</span>
          <span class="text-center font-semibold text-sm sm:text-base">${quantity}x</span>
          <span class="text-right font-semibold text-sm sm:text-base">₹${totalPrice}</span>
          <button
            class="text-red-500 hover:text-red-700 font-medium flex justify-end"
            onclick="deleteCartItem('${uniqueKey}')"
          >
            <i class="fas fa-trash text-sm sm:text-base"></i>
          </button>
        `;

        if (!cartItem.parentElement) {
          cartItems.appendChild(cartItem);
        }
      }

      updateTotalPrice();
      updateCartQuantityBadge();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }

  function deleteCartItem(uniqueKey) {
    try {
      const cartItems = document.getElementById("cartItems");
      const cartItem = Array.from(cartItems.children).find(
        (item) => item.dataset.key === uniqueKey
      );

      if (cartItem) {
        cartItem.remove();
        delete cart[uniqueKey];

        // Always call syncQuantityToMainPage when an item is deleted
        syncQuantityToMainPage(uniqueKey, 0);
      }

      updateTotalPrice();
      updateCartQuantityBadge();
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  }

  function syncQuantityToMainPage(uniqueKey, quantity) {
    try {
      const menuItems = document.querySelectorAll(".menu-item");

      menuItems.forEach((menuItem) => {
        const name = menuItem.querySelector("h3")?.textContent.trim();
        const weightSelect = menuItem.querySelector(".pickle-quantity");
        const weight = weightSelect ? weightSelect.value : "Single";
        const thisItemKey = `${name}-${weight}`;

        if (thisItemKey === uniqueKey) {
          const quantityDisplay = menuItem.querySelector(".quantity-display");
          if (quantityDisplay) {
            quantityDisplay.textContent = quantity;

            // Also update the weight select if it exists
            if (weightSelect) {
              handleWeightChange(weightSelect);
            }
          }

          // Reset controls for Small Size Oliga
          if (name === "Small Size Oliga" && quantity === 0) {
            const controlsContainer = document.createElement("div");
            controlsContainer.id = "smallOligaControls";
            controlsContainer.className = "quantity-control mt-2"; 
            controlsContainer.innerHTML = `
              <button
                class="bg-food-yellow text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base lg:hover:bg-yellow-500 transition active:bg-yellow-600"
                onclick="addSmallOligaToCart(this)"
              >
                Add 50 to Cart
              </button>
            `;

            const currentControls = menuItem.querySelector(".quantity-control");
            if (currentControls) {
              currentControls.replaceWith(controlsContainer);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error syncing quantity:", error);
    }
  }

  function updateCartQuantityBadge() {
    try {
      const cartQuantityBadge = document.getElementById("cartQuantityBadge");
      if (!cartQuantityBadge) return;

      const totalQuantity = Object.values(cart).reduce(
        (sum, quantity) => sum + quantity,
        0
      );

      if (totalQuantity > 0) {
        cartQuantityBadge.textContent = totalQuantity;
        cartQuantityBadge.classList.remove("hidden");
      } else {
        cartQuantityBadge.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error updating cart badge:", error);
    }
  }

  function updateTotalPrice() {
    try {
      const cartItems = document.getElementById("cartItems");
      const totalPriceElement = document.getElementById("totalPrice");
      if (!cartItems || !totalPriceElement) return;

      let total = 0;

      Array.from(cartItems.children).forEach((item) => {
        const basePrice = parseInt(item.dataset.basePrice) || 0;
        const quantity = parseInt(item.dataset.quantity) || 0;
        total += basePrice * quantity;
      });

      totalPriceElement.textContent = `Total: ₹${total}`;
    } catch (error) {
      console.error("Error updating total price:", error);
    }
  }

  function toggleCartModal() {
    try {
      const cartModal = document.getElementById("cartModal");
      const mainContent = document.getElementById("mainContent");
      const body = document.body;

      if (cartModal && mainContent) {
        cartModal.classList.toggle("hidden");
        mainContent.classList.toggle("active");
        body.classList.toggle("modal-open"); // Add this class toggle

        // Store scroll position when opening modal
        if (!cartModal.classList.contains("hidden")) {
          body.style.top = `-${window.scrollY}px`;
        } else {
          // Restore scroll position when closing
          const scrollY = parseInt(document.body.style.top || "0");
          body.style.top = "";
          window.scrollTo(0, Math.abs(scrollY));
        }
      }
    } catch (error) {
      console.error("Error toggling cart modal:", error);
    }
  }

  function placeOrder() {
    try {
      const cartItems = document.getElementById("cartItems");
      if (!cartItems?.children.length) {
        alert("Your cart is empty. Please add items to place an order.");
        return;
      }

      // Store cart items in localStorage
      const cartStorage = {};
      const priceStorage = {};

      Array.from(cartItems.children).forEach((item) => {
        const name = item.dataset.name;
        const weight = item.dataset.weight;
        const quantity = parseInt(item.dataset.quantity) || 0;
        const basePrice = parseInt(item.dataset.basePrice) || 0;
        const key = `${name}-${weight}`;

        cartStorage[key] = quantity;
        priceStorage[key] = basePrice;
      });

      localStorage.setItem("cart", JSON.stringify(cartStorage));
      localStorage.setItem("prices", JSON.stringify(priceStorage));

      // Redirect to cart page
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Error preparing order:", error);
      alert("There was an error preparing your order. Please try again.");
    }
  }

  function addSmallOligaToCart(button) {
    try {
      const menuItem = button.closest(".menu-item");
      if (!menuItem) return;

      const itemName = menuItem.querySelector("h3")?.textContent.trim();
      if (!itemName) return;

      const uniqueKey = `${itemName}-Single`;
      const controlsContainer = document.createElement("div");
      controlsContainer.className = "quantity-control";

      // Set initial quantity to 50
      const initialQuantity = 50;
      cart[uniqueKey] = initialQuantity;

      // Initial state: Delete button because quantity is 50
      controlsContainer.innerHTML = `
        <button class="quantity-btn bg-red-500 text-white lg:hover:bg-red-600 active:bg-red-700 active:scale-95" onclick="deleteSmallOliga(this)">
          <i class="fas fa-trash"></i>
        </button>
        <span class="quantity-display">${initialQuantity}</span>
        <button class="quantity-btn bg-food-yellow text-white lg:hover:bg-yellow-500 active:bg-yellow-600 active:scale-95" onclick="changeQuantity(this, 1, true)">
          +
        </button>
      `;

      // Replace the "Add 50 to Cart" button with quantity controls
      const addButtonContainer = menuItem.querySelector("#smallOligaControls");
      if (addButtonContainer) {
        addButtonContainer.replaceWith(controlsContainer);
      }

      // Update the cart immediately after adding
      updateCart(menuItem, initialQuantity);
    } catch (error) {
      console.error("Error adding Small Size Oliga to cart:", error);
    }
  }

  function deleteSmallOliga(button) {
    try {
      const menuItem = button.closest(".menu-item");
      if (!menuItem) return;

      const itemName = menuItem.querySelector("h3")?.textContent.trim();
      if (!itemName) return;

      const uniqueKey = `${itemName}-Single`;

      // Remove the item from the cart
      delete cart[uniqueKey];

      // Reset the controls to "Add 50 to Cart" button
      const addButtonContainer = document.createElement("div");
      addButtonContainer.id = "smallOligaControls";
      addButtonContainer.className = "quantity-control mt-2"; // Keep original margin if needed
      addButtonContainer.innerHTML = `
        <button
          class="bg-food-yellow text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base lg:hover:bg-yellow-500 transition active:bg-yellow-600"
          onclick="addSmallOligaToCart(this)"
        >
          Add 50 to Cart
        </button>
      `;

      const currentControls = button.closest(".quantity-control");
      if (currentControls) {
        currentControls.replaceWith(addButtonContainer);
      }

      // Update cart (quantity 0) after UI changes
      updateCart(menuItem, 0);
      updateTotalPrice(); // Ensure total price is updated
      updateCartQuantityBadge(); // Ensure badge is updated
    } catch (error) {
      console.error("Error deleting Small Size Oliga from menu:", error);
    }
  }

  // Mobile menu functionality
  function openMobileMenu() {
    document.getElementById('mobileMenu').classList.add('open');
    document.getElementById('mobileMenuOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Change icon to 'X'
    const menuBtnIcon = document.querySelector('#mobileMenuBtn i');
    if (menuBtnIcon) {
      menuBtnIcon.classList.remove('fa-bars');
      menuBtnIcon.classList.add('fa-times');
    }
  }

  function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('mobileMenuOverlay').classList.remove('open');
    document.body.style.overflow = '';
    // Change icon back to 'bars'
    const menuBtnIcon = document.querySelector('#mobileMenuBtn i');
    if (menuBtnIcon) {
      menuBtnIcon.classList.remove('fa-times');
      menuBtnIcon.classList.add('fa-bars');
    }
  }

  // Handle window resize for responsive adjustments
  window.addEventListener('resize', function() {
    const newIsMobile = window.innerWidth <= 480;
    
    // Only update if mobile status changed
    if (newIsMobile !== isMobile) {
      location.reload();
    }
  });

  // Expose functions globally
  window.changeQuantity = changeQuantity;
  window.handleWeightChange = handleWeightChange;
  window.toggleCartModal = toggleCartModal;
  window.placeOrder = placeOrder;
  window.addSmallOligaToCart = addSmallOligaToCart;
  window.deleteCartItem = deleteCartItem;
  window.deleteSmallOliga = deleteSmallOliga;
  window.openMobileMenu = openMobileMenu;
  window.closeMobileMenu = closeMobileMenu;
});
