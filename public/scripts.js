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

  // Menu Filtering
  const categoryButtons = document.querySelectorAll(".menu-category-btn");
  const menuItems = document.querySelectorAll(".menu-item");

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

      // Update active button
      categoryButtons.forEach((btn) => {
        btn.classList.remove("active", "bg-food-yellow", "text-white");
        btn.classList.add(
          "bg-white",
          "border",
          "border-food-yellow",
          "text-food-yellow"
        );
      });

      this.classList.remove(
        "bg-white",
        "border",
        "border-food-yellow",
        "text-food-yellow"
      );
      this.classList.add("active", "bg-food-yellow", "text-white");

      // Filter menu items
      menuItems.forEach((item) => {
        if (
          category === "all" ||
          item.getAttribute("data-category") === category
        ) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

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

      // Handle "Small Size Oliga" minimum quantity
      const isSmallSizeOliga = itemName === "Small Size Oliga";
      let newQuantity = currentQuantity + change;

      if (isSmallSizeOliga) {
        if (isSmallSizeCheck && currentQuantity === 0) {
          newQuantity = 50; // Set default to 50 if user interacts
        } else if (newQuantity < 50 && newQuantity > 0) {
          alert("Minimum order quantity for Small Size Oliga is 50.");
          return;
        }
      } else {
        newQuantity = Math.max(0, Math.min(99, newQuantity)); // Default behavior for other items
      }

      cart[uniqueKey] = newQuantity;

      const quantityDisplay =
        button.parentElement.querySelector(".quantity-display");
      if (quantityDisplay) {
        quantityDisplay.textContent = newQuantity;
      }

      // Ensure the delete button is always functional for Small Size Oliga
      if (isSmallSizeOliga) {
        const decrementButton = button.parentElement.querySelector(
          ".quantity-btn:first-child"
        );
        if (decrementButton) {
          decrementButton.innerHTML = `<i class="fas fa-trash"></i>`;
          decrementButton.classList.add(
            "bg-red-500",
            "hover:bg-red-600",
            "text-white"
          );
          decrementButton.onclick = () => deleteSmallOliga(decrementButton);
        }
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
            controlsContainer.className = "quantity-control";
            controlsContainer.innerHTML = `
              <button
                class="bg-food-yellow text-white px-4 py-2 rounded-full font-medium hover:bg-yellow-500 transition"
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
      const quantityDisplay = document.createElement("div");
      quantityDisplay.className = "quantity-control";

      // Set initial quantity to 50
      cart[uniqueKey] = 50;

      quantityDisplay.innerHTML = `
        <button class="quantity-btn bg-red-500 text-white hover:bg-red-600" onclick="deleteSmallOliga(this)">
          <i class="fas fa-trash"></i>
        </button>
        <span class="quantity-display">50</span>
        <button class="quantity-btn" onclick="changeQuantity(this, 1)">
          +
        </button>
      `;

      // Replace the "Add 50 to Cart" button with quantity controls
      const controlsContainer = menuItem.querySelector("#smallOligaControls");
      if (controlsContainer) {
        controlsContainer.replaceWith(quantityDisplay);
      }

      // Update the cart immediately after adding
      updateCart(menuItem, 50);
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

      // Reset the controls to "Add 50 to Cart" before updating the cart
      const controlsContainer = document.createElement("div");
      controlsContainer.id = "smallOligaControls";
      controlsContainer.className = "quantity-control";
      controlsContainer.innerHTML = `
        <button
          class="bg-food-yellow text-white px-4 py-2 rounded-full font-medium hover:bg-yellow-500 transition"
          onclick="addSmallOligaToCart(this)"
        >
          Add 50 to Cart
        </button>
      `;

      const currentControls = menuItem.querySelector(".quantity-control");
      if (currentControls) {
        currentControls.replaceWith(controlsContainer);
      }

      // Update cart after UI changes to ensure proper synchronization
      updateCart(menuItem, 0);
    } catch (error) {
      console.error("Error deleting Small Size Oliga from menu:", error);
    }
  }

  // Expose functions globally
  window.changeQuantity = changeQuantity;
  window.handleWeightChange = handleWeightChange;
  window.toggleCartModal = toggleCartModal;
  window.placeOrder = placeOrder;
  window.addSmallOligaToCart = addSmallOligaToCart;
  window.deleteCartItem = deleteCartItem;
  window.deleteSmallOliga = deleteSmallOliga;
});
