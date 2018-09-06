(function () {
  function validEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  function validateHuman(honeypot) {
    if (honeypot) {  //if hidden form filled up
      console.log("Robot Detected!");
      return true;
    } else {
      console.log("Welcome Human!");
    }
  }

  // get all data in form and return object
  function getFormData(form) {
    var elements = form.elements;

    var fields = Object.keys(elements).filter(function (k) {
      return (elements[k].name !== "honeypot");
    }).map(function (k) {
      if (elements[k].name !== undefined) {
        return elements[k].name;
        // special case for Edge's html collection
      } else if (elements[k].length > 0) {
        return elements[k].item(0).name;
      }
    }).filter(function (item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function (name) {
      var element = elements[name];

      // singular form elements just have one value
      formData[name] = element.value;

      // when our element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });

    // add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default

    console.log(formData);
    return formData;
  }

  function handleFormSubmit(event) { // handles form submit without any jquery
    event.preventDefault();            // we are submitting via xhr below
    if (event.target) {
      var form = event.target;
      var data = getFormData(form);        // get the values submitted in the form
    }
    //    OPTION: Remove this comment to enable SPAM prevention, see README.md
    if (validateHuman(data.honeypot)) {  //if form is filled, form will not be submitted
      return false;
    }


    if (data.email && !validEmail(data.email)) {   // if email is not valid show error
      var invalidEmail = form.querySelector(".email-invalid");
      if (invalidEmail) {
        invalidEmail.style.display = "block";
        return false;
      }
    } else {
      disableAllButtons(form);
      var url = form.action;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      // xhr.withCredentials = true;
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function () {
        console.log(xhr.status, xhr.statusText);
        console.log(xhr.responseText);
        var formElements = document.querySelector(".form-wrapper")
        // var chatFormElements = document.querySelector(".messages");
        if (formElements) {
          formElements.style.display = "none"; // hide form
        }
        // if(chatFormElements){
        //   chatFormElements.style.display = "none"; // hide form
        // }
        var thankYouMessage = document.querySelector(".thankyou_message"); 

        var viewport_width = $(window).width();
        if (viewport_width >= 992 && thankYouMessage) {
            thankYouMessage.style.display = "block";
            setTimeout(function () {
              $(".thankyou_message").fadeOut(1500);
            }, 3000);
            document.getElementById("gform").reset();
            setTimeout(function () {
              $(".form-wrapper").fadeIn(1500);
            }, 3000);
        }
        if (viewport_width >= 768 && viewport_width <= 991 && thankYouMessage) {
          thankYouMessage.style.display = "block";
          setTimeout(function () {
            $(".thankyou_message").fadeOut(1500);
          }, 3000);
          document.getElementById("gform").reset();
          setTimeout(function () {
            $(".form-wrapper").fadeIn(1000);
          }, 4500);
      }
      
      if (viewport_width >= 320 && viewport_width <= 767 && thankYouMessage) {
        thankYouMessage.style.display = "block";
        setTimeout(function () {
          $(".thankyou_message").fadeOut(1500);
        }, 3000);
        document.getElementById("gform").reset();
        setTimeout(function () {
          $(".form-wrapper").fadeIn(1000);
        }, 4500);
    }
        return;
      };
      // url encode form data for sending as post data
      var encoded = Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join('&');
      xhr.send(encoded);
    }
  }

  function loaded() {
    console.log("Contact form submission handler loaded successfully.");
    // bind to the submit event of our form
    // var forms = document.querySelectorAll("form.gform");
    // for (var i = 0; i < forms.length; i++) {
    var forms = document.getElementById("gform");
    console.log(forms);
    forms.addEventListener("submit", handleFormSubmit, false);
    // }
  };

  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }
})();