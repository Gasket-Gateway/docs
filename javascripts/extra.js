document.addEventListener("DOMContentLoaded", function() {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    document.body.appendChild(overlay);

    var imgClone = document.createElement("img");
    imgClone.className = "lightbox-img";
    overlay.appendChild(imgClone);

    var controls = document.createElement("div");
    controls.className = "lightbox-controls";
    overlay.appendChild(controls);

    var btnZoomIn = document.createElement("button");
    btnZoomIn.innerHTML = "+";
    btnZoomIn.className = "lightbox-btn";
    btnZoomIn.title = "Zoom In";
    controls.appendChild(btnZoomIn);

    var btnZoomOut = document.createElement("button");
    btnZoomOut.innerHTML = "−";
    btnZoomOut.className = "lightbox-btn";
    btnZoomOut.title = "Zoom Out";
    controls.appendChild(btnZoomOut);

    var btnClose = document.createElement("button");
    btnClose.innerHTML = "✕";
    btnClose.className = "lightbox-btn lightbox-close";
    btnClose.title = "Close";
    controls.appendChild(btnClose);

    var currentZoom = 1;

    function applyZoom() {
        imgClone.style.transform = "scale(" + currentZoom + ")";
    }

    function resetZoom() {
        currentZoom = 1;
        imgClone.style.transform = "";
    }

    btnZoomIn.addEventListener("click", function(e) {
        e.stopPropagation();
        currentZoom += 0.5;
        applyZoom();
    });

    btnZoomOut.addEventListener("click", function(e) {
        e.stopPropagation();
        if (currentZoom > 0.5) {
            currentZoom -= 0.5;
            applyZoom();
        }
    });

    btnClose.addEventListener("click", function(e) {
        e.stopPropagation();
        closeLightbox();
    });

    overlay.addEventListener("click", function(e) {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        overlay.classList.remove("active");
        setTimeout(resetZoom, 300);
    }

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && overlay.classList.contains("active")) {
            closeLightbox();
        }
    });

    document.querySelectorAll(".md-content img").forEach(function(img) {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", function() {
            imgClone.src = this.src;
            overlay.classList.add("active");
            resetZoom();
        });
    });
});
