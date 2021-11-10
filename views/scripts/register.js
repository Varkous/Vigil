const username = document.querySelector('#username');
const password = document.querySelector('#password');
const namesInUse = document.querySelectorAll('#namesInUse');
const submit = document.querySelector('#submit');
const reset = document.querySelector('#reset');
const specialChars = ['1', '2','3','4','5','6','7','8','9','0','~', '!', '@', '#', '$','%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', '{', ']', '}', ';', ':', '"', "'", ',', '<', '.', '>', '/', '?', '|'];

/*This function runs, and each time it does it takes our form (with the class "validated") and converts it into an array
and runs a function with it. This function will do an initial check of the "name" input to verify its validity, but primarilythis function checks if the forms (with the REQUIRED attribute) have any input, and if they don't, their validity is false and submission is stopped, else it will add "was-validated" and it will pass*/
(function() {
  console.log (editUser);
    let inputs = [];
  if (editUser && editUser !== 'admin') {
    for (let i in editUser) {
      if (!document.querySelector(`#${i}`) || i.includesAny('background', 'profilePic')) continue;
      else DOM(`#${i}`).value = editUser[i];
    }
  }
  Array.from(DOM('.validated*'), function(form) {
  DOM('form').addEventListener('submit', function(event) {

    userFeedback.innerText = 'Required';
    pwFeedback.innerText = 'Required';
    for (let i of namesInUse) {
      if (username.value === i.innerText){
        userFeedback.innerText = 'Name in use. Get creative.';
        event.preventDefault();
        event.stopPropagation();
      }
    }
    // -----------------------------------------------
    for (let i of password.value) {
      if (i === specialChars.filter(char => char === i).toString()) break;
      else {
        pwFeedback.innerText = 'Password sucks. Write a better one.';
        continue;
      }
      event.preventDefault();
      event.stopPropagation();
    }

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

      form.classList.add('was-validated');
    }, false);
  });
})();
//------------------------------
for (let input of DOM('.form-file-input*')) {
  input.addEventListener('change', function (e) {
    let newText = e.target.value.replace(/\\/g, "/").replace('C:/fakepath/', '');
    DOM(this.parentNode).Find('.file-text').innerText = newText;
    DOM(this).Relatives('sibling<', 'img').Attr({src: URL.createObjectURL(this.files[0])});
  });
}
//------------------------------
DOM('#summary').addEventListener('input', function (e) {
  DOM('#maxchars').innerText = parseInt(DOM(this).Attr('?maxlength')) - this.value.length;
});
//------------------------------
