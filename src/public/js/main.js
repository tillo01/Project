/** @format */

/** Login eyeIcon */
console.log("Basic frontend javascript file");

$(function () {
   $(".get-icon").on("click", function () {
      const inputPassword = $(".member-password");
      const eyeIcon = $(this).find("i");

      const type =
         inputPassword.attr("type") === "password" ? "text" : "password";
      inputPassword.attr("type", type);
      eyeIcon.toggleClass("fa-eye fa-eye-slash");
   });
});

/** Login eyeIcon */
