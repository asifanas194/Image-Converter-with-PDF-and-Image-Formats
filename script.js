document.getElementById("image-upload").addEventListener("change", handleFile);

let selectedImage = null;
let selectedFormat = "";

function handleFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      selectedImage = e.target.result;
      displayPreview();
    };
    reader.readAsDataURL(file);
  }
}

function displayPreview() {
  const previewContainer = document.getElementById("preview");
  previewContainer.innerHTML = `
    <img src="${selectedImage}" alt="Preview" class="preview-image">
    <select id="format-select" class="dropdown">
      <option value="" disabled selected>Select Format</option>
      <option value="PDF">PDF</option>
      <option value="PNG">PNG</option>
      <option value="JPG">JPG</option>
      <option value="BMP">BMP</option>
      <option value="WEBP">WEBP</option>
      <option value="GIF">GIF</option>
      <option value="VIDEO">VIDEO</option>
    </select>
    <button class="convert-btn" id="convert-btn">Convert</button>
  `;

  document.getElementById("convert-btn").addEventListener("click", convertImage);
}

function convertImage() {
  const formatSelect = document.getElementById("format-select");
  selectedFormat = formatSelect.value;

  if (!selectedFormat) {
    alert("Please select a format.");
    return;
  }

  switch (selectedFormat) {
    case "PDF":
      convertToPDF();
      break;
    case "VIDEO":
      convertToVideo();
      break;
    case "PNG":
    case "JPG":
    case "BMP":
    case "WEBP":
    case "GIF":
      convertToImage(selectedFormat);
      break;
    default:
      alert("Selected format is not supported.");
  }
}

function convertToPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const img = new Image();
  img.onload = function () {
    const width = pdf.internal.pageSize.getWidth();
    const height = (img.height / img.width) * width;
    pdf.addImage(img, "JPEG", 0, 0, width, height);
    pdf.save("converted.pdf");
  };
  img.src = selectedImage;
}

function convertToImage(format) {
  const canvas = document.createElement("canvas");
  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const mimeType = `image/${format.toLowerCase()}`;
    const dataUrl = canvas.toDataURL(mimeType);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `converted.${format.toLowerCase()}`;
    link.click();
  };
  img.src = selectedImage;
}

function convertToVideo() {
  const canvas = document.createElement("canvas");
  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const mediaStream = canvas.captureStream();
    const recorder = new MediaRecorder(mediaStream);
    const chunks = [];

    recorder.ondataavailable = function (event) {
      chunks.push(event.data);
    };

    recorder.onstop = function () {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const previewContainer = document.getElementById("preview");
      previewContainer.innerHTML += `
        <video controls class="preview-video">
          <source src="${url}" type="video/webm">
          Your browser does not support the video tag.
        </video>
        <a href="${url}" download="converted-video.webm" class="convert-btn">Download Video</a>
      `;
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 3000); // 3-second video
  };
  img.src = selectedImage;
}
