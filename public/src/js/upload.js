(function (document, window, undefined) {
  'use strict';

  /**
   * Is the user using a modern browser?
   * @type {Boolean}
   */
  var available = window.File && window.FileReader && window.FileList && window.Blob;

  /**
   * Is the user using a mobile browser?
   * @type {Boolean}
   */
  var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  /**
   * Document object
   * @type {Object}
   */
  var d = document;

  /**
   * All the elements we'll use
   * @type {Array}
   */
  var elements = [
    'message', 'drop-me', 'upload-list','upload-custom',
    'custom-upload', 'upload-button', 'custom-upload-name'
  ];

  /**
   * Object holding all the elements (camelCased)
   * @type {Object}
   */
  var el = {};

  // Loop over all the element classes
  elements.forEach(function (name, index) {
    // Match any - in the string
    var re = name.match(/\-([a-z])/g);
    // Only if we found previous matches
    if (re && re.length > 0) {
      // Loop over them (could be multiple)
      for (var i = 0; i < re.length; i++) {
        // Replace ab-cd with abCd
        name = name.replace(
            re[i], // The original match
            re[i].slice(-1).toUpperCase()); // The last char, to uppercase
      }
    }
    // Assign the element to el.[camelCase], get it from the document or assign an empty string
    el[name] = d.querySelector('.' + elements[index] || '');
  });

  /**
   * Uploaded / added files (so we don't upload the same thing multiple times)
   * @type {Array}
   */
  var fileHistory = [];


  /**
   * Event listener for the manual upload, when it changes grab
   * the first file, call parseImageName (so it won't be too long) and
   * set the value to the new filename
   */
  el.customUpload.addEventListener('change', function () {
    var file = el.customUpload.files[0];
    el.customTempName.innerHTML = parseImageName(file.name);
  });

  /**
   * Event listener for the manual upload button, when the user clicks it
   * call uploadFile (to upload the file) and reset the value to no file selected
   * when it's done
   * @TODO: Use a promise
   */
  el.customTempName.addEventListener('click', function () {
    var file = el.customUpload.files[0];
    uploadFile(file);
    el.customTempName.innerHTML = 'No file selected';
  }, false);

  // Enable drag / drop only on modern and non-mobile browsers
  if (available && !mobile) {

    /**
     * Initialise the upload ready status to false
     * @type {Boolean}
     */
    var uploadReady = false;

      message.innerHTML = 'Drop Here';

    /**
     * Event listener for when the user drags the file in the browser, prevent the default
     * open with Chrome action, and make the background green
     */
      el.customUpload.addEventListener('dragover', function (ev) {
        ev.preventDefault();

        this.style.background = '#48d278';
        message.innerHTML = 'Upload!';
      }, false);

    /**
     * Event listener for when the user stops dragging a file over the browser, remove the
     * background and reset the text
     */
      el.customUpload.addEventListener('dragleave', function () {
        this.style.background = '';
        message.innerHTML = 'Drop Here';
      }, false);

    /**
     * @TODO: start from here
     */
      el.customUpload.addEventListener('drop', function (ev) {
        ev.preventDefault();

        this.style.background = '';
        message.innerHTML = 'Drop Here';

        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
          uploadFile(ev.dataTransfer.files[i]);
        }

      }, false);

  } else {
    document.getElementById('message').innerHTML = 'Your browser is not supported';
  }

  function bounceButton () {
    uploadButton.classList.add('animate');
    uploadButton.classList.add('bounce');

    window.setTimeout(function () {
      uploadButton.classList.remove('animate');
      uploadButton.classList.remove('bounce');
    }, 1000);
  }

  function parseBytes (input) {
    var result = 0,
        kbytes = input / 1024;
    if (kbytes >= 0 && kbytes < 1024) {
      result = Math.round(kbytes) + 'kb';
    } else if ( kbytes >= 1024 ) {
      var mbytes = kbytes / 1024;
      result = Math.round(mbytes * 100) / 100 + 'mb';
    }
    return result;
  }

  function parseImageName (name) {
    return name.replace(/([a-zA-Z0-9-\.\s]{9}).+([a-zA-Z0-9-\.\s]{5})\.([a-zA-Z]+)/g, '$1..$2.$3');
  }

  function checkFile (file) {
    if (!file) return false;

    var fileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    var maxSize = 5000000;
    var isValid;

    if (fileTypes.indexOf(file.type) === -1){
      isValid = false;
    } else if ( file.size > maxSize ) {
      isValid = false;
    } else {
      isValid = true;
    }

    return isValid;
  }

  function uploadFile (file) {

    uploadList.style.display = 'block';

    var droppedFile = file;

    if (droppedFile === undefined || fileHistory.indexOf(droppedFile.name + ':' + droppedFile.size) !== -1){
      bounceButton();
      return;
    }

    fileHistory.push(droppedFile.name + ':' + droppedFile.size);

    uploadReady = checkFile(droppedFile);

    var uploadLink = document.createElement('a');
    uploadLink.setAttribute('href', '#');
    uploadLink.setAttribute('target', '_blank');

    var uploadItem = document.createElement('li');
    uploadLink.innerHTML = parseImageName(droppedFile.name) + ' <span>[' + parseBytes(droppedFile.size) + ']</span>';

    if (!uploadReady) {
      uploadItem.className = 'invalid';
    }

    uploadItem.appendChild(uploadLink);
    uploadList.appendChild(uploadItem);

    var data;
    if (uploadReady) {
      var xhrRequest = new XMLHttpRequest();
      data = new FormData();

      xhrRequest.onload = function () {
        if (this.status === 200) {
          uploadLink.className = 'valid';
          uploadLink.setAttribute('href', this.response);
        }
      };

      data.append('file', droppedFile);


      xhrRequest.open('POST', '/upload', true);
      xhrRequest.send(data);
    }
  }

}(document, window));
