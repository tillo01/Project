/** @format */

console.log("Signup frontend javascript file");

$(function () {
   const fileTarget = $(".file-box .upload-hidden");
   let filename;

   fileTarget.on("change", function () {
      if (window.FileReader) {
         const uploadFile = $(this)[0].files[0],
            fileType = uploadFile["type"], // check you have choosen the right variables
            validImageType = ["image/jpeg", "image/jpg", "image/png"];
         if (!validImageType.includes(fileType)) {
            alert("Please insert only jpeg and png");
         } else {
            if (uploadFile) console.log(URL.createObjectURL(uploadFile));
            $(".upload-img-frame")
               .attr("src", URL.createObjectURL(uploadFile))
               .addClass("succes");
         }

         filename = $(this)[0].files[0].name;
         console.log("filename =>>>>>>>", filename);
      }
      $(this).siblings(".upload-name").val(filename);
   });
});

function validateSignupform() {
   const memberNick = $(".member-nick").val(),
      memberPhone = $(".member-phone").val(),
      memberPassword = $(".member-password").val(),
      confirmPassword = $(".confirm-password").val();

   if (
      memberNick === "" ||
      memberPhone === "" ||
      memberPassword === "" ||
      confirmPassword === ""
   ) {
      alert("Please insert all required inputs");
      return false;
   }
   if (memberPassword !== confirmPassword) {
      alert("Password differs, please check !");
      return false;
   }
   const memberImage = $(".member-image").get(0).files[0]
      ? $(".member-image").get(0).files[0]?.name
      : null;
   if (!memberImage) {
      alert("Please restaurant image");
      return false;
   }
}

$(function () {
   $(".fa-eye").on("click", function () {
      const inputPassword = $(".member-password");
      const eyeIcon = $(this).find("i");

      const type =
         inputPassword.attr("type") === "password" ? "text" : "password";
      inputPassword.attr("type", type);
      eyeIcon.toggleClass("fa-eye fa-eye-slash");
   });
});

$(function () {
   $(".fa-eye-slash").on("click", function () {
      const inputPassword = $(".confirm-password");
      const eyeIcon = $(this).find("i");

      const type =
         inputPassword.attr("type") === "password" ? "text" : "password";
      inputPassword.attr("type", type);
      eyeIcon.toggleClass("fa-eye fa-eye-slash");
   });
});
