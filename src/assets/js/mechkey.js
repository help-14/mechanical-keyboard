const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (!isMobile) {
    document.querySelector("#bottom-fixed").hidden = true
}