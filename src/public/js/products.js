/** @format */

console.log("Products frontend javascript file");

$(function () {
   $(".product-collection").on("change", () => {
      const selectedValue = $(".product-collection").val();
      if (selectedValue === "KIDS") {
         $("#product-volume").show();
         $("#product-collection").hide();
      } else {
         $("#product-collection").show();
         $("#product-volume").hide();
      }
   });

   $("#process-btn").on("click", () => {
      $(".dish-container").slideToggle(500);
      $(".process-btn").css("display", "none");
   });

   $("#cancel-btn").on("click", () => {
      $(".dish-container").slideToggle(100);
      $(".process-btn").css("display", "flex");
   });

   $(".new-product-status").on("change", async function (e) {
      const id = e.target.id;
      const productStatus = $(`#${id}.new-product-status`).val();
      try {
         const response = await axios.post(`/admin/product/update/${id}`, {
            productStatus: productStatus,
         });
         console.log("response", response);
         const result = response.data;
         if (response.data) {
            $(".new-product-status").blur();
         } else alert("Product update failed");
      } catch (err) {
         console.log(err);
         alert("Product update failed");
      }
   });

   $(function () {
      $(".new-product-status").on("change", async function (e) {
         const id = e.target.id;
         const productStatus = $(`#${id}.new-product-status`).val();
         if (productStatus === "DAILYDEALS") {
            axios
               .post(`/admin/product/daily/${id}`, {
                  productStatus: productStatus,
               })
               .then(function (response) {
                  if (response.data) {
                     $(".new-product-status").blur();
                  }
               })
               .catch((err) => {
                  console.log("failed Daily", err);
               });
         }
      });
   });
});

$(function () {
   $(".daily-btn").on("click", async function (e) {
      e.preventDefault();
      const productId = e.target.id;
      console.log("ProductId ID", productId);
      const value = $(this).closest("td").find(".daily-input").val();
      if (value.trim() === "") {
         alert("Please enter valid number");
         return false;
      }

      axios
         .post(`/admin/product/update/${productId}`, {
            expiryDate: value,
         })
         .then(function (response) {
            if (response.data) {
               alert("Confirm To Apply DailyDeals !");
               window.location.replace("/admin/product/all");
            } else {
               alert("Failed to apply DailyDeals");
            }
         })
         .catch(function (err) {
            console.error(err);
            alert("Error applying discount");
         });
   });
});

$(function () {
   $(".sale-btn").on("click", async function (e) {
      e.preventDefault();

      const productId = e.target.id;
      console.log("Product ID:", productId);
      const value = $(this).closest("td").find(".sale-input").val();
      if (value.trim() === "") {
         alert("Please enter valid number");
         return false;
      }

      axios
         .post(`/admin/product/discount/${productId}`, {
            discount: value,
         })
         .then(function (response) {
            if (response.data) {
               alert("Confirm To Apply Discount Price !");
               window.location.replace("/admin/product/all");
            } else {
               alert("Failed to apply discount");
            }
         })
         .catch(function (err) {
            console.error(err);
            alert("Error applying discount");
         });
   });
});

function validateForm() {
   const productName = $(".product-name").val();
   const productPrice = $(".product-price").val();
   const productLeftCount = $(".product-left-count").val();
   const productCollection = $(".product-collection").val();
   const productDesc = $(".product-desc").val();
   const productStatus = $(".product-status").val();

   if (
      productName === "" ||
      productPrice === "" ||
      productLeftCount === "" ||
      productCollection === "" ||
      productDesc === "" ||
      productStatus === ""
   ) {
      alert("Please insert all details !");
      return false;
   } else {
      return true;
   }
}

$("#descArea").on("input", function () {
   const productDesc = $(".product-desc").val();
   const maxWord = 15;
   const letters = productDesc.match(/[a-zA-Z]/g) || [];
   if (letters.length > maxWord) {
      alert("You can`t enter more than 15 letter");
      let alphaOnlyDesc = productDesc.replace(/[^a-zA-Z]/g, "");
      const trimmedAlphaText = alphaOnlyDesc.slice(0, maxChars);
      $(this).val(trimmedAlphaText);
   }
});

// Function to handle file preview
function previewFileHandler(input, order) {
   const imageClassName = input.className;
   console.log("input", input);

   const file = $(`.${imageClassName}`).get(0).files[0];
   const filetype = file["type"];
   const validImageType = ["image/jpeg", "image/jpg", "image/png"];
   if (!validImageType.includes(filetype)) {
      alert("Please insert only jpeg, jpg, and png");
   } else {
      if (file) {
         const reader = new FileReader();
         reader.onload = function () {
            $(`#image-section-${order}`).attr("src", reader.result);
         };
         reader.readAsDataURL(file);
      }
   }
}
