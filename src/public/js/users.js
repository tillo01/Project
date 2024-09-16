/** @format */

console.log("Users frontend javascript file");

$(function () {
  $(".member-status").on("change", function (e) {
    const id = e.target.id;
    console.log(id);
    const memberStatus = $(`#${id}.member-status`).val();
    console.log("memberStatus", memberStatus);

    // TODo axios updateChosenUser
    axios
      .post("/admin/user/edit", {
        _id: id,
        memberStatus: memberStatus,
      })
      .then((response) => {
        const result = response.data;
        if (result.data) {
          console.log("User updated");
          $(".member-status").blur();
        } else alert("User update failed");
      })
      .catch((err) => {
        console.log(err);
        alert("User update failed !");
      });
  });
});
