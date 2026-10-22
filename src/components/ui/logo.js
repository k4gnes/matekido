const LOGO_SVG = `
<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
    <g transform="translate(256,296) scale(1.2) translate(-256,-296)"
       stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
        <polygon points="96,256 176,176 176,256" fill="currentColor" />
        <polygon points="96,256 176,256 96,336" fill="currentColor" opacity=".35" />
        <polygon points="96,336 176,256 176,336" fill="currentColor" />
        <polygon points="96,336 176,336 96,416" fill="currentColor" opacity=".78" />
        <polygon points="96,416 176,336 176,416" fill="currentColor" opacity=".35" />
        <polygon points="176,176 336,176 256,256" fill="currentColor" opacity=".35" />
        <polygon points="176,176 256,256 176,256" fill="currentColor" opacity=".78" />
        <polygon points="176,256 256,256 336,256 256,336" fill="currentColor" />
        <polygon points="336,176 336,256 256,256" fill="currentColor" opacity=".6" />
        <polygon points="336,176 416,256 336,256" fill="currentColor" opacity=".6" />
        <polygon points="336,256 416,256 336,336" fill="currentColor" />
        <polygon points="416,256 336,336 416,336" fill="currentColor" opacity=".78" />
        <polygon points="336,336 416,336 336,416" fill="currentColor" opacity=".78" />
        <polygon points="336,416 416,336 416,416" fill="currentColor" opacity=".35" />
    </g>
</svg>`;

export function createLogo() {

    const span = document.createElement("span");
    span.className = "app-logo";
    span.innerHTML = LOGO_SVG;

    return span;

}
